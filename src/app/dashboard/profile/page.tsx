'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ThemeToggle } from '@/components/theme-toggle'
import { toast } from 'sonner'
import { 
  ArrowLeft, 
  Camera, 
  Check, 
  Copy, 
  Loader2, 
  Lock, 
  QrCode, 
  ShieldCheck, 
  User 
} from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auth/User State
  const [userId, setUserId] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [fullName, setFullName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  // Loading States
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  // 2FA TOTP Enrollment State
  const [isMfaEnrolled, setIsMfaEnrolled] = useState(false)
  const [activeFactorId, setActiveFactorId] = useState<string | null>(null)
  const [isEnrollingMfa, setIsEnrollingMfa] = useState(false)
  const [totpSecret, setTotpSecret] = useState('')
  const [totpQrCode, setTotpQrCode] = useState('')
  const [mfaFactorId, setMfaFactorId] = useState('')
  const [mfaCode, setMfaCode] = useState('')
  const [isVerifyingMfa, setIsVerifyingMfa] = useState(false)

  const ADMIN_EMAILS = ['abdshk28@gmail.com', 'abdullahlmao933@gmail.com']

  // Load User Info & Profile
  useEffect(() => {
    async function loadProfile() {
      setIsLoadingProfile(true)
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        toast.error('Authentication expired. Please log in.')
        router.push('/login')
        return
      }

      setUserId(user.id)
      const userEmail = user.email ?? null
      setEmail(userEmail)

      const isKnownAdmin = userEmail ? ADMIN_EMAILS.includes(userEmail.toLowerCase()) : false
      if (isKnownAdmin) setIsAdmin(true)

      // Fetch OAuth metadata defaults
      const metaName = user.user_metadata?.full_name || user.user_metadata?.name || user.user_metadata?.preferred_username || ''
      const metaAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || ''

      // Fetch Profile table
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (profile) {
        setFullName(profile.full_name || metaName || '')
        setAvatarUrl(profile.avatar_url || metaAvatar || '')
        setIsAdmin(profile.is_admin === true || isKnownAdmin)

        if (isKnownAdmin && !profile.is_admin) {
          await supabase.from('profiles').update({ is_admin: true }).eq('id', user.id)
        }
      } else {
        // Auto-create row in profiles table if it doesn't exist
        const { data: newProfile } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            full_name: metaName || 'User',
            avatar_url: metaAvatar || '',
            is_admin: isKnownAdmin,
            updated_at: new Date().toISOString()
          })
          .select()
          .maybeSingle()

        if (newProfile) {
          setFullName(newProfile.full_name || metaName || '')
          setAvatarUrl(newProfile.avatar_url || metaAvatar || '')
          setIsAdmin(newProfile.is_admin === true || isKnownAdmin)
        } else if (isKnownAdmin) {
          setIsAdmin(true)
        }
      }

      // Check MFA Enrollment status
      await checkMfaStatus()
      setIsLoadingProfile(false)
    }

    loadProfile()
  }, [])

  const checkMfaStatus = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors()
      if (error) throw error
      
      const totpFactor = data.all.find(
        (f) => f.factor_type === 'totp' && f.status === 'verified'
      )
      
      if (totpFactor) {
        setIsMfaEnrolled(true)
        setActiveFactorId(totpFactor.id)
      } else {
        setIsMfaEnrolled(false)
        setActiveFactorId(null)
      }
    } catch (err) {
      console.warn('Error listing MFA factors:', err)
    }
  }

  // Update Name
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    setIsSavingProfile(true)
    try {
      // Update Supabase Auth metadata
      await supabase.auth.updateUser({
        data: { full_name: fullName.trim() }
      })

      // Upsert into profiles table
      const { error: upsertErr } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          full_name: fullName.trim(),
          avatar_url: avatarUrl || null,
          updated_at: new Date().toISOString()
        })

      if (upsertErr) {
        // Fallback update query
        await supabase
          .from('profiles')
          .update({
            full_name: fullName.trim(),
            avatar_url: avatarUrl || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)
      }

      toast.success('Profile name updated successfully.')
      router.refresh()
    } catch (err: any) {
      console.error('Failed to update profile name:', err)
      toast.error(err.message || 'Failed to update profile name.')
    } finally {
      setIsSavingProfile(false)
    }
  }

  // Avatar Image Upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !userId) return

    // Validate type and size (max 2MB)
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are supported.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be smaller than 2MB.')
      return
    }

    setIsUploadingAvatar(true)
    try {
      const fileExt = file.name.split('.').pop()
      const filePath = `${userId}/${Date.now()}.${fileExt}`

      // Upload file to avatars bucket
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      // Retrieve public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Save public URL to profiles
      setAvatarUrl(publicUrl)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          full_name: fullName.trim(),
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })

      if (profileError) throw profileError
      toast.success('Profile picture updated successfully!')
      router.refresh()
    } catch (err: any) {
      toast.error('Failed to upload profile picture. Ensure the avatars bucket is created and set to public.')
      console.warn(err)
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  // Start 2FA TOTP Enrollment Wizard
  const handleEnrollMfa = async () => {
    setIsEnrollingMfa(true)
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        issuer: 'RecapAI',
        friendlyName: email || 'User'
      })

      if (error) throw error

      setMfaFactorId(data.id)
      setTotpSecret(data.totp.secret)
      setTotpQrCode(data.totp.qr_code)
    } catch (err: any) {
      toast.error(err.message || 'Failed to enroll in Two-Factor Auth.')
      console.warn(err)
      setIsEnrollingMfa(false)
    }
  }

  // Verify and Activate 2FA TOTP Factor
  const handleVerifyMfa = async () => {
    if (!mfaCode || mfaCode.length !== 6) {
      toast.error('Please enter a 6-digit verification code.')
      return
    }

    setIsVerifyingMfa(true)
    try {
      // 1. Initiate challenge code verification
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: mfaFactorId
      })

      if (challengeError) throw challengeError

      // 2. Submit challenge code solution
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: mfaFactorId,
        challengeId: challenge.id,
        code: mfaCode
      })

      if (verifyError) throw verifyError

      toast.success('Two-Factor Authentication activated successfully!')
      setTotpQrCode('')
      setTotpSecret('')
      setMfaCode('')
      setIsEnrollingMfa(false)
      await checkMfaStatus()
    } catch (err: any) {
      toast.error(err.message || 'Verification failed. Please check the authenticator code.')
      console.warn(err)
    } finally {
      setIsVerifyingMfa(false)
    }
  }

  // Disable 2FA TOTP Factor
  const handleDisableMfa = async () => {
    if (!activeFactorId) return
    const confirmDisable = window.confirm('Are you sure you want to disable Two-Factor Authentication? Your account will be less secure.')
    if (!confirmDisable) return

    try {
      const { error } = await supabase.auth.mfa.unenroll({
        factorId: activeFactorId
      })

      if (error) throw error
      toast.success('Two-Factor Authentication disabled.')
      await checkMfaStatus()
    } catch (err: any) {
      toast.error('Failed to disable Two-Factor Auth.')
      console.warn(err)
    }
  }

  const getInitialsAvatar = (name: string) => {
    const initials = (name.trim() || 'User').slice(0, 2).toUpperCase()
    return (
      <div className="h-20 w-20 rounded-full border border-border bg-muted flex items-center justify-center text-xl font-bold text-primary select-none">
        {initials}
      </div>
    )
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Secret key copied to clipboard.')
  }

  return (
    <div className="flex-1 flex flex-col bg-background text-foreground min-h-screen">
      {/* Nav Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-foreground">
              Account Settings
            </h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Profile Settings Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 z-10 space-y-6">
        {isLoadingProfile ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading your profile settings...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            
            {/* Left Column: Avatar Management */}
            <div className="md:col-span-1 flex flex-col items-center">
              <Card className="w-full border-border bg-card text-card-foreground shadow-md p-6 flex flex-col items-center gap-4 text-center">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt="Avatar" 
                      className="h-20 w-20 rounded-full object-cover border border-border hover:opacity-75 transition-opacity" 
                    />
                  ) : (
                    getInitialsAvatar(fullName)
                  )}
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-foreground">{fullName || 'User'}</h3>
                  <p className="text-xs text-muted-foreground">{email}</p>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/*"
                  className="hidden"
                  disabled={isUploadingAvatar}
                />
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-border bg-background hover:bg-accent text-xs font-semibold"
                  disabled={isUploadingAvatar}
                >
                  {isUploadingAvatar ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Change Photo'
                  )}
                </Button>
                <div className="text-[10px] text-muted-foreground leading-normal">
                  Recommended size 400x400. JPG, PNG or WEBP formats.
                </div>

                {isAdmin && (
                  <div className="w-full pt-2 border-t border-border mt-2">
                    <Link href="/dashboard/admin" className="w-full">
                      <Button variant="outline" size="sm" className="w-full text-xs font-semibold gap-2 bg-primary/10 hover:bg-primary/20 text-primary border-primary/20">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Open Admin Portal
                      </Button>
                    </Link>
                  </div>
                )}
              </Card>
            </div>

            {/* Right Column: Profile Form & Security */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Profile Details Form */}
              <form onSubmit={handleSaveProfile}>
                <Card className="border-border bg-card text-card-foreground shadow-md">
                  <CardHeader>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <User className="h-4.5 w-4.5 text-primary" />
                      Profile Details
                    </CardTitle>
                    <CardDescription className="text-muted-foreground text-xs">
                      Update your account display name.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="fullname">Display Name</Label>
                      <Input
                        id="fullname"
                        placeholder="e.g. Alice Cooper"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="bg-background border-input focus-visible:ring-primary"
                        required
                        disabled={isSavingProfile}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="justify-end border-t border-border pt-4">
                    <Button
                      type="submit"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-9 px-4"
                      disabled={isSavingProfile}
                    >
                      {isSavingProfile ? (
                        <>
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Name'
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </form>

              {/* Two-Factor Authentication Panel */}
              <Card className="border-border bg-card text-card-foreground shadow-md">
                <CardHeader>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Lock className="h-4.5 w-4.5 text-primary" />
                    Two-Factor Authentication (2FA)
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-xs">
                    Strengthen account security by requiring a verification code when signing in.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isMfaEnrolled ? (
                    <div className="flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="h-5 w-5 shrink-0 mt-0.5" />
                      <div className="space-y-1.5 min-w-0">
                        <div className="text-sm font-bold">2FA is currently active</div>
                        <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 leading-normal">
                          Your account is protected by a secondary verification factor. Authenticator app codes are required during login attempts.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 bg-muted border border-border p-4 rounded-xl text-muted-foreground">
                      <QrCode className="h-5 w-5 shrink-0 mt-0.5 text-primary" />
                      <div className="space-y-1.5 min-w-0">
                        <div className="text-sm font-bold text-foreground">2FA is currently disabled</div>
                        <p className="text-xs text-muted-foreground leading-normal">
                          Enabling two-factor auth prompts for a security verification code every time you log in, blocking unauthorized access.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* TOTP QR Code Scanner Area */}
                  {totpQrCode && (
                    <div className="bg-muted/40 border border-border rounded-xl p-6 space-y-6 flex flex-col items-center">
                      <div className="space-y-1 text-center max-w-sm">
                        <h4 className="font-bold text-sm text-foreground">1. Scan the QR code</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Scan this QR code using Google Authenticator, Microsoft Authenticator, or 1Password.
                        </p>
                      </div>

                      {/* Display QR code */}
                      <div 
                        className="bg-white p-3 rounded-xl border border-border shadow-md select-none shrink-0" 
                        dangerouslySetInnerHTML={{ __html: totpQrCode }} 
                      />

                      <div className="space-y-2 text-center max-w-sm w-full">
                        <h4 className="font-bold text-sm text-foreground">Or use the Secret Key</h4>
                        <div className="flex items-center gap-2 bg-background border border-input p-2 rounded-lg justify-between select-none">
                          <code className="text-xs text-primary font-mono select-all truncate pr-3">{totpSecret}</code>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            type="button"
                            onClick={() => copyToClipboard(totpSecret)}
                            className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-3 w-full max-w-xs text-center border-t border-border pt-4">
                        <div className="space-y-1">
                          <h4 className="font-bold text-sm text-foreground">2. Enter 6-digit code</h4>
                          <p className="text-xs text-muted-foreground">Input the generated passcode to confirm verification.</p>
                        </div>
                        <div className="relative">
                          <Input
                            placeholder="000000"
                            maxLength={6}
                            value={mfaCode}
                            onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                            className="bg-background border-input text-center tracking-widest text-lg font-bold h-12 focus-visible:ring-primary"
                            disabled={isVerifyingMfa}
                          />
                        </div>
                        <Button 
                          type="button" 
                          onClick={handleVerifyMfa}
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                          disabled={isVerifyingMfa}
                        >
                          {isVerifyingMfa ? (
                            <>
                              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                              Activating...
                            </>
                          ) : (
                            'Verify and Enable'
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="justify-end border-t border-border pt-4">
                  {isMfaEnrolled ? (
                    <Button
                      type="button"
                      onClick={handleDisableMfa}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 text-xs font-semibold h-9 px-4 transition-all"
                    >
                      Disable Two-Factor Auth
                    </Button>
                  ) : (
                    !totpQrCode && (
                      <Button
                        type="button"
                        onClick={handleEnrollMfa}
                        disabled={isEnrollingMfa}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-9 px-4"
                      >
                        {isEnrollingMfa ? (
                          <>
                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                            Setting up...
                          </>
                        ) : (
                          'Setup Two-Factor Auth'
                        )}
                      </Button>
                    )
                  )}
                </CardFooter>
              </Card>

            </div>

          </div>
        )}
      </main>
    </div>
  )
}
