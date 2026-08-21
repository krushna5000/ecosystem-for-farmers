export const cropAiResponse = {
  user_id: 8,
  diagnosisData: {
    cropIdentification: {
      cropName: "Tomato",
      growthStage: "Vegetative",
      confidenceLevel: "high",
    },

    visibleSymptoms: {
      severity: "critical",
      symptoms: [
        "stem lesion at soil line",
        "rotting of stem tissue",
        "girdling of stem",
        "exposed inner stem tissue",
        "discolored stem tissue (brownish-whitish)",
      ],
      affectedParts: ["stem", "whole plant"],
    },

    diagnosis: {
      primaryIssue: {
        name: "Collar Rot / Stem Rot",
        type: "fungal",
        scientificName: "Rhizoctonia solani",
        confidence: "high",
      },
    },

    treatmentPlan: {
      chemicalTreatment: [
        {
          productName: "Azoxystrobin + Difenoconazole",
          activeIngredient: "Azoxystrobin, Difenoconazole",
          dosage:
            "Refer to product label for specific rates, typically applied as a drench.",
          applicationMethod: "soil drench",
        },
      ],

      organicAlternatives: [
        {
          name: "Trichoderma-based biofungicides",
          usage:
            "Apply as a soil drench around the base of affected and surrounding plants.",
        },
      ],
    },

    farmerActionPlan: {
      today: [
        "Immediately remove the affected plant and dispose of it away from the growing area.",
        "Inspect nearby plants for similar symptoms at the stem base.",
        "Avoid disturbing soil around healthy plants.",
      ],

      thisWeek: [
        "Apply recommended fungicide as a preventive soil drench.",
        "Adjust irrigation practices to keep stem bases drier.",
        "Improve soil drainage around existing plants.",
      ],

      nextSeason: [
        "Implement strict crop rotation.",
        "Select disease-resistant varieties if available.",
        "Apply preventative biofungicides at planting time.",
      ],
    },
  },

  imageUrl:
    "https://backend-krushna-farmseasy.s3.ap-south-1.amazonaws.com/backend-krushna-farmseasy/crop_ai/76d562a8dd819c838d398191e573296503c1ecea2fbd61e16c1d02514d84a987-1778236348382.jpg",

  imageHash:
    "76d562a8dd819c838d398191e573296503c1ecea2fbd61e16c1d02514d84a987",
};

export const recommendedProducts = [
  {
    id: 1,
    name: "Tricho Shield Biofungicide",
    category: "Organic Biofungicide",
    description:
      "Trichoderma-based soil treatment useful for suppressing soil-borne fungal pathogens.",
    dosage: "2-4 g/L",
    usageType: "Soil drench",
    matchScore: 96,
    image:
      "https://images.unsplash.com/photo-1584306670957-acf935f5033c?q=80&w=500&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Azoxy-Difen Fungicide",
    category: "Chemical Fungicide",
    description:
      "Systemic fungicide combination suitable for fungal stem and root disease management.",
    dosage: "Label based",
    usageType: "Drench",
    matchScore: 91,
    image:
      "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?q=80&w=500&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Copper Hydroxide 53.8%",
    category: "Broad Spectrum Fungicide",
    description:
      "Copper-based fungicide option for preventive fungal and bacterial disease control.",
    dosage: "Label based",
    usageType: "Stem base",
    matchScore: 84,
    image:
      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=500&auto=format&fit=crop",
  },
];