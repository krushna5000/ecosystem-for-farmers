const express = require("express");
const router = express.Router();
const {
  addCategory,
  getCategories,
  updateCategory,
  deleteCategory
} = require("../controllers/categoryController");

router.post("/add", addCategory);
router.get("/", getCategories);
router.put("/update/:id", updateCategory);
router.delete("/delete/:id", deleteCategory);


module.exports = router;
