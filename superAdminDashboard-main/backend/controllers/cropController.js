// const pool = require("../config/db"); // PG Pool
// const { differenceInDays } = require("date-fns");

// // //  Add Crop
// // exports.addCrop = async (req, res) => {
// //   const { crop_name } = req.body;
// //   try {
// //     const result = await pool.query(
// //       "INSERT INTO crops (name) VALUES ($1) RETURNING *",
// //       [crop_name]
// //     );
// //     res.status(201).json({ crop: result.rows[0] });
// //   } catch (error) {
// //     console.error("Error adding crop:", error);
// //     res.status(500).json({ error: "Error adding crop" });
// //   }
// // };

// // //  Associate Crop to Category
// // exports.addCategory = async (req, res) => {
// //   const { crop_id, category_id } = req.body;
// //   try {
// //     const result = await pool.query(
// //       "INSERT INTO crop_categories (crop_id, category_id) VALUES ($1, $2) RETURNING *",
// //       [crop_id, category_id]
// //     );
// //     res.status(201).json({ cropCategory: result.rows[0] });
// //   } catch (err) {
// //     console.error("Add category error:", err);
// //     res.status(500).json({ error: "Failed to associate category" });
// //   }
// // };

// // //  Add Stage
// // exports.addCropStage = async (req, res) => {
// //   const { crop_id, stage, start_day, end_day, recommendation } = req.body;
// //   try {
// //     const result = await pool.query(
// //       `INSERT INTO crop_stages (crop_id, stage, start_day, end_day, recommendation)
// //        VALUES ($1, $2, $3, $4, $5) RETURNING *`,
// //       [crop_id, stage, start_day, end_day, recommendation]
// //     );
// //     res.status(201).json({ cropStage: result.rows[0] });
// //   } catch (error) {
// //     console.error("Add stage error:", error);
// //     res.status(500).json({ error: "Failed to add crop stage" });
// //   }
// // };


// //  Add Crop + Category + Multiple Stages

// exports.addFullCrop = async (req, res) => {
//   const { crop_name, category_id, stages } = req.body;

//   const client = await pool.connect();
//   try {
//     await client.query("BEGIN");

//     // Step 1: Insert or get crop
//     let cropRes = await client.query("SELECT id FROM crops WHERE name = $1", [crop_name]);
//     let crop_id;

//     if (cropRes.rows.length === 0) {
//       const insertCropRes = await client.query(
//         "INSERT INTO crops (name) VALUES ($1) RETURNING id",
//         [crop_name]
//       );
//       crop_id = insertCropRes.rows[0].id;
//     } else {
//       crop_id = cropRes.rows[0].id;
//     }

//     // Step 2: Link category
//     const existingCategoryLink = await client.query(
//       "SELECT * FROM crop_categories WHERE crop_id = $1 AND category_id = $2",
//       [crop_id, category_id]
//     );

//     if (existingCategoryLink.rows.length === 0) {
//       await client.query(
//         "INSERT INTO crop_categories (crop_id, category_id) VALUES ($1, $2)",
//         [crop_id, category_id]
//       );
//     }

//     // Step 3: Insert multiple stages
//     for (let stage of stages) {
//       const { stage: stageName, start_day, end_day, recommendation } = stage;
//       await client.query(
//         `INSERT INTO crop_stages (crop_id, stage, start_day, end_day, recommendation)
//          VALUES ($1, $2, $3, $4, $5)`,
//         [crop_id, stageName, start_day, end_day, recommendation]
//       );
//     }

//     await client.query("COMMIT");
//     res.status(201).json({ message: "Crop, category and stages added successfully", crop_id });

//   } catch (err) {
//     await client.query("ROLLBACK");
//     console.error("Error in full crop insertion:", err);
//     res.status(500).json({ error: "Failed to add crop with stages" });
//   } finally {
//     client.release();
//   }
// };


