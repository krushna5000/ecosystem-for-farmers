import { env } from "../../../config/env.js";

// The email-verified / reset-password pages live in the admin frontend.
// BASE_URL is the old env name and is kept for existing deployments.
export const baseUrl = () => process.env.BASE_URL || env.frontendUrls.admin;

export const verifyLink = (role, token) => `${baseUrl()}/email-verified/${role}/${token}`;
