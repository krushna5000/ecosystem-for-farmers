import { createLead, checkExistingLead, getProductCompanyInfo } from "../models/leadModel.js";
import { sendMessage, sendMenu } from "../services/whatsappService.js";
import { getUserIdByPhone } from "../controllers/farmController.js";

/**
 * Handle a "Product Interest" button click from WhatsApp
 * @param {string} from - Farmer's phone number
 * @param {string} selectedId - The button ID (e.g., lead_prod_123)
 * @param {Object} session - User session
 */
export const handleProductInterest = async (from, selectedId, session) => {
    try {
        const productId = selectedId.replace("lead_prod_", "");
        const phoneNumber = from;
        
        // 1. Get User ID if possible
        let userId = null;
        try {
            const whatsappNumber = from.startsWith("91") ? from : `91${from}`;
            const user = await getUserIdByPhone(whatsappNumber);
            userId = user?.id || null;
        } catch (err) {
            console.warn(`[LEAD] Could not find user_id for ${from}, continuing without it.`);
        }

        // 2. Fetch Product Company Info
        let companyId = null;
        let companyName = null;
        try {
            const productInfo = await getProductCompanyInfo(parseInt(productId));
            if (productInfo) {
                companyId = productInfo.company_id;
                companyName = productInfo.company_name || null;
                console.log(`[LEAD] Found company info for product ${productId}: CompanyID=${companyId}`);
            }
        } catch (err) {
            console.warn(`[LEAD] Could not fetch company info for product ${productId}`);
        }

        // 3. Check for duplicate lead (don't spam the DB if they click twice)
        const exists = await checkExistingLead(from, productId);
        if (exists) {
            console.log(`[LEAD] Duplicate lead detected for ${from} on product ${productId}`);
            const msg = session?.language === 'mr' ? "तुम्ही आधीच या उत्पादनात रस दाखवला आहे. आमची टीम लवकरच तुमच्याशी संपर्क साधेल." : 
                        session?.language === 'hi' ? "आपने पहले ही इस उत्पाद में रुचि दिखाई है। हमारी टीम जल्द ही आपसे संपर्क करेगी।" :
                        "You have already shown interest in this product. Our team will contact you soon.";
            await sendMessage(from, msg);
            
            // Redirect to menu even on duplicate
            await new Promise(resolve => setTimeout(resolve, 1500));
            await sendMenu(from, session?.userName || "there", session?.language || "en");
            return;
        }

        // 4. Create Lead
        await createLead({
            userId,
            productId: parseInt(productId),
            phoneNumber,
            source: 'whatsapp',
            companyId,
            companyName
        });

        console.log(`✅ [LEAD] Successfully generated lead for ${from} on product ${productId}`);

        // 4. Send Confirmation
        const confirmationMsg = session?.language === 'mr' ? "तुमचा प्रतिसाद नोंदवला गेला आहे!\nआमची टीम लवकरच तुम्हाला या उत्पादनाबद्दल अधिक माहिती देण्यासाठी संपर्क करेल." : 
                               session?.language === 'hi' ? "आपकी प्रतिक्रिया दर्ज कर ली गई है!\nहमारी टीम जल्द ही इस उत्पाद के बारे में अधिक जानकारी देने के लिए आपसे संपर्क करेगी।" :
                               "Your response has been recorded!\nOur team will contact you soon to provide more information about this product.";
        
        await sendMessage(from, confirmationMsg);

        // 5. Automatically show Main Menu after confirmation (with small delay)
        console.log(`[LEAD] Redirecting ${from} to main menu...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        await sendMenu(from, session?.userName || "there", session?.language || "en");

    } catch (err) {
        console.error("❌ [LEAD HANDLER] Error:", err.message);
        await sendMessage(from, "Something went wrong. Please try again later.");
    }
};