// // ✅ Track Crop (Sowing Date)
// exports.trackCrop = async (req, res) => {
//   const { user_id, crop_id, sowing_date } = req.body;
//   try {
//     const result = await pool.query(
//       `INSERT INTO crop_tracking (user_id, crop_id, sowing_date)
//        VALUES ($1, $2, $3) RETURNING *`,
//       [user_id, crop_id, sowing_date]
//     );
//     res.status(201).json({ tracking: result.rows[0] });
//   } catch (err) {
//     console.error("Track crop error:", err);
//     res.status(500).json({ error: "Failed to track crop" });
//   }
// };

// // ✅ Get Current Stage Based on Today
// exports.getCurrentStage = async (req, res) => {
//   const { user_id } = req.params;
//   try {
//     const trackingRes = await pool.query(
//       `SELECT crop_id, sowing_date FROM crop_tracking WHERE user_id = $1 ORDER BY id DESC LIMIT 1`,
//       [user_id]
//     );
//     if (trackingRes.rows.length === 0) {
//       return res.status(404).json({ error: "No crop tracking data found" });
//     }

//     const { crop_id, sowing_date } = trackingRes.rows[0];
//     const today = new Date();
//     const sowDate = new Date(sowing_date);
//     const daysSince = differenceInDays(today, sowDate);

//     const stageRes = await pool.query(
//       `SELECT stage, recommendation FROM crop_stages
//        WHERE crop_id = $1 AND start_day <= $2 AND end_day >= $2`,
//       [crop_id, daysSince]
//     );

//     res.status(200).json({
//       crop_id,
//       daysSinceSowing: daysSince,
//       stage: stageRes.rows[0]?.stage || "N/A",
//       recommendation: stageRes.rows[0]?.recommendation || "No recommendation",
//     });
//   } catch (err) {
//     console.error("Get current stage error:", err);
//     res.status(500).json({ error: "Failed to get current stage" });
//   }
// };

// //  Get Stage by Custom Day
// exports.getStageByDay = async (req, res) => {
//   const { crop, day } = req.body;

//   try {
//     const cropRes = await pool.query("SELECT id FROM crops WHERE name = $1", [crop]);
//     if (cropRes.rows.length === 0) {
//       return res.status(404).json({ error: "Crop not found" });
//     }

//     const crop_id = cropRes.rows[0].id;

//     const stageRes = await pool.query(
//       `SELECT stage, recommendation FROM crop_stages
//        WHERE crop_id = $1 AND start_day <= $2 AND end_day >= $2`,
//       [crop_id, day]
//     );

//     res.status(200).json({
//       crop,
//       day,
//       stage: stageRes.rows[0]?.stage || "N/A",
//       recommendation: stageRes.rows[0]?.recommendation || "No recommendation",
//     });
//   } catch (err) {
//     console.error("Get stage by day error:", err);
//     res.status(500).json({ error: "Failed to fetch stage by day" });
//   }
// };


// //  Fetch all crop categories
// exports.getAllCategories = async (req, res) => {
//   try {
//     const result = await pool.query("SELECT id, name FROM category ORDER BY name ASC");
//     res.status(200).json({ categories: result.rows });
//   } catch (err) {
//     console.error("Error fetching categories:", err);
//     res.status(500).json({ error: "Failed to fetch categories" });
//   }
// };

// // 2. Get All Full Crops with Category and Stages
// exports.getAllFullCrops = async (req, res) => {
//   try {
//     const cropRes = await pool.query(`
//       SELECT 
//         c.id AS crop_id,
//         c.name AS crop_name,
//         category.id AS category_id,
//         category.name AS category_name
//       FROM crops c
//       LEFT JOIN crop_categories cc ON cc.crop_id = c.id
//       LEFT JOIN category ON category.id = cc.category_id
//       ORDER BY c.id
//     `);

//     const crops = cropRes.rows;

//     const stageRes = await pool.query(`
//       SELECT crop_id, stage, start_day, end_day, recommendation
//       FROM crop_stages
//       ORDER BY crop_id, start_day
//     `);

//     const stageMap = {};
//     stageRes.rows.forEach(stage => {
//       if (!stageMap[stage.crop_id]) {
//         stageMap[stage.crop_id] = [];
//       }
//       stageMap[stage.crop_id].push(stage);
//     });

//     const fullData = crops.map(crop => ({
//       ...crop,
//       stages: stageMap[crop.crop_id] || []
//     }));

