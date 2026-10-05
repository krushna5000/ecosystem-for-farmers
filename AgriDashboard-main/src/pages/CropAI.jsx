import CropAIHeader from "../components/CropAI/CropAIHeader";
import UploadCropImage from "../components/CropAI/UploadCropImage";
import SampleImages from "../components/CropAI/SampleImages";
import AIReportCard from "../components/CropAI/AIReportCard";
import ProductRecommendations from "../components/CropAI/ProductRecommendations";

import {
  cropAiResponse,
  recommendedProducts,
} from "../utils/data/cropAiMockData";

const CropAI = () => {
  const diagnosisData = cropAiResponse?.diagnosisData || null;
  const imageUrl = cropAiResponse?.imageUrl || null;

  const handleProductInterest = (product) => {
    console.log("Interested product:", product);

    // Later API call:
    // await createLead({
    //   productId: product.id,
    //   userId: cropAiResponse.user_id,
    //   diagnosisId: cropAiResponse.imageHash,
    // });
  };

  return (
    <div className="space-y-8">
      <CropAIHeader />

      <div className="grid grid-cols-12 gap-6">
        {/* LEFT SECTION */}
        <div className="col-span-12 xl:col-span-3 space-y-6">
          <UploadCropImage uploadedImage={imageUrl} />

          <SampleImages />
        </div>

        {/* RIGHT SECTION */}
        <div className="col-span-12 xl:col-span-9 space-y-6">
          <AIReportCard diagnosisData={diagnosisData} />

          <ProductRecommendations
            products={recommendedProducts}
            onInterested={handleProductInterest}
          />
        </div>
      </div>
    </div>
  );
};

export default CropAI;