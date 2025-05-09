import { NextResponse } from "next/server"
import { GoogleSpreadsheet } from "google-spreadsheet"
import { JWT } from "google-auth-library"

export async function GET() {
  try {
    // Check environment variables
    const envCheck = {
      hasServiceAccountEmail: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      hasPrivateKey: !!process.env.GOOGLE_PRIVATE_KEY,
      hasSheetId: !!process.env.GOOGLE_SHEET_ID,
      serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      privateKeyLength: process.env.GOOGLE_PRIVATE_KEY?.length || 0,
      sheetId: process.env.GOOGLE_SHEET_ID,
    }

    // If any environment variable is missing, return the check results
    if (!envCheck.hasServiceAccountEmail || !envCheck.hasPrivateKey || !envCheck.hasSheetId) {
      return NextResponse.json({
        success: false,
        message: "Missing environment variables",
        envCheck,
      })
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

    // Load the document properties and sheets
    await doc.loadInfo()

    // Get basic info about the spreadsheet
    const sheetInfo = {
      title: doc.title,
      sheetCount: doc.sheetCount,
      sheets: doc.sheetsByIndex.map((sheet) => ({
        title: sheet.title,
        rowCount: sheet.rowCount,
      })),
    }

    return NextResponse.json({
      success: true,
      message: "Successfully connected to Google Sheets",
      sheetInfo,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Failed to connect to Google Sheets",
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
