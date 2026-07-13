'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
      setEmail(user.email ?? null)

      // Fetch Profile table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile && !profileError) {
        setFullName(profile.full_name || '')
        setAvatarUrl(profile.avatar_url || '')
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
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          full_name: fullName.trim(),
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })

      if (error) throw error
      toast.success('Profile name updated successfully.')
      router.refresh()
    } catch (err: any) {
      toast.error('Failed to update profile name.')
      console.warn(err)
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
      <div className="h-20 w-20 rounded-full border border-slate-700 bg-slate-900 flex items-center justify-center text-xl font-bold text-indigo-400 select-none">
        {initials}
      </div>
    )
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Secret key copied to clipboard.')
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 min-h-screen">
      {/* Background gradients */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Nav Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
              <Button variant="ghost" size="sm" className="gap-1 text-slate-400 hover:text-white">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-300">
              Account Settings
            </h1>
          </div>
        </div>
      </header>

      {/* Profile Settings Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 z-10 space-y-6">
        {isLoadingProfile ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            <p className="text-sm text-slate-400">Loading your profile settings...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            
            {/* Left Column: Avatar Management */}
            <div className="md:col-span-1 flex flex-col items-center">
              <Card className="w-full border-slate-800 bg-slate-900/40 backdrop-blur-xl text-slate-100 shadow-xl p-6 flex flex-col items-center gap-4 text-center">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt="Avatar" 
                      className="h-20 w-20 rounded-full object-cover border border-slate-700 hover:opacity-75 transition-opacity" 
                    />
                  ) : (
                    getInitialsAvatar(fullName)
                  )}
                  <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-slate-200">{fullName || 'User'}</h3>
                  <p className="text-xs text-slate-500">{email}</p>
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
                  className="border-slate-800 bg-slate-950/60 hover:bg-slate-900 text-xs font-semibold"
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
                <div className="text-[10px] text-slate-500 leading-normal">
                  Supports PNG, JPG, or WEBP up to 2MB.
                </div>
              </Card>
            </div>

            {/* Right Column: Profile Form & Security */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Profile Details Form */}
              <form onSubmit={handleSaveProfile}>
                <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-xl text-slate-100 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <User className="h-4.5 w-4.5 text-indigo-400" />
                      Profile Details
                    </CardTitle>
                    <CardDescription className="text-slate-400 text-xs">
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
                        className="bg-slate-950 border-slate-850 focus-visible:ring-indigo-500"
                        required
                        disabled={isSavingProfile}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="justify-end border-t border-slate-950/60 pt-4">
                    <Button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs h-9 px-4"
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
              <Card className="border-slate-800 bg-slate-900/40 backdrop-blur-xl text-slate-100 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Lock className="h-4.5 w-4.5 text-indigo-400" />
                    Two-Factor Authentication (2FA)
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-xs">
                    Strengthen account security by requiring a verification code when signing in.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isMfaEnrolled ? (
                    <div className="flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-emerald-400">
                      <ShieldCheck className="h-5 w-5 shrink-0 mt-0.5" />
                      <div className="space-y-1.5 min-w-0">
                        <div className="text-sm font-bold">2FA is currently active</div>
                        <p className="text-xs text-emerald-500/80 leading-normal">
                          Your account is protected by a secondary verification factor. authenticator app codes are required during login attempts.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 bg-slate-950 border border-slate-900 p-4 rounded-xl text-slate-400">
                      <QrCode className="h-5 w-5 shrink-0 mt-0.5 text-indigo-400" />
                      <div className="space-y-1.5 min-w-0">
                        <div className="text-sm font-bold text-slate-300">2FA is currently disabled</div>
                        <p className="text-xs text-slate-500 leading-normal">
                          Enabling two-factor auth prompts for a security verification code every time you log in, blocking unauthorized access.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* TOTP QR Code Scanner Area */}
                  {totpQrCode && (
                    <div className="bg-slate-950 border border-slate-900 rounded-xl p-6 space-y-6 flex flex-col items-center">
                      <div className="space-y-1 text-center max-w-sm">
                        <h4 className="font-bold text-sm text-slate-200">1. Scan the QR code</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Scan this QR code using Google Authenticator, Microsoft Authenticator, or 1Password.
                        </p>
                      </div>

                      {/* Display QR code */}
                      <div 
                        className="bg-white p-3 rounded-xl border border-slate-800 shadow-md select-none shrink-0" 
                        dangerouslySetInnerHTML={{ __html: totpQrCode }} 
                      />

                      <div className="space-y-2 text-center max-w-sm w-full">
                        <h4 className="font-bold text-sm text-slate-200">Or use the Secret Key</h4>
                        <div className="flex items-center gap-2 bg-slate-900 border border-slate-850 p-2 rounded-lg justify-between select-none">
                          <code className="text-xs text-indigo-400 font-mono select-all truncate pr-3">{totpSecret}</code>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            type="button"
                            onClick={() => copyToClipboard(totpSecret)}
                            className="h-7 w-7 text-slate-400 hover:text-white shrink-0"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-3 w-full max-w-xs text-center border-t border-slate-900 pt-4">
                        <div className="space-y-1">
                          <h4 className="font-bold text-sm text-slate-200">2. Enter 6-digit code</h4>
                          <p className="text-xs text-slate-500">Input the generated passcode to confirm verification.</p>
                        </div>
                        <div className="relative">
                          <Input
                            placeholder="000000"
                            maxLength={6}
                            value={mfaCode}
                            onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                            className="bg-slate-900 border-slate-850 text-center tracking-widest text-lg font-bold h-12 focus-visible:ring-indigo-500"
                            disabled={isVerifyingMfa}
                          />
                        </div>
                        <Button 
                          type="button" 
                          onClick={handleVerifyMfa}
                          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
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
                <CardFooter className="justify-end border-t border-slate-950/60 pt-4">
                  {isMfaEnrolled ? (
                    <Button
                      type="button"
                      onClick={handleDisableMfa}
                      className="bg-red-500/10 hover:bg-red-550/20 text-red-400 border border-red-500/20 text-xs font-semibold h-9 px-4 transition-all"
                    >
                      Disable Two-Factor Auth
                    </Button>
                  ) : (
                    !totpQrCode && (
                      <Button
                        type="button"
                        onClick={handleEnrollMfa}
                        disabled={isEnrollingMfa}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs h-9 px-4"
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
