/* ────────────────────────────────────────────────────────────────
   src/app/api/analyze/route.ts   –   POST /api/analyze
   Sends a prompt to Claude-3, letting it call one tool:
   “makeCloudinaryUrl”.  Returns Claude’s structured content.
───────────────────────────────────────────────────────────────── */

import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

/* ───────────── types for the request body ───────────── */
type RequestData = { message: string };

/* ───────────── Anthropic client (singleton) ─────────── */
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});

/* ───────────── tool definition (literal-typed) ───────── */
const tools = [
    {
        name: "makeCloudinaryUrl",
        description:
            "Return a Cloudinary delivery URL for a given publicId + transformation.",
        input_schema: {
            type: "object" as const,
            properties: {
                publicId: {
                    type: "string" as const,
                    description:
                        "Cloudinary public ID, e.g. sample or folder/img_123",
                },
                transformation: {
                    type: "string" as const,
                    description:
                        "Transformation string, e.g. 'c_fill,w_800,h_600' or 'e_background_removal'",
                },
                width: {
                    type: "integer" as const,
                    description: "Optional width for the generated image",
                },
                height: {
                    type: "integer" as const,
                    description: "Optional height for the generated image",
                },
            },
            required: ["publicId", "transformation"],
        },
    },
]; //  ← mutable array ➜ matches ToolUnion[]

/* ───────────── system prompt ───────────── */
const systemPrompt = `
You are **Cloudi-Agent**, an expert on Cloudinary.
Help users upload images, build transformation URLs, remove backgrounds,
and create social-ready variants. Call the makeCloudinaryUrl tool
whenever returning a ready-to-use image URL would help.
`;

export async function POST(req: Request) {
    try {
        /* 1 — validate body */
        const data = (await req.json()) as Partial<RequestData>;
        if (!data.message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }
        if (!process.env.ANTHROPIC_API_KEY) {
            console.error("Missing Anthropic key");
            return NextResponse.json(
                { error: "Server configuration error" },
                { status: 500 }
            );
        }

        /* 2 — call Anthropic */
        const response = await anthropic.messages.create({
            model: "claude-3-7-sonnet-latest",
            max_tokens: 1000,
            temperature: 0.7,
            system: systemPrompt,
            tools,                         // ✅ now satisfies ToolUnion[]
            messages: [
                { role: "user", content: data.message },
            ],
        });

        if (!response.content?.length) {
            return NextResponse.json(
                { error: "Empty response from Claude" },
                { status: 500 }
            );
        }

        /* 3 — echo Claude’s content blocks back to the client */
        return NextResponse.json(response.content);
    } catch (err: unknown) {
        /* 4 — friendly error mapping */
        const msg = err instanceof Error ? err.message.toLowerCase() : "unknown";
        const status =
            /rate limit|quota/.test(msg)
                ? 429
                : /unauthorized|authentication/.test(msg)
                    ? 401
                    : /invalid request/.test(msg)
                        ? 400
                        : 500;

        const friendly =
            status === 429
                ? "Rate limit exceeded"
                : status === 401
                    ? "Authentication error"
                    : status === 400
                        ? "Invalid request"
                        : "Internal server error";

        console.error("Anthropic error:", err);
        return NextResponse.json({ error: friendly, details: msg }, { status });
    }
}
