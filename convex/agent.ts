// convex/agent.ts
import { anthropic } from "@ai-sdk/anthropic";
import { Agent } from "@convex-dev/agent";
import { tool } from "ai";
import { z } from "zod";
import { components } from "./_generated/api";
import { v } from "convex/values";
import { action } from "./_generated/server";

/* 1. System prompt */
const systemPrompt = `
You are **Cloudi-Agent**, an expert on Cloudinary.
Help users upload, transform and analyse images. 
Use makeCloudinaryUrl when you want to return a ready-to-use URL.
`;

/* 2. Tools */
const tools = {
    makeCloudinaryUrl: tool({
        description:
            "Return a Cloudinary delivery URL for a given publicId + transformation.",
        parameters: z.object({
            publicId: z.string(),
            transformation: z.string(),
            width: z.number().int().positive().optional(),
            height: z.number().int().positive().optional(),
            type: z.literal("cloudinaryUrl"),
        }),
        execute: async (args) => args,        // <-- echo for demo
    }),
};

/* 3. Agent instance */
const cloudiAgent = new Agent(components.agent, {
    chat: anthropic("claude-3-5-sonnet-20240620"),
    instructions: systemPrompt,
    tools,
});

/* 4. Convex action */
export const createAgentAssistantThread = action({
    args: {
        prompt: v.string(),
        threadId: v.optional(v.string()),
    },
    handler: async (ctx, { prompt, threadId }) => {
        const { thread } = threadId
            ? await cloudiAgent.continueThread(ctx, { threadId })
            : await cloudiAgent.createThread(ctx, {});

        // one-call: runs tools + returns text + toolResults
        const { text, toolResults } = await thread.generateText({ prompt });

        return { threadId: thread.threadId, text, toolResults };
    },
});
