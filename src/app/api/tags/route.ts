// app/api/tags/route.ts
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});

/**
 * GET /api/tags?publicId=<public_id>
 * Fetches an image’s tags and also pulls AWS Rekognition data (if present),
 * then merges them into one unique array.
 */
export async function GET(req: NextRequest) {
    const publicId = req.nextUrl.searchParams.get("publicId");
    if (!publicId) {
        return NextResponse.json(
            { tags: [], raw: null },
            { status: 400 }
        );
    }

    try {
        // Fetch the resource, including any Rekognition categorization info
        const resource = await cloudinary.api.resource(publicId, {
            resource_type: "image",
            with_field: "aws_rek_tagging", // ensures Rekognition data appears under resource.info
        });

        // resource.tags: existing tag array (e.g. [ "ai-agent", "foo", "bar" ])
        const existingTags: string[] = resource.tags || [];

        // Rekognition data (an array of { tag: string, confidence: number } objects)
        const rekData:
            | Array<{ tag: string; confidence: number }>
            | [] =
            resource.info?.categorization?.aws_rek_tagging?.data || [];

        const rekTags = rekData.map((d) => d.tag);

        // Merge them and dedupe
        const merged = Array.from(new Set([...existingTags, ...rekTags]));

        return NextResponse.json({ tags: merged, raw: resource });
    } catch (err: unknown) {
        console.error("[Tags API] error fetching resource:", err);
        return NextResponse.json(
            { tags: [], raw: (err as Error).message },
            { status: 500 }
        );
    }
}
