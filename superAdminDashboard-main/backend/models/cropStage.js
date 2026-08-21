module.exports = (sequelize, DataTypes) => {
  const CropStage = sequelize.define("CropStage", {
    crop_id: DataTypes.INTEGER,
    stage: DataTypes.STRING,
    start_day: DataTypes.INTEGER,
    end_day: DataTypes.INTEGER,
    recommendation: DataTypes.TEXT,
  });
  return CropStage;
};