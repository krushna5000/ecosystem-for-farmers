import axios from "axios";
import { domain } from "../utils/domain";

/* =========================
   CREATE TEAM MEMBER
   ========================= */
export const createTeamMember = (data) => {
  return axios.post(`${domain}/team`, data, {
    withCredentials: true,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

/* =========================
   GET ALL TEAM MEMBERS
   ========================= */
export const getAllTeamMembers = () => {
  return axios.get(`${domain}/team`, {
    withCredentials: true,
  });
};

/* =========================
   GET SINGLE TEAM MEMBER
   ========================= */
export const getTeamMemberById = (emp_id) => {
  return axios.get(`${domain}/team/${emp_id}`, {
    withCredentials: true,
  });
};

/* =========================
   UPDATE TEAM MEMBER
   ========================= */
export const updateTeamMember = (emp_id, data) => {
  return axios.put(`${domain}/team/${emp_id}`, data, {
    withCredentials: true,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

/* =========================
   DELETE TEAM MEMBER
   ========================= */
export const deleteTeamMember = (emp_id) => {
  return axios.delete(`${domain}/team/${emp_id}`, {
    withCredentials: true,
  });
};

export const deleteMultipleTeamMembers = (ids) => {
  return axios.delete(`${domain}/team/bulk-delete`, {
    data: { ids },
  });
};