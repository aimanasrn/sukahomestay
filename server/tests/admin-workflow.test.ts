import { beforeEach, describe, expect, it, vi } from "vitest";

const state=vi.hoisted(()=>({status:"PENDING_APPROVAL",paymentStatus:"NOT_SUBMITTED",paymentDeadline:null as Date|null}));
vi.mock("../src/config/database.js",()=>{
  const tag:any=async(strings:TemplateStringsArray,...values:any[])=>{
    const q=strings.join("?").replace(/\s+/g," ").toLowerCase();
    if(q.includes("set status='awaiting_payment'")){state.status="AWAITING_PAYMENT";state.paymentDeadline=values.at(-2) instanceof Date?values.at(-2):new Date();return[];}
    if(q.includes("set status='confirmed'")){state.status="CONFIRMED";return[];}
    if(q.includes("set verification_status='verified'")){state.paymentStatus="VERIFIED";return[];}
    if(q.includes("insert into public.audit_logs"))return[];
    return[];
  };
  tag.begin=(callback:(tx:any)=>Promise<unknown>)=>callback(tag);tag.json=(v:unknown)=>v;
  return{sql:tag};
});
vi.mock("../src/services/settings.service.js",()=>({getReservationSettings:async()=>({whatsappNumber:"60123456789",bankName:"Bank",bankAccountName:"SUKA",bankAccountNumber:"123",duitNowId:"",pendingApprovalHours:2,paymentDeadlineHours:24,depositPercentage:100,fullPaymentRequired:true,checkInTime:"15:00",checkOutTime:"11:00",cancellationPolicy:"Policy",templates:{approved:"Hello {customerName}, booking {bookingReference} is approved. Pay by {paymentDeadline}.",confirmed:"Hello {customerName}, booking {bookingReference} is confirmed for {paidAmount}.",rejected:"Hello {customerName}, booking {bookingReference} was rejected: {rejectionReason}."}})}));
vi.mock("../src/services/booking.service.js",()=>({loadBooking:async()=>({id:"b1",reference:"SUKA-20260904-TEST",status:state.status,checkIn:new Date("2026-10-01"),checkOut:new Date("2026-10-03"),totalSen:20000,property:{name:"Alam Villa"},guests:[{fullName:"Aiman",phone:"60111111111"}],items:[],payments:state.paymentStatus==="NOT_SUBMITTED"?[]:[{id:"p1",verificationStatus:state.paymentStatus,amountSen:20000}],paymentDeadline:state.paymentDeadline})}));

import { approve, verifyPayment } from "../src/services/admin-booking.service.js";
describe("admin manual-payment workflow",()=>{
  beforeEach(()=>{state.status="PENDING_APPROVAL";state.paymentStatus="NOT_SUBMITTED";state.paymentDeadline=null;});
  it("approval moves a pending reservation to awaiting payment",async()=>{const result=await approve("b1","10000000-0000-4000-8000-000000000003");expect(state.status).toBe("AWAITING_PAYMENT");expect(result.whatsappUrl).toContain("wa.me");});
  it("payment verification confirms the booking",async()=>{state.status="PAYMENT_SUBMITTED";state.paymentStatus="PENDING_VERIFICATION";const result=await verifyPayment("b1","10000000-0000-4000-8000-000000000003");expect(state.paymentStatus).toBe("VERIFIED");expect(state.status).toBe("CONFIRMED");expect(result.booking.status).toBe("CONFIRMED");});
});
