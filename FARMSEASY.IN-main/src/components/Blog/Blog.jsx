import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import {
  Image,
  Video,
  Tag,
  X,
  Eye,
  FileText,
  Clock,
  Save,
  Send,
  Trash2,
  Edit2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";
import ConfirmDialog from "../ConfirmDialog.jsx";

import {
  createBlog,
  getAllBlogs,
  updateBlog,
  deleteBlog,
  deleteMultipleBlogs,
} from "../../api/blog.js";

function Blog() {
  const [replaceIndex, setReplaceIndex] = useState(null);
  const replaceInputRef = React.useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const editBlog = location.state?.blog || null;
  const isEditMode = Boolean(editBlog?.id);

  const [existingImages, setExistingImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);

  const [existingVideo, setExistingVideo] = useState(null);

  /* ================= LIST STATE ================= */
  const [blogs, setBlogs] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [search, setSearch] = useState("");


   const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  /* ================= FORM STATE ================= */
  const [loading, setLoading] = useState(false);
  const [blogForm, setBlogForm] = useState({
    title: "",
    content: "",
    tags: [],
    images: [],
    video: null,
    status: "draft",
  });

  const [tagInput, setTagInput] = useState("");


  const [selectedRows, setSelectedRows] = useState([]);
const [toggleCleared, setToggleCleared] = useState(false);

  /* ================= PREFILL EDIT ================= */
  useEffect(() => {
    if (isEditMode) {
      setBlogForm({
        title: editBlog.title || "",
        content: editBlog.content || "",
        tags: editBlog.tags || [],
        images: [], // for NEW uploads only
        video: null,
        status: editBlog.status || "draft",
      });

      setExistingImages(editBlog.images || []);
      setExistingVideo(editBlog.video || null);
    }
  }, [isEditMode, editBlog]);

  /* ================= LOAD BLOGS ================= */
  const loadBlogs = async () => {
    try {
      const res = await getAllBlogs();
      setBlogs(res.data.blogs || []);
    } catch {
      toast.error("Failed to load blogs");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const charCount = blogForm.content.length;
  const wordCount = blogForm.content.trim()
    ? blogForm.content.trim().split(/\s+/).length
    : 0;

  /* ================= TAGS ================= */
  const handleTagKeyDown = (e) => {
    if ((e.key === " " || e.key === "Enter") && tagInput.trim()) {
      e.preventDefault();
      if (!blogForm.tags.includes(tagInput.trim())) {
        setBlogForm({
          ...blogForm,
          tags: [...blogForm.tags, tagInput.trim()],
        });
      }
      setTagInput("");
    }
  };

  const removeTag = (tag) => {
    setBlogForm({
      ...blogForm,
      tags: blogForm.tags.filter((t) => t !== tag),
    });
  };

  /* ================= MEDIA ================= */
  const handleImageUpload = (e) => {
    setBlogForm({
      ...blogForm,
      images: [...blogForm.images, ...Array.from(e.target.files)],
    });
  };

  const handleVideoUpload = (e) => {
    setBlogForm({ ...blogForm, video: e.target.files[0] });
  };
  const removeExistingImage = (idx) => {
    setRemovedImages((prev) => [...prev, existingImages[idx]]);
    setExistingImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleReplaceClick = (idx) => {
    setReplaceIndex(idx);
    replaceInputRef.current.click();
  };

  const handleReplaceImage = (e) => {
    const file = e.target.files[0];
    if (!file || replaceIndex === null) return;

    // show preview instantly
    const updated = [...existingImages];
    updated[replaceIndex] = URL.createObjectURL(file);
    setExistingImages(updated);

    // store file for backend
    setBlogForm((prev) => ({
      ...prev,
      images: [file], // ONLY ONE FILE for replace
    }));
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!blogForm.title || !blogForm.content) {
      toast.error("Title and content are required");
      return;
    }

    try {
      setLoading(true);
      const fd = new FormData();

      fd.append("title", blogForm.title);
      fd.append("content", blogForm.content);
      fd.append("status", blogForm.status);
      fd.append("word_count", wordCount);
      fd.append("char_count", charCount);

      // TAGS
      blogForm.tags.forEach((t) => fd.append("tags[]", t));

      // NEW IMAGES
      blogForm.images.forEach((img) => fd.append("images", img));

      // REMOVED OLD IMAGES
      existingImages.forEach((img) => fd.append("existing_images[]", img));

      if (replaceIndex !== null) {
        fd.append("replace_image_index", replaceIndex);
      }

      // VIDEO
      if (blogForm.video) fd.append("video", blogForm.video);

      if (isEditMode) {
        await updateBlog(editBlog.id, fd);
        toast.success("Blog updated successfully");
      } else {
        await createBlog(fd);
        toast.success("Blog created successfully");
      }

      setBlogForm({
        title: "",
        content: "",
        tags: [],
        images: [],
        video: null,
        status: "draft",
      });

      setExistingImages([]);
      setRemovedImages([]);

      navigate("/admin/careers/blogs");
      loadBlogs();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save blog");
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDeleteConfirmed = async () => {
  if (!toDelete) return;

  try {
    await deleteBlog(toDelete.id);
    toast.success("Deleted successfully");
    loadBlogs();
  } catch {
    toast.error("Delete failed");
  } finally {
    setConfirmOpen(false);
    setToDelete(null);
  }
};

const handleBulkDelete = async () => {
  try {
    const ids = selectedRows.map((row) => row.id);

    if (ids.length === 0) {
      toast.error("No blogs selected");
      return;
    }

    const res = await deleteMultipleBlogs(ids);

    if (res?.status !== 200) {
      throw new Error("Delete failed");
    }

    // ✅ instant UI update
    setBlogs((prev) => prev.filter(blog => !ids.includes(blog.id)));

    toast.success(`${ids.length} blogs deleted`);

    setToggleCleared((prev) => !prev);
    setSelectedRows([]);

  } catch (err) {
    console.error(err);
    toast.error("Failed to delete blogs");
  }
};
const handleRowSelected = (state) => {
  setSelectedRows(state.selectedRows);
};


  const filteredBlogs = blogs.filter(
    (b) =>
      b.title?.toLowerCase().includes(search.toLowerCase()) ||
      b.status?.toLowerCase().includes(search.toLowerCase())
  );

  /* ================= TABLE ================= */
  const columns = [
    {
      name: "Blog",
      cell: (row) => (
        <div>
          <p className="font-semibold text-gray-900">{row.title}</p>
          <p className="text-sm text-gray-600 line-clamp-2">{row.content}</p>
        </div>
      ),
    },
  {
  name: "Media",
  cell: (row) => {
    const firstImg =
      row.images?.[0] || row.image || row.thumbnail || null; // supports different backend keys

    return (
      <div className="flex items-center gap-2">
        {/* IMAGE PREVIEW */}
        {firstImg ? (
          <div className="relative group">
            <img
              src={firstImg}
              alt="preview"
              className="w-10 h-10 rounded-lg object-cover border"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />

  
          </div>
        ) : (
          row.images?.length > 0 && <Image className="w-4 h-4 text-blue-600" />
        )}

        {/* VIDEO ICON (same) */}
        {row.video && <Video className="w-4 h-4 text-purple-600" />}
      </div>
    );
  },
},
    {
      name: "Tags",
      cell: (row) => (
        <div className="flex flex-wrap gap-2">
          {row.tags?.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-800"
            >
              #{tag}
            </span>
          ))}
        </div>
      ),
    },

    {
      name: "Status",
      cell: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            row.status === "published"
              ? "bg-green-100 text-green-700"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex gap-2">
          <button
            onClick={() =>
              navigate("/admin/careers/blogs", { state: { blog: row } })
            }
            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
          >
            <Edit2 className="w-5 h-5" />
          </button>
          <button
  onClick={() => {
    setToDelete({ id: row.id, title: row.title });
    setConfirmOpen(true);
  }}
  className="p-1 text-red-600 hover:bg-red-100 rounded"
>
  <Trash2 className="w-5 h-5" />
</button>

        </div>
      ),
    },
  ];

  /* ================= RENDER ================= */
  return (
    <>

{/*  delete conformation dialog */}
<ConfirmDialog
  open={confirmOpen}
  title="Delete Blog"
  message={
    <>
      Are you sure you want to delete{" "}
      <strong>"{toDelete?.title}"</strong>?
      <br />
      <span className="text-red-600 font-medium">
        This action cannot be undone.
      </span>
    </>
  }
  onCancel={() => {
    setConfirmOpen(false);
    setToDelete(null);
  }}
  onConfirm={handleDeleteConfirmed}
/>

      <div className="min-h-screen text-gray-800 bg-white rounded-2xl">
        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* HEADER */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-4xl font-bold text-gray-900">
                Write Your Story
              </h1>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#CBFF2E] hover:bg-[#b8e829] font-semibold rounded-lg shadow disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {blogForm.status === "published"
                        ? isEditMode
                          ? "Edit And Publish "
                          : "Publish"
                        : "Save Draft"}
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                {wordCount} words
              </span>
              <span>•</span>
              <span>{charCount} characters</span>
              <span>•</span>
              <span className="capitalize flex items-center gap-1.5">
                {blogForm.status === "draft" ? (
                  <Save className="w-4 h-4" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {blogForm.status}
              </span>
            </div>
          </div>

          {/* EDITOR CARD */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* TITLE */}
            <div className="border-b px-8 pt-8 pb-6">
              <input
                type="text"
                placeholder="Your story title..."
                value={blogForm.title}
                onChange={(e) =>
                  setBlogForm({ ...blogForm, title: e.target.value })
                }
                onFocus={() => setFocusedField("title")}
                onBlur={() => setFocusedField("")}
                className="w-full text-5xl font-bold outline-none placeholder-gray-300"
              />
            </div>

            {/* TAGS */}
            <div className="border-b px-8 py-5 bg-gray-50">
              <div className="flex flex-wrap gap-2 mb-3">
                {blogForm.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center bg-white border px-3 py-1.5 rounded-full text-sm font-medium"
                  >
                    <Tag className="w-3.5 h-3.5 mr-1.5" />
                    {`#${tag}`}
                    <X
                      className="w-3.5 h-3.5 ml-2 cursor-pointer text-gray-400 hover:text-red-500"
                      onClick={() => removeTag(tag)}
                    />
                  </span>
                ))}
              </div>

              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Add tags (press space or enter)"
                className="w-full border px-4 py-2.5 rounded-lg text-sm outline-none"
              />
            </div>

            {/* MEDIA BUTTONS */}
            <div className="border-b px-8 py-4 flex gap-4">
              <label className="cursor-pointer flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg">
                <Image className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {blogForm.images.length
                    ? `${blogForm.images.length} Images`
                    : "Add Images"}
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  hidden
                  onChange={handleImageUpload}
                />
              </label>

              <label className="cursor-pointer flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg">
                <Video className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {blogForm.video ? "1 Video" : "Add Video"}
                </span>
                <input
                  type="file"
                  accept="video/*"
                  hidden
                  onChange={handleVideoUpload}
                />
              </label>
            </div>

            {/* CONTENT */}
            <div className="px-8 py-6">
              <textarea
                rows="20"
                value={blogForm.content}
                onChange={(e) =>
                  setBlogForm({ ...blogForm, content: e.target.value })
                }
                onFocus={() => setFocusedField("content")}
                onBlur={() => setFocusedField("")}
                placeholder="Upload your thoughts here..."
                className="w-full outline-none text-lg leading-relaxed resize-none"
                style={{ minHeight: "500px" }}
              />
            </div>

            {/* STATUS */}
            <div className="border-t px-8 py-5 bg-gray-50 flex justify-between">
              <div className="flex gap-3">
                <button
                  onClick={() => setBlogForm({ ...blogForm, status: "draft" })}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    blogForm.status === "draft"
                      ? "bg-gray-200"
                      : "bg-white border"
                  }`}
                >
                  <Save className="w-4 h-4 inline mr-2" />
                  Draft
                </button>

                <button
                  onClick={() =>
                    setBlogForm({ ...blogForm, status: "published" })
                  }
                  className={`px-4 py-2 rounded-lg font-medium ${
                    blogForm.status === "published"
                      ? "bg-gray-900 text-white"
                      : "bg-white border"
                  }`}
                >
                  <Send className="w-4 h-4 inline mr-2" />
                  Publish
                </button>
              </div>

              <div className="text-sm text-gray-500">
                Last edited: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* MEDIA PREVIEW */}
          {(existingImages.length > 0 ||
            blogForm.images.length > 0 ||
            existingVideo ||
            blogForm.video) && (
            <div className="mt-6 bg-white rounded-2xl shadow-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Attached Media</h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* EXISTING IMAGES */}
                {existingImages.map((img, idx) => (
                  <div
                    key={`old-${idx}`}
                    className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden"
                  >
                    <img
                      src={`${img}`}
                      alt="existing"
                      className="w-full h-full object-contain"
                    />

                    {/* REMOVE */}
                    <button
                      onClick={() => removeExistingImage(idx)}
                      className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {/* NEW IMAGES */}
                {blogForm.images.map((img, idx) => (
                  <div
                    key={`new-${idx}`}
                    className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden"
                  >
                    <img
                      src={URL.createObjectURL(img)}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />

                    {/* REMOVE BUTTON */}
                    <button
                      onClick={() => removeNewImage(idx)}
                      className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {/* EXISTING VIDEO */}
                {existingVideo && !blogForm.video && (
                  <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <video
                      src={`${
                        import.meta.env.VITE_BACKEND_URL
                      }${existingVideo}`}
                      controls
                      className="w-full h-full object-cover"
                    />

                    <button
                      onClick={removeExistingVideo}
                      className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* NEW VIDEO */}
                {blogForm.video && (
                  <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <video
                      src={URL.createObjectURL(blogForm.video)}
                      controls
                      className="w-full h-full object-cover"
                    />

                    <button
                      onClick={removeNewVideo}
                      className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* BLOG LIST (UNCHANGED UI) */}
      <div className="bg-white rounded-2xl p-4 mb-10 mt-5">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">All Blogs</h1>

        <input
          placeholder="Search blogs..."
          className="mb-4 px-4 py-2 border rounded-lg w-full max-w-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {selectedRows.length > 0 && (
  <div className="flex justify-between items-center mb-4 bg-red-50 border border-red-200 p-3 rounded-xl">

    <span className="font-medium text-red-700">
      {selectedRows.length} job(s) selected
    </span>

    <button
      onClick={handleBulkDelete}
      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
    >
      <Trash2 className="w-4 h-4" />
      Delete Selected
    </button>

  </div>
)}
        

       <DataTable
  columns={columns}
  data={filteredBlogs}
  pagination
  highlightOnHover
  pointerOnHover
  responsive
  striped
  selectableRows
  onSelectedRowsChange={handleRowSelected}
  clearSelectedRows={toggleCleared}
  selectableRowsHighlight
  customStyles={{
    headCells: {
      style: {
        backgroundColor: "#CBFF2E",
        color: "black",
        fontWeight: "600",
      },
    },
  }}
/>
      </div>
      <input
        type="file"
        accept="image/*"
        hidden
        ref={replaceInputRef}
        onChange={handleReplaceImage}
      />
    </>
  );
}

export default Blog;
