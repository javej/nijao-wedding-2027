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
  guestSlug: string;
  attending: boolean;
  plusOneName?: string;
}

export interface RsvpResponse {
  guestName: string;
  guestSlug?: string;
  attending: boolean;
  plusOneName?: string;
  timestamp: string;
}

/**
 * Append one or more RSVP rows to the configured Google Sheet.
 * For linked plus-ones, writes two separate rows.
 *
 * Sheet columns: A=guestName, B=attending("yes"|"no"), C=plusOneName,
 * D=timestamp(ISO), E=guestSlug.
 */
export async function appendRsvpRows(
  data: RsvpRowData & {
    linkedGuest?: { name: string; slug?: string; attending: boolean };
  },
): Promise<void> {
  const timestamp = new Date().toISOString();

  const rows: (string | boolean)[][] = [
    [
      data.guestName,
      data.attending ? "yes" : "no",
      data.plusOneName ?? "",
      timestamp,
      data.guestSlug,
    ],
  ];

  // Linked plus-one gets their own row
  if (data.linkedGuest) {
    rows.push([
      data.linkedGuest.name,
      data.linkedGuest.attending ? "yes" : "no",
      "",
      timestamp,
      data.linkedGuest.slug ?? "",
    ]);
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: "Sheet1!A1",
    valueInputOption: "RAW",
    requestBody: { values: rows },
  });
}

/**
 * Read all RSVP rows from the configured Google Sheet.
 * Columns: A=guestName, B="yes"|"no", C=plusOneName, D=timestamp(ISO),
 * E=guestSlug. Rows where column B is anything other than yes/no are skipped
 * — this filters out blank trailing rows AND any header row a user may have
 * added manually.
 */
export async function readRsvpRows(): Promise<RsvpResponse[]> {
  const result = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "Sheet1!A:E",
  });

  const values = result.data.values ?? [];
  return values
    .map((row) => {
      const guestName = (row[0] ?? "").toString().trim();
      const attendingRaw = (row[1] ?? "").toString().trim().toLowerCase();
      const plusOneName = (row[2] ?? "").toString().trim();
      const timestamp = (row[3] ?? "").toString().trim();
      const guestSlug = (row[4] ?? "").toString().trim();
      return {
        guestName,
        attendingRaw,
        plusOneName,
        timestamp,
        guestSlug,
      };
    })
    .filter(
      (r) =>
        r.guestName.length > 0 &&
        (r.attendingRaw === "yes" || r.attendingRaw === "no"),
    )
    .map((r) => ({
      guestName: r.guestName,
      guestSlug: r.guestSlug || undefined,
      attending: r.attendingRaw === "yes",
      plusOneName: r.plusOneName || undefined,
      timestamp: r.timestamp,
    }));
}
