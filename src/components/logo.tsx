import React from 'react'

interface LogoProps {
  className?: string
  iconOnly?: boolean
  size?: 'sm' | 'md' | 'lg'
  showBadge?: boolean
}

export function Logo({ className = '', iconOnly = false, size = 'md', showBadge = false }: LogoProps) {
  // Sizing definitions for circular badge logo image
  const logoDimensions = {
    sm: 'h-8 w-8 sm:h-9 sm:w-9',
    md: 'h-10 w-10 sm:h-11 sm:w-11',
    lg: 'h-14 w-14 sm:h-16 sm:w-16',
  }

  return (
    <div className={`inline-flex items-center gap-2.5 group select-none shrink-0 ${className}`}>
      {/* Official RecapAI Circular Badge Logo */}
      <div className={`relative overflow-hidden rounded-full border border-primary/20 bg-background shadow-sm group-hover:scale-105 group-hover:shadow-md group-hover:border-primary/50 transition-all duration-200 flex items-center justify-center shrink-0 ${logoDimensions[size]}`}>
        <img
          src="/logo.png"
          alt="RecapAI Logo"
          className="w-full h-full object-cover rounded-full"
        />
      </div>

      {!iconOnly && (
        <div className="flex items-center gap-2">
          <span className="font-extrabold tracking-tight text-foreground text-lg sm:text-xl font-heading hidden xs:inline-block">
            Recap<span className="text-primary font-black">AI</span>
          </span>
          {showBadge && (
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-primary border border-primary/30 bg-primary/10 rounded px-1.5 py-0.5 shrink-0">
              PRO
            </span>
          )}
        </div>
      )}
    </div>
  )
}
