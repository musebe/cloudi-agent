// convex/agent.ts
"use node"; // ◀ enables Node runtime for this file

import { anthropic } from "@ai-sdk/anthropic";
import { Agent } from "@convex-dev/agent";
import { tool } from "ai";
import { action } from "./_generated/server"; // ← back to normal import
import { components } from "./_generated/api";
import { v } from "convex/values";
import { z } from "zod";
import cloudinary from "cloudinary";
import { ensureTags } from "../src/lib/ensureTags";

/* env guard */
[
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "ANTHROPIC_API_KEY",
].forEach((k) => {
    if (!process.env[k]) throw new Error(`Missing env: ${k}`);
});

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
        parameters: z.object({
            publicId: z.string(),
            width: z.number().int().positive(),
            height: z.number().int().positive(),
            type: z.literal("resize"),
        }),
        async execute({ publicId, width, height }) {
            return {
                url: url(publicId, `c_fill,g_auto,w_${width},h_${height}`),
                type: "cloudinaryUrl",
            };
        },
    }),

    removeBackground: tool({
        description: "Background removal.",
        parameters: z.object({
            publicId: z.string(),
            type: z.literal("removeBackground"),
        }),
        async execute({ publicId }) {
            return {
                url: url(publicId, "e_background_removal"),
                type: "cloudinaryUrl",
            };
        },
    }),

    applyAutoEnhance: tool({
        description: "Auto-enhance.",
        parameters: z.object({
            publicId: z.string(),
            type: z.literal("autoEnhance"),
        }),
        async execute({ publicId }) {
            return {
                url: url(publicId, "e_improve"),
                type: "cloudinaryUrl",
            };
        },
    }),

    changeFormat: tool({
        description: "Convert format.",
        parameters: z.object({
            publicId: z.string(),
            format: z.enum(["webp", "avif", "jpg", "png"]),
            type: z.literal("changeFormat"),
        }),
        async execute({ publicId, format }) {
            return {
                url: url(publicId, `f_${format}`),
                type: "cloudinaryUrl",
            };
        },
    }),

    generateFill: tool({
        description: "Generative fill.",
        parameters: z.object({
            publicId: z.string(),
            prompt: z.string(),
            width: z.number().int().positive().optional(),
            height: z.number().int().positive().optional(),
            type: z.literal("generateFill"),
        }),
        async execute({ publicId, prompt, width, height }) {
            const parts = ["e_gen_fill", `prompt_${encodeURIComponent(prompt)}`];
            if (width) parts.push(`w_${width}`);
            if (height) parts.push(`h_${height}`);
            return {
                url: url(publicId, parts.join(",")),
                type: "cloudinaryUrl",
            };
        },
    }),

    tagImage: tool({
        description: "Auto-tag.",
        parameters: z.object({
            publicId: z.string(),
            type: z.literal("tagImage"),
        }),
        async execute({ publicId }) {
            // 1) Fetch existing tags (if any) and then run Rekognition auto-tagging
            //    ensureTags will return an array of all tags (including new Rekognition tags).
            const allTags = await ensureTags(publicId);
            // 2) Only return up to the first 10 tags
            const firstTen = allTags.slice(0, 10);
            return {
                tags: firstTen,
                type: "tagList",
            };
        },
    }),

    showCapabilities: tool({
        description: "List supported features.",
        parameters: z.object({ type: z.literal("capabilities") }),
        async execute() {
            return {
                message: "resize · removeBG · autoEnhance · format · genFill · tag · genBackgroundReplace · genRecolor · genRemove · genReplace · genRestore",
            };
        },
    }),

    /* 1) Generative Background Replace */
    genBackgroundReplace: tool({
        description: "Generative background replace.",
        parameters: z.object({
            publicId: z.string(),
            prompt: z.string(),
            // Optional seed to control randomness (integer)
            seed: z.number().int().positive().optional(),
            type: z.literal("genBackgroundReplace"),
        }),
        async execute({ publicId, prompt, seed }) {
            const parts = [
                "e_gen_background_replace",
                `prompt_${encodeURIComponent(prompt)}`,
            ];
            if (seed) {
                parts.push(`seed_${seed}`);
            }
            return {
                url: url(publicId, parts.join(",")),
                type: "cloudinaryUrl",
            };
        },
    }),

    /* 2) Generative Recolor */
    genRecolor: tool({
        description: "Generative recolor (“e_gen_recolor”).",
        parameters: z.object({
            publicId: z.string(),
            // A semicolon-separated list of “what to recolor” → “to-color” pairs:
            // e.g. "the jacket on the right;to-color_pink"
            prompt: z.string(),
            type: z.literal("genRecolor"),
        }),
        async execute({ publicId, prompt }) {
            const token = `e_gen_recolor:prompt_${encodeURIComponent(prompt)}`;
            return {
                url: url(publicId, token),
                type: "cloudinaryUrl",
            };
        },
    }),

    /* 3) Generative Remove */
    genRemove: tool({
        description: "Generative remove (“e_gen_remove”).",
        parameters: z.object({
            publicId: z.string(),
            prompt: z.string(), // e.g. “the stick” or “the pole on the left”
            type: z.literal("genRemove"),
        }),
        async execute({ publicId, prompt }) {
            const token = `e_gen_remove:prompt_${encodeURIComponent(prompt)}`;
            return {
                url: url(publicId, token),
                type: "cloudinaryUrl",
            };
        },
    }),

    /* 4) Generative Replace */
    genReplace: tool({
        description: "Generative replace (“e_gen_replace”).",
        parameters: z.object({
            publicId: z.string(),
            from: z.string(), // what to replace (natural‐language)
            to: z.string(), // replacement object description
            preserveGeometry: z.boolean().optional(),
            type: z.literal("genReplace"),
        }),
        async execute({ publicId, from, to, preserveGeometry }) {
            // Base part: replace “from” → “to”
            let token = `e_gen_replace:from_${encodeURIComponent(from)};to_${encodeURIComponent(
                to
            )}`;
            // If user wants to preserve geometry, add that flag
            if (preserveGeometry) {
                token += ";preserve-geometry_true";
            }
            return {
                url: url(publicId, token),
                type: "cloudinaryUrl",
            };
        },
    }),

    /* 5) Generative Restore */
    genRestore: tool({
        description: "Generative restore (remove artifacts/sharpen).",
        parameters: z.object({
            publicId: z.string(),
            type: z.literal("genRestore"),
        }),
        async execute({ publicId }) {
            // “e_gen_restore” alone will attempt to restore the entire image
            return {
                url: url(publicId, "e_gen_restore"),
                type: "cloudinaryUrl",
            };
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
        _ctx: any, // explicit type to satisfy TS
        { prompt, threadId }: { prompt: string; threadId?: string }
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
