import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Register = () => {
  const [selectedRole, setSelectedRole] = useState('Researcher');

  return (
    <div className="flex h-screen w-full bg-[#f8f9fb] font-sans overflow-hidden">
      
      {/* Left Panel - Dark Green Branding */}
      <div className="hidden md:flex flex-col justify-between w-[45%] bg-[#0a271c] px-12 py-10 relative h-full">
        {/* Header / Logo */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#4ade80]">
            ZeoCrop
          </h1>
          <p className="text-[#a1b5aa] text-xs font-medium tracking-wide mt-1">
            Precision Agriculture Research Suite
          </p>
        </div>

        {/* Main Value Proposition */}
        <div className="mb-4">
          <h2 className="text-4xl lg:text-5xl font-bold text-white leading-[1.1] mb-5">
            Enter the Living <br />
            <span className="text-[#4ade80]">Archive.</span>
          </h2>
          <p className="text-[#a1b5aa] text-sm lg:text-base leading-relaxed mb-8 max-w-md">
            Access high-density satellite insights, soil kinetics, 
            and AI-driven lifecycle modeling for the next 
            generation of food security research.
          </p>

          {/* Feature List */}
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="mt-1 bg-[#153b2b] p-2 rounded-md">
                <svg className="w-4 h-4 text-[#4ade80]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h4 className="text-white text-sm font-semibold">Real-time Telemetry</h4>
                <p className="text-[#a1b5aa] text-xs mt-0.5">Hyperspectral imagery processed at the edge.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="mt-1 bg-[#153b2b] p-2 rounded-md">
                <svg className="w-4 h-4 text-[#4ade80]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h4 className="text-white text-sm font-semibold">Predictive Models</h4>
                <p className="text-[#a1b5aa] text-xs mt-0.5">Advanced neural networks for yield optimization.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex justify-between items-center text-[#a1b5aa] text-[10px] font-bold tracking-widest uppercase">
          <span>Est. 2024</span>
          <span>Global Agri-Data Network</span>
        </div>
      </div>

      {/* Right Panel - Form Container */}
      {/* Changed to flex-col with justify-between to naturally spread elements without scrolling */}
      <div className="w-full md:w-[55%] flex flex-col justify-between items-center px-8 py-6 h-full">
        
        {/* Top Spacer to push form down slightly without forcing it */}
        <div className="hidden lg:block w-full h-4"></div>

        <div className="w-full max-w-[420px]">
          
          {/* Form Header */}
          <div className="mb-6">
            <h2 className="text-2xl lg:text-3xl font-extrabold text-[#111827] mb-1.5 tracking-tight">
              Create Research Account
            </h2>
            <p className="text-xs lg:text-sm text-gray-500 font-medium">
              Join a global community of precision researchers.
            </p>
          </div>

          {/* Reduced space-y to pull form tighter */}
          <form className="space-y-3.5" onSubmit={(e) => e.preventDefault()}>
            
            {/* Full Name */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-600 tracking-wider uppercase">Full Name</label>
              <input 
                type="text" 
                placeholder="Dr. Julian Vane"
                className="w-full bg-[#e8eef6] border-none text-gray-800 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0a271c] placeholder:text-gray-400 font-medium"
              />
            </div>

            {/* Institution */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-600 tracking-wider uppercase">Institution/University</label>
              <input 
                type="text" 
                placeholder="Global Institute of Agronomy"
                className="w-full bg-[#e8eef6] border-none text-gray-800 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0a271c] placeholder:text-gray-400 font-medium"
              />
            </div>

            {/* Role Selection */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-600 tracking-wider uppercase">Role</label>
              <div className="flex gap-2">
                {['Researcher', 'Student', 'Analyst'].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={`flex-1 py-2.5 px-3 rounded-lg cursor-pointer text-[11px] font-semibold transition-colors duration-200 ${
                      selectedRole === role 
                        ? 'bg-[#d6e2f0] text-gray-800 shadow-sm' 
                        : 'bg-[#e8eef6] text-gray-500 hover:bg-[#e2eaf4]'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-600 tracking-wider uppercase">Email Address</label>
              <input 
                type="email" 
                placeholder="researcher@zeocrop.org"
                className="w-full bg-[#e8eef6] border-none text-gray-800 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0a271c] placeholder:text-gray-400 font-medium"
              />
            </div>

            {/* Password */}
            <div className="space-y-1 relative">
              <label className="block text-[10px] font-bold text-gray-600 tracking-wider uppercase">Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  placeholder="••••••••••••"
                  className="w-full bg-[#e8eef6] border-none text-gray-800 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0a271c] placeholder:text-gray-400 font-medium pr-10"
                />
                <button type="button" className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Terms and Checkbox */}
            <div className="flex items-start gap-2.5 pt-1">
              <div className="flex items-center h-4">
                <input 
                  type="checkbox" 
                  className="w-3.5 h-3.5 border border-gray-300 rounded bg-[#e8eef6] checked:bg-[#0a271c] focus:ring-[#0a271c] cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-gray-500 leading-snug font-medium">
                I agree to the <a href="#" className="text-[#3b8c66] hover:underline font-semibold">research data usage policy</a> and ZeoCrop's ethical AI frameworks.
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button 
                type="submit"
                className="w-full bg-[#0a271c] text-white cursor-pointer rounded-xl py-3.5 text-sm font-semibold shadow-md hover:bg-[#0d3425] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0a271c]"
              >
                Initialize Research Access
              </button>
            </div>
            
            {/* Sign In Link (Using React Router Link as requested) */}
            <div className="text-center mt-4">
              <p className="text-[11px] text-gray-500 font-medium">
                Already part of the network?{' '}
                <Link to="/" className="text-[#0a271c] font-bold hover:underline">
                  Sign in here
                </Link>
              </p>
            </div>
          </form>

        </div>

        {/* Bottom Badges - Removed absolute positioning to stop overlap */}
        <div className="flex justify-center gap-4 lg:gap-8 text-[9px] font-bold text-gray-400 tracking-[0.1em] lg:tracking-[0.15em] uppercase w-full pb-2">
          <span>Data Sovereignty</span>
          <span>Privacy Shield</span>
          <span>Agri-Certified</span>
        </div>

      </div>
    </div>
  );
};

export default Register;