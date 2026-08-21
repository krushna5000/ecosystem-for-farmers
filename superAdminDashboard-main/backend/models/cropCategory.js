module.exports = (sequelize, DataTypes) => {
  const CropCategory = sequelize.define("CropCategory", {
    crop_id: DataTypes.INTEGER,
    category_id: DataTypes.INTEGER,
  });
  return CropCategory;
};