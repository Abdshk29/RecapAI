import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/theme-toggle'
import { Logo } from '@/components/logo'
import {
  ArrowRight,
  Calendar,
  Check,
  Download,
  FileText,
  Kanban,
  ListTodo,
  ShieldAlert,
  UploadCloud,
  User
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="flex-1 flex flex-col bg-transparent bg-app-wallpaper text-foreground relative overflow-hidden min-h-screen z-10">
      {/* Decorative gradient glow elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* HEADER NAVBAR */}
      <header className="border-b border-border/80 bg-background/95 backdrop-blur-md sticky top-0 z-50 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <Logo size="md" />
          </Link>

          <nav className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground text-sm font-semibold transition-colors">
                Sign In
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm transition-all shadow-sm">
                Go to Dashboard
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* HERO SECTION - Modern Left-Aligned Glass Container Card */}
      <section className="relative pt-10 pb-12 md:pt-16 md:pb-16 z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="relative rounded-3xl border border-border card-solid p-8 md:p-12 shadow-2xl overflow-hidden backdrop-blur-xl">
            {/* Subtle Gradient Glow inside hero card */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Left-Aligned Text Content */}
              <div className="lg:col-span-7 space-y-6 text-left">
                <Badge className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 text-xs px-3 py-1 font-semibold rounded-full w-fit flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  AI-Powered Meeting Summary & Task Extraction
                </Badge>

                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
                  Turn Meeting Transcripts <br />
                  <span className="text-primary">Into Action Items</span> Instantly
                </h1>

                <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl">
                  Stop manually parsing Zoom, Teams, or Meet transcripts. Paste raw text or drop a <code className="text-primary font-mono text-sm bg-muted border border-border px-1.5 py-0.5 rounded">.txt</code> transcript, and let AI extract structured tasks, owners, deadlines, and priorities in seconds.
                </p>

                {/* Feature Highlights List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs md:text-sm text-foreground/90 font-medium">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-xs">✓</div>
                    <span>Automatic Assignee Detection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-xs">✓</div>
                    <span>Smart Due Dates & Priorities</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-xs">✓</div>
                    <span>Interactive Kanban & Tables</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-xs">✓</div>
                    <span>Export CSV & Markdown</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-4 items-center">
                  <Link href="/login">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-7 py-6 rounded-xl text-base shadow-lg transition-all gap-2 group">
                      Get Started Free
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/login?tab=signup">
                    <Button variant="outline" className="border-border bg-card/90 hover:bg-accent text-foreground px-7 py-6 rounded-xl text-base transition-all">
                      Create Account
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Right Column: Quick Interactive Preview Card */}
              <div className="lg:col-span-5 space-y-4">
                <div className="border border-border bg-background/90 rounded-2xl p-5 shadow-lg space-y-4 text-left">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-xs font-bold text-foreground">Sample Transcript Extract</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">Live Preview</Badge>
                  </div>

                  <div className="bg-muted/60 p-3 rounded-lg text-xs font-mono text-muted-foreground leading-snug border border-border/50">
                    &quot;Bob: I will deploy the PostgreSQL migrations by tomorrow. Charlie: I can adjust the landing hero palette by Thursday.&quot;
                  </div>

                  <div className="space-y-2 pt-1">
                    <div className="text-xs font-semibold text-foreground flex items-center justify-between">
                      <span>Extracted Action Items</span>
                      <span className="text-[10px] text-muted-foreground">2 Tasks Found</span>
                    </div>

                    <div className="space-y-2">
                      <div className="p-2.5 rounded-lg bg-card border border-border flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-foreground">Deploy PostgreSQL migrations</div>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                            <span className="flex items-center gap-1"><User className="h-3 w-3" /> Bob</span>
                            <span>•</span>
                            <span>Tomorrow</span>
                          </div>
                        </div>
                        <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-[10px]">High</Badge>
                      </div>

                      <div className="p-2.5 rounded-lg bg-card border border-border flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-foreground">Adjust landing hero palette</div>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                            <span className="flex items-center gap-1"><User className="h-3 w-3" /> Charlie</span>
                            <span>•</span>
                            <span>Thursday</span>
                          </div>
                        </div>
                        <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px]">Medium</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DASHBOARD MOCKUP PREVIEW */}
      <section className="max-w-6xl mx-auto px-4 pb-20 relative z-10">
        <div className="relative rounded-2xl border border-border card-solid p-6 shadow-2xl overflow-hidden group">
          {/* Neon Border Highlight */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          {/* Mockup Header */}
          <div className="flex items-center justify-between pb-4 border-b border-border text-xs">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500/80" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <div className="h-3 w-3 rounded-full bg-green-500/80" />
              <span className="text-muted-foreground font-mono ml-2">RecapAI Workspace View</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-5 w-24 bg-muted border border-border rounded" />
              <div className="h-5 w-12 bg-primary rounded" />
            </div>
          </div>

          {/* Mockup Grid */}
          <div className="grid grid-cols-4 gap-4 pt-4">
            {/* Mock Sidebar */}
            <div className="col-span-1 border-r border-border pr-3 space-y-2 hidden md:block text-left">
              <div className="h-7 bg-primary/10 border border-primary/20 rounded-md p-1.5 flex items-center justify-between">
                <div className="h-3 w-16 bg-primary/40 rounded" />
              </div>
              <div className="h-7 bg-muted rounded-md p-1.5 flex items-center justify-between">
                <div className="h-3 w-20 bg-muted-foreground/30 rounded" />
              </div>
              <div className="h-7 bg-muted rounded-md p-1.5 flex items-center justify-between">
                <div className="h-3 w-14 bg-muted-foreground/30 rounded" />
              </div>
            </div>

            {/* Mock Main content */}
            <div className="col-span-4 md:col-span-3 space-y-4 text-left">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="h-5 w-48 bg-foreground/10 rounded" />
                  <div className="h-3.5 w-24 bg-muted-foreground/30 rounded" />
                </div>
                <div className="flex gap-1.5">
                  <div className="h-6 w-12 bg-muted border border-border rounded" />
                  <div className="h-6 w-16 bg-muted border border-border rounded" />
                </div>
              </div>

              {/* Mock Tasks Table */}
              <div className="border border-border bg-card rounded-lg overflow-hidden">
                <div className="grid grid-cols-12 bg-muted/50 p-2.5 text-[10px] text-muted-foreground border-b border-border font-bold uppercase tracking-wider">
                  <div className="col-span-1"></div>
                  <div className="col-span-5">Task</div>
                  <div className="col-span-2">Owner</div>
                  <div className="col-span-2">Due Date</div>
                  <div className="col-span-2">Priority</div>
                </div>

                <div className="p-1 space-y-1">
                  <div className="grid grid-cols-12 p-2 text-xs hover:bg-accent/40 rounded flex items-center">
                    <div className="col-span-1 text-primary"><Check className="h-3.5 w-3.5" /></div>
                    <div className="col-span-5 font-semibold text-foreground">Finalize layout architecture</div>
                    <div className="col-span-2 text-muted-foreground flex items-center gap-1"><User className="h-3 w-3 text-muted-foreground" /> Bob</div>
                    <div className="col-span-2 text-muted-foreground">2026-07-15</div>
                    <div className="col-span-2"><Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-[10px] py-0">High</Badge></div>
                  </div>
                  <div className="grid grid-cols-12 p-2 text-xs hover:bg-accent/40 rounded flex items-center">
                    <div className="col-span-1 text-muted-foreground"><div className="h-3.5 w-3.5 border border-border rounded" /></div>
                    <div className="col-span-5 font-semibold text-foreground">Design beautiful dashboard mock layouts</div>
                    <div className="col-span-2 text-muted-foreground flex items-center gap-1"><User className="h-3 w-3 text-muted-foreground" /> Charlie</div>
                    <div className="col-span-2 text-muted-foreground">2026-07-14</div>
                    <div className="col-span-2"><Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] py-0">Medium</Badge></div>
                  </div>
                  <div className="grid grid-cols-12 p-2 text-xs hover:bg-accent/40 rounded flex items-center">
                    <div className="col-span-1 text-muted-foreground"><div className="h-3.5 w-3.5 border border-border rounded" /></div>
                    <div className="col-span-5 font-semibold text-foreground">Prepare copywriting templates</div>
                    <div className="col-span-2 text-muted-foreground flex items-center gap-1"><User className="h-3 w-3 text-muted-foreground" /> Alice</div>
                    <div className="col-span-2 text-muted-foreground">2026-07-18</div>
                    <div className="col-span-2"><Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] py-0">Low</Badge></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="border-t border-border/80 bg-card/90 backdrop-blur-sm py-20 relative z-10">
        <div className="max-w-6xl mx-auto px-4 space-y-12">
          <div className="text-left space-y-3">
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">Workflow</Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">How It Works</h2>
            <p className="text-sm text-muted-foreground max-w-md">
              RecapAI takes the pain out of manual task extraction in three simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {/* Step 1 */}
            <div className="bg-card/95 border border-border p-6 rounded-xl space-y-4 hover:border-primary/40 transition-all shadow-md hover:shadow-lg">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="text-lg font-bold text-foreground">Paste or Upload</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Copy text directly from Zoom, Teams, or Google Meet transcripts and paste it, or drag in a plain text <code className="text-primary font-mono text-xs">.txt</code> transcript.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-card/95 border border-border p-6 rounded-xl space-y-4 hover:border-primary/40 transition-all shadow-md hover:shadow-lg">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="text-lg font-bold text-foreground">AI extracts items</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI models scan the text for discussions, action verbs, and dates, extracting structured tasks with assignees, priorities, and deadlines.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-card/95 border border-border p-6 rounded-xl space-y-4 hover:border-primary/40 transition-all shadow-md hover:shadow-lg">
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="text-lg font-bold text-foreground">Track and Export</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Filter and edit items inside interactive tables or Drag-and-Drop Kanban boards. Download summaries as CSV or Markdown.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CORE BENEFITS / FEATURES GRID */}
      <section className="border-t border-border/80 py-20 z-10 bg-background/80 backdrop-blur-xs">
        <div className="max-w-6xl mx-auto px-4 space-y-12">
          <div className="text-left space-y-3">
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">Features</Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Designed for Speed</h2>
            <p className="text-sm text-muted-foreground max-w-md">
              Every detail is engineered to optimize your team&apos;s alignment in record time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {/* Feature 1 */}
            <div className="border border-border/80 bg-card/95 p-6 rounded-xl space-y-2 shadow-md hover:shadow-lg transition-all">
              <div className="p-2 bg-primary/10 w-fit text-primary rounded-md border border-primary/20 mb-2">
                <FileText className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-foreground">Txt File Parser</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Read local plain text transcripts directly in-browser. Fast, convenient file uploads with zero server delays.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="border border-border/80 bg-card/95 p-6 rounded-xl space-y-2 shadow-md hover:shadow-lg transition-all">
              <div className="p-2 bg-primary/10 w-fit text-primary rounded-md border border-primary/20 mb-2">
                <Kanban className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-foreground">Drag & Drop Kanban</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Visual Kanban board splits tasks by Open and Completed columns with smooth HTML5 drag-and-drop interactivity.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="border border-border/80 bg-card/95 p-6 rounded-xl space-y-2 shadow-md hover:shadow-lg transition-all">
              <div className="p-2 bg-primary/10 w-fit text-primary rounded-md border border-primary/20 mb-2">
                <Download className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-foreground">One-click Exports</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Instantly export structured CSV tables for Jira/Excel imports, or clean Markdown files for team emails and Notion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border/80 bg-card/95 backdrop-blur-md py-12 relative z-10">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-xs text-muted-foreground mb-8">
          <div className="space-y-3">
            <div className="font-semibold text-foreground text-sm">RecapAI</div>
            <p className="leading-relaxed">
              Transforming raw meeting transcripts into structured tasks, owners, and deadlines in seconds.
            </p>
          </div>

          <div className="space-y-3">
            <div className="font-semibold text-foreground text-sm">Contact Us</div>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium">Email:</span>
                <a href="mailto:support@recapai.com" className="hover:text-primary transition-colors">abdshk28@gmail.com</a>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium">Phone:</span>
                <a href="tel:+15550199" className="hover:text-primary transition-colors">+92-306-669-8696</a>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium">Hours:</span>
                <span>Mon - Fri, 9AM - 5PM EST</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="font-semibold text-foreground text-sm">Tech Stack</div>
            <div className="flex flex-col gap-2">
              <span className="hover:text-foreground transition-colors">Auth & Storage via Supabase</span>
              <span className="hover:text-foreground transition-colors">Extraction Powered by AI</span>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-muted-foreground">
          <div>
            &copy; {new Date().getFullYear()} RecapAI. All rights reserved.
          </div>
          <div className="flex gap-4">
            <span className="hover:text-foreground transition-colors cursor-pointer">Privacy Policy</span>
            <span>&bull;</span>
            <span className="hover:text-foreground transition-colors cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
