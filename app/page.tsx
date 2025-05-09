"use client"

import type React from "react"

import { useState, useTransition, useEffect } from "react"
import { ArrowRight, CheckCircle, Database, Zap, Globe, Clock, AlertCircle } from "lucide-react"
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
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
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

    // Reset states
    setIsValid(true)
    setErrorMessage("")
    setDebugInfo(null)

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

    // Use React's useTransition to handle the server action
    startTransition(async () => {
      try {
        const result = await submitEmail(formData)

        if (result.success) {
          setIsSubmitted(true)
          setFormMessage(result.message)
          // Clear the form
          setEmail("")
        } else {
          setIsValid(false)
          setErrorMessage(result.message)
          // Store debug info if available
          if (result.debug) {
            setDebugInfo(result.debug)
            console.error("Debug info:", result.debug)
          }
        }
      } catch (error) {
        setIsValid(false)
        setErrorMessage("An unexpected error occurred. Please try again.")
        setDebugInfo(error instanceof Error ? error.message : String(error))
        console.error("Form submission error:", error)
      }
    })
  }

  return (
    <main className="flex min-h-screen flex-col items-center">
      {/* Header */}
      <header className="w-full py-6 px-4 sm:px-6 lg:px-8 border-b">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">PgCache</h1>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            Edge Caching for PostgreSQL
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            Supercharge your PostgreSQL databases with our edge caching solution. Reduce latency, improve response
            times, and scale effortlessly.
          </p>

          {/* Email Form */}
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
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

              {/* Debug Information */}
              {debugInfo && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-left">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Debugging Information:</p>
                      <pre className="mt-1 text-xs text-yellow-700 overflow-auto max-h-40">{debugInfo}</pre>
                    </div>
                  </div>
                </div>
              )}
            </form>
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
                <h3 className="font-bold text-lg">Lightning Fast</h3>
              </div>
              <p className="text-gray-600">
                Reduce query latency by up to 90% with intelligent edge caching strategies.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center mb-4">
                <Globe className="h-6 w-6 text-blue-500 mr-2" />
                <h3 className="font-bold text-lg">Global Edge Network</h3>
              </div>
              <p className="text-gray-600">
                Deploy cached data close to your users for consistent performance worldwide.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center mb-4">
                <Database className="h-6 w-6 text-purple-500 mr-2" />
                <h3 className="font-bold text-lg">Zero Config</h3>
              </div>
              <p className="text-gray-600">
                Simple integration with your existing PostgreSQL databases. No complex setup.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Engineer-focused Section */}
      <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="border-t pt-10">
          <h2 className="text-2xl font-bold text-center mb-8">Built by Engineers, for Engineers</h2>

          <div className="prose prose-lg max-w-3xl mx-auto text-gray-600">
            <p>
              We're a team of database engineers who got tired of watching our PostgreSQL instances struggle under load.
              We've spent countless nights optimizing queries, scaling instances, and implementing caching layers.
            </p>

            <p className="mt-4">
              PgCache isn't just another tool—it's the solution we wished existed when we were in your shoes. We
              understand the pain of watching response times climb during traffic spikes and the frustration of complex
              caching implementations that require constant maintenance.
            </p>

            <p className="mt-4">
              Our edge caching solution integrates seamlessly with your existing infrastructure, giving you the
              performance benefits without the operational overhead. Because we believe you should be building the
              future, not babysitting your database.
            </p>
          </div>

          <div className="mt-10 text-center">
            <p className="text-sm text-gray-500 flex items-center justify-center">
              <Clock className="h-4 w-4 mr-1" />
              Join the waitlist today. Save hours of engineering time tomorrow.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
