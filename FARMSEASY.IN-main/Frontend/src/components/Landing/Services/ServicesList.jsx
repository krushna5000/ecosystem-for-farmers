import React from "react";
import service1 from "../../../assets/services1.png";
import service2 from "../../../assets/services2.png";
import service3 from "../../../assets/services3.png";
import services4 from "../../../assets/services4.png";
import ServiceCard from "./ServiceCard";

export default function ServicesList() {
  const services = [
    {
      img: service1,
      title: "Precision Farming",
      description:
        "Our precision farming techniques use advanced technology to optimize all farm operations.",
      delay: 0,
    },
    {
      img: service2,
      title: "Crop Monitoring",
      description:
        "Monitor your crops' health and growth in real time with our solutions.",
      delay: 0.2,
    },
    {
      img: service3,
      title: "Advisory Solutions",
      description:
        "Optimize your farm with our advanced satellite intelligence system.",
      delay: 0.4,
    },
    {
      img: services4,
      title: "Product Recommendation",
      description:
        "Optimize your farm with our advanced satellite intelligence system.",
      delay: 0.4,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full mt-8">
      {services.map((s, i) => (
        <ServiceCard
          key={i}
          img={s.img}
          title={s.title}
          description={s.description}
          delay={s.delay}
        />
      ))}
    </div>
  );
}
