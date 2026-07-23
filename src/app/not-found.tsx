import Link from "next/link";

export default function NotFound() {
  return (
    <main className="section soft" style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="shell" style={{ textAlign: "center", maxWidth: 480 }}>
        <h1 style={{ fontSize: "3rem", color: "var(--primary)", marginBottom: 8 }}>404</h1>
        <h2 style={{ fontSize: "1.5rem", color: "var(--navy)", marginBottom: 12 }}>Page Not Found</h2>
        <p style={{ color: "var(--muted)", marginBottom: 24 }}>
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link href="/" className="button" style={{ display: "inline-flex" }}>
          Back to Home
        </Link>
      </div>
    </main>
  );
}
