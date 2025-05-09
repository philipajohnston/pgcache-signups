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

    // Store email in Google Spreadsheet
    const spreadsheetResult = await addEmailToSpreadsheet(email, timestamp, metadataString)

    if (!spreadsheetResult.success) {
      console.error("Failed to add email to spreadsheet:", spreadsheetResult.error)
      return {
        success: false,
        message:
          "The AI agent seems to have made a coding error. Send an email to philip@pgcache.com and we'll make sure you get on the list!",
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
      message:
        "The AI agent seems to have made a coding error. Send an email to philip@pgcache.com and we'll make sure you get on the list!",
    }
  }
}

// Function to add email to Google Spreadsheet
async function addEmailToSpreadsheet(email: string, timestamp: string, metadata: string) {
  try {
    // Check if all required environment variables are available
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_SHEET_ID) {
      return { success: false, error: "Missing required environment variables" }
    }

    // Format the private key correctly
    const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n")

    // Initialize auth with service account credentials
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    // Initialize the sheet
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth)
    await doc.loadInfo()

    // Get the first sheet or create one if it doesn't exist
    let sheet = doc.sheetsByIndex[0]
    if (!sheet) {
      sheet = await doc.addSheet({
        title: "PgCache Signups",
        headerValues: ["email", "timestamp", "metadata"],
      })
    }

    // Add a row with the email, timestamp, and metadata
    await sheet.addRow({
      email: email,
      timestamp: timestamp,
      metadata: metadata,
    })

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
