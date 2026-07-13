'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Check, Loader2, Lock, Mail, Sparkles } from 'lucide-react'

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
      toast.error('Supabase project configuration is missing. Please define valid credentials in .env.local.')
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
      toast.error('Could not connect to the Google OAuth server.')
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
        toast.error(error.message || 'Failed to sign in. Please check your credentials.')
        setIsLoading(false)
      } else {
        toast.success('Successfully logged in! Redirecting...')
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err: any) {
      console.warn('Sign in network warning:', err?.message || err)
      toast.error('Could not connect to the authentication server. Please check your network connection.')
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
        // In Supabase, if email confirmation is enabled, the user might need to check their email.
        // If it is disabled, they might be logged in directly.
        if (data.session) {
          toast.success('Account created successfully! Redirecting...')
          router.push('/dashboard')
          router.refresh()
        } else {
          toast.success('Registration successful! Please check your email for a verification link.')
        }
      }
    } catch (err: any) {
      console.warn('Sign up network warning:', err?.message || err)
      toast.error('Could not connect to the authentication server. Please check your network connection.')
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 relative overflow-hidden bg-slate-950">
      {/* Decorative gradient glowing circles */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-8 z-10">
        <div className="flex flex-col items-center text-center space-y-2">

          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 via-indigo-400 to-violet-300 drop-shadow-sm mt-3">
            RecapAI
          </h1>
          <p className="text-sm text-slate-400 max-w-xs">
            Paste meeting transcripts, extract action items, and organize your team.
          </p>
        </div>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-900 border border-slate-800 p-1 text-slate-400">
            <TabsTrigger 
              value="signin" 
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-medium transition-all"
            >
              Sign In
            </TabsTrigger>
            <TabsTrigger 
              value="signup"
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white font-medium transition-all"
            >
              Create Account
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="mt-4">
            <form onSubmit={handleSignIn}>
              <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl text-slate-100 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Welcome Back</CardTitle>
                  <CardDescription className="text-slate-400 text-xs">
                    Enter your email and password to access your dashboard.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-slate-950 border-slate-800 focus-visible:ring-indigo-500 pl-10"
                        required
                        disabled={isLoading || isGoogleLoading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-slate-950 border-slate-800 focus-visible:ring-indigo-500 pl-10"
                        required
                        disabled={isLoading || isGoogleLoading}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all shadow-lg hover:shadow-indigo-500/20"
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
                      <div className="w-full border-t border-slate-800" />
                    </div>
                    <span className="relative bg-slate-900 px-3 text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Or</span>
                  </div>

                  <Button
                    type="button"
                    onClick={handleGoogleSignIn}
                    variant="outline"
                    className="w-full border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-900 transition-colors h-11"
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
                </CardFooter>
              </Card>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="mt-4">
            <form onSubmit={handleSignUp}>
              <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-xl text-slate-100 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Get Started</CardTitle>
                  <CardDescription className="text-slate-400 text-xs">
                    Create a new account to start extracting actions.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-slate-950 border-slate-800 focus-visible:ring-indigo-500 pl-10"
                        required
                        disabled={isLoading || isGoogleLoading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="At least 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-slate-950 border-slate-800 focus-visible:ring-indigo-500 pl-10"
                        required
                        disabled={isLoading || isGoogleLoading}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all shadow-lg hover:shadow-indigo-500/20"
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
                      <div className="w-full border-t border-slate-800" />
                    </div>
                    <span className="relative bg-slate-900 px-3 text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Or</span>
                  </div>

                  <Button
                    type="button"
                    onClick={handleGoogleSignIn}
                    variant="outline"
                    className="w-full border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-900 transition-colors h-11"
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
                </CardFooter>
              </Card>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
