import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";


export default function ImageSlider({ images = [], alt = "", className = "" }) {
  const [index, setIndex] = useState(0);

  if (!images.length) return null;

  const prev = (e) => {
    e.stopPropagation();
    setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  };

  const next = (e) => {
    e.stopPropagation();
    setIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  };

  return (
    <div
      className={`relative overflow-hidden rounded-lg h-48 md:h-full ${className}`}
    >
      <img
        src={`${images[index]}`}
        alt={alt}
        className="w-full h-full object-fill transition-all duration-500"
      />

      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2
              bg-black/50 hover:bg-black/70 p-2 rounded-full"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>

          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2
              bg-black/50 hover:bg-black/70 p-2 rounded-full"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i === index ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
