import React from "react";
import ProductCard from "./ProductCard";
import cropAI from "../../../assets/cropAI.png";
import CLCM from "../../../assets/CLCM.png";
import drone from "../../../assets/drone.png";

export default function ProductList() {
  const products = [
    { img: cropAI, title: "Crop AI", delay: 0 },
    { img: CLCM, title: "Crop Life-Cycle Management", delay: 0.2 },
    { img: drone, title: "Product Recommendation", delay: 0.4 },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
      {products.map((p, i) => (
        <ProductCard key={i} img={p.img} title={p.title} delay={p.delay} />
      ))}
    </div>
  );
}
