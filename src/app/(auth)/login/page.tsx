'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ThemeToggle } from '@/components/theme-toggle'
import { toast } from 'sonner'
import { Check, Database, Loader2, Lock, Mail, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const checkSupabaseConfig = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    if (!url || !key || url.includes('your-supabase-project') || key === 'your-supabase-anon-key') {
      toast.error('Supabase project credentials missing or invalid in .env.local.')
      return false
    }
    return true
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    if (!checkSupabaseConfig()) {
      setIsGoogleLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) {
        toast.error(error.message || 'Google authentication failed.')
        setIsGoogleLoading(false)
      }
    } catch (err: any) {
      console.warn('Google sign-in error:', err)
      toast.error('Could not connect to Supabase server. Try Demo Mode below!')
      setIsGoogleLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please enter both email and password.')
      return
    }

    setIsLoading(true)
    if (!checkSupabaseConfig()) {
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error(error.message || 'Failed to sign in. Check credentials or try Demo Mode!')
        setIsLoading(false)
      } else {
        toast.success('Successfully logged in! Redirecting...')
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err: any) {
      console.warn('Sign in network warning:', err?.message || err)
      toast.error('Could not connect to authentication server. Try Demo Mode!')
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please enter both email and password.')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.')
      return
    }

    setIsLoading(true)
    if (!checkSupabaseConfig()) {
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      setIsLoading(false)
      if (error) {
        toast.error(error.message || 'Failed to register.')
      } else {
        if (data?.session) {
          toast.success('Account created successfully! Redirecting...')
          router.push('/dashboard')
          router.refresh()
        } else {
          toast.success('Registration completed! Redirecting to dashboard...')
          router.push('/dashboard')
        }
      }
    } catch (err: any) {
      console.warn('Sign up network warning:', err?.message || err)
      toast.error('Could not connect to authentication server. Try Demo Mode!')
      setIsLoading(false)
    }
  }

  const handleEnterDemoMode = () => {
    toast.success('Entering Demo Mode with mock meetings & tasks!')
    router.push('/dashboard?demo=true')
  }

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 relative overflow-hidden bg-background text-foreground min-h-screen">
      {/* Top bar with ThemeToggle and Logo link */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 max-w-4xl mx-auto">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-lg tracking-tight text-foreground">
          <div className="p-1 bg-primary rounded-md text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          RecapAI
        </Link>
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-6 z-10 my-12">
        <div className="flex flex-col items-center text-center space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            RecapAI
          </h1>
          <p className="text-sm text-muted-foreground max-w-xs">
            Paste meeting transcripts, extract action items, and organize your team.
          </p>
        </div>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted border border-border p-1 text-muted-foreground">
            <TabsTrigger 
              value="signin" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium transition-all text-xs"
            >
              Sign In
            </TabsTrigger>
            <TabsTrigger 
              value="signup"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium transition-all text-xs"
            >
              Create Account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="mt-4">
            <form onSubmit={handleSignIn}>
              <Card className="border-border bg-card text-card-foreground shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Welcome Back</CardTitle>
                  <CardDescription className="text-muted-foreground text-xs">
                    Enter your email and password to access your dashboard.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-background border-input focus-visible:ring-primary pl-10"
                        required
                        disabled={isLoading || isGoogleLoading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-background border-input focus-visible:ring-primary pl-10"
                        required
                        disabled={isLoading || isGoogleLoading}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all shadow-md"
                    disabled={isLoading || isGoogleLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>

                  <div className="relative flex items-center justify-center w-full my-1">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <span className="relative bg-card px-3 text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Or</span>
                  </div>

                  <Button
                    type="button"
                    onClick={handleGoogleSignIn}
                    variant="outline"
                    className="w-full border-border bg-background text-foreground hover:bg-accent transition-colors h-10"
                    disabled={isLoading || isGoogleLoading}
                  >
                    {isGoogleLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                        <path
                          fill="#EA4335"
                          d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.54 14.98 1 12 1 7.35 1 3.37 3.65 1.42 7.54l3.82 2.96C6.18 7.39 8.87 5.04 12 5.04z"
                        />
                        <path
                          fill="#4285F4"
                          d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.43c-.28 1.44-1.09 2.66-2.31 3.47l3.6 2.79c2.1-1.94 3.77-5.18 3.77-8.41z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.24 14.5c-.24-.72-.38-1.5-.38-2.3s.14-1.58.38-2.3L1.42 6.94C.51 8.77 0 10.83 0 13s.51 4.23 1.42 6.06l3.82-2.96z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.6-2.79c-1.1.74-2.5 1.18-4.36 1.18-3.13 0-5.82-2.35-6.76-5.46L1.42 16.98C3.37 20.35 7.35 23 12 23z"
                        />
                      </svg>
                    )}
                    Continue with Google
                  </Button>

                  <Button
                    type="button"
                    onClick={handleEnterDemoMode}
                    variant="ghost"
                    className="w-full text-xs font-semibold text-primary hover:bg-primary/10 gap-1.5 h-9"
                  >
                    <Database className="h-3.5 w-3.5" />
                    Explore Dashboard in Demo Mode
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="mt-4">
            <form onSubmit={handleSignUp}>
              <Card className="border-border bg-card text-card-foreground shadow-md">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Get Started</CardTitle>
                  <CardDescription className="text-muted-foreground text-xs">
                    Create a new account to start extracting actions.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-background border-input focus-visible:ring-primary pl-10"
                        required
                        disabled={isLoading || isGoogleLoading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="At least 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-background border-input focus-visible:ring-primary pl-10"
                        required
                        disabled={isLoading || isGoogleLoading}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all shadow-md"
                    disabled={isLoading || isGoogleLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Registering...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>

                  <div className="relative flex items-center justify-center w-full my-1">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <span className="relative bg-card px-3 text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Or</span>
                  </div>

                  <Button
                    type="button"
                    onClick={handleGoogleSignIn}
                    variant="outline"
                    className="w-full border-border bg-background text-foreground hover:bg-accent transition-colors h-10"
                    disabled={isLoading || isGoogleLoading}
                  >
                    {isGoogleLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                        <path
                          fill="#EA4335"
                          d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.54 14.98 1 12 1 7.35 1 3.37 3.65 1.42 7.54l3.82 2.96C6.18 7.39 8.87 5.04 12 5.04z"
                        />
                        <path
                          fill="#4285F4"
                          d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.43c-.28 1.44-1.09 2.66-2.31 3.47l3.6 2.79c2.1-1.94 3.77-5.18 3.77-8.41z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.24 14.5c-.24-.72-.38-1.5-.38-2.3s.14-1.58.38-2.3L1.42 6.94C.51 8.77 0 10.83 0 13s.51 4.23 1.42 6.06l3.82-2.96z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.6-2.79c-1.1.74-2.5 1.18-4.36 1.18-3.13 0-5.82-2.35-6.76-5.46L1.42 16.98C3.37 20.35 7.35 23 12 23z"
                        />
                      </svg>
                    )}
                    Continue with Google
                  </Button>

                  <Button
                    type="button"
                    onClick={handleEnterDemoMode}
                    variant="ghost"
                    className="w-full text-xs font-semibold text-primary hover:bg-primary/10 gap-1.5 h-9"
                  >
                    <Database className="h-3.5 w-3.5" />
                    Explore Dashboard in Demo Mode
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
