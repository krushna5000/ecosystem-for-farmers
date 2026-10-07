import { eq, desc } from "drizzle-orm";
import { db } from "../../../db/connection.js";
import { companies, companyOtp } from "../../../db/schema/index.js";
import { snakeKeys } from "../../../utils/rowCase.js";
import { generateOtp, dbErrorMessage } from "../../../utils/admin/helpers.js";

/* ============================================================
   1. SEND OTP TO COMPANY
============================================================ */
export const sendOtpToCompany = async (req, res) => {
  try {
    const { company_id, phone } = req.body;

    if (!company_id || !phone) {
      return res.status(400).json({ message: "company_id and phone required" });
    }

    const [company] = await db
      .select({ id: companies.id })
      .from(companies)
      .where(eq(companies.id, company_id));

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 1 * 60 * 1000); // 1 minute

    await db.insert(companyOtp).values({
      companyId: company_id,
      phone,
      otpCode: otp,
      expiresAt,
    });

    res.json({
      success: true,
      message: "OTP sent successfully",
      otp, // remove in production
      expires_at: expiresAt,
    });
  } catch (error) {
    console.error("sendOtpToCompany:", dbErrorMessage(error));
    res.status(500).json({ error: dbErrorMessage(error) });
  }
};

/* ============================================================
   2. VERIFY COMPANY OTP + APPROVE COMPANY
============================================================ */
export const verifyCompanyOtp = async (req, res) => {
  try {
    const { company_id, otp_code } = req.body;

    if (!company_id || !otp_code) {
      return res.status(400).json({ message: "company_id and otp_code required" });
    }

    // latest OTP
    const [otpRecord] = await db
      .select()
      .from(companyOtp)
      .where(eq(companyOtp.companyId, company_id))
      .orderBy(desc(companyOtp.createdAt), desc(companyOtp.id))
      .limit(1);

    if (!otpRecord) {
      return res.status(404).json({ message: "OTP not found" });
    }

    if (new Date() > otpRecord.expiresAt) {
      return res.status(400).json({ message: "OTP expired" });
    }

    if (otpRecord.otpCode !== otp_code) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const [updated] = await db
      .update(companies)
      .set({ isApproved: true, updatedAt: new Date() })
      .where(eq(companies.id, company_id))
      .returning({
        id: companies.id,
        name: companies.name,
        email: companies.email,
        phone: companies.phone,
        gst_no: companies.gstNo,
        is_approved: companies.isApproved,
      });

    res.json({
      success: true,
      message: "OTP verified & company approved successfully",
      company: updated,
    });
  } catch (error) {
    console.error("verifyCompanyOtp:", dbErrorMessage(error));
    res.status(500).json({ error: dbErrorMessage(error) });
  }
};
