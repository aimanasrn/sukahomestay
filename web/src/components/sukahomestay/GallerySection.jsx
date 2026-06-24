import landingContent from "@/constant/sukahomestayLandingContent";
import SectionEyebrow from "@/components/sukahomestay/SectionEyebrow";

const galleryBlocks = [
  "min-h-[320px] rounded-[2rem] bg-[linear-gradient(180deg,#ece4d6,#cfbea3)]",
  "min-h-[200px] rounded-[2rem] bg-[linear-gradient(180deg,#f8f4ec,#e2d7c4)]",
  "min-h-[200px] rounded-[2rem] bg-[linear-gradient(180deg,#d8ccb4,#a9997b)]",
];

export default function GallerySection() {
  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <SectionEyebrow>{landingContent.gallery.eyebrow}</SectionEyebrow>
        <h2 className="font-serif text-4xl leading-tight text-[#2f2c26] lg:text-5xl">
          {landingContent.gallery.title}
        </h2>
      </div>
      <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
        <div className={galleryBlocks[0]} />
        <div className="grid gap-6">
          <div className={galleryBlocks[1]} />
          <div className={galleryBlocks[2]} />
        </div>
      </div>
    </section>
  );
}
