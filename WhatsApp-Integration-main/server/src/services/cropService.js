import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { analyzeWhatsappCrop } from "../controllers/cropController.js";
import { uploadToS3, generateCropImageKey } from "../config/s3.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function downloadMedia(mediaId, phoneNumber = null) {
    try {
        const mediaRes = await axios.get(
            `https://graph.facebook.com/v21.0/${mediaId}`,
            { headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` } }
        );

        const fileRes = await axios.get(mediaRes.data.url, {
            headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` },
            responseType: "arraybuffer",
        });

        const uploadsDir = path.join(__dirname, "..", "..", "uploads");
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
        const filePath = path.join(uploadsDir, `${mediaId}.jpg`);
        fs.writeFileSync(filePath, fileRes.data);

        // Upload to S3
        let s3Url = null;
        if (phoneNumber) {
            try {
                const s3Key = generateCropImageKey(phoneNumber, mediaId);
                s3Url = await uploadToS3(filePath, s3Key);
                console.log(`[S3] Image uploaded: ${s3Url}`);
            } catch (error) {
                console.error("[S3] Upload failed:", error.message);
            }
        }

        return { localPath: filePath, s3Url };
    } catch (error) {
        console.error(`[DOWNLOAD] ERROR:`, error.message);
        throw error;
    }
}

// Analyze crop image — delegates to cropController
export async function analyzeCropImage(imagePath, language) {
    return await analyzeWhatsappCrop(imagePath, language);
}

/**
 * Get full crop report without truncation
 * Includes all products and complete analysis
 */
export function getFullCropReport(data) {
    return {
        status: "success",
        report: data.report,
        productRecommendations: data.productRecommendations,
        timestamp: new Date().toISOString(),
    };
}

/**
 * Format complete crop report with ALL details for WhatsApp
 * Splits into multiple messages to comply with WhatsApp 4096 char limit
 */
