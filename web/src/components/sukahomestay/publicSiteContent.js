export const trustStats = [
  { value: "4.9/5", label: "guest satisfaction" },
  { value: "24/7", label: "booking assistance" },
  { value: "3 stay modes", label: "for families and groups" },
  { value: "Direct booking", label: "without marketplace friction" },
];

export const facilities = [
  "Private parking",
  "Fast Wi-Fi",
  "Air-conditioned rooms",
  "Family dining area",
  "Self check-in support",
  "Clean linen and essentials",
];

export const whyChooseUs = [
  {
    title: "Calendar-first booking",
    description:
      "Guests can see open dates first, then move into booking without guessing availability.",
  },
  {
    title: "Flexible stay options",
    description:
      "Book a full homestay, a roomstay unit, or the whole house depending on your group size.",
  },
  {
    title: "Direct local support",
    description:
      "WhatsApp support keeps the conversation simple from first question to final confirmation.",
  },
];

export const nearbyAttractions = [
  {
    title: "Town centre cafes",
    description: "Easy breakfast stops, coffee spots, and casual meals within a short drive.",
    distance: "8 minutes away",
  },
  {
    title: "Family recreation park",
    description: "Open green space for kids, evening walks, and relaxed outdoor time.",
    distance: "12 minutes away",
  },
  {
    title: "Local food street",
    description: "Popular evening dining area with local favourites and simple late-night options.",
    distance: "15 minutes away",
  },
];

export const bookingSteps = [
  "Check the availability calendar.",
  "Choose the stay type that fits your group.",
  "Send the booking request with your selected date.",
  "Confirm directly with the admin on WhatsApp.",
];

export const testimonials = [
  {
    quote:
      "The booking process felt very clear. We checked the calendar first and got confirmation quickly.",
    name: "Aina",
    trip: "Family weekend stay",
  },
  {
    quote:
      "The roomstay option made it easy for a small group. Clean place, smooth communication, no confusion.",
    name: "Firdaus",
    trip: "Friends road trip",
  },
  {
    quote:
      "We booked the whole house and the direct WhatsApp support helped us settle details fast.",
    name: "Nadia",
    trip: "Group gathering",
  },
];

export const faqs = [
  {
    question: "How do I know if my dates are available?",
    answer:
      "Start with the calendar preview or the full calendar page. Blocked dates cannot be selected for booking.",
  },
  {
    question: "Can I book only one room instead of the full property?",
    answer:
      "Yes. The roomstay option is designed for guests who only need a private room instead of the entire homestay.",
  },
  {
    question: "How is the final booking confirmed?",
    answer:
      "After you submit a booking request, the admin reviews the stay details and confirms directly with you.",
  },
];

export const galleryImages = [
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
];

export const contactInfo = {
  whatsapp: "+60 123 456 789",
  whatsappHref: "https://wa.me/60123456789",
  email: "admin@sukahomestay.com",
};

export function formatPrice(value) {
  return `RM ${Number(value || 0)}`;
}

export function toDateKey(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getTomorrowKey() {
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + 1);
  return toDateKey(nextDate);
}
