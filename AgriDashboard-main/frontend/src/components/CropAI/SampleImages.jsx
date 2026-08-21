const sampleImages = [
  "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=400&auto=format&fit=crop",
];

const SampleImages = () => {
  return (
    <div className="bg-[#EEF4FF] rounded-xl p-6">
      <h2 className="font-semibold text-[#111827] mb-5">
        Sample images from the farm
      </h2>

      <div className="grid grid-cols-2 gap-2">
        {sampleImages.map((image, index) => (
          <img
            key={index}
            src={image}
            alt="sample crop"
            className="h-[140px] w-full object-cover rounded-md shadow-md"
          />
        ))}
      </div>
    </div>
  );
};

export default SampleImages;