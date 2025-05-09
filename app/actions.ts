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

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, message: "Please provide a valid email address" }
    }

    // Collect metadata
    const headersList = headers()
    const userAgent = headersList.get("user-agent") || "Unknown"
    const referer = headersList.get("referer") || "Direct"

    // Get IP address (this will be the IP of the edge function in Vercel)
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

    // Convert metadata to JSON string
    const metadataString = JSON.stringify(metadata)

    console.log("Collected metadata:", metadata)

    // 1. Store email in Google Spreadsheet with detailed error handling
    const spreadsheetResult = await addEmailToSpreadsheet(email, timestamp, metadataString)
    console.log("Spreadsheet result:", spreadsheetResult)

    if (!spreadsheetResult.success) {
      // Return the detailed error to the client for debugging
      return {
        success: false,
        message: "Failed to add email to spreadsheet. Please try again later.",
        debug: spreadsheetResult.error,
      }
    }

    return {
      success: true,
      message: "Thank you for your interest! We'll be in touch soon.",
    }
  } catch (error) {
    console.error("Error in submitEmail:", error)
    return {
      success: false,
      message: "An error occurred. Please try again later.",
      debug: error instanceof Error ? error.message : String(error),
    }
  }
}

// Function to add email to Google Spreadsheet with enhanced debugging
async function addEmailToSpreadsheet(email: string, timestamp: string, metadata: string) {
  try {
    // Check if all required environment variables are available
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
      return { success: false, error: "Missing GOOGLE_SERVICE_ACCOUNT_EMAIL" }
    }
    if (!process.env.GOOGLE_PRIVATE_KEY) {
      return { success: false, error: "Missing GOOGLE_PRIVATE_KEY" }
    }
    if (!process.env.GOOGLE_SHEET_ID) {
      return { success: false, error: "Missing GOOGLE_SHEET_ID" }
    }

    console.log("All environment variables present, initializing JWT")

    // Format the private key correctly - this is a common issue
    const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n")

    try {
      // Initialize auth with service account credentials
      const serviceAccountAuth = new JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: privateKey,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      })

      console.log("JWT initialized successfully")

      // Initialize the sheet
      console.log("Initializing Google Spreadsheet with ID:", process.env.GOOGLE_SHEET_ID)
      const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth)

      console.log("Loading Google Spreadsheet info...")
      await doc.loadInfo().catch((err) => {
        console.error("Error loading spreadsheet info:", err)
        throw new Error(`Failed to load spreadsheet: ${err.message}`)
      })

      console.log(`Spreadsheet loaded: ${doc.title}`)

      // Get the first sheet or create one if it doesn't exist
      let sheet = doc.sheetsByIndex[0]
      if (!sheet) {
        console.log("No sheet found, creating a new one...")
        sheet = await doc
          .addSheet({
            title: "PgCache Signups",
            headerValues: ["email", "timestamp", "metadata"],
          })
          .catch((err) => {
            console.error("Error creating new sheet:", err)
            throw new Error(`Failed to create sheet: ${err.message}`)
          })
      }

      console.log("Adding row to sheet...")
      // Add a row with the email, timestamp, and metadata
      await sheet
        .addRow({
          email: email,
          timestamp: timestamp,
          metadata: metadata,
        })
        .catch((err) => {
          console.error("Error adding row to sheet:", err)
          throw new Error(`Failed to add row: ${err.message}`)
        })

      console.log(`Email ${email} added to spreadsheet successfully`)
      return { success: true }
    } catch (error) {
      console.error("Error in Google Sheets API operations:", error)
      return {
        success: false,
        error: `Google Sheets API error: ${error instanceof Error ? error.message : String(error)}`,
      }
    }
  } catch (error) {
    console.error("Error in addEmailToSpreadsheet:", error)
    return {
      success: false,
      error: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}
