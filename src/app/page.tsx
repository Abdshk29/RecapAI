import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowRight,
  Calendar,
  Check,
  Download,
  FileText,
  Kanban,
  ListTodo,
  ShieldAlert,
  Sparkles,
  UploadCloud,
  User
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 relative overflow-hidden min-h-screen">
      {/* Decorative gradient glow circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-sky-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* HEADER NAVBAR */}
      <header className="border-b border-slate-900 bg-slate-950/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-50 to-slate-300">
              RecapAI
            </span>
          </div>

          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-slate-400 hover:text-white text-sm font-semibold transition-colors">
                Sign In
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-md shadow-indigo-600/10">
                Go to Dashboard
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 z-10">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">


          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-slate-50 via-slate-200 to-indigo-300 leading-tight">
            Turn Meeting Transcripts <br />
            Into Action Items Instantly
          </h1>

          <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Stop manually parsing zoom transcripts. Paste raw text or drag in a <code className="text-indigo-400 font-mono text-sm bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">.txt</code> transcript, and let AI extract tasks, assignees, deadlines, and priorities in seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link href="/login">
              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-6 rounded-lg text-base shadow-xl hover:shadow-indigo-500/20 transition-all gap-2 group w-48">
                Get Started Free
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/login?tab=signup">
              <Button variant="outline" className="border-slate-800 bg-slate-900/60 hover:bg-slate-900 text-slate-200 px-8 py-6 rounded-lg text-base transition-all w-48">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* DASHBOARD MOCKUP PREVIEW */}
      <section className="max-w-5xl mx-auto px-4 pb-20 relative z-10">
        <div className="relative rounded-xl border border-slate-800 bg-slate-900/30 backdrop-blur-xl p-4 shadow-2xl overflow-hidden group">
          {/* Neon Border Highlight */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

          {/* Mockup Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-950/60 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500/80" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <div className="h-3 w-3 rounded-full bg-green-500/80" />
              <span className="text-slate-500 font-mono ml-2">RecapAI Dashboard</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-5 w-24 bg-slate-950/60 border border-slate-850 rounded" />
              <div className="h-5 w-12 bg-indigo-600/80 rounded" />
            </div>
          </div>

          {/* Mockup Grid */}
          <div className="grid grid-cols-4 gap-4 pt-4">
            {/* Mock Sidebar */}
            <div className="col-span-1 border-r border-slate-950/40 pr-3 space-y-2 hidden md:block">
              <div className="h-7 bg-indigo-600/10 border border-indigo-500/20 rounded-md p-1.5 flex items-center justify-between">
                <div className="h-3 w-16 bg-indigo-400/40 rounded" />
              </div>
              <div className="h-7 bg-slate-900/60 rounded-md p-1.5 flex items-center justify-between">
                <div className="h-3 w-20 bg-slate-500/40 rounded" />
              </div>
              <div className="h-7 bg-slate-900/60 rounded-md p-1.5 flex items-center justify-between">
                <div className="h-3 w-14 bg-slate-500/40 rounded" />
              </div>
            </div>

            {/* Mock Main content */}
            <div className="col-span-4 md:col-span-3 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="h-5 w-48 bg-slate-200/90 rounded" />
                  <div className="h-3.5 w-24 bg-slate-500/40 rounded" />
                </div>
                <div className="flex gap-1.5">
                  <div className="h-6 w-12 bg-slate-900 border border-slate-800 rounded" />
                  <div className="h-6 w-16 bg-slate-900 border border-slate-800 rounded" />
                </div>
              </div>

              {/* Mock Tasks Table */}
              <div className="border border-slate-950/60 bg-slate-900/50 rounded-lg overflow-hidden">
                <div className="grid grid-cols-12 bg-slate-950/40 p-2.5 text-[10px] text-slate-500 border-b border-slate-950/60 font-bold uppercase tracking-wider">
                  <div className="col-span-1"></div>
                  <div className="col-span-5">Task</div>
                  <div className="col-span-2">Owner</div>
                  <div className="col-span-2">Due Date</div>
                  <div className="col-span-2">Priority</div>
                </div>

                <div className="p-1 space-y-1">
                  <div className="grid grid-cols-12 p-2 text-xs hover:bg-slate-950/10 rounded flex items-center">
                    <div className="col-span-1 text-indigo-400"><Check className="h-3.5 w-3.5" /></div>
                    <div className="col-span-5 font-semibold text-slate-250">Finalize Tailwind layout architecture</div>
                    <div className="col-span-2 text-slate-400 flex items-center gap-1"><User className="h-3 w-3 text-slate-550" /> Bob</div>
                    <div className="col-span-2 text-slate-500">2026-07-15</div>
                    <div className="col-span-2"><Badge className="bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] py-0">High</Badge></div>
                  </div>
                  <div className="grid grid-cols-12 p-2 text-xs hover:bg-slate-950/10 rounded flex items-center">
                    <div className="col-span-1 text-slate-650"><div className="h-3.5 w-3.5 border border-slate-700 rounded" /></div>
                    <div className="col-span-5 font-semibold text-slate-250">Design beautiful dashboard mock layouts</div>
                    <div className="col-span-2 text-slate-400 flex items-center gap-1"><User className="h-3 w-3 text-slate-550" /> Charlie</div>
                    <div className="col-span-2 text-slate-500">2026-07-14</div>
                    <div className="col-span-2"><Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] py-0">Medium</Badge></div>
                  </div>
                  <div className="grid grid-cols-12 p-2 text-xs hover:bg-slate-950/10 rounded flex items-center">
                    <div className="col-span-1 text-slate-650"><div className="h-3.5 w-3.5 border border-slate-700 rounded" /></div>
                    <div className="col-span-5 font-semibold text-slate-250">Prepare copywriting templates for PH launch</div>
                    <div className="col-span-2 text-slate-400 flex items-center gap-1"><User className="h-3 w-3 text-slate-550" /> Alice</div>
                    <div className="col-span-2 text-slate-500">2026-07-18</div>
                    <div className="col-span-2"><Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] py-0">Low</Badge></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="border-t border-slate-900 bg-slate-950/50 py-20 relative z-10">
        <div className="max-w-6xl mx-auto px-4 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-slate-100">How It Works</h2>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              RecapAI takes the pain out of manual task extraction in three simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-xl space-y-4 hover:border-indigo-500/20 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-200">Paste or Upload</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Copy text directly from Zoom, Teams, or Google Meet transcripts and paste it, or drag in a plain text <code className="text-indigo-400 font-mono text-xs">.txt</code> transcript.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-xl space-y-4 hover:border-indigo-500/20 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-200">AI extracts items</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Claude 3.5 Sonnet scans the text for discussions, action verbs, and dates, extracting structured tasks with assignees, priorities, and deadlines.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-xl space-y-4 hover:border-indigo-500/20 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-200">Track and Export</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Filter and edit items inside interactive table or Kanban boards. Download summaries client-side as CSV sheets or clean Markdown.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CORE BENEFITS / FEATURES GRID */}
      <section className="border-t border-slate-900 py-20 z-10">
        <div className="max-w-6xl mx-auto px-4 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-slate-100">Designed for Speed</h2>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Every detail is engineered to optimize your team's alignment in record time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="border border-slate-900 bg-slate-950 p-6 rounded-lg space-y-2">
              <div className="p-2 bg-indigo-500/10 w-fit text-indigo-400 rounded-md border border-indigo-500/20 mb-2">
                <FileText className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-slate-200">Txt File Parser</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Read local plain text transcripts directly in-browser. Fast, convenient file uploads with zero server delays.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="border border-slate-900 bg-slate-950 p-6 rounded-lg space-y-2">
              <div className="p-2 bg-indigo-500/10 w-fit text-indigo-400 rounded-md border border-indigo-500/20 mb-2">
                <Kanban className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-slate-200">Kanban Board</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Visual Kanban board splits tasks by Open and Completed columns. Toggle task completion with single clicks.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="border border-slate-900 bg-slate-950 p-6 rounded-lg space-y-2">
              <div className="p-2 bg-indigo-500/10 w-fit text-indigo-400 rounded-md border border-indigo-500/20 mb-2">
                <Download className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-slate-200">One-click Exports</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Instantly export structured CSV tables for Jira/Excel imports, or clean Markdown files for team emails and Notion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950 py-12 relative z-10">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-xs text-slate-500 mb-8">
          <div className="space-y-3">
            <div className="font-semibold text-slate-300 text-sm">RecapAI</div>
            <p className="leading-relaxed">
              Transforming raw meeting transcripts into structured tasks, owners, and deadlines in seconds.
            </p>
          </div>

          <div className="space-y-3">
            <div className="font-semibold text-slate-300 text-sm">Contact Us</div>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-slate-450">Email:</span>
                <a href="mailto:support@recapai.com" className="hover:text-indigo-400 transition-colors">abdshk28@gmail.com</a>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-slate-450">Phone:</span>
                <a href="tel:+15550199" className="hover:text-indigo-400 transition-colors">+92-306-669-8696</a>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-slate-450">Hours:</span>
                <span>Mon - Fri, 9AM - 5PM EST</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="font-semibold text-slate-300 text-sm">Tech Stack</div>
            <div className="flex flex-col gap-2">
              <span className="hover:text-slate-400 transition-colors">Auth & Storage via Supabase</span>
              <span className="hover:text-slate-400 transition-colors">Extraction Powered by OpenAI</span>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 pt-8 border-t border-slate-900/60 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-slate-650">
          <div>
            &copy; {new Date().getFullYear()} RecapAI. All rights reserved.
          </div>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 transition-colors">Privacy Policy</span>
            <span>&bull;</span>
            <span className="hover:text-slate-400 transition-colors">Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
