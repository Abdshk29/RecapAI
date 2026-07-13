'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { exportToCSV, exportToMarkdown, ActionItem, Meeting } from '@/utils/export'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { toast } from 'sonner'
import { 
  Calendar, 
  Check, 
  CheckSquare, 
  Database, 
  Download, 
  Edit3, 
  FileText, 
  ListTodo, 
  Loader2, 
  Lock,
  LogOut,
  Menu, 
  Plus, 
  Search, 
  Sparkles, 
  Square, 
  Trash2, 
  User, 
  UserPlus 
} from 'lucide-react'
import Link from 'next/link'

function DashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // State Variables
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null)
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [actionItems, setActionItems] = useState<ActionItem[]>([])
  
  const [searchTerm, setSearchTerm] = useState('')
  const [userEmail, setUserEmail] = useState<string | null>(null)

  // Custom profile variables
  const [profileName, setProfileName] = useState<string | null>(null)
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null)

  // Loading States
  const [isMeetingsLoading, setIsMeetingsLoading] = useState(true)
  const [isItemsLoading, setIsItemsLoading] = useState(false)
  const [isSeeding, setIsSeeding] = useState(false)
  const [isDeletingMeeting, setIsDeletingMeeting] = useState(false)

  // 2FA Challenge States
  const [isMfaChallengeActive, setIsMfaChallengeActive] = useState(false)
  const [mfaChallengeCode, setMfaChallengeCode] = useState('')
  const [isVerifyingChallenge, setIsVerifyingChallenge] = useState(false)

  // Edit/Add Dialog State
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Partial<ActionItem> | null>(null)
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newItem, setNewItem] = useState({
    task: '',
    owner: '',
    due_date: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  })

  // 1. Fetch Auth User and Meetings
  useEffect(() => {
    async function initDashboard() {
      setIsMeetingsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserEmail(user.email ?? null)

        // Check 2FA authenticator assurance level
        const { data: mfaData, error: mfaError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
        if (mfaData && !mfaError) {
          if (mfaData.nextLevel === 'aal2' && mfaData.currentLevel !== 'aal2') {
            setIsMfaChallengeActive(true)
          }
        }

        await fetchProfile(user.id)
        await fetchMeetings()
      } else {
        router.push('/login')
      }
    }
    initDashboard()
  }, [])

  const fetchProfile = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single()

      if (data && !error) {
        setProfileName(data.full_name || null)
        setProfileAvatar(data.avatar_url || null)
      }
    } catch (err) {
      console.warn('Error loading custom profile:', err)
    }
  }

  const handleVerifyChallenge = async () => {
    if (mfaChallengeCode.length !== 6) {
      toast.error('Please enter a 6-digit code.')
      return
    }

    setIsVerifyingChallenge(true)
    try {
      const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors()
      if (factorsError) throw factorsError

      const verifiedFactor = factorsData.all.find(
        (f) => f.factor_type === 'totp' && f.status === 'verified'
      )

      if (!verifiedFactor) {
        throw new Error('No active verified 2FA factors found on your account.')
      }

      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: verifiedFactor.id
      })
      if (challengeError) throw challengeError

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: verifiedFactor.id,
        challengeId: challenge.id,
        code: mfaChallengeCode
      })
      if (verifyError) throw verifyError

      toast.success('Two-factor verification successful!')
      setIsMfaChallengeActive(false)
      setMfaChallengeCode('')
    } catch (err: any) {
      toast.error(err.message || 'MFA Code verification failed.')
      console.warn(err)
    } finally {
      setIsVerifyingChallenge(false)
    }
  }

  // 2. Watch URL query params for redirected meetings
  useEffect(() => {
    const meetingIdParam = searchParams.get('meetingId')
    if (meetingIdParam && meetings.some(m => m.id === meetingIdParam)) {
      setSelectedMeetingId(meetingIdParam)
    } else if (meetings.length > 0 && !selectedMeetingId) {
      setSelectedMeetingId(meetings[0].id)
    }
  }, [meetings, searchParams])

  // 3. Fetch Action Items when selected meeting changes
  useEffect(() => {
    if (selectedMeetingId) {
      const meeting = meetings.find(m => m.id === selectedMeetingId) || null
      setSelectedMeeting(meeting)
      fetchActionItems(selectedMeetingId)
    } else {
      setSelectedMeeting(null)
      setActionItems([])
    }
  }, [selectedMeetingId, meetings])

  // Database Fetch Helpers
  const fetchMeetings = async () => {
    try {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setMeetings(data || [])
    } catch (err: any) {
      toast.error('Failed to load meetings list.')
      console.error(err)
    } finally {
      setIsMeetingsLoading(false)
    }
  }

  const fetchActionItems = async (meetingId: string) => {
    setIsItemsLoading(true)
    try {
      const { data, error } = await supabase
        .from('action_items')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setActionItems(data || [])
    } catch (err: any) {
      toast.error('Failed to load action items.')
      console.error(err)
    } finally {
      setIsItemsLoading(false)
    }
  }

  // Auth logout
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error('Failed to log out.')
    } else {
      toast.success('Logged out successfully.')
      router.push('/login')
      router.refresh()
    }
  }

  // Toggles Status between open / done
  const handleToggleStatus = async (item: ActionItem) => {
    const newStatus = item.status === 'open' ? 'done' : 'open'
    
    // Optimistic Update
    setActionItems(prev => prev.map(i => i.id === item.id ? { ...i, status: newStatus } : i))

    try {
      const { error } = await supabase
        .from('action_items')
        .update({ status: newStatus })
        .eq('id', item.id)

      if (error) throw error
      toast.success(`Marked task as ${newStatus === 'done' ? 'completed' : 'incomplete'}`)
    } catch (err: any) {
      // Revert State
      setActionItems(prev => prev.map(i => i.id === item.id ? item : i))
      toast.error('Failed to update task status.')
      console.error(err)
    }
  }

  // Delete Action Item
  const handleDeleteItem = async (id: string) => {
    const originalItems = [...actionItems]
    // Optimistic Update
    setActionItems(prev => prev.filter(i => i.id !== id))

    try {
      const { error } = await supabase
        .from('action_items')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Action item deleted.')
    } catch (err: any) {
      // Revert state
      setActionItems(originalItems)
      toast.error('Failed to delete action item.')
      console.error(err)
    }
  }

  // Save changes from Edit Dialog
  const handleSaveEdit = async () => {
    if (!editingItem || !editingItem.id || !editingItem.task?.trim() || !editingItem.owner?.trim()) {
      toast.error('Task description and Owner are required.')
      return
    }

    try {
      const { error } = await supabase
        .from('action_items')
        .update({
          task: editingItem.task.trim(),
          owner: editingItem.owner.trim(),
          due_date: editingItem.due_date || null,
          priority: editingItem.priority
        })
        .eq('id', editingItem.id)

      if (error) throw error

      setActionItems(prev => prev.map(i => i.id === editingItem.id ? (editingItem as ActionItem) : i))
      setIsEditDialogOpen(false)
      setEditingItem(null)
      toast.success('Action item updated.')
    } catch (err: any) {
      toast.error('Failed to update action item.')
      console.error(err)
    }
  }

  // Insert a manually added Action Item
  const handleAddManualItem = async () => {
    if (!newItem.task.trim() || !newItem.owner.trim()) {
      toast.error('Task description and Owner are required.')
      return
    }

    if (!selectedMeetingId) return

    try {
      const { data, error } = await supabase
        .from('action_items')
        .insert({
          meeting_id: selectedMeetingId,
          task: newItem.task.trim(),
          owner: newItem.owner.trim(),
          due_date: newItem.due_date || null,
          priority: newItem.priority,
          status: 'open'
        })
        .select()
        .single()

      if (error) throw error

      setActionItems(prev => [...prev, data])
      setIsAddDialogOpen(false)
      setNewItem({ task: '', owner: '', due_date: '', priority: 'medium' })
      toast.success('New action item added.')
    } catch (err: any) {
      toast.error('Failed to add action item.')
      console.error(err)
    }
  }

  // Delete Meeting
  const handleDeleteMeeting = async () => {
    if (!selectedMeetingId || !selectedMeeting) return
    const confirmDelete = window.confirm(`Are you sure you want to delete "${selectedMeeting.title}" and all its action items? This cannot be undone.`)
    if (!confirmDelete) return

    setIsDeletingMeeting(true)
    try {
      const { error } = await supabase
        .from('meetings')
        .delete()
        .eq('id', selectedMeetingId)

      if (error) throw error

      toast.success('Meeting deleted successfully.')
      const remainingMeetings = meetings.filter(m => m.id !== selectedMeetingId)
      setMeetings(remainingMeetings)
      if (remainingMeetings.length > 0) {
        setSelectedMeetingId(remainingMeetings[0].id)
      } else {
        setSelectedMeetingId(null)
      }
    } catch (err: any) {
      toast.error('Failed to delete meeting.')
      console.error(err)
    } finally {
      setIsDeletingMeeting(false)
    }
  }

  // Seeder Function
  const handleSeedDemoData = async () => {
    setIsSeeding(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('User session not found.')
        return
      }

      // Meeting 1
      const { data: m1, error: m1Err } = await supabase.from('meetings').insert({
        title: 'RecapAI MVP Launch Alignment',
        raw_transcript: `Alice: Hey team, we need to launch the RecapAI MVP on Vercel by this Friday. Bob, are migrations run?
Bob: Yes, I completed the PostgreSQL database tables configuration and RLS policies yesterday. All migrations are successfully applied.
Alice: Awesome. Charlie, did you style the hero section?
Charlie: I am working on the dark theme hero layouts now. I will have it finalized by tomorrow night.
Alice: Sounds good. Bob, how about the route handler calling Claude?
Bob: I will write /api/extract by Thursday to send transcripts to Claude 3.5 Sonnet and parse the JSON.
Alice: Great. I will prepare the Product Hunt marketing text by Saturday.`,
        user_id: user.id
      }).select().single()

      if (m1Err) throw m1Err

      await supabase.from('action_items').insert([
        { meeting_id: m1.id, task: 'Set up Supabase database and run schema migrations', owner: 'Bob', due_date: '2026-07-12', priority: 'high', status: 'done' },
        { meeting_id: m1.id, task: 'Finalize custom landing page hero section layouts', owner: 'Charlie', due_date: '2026-07-14', priority: 'high', status: 'open' },
        { meeting_id: m1.id, task: 'Implement Claude API extraction route handler (/api/extract)', owner: 'Bob', due_date: '2026-07-16', priority: 'medium', status: 'open' },
        { meeting_id: m1.id, task: 'Write copy and select assets for Product Hunt release', owner: 'Alice', due_date: '2026-07-19', priority: 'low', status: 'open' }
      ])

      // Meeting 2
      const { data: m2, error: m2Err } = await supabase.from('meetings').insert({
        title: 'RecapAI Q3 Marketing Planning',
        raw_transcript: `Emma: Dave, let's look at marketing. We need to decide on Google Ads budget and schedule announcements.
Dave: Yes, I have proposed a budget of $500 for Google Ads. I need your approval on that.
Emma: Checked and approved. Let's start with that.
Dave: Excellent. I will also write our first announcement newsletter template by next Wednesday.
Emma: Can we schedule a Twitter thread as well?
Dave: I wrote the launch thread today, and scheduled it to go live at launch time.`,
        user_id: user.id
      }).select().single()

      if (m2Err) throw m2Err

      await supabase.from('action_items').insert([
        { meeting_id: m2.id, task: 'Approve Google Ads Q3 budget allocation', owner: 'Emma', due_date: '2026-07-20', priority: 'high', status: 'done' },
        { meeting_id: m2.id, task: 'Draft email launch announcement newsletter template', owner: 'Dave', due_date: '2026-07-22', priority: 'medium', status: 'open' },
        { meeting_id: m2.id, task: 'Draft and schedule launch Twitter/X thread', owner: 'Dave', due_date: '2026-07-13', priority: 'low', status: 'done' }
      ])

      toast.success('Successfully loaded 2 demo meetings with action items!')
      await fetchMeetings()
    } catch (err: any) {
      toast.error('Failed to seed demo data.')
      console.error(err)
    } finally {
      setIsSeeding(false)
    }
  }

  // Filtered Meetings by search input
  const filteredMeetings = meetings.filter(m => 
    m.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Generate initials avatar with deterministic dark background colors
  const getAvatar = (name: string) => {
    const cleanName = name.trim() || 'Anyone'
    const initials = cleanName.slice(0, 2).toUpperCase()
    
    const colors = [
      'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      'bg-violet-500/10 text-violet-400 border-violet-500/20',
      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      'bg-amber-500/10 text-amber-400 border-amber-500/20',
      'bg-rose-500/10 text-rose-400 border-rose-500/20',
      'bg-sky-500/10 text-sky-400 border-sky-500/20',
      'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20',
    ]
    
    // Deterministic index based on char sum
    let charCodeSum = 0
    for (let i = 0; i < cleanName.length; i++) {
      charCodeSum += cleanName.charCodeAt(i)
    }
    const index = charCodeSum % colors.length
    
    return (
      <div className={`h-6 w-6 rounded-full border flex items-center justify-center text-[10px] font-bold tracking-tight shrink-0 select-none ${colors[index]}`} title={cleanName}>
        {initials}
      </div>
    )
  }

  // Color helper for priorities
  const getPriorityBadge = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return (
          <Badge className="bg-red-500/10 hover:bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-semibold px-2 py-0.5 capitalize flex items-center gap-1.5 w-fit">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
            high
          </Badge>
        )
      case 'medium':
        return (
          <Badge className="bg-amber-500/10 hover:bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-semibold px-2 py-0.5 capitalize flex items-center gap-1.5 w-fit">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
            medium
          </Badge>
        )
      case 'low':
        return (
          <Badge className="bg-blue-500/10 hover:bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-semibold px-2 py-0.5 capitalize flex items-center gap-1.5 w-fit">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
            low
          </Badge>
        )
    }
  }

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-950">
      {/* App Logo Area */}
      <div className="p-6 border-b border-slate-900 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-1.5 bg-indigo-600 rounded-lg text-white group-hover:bg-indigo-500 transition-colors">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-50 to-slate-300">
            RecapAI
          </span>
        </Link>
        <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 border border-indigo-500/30 bg-indigo-500/10 rounded px-1.5 py-0.5">
          MVP
        </span>
      </div>

      {/* Action button */}
      <div className="px-6 py-4">
        <Link href="/dashboard/new">
          <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg hover:shadow-indigo-500/20 gap-2 h-11 transition-all">
            <Plus className="h-4 w-4" />
            New Meeting
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="px-6 pb-4 relative">
        <Search className="absolute left-9 top-3.5 h-4 w-4 text-slate-500" />
        <Input
          placeholder="Search meetings..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-slate-900 border-slate-800 focus-visible:ring-indigo-500 pl-10 text-xs h-10 text-slate-200 placeholder-slate-500"
        />
      </div>

      {/* Meetings List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 mb-2">History</div>
        {isMeetingsLoading ? (
          <div className="space-y-2 p-2">
            <div className="h-10 bg-slate-900/50 rounded-lg animate-pulse" />
            <div className="h-10 bg-slate-900/50 rounded-lg animate-pulse" />
            <div className="h-10 bg-slate-900/50 rounded-lg animate-pulse" />
          </div>
        ) : filteredMeetings.length === 0 ? (
          <div className="text-center text-xs text-slate-500 py-8 px-2 border border-dashed border-slate-900 rounded-lg">
            No meetings found.
          </div>
        ) : (
          filteredMeetings.map((meeting) => (
            <div
              key={meeting.id}
              onClick={() => setSelectedMeetingId(meeting.id)}
              className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border ${
                selectedMeetingId === meeting.id
                  ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-200 font-medium'
                  : 'border-transparent hover:bg-slate-900/40 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex flex-col min-w-0 pr-2">
                <span className="text-sm truncate font-medium">{meeting.title}</span>
                <span className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(meeting.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* User profile & Logout */}
      <div className="p-4 border-t border-slate-900 bg-slate-950 flex flex-col gap-2">
        {userEmail && (
          <Link href="/dashboard/profile" className="flex items-center gap-2.5 px-2 py-1.5 min-w-0 hover:bg-slate-900/50 rounded-lg transition-all group">
            <div className="h-7 w-7 rounded-full overflow-hidden border border-slate-700 bg-slate-850 flex items-center justify-center shrink-0">
              {profileAvatar ? (
                <img src={profileAvatar} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                getAvatar(profileName || userEmail)
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-slate-300 truncate group-hover:text-white transition-colors">
                {profileName || 'Set Name'}
              </span>
              <span className="text-[10px] text-slate-550 truncate">{userEmail}</span>
            </div>
          </Link>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="w-full text-slate-400 hover:text-red-400 hover:bg-red-500/5 justify-start gap-2 text-xs font-medium"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-slate-950 text-slate-100 min-h-screen">
      {/* 1. DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-80 border-r border-slate-900 flex-col bg-slate-950/80 sticky top-0 h-screen max-h-screen shrink-0">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Navbar Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md p-4 flex items-center justify-between md:hidden sticky top-0 z-20 shrink-0">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                  <Menu className="h-5 w-5" />
                </Button>
              }
            />
            <SheetContent side="left" className="p-0 w-80 bg-slate-950 border-r border-slate-900 text-slate-100">
              {renderSidebarContent()}
            </SheetContent>
          </Sheet>
          <span className="font-extrabold text-sm tracking-tight text-slate-200">RecapAI</span>
        </div>
        <Link href="/dashboard/new">
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs h-8 px-2.5">
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </header>

      {/* 2. MAIN DETAIL AREA */}
      <main className="flex-1 flex flex-col overflow-y-auto max-h-screen relative">
        {!selectedMeeting ? (
          /* EMPTY STATE */
          <div className="flex-1 flex flex-col justify-center items-center p-8 max-w-xl mx-auto text-center space-y-6">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl relative">
              <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-indigo-500 rounded-full animate-ping" />
              <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-indigo-500 rounded-full" />
              <ListTodo className="h-10 w-10 text-indigo-400" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-100">Welcome to RecapAI</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                You haven't uploaded any meetings yet. Start by parsing a new meeting transcript, or seed mock data to explore the dashboard.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md justify-center">
              <Link href="/dashboard/new" className="flex-1">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg hover:shadow-indigo-500/20 py-5 h-auto transition-all">
                  <Plus className="h-4.5 w-4.5 mr-2" />
                  Add First Meeting
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={handleSeedDemoData}
                disabled={isSeeding}
                className="flex-1 border-slate-800 bg-slate-900/50 hover:bg-slate-900 text-slate-200 py-5 h-auto transition-all gap-2"
              >
                {isSeeding ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                    Seeding...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4 text-slate-400" />
                    Load Demo Data
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          /* MEETING WORKSPACE DETAIL */
          <div className="flex-1 flex flex-col">
            {/* Header section */}
            <div className="p-6 border-b border-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950/40 sticky top-0 z-10 backdrop-blur-md">
              <div className="space-y-1">
                <h1 className="text-2xl font-extrabold text-slate-50 tracking-tight">{selectedMeeting.title}</h1>
                <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-600" />
                    {new Date(selectedMeeting.created_at).toLocaleDateString(undefined, {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                  <span>|</span>
                  <span>{actionItems.length} action items</span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-2">
                {/* Export Dropdown */}
                <div className="relative group">
                  <Button variant="outline" className="border-slate-800 bg-slate-900 text-slate-200 hover:bg-slate-850 gap-2 h-10 text-xs font-semibold">
                    <Download className="h-3.5 w-3.5" />
                    Export
                  </Button>
                  {/* Dropdown Items */}
                  <div className="absolute right-0 top-11 bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-1.5 w-40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-30">
                    <button
                      onClick={() => exportToCSV(selectedMeeting.title, actionItems)}
                      className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      Export CSV
                    </button>
                    <button
                      onClick={() => exportToMarkdown(selectedMeeting, actionItems)}
                      className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      Export Markdown (.md)
                    </button>
                  </div>
                </div>

                {/* Add Manual Task Button */}
                <Button 
                  onClick={() => setIsAddDialogOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs h-10 gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Task
                </Button>

                {/* Delete Meeting */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDeleteMeeting}
                  disabled={isDeletingMeeting}
                  className="border border-slate-900 hover:bg-red-500/10 text-slate-400 hover:text-red-400 h-10 w-10 transition-colors"
                >
                  {isDeletingMeeting ? (
                    <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Main Tabs Container */}
            <div className="p-6 flex-1 flex flex-col space-y-6">

              {/* Metrics Grid */}
              {(() => {
                const total = actionItems.length
                const completed = actionItems.filter(i => i.status === 'done').length
                const progress = total > 0 ? Math.round((completed / total) * 100) : 0
                const highOpen = actionItems.filter(i => i.priority === 'high' && i.status === 'open').length

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="bg-slate-900/40 border-slate-900 shadow-md">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 shrink-0">
                          <ListTodo className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Tasks</div>
                          <div className="text-2xl font-bold mt-1 text-slate-100">{total}</div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-900/40 border-slate-900 shadow-md">
                      <CardContent className="p-4 flex flex-col justify-center min-w-0 h-full">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Completion Rate</div>
                          <span className="text-sm font-bold text-slate-200">{progress}%</span>
                        </div>
                        <div className="w-full bg-slate-950 border border-slate-850 h-2.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-indigo-600 h-full rounded-full transition-all duration-500 ease-out" 
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-900/40 border-slate-900 shadow-md">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className={`p-3 rounded-xl shrink-0 border ${
                          highOpen > 0 
                            ? 'bg-rose-500/10 border-rose-500/20 text-rose-450 animate-pulse' 
                            : 'bg-slate-800/45 border-slate-800 text-slate-400'
                        }`}>
                          <CheckSquare className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">High Priority Open</div>
                          <div className={`text-2xl font-bold mt-1 ${highOpen > 0 ? 'text-rose-450 font-extrabold' : 'text-slate-100'}`}>
                            {highOpen}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )
              })()}

              <Tabs defaultValue="actions" className="w-full flex-1 flex flex-col">
                <TabsList className="w-fit bg-slate-900 border border-slate-800 p-1 text-slate-400 self-start">
                  <TabsTrigger value="actions" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all text-xs font-semibold px-4">
                    Action Items List
                  </TabsTrigger>
                  <TabsTrigger value="kanban" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all text-xs font-semibold px-4">
                    Kanban Board
                  </TabsTrigger>
                  <TabsTrigger value="transcript" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white transition-all text-xs font-semibold px-4">
                    Raw Transcript
                  </TabsTrigger>
                </TabsList>

                {/* 2a. LIST VIEW */}
                <TabsContent value="actions" className="mt-4 flex-1">
                  {isItemsLoading ? (
                    <div className="space-y-4">
                      <div className="h-10 bg-slate-900/40 rounded-lg animate-pulse" />
                      <div className="h-24 bg-slate-900/40 rounded-lg animate-pulse" />
                      <div className="h-24 bg-slate-900/40 rounded-lg animate-pulse" />
                    </div>
                  ) : actionItems.length === 0 ? (
                    <div className="text-center py-16 px-4 border border-dashed border-slate-900 rounded-xl max-w-lg mx-auto mt-6">
                      <ListTodo className="h-8 w-8 text-slate-600 mx-auto mb-3" />
                      <h3 className="text-sm font-semibold text-slate-300">No action items found</h3>
                      <p className="text-xs text-slate-500 mt-1">No tasks are currently associated with this meeting. You can manually add one using the "Add Task" button.</p>
                    </div>
                  ) : (
                    <Card className="border-slate-850 bg-slate-900/30 backdrop-blur-xl overflow-hidden">
                      <div className="overflow-x-auto w-full">
                        <Table>
                        <TableHeader className="bg-slate-900/50 border-b border-slate-850 text-slate-400">
                          <TableRow>
                            <TableHead className="w-12"></TableHead>
                            <TableHead className="font-semibold text-slate-400 text-xs">Task</TableHead>
                            <TableHead className="w-32 font-semibold text-slate-400 text-xs">Owner</TableHead>
                            <TableHead className="w-32 font-semibold text-slate-400 text-xs">Due Date</TableHead>
                            <TableHead className="w-24 font-semibold text-slate-400 text-xs">Priority</TableHead>
                            <TableHead className="w-20 text-right font-semibold text-slate-400 text-xs">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody className="border-b border-slate-900">
                          {actionItems.map((item) => (
                            <TableRow key={item.id} className="border-b border-slate-900/60 hover:bg-slate-900/20 transition-all group">
                              <TableCell className="align-middle">
                                <button 
                                  onClick={() => handleToggleStatus(item)}
                                  className="text-slate-500 hover:text-indigo-400 transition-colors cursor-pointer"
                                >
                                  {item.status === 'done' ? (
                                    <CheckSquare className="h-4.5 w-4.5 text-indigo-500 fill-indigo-500/10" />
                                  ) : (
                                    <Square className="h-4.5 w-4.5 text-slate-650" />
                                  )}
                                </button>
                              </TableCell>
                              <TableCell className={`align-middle font-medium text-sm text-slate-200 ${item.status === 'done' ? 'line-through text-slate-500 decoration-slate-600' : ''}`}>
                                {item.task}
                              </TableCell>
                              <TableCell className="align-middle">
                                <div className="flex items-center gap-2 text-xs text-slate-355 font-medium">
                                  {getAvatar(item.owner)}
                                  <span className="truncate max-w-[120px]">{item.owner}</span>
                                </div>
                              </TableCell>
                              <TableCell className="align-middle">
                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                  <Calendar className="h-3 w-3 text-slate-500" />
                                  {item.due_date ? item.due_date : 'N/A'}
                                </span>
                              </TableCell>
                              <TableCell className="align-middle">
                                {getPriorityBadge(item.priority)}
                              </TableCell>
                              <TableCell className="align-middle text-right">
                                <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setEditingItem({ ...item })
                                      setIsEditDialogOpen(true)
                                    }}
                                    className="h-7 w-7 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
                                  >
                                    <Edit3 className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="h-7 w-7 text-slate-450 hover:text-red-400 hover:bg-red-500/5 rounded"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </Card>
                  )}
                </TabsContent>

                {/* 2b. KANBAN VIEW */}
                <TabsContent value="kanban" className="mt-4 flex-1">
                  {isItemsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                      <div className="h-64 bg-slate-900/40 rounded-lg animate-pulse" />
                      <div className="h-64 bg-slate-900/40 rounded-lg animate-pulse" />
                    </div>
                  ) : actionItems.length === 0 ? (
                    <div className="text-center py-16 px-4 border border-dashed border-slate-900 rounded-xl max-w-lg mx-auto mt-6">
                      <ListTodo className="h-8 w-8 text-slate-600 mx-auto mb-3" />
                      <h3 className="text-sm font-semibold text-slate-300">No action items found</h3>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2 items-start">
                      {/* Column Open */}
                      <div className="bg-slate-900/35 border border-slate-900 rounded-xl p-4 space-y-4">
                        <div className="flex justify-between items-center px-1">
                          <span className="font-bold text-sm text-slate-350 tracking-wide flex items-center gap-1.5">
                            <span className="h-2 w-2 bg-indigo-500 rounded-full" />
                            Open Tasks
                          </span>
                          <span className="text-xs bg-slate-800 text-slate-450 font-bold px-2 py-0.5 rounded-full border border-slate-750">
                            {actionItems.filter(i => i.status === 'open').length}
                          </span>
                        </div>
                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                          {actionItems.filter(i => i.status === 'open').length === 0 ? (
                            <div className="text-center text-xs text-slate-500 py-8 border border-dashed border-slate-850 rounded-lg bg-slate-950/20">
                              No open tasks. Let's get things done!
                            </div>
                          ) : (
                            actionItems
                              .filter(i => i.status === 'open')
                              .map(item => (
                                <Card key={item.id} className="border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 hover:border-slate-700/60 backdrop-blur-md text-slate-100 shadow-lg hover:shadow-indigo-950/5 transition-all duration-200 group relative">
                                  <CardContent className="p-4 space-y-3">
                                    <div className="text-sm font-medium text-slate-200 leading-snug pr-6">{item.task}</div>
                                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-950/50">
                                      <div className="flex items-center gap-2 text-xs text-slate-350 font-medium">
                                        {getAvatar(item.owner)}
                                        <span className="truncate max-w-[90px]">{item.owner}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {getPriorityBadge(item.priority)}
                                        {item.due_date && (
                                          <span className="text-[10px] bg-slate-950 text-slate-450 font-medium px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {item.due_date}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    {/* Action button hover overlay */}
                                    <div className="absolute right-3 top-3.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button 
                                        onClick={() => handleToggleStatus(item)}
                                        className="p-1 text-slate-400 hover:text-indigo-400 bg-slate-950 border border-slate-800 rounded transition-colors"
                                        title="Complete Task"
                                      >
                                        <Check className="h-3.5 w-3.5" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          setEditingItem({ ...item })
                                          setIsEditDialogOpen(true)
                                        }}
                                        className="p-1 text-slate-400 hover:text-white bg-slate-950 border border-slate-800 rounded transition-colors"
                                        title="Edit Task"
                                      >
                                        <Edit3 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))
                          )}
                        </div>
                      </div>

                      {/* Column Done */}
                      <div className="bg-slate-900/35 border border-slate-900 rounded-xl p-4 space-y-4">
                        <div className="flex justify-between items-center px-1">
                          <span className="font-bold text-sm text-slate-350 tracking-wide flex items-center gap-1.5">
                            <span className="h-2 w-2 bg-emerald-500 rounded-full" />
                            Completed
                          </span>
                          <span className="text-xs bg-slate-800 text-slate-450 font-bold px-2 py-0.5 rounded-full border border-slate-750">
                            {actionItems.filter(i => i.status === 'done').length}
                          </span>
                        </div>
                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                          {actionItems.filter(i => i.status === 'done').length === 0 ? (
                            <div className="text-center text-xs text-slate-500 py-8 border border-dashed border-slate-850 rounded-lg bg-slate-950/20">
                              Completed tasks will appear here.
                            </div>
                          ) : (
                            actionItems
                              .filter(i => i.status === 'done')
                              .map(item => (
                                <Card key={item.id} className="border-slate-900/60 bg-slate-900/25 text-slate-450 opacity-80 backdrop-blur-sm relative group hover:border-slate-800/80 transition-all duration-200">
                                  <CardContent className="p-4 space-y-3">
                                    <div className="text-sm font-medium line-through text-slate-450 leading-snug pr-6">{item.task}</div>
                                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-950/20">
                                      <div className="flex items-center gap-2 text-xs text-slate-455 font-medium">
                                        {getAvatar(item.owner)}
                                        <span className="truncate max-w-[90px] text-slate-500">{item.owner}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {getPriorityBadge(item.priority)}
                                      </div>
                                    </div>
                                    {/* Action button hover overlay */}
                                    <div className="absolute right-3 top-3.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button 
                                        onClick={() => handleToggleStatus(item)}
                                        className="p-1 text-slate-400 hover:text-amber-500 bg-slate-950 border border-slate-800 rounded transition-colors"
                                        title="Reopen Task"
                                      >
                                        <Loader2 className="h-3.5 w-3.5" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteItem(item.id)}
                                        className="p-1 text-slate-400 hover:text-red-400 bg-slate-950 border border-slate-800 rounded transition-colors"
                                        title="Delete Task"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* 2c. TRANSCRIPT VIEW */}
                <TabsContent value="transcript" className="mt-4 flex-1">
                  <Card className="border-slate-850 bg-slate-900/30 backdrop-blur-xl">
                    <CardHeader className="border-b border-slate-850/60 py-4">
                      <CardTitle className="text-sm font-semibold text-slate-300">Original Transcript Text</CardTitle>
                      <CardDescription className="text-xs text-slate-500">The raw text processed by Claude AI to extract action items.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <pre className="text-sm font-mono text-slate-350 leading-relaxed whitespace-pre-wrap max-h-[500px] overflow-y-auto bg-slate-950/60 p-4 rounded-lg border border-slate-900">
                        {selectedMeeting.raw_transcript}
                      </pre>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </main>

      {/* 3. EDIT TASK DIALOG */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-850 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Edit Action Item</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Make changes to the action item. Updates sync back to database on save.
            </DialogDescription>
          </DialogHeader>

          {editingItem && (
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="edit-task">Task Description</Label>
                <Input
                  id="edit-task"
                  value={editingItem.task || ''}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, task: e.target.value }))}
                  className="bg-slate-950 border-slate-850 focus-visible:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-owner">Owner</Label>
                  <Input
                    id="edit-owner"
                    value={editingItem.owner || ''}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, owner: e.target.value }))}
                    className="bg-slate-950 border-slate-850 focus-visible:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-duedate">Due Date</Label>
                  <Input
                    id="edit-duedate"
                    type="date"
                    value={editingItem.due_date || ''}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, due_date: e.target.value }))}
                    className="bg-slate-950 border-slate-850 focus-visible:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-priority">Priority</Label>
                <select
                  id="edit-priority"
                  value={editingItem.priority || 'medium'}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full rounded-md border border-slate-850 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="border-slate-805 bg-slate-950 hover:bg-slate-900 text-slate-300">
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 4. ADD TASK DIALOG */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-850 text-slate-100">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Add Action Item</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Manually add a task to the action items list.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="add-task">Task Description</Label>
              <Input
                id="add-task"
                placeholder="e.g. Follow up with design partners for feedback"
                value={newItem.task}
                onChange={(e) => setNewItem(prev => ({ ...prev, task: e.target.value }))}
                className="bg-slate-950 border-slate-850 focus-visible:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="add-owner">Owner</Label>
                <Input
                  id="add-owner"
                  placeholder="e.g. Alice"
                  value={newItem.owner}
                  onChange={(e) => setNewItem(prev => ({ ...prev, owner: e.target.value }))}
                  className="bg-slate-950 border-slate-850 focus-visible:ring-indigo-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="add-duedate">Due Date</Label>
                <Input
                  id="add-duedate"
                  type="date"
                  value={newItem.due_date}
                  onChange={(e) => setNewItem(prev => ({ ...prev, due_date: e.target.value }))}
                  className="bg-slate-950 border-slate-850 focus-visible:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="add-priority">Priority</Label>
              <select
                id="add-priority"
                value={newItem.priority}
                onChange={(e) => setNewItem(prev => ({ ...prev, priority: e.target.value as any }))}
                className="w-full rounded-md border border-slate-850 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="border-slate-805 bg-slate-950 hover:bg-slate-900 text-slate-300">
              Cancel
            </Button>
            <Button onClick={handleAddManualItem} className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 5. 2FA (MFA) CHALLENGE DIALOG OVERLAY */}
      {isMfaChallengeActive && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 select-none">
          <Card className="max-w-md w-full border-slate-800 bg-slate-900 text-slate-100 shadow-2xl animate-in fade-in-50 zoom-in-95">
            <CardHeader className="text-center space-y-2">
              <div className="mx-auto p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full w-fit">
                <Lock className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl font-bold">Two-Factor Authentication</CardTitle>
              <CardDescription className="text-slate-400 text-xs">
                Your account is protected by 2FA. Please enter the 6-digit security code from your authenticator app to access your dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="000000"
                  maxLength={6}
                  value={mfaChallengeCode}
                  onChange={(e) => setMfaChallengeCode(e.target.value.replace(/\D/g, ''))}
                  className="bg-slate-950 border-slate-850 text-center tracking-widest text-lg font-bold h-12 focus-visible:ring-indigo-500 text-slate-100"
                  disabled={isVerifyingChallenge}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button
                onClick={handleVerifyChallenge}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold h-11"
                disabled={isVerifyingChallenge}
              >
                {isVerifyingChallenge ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Code'
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex justify-center items-center bg-slate-950 text-slate-100 min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-505" />
          <p className="text-sm text-slate-400 font-medium">Loading RecapAI Dashboard...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
