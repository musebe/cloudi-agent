// src/lib/ensureTags.ts

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});

/**
 * Always invoke the Admin API to run aws_rek_tagging on the given publicId.
 * Return whatever tags Cloudinary produces (or [] if none).
 */
export async function ensureTags(publicId: string) {
    console.log(`[ensureTags] tagging "${publicId}" via Rekognition…`);

    const updateRes = await cloudinary.api.update(publicId, {
        categorization: "aws_rek_tagging",
        auto_tagging: 0.7, // only tags ≥70% confidence
    });

    const resultingTags = updateRes.tags ?? [];
    console.log(`[ensureTags] Rekognition returned ${resultingTags.length} tags:`, resultingTags);
    return resultingTags;
}
