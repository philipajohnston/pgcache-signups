"use server"

import { GoogleSpreadsheet } from "google-spreadsheet"
import { JWT } from "google-auth-library"
import { headers } from "next/headers"

// Type for metadata
type SubmissionMetadata = {
  userAgent?: string
  ip?: string
  referer?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  screenSize?: string
  timestamp: string
  timezone: string
}

// Function to send email and store in Google Sheets
export async function submitEmail(formData: FormData) {
  try {
    const email = formData.get("email") as string

    console.log("=== EMAIL SUBMISSION DEBUG ===")
    console.log("Received email submission:", email)

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.log("Invalid email format:", email)
      return { success: false, message: "Please provide a valid email address" }
    }

    // Collect metadata
    const headersList = headers()
    const userAgent = headersList.get("user-agent") || "Unknown"
    const referer = headersList.get("referer") || "Direct"
    const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "Unknown"

    // Get UTM parameters from the form data
    const utmSource = (formData.get("utm_source") as string) || "None"
    const utmMedium = (formData.get("utm_medium") as string) || "None"
    const utmCampaign = (formData.get("utm_campaign") as string) || "None"

    // Get screen size from form data
    const screenSize = (formData.get("screen_size") as string) || "Unknown"

    // Create timestamp with timezone
    const now = new Date()
    const timestamp = now.toISOString()
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC" + now.getTimezoneOffset() / -60

    // Compile metadata
    const metadata: SubmissionMetadata = {
      userAgent,
      ip,
      referer,
      utmSource,
      utmMedium,
      utmCampaign,
      screenSize,
      timestamp,
      timezone,
    }

    console.log("Collected metadata:", metadata)

    // Convert metadata to JSON string
    const metadataString = JSON.stringify(metadata)

    // Store email in Google Spreadsheet - this MUST succeed
    console.log("Attempting Google Sheets integration...")
    const spreadsheetResult = await addEmailToSpreadsheet(email, timestamp, metadataString)

    if (!spreadsheetResult.success) {
      console.error("❌ Failed to add email to spreadsheet:", spreadsheetResult.error)

      // Log the email for manual recovery
      console.log("📧 MANUAL RECOVERY - Email submission:", {
        email,
        timestamp,
        metadata: metadataString,
      })

      // Return failure so user gets the error message to email you directly
      return {
        success: false,
        message:
          "The AI agent seems to have made a coding error. Send an email to philip@pgcache.com and we'll make sure you get on the list!",
      }
    }

    console.log("✅ Successfully added email to spreadsheet")
    return {
      success: true,
      message: "Thank you for your interest! We'll be in touch soon.",
    }
  } catch (error) {
    console.error("💥 Critical error in submitEmail:", error)

    // Log the email for manual recovery if possible
    const email = formData.get("email") as string
    if (email) {
      console.log("📧 MANUAL RECOVERY - Email submission (error case):", {
        email,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
      })
    }

    return {
      success: false,
      message:
        "The AI agent seems to have made a coding error. Send an email to philip@pgcache.com and we'll make sure you get on the list!",
    }
  }
}

// Function to add email to Google Spreadsheet
async function addEmailToSpreadsheet(email: string, timestamp: string, metadata: string) {
  try {
    console.log("🔍 Checking environment variables...")

    // Check if all required environment variables are available
    const hasEmail = !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
    const hasKey = !!process.env.GOOGLE_PRIVATE_KEY
    const hasSheetId = !!process.env.GOOGLE_SHEET_ID
    const hasApiKey = !!process.env.GOOGLE_API_KEY

    console.log("Environment variables status:", {
      GOOGLE_SERVICE_ACCOUNT_EMAIL: hasEmail,
      GOOGLE_PRIVATE_KEY: hasKey,
      GOOGLE_SHEET_ID: hasSheetId,
      GOOGLE_API_KEY: hasApiKey,
    })

    if (!hasEmail || !hasKey || !hasSheetId || !hasApiKey) {
      const missing = []
      if (!hasEmail) missing.push("GOOGLE_SERVICE_ACCOUNT_EMAIL")
      if (!hasKey) missing.push("GOOGLE_PRIVATE_KEY")
      if (!hasSheetId) missing.push("GOOGLE_SHEET_ID")
      if (!hasApiKey) missing.push("GOOGLE_API_KEY")

      console.error("❌ Missing environment variables:", missing)
      return { success: false, error: `Missing environment variables: ${missing.join(", ")}` }
    }

    console.log("✅ All environment variables present")

    // Format the private key correctly
    console.log("🔑 Formatting private key...")
    const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n")

    console.log("🔐 Creating JWT auth...")

    // Initialize auth with service account credentials
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    console.log("📊 Initializing Google Spreadsheet with proper API key setup...")

    // NEW APPROACH: Initialize with both auth methods properly
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID)

    // Set API key first (for read operations)
    doc.useApiKey(process.env.GOOGLE_API_KEY)

    // Then set service account auth (for write operations)
    doc.useServiceAccountAuth(serviceAccountAuth)

    console.log("📋 Loading spreadsheet info...")
    await doc.loadInfo()

    console.log("✅ Spreadsheet loaded successfully!")
    console.log("Spreadsheet title:", doc.title)
    console.log("Number of sheets:", doc.sheetCount)

    // Get the first sheet or create one if it doesn't exist
    let sheet = doc.sheetsByIndex[0]
    if (!sheet) {
      console.log("📝 Creating new sheet...")
      sheet = await doc.addSheet({
        title: "PgCache Signups",
        headerValues: ["email", "timestamp", "metadata"],
      })
      console.log("✅ New sheet created")
    } else {
      console.log("📄 Using existing sheet:", sheet.title)
    }

    console.log("➕ Adding row to sheet...")

    // Add a row with the email, timestamp, and metadata
    await sheet.addRow({
      email: email,
      timestamp: timestamp,
      metadata: metadata,
    })

    console.log("🎉 Successfully added row to sheet!")
    return { success: true }
  } catch (error) {
    console.error("💥 Error in addEmailToSpreadsheet:", error)

    // Log more details about the error
    if (error instanceof Error) {
      console.error("Error name:", error.name)
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
