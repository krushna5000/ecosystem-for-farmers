import React from "react";
import BenefitCard from "./BenefitCard"; 

import cardImg1 from "../../assets/image1.png";
import cardImg2 from "../../assets/image2.png";
import cardImg3 from "../../assets/image3.png";

const benefitsData = [
  {
    image: cardImg1,
    title: "Family & Team Outing",
    description:
      "We strive to be a great place to work for people with families. Our programs make it easier and give you an extra hand to make sure your family feels cared for at every stage of life.",
  },
  {
    image: cardImg2,
    title: "Health & Safety",
    description:
      "We're committed to building a healthy community—one person at a time. But health is more than just getting the care you need. It's about staying healthy in all areas of your life.",
  },
  {
    image: cardImg3,
    title: "Growth & Development",
    description:
      "Never stop learning! We offer a variety of classes and tools to increase your knowledge, build your skills and take charge. Your career development will never stop with Success.",
  },
];

export default function JobBenefitsSection() {
  return (
    <section className="bg-white py-20 px-10 md:px-20">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-gray-900 uppercase mt-7">
          Choose a career with FarmsEasy
        </h2>

        <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mt-4">
         Join our dynamic consulting team, work alongside experienced mentors, and help create meaningful solutions that drive real change..
        </p>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefitsData.map((benefit) => (
            <BenefitCard
              key={benefit.title}
              image={benefit.image}
              title={benefit.title}
              description={benefit.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}