import React, { useState } from 'react';

const Login = () => {
  const [role, setRole] = useState('Researcher');

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f4f7fa] font-sans text-gray-800">
      
      {/* Left Panel - Dark Green Agri-Tech Branding */}
      <div className="relative hidden lg:flex w-1/2 flex-col justify-between bg-[#072a1e] p-12 xl:p-16 text-white overflow-hidden">
        
        {/* Background Image Overlay (Simulating the greenhouse backdrop) */}
        <div 
          className="absolute inset-0 z-0 opacity-20"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1530836369250-ef71a3f5e481?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        {/* Gradient fade for text readability */}
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#072a1e] via-[#072a1e]/90 to-transparent" />

        {/* Content (z-10 to stay above background) */}
        <div className="relative z-10 flex flex-col h-full justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-[#34d399]" fill="currentColor" viewBox="0 0 24 24">
              {/* Tractor/Agri icon placeholder */}
              <path d="M19 12h-2v-2h2v2zm0-4h-2V6h2v2zm-4-4H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM5 16V6h10v10H5z" />
            </svg>
            <span className="text-lg font-bold tracking-widest uppercase">Zeocrop Research</span>
          </div>

          {/* Main Copy */}
          <div className="max-w-md mt-10">
            <h1 className="text-4xl xl:text-5xl font-bold leading-[1.1] mb-6">
              Precision Agriculture <br />
              <span className="text-[#34d399]">Powered by Living Data.</span>
            </h1>
            <p className="text-gray-300 text-sm xl:text-base leading-relaxed mb-10">
              Access the world's most advanced satellite insight platform. 
              Monitor soil moisture, crop health, and atmospheric conditions in 
              real-time with our neural processing engine.
            </p>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0c3929]/80 backdrop-blur-sm p-4 rounded-xl border border-white/5">
                <svg className="w-6 h-6 text-[#34d399] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                </svg>
                <h3 className="font-semibold text-sm mb-1">Orbital Monitoring</h3>
                <p className="text-gray-400 text-xs">15-minute resolution hyperspectral imagery.</p>
              </div>
              <div className="bg-[#0c3929]/80 backdrop-blur-sm p-4 rounded-xl border border-white/5">
                <svg className="w-6 h-6 text-[#34d399] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                <h3 className="font-semibold text-sm mb-1">Crop AI Engine</h3>
                <p className="text-gray-400 text-xs">Predictive analytics for seasonal yield forecasting.</p>
              </div>
            </div>
          </div>

          {/* Footer Social Proof */}
          <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
            <div className="flex -space-x-2">
              <img className="w-6 h-6 rounded-full border border-[#072a1e]" src="https://i.pravatar.cc/100?img=11" alt="user" />
              <img className="w-6 h-6 rounded-full border border-[#072a1e]" src="https://i.pravatar.cc/100?img=32" alt="user" />
              <img className="w-6 h-6 rounded-full border border-[#072a1e]" src="https://i.pravatar.cc/100?img=12" alt="user" />
            </div>
            <p>Joined by 2,400+ researchers worldwide</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form Container */}
      <div className="relative flex w-full lg:w-1/2 flex-col items-center justify-center p-6 sm:p-12">
        
        {/* Floating Security Badge */}
        

        {/* Form Card */}
        <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 xl:p-10">
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1.5">Welcome Back</h2>
            <p className="text-sm text-gray-500">Enter your credentials to access the laboratory.</p>
          </div>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            
            {/* Role Toggle */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-gray-700 tracking-wider uppercase">Login As</label>
              <div className="grid grid-cols-3 gap-3">
                {['Researcher', 'Admin', 'Student'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`flex flex-col items-center justify-center py-3 rounded-xl border text-[11px] cursor-pointer font-semibold transition-all ${
                      role === r 
                        ? 'border-[#072a1e] bg-[#f2fcf6] text-[#072a1e] shadow-sm' 
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {/* Tiny icon mock based on role */}
                    <div className="mb-1.5 opacity-80">
                      {r === 'Researcher' && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.5 20.25h-15a.75.75 0 01-.58-.29l-3-4.5a.75.75 0 01.58-1.16l2.36-.26 1.94-6.32a.75.75 0 01.71-.53h11.98a.75.75 0 01.71.53l1.94 6.32 2.36.26a.75.75 0 01.58 1.16l-3 4.5a.75.75 0 01-.58.29zM15 6V4.5a3 3 0 10-6 0V6"/></svg>}
                      {r === 'Admin' && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a5 5 0 105 5 5 5 0 00-5-5zm0 8a3 3 0 113-3 3 3 0 01-3 3zm9 11v-1a7 7 0 00-7-7h-4a7 7 0 00-7 7v1h2v-1a5 5 0 015-5h4a5 5 0 015 5v1z"/></svg>}
                      {r === 'Student' && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72l5 2.73 5-2.73v3.72z"/></svg>}
                    </div>
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-gray-700 tracking-wider uppercase">Email Address</label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                </span>
                <input 
                  type="email" 
                  placeholder="dr.smith@zeocrop.edu"
                  className="w-full bg-[#eef2f6] border-none text-gray-800 text-sm rounded-lg pl-9 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#072a1e] placeholder:text-gray-400 font-medium"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-[11px] font-bold text-gray-700 tracking-wider uppercase">Password</label>
                <a href="#" className="text-[11px] font-bold text-[#072a1e] hover:underline">Forgot Password?</a>
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-gray-400">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                </span>
                <input 
                  type="password" 
                  placeholder="••••••••••••"
                  className="w-full bg-[#eef2f6] border-none text-gray-800 text-sm rounded-lg pl-9 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#072a1e] placeholder:text-gray-400 font-medium"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              className="w-full flex justify-center items-center cursor-pointer gap-2 bg-[#072a1e] text-white rounded-lg py-3.5 mt-2 text-sm font-semibold hover:bg-[#0a3b2a] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#072a1e]"
            >
              Access Research Dashboard 
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center py-4">
              <div className="absolute inset-x-0 h-px bg-gray-200"></div>
              <span className="relative bg-white px-4 text-[10px] font-bold text-gray-400 tracking-widest uppercase">Or continue with</span>
            </div>

            {/* SSO Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button type="button" className="flex items-center justify-center cursor-pointer gap-2 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="text-xs font-semibold text-gray-700">Google</span>
              </button>
              <button type="button" className="flex items-center justify-center cursor-pointer gap-2 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3L1 9l11 6 9-4.91V17h2V9M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
                </svg>
                <span className="text-xs font-semibold text-gray-700">University</span>
              </button>
            </div>

            {/* Bottom Link */}
            <div className="text-center pt-2">
              <p className="text-xs text-gray-500 font-medium">
                New to ZeoCrop? <a href="/register" className="text-[#072a1e] font-bold hover:underline">Request researcher access</a>
              </p>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;