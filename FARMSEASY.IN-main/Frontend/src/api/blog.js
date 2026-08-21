import axios from "axios";
import { domain } from "../utils/domain";

/* =========================
   CREATE BLOG
   ========================= */
export const createBlog = (data) => {
  return axios.post(`${domain}/blogs`, data, {
    withCredentials: true,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

/* =========================
   GET ALL BLOGS
   ========================= */
export const getAllBlogs = () => {
  return axios.get(`${domain}/blogs`, {
    withCredentials: true,
  });
};

/* =========================
   GET SINGLE BLOG BY ID
   ========================= */
export const getBlogById = (id) => {
  return axios.get(`${domain}/blogs/${id}`, {
    withCredentials: true,
  });
};

/* =========================
   UPDATE BLOG
   ========================= */
export const updateBlog = (id, data) => {
  return axios.put(`${domain}/blogs/${id}`, data, {
    withCredentials: true,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const updateBlogImages = (id, imagesFormData) => {
  return axios.put(`${domain}/blogs/${id}/images`, imagesFormData, {
    withCredentials: true,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

/* =========================
   DELETE BLOG
   ========================= */
export const deleteBlog = (id) => {
  return axios.delete(`${domain}/blogs/${id}`, {
    withCredentials: true,
  });
};

export const deleteMultipleBlogs = (ids) => {
  return axios.delete(`${domain}/blogs/bulk-delete`, {
    withCredentials: true,
    data: { ids }, // ⚠️ important for DELETE
  });
};