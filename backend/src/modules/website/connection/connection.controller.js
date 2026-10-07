import { desc, eq, inArray } from "drizzle-orm";
import { db } from "../../../db/connection.js";
import { connections } from "../../../db/schema/index.js";
import { snakeKeys, snakeRows } from "../../../utils/rowCase.js";
import { isNonEmptyArray } from "../../../utils/website/helpers.js";

export const createConnection = async (req, res) => {
  const { name, email, mobile, query } = req.body || {};

  try {
    const [row] = await db
      .insert(connections)
      .values({ name, email, mobile, query })
      .returning();

    res.status(201).json({
      message: "Connection created successfully",
      connection: snakeKeys(row),
    });
  } catch (err) {
    console.error("Error creating connection:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getConnections = async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(connections)
      .orderBy(desc(connections.connectionId));

    res.json({ connections: snakeRows(rows) });
  } catch (err) {
    console.error("Error fetching connections:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getConnectionById = async (req, res) => {
  const { id } = req.params;

  try {
    const [row] = await db
      .select()
      .from(connections)
      .where(eq(connections.connectionId, id));

    if (!row) {
      return res.status(404).json({ message: "Connection not found" });
    }

    res.json({ connection: snakeKeys(row) });
  } catch (err) {
    console.error("Error fetching connection:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateConnection = async (req, res) => {
  const { id } = req.params;
  const { name, email, mobile, query, status } = req.body || {};

  try {
    const [existing] = await db
      .select()
      .from(connections)
      .where(eq(connections.connectionId, id));

    if (!existing) {
      return res.status(404).json({ message: "Connection not found" });
    }

    const updatedConnection = {
      name: name ?? existing.name,
      email: email ?? existing.email,
      mobile: mobile ?? existing.mobile,
      query: query ?? existing.query,
      status: status ?? existing.status,
    };

    await db
      .update(connections)
      .set(updatedConnection)
      .where(eq(connections.connectionId, id));

    res.json({
      message: "Connection updated successfully",
      connection: updatedConnection,
    });
  } catch (err) {
    console.error("Error updating connection:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteConnection = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await db
      .delete(connections)
      .where(eq(connections.connectionId, id))
      .returning({ id: connections.connectionId });

    if (deleted.length === 0) {
      return res.status(404).json({ message: "Connection not found" });
    }

    res.json({ message: "Connection deleted successfully" });
  } catch (err) {
    console.error("Error deleting connection:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteMultipleConnections = async (req, res) => {
  try {
    const { ids } = req.body || {};

    if (!isNonEmptyArray(ids)) {
      return res.status(400).json({
        success: false,
        message: "No Connection IDs provided",
      });
    }

    const deleted = await db
      .delete(connections)
      .where(inArray(connections.connectionId, ids))
      .returning({ id: connections.connectionId });

    if (deleted.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No connections found for given IDs",
      });
    }

    res.json({
      success: true,
      deletedCount: deleted.length,
      message: "Connections deleted successfully",
    });
  } catch (err) {
    console.error("BULK DELETE CONNECTIONS ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
