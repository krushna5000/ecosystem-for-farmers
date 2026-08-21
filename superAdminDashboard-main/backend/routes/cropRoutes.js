// const express = require("express");
// const router = express.Router();
// const controller = require("../controllers/cropController");

// // router.post("/add-crop", controller.addCrop);
// // router.post("/add-category", controller.addCategory);
// // router.post("/add-stage", controller.addCropStage);
// // New unified API
// router.post("/add-full-crop", controller.addFullCrop);
// router.post("/track-crop", controller.trackCrop);
// router.get("/status/:user_id", controller.getCurrentStage);
// router.post("/status/check", controller.getStageByDay);
// // Get all categories (id + name)
// router.get("/categories", controller.getAllCategories);
// router.get("/crops/full", controller.getAllFullCrops);

// router.get("/crops/:id", controller.getCropById);
// router.put("/crops/:id", controller.updateCropById);
// // router.delete("/crops/:id", controller.deleteCropById);

// module.exports = router;





const express = require("express");
const router = express.Router();
const {
  addCrop,
  getAllCrops,
  getCropDetails,
  updateCrop,
  deleteCrop
} = require("../controllers/cropController");

router.post("/add", addCrop);
router.get("/all", getAllCrops);
router.get("/:cropId", getCropDetails);
router.put("/update/:cropId", updateCrop);
router.delete("/delete/:cropId", deleteCrop);

module.exports = router;
