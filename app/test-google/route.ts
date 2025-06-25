import { NextResponse } from "next/server"
import { GoogleSpreadsheet } from "google-spreadsheet"

export async function GET() {
  try {
    console.log("=== GOOGLE SHEETS CONNECTION TEST ===")

    // Check environment variables
    const hasEmail = !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
    const hasKey = !!process.env.GOOGLE_PRIVATE_KEY
    const hasSheetId = !!process.env.GOOGLE_SHEET_ID
    const hasApiKey = !!process.env.GOOGLE_API_KEY

    console.log("Environment variables:", { hasEmail, hasKey, hasSheetId, hasApiKey })

    if (!hasEmail || !hasKey || !hasSheetId) {
      return NextResponse.json({
        success: false,
        error: "Missing required environment variables",
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

    // Test Google Sheets connection
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID!)

    console.log("🔐 Attempting service account authentication...")

    // Use service account auth with credentials object
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
      private_key: privateKey,
    })

    console.log("✅ Service account auth successful")

    await doc.loadInfo()

    console.log("Google Sheets connection successful!")
    console.log("Sheet title:", doc.title)

    return NextResponse.json({
      success: true,
      message: "Google Sheets connection working with service account!",
      sheetTitle: doc.title,
      sheetCount: doc.sheetCount,
      keyCheck,
      hasApiKey,
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
