import { and, desc, eq } from "drizzle-orm";
import { db } from "../../../db/connection.js";
import { vendorServiceLocations } from "../../../db/schema/index.js";
import { snakeKeys, snakeRows } from "../../../utils/rowCase.js";
import { now, toBoolean } from "../../../utils/vendor/helpers.js";

// SECURITY NOTE: these handlers deliberately keep the old authorization model — the vendor id comes from the
// request body / URL and ids are not checked against the authenticated vendor (req.vendor.id). See docs/routes/vendor.md.

// Create Service Location
export const createServiceLocation = async (req, res) => {
  try {
    const { vendor_id, state, city, pincode, is_serviceable } = req.body ?? {};

    if (!vendor_id || !state || !city || !pincode) {
      return res.status(400).json({
        success: false,
        message: "Vendor ID, State, City, and Pincode are required",
      });
    }

    const [exists] = await db
      .select({ id: vendorServiceLocations.id })
      .from(vendorServiceLocations)
      .where(
        and(
          eq(vendorServiceLocations.vendorId, vendor_id),
          eq(vendorServiceLocations.state, state),
          eq(vendorServiceLocations.city, city),
          eq(vendorServiceLocations.pincode, pincode),
        ),
      );

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Service location already exists for this vendor",
      });
    }

    const [serviceLocation] = await db
      .insert(vendorServiceLocations)
      .values({
        vendorId: vendor_id,
        state,
        city,
        pincode,
        isServiceable: toBoolean(is_serviceable) ?? true,
      })
      .returning();

    res.status(201).json({
      success: true,
      message: "Service location created successfully",
      serviceLocation: snakeKeys(serviceLocation),
    });
  } catch (error) {
    console.error("Create Service Location Error:", error);
    res.status(500).json({ success: false, message: "Error creating service location" });
  }
};

// Get all locations for vendor
export const getServiceLocations = async (req, res) => {
  try {
    const { vendor_id } = req.params;

    const rows = await db
      .select()
      .from(vendorServiceLocations)
      .where(eq(vendorServiceLocations.vendorId, vendor_id))
      .orderBy(desc(vendorServiceLocations.createdAt));

    res.status(200).json({ success: true, serviceLocations: snakeRows(rows) });
  } catch (error) {
    console.error("Get Service Locations Error:", error);
    res.status(500).json({ success: false, message: "Error fetching service locations" });
  }
};

// Get one location by ID
export const getServiceLocationById = async (req, res) => {
  try {
    const { id } = req.params;

    const [serviceLocation] = await db
      .select()
      .from(vendorServiceLocations)
      .where(eq(vendorServiceLocations.id, id));

    if (!serviceLocation) {
      return res.status(404).json({
        success: false,
        message: "Service location not found",
      });
    }

    res.status(200).json({ success: true, serviceLocation: snakeKeys(serviceLocation) });
  } catch (error) {
    console.error("Get Service Location Error:", error);
    res.status(500).json({ success: false, message: "Error fetching service location" });
  }
};

// Update location
export const updateServiceLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { state, city, pincode, is_serviceable } = req.body ?? {};

    // All four columns are always written (missing -> NULL), exactly like the old UPDATE
    const [serviceLocation] = await db
      .update(vendorServiceLocations)
      .set({
        state: state ?? null,
        city: city ?? null,
        pincode: pincode ?? null,
        isServiceable: toBoolean(is_serviceable) ?? null,
        updatedAt: now(),
      })
      .where(eq(vendorServiceLocations.id, id))
      .returning();

    if (!serviceLocation) {
      return res.status(404).json({
        success: false,
        message: "Service location not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Service location updated successfully",
      serviceLocation: snakeKeys(serviceLocation),
    });
  } catch (error) {
    console.error("Update Service Location Error:", error);
    res.status(500).json({ success: false, message: "Error updating service location" });
  }
};

// Delete location
export const deleteServiceLocation = async (req, res) => {
  try {
    const { id } = req.params;

    const [deleted] = await db
      .delete(vendorServiceLocations)
      .where(eq(vendorServiceLocations.id, id))
      .returning();

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Service location not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Service location deleted successfully",
    });
  } catch (error) {
    console.error("Delete Service Location Error:", error);
    res.status(500).json({ success: false, message: "Error deleting service location" });
  }
};
