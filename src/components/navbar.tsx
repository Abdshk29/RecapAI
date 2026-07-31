"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import {
  Menu,
  X,
  Home,
  Info,
  Workflow,
  Sparkles,
  Mail,
  LogIn,
  ArrowRight,
  LayoutDashboard,
} from "lucide-react"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const navLinks = [
    { name: "Home", href: "#home", icon: Home },
    { name: "About", href: "#about", icon: Info },
    { name: "How It Works", href: "#how-it-works", icon: Workflow },
    { name: "Features", href: "#features", icon: Sparkles },
    { name: "Contact", href: "#contact", icon: Mail },
  ]

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault()
      setIsOpen(false)
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
    }
  }

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur-md sticky top-0 z-50 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="shrink-0 min-w-0 flex items-center">
          <Logo size="md" />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleScroll(e, link.href)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Action Controls & Mobile Menu Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <ThemeToggle className="h-9 w-9 shrink-0" />

          {/* Desktop Auth Buttons */}
          <Link href="/login" className="hidden sm:inline-flex shrink-0">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground text-sm font-semibold transition-colors px-3"
            >
              Sign In
            </Button>
          </Link>

          <Link href="/dashboard" className="hidden sm:inline-flex shrink-0">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm transition-all shadow-sm px-4 py-2 h-9 whitespace-nowrap">
              Go to Dashboard
              <ArrowRight className="h-4 w-4 ml-1.5 shrink-0" />
            </Button>
          </Link>

          {/* Mobile 3-Line Dropdown Button (Hamburger Menu) */}
          <div className="relative md:hidden">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="h-9 w-9 border-border bg-card/80 text-foreground hover:bg-accent focus:outline-hidden"
              aria-label="Toggle Navigation Menu"
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu Panel */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-background/98 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200 shadow-xl">
          <div className="max-w-6xl mx-auto px-4 py-4 space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2">
              Navigation
            </div>
            
            <div className="grid gap-1">
              {navLinks.map((link) => {
                const IconComponent = link.icon
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => handleScroll(e, link.href)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-all active:scale-[0.99]"
                  >
                    <div className="p-1.5 rounded-md bg-muted text-muted-foreground group-hover:text-primary">
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <span>{link.name}</span>
                  </a>
                )
              })}
            </div>

            <div className="border-t border-border/80 pt-3 space-y-2">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-all"
              >
                <div className="p-1.5 rounded-md bg-muted text-muted-foreground">
                  <LogIn className="h-4 w-4" />
                </div>
                <span>Sign In</span>
              </Link>

              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Go to Dashboard</span>
                </div>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
