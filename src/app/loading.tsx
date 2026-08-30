export default function Loading() {
  return (
    <div className="os-edge flex min-h-[60svh] items-center justify-center py-20">
      <div className="w-full max-w-xs">
        <p className="os-label text-center text-[0.625rem] text-smoke">
          Loading
        </p>
        <div className="mt-4 h-px w-full overflow-hidden bg-steel/40">
          <div className="os-scan h-px w-1/3 bg-signal" />
        </div>
      </div>
    </div>
  );
}
