import * as React from "react"

export function StampSeal() {
  return (
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" className="text-primary">
      <rect x="2" y="2" width="60" height="60" rx="4" fill="none" stroke="currentColor" strokeWidth="3" />
      <rect x="6" y="6" width="52" height="52" rx="2" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.45" />
      {/* Row 1: 安 全 */}
      <text x="18" y="25" textAnchor="middle" className="font-serif" fill="currentColor" fontSize="16" fontWeight="700">安</text>
      <text x="46" y="25" textAnchor="middle" className="font-serif" fill="currentColor" fontSize="16" fontWeight="700">全</text>
      {/* Row 2: 信 頼 */}
      <text x="18" y="49" textAnchor="middle" className="font-serif" fill="currentColor" fontSize="16" fontWeight="700">信</text>
      <text x="46" y="49" textAnchor="middle" className="font-serif" fill="currentColor" fontSize="16" fontWeight="700">頼</text>
    </svg>
  )
}
