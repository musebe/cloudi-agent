// src/utils/explanationTemplates.ts

/**
 * Returns an array of “rich” explanation templates, each of which
 * incorporates the passed‐in bulleted steps.
 *
 * @param bulletedSteps  A single string of bullet‐point lines (e.g. "• `f_avif`\n• `w_1080`")
 */
export function getExplanationTemplates(bulletedSteps: string): string[] {
    return [
        `✨ **Transformation Complete!** 🎉  
  Here's what I applied to your image:  
  ${bulletedSteps}  
  
  Your new image is now optimized and ready to go—enjoy faster loading times! 🚀`,
        `🔄 **Converted Successfully!** ✔️  
  The following operations were performed:  
  ${bulletedSteps}  
  
  👉 You now have a brand‐new AVIF/WebP image that’s lighter and faster on the web!`,
        `🎨 **Image Update Details:**  
  Below are the steps used to achieve the requested change:  
  ${bulletedSteps}  
  
  Your image is now ready with improved compression and quality! 👍`,
        `⚡️ **Quick Overview:**  
  I ran the following Cloudinary transformations:  
  ${bulletedSteps}  
  
  🌐 This means your image is leaner, cleaner, and will load faster in browsers that support AVIF/WebP!`,
    ];
}
  