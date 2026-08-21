import fs from "fs";
import { userSessions } from "../config/session.js";
import { STRINGS } from "../config/constants.js";
import { sendMessage, sendMenu, sendImageMessage, markMessageAsRead, sendProductLeadMessage, sendInteractiveCropReport } from "../services/whatsappService.js";
import { downloadMedia, analyzeCropImage, formatCropReport, formatFullCropReport, formatCropAnalysisResponse } from "../services/cropService.js";

function getStrings(from) {
    const session = userSessions.get(from);
    return STRINGS[session?.language || "en"];
}

export async function handleCropAiSelected(from, session) {
    const lang = session?.language || "en";

    // Update session while preserving authenticated, userId, userName, etc
    userSessions.set(from, {
        ...session,
        language: lang,
        step: "waiting_for_image",
        farmData: undefined
    });

    const s = STRINGS[lang] || STRINGS.en;

    // Send the crop AI selected message
    await sendMessage(from, s.cropAiSelected);
}


export async function handleCropImage(from, message, userName) {
    const session = userSessions.get(from);

    if (session?.step !== "waiting_for_image") {
        const s = session?.language ? getStrings(from) : STRINGS.en;
        await sendMessage(from, "🌿 Please select *Crop AI* from the menu first, then send your photo.\n\nType *menu* to open the menu.");
        return;
    }

    const lang = session.language || "en";
    const s = STRINGS[lang] || STRINGS.en;

    // Mark image as read (show blue ticks)
    if (message.id) {
        await markMessageAsRead(message.id);
    }

    await sendMessage(from, s.analyzing, true);

    let mediaData = null;
    try {
        const mediaId = message.image.id;
        console.log(`[USER] ${userName} (${from}) - Sending crop image for analysis`);

        mediaData = await downloadMedia(mediaId, from);

        if (mediaData.s3Url) {
            console.log(`[S3 UPLOAD] Image uploaded successfully: ${mediaData.s3Url}`);
        }

        const result = await analyzeCropImage(mediaData.localPath, lang);

        if (!result || !result.report) {
            throw new Error("AI returned empty analysis");
        }

        // Store S3 URL in result
        if (mediaData.s3Url) {
            result.s3ImageUrl = mediaData.s3Url;
        }

        const analysisResponse = formatCropAnalysisResponse(result, lang);

        if (!analysisResponse || analysisResponse.trim().length === 0) {
            throw new Error("Report formatting failed - no messages generated");
        }

        // Send analysis response as interactive button message
        await sendInteractiveCropReport(from, analysisResponse, lang);
        
        // Wait 1.5s so user can read report before products arrive
        await new Promise(resolve => setTimeout(resolve, 1500));

        let productsSent = false;
        // Send top 2 product recommendations
        if (result.productRecommendations?.success && result.productRecommendations.products?.length > 0) {
            const topProducts = result.productRecommendations.products.slice(0, 2);
            console.log(`[CROP HANDLER] Sending ${topProducts.length} product lead messages to ${from}`);
            
            for (const product of topProducts) {
                console.log(`[CROP HANDLER] Processing product lead for: ${product.name}`);
                
                // Use the new lead generation message type (interactive buttons)
                await sendProductLeadMessage(from, product, lang);
                productsSent = true;
            }
            console.log(`[CROP HANDLER] Product recommendations loop finished`);
        } else {
            console.log(`[CROP HANDLER] No product recommendations to send`);
        }

        // Reset to menu and send main menu
        userSessions.set(from, { ...session, step: "menu" });
        
        // Add a small delay if products were sent to ensure menu comes LAST on WhatsApp UI
        if (productsSent) {
            console.log(`[CROP HANDLER] Waiting 2.5s for products to deliver before menu...`);
            await new Promise(resolve => setTimeout(resolve, 2500));
        }

        await sendMenu(from, session.userName || "there", session.language || "en");
        console.log(`[CROP HANDLER] handleCropImage SUCCESS for ${from}`);

    } catch (err) {
        console.error(`❌ [ERROR] ${err.message}`);

        let errorMsg = s.analysisFailed;

        // Provide specific error messages
        if (err.message.includes("not a plant")) {
            errorMsg = "❌ This doesn't look like a crop/plant image. Please send a clear photo of your crop.";
        } else if (err.message.includes("JSON")) {
            errorMsg = "❌ AI analysis failed to parse response. Please try again.";
        } else if (err.message.includes("timeout")) {
            errorMsg = "⏱️ Analysis took too long. Please try again with a clearer image.";
        } else if (err.message.includes("GEMINI")) {
            errorMsg = "❌ AI service error. Please try again in a moment.";
        }

        await sendMessage(from, errorMsg);

        // Send menu even on error
        userSessions.set(from, { ...session, step: "menu" });
        await sendMenu(from, session.userName || "there", session.language || "en");

    } finally {
        // Clean up local file
        if (mediaData?.localPath) {
            fs.unlink(mediaData.localPath, (err) => {
                if (err) console.error(`Cleanup error: ${err.message}`);
            });
        }
    }
}