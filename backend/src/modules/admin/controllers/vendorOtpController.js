import { eq, desc } from "drizzle-orm";
import { db } from "../../../db/index.js";
import { vendors, vendorOtp } from "../../../db/schema/index.js";
import { generateOtp, dbErrorMessage } from "../utils/helpers.js";

export const sendVendorOtp = async (req, res) => {
  try {
    const { vendor_id, email } = req.body;

    if (!vendor_id || !email) {
      return res.status(400).json({ message: "vendor_id and email are required" });
    }

    const [vendor] = await db
      .select({ id: vendors.id })
      .from(vendors)
      .where(eq(vendors.id, vendor_id));

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 1 * 60 * 1000); // 1 minute

    await db.insert(vendorOtp).values({
      vendorId: vendor_id,
      email,
      otp,
      expiresAt,
    });

    res.json({
      success: true,
      message: "OTP sent successfully",
      otp, // REMOVE in production
      expires_at: expiresAt,
    });
  } catch (error) {
    console.error("sendVendorOtp:", dbErrorMessage(error));
    res.status(500).json({ error: dbErrorMessage(error) });
  }
};

export const verifyVendorOtp = async (req, res) => {
  try {
    const { vendor_id, otp } = req.body;

    if (!vendor_id || !otp) {
      return res.status(400).json({ message: "vendor_id and otp are required" });
    }

    // latest OTP
    const [otpRecord] = await db
      .select()
      .from(vendorOtp)
      .where(eq(vendorOtp.vendorId, vendor_id))
      .orderBy(desc(vendorOtp.createdAt), desc(vendorOtp.id))
      .limit(1);

    if (!otpRecord) {
      return res.status(404).json({ message: "OTP not found" });
    }

    if (new Date() > otpRecord.expiresAt) {
      return res.status(400).json({ message: "OTP expired" });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const [updated] = await db
      .update(vendors)
      .set({ isApprove: true, updatedAt: new Date() })
      .where(eq(vendors.id, vendor_id))
      .returning({
        id: vendors.id,
        name: vendors.name,
        email: vendors.email,
        phone: vendors.phone,
        is_approve: vendors.isApprove,
      });

    res.json({
      success: true,
      message: "OTP verified & vendor approved successfully",
      vendor: updated,
    });
  } catch (error) {
    console.error("verifyVendorOtp:", dbErrorMessage(error));
    res.status(500).json({ error: dbErrorMessage(error) });
  }
};
