import { checkUser, registerUser } from "../controllers/authController.js";

// Check user registration — delegates to authController
export async function checkUserRegistration(phoneNumber) {
    return await checkUser(phoneNumber);
}

// Register user — delegates to authController
export { registerUser };