export function formatFullCropReport(data) {
    const report = data.report;
    const messages = [];

    // Message 1: Crop Identification & Diagnosis
    let msg1 = "CROP ANALYSIS REPORT\n\n";

    if (report?.cropIdentification) {
        msg1 += `CROP IDENTIFICATION\n`;
        msg1 += `  Crop Name: ${report.cropIdentification.cropName || "Unknown"}\n`;
        msg1 += `  Growth Stage: ${report.cropIdentification.growthStage || "N/A"}\n`;
        msg1 += `  Confidence: ${report.cropIdentification.confidenceLevel || "N/A"}\n\n`;
    }

    if (report?.visibleSymptoms) {
        msg1 += `VISIBLE SYMPTOMS\n`;
        msg1 += `  Severity: ${report.visibleSymptoms.severity || "N/A"}\n`;
        msg1 += `  Affected Parts: ${report.visibleSymptoms.affectedParts?.join(", ") || "N/A"}\n`;
        if (report.visibleSymptoms.symptoms?.length) {
            msg1 += `  Symptoms:\n`;
            report.visibleSymptoms.symptoms.forEach((s, i) => {
                msg1 += `    ${i + 1}. ${s}\n`;
            });
        }
        msg1 += "\n";
    }

    if (report?.diagnosis?.primaryIssue) {
        const issue = report.diagnosis.primaryIssue;
        msg1 += `PRIMARY DIAGNOSIS\n`;
        msg1 += `  Disease: ${issue.name || "N/A"}\n`;
        msg1 += `  Type: ${issue.type || "N/A"}\n`;
        msg1 += `  Scientific Name: ${issue.scientificName || "N/A"}\n`;
        msg1 += `  Confidence: ${issue.confidence || "N/A"}\n\n`;
    }

    messages.push(msg1);

    // Message 2: Secondary Possibilities & Health Status
    let msg2 = "";
    if (report?.diagnosis?.secondaryPossibilities?.length) {
        msg2 += `SECONDARY POSSIBILITIES\n`;
        report.diagnosis.secondaryPossibilities.forEach((s, i) => {
            msg2 += `  ${i + 1}. ${s.name}\n`;
            msg2 += `     Reason: ${s.reason}\n\n`;
        });
    }

    if (report?.currentHealthStatus) {
        msg2 += `CURRENT HEALTH STATUS\n`;
        msg2 += `  Overall: ${report.currentHealthStatus.overallStatus || "N/A"}\n`;
        if (report.currentHealthStatus.impact) {
            msg2 += `  Impact on Photosynthesis: ${report.currentHealthStatus.impact.photosynthesis || "N/A"}\n`;
            msg2 += `  Impact on Growth: ${report.currentHealthStatus.impact.growth || "N/A"}\n`;
            msg2 += `  Yield Risk: ${report.currentHealthStatus.impact.yieldRisk || "N/A"}\n`;
        }
        msg2 += `\n  Risk if Untreated:\n  "${report.currentHealthStatus.riskIfUntreated || "N/A"}"\n\n`;
    }

    messages.push(msg2);

    // Message 3: Chemical Treatment (previously msg4)
    let msg3 = `CHEMICAL TREATMENT\n\n`;
    if (report?.treatmentPlan?.chemicalTreatment?.length) {
        report.treatmentPlan.chemicalTreatment.forEach((t, i) => {
            msg3 += `Product ${i + 1}: ${t.productName || "N/A"}\n`;
            msg3 += `  Active Ingredient: ${t.activeIngredient || "N/A"}\n`;
            msg3 += `  Dosage: ${t.dosage || "N/A"}\n`;
            msg3 += `  Application: ${t.applicationMethod || "N/A"}\n`;
            msg3 += `  Mode of Action: ${t.modeOfAction || "N/A"}\n`;
            msg3 += `  Pre-Harvest Interval: ${t.preHarvestIntervalDays || "Unknown"} days\n\n`;
            if (t.safetyPrecautions?.length) {
                msg3 += `  Safety Precautions:\n`;
                t.safetyPrecautions.forEach(p => {
                    msg3 += `    - ${p}\n`;
                });
                msg3 += "\n";
            }
        });
    } else {
        msg3 += "No chemical treatments recommended.\n";
    }
    messages.push(msg3);

    // Message 4: Organic Alternatives (previously msg5)
    let msg4 = `ORGANIC ALTERNATIVES\n\n`;
    if (report?.treatmentPlan?.organicAlternatives?.length) {
        report.treatmentPlan.organicAlternatives.forEach((o, i) => {
            msg4 += `${i + 1}. ${o.name}\n`;
            msg4 += `   Usage: ${o.usage}\n\n`;
        });
    } else {
        msg4 += "No organic alternatives available.\n";
    }
    messages.push(msg4);

    // Message 5: Product Recommendations (previously msg8)
    let msg5 = `PRODUCT RECOMMENDATIONS\n\n`;
    if (data.productRecommendations?.products?.length) {
        msg5 += `Found ${data.productRecommendations.products.length} products:\n\n`;
        data.productRecommendations.products.forEach((p, i) => {
            msg5 += `${i + 1}. ${p.product_name || p.name}\n`;
            if (p.price) msg5 += `   Price: ₹${p.price}\n`;
            if (p.description) msg5 += `   ${p.description}\n`;
            msg5 += "\n";
        });
    } else {
        msg5 += data.productRecommendations?.error || "No products available at this time.\n";
    }
    messages.push(msg5);

    return messages;
}

/**
 * Format crop analysis response in help-text style (single text with bold headers)
 * No emojis, no secondary treatments, no products
 * Similar format to helpText in constants.js
 */
