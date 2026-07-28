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
import { ThemeToggle } from '@/components/theme-toggle'
import { Logo } from '@/components/logo'
import { toast } from 'sonner'
import { 
  Calendar, 
  Check, 
  CheckSquare, 
  Database, 
  Download, 
  Edit3, 
  FileText, 
  GripVertical,
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

const DEFAULT_DEMO_MEETINGS: Meeting[] = [
  {
    id: 'demo-meeting-1',
    title: 'RecapAI MVP Launch Alignment',
    raw_transcript: `Alice: Hey team, we need to launch the RecapAI MVP on Vercel by this Friday. Bob, are migrations run?
Bob: Yes, I completed the PostgreSQL database tables configuration and RLS policies yesterday. All migrations are successfully applied.
Alice: Awesome. Charlie, did you style the hero section?
Charlie: I am working on the dark theme hero layouts now. I will have it finalized by tomorrow night.
Alice: Sounds good. Bob, how about the route handler calling Claude?
Bob: I will write /api/extract by Thursday to send transcripts to Claude 3.5 Sonnet and parse the JSON.
Alice: Great. I will prepare the Product Hunt marketing text by Saturday.`,
    created_at: new Date().toISOString(),
    user_id: 'demo-user'
  },
  {
    id: 'demo-meeting-2',
    title: 'RecapAI Q3 Marketing Planning',
    raw_transcript: `Emma: Dave, let's look at marketing. We need to decide on Google Ads budget and schedule announcements.
Dave: Yes, I have proposed a budget of $500 for Google Ads. I need your approval on that.
Emma: Checked and approved. Let's start with that.
Dave: Excellent. I will also write our first announcement newsletter template by next Wednesday.
Emma: Can we schedule a Twitter thread as well?
Dave: I wrote the launch thread today, and scheduled it to go live at launch time.`,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    user_id: 'demo-user'
  }
]

const DEFAULT_DEMO_ITEMS: Record<string, ActionItem[]> = {
  'demo-meeting-1': [
    { id: 'item-1', meeting_id: 'demo-meeting-1', task: 'Set up Supabase database and run schema migrations', owner: 'Bob', due_date: '2026-07-12', priority: 'high', status: 'done', created_at: new Date().toISOString() },
    { id: 'item-2', meeting_id: 'demo-meeting-1', task: 'Finalize custom landing page hero section layouts', owner: 'Charlie', due_date: '2026-07-14', priority: 'high', status: 'open', created_at: new Date().toISOString() },
    { id: 'item-3', meeting_id: 'demo-meeting-1', task: 'Implement Claude API extraction route handler (/api/extract)', owner: 'Bob', due_date: '2026-07-16', priority: 'medium', status: 'open', created_at: new Date().toISOString() },
    { id: 'item-4', meeting_id: 'demo-meeting-1', task: 'Write copy and select assets for Product Hunt release', owner: 'Alice', due_date: '2026-07-19', priority: 'low', status: 'open', created_at: new Date().toISOString() }
  ],
  'demo-meeting-2': [
    { id: 'item-5', meeting_id: 'demo-meeting-2', task: 'Approve Google Ads Q3 budget allocation', owner: 'Emma', due_date: '2026-07-20', priority: 'high', status: 'done', created_at: new Date().toISOString() },
    { id: 'item-6', meeting_id: 'demo-meeting-2', task: 'Draft email launch announcement newsletter template', owner: 'Dave', due_date: '2026-07-22', priority: 'medium', status: 'open', created_at: new Date().toISOString() },
    { id: 'item-7', meeting_id: 'demo-meeting-2', task: 'Draft and schedule launch Twitter/X thread', owner: 'Dave', due_date: '2026-07-13', priority: 'low', status: 'done', created_at: new Date().toISOString() }
  ]
}

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

  // Mobile menu sheet state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Loading States
  const [isMeetingsLoading, setIsMeetingsLoading] = useState(true)
  const [isItemsLoading, setIsItemsLoading] = useState(false)
  const [isSeeding, setIsSeeding] = useState(false)
  const [isDeletingMeeting, setIsDeletingMeeting] = useState(false)

  // Drag and Drop States
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<'open' | 'done' | null>(null)

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
      try {
        const { data } = await supabase.auth.getUser()
        if (data?.user) {
          setUserEmail(data.user.email ?? null)
          fetchProfile(data.user.id)
        } else {
          setUserEmail('demo@recapai.com')
          setProfileName('Demo User')
        }
        await fetchMeetings()
      } catch (err) {
        setUserEmail('demo@recapai.com')
        setProfileName('Demo User')
        setMeetings(DEFAULT_DEMO_MEETINGS)
        setIsMeetingsLoading(false)
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
      console.warn('Error loading profile:', err)
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

      if (error || !data || data.length === 0) {
        setMeetings(DEFAULT_DEMO_MEETINGS)
      } else {
        setMeetings(data)
      }
    } catch (err: any) {
      setMeetings(DEFAULT_DEMO_MEETINGS)
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

      if (error || !data || data.length === 0) {
        setActionItems(DEFAULT_DEMO_ITEMS[meetingId] || DEFAULT_DEMO_ITEMS['demo-meeting-1'])
      } else {
        setActionItems(data)
      }
    } catch (err: any) {
      setActionItems(DEFAULT_DEMO_ITEMS[meetingId] || DEFAULT_DEMO_ITEMS['demo-meeting-1'])
    } finally {
      setIsItemsLoading(false)
    }
  }

  // Auth logout
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (e) {}
    toast.success('Logged out successfully.')
    router.push('/login')
  }

  // Toggles Status between open / done
  const handleToggleStatus = async (item: ActionItem) => {
    const newStatus = item.status === 'open' ? 'done' : 'open'
    
    // Optimistic Update
    setActionItems(prev => prev.map(i => i.id === item.id ? { ...i, status: newStatus } : i))
    toast.success(`Marked task as ${newStatus === 'done' ? 'completed' : 'open'}`)

    try {
      await supabase
        .from('action_items')
        .update({ status: newStatus })
        .eq('id', item.id)
    } catch (err) {}
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, item: ActionItem) => {
    e.dataTransfer.setData('text/plain', item.id)
    e.dataTransfer.effectAllowed = 'move'
    setDraggedItemId(item.id)
  }

  const handleDragEnd = () => {
    setDraggedItemId(null)
    setDragOverColumn(null)
  }

  const handleDragOver = (e: React.DragEvent, targetStatus: 'open' | 'done') => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverColumn !== targetStatus) {
      setDragOverColumn(targetStatus)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverColumn(null)
    }
  }

  const handleDrop = async (e: React.DragEvent, targetStatus: 'open' | 'done') => {
    e.preventDefault()
    setDragOverColumn(null)
    const itemId = e.dataTransfer.getData('text/plain') || draggedItemId
    if (!itemId) return

    const item = actionItems.find(i => i.id === itemId)
    if (!item || item.status === targetStatus) {
      setDraggedItemId(null)
      return
    }

    // Optimistic Update
    setActionItems(prev => prev.map(i => i.id === itemId ? { ...i, status: targetStatus } : i))
    setDraggedItemId(null)
    toast.success(`Task moved to ${targetStatus === 'done' ? 'Completed' : 'Open Tasks'}`)

    try {
      await supabase
        .from('action_items')
        .update({ status: targetStatus })
        .eq('id', itemId)
    } catch (err) {}
  }

  // Delete Action Item
  const handleDeleteItem = async (id: string) => {
    setActionItems(prev => prev.filter(i => i.id !== id))
    toast.success('Action item deleted.')

    try {
      await supabase
        .from('action_items')
        .delete()
        .eq('id', id)
    } catch (err) {}
  }

  // Save changes from Edit Dialog
  const handleSaveEdit = async () => {
    if (!editingItem || !editingItem.id || !editingItem.task?.trim() || !editingItem.owner?.trim()) {
      toast.error('Task description and Owner are required.')
      return
    }

    setActionItems(prev => prev.map(i => i.id === editingItem.id ? (editingItem as ActionItem) : i))
    setIsEditDialogOpen(false)
    setEditingItem(null)
    toast.success('Action item updated.')

    try {
      await supabase
        .from('action_items')
        .update({
          task: editingItem.task.trim(),
          owner: editingItem.owner.trim(),
          due_date: editingItem.due_date || null,
          priority: editingItem.priority
        })
        .eq('id', editingItem.id)
    } catch (err) {}
  }

  // Insert a manually added Action Item
  const handleAddManualItem = async () => {
    if (!newItem.task.trim() || !newItem.owner.trim()) {
      toast.error('Task description and Owner are required.')
      return
    }

    if (!selectedMeetingId) return

    const createdItem: ActionItem = {
      id: `custom-item-${Date.now()}`,
      meeting_id: selectedMeetingId,
      task: newItem.task.trim(),
      owner: newItem.owner.trim(),
      due_date: newItem.due_date || null,
      priority: newItem.priority,
      status: 'open',
      created_at: new Date().toISOString()
    }

    setActionItems(prev => [...prev, createdItem])
    setIsAddDialogOpen(false)
    setNewItem({ task: '', owner: '', due_date: '', priority: 'medium' })
    toast.success('New action item added.')

    try {
      await supabase
        .from('action_items')
        .insert({
          meeting_id: selectedMeetingId,
          task: newItem.task.trim(),
          owner: newItem.owner.trim(),
          due_date: newItem.due_date || null,
          priority: newItem.priority,
          status: 'open'
        })
    } catch (err) {}
  }

  // Delete Meeting
  const handleDeleteMeeting = async () => {
    if (!selectedMeetingId || !selectedMeeting) return
    const confirmDelete = window.confirm(`Are you sure you want to delete "${selectedMeeting.title}" and all its action items?`)
    if (!confirmDelete) return

    setIsDeletingMeeting(true)
    const remainingMeetings = meetings.filter(m => m.id !== selectedMeetingId)
    setMeetings(remainingMeetings)
    if (remainingMeetings.length > 0) {
      setSelectedMeetingId(remainingMeetings[0].id)
    } else {
      setSelectedMeetingId(null)
    }
    toast.success('Meeting deleted successfully.')
    setIsDeletingMeeting(false)

    try {
      await supabase
        .from('meetings')
        .delete()
        .eq('id', selectedMeetingId)
    } catch (err) {}
  }

  // Seeder Function
  const handleSeedDemoData = async () => {
    setIsSeeding(true)
    setMeetings(DEFAULT_DEMO_MEETINGS)
    setSelectedMeetingId(DEFAULT_DEMO_MEETINGS[0].id)
    setActionItems(DEFAULT_DEMO_ITEMS['demo-meeting-1'])
    toast.success('Loaded demo meetings and action items!')
    setIsSeeding(false)
  }

  // Filtered Meetings by search input
  const filteredMeetings = meetings.filter(m => 
    m.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Generate initials avatar
  const getAvatar = (name: string) => {
    const cleanName = name.trim() || 'Anyone'
    const initials = cleanName.slice(0, 2).toUpperCase()
    
    const colors = [
      'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
      'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30',
      'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
      'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
      'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30',
      'bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-500/30',
    ]
    
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
          <Badge className="bg-red-500/10 hover:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-[10px] font-semibold px-2 py-0.5 capitalize flex items-center gap-1.5 w-fit">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
            high
          </Badge>
        )
      case 'medium':
        return (
          <Badge className="bg-amber-500/10 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-semibold px-2 py-0.5 capitalize flex items-center gap-1.5 w-fit">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
            medium
          </Badge>
        )
      case 'low':
        return (
          <Badge className="bg-blue-500/10 hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] font-semibold px-2 py-0.5 capitalize flex items-center gap-1.5 w-fit">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
            low
          </Badge>
        )
    }
  }

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-card/95 backdrop-blur-md border-r border-border/80">
      {/* App Logo Area */}
      <div className="p-6 border-b border-border flex items-center justify-between">
        <Link href="/" className="flex items-center group">
          <Logo showBadge size="sm" />
        </Link>
        <ThemeToggle />
      </div>

      {/* Action button */}
      <div className="px-6 py-4">
        <Link href="/dashboard/new">
          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm gap-2 h-10 transition-all">
            <Plus className="h-4 w-4" />
            New Meeting
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="px-6 pb-4 relative">
        <Search className="absolute left-9 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search meetings..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-background border-input focus-visible:ring-primary pl-10 text-xs h-9 text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {/* Meetings List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1">
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2 mb-2">History</div>
        {isMeetingsLoading ? (
          <div className="space-y-2 p-2">
            <div className="h-10 bg-muted/60 rounded-lg animate-pulse" />
            <div className="h-10 bg-muted/60 rounded-lg animate-pulse" />
            <div className="h-10 bg-muted/60 rounded-lg animate-pulse" />
          </div>
        ) : filteredMeetings.length === 0 ? (
          <div className="text-center text-xs text-muted-foreground py-8 px-2 border border-dashed border-border rounded-lg">
            No meetings found.
          </div>
        ) : (
          filteredMeetings.map((meeting) => (
            <div
              key={meeting.id}
              onClick={() => {
                setSelectedMeetingId(meeting.id)
                setIsMobileMenuOpen(false)
              }}
              className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border ${
                selectedMeetingId === meeting.id
                  ? 'bg-primary/10 border-primary/30 text-primary font-medium shadow-xs'
                  : 'border-transparent hover:bg-accent hover:text-accent-foreground text-muted-foreground'
              }`}
            >
              <div className="flex flex-col min-w-0 pr-2">
                <span className="text-sm truncate font-medium text-foreground">{meeting.title}</span>
                <span className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(meeting.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* User profile & Logout */}
      <div className="p-4 border-t border-border bg-card flex flex-col gap-2">
        {userEmail && (
          <Link href="/dashboard/profile" className="flex items-center gap-2.5 px-2 py-1.5 min-w-0 hover:bg-accent rounded-lg transition-all group">
            <div className="h-7 w-7 rounded-full overflow-hidden border border-border bg-muted flex items-center justify-center shrink-0">
              {profileAvatar ? (
                <img src={profileAvatar} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                getAvatar(profileName || userEmail)
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {profileName || 'Set Name'}
              </span>
              <span className="text-[10px] text-muted-foreground truncate">{userEmail}</span>
            </div>
          </Link>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 justify-start gap-2 text-xs font-medium"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-transparent bg-app-wallpaper text-foreground min-h-screen z-10">
      {/* 1. DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-72 lg:w-80 border-r border-border/80 flex-col bg-card/95 backdrop-blur-md sticky top-0 h-screen max-h-screen shrink-0 z-10 shadow-sm">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Navbar Header */}
      <header className="border-b border-border/80 bg-background/95 backdrop-blur-md p-4 flex items-center justify-between md:hidden sticky top-0 z-20 shrink-0 shadow-xs">
        <div className="flex items-center gap-2">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <Menu className="h-5 w-5" />
                </Button>
              }
            />
            <SheetContent side="left" className="p-0 w-80 bg-card border-r border-border text-foreground">
              {renderSidebarContent()}
            </SheetContent>
          </Sheet>
          <Link href="/">
            <Logo size="sm" />
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/dashboard/new">
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-8 px-2.5">
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* 2. MAIN DETAIL AREA */}
      <main className="flex-1 flex flex-col overflow-y-auto max-h-screen relative">
        {!selectedMeeting ? (
          /* EMPTY STATE */
          <div className="flex-1 flex flex-col justify-center items-center p-8 max-w-xl mx-auto text-center space-y-6">
            <div className="p-4 bg-card border border-border rounded-2xl relative shadow-md">
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-ping" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full" />
              <ListTodo className="h-10 w-10 text-primary" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Welcome to RecapAI</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You haven't uploaded any meetings yet. Start by parsing a new meeting transcript, or seed mock data to explore the dashboard.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md justify-center">
              <Link href="/dashboard/new" className="flex-1">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md py-5 h-auto transition-all">
                  <Plus className="h-4.5 w-4.5 mr-2" />
                  Add First Meeting
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={handleSeedDemoData}
                disabled={isSeeding}
                className="flex-1 border-border bg-card hover:bg-accent text-foreground py-5 h-auto transition-all gap-2"
              >
                {isSeeding ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    Seeding...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4 text-muted-foreground" />
                    Load Demo Data
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          /* MEETING WORKSPACE DETAIL */
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header section */}
            <div className="p-4 sm:p-6 border-b border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card/95 sticky top-0 z-10 backdrop-blur-md shadow-xs">
              <div className="space-y-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight truncate">{selectedMeeting.title}</h1>
                <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    {new Date(selectedMeeting.created_at).toLocaleDateString(undefined, {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                  <span>•</span>
                  <span>{actionItems.length} action items</span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Export Dropdown */}
                <div className="relative group">
                  <Button variant="outline" className="border-border bg-card text-foreground hover:bg-accent gap-2 h-9 text-xs font-semibold">
                    <Download className="h-3.5 w-3.5" />
                    Export
                  </Button>
                  {/* Dropdown Items */}
                  <div className="absolute right-0 top-10 bg-popover border border-border rounded-lg shadow-lg py-1.5 w-44 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-30">
                    <button
                      onClick={() => exportToCSV(selectedMeeting.title, actionItems)}
                      className="w-full text-left px-4 py-2 text-xs text-foreground hover:bg-accent transition-colors"
                    >
                      Export CSV
                    </button>
                    <button
                      onClick={() => exportToMarkdown(selectedMeeting, actionItems)}
                      className="w-full text-left px-4 py-2 text-xs text-foreground hover:bg-accent transition-colors"
                    >
                      Export Markdown (.md)
                    </button>
                  </div>
                </div>

                {/* Add Manual Task Button */}
                <Button 
                  onClick={() => setIsAddDialogOpen(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-9 gap-1.5"
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
                  className="border border-border hover:bg-destructive/10 text-muted-foreground hover:text-destructive h-9 w-9 transition-colors"
                >
                  {isDeletingMeeting ? (
                    <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Main Tabs Container */}
            <div className="p-4 sm:p-6 flex-1 flex flex-col space-y-6 min-w-0">

              {/* Metrics Grid */}
              {(() => {
                const total = actionItems.length
                const completed = actionItems.filter(i => i.status === 'done').length
                const progress = total > 0 ? Math.round((completed / total) * 100) : 0
                const highOpen = actionItems.filter(i => i.priority === 'high' && i.status === 'open').length

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="bg-card/95 border-border/80 shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-primary shrink-0">
                          <ListTodo className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Total Tasks</div>
                          <div className="text-2xl font-bold mt-0.5 text-foreground">{total}</div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-card/95 border-border/80 shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-4 flex flex-col justify-center min-w-0 h-full">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Completion Rate</div>
                          <span className="text-sm font-bold text-foreground">{progress}%</span>
                        </div>
                        <div className="w-full bg-muted border border-border h-2.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-primary h-full rounded-full transition-all duration-500 ease-out" 
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-card/95 border-border/80 shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className={`p-3 rounded-xl shrink-0 border ${
                          highOpen > 0 
                            ? 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400 animate-pulse' 
                            : 'bg-muted border-border text-muted-foreground'
                        }`}>
                          <CheckSquare className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">High Priority Open</div>
                          <div className={`text-2xl font-bold mt-0.5 ${highOpen > 0 ? 'text-red-600 dark:text-red-400 font-extrabold' : 'text-foreground'}`}>
                            {highOpen}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )
              })()}

              <Tabs defaultValue="kanban" className="w-full flex-1 flex flex-col min-w-0">
                <TabsList className="w-fit bg-muted border border-border p-1 text-muted-foreground self-start flex-wrap">
                  <TabsTrigger value="kanban" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all text-xs font-semibold px-4">
                    Kanban Board
                  </TabsTrigger>
                  <TabsTrigger value="actions" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all text-xs font-semibold px-4">
                    Action Items List
                  </TabsTrigger>
                  <TabsTrigger value="transcript" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all text-xs font-semibold px-4">
                    Raw Transcript
                  </TabsTrigger>
                </TabsList>

                {/* KANBAN VIEW (WITH FULL DRAG AND DROP) */}
                <TabsContent value="kanban" className="mt-4 flex-1">
                  {isItemsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                      <div className="h-64 bg-muted/60 rounded-xl animate-pulse" />
                      <div className="h-64 bg-muted/60 rounded-xl animate-pulse" />
                    </div>
                  ) : actionItems.length === 0 ? (
                    <div className="text-center py-16 px-4 border border-dashed border-border rounded-xl max-w-lg mx-auto mt-6">
                      <ListTodo className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                      <h3 className="text-sm font-semibold text-foreground">No action items found</h3>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2 items-start">
                      
                      {/* Column 1: Open Tasks */}
                      <div 
                        onDragOver={(e) => handleDragOver(e, 'open')}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, 'open')}
                        className={`bg-card/95 backdrop-blur-md border rounded-xl p-4 space-y-4 shadow-sm transition-all duration-200 ${
                          dragOverColumn === 'open' 
                            ? 'border-primary ring-2 ring-primary/20 bg-primary/5' 
                            : 'border-border/80'
                        }`}
                      >
                        <div className="flex justify-between items-center px-1">
                          <span className="font-bold text-sm text-foreground tracking-wide flex items-center gap-2">
                            <span className="h-2.5 w-2.5 bg-primary rounded-full" />
                            Open Tasks
                          </span>
                          <span className="text-xs bg-muted text-foreground font-bold px-2 py-0.5 rounded-full border border-border">
                            {actionItems.filter(i => i.status === 'open').length}
                          </span>
                        </div>

                        <div className="space-y-3 min-h-[160px] max-h-[600px] overflow-y-auto pr-1">
                          {actionItems.filter(i => i.status === 'open').length === 0 ? (
                            <div className="text-center text-xs text-muted-foreground py-10 border border-dashed border-border rounded-lg bg-muted/30">
                              {dragOverColumn === 'open' ? 'Drop task here to reopen' : 'No open tasks. Drag completed tasks here!'}
                            </div>
                          ) : (
                            actionItems
                              .filter(i => i.status === 'open')
                              .map(item => (
                                <Card 
                                  key={item.id}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, item)}
                                  onDragEnd={handleDragEnd}
                                  className={`border-border bg-card hover:border-primary/50 text-card-foreground shadow-xs hover:shadow-md transition-all duration-200 group relative cursor-grab active:cursor-grabbing ${
                                    draggedItemId === item.id ? 'opacity-40 scale-[0.98] border-dashed border-primary' : ''
                                  }`}
                                >
                                  <CardContent className="p-4 space-y-3">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="text-sm font-medium text-foreground leading-snug pr-4 flex-1">
                                        {item.task}
                                      </div>
                                      <GripVertical className="h-4 w-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 cursor-grab" />
                                    </div>

                                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60">
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                        {getAvatar(item.owner)}
                                        <span className="truncate max-w-[90px]">{item.owner}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {getPriorityBadge(item.priority)}
                                        {item.due_date && (
                                          <span className="text-[10px] bg-muted text-muted-foreground font-medium px-2 py-0.5 rounded border border-border flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {item.due_date}
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Quick Hover Action Overlay */}
                                    <div className="absolute right-3 top-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-card/90 p-1 rounded-md border border-border">
                                      <button 
                                        onClick={() => handleToggleStatus(item)}
                                        className="p-1 text-muted-foreground hover:text-emerald-500 transition-colors"
                                        title="Mark Done"
                                      >
                                        <Check className="h-3.5 w-3.5" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          setEditingItem({ ...item })
                                          setIsEditDialogOpen(true)
                                        }}
                                        className="p-1 text-muted-foreground hover:text-primary transition-colors"
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

                      {/* Column 2: Completed Tasks */}
                      <div 
                        onDragOver={(e) => handleDragOver(e, 'done')}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, 'done')}
                        className={`bg-card/95 backdrop-blur-md border rounded-xl p-4 space-y-4 shadow-sm transition-all duration-200 ${
                          dragOverColumn === 'done' 
                            ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-500/5' 
                            : 'border-border/80'
                        }`}
                      >
                        <div className="flex justify-between items-center px-1">
                          <span className="font-bold text-sm text-foreground tracking-wide flex items-center gap-2">
                            <span className="h-2.5 w-2.5 bg-emerald-500 rounded-full" />
                            Completed
                          </span>
                          <span className="text-xs bg-muted text-foreground font-bold px-2 py-0.5 rounded-full border border-border">
                            {actionItems.filter(i => i.status === 'done').length}
                          </span>
                        </div>

                        <div className="space-y-3 min-h-[160px] max-h-[600px] overflow-y-auto pr-1">
                          {actionItems.filter(i => i.status === 'done').length === 0 ? (
                            <div className="text-center text-xs text-muted-foreground py-10 border border-dashed border-border rounded-lg bg-muted/30">
                              {dragOverColumn === 'done' ? 'Drop task here to complete' : 'Drag tasks here when completed!'}
                            </div>
                          ) : (
                            actionItems
                              .filter(i => i.status === 'done')
                              .map(item => (
                                <Card 
                                  key={item.id}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, item)}
                                  onDragEnd={handleDragEnd}
                                  className={`border-border bg-card/60 text-muted-foreground backdrop-blur-xs relative group hover:border-emerald-500/40 transition-all duration-200 cursor-grab active:cursor-grabbing ${
                                    draggedItemId === item.id ? 'opacity-40 scale-[0.98] border-dashed border-emerald-500' : ''
                                  }`}
                                >
                                  <CardContent className="p-4 space-y-3">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="text-sm font-medium line-through text-muted-foreground leading-snug pr-4 flex-1">
                                        {item.task}
                                      </div>
                                      <GripVertical className="h-4 w-4 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 cursor-grab" />
                                    </div>

                                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/50">
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                        {getAvatar(item.owner)}
                                        <span className="truncate max-w-[90px] text-muted-foreground">{item.owner}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {getPriorityBadge(item.priority)}
                                      </div>
                                    </div>

                                    {/* Action button overlay */}
                                    <div className="absolute right-3 top-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-card/90 p-1 rounded-md border border-border">
                                      <button 
                                        onClick={() => handleToggleStatus(item)}
                                        className="p-1 text-muted-foreground hover:text-amber-500 transition-colors"
                                        title="Reopen Task"
                                      >
                                        <Square className="h-3.5 w-3.5" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteItem(item.id)}
                                        className="p-1 text-muted-foreground hover:text-destructive transition-colors"
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

                {/* LIST VIEW */}
                <TabsContent value="actions" className="mt-4 flex-1">
                  {isItemsLoading ? (
                    <div className="space-y-4">
                      <div className="h-10 bg-muted/60 rounded-lg animate-pulse" />
                      <div className="h-24 bg-muted/60 rounded-lg animate-pulse" />
                      <div className="h-24 bg-muted/60 rounded-lg animate-pulse" />
                    </div>
                  ) : actionItems.length === 0 ? (
                    <div className="text-center py-16 px-4 border border-dashed border-border rounded-xl max-w-lg mx-auto mt-6">
                      <ListTodo className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                      <h3 className="text-sm font-semibold text-foreground">No action items found</h3>
                      <p className="text-xs text-muted-foreground mt-1">No tasks are currently associated with this meeting. You can manually add one using the "Add Task" button.</p>
                    </div>
                  ) : (
                    <Card className="border-border bg-card shadow-xs overflow-hidden">
                      <div className="overflow-x-auto w-full">
                        <Table>
                          <TableHeader className="bg-muted/50 border-b border-border text-muted-foreground">
                            <TableRow>
                              <TableHead className="w-12"></TableHead>
                              <TableHead className="font-semibold text-muted-foreground text-xs">Task</TableHead>
                              <TableHead className="w-32 font-semibold text-muted-foreground text-xs">Owner</TableHead>
                              <TableHead className="w-32 font-semibold text-muted-foreground text-xs">Due Date</TableHead>
                              <TableHead className="w-24 font-semibold text-muted-foreground text-xs">Priority</TableHead>
                              <TableHead className="w-20 text-right font-semibold text-muted-foreground text-xs">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody className="divide-y divide-border">
                            {actionItems.map((item) => (
                              <TableRow key={item.id} className="hover:bg-accent/40 transition-colors group">
                                <TableCell className="align-middle">
                                  <button 
                                    onClick={() => handleToggleStatus(item)}
                                    className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                                  >
                                    {item.status === 'done' ? (
                                      <CheckSquare className="h-4.5 w-4.5 text-primary" />
                                    ) : (
                                      <Square className="h-4.5 w-4.5 text-muted-foreground" />
                                    )}
                                  </button>
                                </TableCell>
                                <TableCell className={`align-middle font-medium text-sm text-foreground ${item.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                                  {item.task}
                                </TableCell>
                                <TableCell className="align-middle">
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                    {getAvatar(item.owner)}
                                    <span className="truncate max-w-[120px]">{item.owner}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="align-middle">
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3 w-3 text-muted-foreground" />
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
                                      className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-accent rounded"
                                    >
                                      <Edit3 className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDeleteItem(item.id)}
                                      className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded"
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

                {/* TRANSCRIPT VIEW */}
                <TabsContent value="transcript" className="mt-4 flex-1">
                  <Card className="border-border bg-card">
                    <CardHeader className="border-b border-border py-4">
                      <CardTitle className="text-sm font-semibold text-foreground">Original Transcript Text</CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">The raw text processed by Claude AI to extract action items.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <pre className="text-sm font-mono text-foreground leading-relaxed whitespace-pre-wrap max-h-[500px] overflow-y-auto bg-muted/60 p-4 rounded-lg border border-border">
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
        <DialogContent className="bg-popover border-border text-popover-foreground">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Edit Action Item</DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
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
                  className="bg-background border-input focus-visible:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-owner">Owner</Label>
                  <Input
                    id="edit-owner"
                    value={editingItem.owner || ''}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, owner: e.target.value }))}
                    className="bg-background border-input focus-visible:ring-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-duedate">Due Date</Label>
                  <Input
                    id="edit-duedate"
                    type="date"
                    value={editingItem.due_date || ''}
                    onChange={(e) => setEditingItem(prev => ({ ...prev, due_date: e.target.value }))}
                    className="bg-background border-input focus-visible:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-priority">Priority</Label>
                <select
                  id="edit-priority"
                  value={editingItem.priority || 'medium'}
                  onChange={(e) => setEditingItem(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="border-border bg-background hover:bg-accent text-foreground">
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 4. ADD TASK DIALOG */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-popover border-border text-popover-foreground">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Add Action Item</DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
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
                className="bg-background border-input focus-visible:ring-primary"
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
                  className="bg-background border-input focus-visible:ring-primary"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="add-duedate">Due Date</Label>
                <Input
                  id="add-duedate"
                  type="date"
                  value={newItem.due_date}
                  onChange={(e) => setNewItem(prev => ({ ...prev, due_date: e.target.value }))}
                  className="bg-background border-input focus-visible:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="add-priority">Priority</Label>
              <select
                id="add-priority"
                value={newItem.priority}
                onChange={(e) => setNewItem(prev => ({ ...prev, priority: e.target.value as any }))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="border-border bg-background hover:bg-accent text-foreground">
              Cancel
            </Button>
            <Button onClick={handleAddManualItem} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 5. 2FA (MFA) CHALLENGE DIALOG OVERLAY */}
      {isMfaChallengeActive && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-50 p-4 select-none">
          <Card className="max-w-md w-full border-border bg-card text-card-foreground shadow-2xl animate-in fade-in-50 zoom-in-95">
            <CardHeader className="text-center space-y-2">
              <div className="mx-auto p-3 bg-primary/10 border border-primary/20 text-primary rounded-full w-fit">
                <Lock className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl font-bold">Two-Factor Authentication</CardTitle>
              <CardDescription className="text-muted-foreground text-xs">
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
                  className="bg-background border-input text-center tracking-widest text-lg font-bold h-12 focus-visible:ring-primary text-foreground"
                  disabled={isVerifyingChallenge}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button
                onClick={handleVerifyChallenge}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11"
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
      <div className="flex-1 flex justify-center items-center bg-background text-foreground min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-medium">Loading RecapAI Dashboard...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
