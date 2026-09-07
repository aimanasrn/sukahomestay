import type { Catalog } from "./domain";
export const demoCatalog: Catalog = {
  accommodations: [
    {
      id: "MAIN",
      bedrooms: 4,
      bathrooms: 3,
      capacity: null,
      rate: 45000,
      weekend_rate: null,
      addon_rate: null,
      amenities: ["living", "dining", "kitchen"],
      description: {
        ms: "Empat bilik tidur dan tiga bilik air, dengan ruang tamu, ruang makan dan dapur untuk masa bersama.",
        en: "Four bedrooms and three bathrooms, with a living room, dining area, and kitchen for time together.",
      },
      photos: [],
    },
    ...(["ROOM_A", "ROOM_B", "ROOM_C"] as const).map((id) => ({
      id,
      bedrooms: 1,
      bathrooms: 1,
      capacity: null,
      rate: 15000,
      weekend_rate: null,
      addon_rate: 12000,
      amenities: [],
      description: {
        ms: "Unit penginapan gaya studio yang boleh ditempah secara berasingan. Satu bilik tidur dan satu bilik air.",
        en: "An independently bookable studio-style accommodation. One bedroom and one bathroom.",
      },
      photos: [],
    })),
    {
      id: "WHOLE",
      bedrooms: 7,
      bathrooms: 6,
      capacity: null,
      rate: 80000,
      weekend_rate: null,
      addon_rate: null,
      amenities: ["living", "dining", "kitchen"],
      description: {
        ms: "Homestay utama dan semua tiga roomstay dalam satu tempahan. Tujuh bilik tidur dan enam bilik air untuk bersama.",
        en: "The main homestay and all three roomstays in one reservation. Seven bedrooms and six bathrooms to bring everyone together.",
      },
      photos: [],
    },
  ],
  settings: {
    whatsapp: "",
    address: "",
    map_url: "",
    contact_email: "",
    check_in: "",
    check_out: "",
    policies: { ms: "", en: "" },
    rules: { ms: "", en: "" },
    cleaning_fee: 0,
    deposit_percent: 0,
    hold_minutes: 120,
    booking_enabled: false,
    demo_rates: true,
    policy_version: "1",
  },
  rate_rules: [],
};
export const imageFor = (id: string) =>
  id.startsWith("ROOM") ? "/images/bedroom.webp" : "/images/courtyard.webp";
