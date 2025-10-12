import OpenAI from "openai";
import { tavily } from "@tavily/core";

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

async function webSearch({ query }) {
 
  const response = await tvly.search(query);
  return response.results.map((r) => r.content).join("\n\n");
}

export default async function getAssistantReply(question, chatHistory = []) {
  const messages = [
    {
      role: "system",
      content: `You are an AI personal assistant. Always be concise, polite, and context-aware.
      Rules:
        1. Always reply only to the user's last message. You may reference chat history if relevant.
        2. Only provide information when asked. Prefer simple, natural, human-like replies.
        3. Convert time/date to Indian Standard Time if asked.
        4. Use tools only when necessary. When using webSearch, return in this exact format:
          <function=webSearch>{"query":"..."} </function>
        5. Do NOT add trailing commas or extra characters inside JSON.
        6. Always return final answer in text format unless user explicitly asks for other formats.
        7. checks if the first web search returned meaningful content and if not, asks the model to refine the query or try again.
        8. use tool twice if first result is not sufficient to satisfy a human.
`,
    },
    ...chatHistory,
    { role: "user", content: question },
  ];

  const toolsConfig = [
    {
      type: "function",
      function: {
        name: "webSearch",
        description: "Search the latest information and real-time data on internet",
        parameters: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search query" },
          },
          required: ["query"],
        },
      },
    },
  ];

  // Initial LLM call
  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages,
    tools: toolsConfig,
    tool_choice: "auto",
    temperature: 0.2,
  });

  let message = response.choices[0].message;
  messages.push(message);

  // Tool call handling
  if (message.tool_calls && message.tool_calls.length > 0) {
    const toolCall = message.tool_calls[0];
    const args = JSON.parse(toolCall.function.arguments);


    if (toolCall.function.name === "webSearch") {
      let result = await webSearch(args);

      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        name: toolCall.function.name,
        content: result,
      });

      // Follow-up call MUST include toolsConfig
      const followUp = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages,
        tools: toolsConfig,
        tool_choice: "auto",
      });

      const finalMessage = followUp.choices[0].message;
      messages.push(finalMessage);
      return finalMessage.content?.trim() || "Sorry, Its being hard to find any related data with this information. Please explain more about it?.";
    }
  }

  // Fallback parsing for manual <function=webSearch>
  if (message.content?.includes("<function=webSearch")) {
    const start = message.content.indexOf("{");
    const end = message.content.lastIndexOf("}");
    if (start !== -1 && end !== -1) {
      try {
        const argsJson = message.content.slice(start, end + 1);
        const args = JSON.parse(argsJson);

        let result = await webSearch(args);
        messages.push({
          role: "tool",
          tool_call_id: "manual_1",
          name: "webSearch",
          content: result,
        });

        const followUp = await client.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages,
          tools: toolsConfig, // ✅ MUST include toolsConfig
          tool_choice: "auto",
        });

        const finalMessage = followUp.choices[0].message;
        messages.push(finalMessage);
        return finalMessage.content?.trim() || "No final reply after web search.";
      } catch (e) {
        console.error("❌ Error parsing manual tool args:", e);
      }
    }
  }

  return message.content?.trim() || "Sorry, I didn’t catch that.";
}
