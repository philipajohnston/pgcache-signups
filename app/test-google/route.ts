import { NextResponse } from "next/server"
import { GoogleSpreadsheet } from "google-spreadsheet"
import { JWT } from "google-auth-library"

export async function GET() {
  try {
    console.log("=== GOOGLE SHEETS CONNECTION TEST ===")

    // Check environment variables
    const hasEmail = !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
    const hasKey = !!process.env.GOOGLE_PRIVATE_KEY
    const hasSheetId = !!process.env.GOOGLE_SHEET_ID
    const hasApiKey = !!process.env.GOOGLE_API_KEY

    console.log("Environment variables:", { hasEmail, hasKey, hasSheetId, hasApiKey })

    if (!hasEmail || !hasKey || !hasSheetId || !hasApiKey) {
      return NextResponse.json({
        success: false,
        error: "Missing environment variables",
        details: { hasEmail, hasKey, hasSheetId, hasApiKey },
      })
    }

    // Test private key format
    const privateKey = process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n")
    const keyCheck = {
      startsCorrectly: privateKey.startsWith("-----BEGIN PRIVATE KEY-----"),
      endsCorrectly: privateKey.endsWith("-----END PRIVATE KEY-----"),
      hasNewlines: privateKey.includes("\n"),
      length: privateKey.length,
    }

    console.log("Private key format:", keyCheck)

    // Test JWT creation
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    console.log("JWT created successfully")

    // Test Google Sheets connection with API key
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!, serviceAccountAuth)

    // Initialize with API key outside conditional block
    if (process.env.GOOGLE_API_KEY) {
      doc.useApiKey(process.env.GOOGLE_API_KEY!)
    }

    await doc.loadInfo()

    console.log("Google Sheets connection successful!")
    console.log("Sheet title:", doc.title)

    return NextResponse.json({
      success: true,
      message: "Google Sheets connection working with API key!",
      sheetTitle: doc.title,
      sheetCount: doc.sheetCount,
      keyCheck,
    })
  } catch (error) {
    console.error("Google Sheets test failed:", error)

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
  }
}
