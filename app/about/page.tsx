import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div
      className="min-h-screen bg-slate-950 text-white relative overflow-hidden"
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
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <header className="w-full py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link href="/">
              <h1
                className="text-xl sm:text-2xl font-bold cursor-pointer hover:opacity-80 transition-opacity"
                style={{
                  background: "linear-gradient(135deg, #3B82F6 0%, #6366F1 50%, #8B5CF6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                PgCache
              </h1>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/about"
                className="text-white text-sm font-medium px-3 sm:px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                About Us
              </Link>
              <Button
                asChild
                className="text-white text-sm font-medium px-3 sm:px-4 py-2 bg-slate-800/40 border border-slate-600/50 rounded-lg hover:bg-slate-700/50 hover:border-slate-500/50 transition-all duration-200 backdrop-blur-sm"
              >
                <a href="https://calendly.com/philip-pgcache/connect" target="_blank" rel="noopener noreferrer">
                  Schedule a Call
                </a>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 sm:p-8 md:p-12">
            {/* Title */}
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8"
              style={{
                background: "linear-gradient(135deg, #3B82F6 0%, #6366F1 50%, #8B5CF6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              About Us
            </h2>

            {/* Introduction */}
            <div className="mb-12">
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-4">
                At PgCache, we're crafting a visionary MVP that redefines PostgreSQL performance, offering seamless,
                automated caching that eliminates complexity and powers effortless scaling. We're unlocking a new era of
                database architecture with caches as easy to spin up as an EC2 instance.
              </p>
            </div>

            {/* Founders Section */}
            <div className="mb-12">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-8">Meet Our Founders:</h3>

              {/* James Nelson */}
              <div className="mb-8 pb-8 border-b border-slate-700/50">
                <h4 className="text-xl sm:text-2xl font-bold text-white mb-3">
                  <a
                    href="https://www.linkedin.com/in/james-nelson-277108/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors underline decoration-transparent hover:decoration-blue-300 underline-offset-4"
                  >
                    James Nelson
                  </a>
                  <span className="text-slate-400">, CTO</span>
                </h4>
                <p className="text-slate-300 text-base leading-relaxed">
                  A database expert with 20+ years in distributed systems and PostgreSQL optimization, James has built
                  scalable infrastructure at AI and cloud media firms. With PgCache, he's engineering a performance
                  paradigm shift. Volleyball, surf and ramen enthusiast.
                </p>
              </div>

              {/* Philip Johnston */}
              <div className="mb-8">
                <h4 className="text-xl sm:text-2xl font-bold text-white mb-3">
                  <a
                    href="https://www.linkedin.com/in/philip-johnston-2001/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors underline decoration-transparent hover:decoration-blue-300 underline-offset-4"
                  >
                    Philip Johnston
                  </a>
                  <span className="text-slate-400">, CEO</span>
                </h4>
                <p className="text-slate-300 text-base leading-relaxed">
                  A 2x founder with a Harvard PhD, Philip leads strategy and execution for data-driven SaaS tools.
                  After unearthing ancient tech as an archaeologist, he's now eyeing a sustainable computing revolution.
                  Also fond of baguettes, sci-fi and football.
                </p>
              </div>
            </div>

            {/* CTA Section */}
            <div className="bg-slate-800/40 border border-slate-600/50 rounded-xl p-6 sm:p-8 text-center">
              <p className="text-slate-300 text-base sm:text-lg mb-6 leading-relaxed">
                Want to simplify and supercharge your database performance?
              </p>
              <Button
                asChild
                className="h-12 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 rounded-lg font-medium text-base shadow-lg shadow-blue-600/25 transition-all duration-200"
              >
                <Link href="/">
                  Join Our Waitlist
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
