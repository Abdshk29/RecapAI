'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon, Monitor, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className={`h-9 w-9 rounded-lg border border-border ${className}`}>
        <Sun className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            className={`h-9 w-9 rounded-lg border border-border bg-background hover:bg-accent hover:text-accent-foreground transition-colors ${className}`}
            aria-label="Toggle theme"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-indigo-400" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-36 bg-popover text-popover-foreground border-border shadow-md">
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className="flex items-center justify-between text-xs font-medium cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Sun className="h-3.5 w-3.5 text-amber-500" />
            Light
          </span>
          {theme === 'light' && <Check className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className="flex items-center justify-between text-xs font-medium cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Moon className="h-3.5 w-3.5 text-indigo-400" />
            Dark
          </span>
          {theme === 'dark' && <Check className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className="flex items-center justify-between text-xs font-medium cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Monitor className="h-3.5 w-3.5 text-slate-500" />
            System
          </span>
          {theme === 'system' && <Check className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
