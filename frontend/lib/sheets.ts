import { google } from "googleapis";

const GOOGLE_SERVICE_ACCOUNT_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
if (!GOOGLE_SERVICE_ACCOUNT_JSON)
  throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not set");

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
if (!SPREADSHEET_ID) throw new Error("GOOGLE_SPREADSHEET_ID is not set");

const credentials = JSON.parse(GOOGLE_SERVICE_ACCOUNT_JSON);

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

interface RsvpRowData {
  guestName: string;
  attending: boolean;
  plusOneName?: string;
}

/**
 * Append one or more RSVP rows to the configured Google Sheet.
 * For linked plus-ones, writes two separate rows.
 */
export async function appendRsvpRows(
  data: RsvpRowData & {
    linkedGuest?: { name: string; attending: boolean };
  },
): Promise<void> {
  const timestamp = new Date().toISOString();

  const rows: (string | boolean)[][] = [
    [data.guestName, data.attending ? "yes" : "no", data.plusOneName ?? "", timestamp],
  ];

  // Linked plus-one gets their own row
  if (data.linkedGuest) {
    rows.push([
      data.linkedGuest.name,
      data.linkedGuest.attending ? "yes" : "no",
      "",
      timestamp,
    ]);
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: "Sheet1!A1",
    valueInputOption: "RAW",
    requestBody: { values: rows },
  });
}
