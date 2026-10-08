import React from "react";
import HeroTitle from "./HeroSection/HeroTitle";
import HeroContent from "./HeroSection/HeroContent";
import ActionButton from "../ActionButton";

export default function HeroSection() {
  return (
    <div>
      <HeroTitle />
      <HeroContent />
      <ActionButton text="Explore our solution" href="https://zeocrop.farmseasy.in" target="_blank"  />
    </div>
  );
}
