import React from "react";
import ActionButton from "../../components/ActionButton.jsx";
import heroBg from "../../assets/community.png";

import JobOpportunities from "../../components/Careers/JobOpportunities.jsx";

export default function Careers() {
  return (
    <>
      <div
        className="relative h-155 w-full bg-cover bg-center text-white"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-black/50 z-0"></div>

        <div className="relative z-10 flex h-full flex-col">
          <main className="flex-grow flex items-center px-10 md:px-20">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold leading-tight text-white md:text-5xl">
                Bring your unique perspective to projects that transcend
                convention.
              </h1>
              <div className="mt-6">
                <ActionButton text="JOIN US NOW" href="https://www.linkedin.com/company/farmseasy/"  target = "_blank"/>
              </div>
            </div>
          </main>
        </div>
      </div>
      
      <JobOpportunities />

      {/* --- FINAL "JOIN OUR TEAM" SECTION --- */}
      <section className="bg-[#0C1515] py-24 px-10 md:px-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white uppercase mb-6">
            Join Our Team
          </h2>
          <h3 className="text-4xl font-bold leading-tight text-white md:text-5xl mb-10">
            Collaborate with innovators and challenge conventional thinking to
            build what’s possible.
          </h3>
          <a
            href="mailto:app@farmseasy.in"
            className="border border-white text-white px-8 py-3 text-lg font-medium transition-colors hover:bg-white hover:text-black"
          >
            WORK WITH US TODAY
          </a>
        </div>
      </section>
    </>
  );
}
