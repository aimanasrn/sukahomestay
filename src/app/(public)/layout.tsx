import { SiteHeader } from "@/components/site-header";
export default function PublicLayout({children}:{children:React.ReactNode}){return <><SiteHeader/><main id="content">{children}</main><footer className="footer"><div className="shell"><h2>SukaHomestay</h2><p>Stay Comfortable. Feel at Home.</p><p>Direct booking for families, groups and simple getaways.</p></div></footer></>}