export function formatCropAnalysisResponse(data, lang = 'en') {
    const report = data.report;
    const cropName = report?.cropIdentification?.cropName || "Unknown";
    
    // Labels Localization Maps
    const labels = {
        identification: { en: "Crop Identification", hi: "फसल पहचान", mr: "पीक ओळख" },
        cropName: { en: "Crop Name", hi: "फसल का नाम", mr: "पिकाचे नाव" },
        growthStage: { en: "Growth Stage", hi: "वृद्धि की अवस्था", mr: "वाढीची अवस्था" },
        confidence: { en: "Confidence", hi: "आत्मविश्वास", mr: "खात्री" },
        symptoms: { en: "Visible Symptoms", hi: "दृश्य लक्षण", mr: "दृश्य लक्षणे" },
        severity: { en: "Severity", hi: "गंभीरता", mr: "तीव्रता" },
        affectedParts: { en: "Affected Parts", hi: "प्रभावित हिस्से", mr: "प्रभावित भाग" },
        symptomsList: { en: "Symptoms", hi: "लक्षण", mr: "लक्षणे" },
        knowMore: { en: "Click here to know more", hi: "अधिक जानने के लिए यहां क्लिक करें", mr: "अधिक जाणून घेण्यासाठी येथे क्लिक करा" }
    };

    const l = (key) => labels[key][lang] || labels[key].en;

    let msg = `*${l('identification')}*\n`;
    msg += `${l('cropName')}: ${cropName}\n`;
    if (report?.cropIdentification?.growthStage) {
        msg += `${l('growthStage')}: ${report.cropIdentification.growthStage}\n`;
    }
    msg += `${l('confidence')}: ${report.cropIdentification.confidenceLevel || "high"}\n\n`;

    if (report?.visibleSymptoms) {
        msg += `*${l('symptoms')}*\n`;
        msg += `${l('severity')}: ${report.visibleSymptoms.severity || "moderate"}\n`;
        if (report.visibleSymptoms.affectedParts?.length) {
            msg += `${l('affectedParts')}: ${report.visibleSymptoms.affectedParts.join(", ")}\n`;
        }
        if (report.visibleSymptoms.symptoms?.length) {
            msg += `${l('symptomsList')}:\n`;
            report.visibleSymptoms.symptoms.slice(0, 3).forEach((s, i) => {
                msg += `${i + 1}. ${s}\n`;
            });
        }
    }

    return msg;
}

export function formatCropReport(data) {
    const report = data.report;
    let msg = "";

    if (report?.cropIdentification) {
        msg += `Crop: ${report.cropIdentification.cropName || "Unknown"}\n`;
        msg += `Confidence: ${report.cropIdentification.confidenceLevel || "N/A"}\n\n`;
    }

    if (report?.diagnosis?.primaryIssue) {
        const issue = report.diagnosis.primaryIssue;
        msg += `Diagnosis: ${issue.name || "N/A"}\n`;
        msg += `Severity: ${report.visibleSymptoms?.severity || "N/A"}\n`;
        if (report.visibleSymptoms?.symptoms) {
            msg += `Symptoms: ${report.visibleSymptoms.symptoms.slice(0, 2).join(", ")}\n`;
        }
        msg += "\n";
    }

    if (report?.treatmentPlan) {
        if (report.treatmentPlan.chemicalTreatment?.length) {
            msg += `Chemical Treatment:\n`;
            report.treatmentPlan.chemicalTreatment.forEach((t, i) => {
                msg += `  ${i + 1}. ${t.productName || t.activeIngredient || "N/A"} `;
                if (t.dosage) msg += `- ${t.dosage} `;
                msg += "\n";
            });
            msg += "\n";
        }
        if (report.treatmentPlan.organicAlternatives?.length) {
            msg += `Organic Treatment:\n`;
            report.treatmentPlan.organicAlternatives.forEach((t, i) => {
                msg += `  ${i + 1}. ${t.name || t}\n`;
            });
            msg += "\n";
        }
    }

    if (data.productRecommendations?.products?.length) {
        msg += `Recommended Products:\n`;
        data.productRecommendations.products.slice(0, 3).forEach((p, i) => {
            msg += `  ${i + 1}. ${p.product_name || p.name} `;
            if (p.price) msg += `- ₹${p.price} `;
            msg += "\n";
        });
    }

    return msg || "No detailed report available.";
}

