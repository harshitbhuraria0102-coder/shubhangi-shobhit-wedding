import express from "express";
import type { Request, Response } from "express";
import fs from "node:fs";
import path from "node:path";
import * as XLSX from "xlsx";

const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.resolve(process.cwd(), "data");
const RSVPS_JSON_PATH = path.join(DATA_DIR, "rsvps.json");
const EXCEL_FILE_PATH = path.join(DATA_DIR, "wedding-rsvps.xlsx");
const SHEETS_CONFIG_PATH = path.join(DATA_DIR, "sheets-config.json");

const SHEET_HEADERS = [
  "Response ID",
  "Submitted At (IST)",
  "Guest Name",
  "Phone",
  "Attending",
  "Guest Count",
  "Functions",
  "Message",
  "Recorded Via",
];

const EVENT_TITLES = [
  "The Pastel Affair",
  "Beats and Blings",
  "Mamero Mahotsav",
  "Shubharambh",
];

export interface RsvpRecord {
  id: string;
  submittedAt: string;
  submittedAtFormatted: string;
  guest_name: string;
  phone: string;
  attending: "yes" | "no";
  guest_count: number;
  functions: string[];
  message: string;
  syncedToGoogleSheet: boolean;
}

export interface SheetConfig {
  spreadsheetId: string;
  spreadsheetUrl: string;
  sheetTitle: string;
  tabName: string;
  summaryTabName?: string;
  connectedEmail?: string;
  lastSyncedAt?: string;
}

export interface RsvpSummary {
  totalResponses: number;
  attendingResponses: number;
  declinedResponses: number;
  totalExpectedGuests: number;
  unsyncedCount: number;
  eventCounts: Record<string, number>;
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function formatIstTimestamp(isoDate: string): string {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(isoDate));
  } catch {
    return isoDate;
  }
}

