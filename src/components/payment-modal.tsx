"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  CreditCard,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Sparkles,
  Zap,
  Building2,
  X
} from "lucide-react"

export interface PlanDetails {
  id: string
  name: string
  price: string
  period?: string
  description: string
}

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  plan: PlanDetails | null
  onSuccess?: () => void
}

export function PaymentModal({ isOpen, onClose, plan, onSuccess }: PaymentModalProps) {
  const router = useRouter()

  // Form State
  const [cardName, setCardName] = useState("Alex Morgan")
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242")
  const [expiry, setExpiry] = useState("12/28")
  const [cvc, setCvc] = useState("888")
  const [zipCode, setZipCode] = useState("10001")

  // Payment Processing States
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState<string>("Encrypting payment details...")

  if (!plan) return null

  const handleFormatCard = (val: string) => {
    // Basic formatting for card number input
    const cleaned = val.replace(/\D/g, "").slice(0, 16)
    const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned
    setCardNumber(formatted)
  }

  const handleFormatExpiry = (val: string) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 4)
    if (cleaned.length >= 2) {
      setExpiry(`${cleaned.slice(0, 2)}/${cleaned.slice(2)}`)
    } else {
      setExpiry(cleaned)
    }
  }

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault()

    if (!cardName.trim()) {
      toast.error("Please enter the cardholder name.")
      return
    }

    setIsProcessing(true)
    setProcessingStep("Encrypting payment details...")

    setTimeout(() => {
      setProcessingStep("Authorizing transaction with bank...")
    }, 1000)

    setTimeout(() => {
      setProcessingStep("Activating workspace subscription...")
    }, 2000)

    setTimeout(() => {
      setIsProcessing(false)
      // Save subscription plan locally
      if (typeof window !== "undefined") {
        localStorage.setItem("recapai_active_plan", plan.name.toLowerCase())
      }

      toast.success(`Payment Successful! Welcome to RecapAI ${plan.name}`, {
        description: `Your ${plan.name} plan subscription is active.`
      })

      onClose()

      if (onSuccess) {
        onSuccess()
      } else {
        router.push("/dashboard")
      }
    }, 2800)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isProcessing && !open && onClose()}>
      <DialogContent className="max-w-md w-full bg-card border border-border p-6 rounded-2xl shadow-2xl text-foreground">
        <DialogHeader className="space-y-2 text-left border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs px-2.5 py-0.5 font-semibold flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5" />
              Secure Checkout
            </Badge>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <DialogTitle className="text-xl font-extrabold text-foreground">
            Complete Subscription
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Enter your card credentials to activate your <span className="font-semibold text-foreground">{plan.name} Plan</span>.
          </DialogDescription>
        </DialogHeader>

        {/* Selected Plan Summary Banner */}
        <div className="bg-muted/70 border border-border p-3.5 rounded-xl flex items-center justify-between my-2 text-xs">
          <div className="space-y-0.5">
            <div className="font-bold text-foreground flex items-center gap-1.5">
              <span>RecapAI {plan.name} Plan</span>
              {plan.id === 'pro' && <Sparkles className="h-3.5 w-3.5 text-primary" />}
              {plan.id === 'plus' && <Building2 className="h-3.5 w-3.5 text-amber-500" />}
            </div>
            <div className="text-[11px] text-muted-foreground">{plan.description}</div>
          </div>
          <div className="text-right shrink-0">
            <div className="font-black text-foreground text-sm">{plan.price}</div>
            <div className="text-[10px] text-muted-foreground">{plan.period || "/ month"}</div>
          </div>
        </div>

        {/* Form or Processing Screen */}
        {isProcessing ? (
          <div className="py-10 text-center space-y-4">
            <div className="h-14 w-14 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center mx-auto animate-pulse">
              <Loader2 className="h-7 w-7 animate-spin" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-foreground text-base">Processing Payment</h4>
              <p className="text-xs text-primary font-medium animate-pulse">{processingStep}</p>
            </div>
            <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden max-w-xs mx-auto">
              <div className="bg-primary h-full rounded-full animate-pulse w-3/4 transition-all duration-500" />
            </div>
          </div>
        ) : (
          <form onSubmit={handlePayment} className="space-y-4 pt-1">
            {/* Cardholder Name */}
            <div className="space-y-1.5 text-left">
              <Label className="text-xs font-semibold text-foreground">Cardholder Name</Label>
              <Input
                type="text"
                placeholder="Full Name on Card"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                required
                className="h-9 text-xs bg-background border-border"
              />
            </div>

            {/* Card Number */}
            <div className="space-y-1.5 text-left">
              <Label className="text-xs font-semibold text-foreground">Card Number</Label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="4242 4242 4242 4242"
                  value={cardNumber}
                  onChange={(e) => handleFormatCard(e.target.value)}
                  required
                  className="h-9 text-xs bg-background border-border pr-10 font-mono"
                />
                <CreditCard className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Expiry, CVC & Zip */}
            <div className="grid grid-cols-3 gap-3 text-left">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Expiry</Label>
                <Input
                  type="text"
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={(e) => handleFormatExpiry(e.target.value)}
                  maxLength={5}
                  required
                  className="h-9 text-xs bg-background border-border font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">CVC</Label>
                <Input
                  type="password"
                  placeholder="CVC"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value.slice(0, 4))}
                  maxLength={4}
                  required
                  className="h-9 text-xs bg-background border-border font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Zip Code</Label>
                <Input
                  type="text"
                  placeholder="10001"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  required
                  className="h-9 text-xs bg-background border-border font-mono"
                />
              </div>
            </div>

            {/* Security Guarantee */}
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border">
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <Lock className="h-3 w-3" />
                <span>256-bit SSL Encrypted</span>
              </div>
              <div className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                <span>Instant Activation</span>
              </div>
            </div>

            {/* Submit Payment Button */}
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 rounded-xl text-xs sm:text-sm shadow-md transition-all gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Pay {plan.price} & Activate Workspace
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
