export default function CropCard({ img, name, category, stage, sowingDate }) {
  return (
    <div className="rounded-xl overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg hover:bg-white/20 transition cursor-pointer flex flex-col">
      {/* Image */}
      <img src={img} alt={name} className="w-full h-40 object-cover" />

      {/* Content */}
      <div className="p-4 flex flex-col gap-3">
        {/* Name + Category */}
        <div>
          <h3 className="text-white text-lg font-semibold">{name}</h3>
          <p className="text-sm text-white/70">{category}</p>
        </div>

        {/* Stage (left) + Sowing Date (right) */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-white/80">{stage}</span>
          <span className="text-white/60">{sowingDate}</span>
        </div>
      </div>
    </div>
  );
}
