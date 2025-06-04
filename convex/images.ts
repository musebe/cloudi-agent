// convex/images.ts
import { mutation } from './_generated/server';
import { v } from 'convex/values';

/** Persist basic Cloudinary meta for later analytics. */
export const saveImageMeta = mutation({
    args: {
        publicId: v.string(),
        url: v.string(),
        width: v.number(),
        height: v.number(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert('images', { ...args, createdAt: Date.now() });
    },
});
