import { AlertTriangle, Download, Eye, FlaskConical, Leaf, ShoppingBag, Tag } from "lucide-react";
import { translations } from "../../utils/translations";

export default function AIResult({ report, lang, productRecommendations }) {
  const t = translations[lang];

  const handleDownloadPDF = () => {
    const report = document.getElementById("crop-report");
    if (!report) return;

    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
    <html>
      <head>
        <title>Crop Analysis Report</title>

        <!-- Tailwind CDN (print-only) -->
        <script src="https://cdn.tailwindcss.com"></script>

        <style>
          body {
            background: #f9fafb;
            padding: 12px;
            font-family: system-ui, -apple-system, BlinkMacSystemFont;
          }

          @page {
            size: A4;
            margin: 16mm;
          }
        </style>
      </head>
      <body>
        ${report.outerHTML}
      </body>
    </html>
  `);

    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };

  return (
    <div id="crop-report" className="mt-6 flex flex-col gap-6">
      {/* Crop Overview */}
      <div className="flex items-start justify-between bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            {report.cropIdentification?.cropName || t.unknown}
          </h3>
          <p className="text-sm text-gray-600">
            {t.growthStage}: {report.cropIdentification?.growthStage || t.na}
          </p>
        </div>

        <div className="flex !md:flex-col items-center gap-3">
          <span className="md:px-3 py-1 px-2 rounded-full text-xs bg-blue-100 text-blue-700 whitespace-nowrap">
            {t.confidence}:{" "}
            {report.cropIdentification?.confidenceLevel || t.unknown}
          </span>

          {/* Download Button */}
          <button
            onClick={() => handleDownloadPDF()}
            className="inline-flex items-center gap-2 md:px-4 px-2 md:py-2 py-1 text-sm font-semibold cursor-pointer text-white bg-green-600 rounded-lg shadow-sm hover:bg-green-700 active:scale-95 transition"
          >
            <Download className="w-4 h-4" /> Download
          </button>
        </div>
      </div>

      {/* Health Status */}
      <div className="bg-red-50 border border-red-300 rounded-xl p-4 space-y-2">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="bg-red-100 p-2 rounded-2xl">
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>

          <h4 className="font-bold text-red-700">{t.healthStatus}</h4>
        </div>

        {/* Main Status */}
        <p className="text-xl font-bold text-red-500">
          {report.currentHealthStatus?.overallStatus || t.unknown}
        </p>

        {/* Severity */}
        <p className="text-sm text-red-700/80">
          {t.severity}:{" "}
          <span className="font-semibold">
            {report.visibleSymptoms?.severity || t.na}
          </span>
        </p>
      </div>

      {/* Visible Symptoms */}
      {report.visibleSymptoms?.symptoms?.length > 0 && (
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-2xl">
              <Eye className="w-4 h-4 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-800 mb-2">
              {t.visibleSymptoms}
            </h4>
          </div>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            {report.visibleSymptoms.symptoms.map((symptom, idx) => (
              <li key={idx}>{symptom}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Disease Diagnosis */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
        <h4 className="font-bold text-gray-800 mb-2">{t.diseaseDiagnosis}</h4>

        <p className="text-xs font-semibold text-gray-700">
          {t.primary}:{" "}
          <span className="text-sm font-bold">
            {" "}
            {report.diagnosis?.primaryIssue?.name || t.unknown}
          </span>
        </p>

        {report.diagnosis?.secondaryPossibilities?.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-2">
            {report.diagnosis.secondaryPossibilities.map((d, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-full text-xs border
                bg-amber-100 text-amber-800"
              >
                {d.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Treatment */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Chemical Treatment */}
        <div className="bg-red-50 border border-red-300 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-2xl">
              <FlaskConical className="w-4 h-4 text-red-700" />
            </div>

            <h4 className="font-semibold text-red-700 leading-none">
              {t.chemicalTreatment}
            </h4>
          </div>

          {report.treatmentPlan?.chemicalTreatment?.length > 0 ? (
            report.treatmentPlan.chemicalTreatment.map((chem, idx) => (
              <p key={idx} className="text-sm text-gray-700 mb-2">
                <strong>{chem.productName}</strong>
                <br />
                Dose: {chem.dosage}
                <br />
                Method: {chem.applicationMethod}
              </p>
            ))
          ) : (
            <p className="text-sm text-gray-500">{t.noChemical}</p>
          )}
        </div>

        {/* Organic Alternatives */}
        <div className="bg-green-50 border border-green-300 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-2xl">
              <Leaf className="w-4 h-4 text-green-700" />
            </div>

            <h4 className="font-semibold text-green-700 mb-2">
              {t.organicAlternatives}
            </h4>
          </div>

          {report.treatmentPlan?.organicAlternatives?.length > 0 ? (
            <ul className="list-disc list-inside text-sm text-gray-700">
              {report.treatmentPlan.organicAlternatives.map((item, idx) => (
                <li key={idx}>{item.name}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">{t.noOrganic}</p>
          )}
        </div>
      </div>

      {/* Action Plan */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
        <h4 className="font-semibold text-gray-800 mb-3">
          {t.farmerActionPlan}
        </h4>

        <ActionList
          title={t.today}
          items={report.farmerActionPlan?.today}
          color="green"
        />
        <ActionList
          title={t.thisWeek}
          items={report.farmerActionPlan?.thisWeek}
          color="amber"
        />
        <ActionList
          title={t.nextSeason}
          items={report.farmerActionPlan?.nextSeason}
          color="blue"
          isLast
        />
      </div>

      {/* Recommended Products */}
      {productRecommendations && (
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-100 p-2 rounded-2xl">
              <ShoppingBag className="w-4 h-4 text-purple-700" />
            </div>
            <h4 className="font-semibold text-gray-800">
              {t.recommendedProducts}
            </h4>
          </div>

          {productRecommendations.products?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {productRecommendations.products.map((product) => (
                <div
                  key={product.id}
                  className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Product Image */}
                  <div className="h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.product_name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.src = "";
                        e.target.parentElement.innerHTML =
                          '<div class="flex items-center justify-center h-full text-gray-400 text-sm">No Image</div>';
                      }}
                    />
                  </div>

                  {/* Product Info */}
                  <div className="p-3 space-y-2">
                    <h5 className="font-semibold text-gray-800 text-sm">
                      {product.product_name}
                    </h5>

                    <p className="text-xs text-gray-500 line-clamp-2">
                      {product.description}
                    </p>

                    {/* Brand & Category */}
                    <div className="flex flex-wrap gap-1">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700">
                        {t.brand}: {product.brand_name}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                        {product.category_name}
                      </span>
                    </div>

                    {/* Chemical Composition */}
                    {product.chemical_composition?.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-gray-500">
                          {t.composition}:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {product.chemical_composition.map((chem, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-full text-xs bg-green-50 text-green-700 border border-green-200"
                            >
                              {chem.name} {chem.value ? `${chem.value}%` : ""} {chem.formulation || ""}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Disease Names */}
                    {product.disease_names?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {product.disease_names.map((disease, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-full text-xs bg-red-50 text-red-600 border border-red-200"
                          >
                            {disease}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Match Type Badge */}
                    <div className="flex items-center gap-1 pt-1">
                      <Tag className="w-3 h-3 text-purple-500" />
                      <span className="text-xs text-purple-600 capitalize">
                        {product.match_type?.replace("_", " ")} match
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">{t.noProducts}</p>
          )}
        </div>
      )}
    </div>
  );
}

function ActionList({ title, items, color, isLast }) {
  if (!items?.length) return null;

  const colorMap = {
    green: "bg-green-500",
    amber: "bg-amber-400",
    blue: "bg-blue-400",
  };

  return (
    <div className="flex gap-4 relative">
      {/* Timeline */}
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full ${colorMap[color]}`} />
        {!isLast && <div className="w-px flex-1 bg-gray-300 mt-1" />}
      </div>

      {/* Content */}
      <div className="pb-6">
        <p className="text-sm font-semibold text-gray-500 uppercase">{title}</p>

        {items.map((a, i) => (
          <div key={i} className="mt-1">
            <p className="text-sm text-gray-600">{a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
