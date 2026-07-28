'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ThemeToggle } from '@/components/theme-toggle'
import { toast } from 'sonner'
import { ArrowLeft, FileText, Loader2, Sparkles, Upload } from 'lucide-react'
import Link from 'next/link'

export default function NewMeetingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState('')
  const [transcript, setTranscript] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'text/plain' && !file.name.endsWith('.txt')) {
      toast.error('Only plain text (.txt) files are supported.')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      setTranscript(text)
      toast.success(`Successfully loaded transcript from ${file.name}`)
      // Auto-populate title if empty
      if (!title) {
        const fileTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ')
        setTitle(fileTitle.charAt(0).toUpperCase() + fileTitle.slice(1))
      }
    }
    reader.onerror = () => {
      toast.error('Failed to read the file.')
    }
    reader.readAsText(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error('Please enter a meeting title.')
      return
    }

    if (!transcript.trim()) {
      toast.error('Please paste or upload a transcript.')
      return
    }

    setIsSubmitting(true)
    setStatusMessage('Saving transcript to database...')

    try {
      // 1. Get current authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        toast.error('Authentication session expired. Please log in again.')
        router.push('/login')
        return
      }

      // 2. Insert meeting
      const { data: meeting, error: meetingError } = await supabase
        .from('meetings')
        .insert({
          title: title.trim(),
          raw_transcript: transcript.trim(),
          user_id: user.id,
        })
        .select()
        .single()

      if (meetingError || !meeting) {
        console.error(meetingError)
        throw new Error(meetingError?.message || 'Failed to save meeting.')
      }

      // 3. Call AI extraction route
      setStatusMessage('AI is analyzing the transcript and extracting action items...')
      
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ meetingId: meeting.id }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to extract action items.')
      }

      toast.success('Meeting saved and action items extracted successfully!')
      router.push(`/dashboard?meetingId=${meeting.id}`)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'An unexpected error occurred.')
      setIsSubmitting(false)
      setStatusMessage('')
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-background text-foreground min-h-screen">
      {/* Navigation header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-foreground">
              New Meeting
            </h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Form Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 z-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-border bg-card text-card-foreground shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Process meeting with AI
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Provide a transcript of your meeting. AI will extract all key action items, assignments, and priorities.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title Input */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-foreground font-medium">Meeting Title</Label>
                <Input
                  id="title"
                  placeholder="e.g. RecapAI Weekly Sprint Planning"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-background border-input focus-visible:ring-primary text-foreground placeholder:text-muted-foreground h-11"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Drag/Drop and File Upload Grid */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="transcript" className="text-foreground font-medium">Transcript Text</Label>
                  <div className="text-xs text-primary flex items-center gap-1.5 font-medium">
                    <FileText className="h-3 w-3" />
                    Loads `.txt` files directly
                  </div>
                </div>

                {/* Upload Trigger Area */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border hover:border-primary/50 hover:bg-accent/40 rounded-lg p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".txt"
                    className="hidden"
                    disabled={isSubmitting}
                  />
                  <div className="p-3 bg-muted border border-border rounded-full group-hover:border-primary/30 group-hover:bg-primary/10 transition-all">
                    <Upload className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <div className="text-sm font-medium text-foreground">Click to upload a transcript file</div>
                  <div className="text-xs text-muted-foreground">Supports UTF-8 encoded text files (.txt)</div>
                </div>

                {/* Textarea */}
                <div className="mt-4">
                  <Textarea
                    id="transcript"
                    placeholder="Paste your meeting transcripts here (including dialogue or speaker timestamps if available)..."
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    className="bg-background border-input focus-visible:ring-primary text-foreground placeholder:text-muted-foreground min-h-[300px] font-mono text-sm leading-relaxed"
                    required
                    disabled={isSubmitting}
                  />
                  {transcript && (
                    <div className="text-right text-xs text-muted-foreground mt-1">
                      {transcript.length.toLocaleString()} characters
                    </div>
                  )}
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 border-t border-border pt-6">
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all shadow-md py-6 text-base"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Extracting Actions...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Extract Action Items with AI
                  </>
                )}
              </Button>

              {isSubmitting && statusMessage && (
                <div className="text-center text-sm text-primary animate-pulse flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span>{statusMessage}</span>
                </div>
              )}
            </CardFooter>
          </Card>
        </form>
      </main>
    </div>
  )
}
