"use client"

import type React from "react"

import { useState } from "react"
import { ArrowRight, CheckCircle, Database, Zap, Globe, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Home() {
  const [email, setEmail] = useState("")
  const [isValid, setIsValid] = useState(true)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateEmail(email)) {
      setIsValid(false)
      return
    }

    setIsValid(true)
    setIsSubmitting(true)

    // Simulate API call to store email
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsSubmitted(true)
    setIsSubmitting(false)
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
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full ${!isValid ? "border-red-500 focus:ring-red-500" : ""}`}
                    aria-label="Email address"
                  />
                  {!isValid && (
                    <p className="text-red-500 text-sm mt-1 text-left">Please enter a valid email address</p>
                  )}
                </div>
                <Button type="submit" className="whitespace-nowrap" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Notify Me"}
                  {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-2">Be the first to know when our MVP launches</p>
            </form>
          ) : (
            <div className="max-w-md mx-auto bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                <p className="text-green-800 font-medium">Thanks! We'll notify you when we launch.</p>
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
