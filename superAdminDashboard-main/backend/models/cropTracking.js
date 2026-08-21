module.exports = (sequelize, DataTypes) => {
  const CropTracking = sequelize.define("CropTracking", {
    user_id: DataTypes.INTEGER,
    crop_id: DataTypes.INTEGER,
    sowing_date: DataTypes.DATE,
  });
  return CropTracking;
};