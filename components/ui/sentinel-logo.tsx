import React from "react";

interface SentinelLogoProps {
  size?: number;
  className?: string;
}

export function SentinelLogo({ size = 24, className = "" }: SentinelLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Sentinel Logo"
    >
      <rect width="100" height="100" rx="22" fill="#0c0d0e" />
      {/* Outer Hexagon */}
      <path
        d="M50 14L82 32.5V67.5L50 86L18 67.5V32.5L50 14Z"
        stroke="#ffffff"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* Upper S-loop with circuit nodes */}
      <path
        d="M28 38L50 25.5L72 38V50L50 62.5L34 53.5V47"
        stroke="#ffffff"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Lower S-loop with circuit nodes */}
      <path
        d="M72 62L50 74.5L28 62V50L50 37.5L66 46.5V53"
        stroke="#ffffff"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Circuit Nodes */}
      <circle cx="50" cy="50" r="4.5" fill="#ffffff" />
      <circle cx="34" cy="47" r="4" fill="#ffffff" />
      <circle cx="66" cy="53" r="4" fill="#ffffff" />
      <circle cx="50" cy="25.5" r="3.5" fill="#ffffff" />
      <circle cx="50" cy="74.5" r="3.5" fill="#ffffff" />
    </svg>
  );
}
