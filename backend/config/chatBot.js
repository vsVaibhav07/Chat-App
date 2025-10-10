import OpenAI from "openai";
import { tavily } from "@tavily/core";

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

async function webSearch({ query }) {
  console.log("🔍 Searching from web for...");
  const response = await tvly.search(query);
  return response.results.map((r) => r.content).join("\n\n");
}

export default async function getAssistantReply(question, chatHistory = []) {
  const messages = [
    {
      role: "system",
      content: `You are an AI personal assistant. Always be clear, concise, polite, and respectful.
Vaibhav has developed you but forgot to give you any name.
You have access to the following tools:
1. webSearch({query}:{query:string}) // Search the latest information and real-time data on internet.
Current date and time: ${new Date().toUTCString()}
Rules:
- Only provide information when asked.
- If the user sends casual messages, reply normally (like a human) without describing yourself.
- Convert time/date to Indian Standard Time before telling.
- Only tell time/date if the user explicitly asks.
When you need to use a tool, always return it using the format:
<function=webSearch>{"query":"..."}</function>`,
    },
    ...chatHistory,
    { role: "user", content: question },
  ];

  const response = await client.chat.completions.create({
    temperature: 0.2,
    model: "llama-3.3-70b-versatile",
    messages,
    tools: [
      {
        type: "function",
        function: {
          name: "webSearch",
          description: "Search the latest information and real time data on internet",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The search query to perform search on.",
              },
            },
            required: ["query"],
          },
        },
      },
    ],
    tool_choice: "auto",
  });

  const message = response.choices[0].message;
  messages.push(message);

  if (message.tool_calls && message.tool_calls.length > 0) {
    const toolCall = message.tool_calls[0];
    const args = JSON.parse(toolCall.function.arguments);
    console.log("🧩 Tool called:", toolCall.function.name, "with args:", args);

    if (toolCall.function.name === "webSearch") {
      const result = await webSearch(args);
      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        name: toolCall.function.name,
        content: result,
      });

      const followUp = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages,
      });

      const finalMessage = followUp.choices[0].message;
      messages.push(finalMessage);
      return finalMessage.content?.trim() || "No response after tool execution.";
    }
  }

  const content = message.content?.trim() || "";
  if (content.includes("<function=webSearch")) {
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");
    if (start !== -1 && end !== -1) {
      const argsJson = content.slice(start, end + 1);
      try {
        const args = JSON.parse(argsJson);
        console.log("🧩 Fallback tool args:", args);

        const result = await webSearch(args);
        messages.push({
          role: "tool",
          tool_call_id: "manual_1",
          name: "webSearch",
          content: result,
        });

        const followUp = await client.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages,
        });

        const finalMessage = followUp.choices[0].message;
        messages.push(finalMessage);
        return finalMessage.content?.trim() || "No final reply after web search.";
      } catch (e) {
        console.error("❌ Error parsing manual tool args:", e);
      }
    }
  }

  return content || "Sorry, I didn’t catch that.";
}
