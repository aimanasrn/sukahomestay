import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/Icon";
import { usePublicI18n } from "@/i18n/publicI18n";

export default function LanguageFloatingButton() {
  const { language, setLanguage, messages } = usePublicI18n();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    function handlePointerDown(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handlePointerDown);
    }

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isOpen]);

  return (
    <div className="fixed bottom-6 right-6 z-[60] h-14 w-14" ref={panelRef}>
      {isOpen ? (
        <div className="absolute bottom-[calc(100%+12px)] right-0 w-[220px] rounded-[1.5rem] border border-[#ffd9bd] bg-white p-4 shadow-[0_24px_60px_rgba(15,23,42,0.14)]">
          <p className="text-sm font-semibold text-[#16213e]">
            {messages.languageSwitch.settings}
          </p>
          <p className="mt-1 text-xs leading-6 text-[#667085]">
            {messages.languageSwitch.chooseLanguage}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {["ms", "en"].map((item) => (
              <button
                key={item}
                className={`rounded-full px-4 py-3 text-sm font-semibold transition ${
                  language === item
                    ? "bg-[#ff7a1a] text-white"
                    : "border border-[#eef1f6] bg-[#fff8f3] text-[#16213e] hover:border-[#ffb98a]"
                }`}
                onClick={() => {
                  setLanguage(item);
                  setIsOpen(false);
                }}
                type="button"
              >
                {item === "ms"
                  ? messages.languageSwitch.bm
                  : messages.languageSwitch.en}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <button
        aria-label={messages.languageSwitch.settings}
        className="absolute bottom-0 right-0 flex h-14 w-14 items-center justify-center rounded-full bg-[#16213e] text-white shadow-[0_18px_40px_rgba(22,33,62,0.28)] transition hover:bg-[#0f172a]"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <Icon
          className="animate-spin text-[22px] [animation-duration:3s]"
          icon="heroicons:cog-6-tooth-solid"
        />
      </button>
    </div>
  );
}
