import React, { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  ArrowRight,
  X,
  Share2,
  Link as LinkIcon,
} from "lucide-react";
import { getAllBlogs } from "../../api/blog";
import { useParams, useNavigate } from "react-router-dom";
import ImageSlider from "../../components/ImageSlider";
import { toast } from "react-hot-toast";

function UserBlogs() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [blogs, setBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH BLOGS ================= */

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await getAllBlogs();
      const published =
        res.data.blogs?.filter((b) => b.status === "published") || [];
      setBlogs(published);
    } catch (err) {
      console.error("FETCH BLOGS ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= SYNC URL → MODAL ================= */

  useEffect(() => {
    if (id && blogs.length > 0) {
      const found = blogs.find((b) => String(b.id) === String(id));
      if (found) {
        setSelectedBlog(found);
      }
    }

    if (!id) {
      setSelectedBlog(null);
    }
  }, [id, blogs]);

  /* ================= HELPERS ================= */

  const estimateReadingTime = (content = "") =>
    Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 250));

  const getExcerpt = (content = "") =>
    content.length > 180 ? content.slice(0, 180) + "..." : content;

  const getShareUrl = (blog) => `${window.location.origin}/blogs/${blog.id}`;

  const getShareText = (blog) =>
    `${blog.title} — ${blog.content.slice(0, 120)}...`;

  const copyLink = (blog) => {
    navigator.clipboard.writeText(getShareUrl(blog));
    toast.success("Link copied to clipboard!");
  };

  const nativeShare = async (blog) => {
    if (navigator.share) {
      await navigator.share({
        title: blog.title,
        text: blog.content.slice(0, 120),
        url: getShareUrl(blog),
      });
    }
  };

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-800 border-t-white rounded-full animate-spin" />
          <p className="text-gray-400 text-lg">Loading stories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* HEADER */}
      <div className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h1
          className="text-4xl md:text-5xl font-bold tracking-tight
          bg-gradient-to-r from-white via-gray-200 to-gray-400
          bg-clip-text text-transparent"
        >
          Our Stories
        </h1>
        <p className="mt-4 text-gray-400 max-w-2xl mx-auto text-xl">
          Curated insights, experiences, and ideas crafted for curious minds.
        </p>
      </div>

      {/* BLOG GRID */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog, idx) => (
            <article
              key={blog.id}
              onClick={() => {
                setSelectedBlog(blog);
                navigate(`/blogs/${blog.id}`);
              }}
              className="group cursor-pointer rounded-2xl bg-white/10 backdrop-blur-xl
                border border-white/10 hover:border-white/20
                hover:-translate-y-2 transition-all duration-500
                shadow-lg hover:shadow-2xl p-4"
              style={{
                animation: "fadeUp 0.6s ease forwards",
                animationDelay: `${idx * 0.1}s`,
                opacity: 0,
              }}
            >
              {blog.images?.length > 0 && (
                <div className="aspect-video rounded-xl mb-5">
                  <ImageSlider images={blog.images} />
                </div>
              )}

              <h2 className="text-xl font-bold mb-3 leading-snug">
                {blog.title}
              </h2>

              <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
                {getExcerpt(blog.content)}
              </p>

              <div className="flex items-center justify-between mt-6 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(
                    blog.published_at || blog.created_at
                  ).toLocaleDateString()}
                </span>
                
              </div>

              <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
                Read Article
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {selectedBlog && (
        <div className="fixed inset-0 z-50 bg-black/95 overflow-y-auto">
          <button
            onClick={() => navigate("/blogs")}
            className="fixed top-6 right-6 bg-white/10 border border-gray-700
              p-3 rounded-full hover:rotate-90 transition"
          >
            <X />
          </button>

          <div className="max-w-3xl mx-auto px-6 py-20">
            {selectedBlog.images?.length > 0 && (
              <div className="aspect-video rounded-2xl overflow-hidden mb-12">
                <ImageSlider images={selectedBlog.images} />
              </div>
            )}

            {/* SHARE BAR */}
            <div className="flex flex-wrap items-center gap-3 mb-10">
              <Share2 className="w-4 h-4 text-gray-400" />

              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  getShareText(selectedBlog) + " " + getShareUrl(selectedBlog)
                )}`}
                target="_blank"
                className="px-4 py-2 rounded-full bg-green-600/10 text-green-400 border border-green-600/30"
              >
                WhatsApp
              </a>

              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  getShareText(selectedBlog)
                )}&url=${encodeURIComponent(getShareUrl(selectedBlog))}`}
                target="_blank"
                className="px-4 py-2 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30"
              >
                X
              </a>

              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                  getShareUrl(selectedBlog)
                )}`}
                target="_blank"
                className="px-4 py-2 rounded-full bg-blue-600/10 text-blue-400 border border-blue-600/30"
              >
                LinkedIn
              </a>

              <button
                onClick={() => copyLink(selectedBlog)}
                className="p-2 rounded-full bg-white/10"
              >
                <LinkIcon className="w-4 h-4" />
              </button>

              {navigator.share && (
                <button
                  onClick={() => nativeShare(selectedBlog)}
                  className="px-4 py-2 rounded-full bg-white/10"
                >
                  Share
                </button>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {selectedBlog.title}
            </h1>

            <div className="flex gap-6 text-gray-400 mb-10">
              <span className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {new Date(
                  selectedBlog.published_at || selectedBlog.created_at
                ).toLocaleDateString()}
              </span>
              
            </div>

            <div className="whitespace-pre-wrap text-gray-300">
              {selectedBlog.content}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default UserBlogs;
