"use client"

import React, { useEffect, useState } from 'react'

interface LogoProps {
  className?: string
  iconOnly?: boolean
  size?: 'sm' | 'md' | 'lg'
  plan?: 'pro' | 'plus' | 'free' | string | null
  showBadge?: boolean
}

export function Logo({ className = '', size = 'md', plan: forcedPlan }: LogoProps) {
  const [activePlan, setActivePlan] = useState<string | null>(forcedPlan || null)

  useEffect(() => {
    if (forcedPlan !== undefined) {
      setActivePlan(forcedPlan)
      return
    }

    // Read plan from localStorage if available
    const checkPlan = () => {
      if (typeof window !== 'undefined') {
        const savedPlan = localStorage.getItem('recapai_active_plan')
        setActivePlan(savedPlan)
      }
    }

    checkPlan()

    // Listen for custom or storage events
    window.addEventListener('storage', checkPlan)
    return () => {
      window.removeEventListener('storage', checkPlan)
    }
  }, [forcedPlan])

  // Sizing definitions for circular badge logo image
  const logoDimensions = {
    sm: 'h-8 w-8 sm:h-9 sm:w-9',
    md: 'h-10 w-10 sm:h-11 sm:w-11',
    lg: 'h-14 w-14 sm:h-16 sm:w-16',
  }

  const currentPlan = activePlan?.toLowerCase()

  return (
    <div className={`inline-flex items-center gap-2 group select-none shrink-0 ${className}`}>
      {/* Official RecapAI Circular Emblem Logo */}
      <div className={`relative overflow-hidden rounded-full border border-primary/20 bg-background shadow-xs group-hover:scale-105 group-hover:shadow-md group-hover:border-primary/50 transition-all duration-200 flex items-center justify-center shrink-0 ${logoDimensions[size]}`}>
        <img
          src="/logo.png"
          alt="RecapAI Logo"
          className="w-full h-full object-cover rounded-full"
        />
      </div>

      {/* Dynamic Subscription Badge beside Logo - Simple subtle light colors, static, no emojis */}
      {currentPlan === 'pro' && (
        <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-md">
          PRO
        </span>
      )}

      {currentPlan === 'plus' && (
        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-md">
          PLUS
        </span>
      )}
    </div>
  )
}