//     res.status(200).json(fullData);
//   } catch (err) {
//     console.error("Error fetching full crop data:", err);
//     res.status(500).json({ error: "Failed to fetch full crop data" });
//   }
// };



// // exports.getCropById = async (req, res) => {
// //   const crop_id = parseInt(req.params.id);

// //   try {
// //     // Get crop name and category
// //     const cropRes = await pool.query(`
// //       SELECT c.id, c.name AS crop_name, cat.id AS category_id, cat.name AS category_name
// //       FROM crops c
// //       LEFT JOIN crop_categories cc ON cc.crop_id = c.id
// //       LEFT JOIN categories cat ON cat.id = cc.category_id
// //       WHERE c.id = $1
// //     `, [crop_id]);

// //     if (cropRes.rows.length === 0) {
// //       return res.status(404).json({ error: "Crop not found" });
// //     }

// //     // Get stages
// //     const stageRes = await pool.query(
// //       `SELECT id, stage, start_day, end_day, recommendation
// //        FROM crop_stages
// //        WHERE crop_id = $1 ORDER BY start_day ASC`,
// //       [crop_id]
// //     );

// //     res.json({
// //       crop: cropRes.rows[0],
// //       stages: stageRes.rows
// //     });
// //   } catch (err) {
// //     console.error("Get crop by ID error:", err);
// //     res.status(500).json({ error: "Failed to fetch crop" });
// //   }
// // };

// exports.getCropById = async (req, res) => {
//   const crop_id = parseInt(req.params.id);

//   try {
//     const cropRes = await pool.query(`
//       SELECT c.id, c.name AS crop_name, cat.id AS category_id, cat.name AS category_name
//       FROM crops c
//       LEFT JOIN crop_categories cc ON cc.crop_id = c.id
//       LEFT JOIN category cat ON cat.id = cc.category_id
//       WHERE c.id = $1
//     `, [crop_id]);

//     if (cropRes.rows.length === 0) {
//       return res.status(404).json({ error: "Crop not found" });
//     }

//     const stageRes = await pool.query(
//       `SELECT id, stage, start_day, end_day, recommendation
//        FROM crop_stages
//        WHERE crop_id = $1 ORDER BY start_day ASC`,
//       [crop_id]
//     );

//     res.json({
//       crop: cropRes.rows[0],
//       stages: stageRes.rows
//     });
//   } catch (err) {
//     console.error("Get crop by ID error:", err.message, err.stack);
//     res.status(500).json({ error: "Failed to fetch crop" });
//   }
// };


// exports.updateCropById = async (req, res) => {
//   const crop_id = parseInt(req.params.id);
//   const { crop_name, category_id, stages } = req.body;
//   const client = await pool.connect();

//   try {
//     await client.query("BEGIN");

//     if (crop_name) {
//       await client.query("UPDATE crops SET name = $1 WHERE id = $2", [crop_name, crop_id]);
//     }

//     if (category_id) {
//       await client.query("DELETE FROM crop_categories WHERE crop_id = $1", [crop_id]);
//       await client.query("INSERT INTO crop_categories (crop_id, category_id) VALUES ($1, $2)", [crop_id, category_id]);
//     }

//     if (stages && Array.isArray(stages)) {
//       await client.query("DELETE FROM crop_stages WHERE crop_id = $1", [crop_id]);

//       for (let stage of stages) {
//         const { stage: stageName, start_day, end_day, recommendation } = stage;
//         await client.query(
//           `INSERT INTO crop_stages (crop_id, stage, start_day, end_day, recommendation)
//            VALUES ($1, $2, $3, $4, $5)`,
//           [crop_id, stageName, start_day, end_day, recommendation]
//         );
//       }
//     }

//     await client.query("COMMIT");
//     res.json({ message: "Crop updated successfully" });
//   } catch (err) {
//     await client.query("ROLLBACK");
//     console.error("Update crop error:", err);
//     res.status(500).json({ error: "Failed to update crop" });
//   } finally {
//     client.release();
//   }
// };


// // 6. Delete Crop and Dependencies
// // exports.deleteCropById = async (req, res) => {
// //   const crop_id = parseInt(req.params.id);

