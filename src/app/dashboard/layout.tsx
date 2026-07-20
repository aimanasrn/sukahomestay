"use client";
import "./dashboard.css";
import "./drawer-fix.css";
import Link from "next/link";
import { LogOut, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
const links=["Overview","Bookings","Payments","Profile","Reviews"];
export default function DashboardLayout({children}:{children:React.ReactNode}){const router=useRouter(),[open,setOpen]=useState(false);useEffect(()=>{const close=(event:KeyboardEvent)=>event.key==="Escape"&&setOpen(false);window.addEventListener("keydown",close);return()=>window.removeEventListener("keydown",close)},[]);async function signOut(){await createClient().auth.signOut();router.push("/");router.refresh()}const nav=<nav aria-label="Customer navigation">{links.map(x=><Link key={x} onClick={()=>setOpen(false)} href={x==="Overview"?"/dashboard":`/dashboard/${x.toLowerCase()}`}>{x}</Link>)}</nav>;return <div className="dash customer-shell"><aside className="side customer-side"><strong>SukaHomestay</strong>{nav}<button className="customer-signout" onClick={signOut}><LogOut size={17}/> Sign out</button></aside><main className="main customer-main"><div className="customer-mobile-bar"><strong>SukaHomestay</strong><button className="customer-menu" aria-label="Open account menu" onClick={()=>setOpen(true)}><Menu size={21}/></button></div>{children}</main>{open&&<button className="customer-backdrop" aria-label="Close menu" onClick={()=>setOpen(false)}/>}<aside className={`customer-drawer ${open?"open":""}`}><div className="customer-drawer-head"><strong>My account</strong><button aria-label="Close menu" onClick={()=>setOpen(false)}><X size={21}/></button></div>{nav}<button className="customer-signout" onClick={signOut}><LogOut size={17}/> Sign out</button></aside></div>}
