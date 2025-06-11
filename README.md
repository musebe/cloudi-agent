
# 🤖 Cloudi-Agent: AI-Powered Image Processing with Next.js, Cloudinary, and Anthropic

> Conversational, prompt-driven image editing in your browser. Powered by Next.js, Cloudinary transformations, and Anthropic's Claude model.

---

## ✨ Overview

**Cloudi-Agent** is an intelligent image transformation chat app built with:

- 🧠 **Anthropic Claude** – Natural, conversational prompt processing
- ☁️ **Cloudinary** – Real-time image transformations and AI tagging
- 🧬 **Convex** – Scalable, reactive backend functions and thread storage
- ⚡ **Next.js 15** – App Router, Server Actions, View Transitions & modern DX

Users upload an image, describe a transformation (like *“remove background and make it square”*), and receive instant, smart visual feedback.

---

## 🖼️ Features

- ✅ Upload or link images
- 💬 Conversational prompt interface (Claude 3.5)
- 🛠️ Image tools via Cloudinary:
  - Resize
  - Auto-enhance
  - Format conversion
  - Background removal
  - Generative fill / recolor / replace
  - Auto-tag with AWS Rekognition
- 🔁 Stores history and image meta with Convex
- 🌐 Full Next.js 15 stack with edge-optimized routes
- 🎛️ Custom UI with `shadcn/ui` and Tailwind

---

## 📸 Demo Prompts

Once an image is uploaded, users can try one-click prompts like:

- 🖼️ Auto-enhance this image
- 🎯 Resize to 1080×1080 square
- 🪄 Remove background cleanly
- 🔄 Convert to WebP format
- 🏷️ Tag and classify this image
- ✨ Generative Fill / Recolor / Replace / Remove / Restore

---

## 🧠 How It Works

### Agent Setup

- The core AI agent is defined in `convex/agent.ts` using:
  - `@convex-dev/agent` to manage stateful threads
  - `@ai-sdk/anthropic` to call Claude models
  - `tool()` definitions to expose Cloudinary transformations

### Tool Execution

Each tool returns a Cloudinary transformation URL or tag list, e.g.:

```ts
resizeImage: tool({
  parameters: z.object({
    publicId: z.string(),
    width: z.number().positive(),
    height: z.number().positive(),
    type: z.literal("resize"),
  }),
  async execute({ publicId, width, height }) {
    return {
      url: `https://res.cloudinary.com/.../c_fill,w_${width},h_${height}/${publicId}`,
      type: "cloudinaryUrl",
    };
  },
});
````

### Frontend Chat

* `Chat.tsx` manages threaded interactions, image uploads, and View Transitions.
* `ChatMessages.tsx` and `ImageMessage.tsx` handle result rendering (with modal previews).
* Claude returns either:

  * Rich formatted content (`toolResults`)
  * Direct transformation URLs (`cloudinaryUrl`)
  * Tag data (`tagList`)

---

## 🔧 Tech Stack

| Tech            | Role                                    |
| --------------- | --------------------------------------- |
| `Next.js 15`    | Fullstack framework (app router)        |
| `Convex`        | Threading, action handling, persistence |
| `Anthropic SDK` | Claude API interaction                  |
| `Cloudinary`    | Media hosting + transformation API      |
| `shadcn/ui`     | Component styling                       |
| `Tailwind CSS`  | Layout and utility styling              |
| `Sonner`        | Toast notifications                     |

---

## ⚙️ Setup Instructions

1. **Clone the repo**

```bash
git clone https://github.com/your-username/cloudi-agent.git
cd cloudi-agent
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Add your `.env`**

```env
# Convex
CONVEX_DEPLOYMENT=dev:your-deployment
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Cloudinary (client)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud
NEXT_PUBLIC_CLOUDINARY_API_KEY=your-key
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=unsigned
NEXT_PUBLIC_CLOUDINARY_FOLDER=ai-agent

# Cloudinary (server)
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...
```

4. **Run the dev server**

```bash
pnpm dev
```

---

## 🔍 Folder Structure

```
.
├── convex/agent.ts              # AI agent setup with Cloudinary tools
├── app/api/analyze/route.ts    # Claude endpoint for analyzing requests
├── app/api/tags/route.ts       # Tag fetching and AWS Rekognition merge
├── src/components/             # UI components
│   ├── Chat.tsx
│   ├── ChatMessages.tsx
│   ├── chat-input.tsx
│   ├── TagPills.tsx
│   ├── image-message.tsx
│   ├── demo-prompts.tsx
├── src/types/chat.ts           # Unified message and tool type definitions
├── src/utils/explanationTemplates.ts  # Claude-generated explanation snippets
```

---

## 🧪 Example Claude Tool Call

Claude may invoke:

```json
{
  "tool_name": "generateFill",
  "parameters": {
    "publicId": "sample-image",
    "prompt": "fill in the missing sky",
    "width": 1080,
    "height": 1080,
    "type": "generateFill"
  }
}
```

→ Agent returns Cloudinary URL with applied `e_gen_fill` transformation.

---

## 📦 Deployment

Deployed on **Vercel** (recommended) or **custom host**. Cloudinary and Convex credentials are injected securely via environment variables.

---

## 🔐 Security

* No image data is stored permanently unless persisted intentionally
* Server-side secrets (Cloudinary + Anthropic) are not exposed to the client
* API input is validated using Zod schemas

---

## 📅 Roadmap

* [ ] 🎨 Custom prompt templates
* [ ] 🗂️ Upload from URL
* [ ] 🧠 Claude fine-tuned model support
* [ ] ✏️ Editable tags & history
* [ ] 🧾 User sessions (auth + storage)

---

## 🧑‍💻 Author

**Eugene Musebe**
💡 Building accessible tools with AI, creative media, and open tech.

---

## 📜 License

MIT License. Use freely. Attribution appreciated!

---

## 💬 Contribute

PRs welcome. Issues encouraged. Ideas? Open a discussion.

---

## 🙌 Credits

* [Cloudinary](https://cloudinary.com/)
* [Anthropic](https://www.anthropic.com/)
* [Convex](https://convex.dev/)
* [Next.js](https://nextjs.org/)
* [shadcn/ui](https://ui.shadcn.dev/)

---