function readRsvps(): RsvpRecord[] {
  ensureDataDir();
  if (!fs.existsSync(RSVPS_JSON_PATH)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(RSVPS_JSON_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function computeSummary(rsvps: RsvpRecord[]): RsvpSummary {
  const attending = rsvps.filter((r) => r.attending === "yes");
  const declined = rsvps.filter((r) => r.attending === "no");
  const totalExpectedGuests = attending.reduce(
    (sum, r) => sum + (Number(r.guest_count) || 1),
    0
  );
  const unsyncedCount = rsvps.filter((r) => !r.syncedToGoogleSheet).length;

  const eventCounts: Record<string, number> = {};
  for (const title of EVENT_TITLES) {
    eventCounts[title] = attending
      .filter((r) => r.functions.includes(title))
      .reduce((sum, r) => sum + (Number(r.guest_count) || 1), 0);
  }

  return {
    totalResponses: rsvps.length,
    attendingResponses: attending.length,
    declinedResponses: declined.length,
    totalExpectedGuests,
    unsyncedCount,
    eventCounts,
  };
}

function rsvpToRow(r: RsvpRecord): (string | number)[] {
  return [
    r.id,
    r.submittedAtFormatted,
    r.guest_name,
    r.phone || "—",
    r.attending === "yes" ? "Yes" : "No",
    r.attending === "yes" ? Number(r.guest_count) || 1 : 0,
    r.attending === "yes" && r.functions.length ? r.functions.join(", ") : "—",
    r.message || "—",
    "Wedding Invite Web",
  ];
}

function buildSummaryRows(summary: RsvpSummary): (string | number)[][] {
  return [
    ["Metric", "Count"],
    ["Total RSVP Responses", summary.totalResponses],
    ["Confirmed Attending (Responses)", summary.attendingResponses],
    ["Total Expected Guests (Headcount)", summary.totalExpectedGuests],
    ["Unable to Attend", summary.declinedResponses],
    ["Pending Google Sheet Sync", summary.unsyncedCount],
    ["", ""],
    ["Expected Guests per Function", "Headcount"],
    ...EVENT_TITLES.map((title) => [title, summary.eventCounts[title] || 0]),
  ];
}

function saveExcelWorkbook(rsvps: RsvpRecord[]) {
  ensureDataDir();
  const summary = computeSummary(rsvps);

  const responseSheetData: (string | number)[][] = [
    [...SHEET_HEADERS, "Google Sheet Sync"],
    ...rsvps.map((r) => [
      ...rsvpToRow(r),
      r.syncedToGoogleSheet ? "Synced" : "Pending",
    ]),
  ];

  const wb = XLSX.utils.book_new();
  const wsResponses = XLSX.utils.aoa_to_sheet(responseSheetData);
  wsResponses["!cols"] = [
    { wch: 22 },
    { wch: 24 },
    { wch: 24 },
    { wch: 18 },
    { wch: 12 },
    { wch: 13 },
    { wch: 42 },
    { wch: 40 },
    { wch: 20 },
    { wch: 18 },
  ];
  XLSX.utils.book_append_sheet(wb, wsResponses, "RSVP Responses");

  const wsSummary = XLSX.utils.aoa_to_sheet(buildSummaryRows(summary));
  wsSummary["!cols"] = [{ wch: 36 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

  XLSX.writeFile(wb, EXCEL_FILE_PATH);
}

function writeRsvps(rsvps: RsvpRecord[]) {
  ensureDataDir();
  fs.writeFileSync(RSVPS_JSON_PATH, JSON.stringify(rsvps, null, 2), "utf-8");
  saveExcelWorkbook(rsvps);
}

function readSheetsConfig(): SheetConfig | null {
  ensureDataDir();
  if (!fs.existsSync(SHEETS_CONFIG_PATH)) {
    return null;
  }
  try {
    const raw = fs.readFileSync(SHEETS_CONFIG_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    return parsed?.spreadsheetId ? parsed : null;
  } catch {
    return null;
  }
}

function writeSheetsConfig(config: SheetConfig | null) {
  ensureDataDir();
  if (!config) {
    if (fs.existsSync(SHEETS_CONFIG_PATH)) {
      fs.unlinkSync(SHEETS_CONFIG_PATH);
    }
    return;
  }
  fs.writeFileSync(SHEETS_CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
}

function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7).trim();
  return token || null;
}

function extractSpreadsheetId(input: string): string | null {
  const trimmed = input.trim();
  const urlMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (urlMatch?.[1]) return urlMatch[1];
  if (/^[a-zA-Z0-9-_]{20,}$/.test(trimmed)) return trimmed;
  return null;
}

function escapeSheetTab(tabName: string): string {
  return `'${tabName.replace(/'/g, "''")}'`;
}

async function googleSheetsFetch(
  url: string,
  accessToken: string,
  options: RequestInit = {}
) {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const text = await res.text();
  let data: Record<string, unknown> = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  return { ok: res.ok, status: res.status, data };
}

async function syncRsvpsToGoogleSheet(
  accessToken: string,
  config: SheetConfig,
  rsvps: RsvpRecord[]
): Promise<{
  ok: boolean;
  status: number;
  appendedCount: number;
  error?: string;
  updatedConfig?: SheetConfig;
  updatedRsvps?: RsvpRecord[];
}> {
  const tab = config.tabName;
  const quotedTab = escapeSheetTab(tab);

  // 1. Read column A to check headers and avoid duplicate rows
  const readRange = encodeURIComponent(`${quotedTab}!A:A`);
  const existingRes = await googleSheetsFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/${readRange}`,
    accessToken
  );

  if (!existingRes.ok) {
    const errObj = existingRes.data?.error as
      | { message?: string; status?: string }
      | undefined;
    return {
      ok: false,
      status: existingRes.status,
      appendedCount: 0,
      error: errObj?.message || "Failed to read Google Sheet.",
    };
  }

  const values = (existingRes.data?.values as string[][] | undefined) || [];
  const existingIds = new Set<string>(
    values.map((row) => String(row?.[0] || "").trim()).filter(Boolean)
  );

  // If the sheet has no header row yet, write the header row in A1
  if (values.length === 0) {
    const headerRange = encodeURIComponent(`${quotedTab}!A1:I1`);
    const headerRes = await googleSheetsFetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/${headerRange}?valueInputOption=USER_ENTERED`,
      accessToken,
      {
        method: "PUT",
        body: JSON.stringify({ values: [SHEET_HEADERS] }),
      }
    );
    if (!headerRes.ok) {
      return {
        ok: false,
        status: headerRes.status,
        appendedCount: 0,
        error: "Failed to initialize Google Sheet header row.",
      };
    }
  }

  const missingRsvps = rsvps.filter((r) => !existingIds.has(r.id));

  if (missingRsvps.length > 0) {
    const appendRange = encodeURIComponent(`${quotedTab}!A:I`);
    const appendRes = await googleSheetsFetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/${appendRange}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      accessToken,
      {
        method: "POST",
        body: JSON.stringify({
          values: missingRsvps.map((r) => rsvpToRow(r)),
        }),
      }
    );

    if (!appendRes.ok) {
      const errObj = appendRes.data?.error as { message?: string } | undefined;
      return {
        ok: false,
        status: appendRes.status,
        appendedCount: 0,
        error: errObj?.message || "Failed to append RSVP rows to Google Sheet.",
      };
    }
  }

  const updatedRsvps = rsvps.map((r) => ({ ...r, syncedToGoogleSheet: true }));
  writeRsvps(updatedRsvps);

  // Update summary tab if present
  if (config.summaryTabName) {
    const summaryTab = escapeSheetTab(config.summaryTabName);
    const summaryRange = encodeURIComponent(`${summaryTab}!A1:B15`);
    const summaryRows = buildSummaryRows(computeSummary(updatedRsvps));
    await googleSheetsFetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/${summaryRange}?valueInputOption=USER_ENTERED`,
      accessToken,
      {
        method: "PUT",
        body: JSON.stringify({ values: summaryRows }),
      }
    ).catch(() => {});
  }

  const updatedConfig: SheetConfig = {
    ...config,
    lastSyncedAt: new Date().toISOString(),
  };
  writeSheetsConfig(updatedConfig);

  return {
    ok: true,
    status: 200,
    appendedCount: missingRsvps.length,
    updatedConfig,
    updatedRsvps,
  };
}

async function startServer() {
  ensureDataDir();
  // Ensure Excel file always exists on startup if RSVPs exist
  const initialRsvps = readRsvps();
  if (!fs.existsSync(EXCEL_FILE_PATH)) {
    saveExcelWorkbook(initialRsvps);
  }

  const app = express();
  app.use(express.json({ limit: "1mb" }));

  // Health check
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  // Get all RSVPs, summary, and connected Google Sheet metadata
  app.get("/api/rsvps", (_req: Request, res: Response) => {
    const rsvps = readRsvps();
    res.json({
      rsvps,
      summary: computeSummary(rsvps),
      sheetConfig: readSheetsConfig(),
    });
  });

  // Submit a new RSVP -> saves to JSON + updates Excel (.xlsx) + live syncs to Google Sheets if authorized
  app.post("/api/rsvps", async (req: Request, res: Response) => {
    const body = req.body || {};
    const guestName = String(body.guest_name || "").trim();
    const phone = String(body.phone || "").trim();
    const attending = body.attending === "yes" ? "yes" : body.attending === "no" ? "no" : "";
    const rawCount = Number(body.guest_count) || 1;
    const guestCount = attending === "yes" ? Math.max(1, Math.min(20, rawCount)) : 0;
    const functions =
      attending === "yes" && Array.isArray(body.functions)
        ? body.functions.map((f: unknown) => String(f)).filter(Boolean)
        : [];
    const message = String(body.message || "").trim();

    if (guestName.length < 2) {
      res.status(400).json({ error: "Please provide a valid guest name." });
      return;
    }
    if (!attending) {
      res.status(400).json({ error: "Please specify whether you will attend." });
      return;
    }

    const nowIso = new Date().toISOString();
    const record: RsvpRecord = {
      id: `RSVP-${Date.now().toString(36).toUpperCase()}-${Math.random()
        .toString(36)
        .slice(2, 6)
        .toUpperCase()}`,
      submittedAt: nowIso,
      submittedAtFormatted: formatIstTimestamp(nowIso),
      guest_name: guestName,
      phone,
      attending,
      guest_count: guestCount,
      functions,
      message,
      syncedToGoogleSheet: false,
    };

    const rsvps = readRsvps();
    rsvps.push(record);
    writeRsvps(rsvps);

    let syncedToGoogleSheet = false;
    let sheetSyncWarning: string | undefined;
    let latestConfig = readSheetsConfig();

    const accessToken = extractBearerToken(req);
    if (accessToken && latestConfig?.spreadsheetId) {
      const syncResult = await syncRsvpsToGoogleSheet(
        accessToken,
        latestConfig,
        rsvps
      );
      if (syncResult.ok) {
        syncedToGoogleSheet = true;
        latestConfig = syncResult.updatedConfig || latestConfig;
        record.syncedToGoogleSheet = true;
      } else {
        sheetSyncWarning = syncResult.error;
      }
    }

    const latestRsvps = readRsvps();
    res.status(201).json({
      ok: true,
      record,
      rsvps: latestRsvps,
      summary: computeSummary(latestRsvps),
      sheetConfig: latestConfig,
      syncedToGoogleSheet,
      sheetSyncWarning,
    });
  });

  // Download the live updated Excel (.xlsx) workbook
  app.get("/api/rsvps/export.xlsx", (_req: Request, res: Response) => {
    const rsvps = readRsvps();
    saveExcelWorkbook(rsvps);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="Shubhangi-Shobhit-Wedding-RSVPs.xlsx"'
    );
    res.sendFile(EXCEL_FILE_PATH);
  });

  // Get connected Google Sheet config
  app.get("/api/sheets/config", (_req: Request, res: Response) => {
    res.json({ sheetConfig: readSheetsConfig() });
  });

  // Create a brand new Google Sheet for Wedding RSVPs
  app.post("/api/sheets/create", async (req: Request, res: Response) => {
    const accessToken = extractBearerToken(req);
    if (!accessToken) {
      res.status(401).json({ error: "Google Sign-In required." });
      return;
    }

    const connectedEmail =
      typeof req.body?.connectedEmail === "string"
        ? req.body.connectedEmail
        : undefined;

    const createPayload = {
      properties: {
        title: "Shubhangi & Shobhit · Wedding RSVPs",
      },
      sheets: [
        {
          properties: {
            title: "RSVP Responses",
            gridProperties: { frozenRowCount: 1 },
          },
        },
        {
          properties: {
            title: "Summary",
            gridProperties: { frozenRowCount: 1 },
          },
        },
      ],
    };

    const createRes = await googleSheetsFetch(
      "https://sheets.googleapis.com/v4/spreadsheets",
      accessToken,
      {
        method: "POST",
        body: JSON.stringify(createPayload),
      }
    );

    if (!createRes.ok) {
      const errObj = createRes.data?.error as { message?: string } | undefined;
      res.status(createRes.status === 401 ? 401 : 400).json({
        error: errObj?.message || "Failed to create Google Sheet.",
      });
      return;
    }

    const spreadsheetId = String(createRes.data.spreadsheetId || "");
    const spreadsheetUrl = String(
      createRes.data.spreadsheetUrl ||
        `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`
    );
    const sheetsList = (createRes.data.sheets as Array<{
      properties?: { sheetId?: number; title?: string };
    }>) || [];
    const primarySheetId = sheetsList[0]?.properties?.sheetId ?? 0;
    const primaryTabName = sheetsList[0]?.properties?.title || "RSVP Responses";
    const summaryTabName = sheetsList[1]?.properties?.title || "Summary";

    // Style the header row in deep burgundy & champagne gold
    await googleSheetsFetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
      accessToken,
      {
        method: "POST",
        body: JSON.stringify({
          requests: [
            {
              repeatCell: {
                range: {
                  sheetId: primarySheetId,
                  startRowIndex: 0,
                  endRowIndex: 1,
                  startColumnIndex: 0,
                  endColumnIndex: SHEET_HEADERS.length,
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: { red: 0.314, green: 0.114, blue: 0.165 },
                    textFormat: {
                      foregroundColor: { red: 0.96, green: 0.92, blue: 0.85 },
                      bold: true,
                      fontSize: 10,
                    },
                    horizontalAlignment: "LEFT",
                    verticalAlignment: "MIDDLE",
                  },
                },
                fields:
                  "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)",
              },
            },
          ],
        }),
      }
    ).catch(() => {});

    const newConfig: SheetConfig = {
      spreadsheetId,
      spreadsheetUrl,
      sheetTitle: "Shubhangi & Shobhit · Wedding RSVPs",
      tabName: primaryTabName,
      summaryTabName,
      connectedEmail,
    };
    writeSheetsConfig(newConfig);

    const rsvps = readRsvps();
    const syncResult = await syncRsvpsToGoogleSheet(
      accessToken,
      newConfig,
      rsvps
    );

    res.json({
      ok: true,
      sheetConfig: syncResult.updatedConfig || newConfig,
      rsvps: syncResult.updatedRsvps || rsvps,
      summary: computeSummary(syncResult.updatedRsvps || rsvps),
      appendedCount: syncResult.appendedCount,
    });
  });

  // Connect an existing Google Sheet by URL or ID (reads metadata first to detect actual tab name)
  app.post("/api/sheets/connect", async (req: Request, res: Response) => {
    const accessToken = extractBearerToken(req);
    if (!accessToken) {
      res.status(401).json({ error: "Google Sign-In required." });
      return;
    }

    const rawInput = String(req.body?.spreadsheetIdOrUrl || "");
    const connectedEmail =
      typeof req.body?.connectedEmail === "string"
        ? req.body.connectedEmail
        : undefined;
    const spreadsheetId = extractSpreadsheetId(rawInput);

    if (!spreadsheetId) {
      res.status(400).json({
        error: "Please paste a valid Google Sheets URL or Spreadsheet ID.",
      });
      return;
    }

    const metaRes = await googleSheetsFetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=spreadsheetId,spreadsheetUrl,properties.title,sheets.properties.title`,
      accessToken
    );

    if (!metaRes.ok) {
      const errObj = metaRes.data?.error as { message?: string } | undefined;
      res.status(metaRes.status === 401 ? 401 : 400).json({
        error:
          errObj?.message ||
          "Could not access that Google Sheet. Verify the URL and permissions.",
      });
      return;
    }

    const properties = metaRes.data.properties as { title?: string } | undefined;
    const sheetsList =
      (metaRes.data.sheets as Array<{ properties?: { title?: string } }>) || [];
    const firstTabName = sheetsList[0]?.properties?.title;
    if (!firstTabName) {
      res.status(400).json({ error: "No sheet tabs found in that spreadsheet." });
      return;
    }
    const summaryTab = sheetsList.find(
      (s) => s.properties?.title?.toLowerCase() === "summary"
    )?.properties?.title;

    const connectedConfig: SheetConfig = {
      spreadsheetId,
      spreadsheetUrl: String(
        metaRes.data.spreadsheetUrl ||
          `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`
      ),
      sheetTitle: properties?.title || "Connected RSVP Sheet",
      tabName: firstTabName,
      summaryTabName: summaryTab,
      connectedEmail,
    };
    writeSheetsConfig(connectedConfig);

    const rsvps = readRsvps();
    const syncResult = await syncRsvpsToGoogleSheet(
      accessToken,
      connectedConfig,
      rsvps
    );

    if (!syncResult.ok) {
      res.status(syncResult.status === 401 ? 401 : 400).json({
        error: syncResult.error || "Connected, but initial sync failed.",
      });
      return;
    }

    res.json({
      ok: true,
      sheetConfig: syncResult.updatedConfig || connectedConfig,
      rsvps: syncResult.updatedRsvps || rsvps,
      summary: computeSummary(syncResult.updatedRsvps || rsvps),
      appendedCount: syncResult.appendedCount,
    });
  });

  // Sync any pending RSVPs to the connected Google Sheet
  app.post("/api/sheets/sync", async (req: Request, res: Response) => {
    const accessToken = extractBearerToken(req);
    if (!accessToken) {
      res.status(401).json({ error: "Google Sign-In required." });
      return;
    }

    const config = readSheetsConfig();
    if (!config?.spreadsheetId) {
      res.status(400).json({ error: "No Google Sheet is connected yet." });
      return;
    }

    const rsvps = readRsvps();
    const syncResult = await syncRsvpsToGoogleSheet(accessToken, config, rsvps);

    if (!syncResult.ok) {
      res.status(syncResult.status === 401 ? 401 : 400).json({
        error: syncResult.error || "Sync failed.",
      });
      return;
    }

    const finalRsvps = syncResult.updatedRsvps || rsvps;
    res.json({
      ok: true,
      appendedCount: syncResult.appendedCount,
      sheetConfig: syncResult.updatedConfig || config,
      rsvps: finalRsvps,
      summary: computeSummary(finalRsvps),
    });
  });

  // Disconnect Google Sheet config
  app.delete("/api/sheets/config", (_req: Request, res: Response) => {
    writeSheetsConfig(null);
    res.json({ ok: true, sheetConfig: null });
  });

  // Vite dev middleware vs static production dist
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== "true",
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), "dist");
    app.use(express.static(distDir));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Wedding invitation server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
