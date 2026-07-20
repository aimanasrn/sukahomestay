export type UnitType = "homestay" | "roomstay" | "whole_house";
export type BookingStatus = "pending" | "awaiting_payment" | "payment_review" | "confirmed" | "checked_in" | "completed" | "cancelled" | "rejected" | "expired";
export interface Unit { id: string; slug: string; name: string; type: UnitType; shortDescription: string; bedrooms: number; bathrooms: number; maximumGuests: number; basePrice: number; image: string; amenities: string[]; }
export interface Booking { id: string; bookingNumber: string; unitName: string; checkIn: string; checkOut: string; guests: number; total: number; status: BookingStatus; paymentStatus: string; }
