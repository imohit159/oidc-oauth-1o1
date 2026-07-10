import * as React from "react"

export function FadeSun() {
  return (
    <svg viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sunFadeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F3A8A0" />
          <stop offset="35%" stopColor="#F5B7AF" />
          <stop offset="70%" stopColor="#F8D5CF" />
          <stop offset="100%" stopColor="#FAE7E3" stopOpacity="0" />
        </linearGradient>
      </defs>
      <circle cx="160" cy="160" r="160" fill="url(#sunFadeGrad)" />
    </svg>
  )
}
