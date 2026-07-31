"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Headphones, MessageSquare, X, Send, Bot, User, Sparkles, HelpCircle, ChevronRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Message {
  id: string
  sender: 'bot' | 'user'
  text: string
  timestamp: string
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    sender: 'bot',
    text: "👋 Hi! Welcome to RecapAI Customer Support. How can I help you today with transcript extractions, action items, download options, or subscription plans?",
    timestamp: 'Just now'
  }
]

const QUICK_QUESTIONS = [
  "How many download options do you have?",
  "What is included in the Pro ($17/mo) plan?",
  "How does AI transcript extraction work?",
  "What payment methods do you support?"
]

export function SupportChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen, isTyping])

  const getIntelligentReply = (userQuery: string): string => {
    const q = userQuery.toLowerCase().trim()

    // Priority 1: Gratitude, Thanks & Positive feedback
    if (
      q.includes('thank') ||
      q.includes('thanks') ||
      q.includes('thx') ||
      q.includes('appreciate') ||
      q.includes('awesome') ||
      q.includes('great') ||
      q.includes('perfect') ||
      q.includes('helpful') ||
      q.includes('wonderful') ||
      q.includes('good job')
    ) {
      return "You're very welcome! 😊 I'm glad I could help. Is there anything else you'd like to know about RecapAI or your workspace?"
    }

    // Priority 2: Greetings & Hellos
    if (
      q === 'hi' ||
      q === 'hello' ||
      q === 'hey' ||
      q.startsWith('hi ') ||
      q.startsWith('hello ') ||
      q.startsWith('hey ') ||
      q.includes('greetings') ||
      q.includes('good morning') ||
      q.includes('good evening')
    ) {
      return "Hello there! 👋 How can I assist you with RecapAI today? Feel free to ask about our download formats, subscription plans, AI extractions, or mobile workspace."
    }

    // Priority 3: Confirmations & Simple acknowledgments
    if (
      q === 'ok' ||
      q === 'okay' ||
      q === 'got it' ||
      q === 'understood' ||
      q === 'cool' ||
      q === 'alright' ||
      q.includes('makes sense') ||
      q.includes('i see')
    ) {
      return "Awesome! I'm here whenever you need assistance with your meeting recaps and action items. 🚀"
    }

    // Priority 4: Farewells & Goodbyes
    if (
      q.includes('bye') ||
      q.includes('goodbye') ||
      q.includes('cya') ||
      q.includes('see ya') ||
      q.includes('have a good day') ||
      q.includes('talk later')
    ) {
      return "Goodbye! Have a productive day managing your meeting recaps with RecapAI! ✨"
    }

    // Topic 1: Download / Export / File Formats
    if (
      q.includes('download') ||
      q.includes('export') ||
      q.includes('format') ||
      q.includes('csv') ||
      q.includes('markdown') ||
      q.includes('excel') ||
      q.includes('notion') ||
      q.includes('jira') ||
      (q.includes('how many') && q.includes('option'))
    ) {
      return "We offer 2 main instant download and export options for your action items:\n\n1. 📊 CSV File (.csv) – Perfect for Excel, Google Sheets, or Jira imports with structured Task Name, Assignee, Due Date, Priority, and Status columns.\n\n2. 📝 Markdown File (.md) – Formatted with clean headings and interactive checkboxes for Notion, Obsidian, GitHub, or email notes!"
    }

    // Topic 2: Pricing & Subscriptions
    if (
      q.includes('pro') ||
      q.includes('plus') ||
      q.includes('free') ||
      q.includes('price') ||
      q.includes('pricing') ||
      q.includes('cost') ||
      q.includes('subscription') ||
      q.includes('plan') ||
      q.includes('17') ||
      q.includes('130') ||
      q.includes('how much')
    ) {
      if (q.includes('plus') || q.includes('130')) {
        return "The Plus Workspace ($130/month or $104/mo billed yearly) is built for enterprise teams. It includes unlimited transcript word length, automated Zoom/Teams/Meet webhooks, custom AI prompt rules, multi-user roles, and a dedicated account manager with 24/7 VIP SLA."
      }
      if (q.includes('pro') || q.includes('17')) {
        return "The Pro Plan ($17/month or $14/mo billed yearly) includes unlimited transcript extractions, up to 10,000 words per note, smart assignee and due date detection, CSV & Markdown exports, and priority customer support!"
      }
      return "RecapAI offers 3 flexible plans:\n\n• Free Plan ($0/mo): 5 extractions/mo up to 1,000 words\n• Pro Plan ($17/mo): Unlimited extractions up to 10k words + Markdown & CSV exports\n• Plus Plan ($130/mo): Enterprise features + Webhooks & VIP Support"
    }

    // Topic 3: How it works / AI Extraction
    if (
      q.includes('how') ||
      q.includes('work') ||
      q.includes('extract') ||
      q.includes('process') ||
      q.includes('ai') ||
      q.includes('transcript') ||
      q.includes('kanban')
    ) {
      return "RecapAI uses AI to convert messy meeting notes or transcripts into structured action items! Simply paste your text or upload a transcript file, click 'Extract Action Items', and our AI automatically organizes tasks with assignees and due dates into a Drag-and-Drop Kanban board."
    }

    // Topic 4: Payment / Card Details
    if (
      q.includes('payment') ||
      q.includes('pay') ||
      q.includes('card') ||
      q.includes('credit') ||
      q.includes('visa') ||
      q.includes('mastercard') ||
      q.includes('billing')
    ) {
      return "We accept all major credit & debit cards (Visa, Mastercard, American Express, Discover). After choosing a subscription plan (Free, Pro, or Plus), an interactive checkout menu allows you to enter card details with 256-bit SSL encryption and instantly activates your workspace!"
    }

    // Topic 5: Mobile Version & Devices
    if (
      q.includes('mobile') ||
      q.includes('phone') ||
      q.includes('tablet') ||
      q.includes('device') ||
      q.includes('responsive') ||
      q.includes('android') ||
      q.includes('ios')
    ) {
      return "RecapAI is 100% responsive on all mobile phones, tablets, and PCs! On mobile, you get a sticky top bar with logo navigation, dropdown options (Home, About, How it Works, Pricing, Contact), export controls, and this floating support chatbot."
    }

    // Fallback response with guided suggestions
    return "I'm here to help you get the most out of RecapAI! You can ask me about:\n\n1. Download & Export formats (CSV & Markdown)\n2. Subscription Plans ($17 Pro & $130 Plus)\n3. Payment methods & workspace activation\n4. Mobile and PC feature support"
  }

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputValue
    if (!text.trim()) return

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, userMsg])
    if (!textToSend) setInputValue('')
    setIsTyping(true)

    // Real-time AI response calculation
    setTimeout(() => {
      const replyText = getIntelligentReply(text)

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }

      setMessages(prev => [...prev, botMsg])
      setIsTyping(false)
    }, 600)
  }

  return (
    <>
      {/* Floating Customer Support Button - Fixed on Right side for PC & Mobile */}
      <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center gap-3 select-none">
        {/* Support Invitation Pill (Visible when chat is closed) */}
        {!isOpen && (
          <div
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2 bg-card/95 hover:bg-card border border-border/80 text-foreground px-3.5 py-2 rounded-full shadow-lg backdrop-blur-md cursor-pointer transition-all duration-200 hover:scale-105 group"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-foreground/90 group-hover:text-primary transition-colors">
              Support Online
            </span>
          </div>
        )}

        {/* Floating Action Button */}
        <button
          type="button"
          aria-label="Customer Support Chat"
          onClick={() => setIsOpen(!isOpen)}
          className={`relative h-13 w-13 sm:h-14 sm:w-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform cursor-pointer border ${
            isOpen
              ? 'bg-card text-foreground border-border rotate-90 scale-95'
              : 'bg-primary text-primary-foreground border-primary/30 hover:scale-110 shadow-primary/30'
          }`}
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <div className="relative">
              <Headphones className="h-6 w-6" />
              {/* Online Green Pulsing Indicator Dot */}
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-primary"></span>
              </span>
            </div>
          )}
        </button>
      </div>

      {/* Floating Chat Modal - Fixed height & flex hierarchy to prevent any overlay */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[390px] h-[500px] max-h-[calc(100vh-7rem)] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header (shrink-0) */}
          <div className="p-3.5 bg-primary/10 border-b border-border flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-xs shrink-0">
                <Headphones className="h-4.5 w-4.5" />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-background" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  RecapAI Support
                  <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 px-1.5 py-0">
                    Online
                  </Badge>
                </h3>
                <p className="text-[10px] text-muted-foreground">Instant answers & assistant</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-accent transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Scroll Area (flex-1 min-h-0 overflow-y-auto) */}
          <div className="flex-1 min-h-0 p-4 overflow-y-auto space-y-3.5 text-xs">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="h-7 w-7 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 space-y-1 ${
                    msg.sender === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-xs'
                      : 'bg-muted text-foreground rounded-tl-xs border border-border/50'
                  }`}
                >
                  <p className="leading-relaxed font-normal whitespace-pre-line">{msg.text}</p>
                  <span className={`text-[9px] block text-right ${msg.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2.5 justify-start items-center">
                <div className="h-7 w-7 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-muted text-foreground border border-border/50 px-3.5 py-2 rounded-2xl rounded-tl-xs flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce delay-150"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce delay-300"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick FAQ Prompts (shrink-0) */}
          {messages.length < 4 && (
            <div className="p-3 border-t border-border/60 bg-muted/30 shrink-0 flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Suggested Questions:</span>
              <div className="flex flex-wrap gap-1.5 max-h-[105px] overflow-y-auto">
                {QUICK_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(q)}
                    className="text-[11px] bg-background hover:bg-accent text-foreground px-2.5 py-1 rounded-full border border-border/80 transition-colors text-left font-medium cursor-pointer shadow-2xs"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Footer (shrink-0) */}
          <div className="p-3 border-t border-border bg-card shrink-0 flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask a question..."
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 bg-muted/60 border border-border rounded-xl px-3 py-2 text-base sm:text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:border-primary transition-colors"
            />
            <Button
              size="icon"
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim()}
              className="h-8 w-8 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 cursor-pointer disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
