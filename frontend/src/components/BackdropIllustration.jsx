export default function BackdropIllustration({ src, className = "", side = "right", testid }) {
  return (
    <div
      className={`pointer-events-none absolute inset-y-0 ${side === "right" ? "right-0" : "left-0"} w-[58%] sm:w-[46%] lg:w-[38%] overflow-hidden select-none ${className}`}
      aria-hidden="true"
      data-testid={testid}
    >
      <img
        src={src}
        alt=""
        loading="lazy"
        className="h-full w-full object-contain object-bottom opacity-[0.09] mix-blend-multiply"
        style={{
          maskImage: `linear-gradient(to ${side === "right" ? "left" : "right"}, black 55%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 25%, black 80%, transparent 100%)`,
          WebkitMaskImage: `linear-gradient(to ${side === "right" ? "left" : "right"}, black 55%, transparent 100%)`,
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
      />
    </div>
  );
}
