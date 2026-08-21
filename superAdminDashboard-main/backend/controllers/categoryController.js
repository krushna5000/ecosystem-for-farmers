const pool = require("../config/db");

exports.addCategory = async (req, res) => {
  const { name } = req.body;
  try {
    const result = await pool.query( // ✅ changed from db to pool
      "INSERT INTO crop_categories (name) VALUES ($1) RETURNING *",
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const result = await pool.query( // ✅ changed from db to pool
      "SELECT * FROM crop_categories"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Update a category
exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const result = await pool.query(
      "UPDATE crop_categories SET name = $1 WHERE id = $2 RETURNING *",
      [name, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ message: "Category updated", category: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM crop_categories WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Category not found or already deleted" });
    }

    res.status(200).json({ message: "Category deleted", deleted: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
