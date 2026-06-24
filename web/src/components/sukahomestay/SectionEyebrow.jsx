export default function SectionEyebrow({ children, className = "" }) {
  return (
    <p
      className={`text-xs font-semibold uppercase tracking-[0.35em] text-[#7c6b45] ${className}`.trim()}
    >
      {children}
    </p>
  );
}
