import React, { useState } from "react";
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  FileSpreadsheet,
  Link2,
  LogOut,
  RefreshCw,
  Sheet,
  Unlink,
  Users,
  X,
} from "lucide-react";
import { useGoogleSheet } from "../context/GoogleSheetContext";

type ConfirmAction =
  | { type: "connect"; target: string }
  | { type: "sync" }
  | { type: "disconnect" }
  | null;

export function HostRsvpModal() {
  const {
    user,
    accessToken,
    isSigningIn,
    authError,
    rsvps,
    summary,
    sheetConfig,
    isSyncing,
    syncError,
    lastSyncMessage,
    isHostModalOpen,
    closeHostModal,
    handleGoogleSignIn,
    handleGoogleLogout,
    createGoogleSheet,
    connectGoogleSheet,
    syncNow,
    disconnectSheet,
  } = useGoogleSheet();

  const [existingSheetInput, setExistingSheetInput] = useState("");
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  if (!isHostModalOpen) return null;

  const handleConfirm = async () => {
    const action = confirmAction;
    setConfirmAction(null);
    if (!action) return;

    if (action.type === "connect") {
      const connected = await connectGoogleSheet(action.target);
      if (connected) {
        setExistingSheetInput("");
      }
    } else if (action.type === "sync") {
      await syncNow();
    } else if (action.type === "disconnect") {
      await disconnectSheet();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="host-rsvp-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#191716]/85 p-4 backdrop-blur-sm sm:p-6"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden border border-[#C8A96A]/45 bg-[#1E1A19] text-[#F8F2E8] shadow-[0_35px_100px_rgba(0,0,0,0.85)]">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#C8A96A]/25 bg-[#191716] px-6 py-5 sm:px-8">
          <div>
            <p className="label-caps-sm text-[#C8A96A]">Couple&apos;s Guest List</p>
            <h2
              id="host-rsvp-modal-title"
              className="mt-1 font-heading text-2xl font-light text-[#FFF9F0] sm:text-3xl"
            >
              Excel &amp; Google Sheet <em className="italic">Access</em>
            </h2>
          </div>

          <button
            type="button"
            onClick={closeHostModal}
            aria-label="Close guest list manager"
            className="flex h-10 w-10 items-center justify-center border border-[#C8A96A]/35 text-[#F8F2E8]/75 transition-colors hover:border-[#C8A96A] hover:text-[#FFF9F0] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 space-y-7 overflow-y-auto px-6 py-6 sm:px-8">
          {/* Summary KPI Strip */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="border border-[#C8A96A]/25 bg-[#25201F] p-4">
              <p className="label-caps-sm text-[#C8A96A]">Total RSVPs</p>
              <p className="mt-2 font-heading text-3xl font-light text-[#FFF9F0]">
                {summary.totalResponses}
              </p>
            </div>
            <div className="border border-[#C8A96A]/25 bg-[#25201F] p-4">
              <p className="label-caps-sm text-[#C8A96A]">Confirmed</p>
              <p className="mt-2 font-heading text-3xl font-light text-[#FFF9F0]">
                {summary.attendingResponses}
              </p>
            </div>
            <div className="border border-[#C8A96A]/25 bg-[#25201F] p-4">
              <p className="label-caps-sm text-[#C8A96A]">Total Guests</p>
              <p className="mt-2 font-heading text-3xl font-light text-[#FFF9F0]">
                {summary.totalExpectedGuests}
              </p>
            </div>
            <div className="border border-[#C8A96A]/25 bg-[#25201F] p-4">
              <p className="label-caps-sm text-[#C8A96A]">Unable to Join</p>
              <p className="mt-2 font-heading text-3xl font-light text-[#FFF9F0]">
                {summary.declinedResponses}
              </p>
            </div>
          </div>

          {/* Excel + Google Sheets Dual Integration Cards */}
          <div className="grid gap-5 md:grid-cols-2">
            {/* Excel (.xlsx) Workbook Card */}
            <div className="flex flex-col justify-between border border-[#C8A96A]/35 bg-[#25201F] p-5">
              <div>
                <div className="flex items-center gap-2.5 text-[#C8A96A]">
                  <FileSpreadsheet className="h-5 w-5" />
                  <p className="label-caps-sm">Excel Workbook (.xlsx)</p>
                </div>
                <h3 className="mt-3 font-heading text-2xl font-light text-[#FFF9F0]">
                  Auto-Updated Excel Sheet
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#F8F2E8]/70">
                  Every time a guest presses &ldquo;Send our RSVP&rdquo;, their
                  details are immediately written into the Excel workbook with a
                  full response sheet and event-wise headcount summary.
                </p>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <a
                  href="/api/rsvps/export.xlsx"
                  download="Shubhangi-Shobhit-Wedding-RSVPs.xlsx"
                  className="inline-flex items-center gap-2 bg-[#C8A96A] px-5 py-2.5 text-xs uppercase tracking-[0.2em] text-[#191716] transition-colors hover:bg-[#D8BC85]"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  Download Excel (.xlsx)
                </a>
                <span className="text-[11px] text-[#F8F2E8]/55">
                  {summary.totalResponses}{" "}
                  {summary.totalResponses === 1 ? "row" : "rows"} ready
                </span>
              </div>
            </div>

            {/* Google Sheets Live Access Card */}
            <div className="flex flex-col justify-between border border-[#C8A96A]/35 bg-[#25201F] p-5">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 text-[#C8A96A]">
                    <Sheet className="h-5 w-5" />
                    <p className="label-caps-sm">Google Sheets Live Sync</p>
                  </div>

                  {accessToken && sheetConfig && (
                    <span className="inline-flex items-center gap-1.5 border border-[#C8A96A]/45 bg-[#C8A96A]/15 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.16em] text-[#E8CC92]">
                      Live Sync On
                    </span>
                  )}
                </div>

                <h3 className="mt-3 font-heading text-2xl font-light text-[#FFF9F0]">
                  {sheetConfig ? sheetConfig.sheetTitle : "Connect Your Google Sheet"}
                </h3>

                {sheetConfig ? (
                  <div className="mt-2 space-y-2 text-xs text-[#F8F2E8]/75">
                    <p>
                      Tab: <span className="text-[#FFF9F0]">{sheetConfig.tabName}</span>
                      {sheetConfig.connectedEmail && (
                        <> · Owner: {sheetConfig.connectedEmail}</>
                      )}
                    </p>
                    {sheetConfig.lastSyncedAt && (
                      <p className="text-[#F8F2E8]/55">
                        Last synced:{" "}
                        {new Date(sheetConfig.lastSyncedAt).toLocaleString()}
                      </p>
                    )}
                    <div className="pt-1">
                      <a
                        href={sheetConfig.spreadsheetUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-2 bg-[#C8A96A] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#191716] transition-colors hover:bg-[#D8BC85]"
                      >
                        Open Google Sheet
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-xs leading-relaxed text-[#F8F2E8]/70">
                    Sign in with Google to create your wedding RSVP spreadsheet or
                    link an existing sheet. Once connected, new responses sync
                    automatically as they arrive.
                  </p>
                )}
              </div>

              {/* Google Sign-In / Sheet Controls */}
              <div className="mt-5 space-y-3 border-t border-[#C8A96A]/20 pt-4">
                {!accessToken ? (
                  <div className="space-y-2.5">
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={isSigningIn}
                      className="gsi-material-button"
                    >
                      <div className="gsi-material-button-state" />
                      <div className="gsi-material-button-content-wrapper">
                        <div className="gsi-material-button-icon">
                          <svg
                            version="1.1"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 48 48"
                            style={{ display: "block" }}
                          >
                            <path
                              fill="#EA4335"
                              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                            />
                            <path
                              fill="#4285F4"
                              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                            />
                            <path
                              fill="#34A853"
                              d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                            />
                            <path fill="none" d="M0 0h48v48H0z" />
                          </svg>
                        </div>
                        <span className="gsi-material-button-contents">
                          {isSigningIn ? "Signing in..." : "Sign in with Google"}
                        </span>
                        <span style={{ display: "none" }}>
                          Sign in with Google
                        </span>
                      </div>
                    </button>
                    {sheetConfig && (
                      <p className="text-[11px] text-[#F8F2E8]/60">
                        Sign in to enable live syncing for pending responses (
                        {summary.unsyncedCount} pending).
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sheetConfig ? (
                      <div className="flex flex-wrap items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => setConfirmAction({ type: "sync" })}
                          disabled={isSyncing}
                          className="inline-flex items-center gap-1.5 border border-[#C8A96A]/55 bg-[#C8A96A]/15 px-3.5 py-2 text-[11px] uppercase tracking-[0.16em] text-[#FFF9F0] transition-colors hover:bg-[#C8A96A]/25 disabled:opacity-50 cursor-pointer"
                        >
                          <RefreshCw
                            className={`h-3.5 w-3.5 ${
                              isSyncing ? "animate-spin" : ""
                            }`}
                          />
                          {isSyncing ? "Syncing..." : "Sync Now"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setConfirmAction({ type: "disconnect" })
                          }
                          disabled={isSyncing}
                          className="inline-flex items-center gap-1.5 border border-[#F8F2E8]/20 px-3 py-2 text-[11px] uppercase tracking-[0.16em] text-[#F8F2E8]/70 transition-colors hover:border-[#F0B7B7]/60 hover:text-[#F0B7B7] cursor-pointer"
                        >
                          <Unlink className="h-3.5 w-3.5" />
                          Change Sheet
                        </button>

                        <button
                          type="button"
                          onClick={handleGoogleLogout}
                          className="ml-auto inline-flex items-center gap-1.5 text-[11px] text-[#F8F2E8]/55 hover:text-[#FFF9F0] cursor-pointer"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          Sign out ({user?.email})
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <button
                            type="button"
                            onClick={createGoogleSheet}
                            disabled={isSyncing}
                            className="inline-flex items-center gap-2 bg-[#C8A96A] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#191716] transition-colors hover:bg-[#D8BC85] disabled:opacity-50 cursor-pointer"
                          >
                            <Sheet className="h-3.5 w-3.5" />
                            {isSyncing
                              ? "Creating Sheet..."
                              : "Create Wedding RSVP Google Sheet"}
                          </button>

                          <button
                            type="button"
                            onClick={handleGoogleLogout}
                            className="inline-flex items-center gap-1 text-[11px] text-[#F8F2E8]/55 hover:text-[#FFF9F0] cursor-pointer"
                          >
                            <LogOut className="h-3.5 w-3.5" />
                            {user?.email}
                          </button>
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={existingSheetInput}
                            onChange={(e) =>
                              setExistingSheetInput(e.target.value)
                            }
                            placeholder="Or paste an existing Google Sheet URL or ID..."
                            className="flex-1 border border-[#F8F2E8]/20 bg-[#191716] px-3 py-2 text-xs text-[#FFF9F0] placeholder:text-[#F8F2E8]/35 focus:border-[#C8A96A] focus:outline-none"
                          />
                          <button
                            type="button"
                            disabled={!existingSheetInput.trim() || isSyncing}
                            onClick={() =>
                              setConfirmAction({
                                type: "connect",
                                target: existingSheetInput.trim(),
                              })
                            }
                            className="inline-flex items-center gap-1.5 border border-[#C8A96A]/50 px-3 py-2 text-[11px] uppercase tracking-[0.16em] text-[#E8CC92] hover:bg-[#C8A96A]/15 disabled:opacity-40 cursor-pointer"
                          >
                            <Link2 className="h-3.5 w-3.5" />
                            Link
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {(authError || syncError) && (
                  <p className="text-xs text-[#F0B7B7]">
                    {authError || syncError}
                  </p>
                )}
                {lastSyncMessage && !syncError && (
                  <p className="text-xs text-[#E8CC92]">{lastSyncMessage}</p>
                )}
              </div>
            </div>
          </div>

          {/* Explicit Confirmation Banner / Dialog for Google Sheet Mutations */}
          {confirmAction && (
            <div
              role="alertdialog"
              aria-labelledby="confirm-sheet-action-title"
              className="border border-[#C8A96A] bg-[#2C2122] p-5 shadow-lg"
            >
              <h4
                id="confirm-sheet-action-title"
                className="font-heading text-xl font-light text-[#FFF9F0]"
              >
                {confirmAction.type === "connect" &&
                  "Confirm Updating Existing Google Sheet"}
                {confirmAction.type === "sync" &&
                  "Confirm Syncing Guest Responses to Google Sheet"}
                {confirmAction.type === "disconnect" &&
                  "Disconnect Linked Google Sheet?"}
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-[#F8F2E8]/80">
                {confirmAction.type === "connect" &&
                  `This will read the tab structure of the selected Google Sheet, add RSVP column headers if empty, and append ${rsvps.length} recorded guest response(s).`}
                {confirmAction.type === "sync" &&
                  `This will append ${
                    summary.unsyncedCount > 0
                      ? `${summary.unsyncedCount} pending`
                      : "any missing"
                  } RSVP response(s) and update the Summary tab in "${
                    sheetConfig?.sheetTitle || "your Google Sheet"
                  }".`}
                {confirmAction.type === "disconnect" &&
                  "This unlinks the Google Sheet from live sync here. Your existing Google Sheet and all data in Google Drive remain untouched."}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="bg-[#C8A96A] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#191716] hover:bg-[#D8BC85] cursor-pointer"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmAction(null)}
                  className="border border-[#F8F2E8]/25 px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#F8F2E8]/80 hover:border-[#F8F2E8]/50 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Recorded Guest Responses Table */}
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#C8A96A]">
                <Users className="h-4 w-4" />
                <p className="label-caps-sm">
                  Recorded Guest Responses ({rsvps.length})
                </p>
              </div>
              <p className="text-[11px] text-[#F8F2E8]/55">
                All responses saved directly to Excel
              </p>
            </div>

            {rsvps.length === 0 ? (
              <div className="mt-3 border border-[#C8A96A]/20 bg-[#25201F]/60 px-5 py-10 text-center">
                <p className="font-heading text-lg font-light text-[#F8F2E8]/70">
                  No RSVPs recorded yet. As guests submit the form, each row will
                  appear here, save to Excel, and update your Google Sheet.
                </p>
              </div>
            ) : (
              <div className="mt-3 overflow-x-auto border border-[#C8A96A]/25">
                <table className="w-full min-w-[680px] border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#C8A96A]/25 bg-[#191716] text-[10px] uppercase tracking-[0.18em] text-[#C8A96A]">
                      <th className="px-4 py-3 font-normal">Guest</th>
                      <th className="px-4 py-3 font-normal">Phone</th>
                      <th className="px-4 py-3 font-normal">Attending</th>
                      <th className="px-4 py-3 font-normal">Guests</th>
                      <th className="px-4 py-3 font-normal">Functions</th>
                      <th className="px-4 py-3 font-normal">Sheet Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#C8A96A]/15 bg-[#25201F]">
                    {[...rsvps].reverse().map((row) => (
                      <tr key={row.id} className="hover:bg-[#2C2624]">
                        <td className="px-4 py-3">
                          <p className="font-medium text-[#FFF9F0]">
                            {row.guest_name}
                          </p>
                          {row.message && (
                            <p className="mt-0.5 max-w-[220px] truncate text-[11px] text-[#F8F2E8]/55">
                              &ldquo;{row.message}&rdquo;
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[#F8F2E8]/75">
                          {row.phone || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] ${
                              row.attending === "yes"
                                ? "bg-[#C8A96A]/20 text-[#E8CC92]"
                                : "bg-[#F8F2E8]/10 text-[#F8F2E8]/60"
                            }`}
                          >
                            {row.attending === "yes" ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#F8F2E8]/85">
                          {row.attending === "yes" ? row.guest_count : 0}
                        </td>
                        <td className="px-4 py-3 text-[#F8F2E8]/75">
                          {row.functions.length ? row.functions.join(", ") : "—"}
                        </td>
                        <td className="px-4 py-3">
                          {row.syncedToGoogleSheet ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-[#9EE2B8]">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Excel &amp; Google Sheet
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-[#E8CC92]">
                              <Clock className="h-3.5 w-3.5" />
                              Excel Saved
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
