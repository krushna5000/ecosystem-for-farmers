import { Camera, UploadCloud } from "lucide-react";

const UploadCropImage = ({ uploadedImage }) => {
  return (
    <div className="bg-white rounded-xl px-4 py-6 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <UploadCloud size={17} className="text-[#0B5D3B]" />

        <h2 className="font-semibold text-[#111827]">
          Upload Crop Image
        </h2>
      </div>

      <label
        className="h-[320px] border-2 border-dashed border-[#B7C0BA] p-2 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#F8FAF9] transition overflow-hidden"
      >
        {uploadedImage ? (
          <img
            src={uploadedImage}
            alt="uploaded crop"
            className="w-full h-full object-cover rounded-xl shadow-md"
          />
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-[#CDEEDB] flex items-center justify-center mb-4">
              <Camera size={26} className="text-[#0B5D3B]" />
            </div>

            <p className="text-[17px] font-semibold text-[#111827]">
              Drop raw field photography here
            </p>

            <p className="text-sm text-[#64748B] mt-2 max-w-[220px]">
              Supports RAW, JPEG, PNG Max 25MB
            </p>

            <span className="mt-5 px-5 py-2 rounded-full bg-[#0B5D3B] text-white text-sm font-semibold">
              Select File
            </span>
          </>
        )}

        <input type="file" className="hidden" />
      </label>
    </div>
  );
};

export default UploadCropImage;