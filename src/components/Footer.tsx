export function Footer() {
  return (
    <footer className="relative bg-black border-t border-yellow-500/20 py-12 px-4 font-mono-custom text-xs text-center text-yellow-500/60 overflow-hidden">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="font-display font-black text-xl text-yellow-400 tracking-widest">
          KINNA.EXE
        </div>
        <p className="text-yellow-500/50 max-w-xl mx-auto">
          CLASSIFIED GOVERNMENT PROPERTY — UNAUTHORIZED ACCESS OR SPREADING KINNA'S SECRETS WILL RESULT IN 100 YEARS OF HOMEWORK.
        </p>
        <div className="flex justify-center gap-6 pt-2 text-yellow-400/80">
          <span>THREAT LEVEL: 99%</span>
          <span>•</span>
          <span>STATUS: STILL SLEEPING</span>
          <span>•</span>
          <span>EST. 2006</span>
        </div>
        <div className="text-[11px] text-yellow-500/30 pt-4 border-t border-yellow-500/10">
          Created with React, TypeScript, Tailwind CSS & GSAP for Kinna. All rights reserved by the Secret Agency.
        </div>
      </div>
    </footer>
  );
}
