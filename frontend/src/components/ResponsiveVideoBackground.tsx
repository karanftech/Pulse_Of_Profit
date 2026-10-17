export default function ResponsiveVideoBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#050505]">
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="hidden h-full w-full object-cover md:block"
      >
        <source src="/desktop_background.mp4" type="video/mp4" />
      </video>
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="h-full w-full object-cover md:hidden"
      >
        <source src="/mob_background.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-[#050505]/55" />
    </div>
  );
}
