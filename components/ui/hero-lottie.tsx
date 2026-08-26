"use client";

import { Lottie } from "lottie-react";

export function HeroLottie({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Lottie src="/Scene-1.json" loop autoplay />
    </div>
  );
}
