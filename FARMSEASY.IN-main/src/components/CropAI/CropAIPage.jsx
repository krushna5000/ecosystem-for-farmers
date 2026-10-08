import cropAIImage from '../../assets/crop-ai-image.png';

export default function CropAIPage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center px-6 lg:px-20 py-20 bg-gradient-to-br from-black via-[#0b1204] to-[#1b2a08]">
        <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-16 items-center">
          {/* LEFT CONTENT */}
          <div className="space-y-8 z-10">
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-tight tracking-tight">
                AI-Powered Crop
                <br />
                Intelligence For
                <br />
                <span className="text-[#c7ff3d]">Smarter Farming.</span>
              </h1>

              <p className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-xl">
                Upload crop images for instant insights. FarmEasy's advanced
                computer vision models analyze your crops to detect health
                issues, identify growth stages, and provide actionable
                recommendations within seconds.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <a
                href="https://zeocrop.farmseasy.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#c7ff3d] hover:bg-[#d7ff6f] transition-all duration-300 text-black font-semibold px-8 py-4 rounded-full shadow-[0_0_30px_rgba(199,255,61,0.35)]"
              >
                TRY CROP AI
              </a>

              <button className="border border-gray-600 hover:border-[#c7ff3d] hover:text-[#c7ff3d] transition-all duration-300 px-8 py-4 rounded-full text-white font-medium">
                VIEW SAMPLE REPORT
              </button>
            </div>
          </div>

          {/* RIGHT VISUAL */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-[280px] sm:w-[360px] h-[380px] sm:h-[440px] rounded-[32px] bg-gradient-to-br from-[#101010] to-[#1b260b] border border-[#293815] shadow-[0_0_80px_rgba(199,255,61,0.12)] overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(199,255,61,0.15),transparent_60%)] rounded-[32px]" />

              <div className="absolute top-6 left-6 right-6 flex items-center justify-between text-sm text-gray-400 z-10">
                <span className="uppercase tracking-[0.2em]">CROP DETECTED</span>
                <div className="w-3 h-3 rounded-full bg-[#c7ff3d] animate-pulse" />
              </div>

              <div className="absolute top-20 left-6 z-10">
                <h3 className="text-3xl font-bold">Cotton</h3>
                <p className="text-gray-400 italic mt-1">(Gossypium)</p>
              </div>

              <div className="absolute inset-0 flex items-center justify-center pt-20">
                <div className="relative w-[240px] h-[240px] flex items-center justify-center">
                  <div className="absolute w-[220px] h-[220px] rounded-full bg-[#c7ff3d]/20 blur-3xl" />

                  <img
                    src={cropAIImage}
                    alt="Crop Leaf"
                    className="relative z-10 w-full h-full object-contain scale-110 drop-shadow-[0_0_60px_rgba(199,255,61,0.45)]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="px-6 lg:px-20 py-24 bg-[#050505]">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl sm:text-5xl font-bold leading-tight">
            Farmers Need Fast, Clear
            <br />
            Crop Health Answers.
          </h2>

          <p className="text-gray-400 max-w-3xl mx-auto mt-6 text-base sm:text-lg leading-relaxed">
            Traditional scouting is slow and prone to human error. Crop AI
            bridges the gap between observation and action with real-time,
            data-driven intelligence.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mt-16">
            {[
              {
                title: 'Early Identification',
                desc:
                  'Spot pests, diseases, and nutrient deficiencies before they spread across the field.',
                icon: '🔍',
              },
              {
                title: 'Expert Availability',
                desc:
                  'Get AI-powered agronomic insights instantly, anytime and anywhere from your device.',
                icon: '🧠',
              },
              {
                title: 'Yield Action',
                desc:
                  'Transform observations into immediate treatment plans that improve crop productivity.',
                icon: '📈',
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-[#0a0a0a] border border-[#1d1d1d] hover:border-[#c7ff3d]/40 transition-all duration-300 rounded-3xl p-8 text-left"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#c7ff3d]/10 border border-[#c7ff3d]/20 flex items-center justify-center text-2xl mb-6">
                  {item.icon}
                </div>

                <h3 className="text-2xl font-semibold mb-4">{item.title}</h3>

                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WORKFLOW SECTION */}
      <section className="px-6 lg:px-20 py-24 bg-gradient-to-b from-[#060906] to-black">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <span className="text-[#c7ff3d] uppercase tracking-[0.2em] text-sm font-semibold">
              Workflow
            </span>

            <h2 className="text-4xl sm:text-5xl font-bold mt-4">
              How Crop AI Works.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                number: '01',
                title: 'Upload Image',
                desc:
                  'Capture and upload a clear image of the affected crop area directly from your smartphone.',
              },
              {
                number: '02',
                title: 'AI Analysis',
                desc:
                  'Deep learning models compare the image against millions of agricultural reference patterns.',
              },
              {
                number: '03',
                title: 'Detect Diagnosis',
                desc:
                  'The system identifies diseases, pests, and nutrient deficiencies with high confidence.',
              },
              {
                number: '04',
                title: 'Actionable Recommendation',
                desc:
                  'Receive treatment recommendations and preventive measures tailored to your crop condition.',
                action: true,
              },
            ].map((step, index) => (
              <div
                key={index}
                className={`rounded-3xl border p-8 min-h-[260px] flex flex-col justify-between transition-all duration-300 ${
                  step.action
                    ? 'bg-gradient-to-br from-[#161f09] to-[#0c1005] border-[#425d17]'
                    : 'bg-[#080808] border-[#1b1b1b] hover:border-[#2b3c13]'
                }`}
              >
                <div>
                  <span className="text-5xl font-extrabold text-[#c7ff3d] opacity-90">
                    {step.number}
                  </span>

                  <h3 className="text-2xl font-semibold mt-6 mb-4">
                    {step.title}
                  </h3>

                  <p className="text-gray-400 leading-relaxed max-w-md">
                    {step.desc}
                  </p>
                </div>

                {step.action && (
                  <div className="mt-8">
                    <button className="bg-[#c7ff3d] text-black font-semibold px-6 py-3 rounded-full hover:bg-[#d7ff6f] transition-all duration-300">
                      VIEW EXAMPLE ACTION PLAN
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
