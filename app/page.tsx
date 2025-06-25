"use client"

import type React from "react"

import { useState, useTransition, useEffect } from "react"
import { ArrowRight, CheckCircle, Database, Zap, Shield, Wrench, Calendar } from "lucide-react"
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
    <main className="flex min-h-screen flex-col items-center">
      {/* Header */}
      <header className="w-full py-6 px-4 sm:px-6 lg:px-8 border-b">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">PgCache</h1>
          <a
            href="https://calendly.com/p-pgc/cache-research-yc"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Schedule a Call
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            Easy Caching for PostgreSQL
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            Refocus on what matters by letting our transparent postgres proxy handle the grunt work. Effortlessly stand
            up & maintain your caches.
          </p>

          {/* Email Form */}
          {!isSubmitted ? (
            <div className="max-w-md mx-auto">
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-grow">
                    <Input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full ${!isValid ? "border-red-500 focus:ring-red-500" : ""}`}
                      aria-label="Email address"
                      disabled={isPending}
                    />
                    {!isValid && errorMessage && <p className="text-red-500 text-sm mt-1 text-left">{errorMessage}</p>}
                  </div>
                  <Button type="submit" className="whitespace-nowrap" disabled={isPending}>
                    {isPending ? "Submitting..." : "Notify Me"}
                    {!isPending && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mt-2">Be the first to know when our MVP launches</p>
              </form>

              {/* Alternative CTA */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-3">Want to discuss your specific caching needs?</p>
                <a
                  href="https://calendly.com/p-pgc/cache-research-yc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:text-blue-700 transition-colors"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule a 25-minute chat
                </a>
              </div>
            </div>
          ) : (
            <div className="max-w-md mx-auto bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                <p className="text-green-800 font-medium">
                  {formMessage || "Thanks! We'll notify you when we launch."}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center mb-4">
                <Zap className="h-6 w-6 text-yellow-500 mr-2" />
                <h3 className="font-bold text-lg">Transparent Proxy</h3>
              </div>
              <p className="text-gray-600">
                Drop-in solution that sits between your app and database. No code changes required, just point and
                cache.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center mb-4">
                <Wrench className="h-6 w-6 text-blue-500 mr-2" />
                <h3 className="font-bold text-lg">Maintenance-Free</h3>
              </div>
              <p className="text-gray-600">
                Automatic cache invalidation and management. No more writing complex cache logic or debugging stale
                data.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center mb-4">
                <Shield className="h-6 w-6 text-purple-500 mr-2" />
                <h3 className="font-bold text-lg">Query-Aware</h3>
              </div>
              <p className="text-gray-600">
                Intelligently caches based on your actual query patterns. Understands PostgreSQL query semantics deeply.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Engineer-focused Section */}
      <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="border-t pt-10">
          <h2 className="text-2xl font-bold text-center mb-8">By PostgreSQL Power Users, For PostgreSQL Teams</h2>

          <div className="prose prose-lg max-w-3xl mx-auto text-gray-600">
            <p>
              We're a team of database engineers who've spent years optimizing PostgreSQL deployments. We've written
              more EXPLAIN ANALYZE queries than we care to admit, and we've felt the pain of managing caching layers
              firsthand.
            </p>

            <p className="mt-4">
              PgCache was born from our own frustrations with existing solutions. We wanted something that understood
              PostgreSQL deeply—something that could parse queries, track dependencies, and automatically invalidate
              caches without requiring us to rewrite our applications.
            </p>

            <p className="mt-4">
              Our transparent proxy approach means you don't need to change your code or learn complex caching patterns.
              We'll do the annoying work for you, so you can focus on what matters: building features that delight your
              users, not babysitting your database performance.
            </p>
          </div>

          <div className="mt-10 text-center">
            <p className="text-sm text-gray-600 flex items-center justify-center">
              <Database className="h-4 w-4 mr-1" />
              From one Postgres team to another—we've got your back.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
