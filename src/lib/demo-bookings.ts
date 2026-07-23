"use client";
export type LocalBooking={id:string;name:string;phone:string;email:string;unit:string;checkIn:string;checkOut:string;guests:number;payment:"deposit"|"full";status:"awaiting_payment"|"payment_review"|"confirmed"|"cancelled";createdAt:string};
const key="sukahomestay-bookings";
export function readBookings():LocalBooking[]{if(typeof window==="undefined")return [];try{localStorage.removeItem(key);return []}catch{return []}}
export function saveBooking(booking:LocalBooking){if(typeof window!=="undefined"){localStorage.removeItem(key);}}
export function updateBooking(id:string,status:LocalBooking["status"]){if(typeof window!=="undefined"){localStorage.removeItem(key);}}
export function lockedDates(bookings:LocalBooking[]){const dates=new Set<string>(),format=(date:Date)=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;bookings.filter(b=>b.status==="confirmed").forEach(b=>{const current=new Date(`${b.checkIn}T00:00:00`),end=new Date(`${b.checkOut}T00:00:00`);while(current<end){dates.add(format(current));current.setDate(current.getDate()+1)}});return dates}
export function whatsappUrl(message:string){const number=(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER||"60123456789").replace(/\D/g,"");return `https://wa.me/${number}?text=${encodeURIComponent(message)}`}