// //   try {
// //     await pool.query("DELETE FROM crop_stages WHERE crop_id = $1", [crop_id]);
// //     await pool.query("DELETE FROM crop_categories WHERE crop_id = $1", [crop_id]);
// //     const result = await pool.query("DELETE FROM crops WHERE id = $1 RETURNING *", [crop_id]);

// //     if (result.rowCount === 0) {
// //       return res.status(404).json({ error: "Crop not found" });
// //     }

// //     res.json({ message: "Crop deleted successfully" });
// //   } catch (err) {
// //     console.error("Delete crop error:", err);
// //     res.status(500).json({ error: "Failed to delete crop" });
// //   }
// // };


const pool = require("../config/db");

// exports.addCrop = async (req, res) => {
//   const { name, category_id, stages } = req.body;
//   try {
//     const cropResult = await pool.query(
//       "INSERT INTO crops (name, category_id) VALUES ($1, $2) RETURNING *",
//       [name, category_id]
//     );
//     const crop = cropResult.rows[0];

//     for (const stage of stages) {
//       await pool.query(
//         "INSERT INTO crop_stages (crop_id, stage_id, start_day, end_day) VALUES ($1, $2, $3, $4)",
//         [crop.id, stage.stage_id, stage.start_day, stage.end_day]
//       );
//     }

//     res.status(201).json({ message: "Crop added with stages", crop });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


exports.addCrop = async (req, res) => {
  const { name, category_id, crop_code, stages } = req.body;

  try {
    const cropResult = await pool.query(
      "INSERT INTO crops (name, category_id, crop_code) VALUES ($1, $2, $3) RETURNING *",
      [name, category_id, crop_code]
    );
    const crop = cropResult.rows[0];

    for (const stage of stages) {
      await pool.query(
        "INSERT INTO crop_stages (crop_id, stage_id, start_day, end_day) VALUES ($1, $2, $3, $4)",
        [crop.id, stage.stage_id, stage.start_day, stage.end_day]
      );
    }

    res.status(201).json({ message: "Crop added with stages", crop });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getAllCrops = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM crops");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// exports.getAllCrops = async (req, res) => {
//   try {
//     const result = await pool.query(`
//       SELECT crops.*, categories.name AS category_name 
//       FROM crops
//       LEFT JOIN categories ON crops.category_id = categories.id
//     `);
//     res.json(result.rows);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };


exports.getCropDetails = async (req, res) => {
  const { cropId } = req.params;
  try {
    const crop = await pool.query("SELECT * FROM crops WHERE id = $1", [cropId]);
    const stages = await pool.query(
      `SELECT cs.*, s.stage, s.recommendation 
       FROM crop_stages cs
       JOIN category_stages s ON cs.stage_id = s.id
       WHERE cs.crop_id = $1`,
      [cropId]
    );
    res.json({ crop: crop.rows[0], stages: stages.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCrop = async (req, res) => {
  const { cropId } = req.params;
  const { name, category_id, stages } = req.body;

  try {
    // Update crop info
    await pool.query(
      "UPDATE crops SET name=$1, category_id=$2 WHERE id=$3",
      [name, category_id, cropId]
    );

    // Delete existing crop stages
    await pool.query("DELETE FROM crop_stages WHERE crop_id=$1", [cropId]);

    // Insert updated crop stages
    for (const stage of stages) {
      await pool.query(
        "INSERT INTO crop_stages (crop_id, stage_id, start_day, end_day) VALUES ($1, $2, $3, $4)",
        [cropId, stage.stage_id, stage.start_day, stage.end_day]
      );
    }

    res.json({ message: "Crop updated successfully" });
  } catch (err) {
    console.error("updateCrop error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteCrop = async (req, res) => {
  const { cropId } = req.params;

  try {
    // Delete crop stages first (to maintain referential integrity)
    await pool.query("DELETE FROM crop_stages WHERE crop_id=$1", [cropId]);

    // Delete the crop itself
    await pool.query("DELETE FROM crops WHERE id=$1", [cropId]);

    res.json({ message: "Crop deleted successfully" });
  } catch (err) {
    console.error("deleteCrop error:", err);
    res.status(500).json({ error: err.message });
  }
};
