export const validateFarm = (req, res, next) => {
    try{
    const { user_id, farm_name, pincode_id, farm_coordinates } = req.body;

    if (!user_id || !farm_name || !pincode_id || !farm_coordinates) {
        return res.status(400).json({
            success: false,
            message: "user_id, farm_name, pincode_id and coordinates are required"
        });
    }

    if (!Array.isArray(farm_coordinates) || farm_coordinates.length < 3) {
        return res.status(400).json({
            success: false,
            message: "At least 3 boundary points required"
        });
    }

}catch(error){
    console.error("Error in validateFarm:", error);
    res.status(500).json({ 
        success: false, 
        message: "Server error" });

    };
    
};
export const validateFarmUpdate = (req, res, next) => {
    try{
        const { farm_coordinates } = req.body;

    if (farm_coordinates && (!Array.isArray(farm_coordinates) || farm_coordinates.length < 3)) {
        return res.status(400).json({
            success: false,
            message: "At least 3 boundary points required"
        });
    }
    }catch(error){
        console.error("Error in validateFarmUpdate:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server error" });
    }
};
