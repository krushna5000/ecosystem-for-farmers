import { api } from "../api";

export async function logoutCompany() {
  const res = await api.post(
    "/company/logout",
    {},
    { withCredentials: true }
  );
  return res.data;
}

export const getCompanyProfile = async () => {
  try {
    const res = await api.get(
      "/company/profile",
      {
        withCredentials: true,
      }
    );

    return res.data;
  } catch (error) {
    console.error(
      "Company profile error:",
      error
    );

    throw error;
  }
};