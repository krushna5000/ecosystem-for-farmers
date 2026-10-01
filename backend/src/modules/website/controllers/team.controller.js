import crypto from "crypto";
import { asc, eq, inArray } from "drizzle-orm";
import { db } from "../../../db/index.js";
import { teamMembers } from "../../../db/schema/index.js";
import { uploadFile } from "../../../lib/storage.js";
import { snakeKeys, snakeRows } from "../../../lib/rowCase.js";
import { isNonEmptyArray, toBool } from "../utils/helpers.js";

const uploadImage = (file) => uploadFile({ file, folder: "team/images" });

/* ========================= CREATE ========================= */
export const createTeamMember = async (req, res) => {
  try {
    const body = req.body || {};
    const { name, position, thoughts, sub_thoughts, is_reversed_layout } = body;

    if (!name || !position) {
      return res.status(400).json({
        success: false,
        message: "Name and position are required",
      });
    }

    const empId = "EMP" + crypto.randomUUID().slice(0, 6).toUpperCase();

    const image = req.file ? await uploadImage(req.file) : null;

    const [member] = await db
      .insert(teamMembers)
      .values({
        empId,
        name,
        position,
        // SCHEMA-GAP: team_members.image_url is NOT NULL but the old code stored NULL when no image was sent
        imageUrl: image ?? "",
        thoughts: thoughts || null,
        subThoughts: sub_thoughts || null,
        isReversedLayout: toBool(is_reversed_layout),
      })
      .returning();

    res.status(201).json({
      success: true,
      team_member: snakeKeys(member),
    });
  } catch (err) {
    console.error("CREATE TEAM MEMBER ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ========================= READ ALL ========================= */
export const getAllTeamMembers = async (req, res) => {
  try {
    const rows = await db.select().from(teamMembers).orderBy(asc(teamMembers.createdAt));

    res.json({
      success: true,
      members: snakeRows(rows),
    });
  } catch (err) {
    console.error("GET TEAM MEMBERS ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ========================= READ ONE ========================= */
export const getTeamMemberById = async (req, res) => {
  try {
    const [member] = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.empId, req.params.emp_id));

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Team member not found",
      });
    }

    res.json({
      success: true,
      member: snakeKeys(member),
    });
  } catch (err) {
    console.error("GET TEAM MEMBER ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ========================= UPDATE ========================= */
export const updateTeamMember = async (req, res) => {
  try {
    const { emp_id } = req.params;
    const { name, position, thoughts, sub_thoughts, is_reversed_layout } = req.body || {};

    const image = req.file ? await uploadImage(req.file) : null;

    // COALESCE semantics: only provided (non-null) fields are changed.
    // is_reversed_layout is always written (false when omitted), as in the old code.
    const changes = { isReversedLayout: toBool(is_reversed_layout) };
    if (name != null) changes.name = name;
    if (position != null) changes.position = position;
    if (image != null) changes.imageUrl = image;
    if (thoughts != null) changes.thoughts = thoughts;
    if (sub_thoughts != null) changes.subThoughts = sub_thoughts;

    const [member] = await db
      .update(teamMembers)
      .set(changes)
      .where(eq(teamMembers.empId, emp_id))
      .returning();

    res.json({
      success: true,
      team_member: member ? snakeKeys(member) : undefined,
    });
  } catch (err) {
    console.error("UPDATE TEAM MEMBER ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ========================= DELETE ========================= */
export const deleteTeamMember = async (req, res) => {
  try {
    await db.delete(teamMembers).where(eq(teamMembers.empId, req.params.emp_id));

    res.json({
      success: true,
      message: "Team member deleted successfully",
    });
  } catch (err) {
    console.error("DELETE TEAM MEMBER ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const deleteMultipleTeamMembers = async (req, res) => {
  try {
    const { ids } = req.body || {};

    if (!isNonEmptyArray(ids)) {
      return res.status(400).json({
        success: false,
        message: "No IDs provided",
      });
    }

    const deleted = await db
      .delete(teamMembers)
      .where(inArray(teamMembers.empId, ids))
      .returning({ id: teamMembers.empId });

    res.json({
      success: true,
      deletedCount: deleted.length,
    });
  } catch (err) {
    console.error("BULK DELETE ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
