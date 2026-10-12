// Pure rules for enabling / disabling a district, city, village or pincode (no DB, no Express).
// Enabling requires every ancestor to be active; the cascade-disable queries live in the factory.

// "District "X" and City "Y"" — the ancestors that are still inactive, in hierarchy order.
const inactiveAncestors = (ancestors, parts, separator) =>
  parts
    .filter(([flag]) => !ancestors[flag])
    .map(([, label, name]) => `${label} "${ancestors[name]}"`)
    .join(separator);

export const TOGGLE_LEVELS = {
  district: {
    notFound: "District not found",
    // A district has no parents: it can always be enabled.
    ancestorsActive: null,
    enableBlockedMessage: null,
  },
  city: {
    notFound: "City not found",
    ancestorsActive: (a) => a.district_active,
    enableBlockedMessage: (a) =>
      `Cannot enable city. Please enable the parent District "${a.district_name}" first.`,
  },
  village: {
    notFound: "Village not found",
    ancestorsActive: (a) => a.district_active && a.city_active,
    enableBlockedMessage: (a) =>
      `Cannot enable village. Please enable the parent ${inactiveAncestors(
        a,
        [
          ["district_active", "District", "district_name"],
          ["city_active", "City", "city_name"],
        ],
        " and ",
      )} first.`,
  },
  pincode: {
    notFound: "Pincode not found",
    ancestorsActive: (a) => a.district_active && a.city_active && a.village_active,
    enableBlockedMessage: (a) =>
      `Cannot enable pincode. Please enable the parent ${inactiveAncestors(
        a,
        [
          ["district_active", "District", "district_name"],
          ["city_active", "City", "city_name"],
          ["village_active", "Village", "village_name"],
        ],
        ", ",
      )} first.`,
  },
};
