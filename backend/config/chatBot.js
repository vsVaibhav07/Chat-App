import OpenAI from "openai";
import { tavily } from "@tavily/core";

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY })

const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
})

const messages = [{
    role: "system",
    content: `You are an AI personal assistant.Always provide clear,concise and precise ,polite and respectfull.Vaibhav has developed you but he forget to give you any name
            You have access to following tools:
            1. webSearch({query}:{query:string}) //Search the latest information and real time data on internet.
            current date and time: ${new Date().toUTCString()}
            Rules:
            -Give any information only when you are asked. 
            -If you are asked any common message of conversation then response with normal human behaviour without explaining your detail.
            -Change current time and date into Indian standard Time and date before telling.
            -Tell Time or date only when user asked for it explicitly
        `
},
{
    role: "tool",
    tool_call_id: "tool_1",
    name: "webSearch",
    content: "result"

}]

export default async function getAssistantReply(question) {

    messages.push({
        role: 'user',
        content: question
    })

    while (true) {
        const response = await client.chat.completions.create({
            temperature: 0,
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
                                    description: "The search query to perform search on."
                                }
                            },
                            required: ["query"]
                        }
                    }
                }
            ],
            tool_choice: "auto"
        });

        const message = response.choices[0].message;
        messages.push(message);

        const content = message.content ? message.content.trim() : "";


        if (content.includes("<function=webSearch")) {
            const start = content.indexOf("{");
            const end = content.indexOf("}");
            const argsJson = content.slice(start, end + 1);
            const args = JSON.parse(argsJson);

            const result = await webSearch(args);


            messages.push({
                role: "tool",
                tool_call_id: "tool_1",
                name: "webSearch",
                content: result
            });


        } else {
            return content;
        }
    }

}

async function webSearch({ query }) {
    const response = await tvly.search(query);
    console.log('Searching from web...')
    return response.results.map(r => r.content).join("\n\n");
}
