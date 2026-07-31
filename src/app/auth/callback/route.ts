import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Automatically sync Google / OAuth metadata (name & profile photo) into profiles table
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const metaName = user.user_metadata?.full_name || user.user_metadata?.name || user.user_metadata?.preferred_username || user.email?.split('@')[0]
          const metaAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || ''

          const { data: existing } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', user.id)
            .maybeSingle()

          await supabase.from('profiles').upsert({
            id: user.id,
            full_name: existing?.full_name || metaName || 'User',
            avatar_url: existing?.avatar_url || metaAvatar || '',
            updated_at: new Date().toISOString()
          })
        }
      } catch (syncErr) {
        console.warn('OAuth metadata sync notice:', syncErr)
      }

      // Check if request is on localhost to ensure local dev stays on localhost
      const host = request.headers.get('host') || ''
      if (host.includes('localhost') || origin.includes('localhost')) {
        return NextResponse.redirect(`${origin}${next}`)
      }

      const forwardedHost = request.headers.get('x-forwarded-host')
      if (forwardedHost && !forwardedHost.includes('localhost')) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return the user to login with an error
  return NextResponse.redirect(`${origin}/login?error=Could not exchange auth code`)
}
