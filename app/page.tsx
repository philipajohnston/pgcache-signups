"use client"

import type React from "react"
import { useState, useTransition, useEffect } from "react"
import { ArrowRight, CheckCircle, Zap, Shield, Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { submitEmail } from "./actions"

// Function to get UTM parameters from URL
function getUTMParams() {
  if (typeof window === "undefined") return {}

  const urlParams = new URLSearchParams(window.location.search)
  return {
    utm_source: urlParams.get("utm_source") || "",
    utm_medium: urlParams.get("utm_medium") || "",
    utm_campaign: urlParams.get("utm_campaign") || "",
  }
}

// Function to get screen size
function getScreenSize() {
  if (typeof window === "undefined") return ""
  return `${window.innerWidth}x${window.innerHeight}`
}

export default function Home() {
  const [email, setEmail] = useState("")
  const [isValid, setIsValid] = useState(true)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [formMessage, setFormMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [utmParams, setUtmParams] = useState<Record<string, string>>({})
  const [screenSize, setScreenSize] = useState("")

  // Collect UTM parameters and screen size on component mount
  useEffect(() => {
    setUtmParams(getUTMParams())
    setScreenSize(getScreenSize())

    // Update screen size on resize
    const handleResize = () => {
      setScreenSize(getScreenSize())
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log("Form submitted with email:", email)

    // Reset states
    setIsValid(true)
    setErrorMessage("")

    // Validate email format
    if (!email.trim()) {
      setIsValid(false)
      setErrorMessage("Email address is required")
      return
    }

    if (!validateEmail(email)) {
      setIsValid(false)
      setErrorMessage("Please enter a valid email address")
      return
    }

    // Create FormData object with email and metadata
    const formData = new FormData()
    formData.append("email", email)

    // Add UTM parameters
    Object.entries(utmParams).forEach(([key, value]) => {
      formData.append(key, value)
    })

    // Add screen size
    formData.append("screen_size", screenSize)

    console.log("Submitting form data...")

    // Use React's useTransition to handle the server action
    startTransition(async () => {
      try {
        const result = await submitEmail(formData)

        console.log("Server action result:", result)

        if (result.success) {
          // Track successful submission with Vercel Analytics
          if (typeof window !== "undefined" && window.va) {
            window.va("event", {
              name: "signup",
              data: {
                source: utmParams.utm_source || "direct",
                medium: utmParams.utm_medium || "none",
                campaign: utmParams.utm_campaign || "none",
              },
            })
          }

          setIsSubmitted(true)
          setFormMessage(result.message)
          // Clear the form
          setEmail("")
        } else {
          setIsValid(false)
          setErrorMessage(result.message)
        }
      } catch (error) {
        console.error("Form submission error:", error)
        setIsValid(false)
        setErrorMessage(
          "The AI agent seems to have made a coding error. Send an email to philip@pgcache.com and we'll make sure you get on the list!",
        )
      }
    })
  }

  return (
    <div
      className="h-screen bg-slate-950 text-white relative overflow-hidden flex flex-col"
      style={{
        backgroundImage: `url('/postgres-database-background.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-slate-950/70"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <header className="w-full py-6 px-4 sm:px-6 lg:px-8 flex-shrink-0">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1
              className="text-2xl font-bold"
              style={{
                background: "linear-gradient(135deg, #3B82F6 0%, #6366F1 50%, #8B5CF6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              PgCache
            </h1>
            <Button
              asChild
              className="text-white text-sm font-medium px-4 py-2 bg-slate-800/40 border border-slate-600/50 rounded-lg hover:bg-slate-700/50 hover:border-slate-500/50 transition-all duration-200 backdrop-blur-sm"
            >
              <a href="https://calendly.com/philip-pgcache/connect" target="_blank" rel="noopener noreferrer">
                Schedule a Call
              </a>
            </Button>
          </div>
        </header>

        {/* Main Content - Flex grow to fill available space */}
        <div className="flex-grow flex flex-col justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto text-center w-full">
            {/* Hero Section */}
            <div className="mb-16">
              <h2
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight"
                style={{
                  background:
                    "linear-gradient(135deg, #3B82F6 0%, #1E40AF 25%, #6366F1 50%, #8B5CF6 75%, #A855F7 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Easy Caching for PostgreSQL
              </h2>

              <p className="text-lg sm:text-xl text-slate-400 max-w-4xl mx-auto mb-12 leading-relaxed">
                Refocus on what matters by letting our transparent postgres proxy handle the grunt work. Effortlessly
                stand up & maintain your caches.
              </p>

              {/* Email Form */}
              {!isSubmitted ? (
                <div className="max-w-lg mx-auto mb-8">
                  <form onSubmit={handleSubmit}>
                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                      <div className="flex-grow">
                        <Input
                          type="email"
                          name="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`w-full h-12 bg-slate-800/60 border border-slate-600/50 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 rounded-lg backdrop-blur-sm ${
                            !isValid ? "border-red-500 focus:ring-red-500/50" : ""
                          }`}
                          aria-label="Email address"
                          disabled={isPending}
                        />
                        {!isValid && errorMessage && (
                          <p className="text-red-400 text-sm mt-2 text-left">{errorMessage}</p>
                        )}
                      </div>
                      <Button
                        type="submit"
                        className="h-12 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 rounded-lg font-medium text-base shadow-lg shadow-blue-600/25 transition-all duration-200"
                        disabled={isPending}
                      >
                        {isPending ? "Submitting..." : "Notify Me"}
                        {!isPending && <ArrowRight className="ml-2 h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-sm text-slate-500 mb-6">Be the first to know when our MVP launches</p>
                  </form>

                  {/* Alternative CTA */}
                  <div className="text-center">
                    <p className="text-blue-400 text-sm">
                      Want to discuss your specific caching needs?{" "}
                      <Button
                        asChild
                        className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors font-medium"
                      >
                        <a href="https://calendly.com/philip-pgcache/connect" target="_blank" rel="noopener noreferrer">
                          Schedule a 25-minute chat
                        </a>
                      </Button>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="max-w-md mx-auto bg-emerald-900/20 border border-emerald-700/50 p-6 rounded-lg backdrop-blur-sm mb-8">
                  <div className="flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-emerald-400 mr-3 flex-shrink-0" />
                    <p className="text-emerald-300 font-medium">
                      {formMessage || "Thanks! We'll notify you when we launch."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Value Propositions - Fixed at bottom, always visible */}
        <div className="flex-shrink-0 w-full py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-start">
                <Zap className="h-8 w-8 text-blue-400 mr-4 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg text-white mb-2">Transparent Proxy</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Drop-in solution that sits between your app and database. No code changes required, just point and
                    cache.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Shield className="h-8 w-8 text-purple-400 mr-4 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg text-white mb-2">Maintenance-Free</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Automatic cache invalidation and management. No more writing complex cache logic or debugging stale
                    data.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Wrench className="h-8 w-8 text-teal-400 mr-4 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg text-white mb-2">Query-Aware</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Intelligently caches based on your actual query patterns. Understands PostgreSQL query semantics
                    deeply.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
