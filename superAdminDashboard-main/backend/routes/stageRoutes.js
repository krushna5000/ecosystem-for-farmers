// const express = require("express");
// const router = express.Router();
// const { addStage, getStagesByCategory,updateStage,deleteStage } = require("../controllers/stageController");

// router.post("/add", addStage);
// router.get("/category/:categoryId", getStagesByCategory);
// router.put("/update/:id", updateStage);    // ✅ Update route
// router.delete("/delete/:id", deleteStage); // ✅ Delete route
// module.exports = router;
const express = require("express");
const router = express.Router();
const {
  addStage,
  getStagesByCategory,
  updateStage,
  deleteStage,
} = require("../controllers/stageController");

router.post("/add", addStage);
router.get("/category/:categoryId", getStagesByCategory);
router.put("/update/:id", updateStage);    // ✅ Add this
router.delete("/delete/:id", deleteStage);  // ✅ Add this

module.exports = router;
