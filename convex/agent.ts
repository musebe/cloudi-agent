// convex/agent.ts
"use node";                      // ◀ enables Node runtime for this file

import { anthropic } from "@ai-sdk/anthropic";
import { Agent } from "@convex-dev/agent";
import { tool } from "ai";
import { action } from "./_generated/server";   // ← back to normal import
import { components } from "./_generated/api";
import { v } from "convex/values";
import { z } from "zod";
import cloudinary from "cloudinary";

/* env guard */
["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET", "ANTHROPIC_API_KEY"]
    .forEach(k => { if (!process.env[k]) throw new Error(`Missing env: ${k}`); });

/* Cloudinary admin SDK */
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
    secure: true,
});
const cloud = process.env.CLOUDINARY_CLOUD_NAME!;
const url = (id: string, t: string) =>
    `https://res.cloudinary.com/${cloud}/image/upload/${t}/${id}`;

/* system prompt */
const systemPrompt =
    "You are Cloudi-Agent. Use a tool for any image work; return {url:\"…\"} to show it.";

/* tools (async executes to satisfy Tool<> PromiseLike) */
const tools = {
    resizeImage: tool({
        description: "Resize (c_fill,g_auto).",
        parameters: z.object({ publicId: z.string(), width: z.number().int().positive(), height: z.number().int().positive(), type: z.literal("resize") }),
        async execute({ publicId, width, height }) {
            return { url: url(publicId, `c_fill,g_auto,w_${width},h_${height}`), type: "cloudinaryUrl" };
        },
    }),
    removeBackground: tool({
        description: "Background removal.",
        parameters: z.object({ publicId: z.string(), type: z.literal("removeBackground") }),
        async execute({ publicId }) {
            return { url: url(publicId, "e_background_removal"), type: "cloudinaryUrl" };
        },
    }),
    applyAutoEnhance: tool({
        description: "Auto-enhance.",
        parameters: z.object({ publicId: z.string(), type: z.literal("autoEnhance") }),
        async execute({ publicId }) {
            return { url: url(publicId, "e_improve"), type: "cloudinaryUrl" };
        },
    }),
    changeFormat: tool({
        description: "Convert format.",
        parameters: z.object({ publicId: z.string(), format: z.enum(["webp", "avif", "jpg", "png"]), type: z.literal("changeFormat") }),
        async execute({ publicId, format }) {
            return { url: url(publicId, `f_${format}`), type: "cloudinaryUrl" };
        },
    }),
    generateFill: tool({
        description: "Generative fill.",
        parameters: z.object({ publicId: z.string(), prompt: z.string(), width: z.number().int().positive().optional(), height: z.number().int().positive().optional(), type: z.literal("generateFill") }),
        async execute({ publicId, prompt, width, height }) {
            const parts = ["e_gen_fill", `prompt_${encodeURIComponent(prompt)}`];
            if (width) parts.push(`w_${width}`);
            if (height) parts.push(`h_${height}`);
            return { url: url(publicId, parts.join(",")), type: "cloudinaryUrl" };
        },
    }),
    tagImage: tool({
        description: "Auto-tag.",
        parameters: z.object({ publicId: z.string(), type: z.literal("tagImage") }),
        async execute({ publicId }) {
            const res = await cloudinary.v2.api.update(publicId, { detection: "aws_rek_tagging" });
            return { tags: res.tags ?? [], type: "tagList" };
        },
    }),
    showCapabilities: tool({
        description: "List supported features.",
        parameters: z.object({ type: z.literal("capabilities") }),
        async execute() {
            return { message: "resize · removeBG · autoEnhance · format · genFill · tag" };
        },
    }),
};

/* agent */
const cloudiAgent = new Agent(components.agent, {
    chat: anthropic("claude-3-5-sonnet-20240620"),
    instructions: systemPrompt,
    tools,
});

/* node-runtime action */
export const createAgentAssistantThread = action({
    args: { prompt: v.string(), threadId: v.optional(v.string()) },
    async handler(
        _ctx: any,                                   // explicit type to satisfy TS
        { prompt, threadId }: { prompt: string; threadId?: string },
    ) {
        const { thread } = threadId
            ? await cloudiAgent.continueThread(_ctx, { threadId })
            : await cloudiAgent.createThread(_ctx, {});
        const { text, toolResults } = await thread.generateText({ prompt });
        return {
            threadId: thread.threadId,
            text,
            toolResults: toolResults?.[0]?.result ?? null,
        };
    },
});
