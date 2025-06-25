import { NextResponse } from "next/server"
import { JWT } from "google-auth-library"

async function getGoogleAuthTokenForTest() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n")
  const auth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  })
  const accessToken = await auth.getAccessToken()
  return accessToken.token
}

export async function GET() {
  try {
    console.log("=== GOOGLE SHEETS CONNECTION TEST (DIRECT API) ===")

    const hasEmailEnv = !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
    const hasKeyEnv = !!process.env.GOOGLE_PRIVATE_KEY
    const hasSheetIdEnv = !!process.env.GOOGLE_SHEET_ID
    const hasApiKeyEnv = !!process.env.GOOGLE_API_KEY

    if (!hasEmailEnv || !hasKeyEnv || !hasSheetIdEnv || !hasApiKeyEnv) {
      return NextResponse.json({
        success: false,
        error: "Missing environment variables",
        details: { hasEmailEnv, hasKeyEnv, hasSheetIdEnv, hasApiKeyEnv },
      })
    }

    const accessToken = await getGoogleAuthTokenForTest()
    if (!accessToken) {
      return NextResponse.json({ success: false, error: "Failed to get Google Auth Token" })
    }

    const sheetId = process.env.GOOGLE_SHEET_ID
    const apiKey = process.env.GOOGLE_API_KEY
    // Test by trying to get sheet properties (a read operation)
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?key=${apiKey}`

    console.log(`🚀 Calling Google Sheets API (GET metadata): ${url}`)
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })

    const responseData = await response.json()

    if (!response.ok) {
      console.error("❌ Google Sheets API error (GET metadata):", responseData)
      return NextResponse.json({
        success: false,
        error: `Google Sheets API Error: ${responseData.error?.message || response.statusText}`,
      })
    }

    console.log("✅ Successfully fetched sheet metadata:", responseData.properties.title)
    return NextResponse.json({
      success: true,
      message: "Google Sheets connection working with direct API call!",
      sheetTitle: responseData.properties.title,
    })
  } catch (error) {
    console.error("Google Sheets test failed (direct API):", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
  }
}
