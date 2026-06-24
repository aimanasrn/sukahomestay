import { Reveal, StaggerGroup } from "@/components/sukahomestay/MotionReveal";

export default function PublicPageHero({ title, description, badge, actions }) {
  return (
    <Reveal
      as="section"
      className="overflow-hidden rounded-[2rem] border border-[#edf1f6] bg-[linear-gradient(135deg,#ffffff_0%,#fff6ef_100%)] p-8 shadow-[0_18px_50px_rgba(15,23,42,0.06)] lg:p-10"
    >
      <div className="flex flex-wrap items-end justify-between gap-6">
        <StaggerGroup className="max-w-3xl space-y-4" stagger={0.08}>
          {badge ? (
            <Reveal className="inline-flex rounded-full bg-[#fff1e8] px-4 py-2 text-sm font-semibold text-[#ff7a1a]" distance={16}>
              {badge}
            </Reveal>
          ) : null}
          <div className="space-y-3">
            <Reveal as="h1" className="text-4xl font-semibold leading-tight tracking-[-0.03em] text-[#16213e] lg:text-5xl" distance={20}>
              {title}
            </Reveal>
            <Reveal as="p" className="max-w-2xl text-lg leading-8 text-[#667085]" distance={20} delay={0.04}>
              {description}
            </Reveal>
          </div>
        </StaggerGroup>
        {actions ? (
          <Reveal className="flex flex-wrap gap-3" delay={0.08} distance={20}>
            {actions}
          </Reveal>
        ) : null}
      </div>
    </Reveal>
  );
}
