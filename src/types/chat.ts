/* ------------------------------------------------------------------ *
 * Central chat types – v3                                             *
 * ------------------------------------------------------------------ */

export type Role = 'user' | 'assistant';

/* ──────────────── EXPLICIT TOOL VARIANTS ──────────────── */

export interface AnalyzeToolResult {
    type: 'analyze';
    formatted: string;
    tone: string;
    clarity: string;
    grammarIssues: string;
    rewrittenMessage: string;
}

export interface EmailToolResult {
    type: 'email';
    recipient: string;
    subject: string;
    body: string;
}

export interface SocialToolResult {
    type: 'social';
    platform: 'X' | 'LinkedIn' | 'BlueSky';
    message: string;
}

/* ──────────────── CATCH-ALL TOOL VARIANT ────────────────
 *  Cloudy / OpenAI function calls come back as
 *  { type: "tool-result", ... } — add a shape for those   */
export interface GenericToolResult {
    type: 'tool-result';
    toolCallId: string;
    toolName: string;
    args: Record<string, unknown>;
    result: unknown;
}

/* ─────────── CLOUDINARY URL VARIANT ─────────── */

export interface CloudinaryUrlResult {
    type: 'cloudinaryUrl';
    url: string;
}

export type ToolResult =
    | AnalyzeToolResult
    | EmailToolResult
    | SocialToolResult
    | GenericToolResult
    | CloudinaryUrlResult;

/* ──────────────── IMAGE CONTENT ──────────────── */

export interface ImageContent {
    type: 'image';
    publicId: string;
    url: string;
    width: number;
    height: number;
}

/* ──────────────── MESSAGE UNION ──────────────── */

export type Message =
    | {
        role: Role;
        content: string | { toolResults: ToolResult };
    }
    | { role: 'user' | 'assistant'; content: ImageContent };

/* ------------------------------------------------------------------ *
 * TYPE GUARDS                                                         *
 * ------------------------------------------------------------------ */

export const isImageMessage = (
    m: Message,
): m is { role: 'user' | 'assistant'; content: ImageContent } =>
    typeof m.content === 'object' &&
    m.content !== null &&
    'type' in m.content &&
    m.content.type === 'image';
