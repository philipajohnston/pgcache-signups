"use client"

import type React from "react"

import { useState, useTransition, useEffect } from "react"
import { ArrowRight, CheckCircle, Zap, Shield, Wrench, Calendar } from "lucide-react"
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
      className="min-h-screen bg-slate-900 text-white"
      style={{
        backgroundImage: `url('/postgres-bg.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Dark overlay for better text readability */}
      <div className="min-h-screen bg-slate-900/80">
        {/* Header */}
        <header className="w-full py-6 px-4 sm:px-6 lg:px-8 border-b border-slate-700/50">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              PgCache
            </h1>
            <a
              href="https://calendly.com/philip-pgcache/connect"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800/50 border border-slate-600 rounded-md hover:bg-slate-700/50 hover:text-white transition-colors backdrop-blur-sm"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Schedule a Call
            </a>
          </div>
        </header>

        {/* Hero Section */}
        <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center">
            <h2 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent tracking-tight mb-6">
              Easy Caching for PostgreSQL
            </h2>
            <p className="text-xl text-slate-400 max-w-4xl mx-auto mb-12 leading-relaxed">
              Refocus on what matters by letting our transparent postgres proxy handle the grunt work. Effortlessly
              stand up & maintain your caches.
            </p>

            {/* Email Form */}
            {!isSubmitted ? (
              <div className="max-w-md mx-auto mb-8">
                <form onSubmit={handleSubmit}>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-grow">
                      <Input
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 backdrop-blur-sm ${
                          !isValid ? "border-red-500 focus:ring-red-500/20" : ""
                        }`}
                        aria-label="Email address"
                        disabled={isPending}
                      />
                      {!isValid && errorMessage && (
                        <p className="text-red-400 text-sm mt-1 text-left">{errorMessage}</p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      className="whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white border-0 px-6 py-2 font-medium"
                      disabled={isPending}
                    >
                      {isPending ? "Submitting..." : "Notify Me"}
                      {!isPending && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-sm text-slate-500 mt-3">Be the first to know when our MVP launches</p>
                </form>

                {/* Alternative CTA */}
                <div className="mt-8">
                  <p className="text-blue-400 text-sm">
                    Want to discuss your specific caching needs?{" "}
                    <a
                      href="https://calendly.com/philip-pgcache/connect"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
                    >
                      Schedule a 25-minute chat
                    </a>
                  </p>
                </div>
              </div>
            ) : (
              <div className="max-w-md mx-auto bg-green-900/20 border border-green-700/50 p-4 rounded-lg backdrop-blur-sm">
                <div className="flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-400 mr-2" />
                  <p className="text-green-300 font-medium">
                    {formMessage || "Thanks! We'll notify you when we launch."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-slate-800/30 backdrop-blur-sm p-6 rounded-lg border border-slate-700/50 hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center mb-4">
                  <Zap className="h-6 w-6 text-yellow-400 mr-3" />
                  <h3 className="font-bold text-lg text-white">Transparent Proxy</h3>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Drop-in solution that sits between your app and database. No code changes required, just point and
                  cache.
                </p>
              </div>

              <div className="bg-slate-800/30 backdrop-blur-sm p-6 rounded-lg border border-slate-700/50 hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center mb-4">
                  <Wrench className="h-6 w-6 text-blue-400 mr-3" />
                  <h3 className="font-bold text-lg text-white">Maintenance-Free</h3>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Automatic cache invalidation and management. No more writing complex cache logic or debugging stale
                  data.
                </p>
              </div>

              <div className="bg-slate-800/30 backdrop-blur-sm p-6 rounded-lg border border-slate-700/50 hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center mb-4">
                  <Shield className="h-6 w-6 text-purple-400 mr-3" />
                  <h3 className="font-bold text-lg text-white">Query-Aware</h3>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Intelligently caches based on your actual query patterns. Understands PostgreSQL query semantics
                  deeply.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
