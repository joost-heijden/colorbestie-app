export function BlobBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-0 overflow-hidden"
    >
      <div
        className="absolute left-[-22rem] top-[-14rem] h-[38rem] w-[38rem] rounded-full"
        style={{
          background:
            "radial-gradient(circle at center, rgba(255,138,255,0.14) 0%, rgba(255,138,255,0) 70%)",
        }}
      />

      <div
        className="absolute bottom-[-18rem] right-[-20rem] h-[42rem] w-[42rem] rounded-full"
        style={{
          background:
            "radial-gradient(circle at center, rgba(255,138,255,0.08) 0%, rgba(255,138,255,0) 72%)",
        }}
      />
    </div>
  );
}
