import { addFarmFromWhatsapp } from "../controllers/farmController.js";

// Add farm — delegates to farmController
export async function addFarmViaApi({ phoneNumber, farmName, pincode, areaAcres, lat, lng }) {
    return await addFarmFromWhatsapp({ phoneNumber, farmName, pincode, areaAcres, lat, lng });
}
