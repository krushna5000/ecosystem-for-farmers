import getCropById from "../services/agronomy/crop.service.js";

const cropAdvisory = async (req, res) => {
  const { farm_id, crop_id } = req.body;

  const crop = await getCropById(crop_id);

  res.json(crop);
};

export default cropAdvisory;
