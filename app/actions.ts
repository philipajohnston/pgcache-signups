"use server"

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

// Helper function to get an OAuth2 access token
async function getGoogleAuthToken() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n")
  const auth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  })
  const accessToken = await auth.getAccessToken()
  if (!accessToken || !accessToken.token) {
    throw new Error("Failed to retrieve access token from Google.")
  }
  return accessToken.token
}

// Function to add email to Google Spreadsheet using direct API call
async function addEmailToSpreadsheetDirect(email: string, timestamp: string, metadata: string) {
  try {
    console.log("🔍 Checking environment variables for direct API call...")
    const { GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEET_ID, GOOGLE_API_KEY } = process.env

    if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY || !GOOGLE_SHEET_ID || !GOOGLE_API_KEY) {
      const missing = []
      if (!GOOGLE_SERVICE_ACCOUNT_EMAIL) missing.push("GOOGLE_SERVICE_ACCOUNT_EMAIL")
      if (!GOOGLE_PRIVATE_KEY) missing.push("GOOGLE_PRIVATE_KEY")
      if (!GOOGLE_SHEET_ID) missing.push("GOOGLE_SHEET_ID")
      if (!GOOGLE_API_KEY) missing.push("GOOGLE_API_KEY")
      console.error("❌ Missing environment variables:", missing)
      return { success: false, error: `Missing environment variables: ${missing.join(", ")}` }
    }
    console.log("✅ All environment variables present for direct API call")

    const accessToken = await getGoogleAuthToken()
    console.log("🔑 Got Google Auth Token")

    const sheetId = GOOGLE_SHEET_ID
    const apiKey = GOOGLE_API_KEY
    // IMPORTANT: Ensure this sheetName matches the tab name in your Google Sheet
    const sheetName = "Sheet1" // Or "pgcache-cache-me" if that's the tab name

    // For appending, the range is typically just the sheet name.
    // The API will append after the last row with data in this sheet.
    // We must URL-encode the sheet name in case it has spaces or special characters.
    const encodedSheetName = encodeURIComponent(sheetName)
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodedSheetName}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS&key=${apiKey}`

    const body = {
      // The API expects an array of rows, and each row is an array of cell values.
      values: [[email, timestamp, metadata]],
    }

    console.log(`🚀 Calling Google Sheets API (Append): ${url}`)
    console.log(`📝 Append Body: ${JSON.stringify(body)}`)

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const responseData = await response.json()

    if (!response.ok) {
      console.error(`❌ Google Sheets API error (Append) - Status: ${response.status}`, responseData)
      return {
        success: false,
        error: `Google Sheets API Error: ${responseData.error?.message || response.statusText}`,
      }
    }

    console.log("🎉 Successfully added row via direct API call (Append):", responseData)
    return { success: true, data: responseData }
  } catch (error) {
    console.error("💥 Error in addEmailToSpreadsheetDirect:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

// Main server action
export async function submitEmail(formData: FormData) {
  try {
    const email = formData.get("email") as string

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, message: "Please provide a valid email address" }
    }

    const headersList = headers()
    const userAgent = headersList.get("user-agent") || "Unknown"
    const referer = headersList.get("referer") || "Direct"
    const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "Unknown"
    const utmSource = (formData.get("utm_source") as string) || "None"
    const utmMedium = (formData.get("utm_medium") as string) || "None"
    const utmCampaign = (formData.get("utm_campaign") as string) || "None"
    const screenSize = (formData.get("screen_size") as string) || "Unknown"
    const now = new Date()
    const timestamp = now.toISOString()
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC" + now.getTimezoneOffset() / -60

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
    const metadataString = JSON.stringify(metadata)

    console.log("Attempting Google Sheets integration via direct API call...")
    const spreadsheetResult = await addEmailToSpreadsheetDirect(email, timestamp, metadataString)

    if (!spreadsheetResult.success) {
      console.error("❌ Failed to add email to spreadsheet (direct API):", spreadsheetResult.error)
      console.log("📧 MANUAL RECOVERY - Email submission:", { email, timestamp, metadata: metadataString })
      return {
        success: false,
        message:
          "The AI agent seems to have made a coding error. Send an email to philip@pgcache.com and we'll make sure you get on the list!",
      }
    }

    console.log("✅ Successfully added email to spreadsheet (direct API)")
    return {
      success: true,
      message: "Thank you for your interest! We'll be in touch soon.",
    }
  } catch (error) {
    console.error("💥 Critical error in submitEmail:", error)
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
