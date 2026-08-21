
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const SuperAdminModel = require("../models/superAdminModel");
const { verifyToken } = require("../middleware/authMiddleware");
const { sendEmail } = require("../services/mailServices");
require("dotenv").config();

// Pass io instance to controller for emitting events
module.exports = (io) => {
  const controllers = {};

  // Login Controller
  // controllers.login = async (req, res) => {
  //   const { email, password } = req.body;

  //   try {
  //     const admin = await SuperAdminModel.findByEmail(email);
  //     if (!admin)
  //       return res.status(404).json({ message: "Super Admin not found" });

  //     const isMatch = await bcrypt.compare(password, admin.password);
  //     if (!isMatch)
  //       return res.status(400).json({ message: "Invalid credentials" });

  //     const token = jwt.sign(
  //       { id: admin.id, role: admin.role },
  //       process.env.JWT_SECRET,
  //       { expiresIn: "1h" }
  //     );

  //     res.status(200).json({ message: "Login successful", token });
  //   } catch (error) {
  //     res.status(500).json({ message: "Server error", error });
  //   }
  // };
  controllers.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await SuperAdminModel.findByEmail(email);
    if (!admin)
      return res.status(404).json({ message: "Super Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin.id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Construct a clean user object to send
    const user = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      photo: admin.photo || "", // fallback if photo doesn't exist
      role: admin.role,
    };

    res.status(200).json({ message: "Login successful", token, user });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
  // Logout Controller
  controllers.logout = (req, res) => {
    try {
      res.clearCookie("token");
      res.status(200).json({ message: "Logout successful" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  };

  // Add Role-Based Admin
  controllers.addRoleBasedAdmin = [
    verifyToken,
    async (req, res) => {
      const { name, email, password, permissions, role } = req.body;
      const allowedRoles = ["admin", "vendor", "support", "user"];

      try {
        if (req.user.role !== "super_admin") {
          return res.status(403).json({
            message: "Unauthorized: Only Super Admins can add sub-admins",
          });
        }

        if (!name || !email || !password || !role) {
          return res.status(400).json({ message: "All fields are required" });
        }

        if (!allowedRoles.includes(role)) {
          return res.status(400).json({ message: "Invalid role provided" });
        }

        const existingUser = await pool.query(
          "SELECT * FROM admins WHERE email = $1",
          [email]
        );

        if (existingUser.rows.length > 0) {
          return res
            .status(400)
            .json({ message: "User with this email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await pool.query(
          `INSERT INTO admins (name, email, password, permissions, role) 
           VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role`,
          [name, email, hashedPassword, JSON.stringify(permissions || {}), role]
        );

        await sendEmail(email, password, "Your Admin Account Details");

        // Emit Socket.IO event for new admin
        io.emit("adminAdded", {
          message: `${role} added successfully`,
          user: newUser.rows[0],
        });

        res.status(201).json({
          message: `${role} added successfully`,
          user: newUser.rows[0],
        });
      } catch (error) {
        console.error("Error adding admin:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
      }
    },
  ];

  // Get All Admins
  controllers.getAllAdmins = [
    verifyToken,
    async (req, res) => {
      try {
        if (req.user.role !== "super_admin") {
          return res
            .status(403)
            .json({ message: "Unauthorized: Only Super Admins can view admins" });
        }

        const result = await pool.query(
          "SELECT id, name, email, role, permissions FROM admins"
        );
        const admins = result.rows;

        res.status(200).json({ message: "Admins fetched successfully", admins });
      } catch (error) {
        console.error("Error fetching admins:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
      }
    },
  ];

  // Update Admin
  controllers.updateAdmin = [
    verifyToken,
    async (req, res) => {
      const { id } = req.params;
      const { name, email, permissions, role, password } = req.body;

      try {
        if (req.user.role !== "super_admin") {
          return res.status(403).json({
            message: "Unauthorized: Only Super Admins can update admins",
          });
        }

        const adminExists = await pool.query(
          "SELECT id FROM admins WHERE id = $1",
          [id]
        );

        if (adminExists.rows.length === 0) {
          return res.status(404).json({ message: "Admin not found" });
        }

        let hashedPassword = null;
        if (password) {
          hashedPassword = await bcrypt.hash(password, 10);
        }

        const query = `
          UPDATE admins 
          SET name = $1, email = $2, permissions = $3, role = $4
          ${password ? ", password = $5" : ""}
          , updated_at = NOW()
          WHERE id = ${password ? "$6" : "$5"}
          RETURNING id, name, email, role, permissions`;

        const values = password
          ? [name, email, JSON.stringify(permissions || {}), role, hashedPassword, id]
          : [name, email, JSON.stringify(permissions || {}), role, id];

        const updatedAdmin = await pool.query(query, values);

        if (password) {
          await sendEmail(email, password, "Your Updated Admin Credentials");
        }

        // Emit Socket.IO event for admin update
        io.emit("adminUpdated", {
          message: "Admin updated successfully",
          admin: updatedAdmin.rows[0],
        });

        res.status(200).json({
          message: "Admin updated successfully",
          admin: updatedAdmin.rows[0],
        });
      } catch (error) {
        console.error("Error updating admin:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
      }
    },
  ];

  // Delete Admin
  controllers.deleteAdmin = [
    verifyToken,
    async (req, res) => {
      const { id } = req.params;

      try {
        if (req.user.role !== "super_admin") {
          return res.status(403).json({
            message: "Unauthorized: Only Super Admins can delete admins",
          });
        }

        const adminExists = await pool.query(
          "SELECT id FROM admins WHERE id = $1",
          [id]
        );
        if (adminExists.rows.length === 0) {
          return res.status(404).json({ message: "Admin not found" });
        }

        await pool.query("DELETE FROM admins WHERE id = $1", [id]);

        // Emit Socket.IO event for admin deletion
        io.emit("adminDeleted", {
          message: "Admin deleted successfully",
          adminId: id,
        });

        res.status(200).json({ message: "Admin deleted successfully" });
      } catch (error) {
        console.error("Error deleting admin:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
      }
    },
  ];


  // Get Deactivation Requested Vendors
  controllers.getDeactivationRequestedVendors = [
    verifyToken,
    async (req, res) => {
      try {
        if (req.user.role !== "super_admin") {
          return res.status(403).json({
            message:
              "Unauthorized: Only super admins can view deactivation/reactivation requests",
          });
        }

        const result = await pool.query(
          `SELECT 
             id, 
             name, 
             company_name, 
             contact_number, 
             email, 
             deactivation_status, 
             is_active,
             deactivation_requested_by
           FROM vendors
           WHERE 
             deactivation_status IN ('pending_deactivation', 'pending_activation')
             AND deactivation_requested_by IS NOT NULL`
        );

        const allRequests = result.rows;
        const deactivationRequests = allRequests.filter(
          (vendor) => vendor.deactivation_status === "pending_deactivation"
        );
        const reactivationRequests = allRequests.filter(
          (vendor) => vendor.deactivation_status === "pending_activation"
        );

        res.status(200).json({
          message: "Deactivation and reactivation requests fetched successfully",
          deactivationRequests,
          reactivationRequests,
        });
      } catch (error) {
        console.error("Error fetching vendor requests:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
      }
    },
  ];

  // Assign Permissions
  controllers.assignPermissions = [
    verifyToken,
    async (req, res) => {
      const { adminId, permissions } = req.body;

      try {
        if (req.user.role !== "super_admin") {
          return res.status(403).json({
            message: "Unauthorized: Only Super Admins can assign permissions",
          });
        }

        const result = await pool.query(
          `UPDATE admins SET permissions = $1 WHERE id = $2
           RETURNING id, name, email, role, permissions`,
          [JSON.stringify(permissions), adminId]
        );

        if (result.rowCount === 0) {
          return res.status(404).json({ message: "Admin not found" });
        }

        // Emit Socket.IO event for permissions update
        io.emit("permissionsAssigned", {
          message: "Permissions updated successfully",
          admin: result.rows[0],
        });

        res.status(200).json({ message: "Permissions updated successfully" });
      } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
      }
    },
  ];

  // Approve Vendor Deactivation
  controllers.approveVendorDeactivation = [
    verifyToken,
    async (req, res) => {
      try {
        const vendorId = req.params.id;

        if (req.user.role !== "super_admin") {
          return res.status(403).json({ message: "Unauthorized" });
        }

        const result = await pool.query(
          `UPDATE vendors
           SET deactivation_status = 'deactivated',
               is_active = false,
               updated_at = NOW(),
               deactivation_resolved_by = $2,
               deactivation_resolved_at = NOW()
           WHERE id = $1
           RETURNING *`,
          [vendorId, req.user.id]
        );

        if (result.rowCount === 0) {
          return res.status(404).json({ message: "Vendor not found" });
        }

        // Emit Socket.IO event for vendor deactivation
        io.emit("vendorStatusChanged", {
          message: "Vendor deactivation approved successfully",
          vendor: result.rows[0],
        });

        res.status(200).json({
          message: "Vendor deactivation approved successfully",
          vendor: result.rows[0],
        });
      } catch (error) {
        console.error("Error approving deactivation:", error);
        res
          .status(500)
          .json({ message: "Server error while approving deactivation" });
      }
    },
  ];

  // Reject Vendor Deactivation
  controllers.rejectVendorDeactivation = [
    verifyToken,
    async (req, res) => {
      try {
        const vendorId = req.params.id;

        if (req.user.role !== "super_admin") {
          return res.status(403).json({ message: "Unauthorized" });
        }

        const result = await pool.query(
          `UPDATE vendors
           SET deactivation_status = 'active',
               updated_at = NOW(),
               deactivation_resolved_by = $2,
               deactivation_resolved_at = NOW()
           WHERE id = $1
           RETURNING *`,
          [vendorId, req.user.id]
        );

        if (result.rowCount === 0) {
          return res.status(404).json({ message: "Vendor not found" });
        }

        // Emit Socket.IO event for vendor deactivation rejection
        io.emit("vendorStatusChanged", {
          message: "Vendor deactivation request rejected successfully",
          vendor: result.rows[0],
        });

        res.status(200).json({
          message: "Vendor deactivation request rejected successfully",
          vendor: result.rows[0],
        });
      } catch (error) {
        console.error("Error rejecting deactivation:", error);
        res
          .status(500)
          .json({ message: "Server error while rejecting deactivation" });
      }
    },
  ];

  // Approve Reactivation
  controllers.approveReactivation = [
    verifyToken,
    async (req, res) => {
      const vendorId = req.params.id;

      try {
        if (req.user.role !== "super_admin") {
          return res.status(403).json({ message: "Unauthorized" });
        }

        const result = await pool.query(
          `UPDATE vendors 
           SET is_active = true,
               deactivation_status = 'activated',
               updated_at = NOW(),
               deactivation_resolved_by = $2,
               deactivation_resolved_at = NOW()
           WHERE id = $1 AND deactivation_status = 'pending_activation'
           RETURNING *`,
          [vendorId, req.user.id]
        );

        if (result.rowCount === 0) {
          return res
            .status(404)
            .json({ message: "Vendor not found or no reactivation requested" });
        }

        // Emit Socket.IO event for vendor reactivation
        io.emit("vendorStatusChanged", {
          message: "Vendor reactivated successfully",
          vendor: result.rows[0],
        });

        res.status(200).json({
          message: "Vendor reactivated successfully",
          vendor: result.rows[0],
        });
      } catch (error) {
        console.error("Error approving reactivation:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    },
  ];

  // Reject Reactivation
  controllers.rejectReactivation = [
    verifyToken,
    async (req, res) => {
      const vendorId = req.params.id;

      try {
        if (req.user.role !== "super_admin") {
          return res.status(403).json({ message: "Unauthorized" });
        }

        const result = await pool.query(
          `UPDATE vendors 
           SET deactivation_status = 'deactivated',
               updated_at = NOW(),
               deactivation_resolved_by = $2,
               deactivation_resolved_at = NOW()
           WHERE id = $1 AND deactivation_status = 'pending_activation'
           RETURNING *`,
          [vendorId, req.user.id]
        );

        if (result.rowCount === 0) {
          return res
            .status(404)
            .json({ message: "Vendor not found or no reactivation requested" });
        }

        // Emit Socket.IO event for vendor reactivation rejection
        io.emit("vendorStatusChanged", {
          message: "Reactivation request rejected",
          vendor: result.rows[0],
        });

        res.status(200).json({
          message: "Reactivation request rejected",
          vendor: result.rows[0],
        });
      } catch (error) {
        console.error("Error rejecting reactivation:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    },
  ];

  return controllers;
};