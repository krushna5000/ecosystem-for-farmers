module.exports = (sequelize, DataTypes) => {
  const Crop = sequelize.define("Crop", {
    name: DataTypes.STRING,
  });
  return Crop;
};