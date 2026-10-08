import React from "react";
import ProductList from "./Products/ProductList";
import Benefits from "./Products/Benefits";

export default function Products() {
  return (
    <section className="font-semibold text-3xl md:text-4xl px-6 md:px-12 py-12">
      <p>Explore FarmsEasy's Pioneering Technology,</p>
      <p className="text-[#828282b2]">
        Which is Revolutionizing Agricultural Practices
      </p>
      <p className="text-[#828282b2]">
        And Shaping The Future Of Agricultural Production.
      </p>

      <div className="mt-12  gap-8 items-start">
        <div className="flex flex-col">
          <ProductList />
          <Benefits />
        </div>
      </div>
    </section>
  );
}
