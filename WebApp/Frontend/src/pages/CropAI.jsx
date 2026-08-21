import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import AIResult from "../components/CropAI/AIResult";
import { compressImage } from "../utils/imageCompress";
import AIResultSkeleton from "../components/Loaders/AIResultSkeleton";
import CropDetectionCard from "../components/CropAI/CropDetectionCard";

export default function CropAI() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [productRecommendations, setProductRecommendations] = useState(null);
  const [lang, setLang] = useState("en");

  const hasAnalyzedRef = useRef(false);

  const domain = "http://localhost:5004/api";
  const { user } = useAuth();

  // receive file from child
  const handleFileSelect = async (rawFile, selectedLang) => {
    if (!rawFile) return;

    const compressed = await compressImage(rawFile);

    setLang(selectedLang || "en");
    setFile(compressed);
    setPreview(URL.createObjectURL(compressed));
    setReport(null);
    setProductRecommendations(null);
    hasAnalyzedRef.current = false;
  };

  // AUTO ANALYZE WHEN FILE READY (correct timing)
  useEffect(() => {
    if (file && !hasAnalyzedRef.current) {
      hasAnalyzedRef.current = true;
      analyzeCrop();
    }
  }, [file]);

  const analyzeCrop = async () => {
    const fd = new FormData();
    fd.append("image", file);
    fd.append("language", lang);
    fd.append("user_id", user.id);

    console.log("object");

    try {
      setIsLoading(true);

      const res = await axios.post(`${domain}/crop-ai/analyze-crop`, fd, { withCredentials: true });

      const parsedReport =
        typeof res.data.report === "string"
          ? JSON.parse(res.data.report)
          : res.data.report;

      setReport(parsedReport);
      setProductRecommendations(res.data.productRecommendations || null);
    } catch (err) {
      alert(err.response?.data?.message || "Crop analysis failed");
    } finally {
      setIsLoading(false);
    }
  };

  const clearImage = () => {
    hasAnalyzedRef.current = false;
    setFile(null);
    setPreview(null);
    setReport(null);
    setProductRecommendations(null);
  };

  return (
    <div className="relative space-y-6 mt-4">
      <CropDetectionCard
        selectedImage={preview}
        isLoading={isLoading}
        onFileSelect={handleFileSelect}
        onClear={clearImage}
      />

      {isLoading && <AIResultSkeleton />}
      {report && <AIResult report={report} lang={lang} productRecommendations={productRecommendations} />}
    </div>
  );
}
