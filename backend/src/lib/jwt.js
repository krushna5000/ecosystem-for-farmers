import { env } from "../config/env.js";

/**
 * Every portal (admin, super-admin, company, vendor, website) now lives in one
 * process and would otherwise share JWT_SECRET. A farmer-app token — which anyone
 * can obtain by registering with an OTP — must never authenticate against a
 * privileged portal, so each portal signs with its own secret derived from
 * JWT_SECRET. Payloads and cookie contracts are unchanged.
 *
 * The farmer app keeps using the raw JWT_SECRET so existing mobile sessions survive.
 */
export const portalSecret = (portal) => `${env.jwtSecret}:${portal}`;
