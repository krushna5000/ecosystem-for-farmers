import { z } from "zod";

// Messages are the legacy API texts — clients display them as-is.
const polygonMessage = "Invalid polygon: minimum 3 coordinates required";
const pointMessage = "Each coordinate must have numeric lat and lon";
const areaMessage = "Invalid area";

// Validates a drawn farm polygon (Farmonaut-ready payload). Checks run in the legacy order:
// polygon size, then each point, then the area — zod reports the first issue it meets.
export const farmBoundarySchema = z
  .object(
    {
      coordinates: z
        .array(z.any(), { required_error: polygonMessage, invalid_type_error: polygonMessage })
        .min(3, polygonMessage)
        .superRefine((points, ctx) => {
          if (points.some((point) => typeof point?.lat !== "number" || typeof point?.lon !== "number")) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: pointMessage });
          }
        }),
      area_hectares: z
        .number({ required_error: areaMessage, invalid_type_error: areaMessage })
        .positive(areaMessage),
    },
    { required_error: polygonMessage, invalid_type_error: polygonMessage },
  )
  .passthrough();
