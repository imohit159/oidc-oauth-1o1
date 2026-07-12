import * as React from "react";

export function ToriiOrnament() {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className="fill-primary h-full w-full"
    >
      <path d="M 10 20 Q 50 25 90 20 L 88 28 Q 50 32 12 28 Z" />
      <rect x="18" y="38" width="64" height="6" />
      <path d="M 33 30 L 26 80 L 32 80 L 38 30 Z" />
      <path d="M 67 30 L 74 80 L 68 80 L 62 30 Z" />
      <rect x="47" y="30" width="6" height="8" />
    </svg>
  );
}
