import React from 'react'

interface LogoProps {
  className?: string
  iconOnly?: boolean
  size?: 'sm' | 'md' | 'lg'
  showBadge?: boolean
}

export function Logo({ className = '', iconOnly = false, size = 'md', showBadge = false }: LogoProps) {
  const containerSizes = {
    sm: 'h-7 w-7 p-1 rounded-lg',
    md: 'h-9 w-9 p-1.5 rounded-xl',
    lg: 'h-11 w-11 p-2 rounded-xl',
  }

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  }

  return (
    <div className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      {/* Custom Professional Logo Icon */}
      <div className={`relative flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white shadow-md shadow-blue-500/25 group-hover:shadow-blue-500/40 group-hover:scale-105 transition-all duration-200 shrink-0 ${containerSizes[size]}`}>
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Background subtle glow fill */}
          <rect width="32" height="32" rx="8" fill="url(#logo_grad)" />

          {/* Transcript Document Layer */}
          <path
            d="M9 7C9 5.89543 9.89543 5 11 5H18.5L23 9.5V23C23 24.1046 22.1046 25 21 25H11C9.89543 25 9 24.1046 9 23V7Z"
            fill="white"
            fillOpacity="0.2"
            stroke="white"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          {/* Document Fold */}
          <path
            d="M18.5 5V9.5H23"
            stroke="white"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          {/* Summary Text Lines */}
          <line x1="12.5" y1="11" x2="16.5" y2="11" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.7" />

          {/* Action Checkmark Loop */}
          <path
            d="M12.5 17.5L15.5 20.5L22.5 13.5"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <defs>
            <linearGradient id="logo_grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
              <stop stopColor="#2563EB" />
              <stop offset="0.5" stopColor="#1D4ED8" />
              <stop offset="1" stopColor="#3730A3" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {!iconOnly && (
        <div className="flex items-center gap-2">
          <span className={`font-extrabold tracking-tight text-foreground font-heading ${textSizes[size]}`}>
            Recap<span className="text-primary font-black">AI</span>
          </span>
          {showBadge && (
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-primary border border-primary/30 bg-primary/10 rounded px-1.5 py-0.5">
              MVP
            </span>
          )}
        </div>
      )}
    </div>
  )
}
