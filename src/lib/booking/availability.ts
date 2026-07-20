export function datesOverlap(startA:string,endA:string,startB:string,endB:string){return startA<endB&&endA>startB}
export function bookingHoldExpiry(minutes=30){return new Date(Date.now()+minutes*60_000).toISOString()}
