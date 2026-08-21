// // const pool = require("../config/db");

// // exports.addStage = async (req, res) => {
// //   const { category_id, stage, recommendation } = req.body;
// //   try {
// //     const result = await pool.query(
// //       "INSERT INTO category_stages (category_id, stage, recommendation) VALUES ($1, $2, $3) RETURNING *",
// //       [category_id, stage, recommendation]
// //     );
// //     res.status(201).json(result.rows[0]);
// //   } catch (err) {
// //     res.status(500).json({ error: err.message });
// //   }
// // };

// // exports.getStagesByCategory = async (req, res) => {
// //   const { categoryId } = req.params;
// //   try {
// //     const result = await pool.query(
// //       "SELECT * FROM category_stages WHERE category_id = $1",
// //       [categoryId]
// //     );
// //     res.json(result.rows);
// //   } catch (err) {
// //     res.status(500).json({ error: err.message });
// //   }
// // };


// const pool = require("../config/db");

// exports.addStage = async (req, res) => {
//   const { category_id, stage, recommendation } = req.body;
//   try {
//     const result = await pool.query(
//       "INSERT INTO category_stages (category_id, stage, recommendation) VALUES ($1, $2, $3) RETURNING *",
//       [category_id, stage, recommendation]
//     );
//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// exports.getStagesByCategory = async (req, res) => {
//   const { categoryId } = req.params;
//   try {
//     const result = await pool.query(
//       "SELECT * FROM category_stages WHERE category_id = $1",
//       [categoryId]
//     );
//     res.json(result.rows);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // ✅ Update stage
// exports.updateStage = async (req, res) => {
//   const { id } = req.params;
//   const { stage, recommendation } = req.body;

//   try {
//     const result = await pool.query(
//       "UPDATE category_stages SET stage = $1, recommendation = $2 WHERE id = $3 RETURNING *",
//       [stage, recommendation, id]
//     );
//     res.json(result.rows[0]);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // ✅ Delete stage
// exports.deleteStage = async (req, res) => {
//   const { id } = req.params;

//   try {
//     await pool.query("DELETE FROM category_stages WHERE id = $1", [id]);
//     res.json({ message: "Stage deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
const pool = require("../config/db");

exports.addStage = async (req, res) => {
  const { category_id, stage, recommendation } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO category_stages (category_id, stage, recommendation) VALUES ($1, $2, $3) RETURNING *",
      [category_id, stage, recommendation]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStagesByCategory = async (req, res) => {
  const { categoryId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM category_stages WHERE category_id = $1",
      [categoryId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateStage = async (req, res) => {
  const { id } = req.params;
  const { stage, recommendation } = req.body;

  try {
    const result = await pool.query(
      "UPDATE category_stages SET stage = $1, recommendation = $2 WHERE id = $3 RETURNING *",
      [stage, recommendation, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Stage not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteStage = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM category_stages WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Stage not found" });
    }
    res.json({ message: "Stage deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
