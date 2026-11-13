import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { User } from "firebase/auth";
import {
  clearCachedAccessToken,
  googleSignIn,
  initAuth,
  logout,
} from "../lib/googleAuth";

export interface RsvpPayload {
  guest_name: string;
  phone: string;
  attending: string;
  guest_count: string;
  functions: string[];
  message: string;
}

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

interface GoogleSheetContextValue {
  user: User | null;
  accessToken: string | null;
  needsAuth: boolean;
  isSigningIn: boolean;
  authError: string | null;
  rsvps: RsvpRecord[];
  summary: RsvpSummary;
  sheetConfig: SheetConfig | null;
  isSyncing: boolean;
  syncError: string | null;
  lastSyncMessage: string | null;
  isHostModalOpen: boolean;
  openHostModal: () => void;
  closeHostModal: () => void;
  handleGoogleSignIn: () => Promise<void>;
  handleGoogleLogout: () => Promise<void>;
  refreshRsvps: () => Promise<void>;
  submitRsvp: (payload: RsvpPayload) => Promise<{
    record: RsvpRecord;
    syncedToGoogleSheet: boolean;
    sheetConfig: SheetConfig | null;
  }>;
  createGoogleSheet: () => Promise<SheetConfig | null>;
  connectGoogleSheet: (spreadsheetIdOrUrl: string) => Promise<SheetConfig | null>;
  syncNow: () => Promise<number>;
  disconnectSheet: () => Promise<void>;
}

const emptySummary: RsvpSummary = {
  totalResponses: 0,
  attendingResponses: 0,
  declinedResponses: 0,
  totalExpectedGuests: 0,
  unsyncedCount: 0,
  eventCounts: {},
};

const GoogleSheetContext = createContext<GoogleSheetContextValue | null>(null);

export function GoogleSheetProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [rsvps, setRsvps] = useState<RsvpRecord[]>([]);
  const [summary, setSummary] = useState<RsvpSummary>(emptySummary);
  const [sheetConfig, setSheetConfig] = useState<SheetConfig | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncMessage, setLastSyncMessage] = useState<string | null>(null);
  const [isHostModalOpen, setIsHostModalOpen] = useState(false);

  const accessTokenRef = useRef<string | null>(null);
  const sheetConfigRef = useRef<SheetConfig | null>(null);
  const syncingRef = useRef(false);

  useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);

  useEffect(() => {
    sheetConfigRef.current = sheetConfig;
  }, [sheetConfig]);

  useEffect(() => {
    const unsubscribe = initAuth(
      (authedUser, token) => {
        setUser(authedUser);
        setAccessToken(token);
        setNeedsAuth(false);
      },
      (existingUser) => {
        setUser(existingUser);
        setAccessToken(null);
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  const refreshRsvps = useCallback(async () => {
    try {
      const res = await fetch("/api/rsvps");
      if (!res.ok) return;
      const data = await res.json();
      setRsvps(data.rsvps || []);
      setSummary(data.summary || emptySummary);
      setSheetConfig(data.sheetConfig || null);
    } catch {
      // Ignore transient polling failures
    }
  }, []);

  useEffect(() => {
    refreshRsvps();
  }, [refreshRsvps]);

  const handleTokenExpired = useCallback(() => {
    clearCachedAccessToken();
    setAccessToken(null);
    setNeedsAuth(true);
    setSyncError(
      "Your Google Sheets session expired. Please sign in with Google again to continue live syncing."
    );
  }, []);

  const syncNowWithToken = useCallback(
    async (tokenOverride?: string | null): Promise<number> => {
      const token = tokenOverride ?? accessTokenRef.current;
      const config = sheetConfigRef.current;
      if (!token || !config?.spreadsheetId || syncingRef.current) return 0;

      syncingRef.current = true;
      setIsSyncing(true);
      setSyncError(null);

      try {
        const res = await fetch("/api/sheets/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.status === 401) {
          handleTokenExpired();
          return 0;
        }
        if (!res.ok) {
          setSyncError(data.error || "Could not sync to Google Sheet.");
          return 0;
        }
        setRsvps(data.rsvps || []);
        setSummary(data.summary || emptySummary);
        setSheetConfig(data.sheetConfig || config);
        const appended = Number(data.appendedCount) || 0;
        setLastSyncMessage(
          appended > 0
            ? `Synced ${appended} new ${appended === 1 ? "response" : "responses"} to Google Sheet.`
            : "Google Sheet is up to date."
        );
        return appended;
      } catch {
        setSyncError("Network error while syncing with Google Sheets.");
        return 0;
      } finally {
        syncingRef.current = false;
        setIsSyncing(false);
      }
    },
    [handleTokenExpired]
  );

  // Real-time background polling & cross-tab sync so the Google Sheet keeps updating as responses arrive
  useEffect(() => {
    const channel =
      typeof BroadcastChannel !== "undefined"
        ? new BroadcastChannel("wedding_rsvp_channel")
        : null;

    if (channel) {
      channel.onmessage = () => {
        refreshRsvps().then(() => {
          if (accessTokenRef.current && sheetConfigRef.current?.spreadsheetId) {
            syncNowWithToken();
          }
        });
      };
    }

    const interval = window.setInterval(async () => {
      try {
        const res = await fetch("/api/rsvps");
        if (!res.ok) return;
        const data = await res.json();
        const latestRsvps: RsvpRecord[] = data.rsvps || [];
        setRsvps(latestRsvps);
        setSummary(data.summary || emptySummary);
        setSheetConfig(data.sheetConfig || null);

        const hasUnsynced = latestRsvps.some((r) => !r.syncedToGoogleSheet);
        if (
          hasUnsynced &&
          accessTokenRef.current &&
          (data.sheetConfig?.spreadsheetId || sheetConfigRef.current?.spreadsheetId)
        ) {
          await syncNowWithToken();
        }
      } catch {
        // Ignore transient polling failures
      }
    }, 8000);

    return () => {
      window.clearInterval(interval);
      channel?.close();
    };
  }, [refreshRsvps, syncNowWithToken]);

  const handleGoogleSignIn = useCallback(async () => {
    setIsSigningIn(true);
    setAuthError(null);
    setSyncError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setAccessToken(result.accessToken);
        setNeedsAuth(false);
        if (sheetConfigRef.current?.spreadsheetId) {
          await syncNowWithToken(result.accessToken);
        }
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Google Sign-In did not complete.";
      setAuthError(message);
    } finally {
      setIsSigningIn(false);
    }
  }, [syncNowWithToken]);

  const handleGoogleLogout = useCallback(async () => {
    await logout();
    setUser(null);
    setAccessToken(null);
    setNeedsAuth(true);
    setLastSyncMessage(null);
  }, []);

  const submitRsvp = useCallback(
    async (payload: RsvpPayload) => {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (accessTokenRef.current) {
        headers.Authorization = `Bearer ${accessTokenRef.current}`;
      }

      const res = await fetch("/api/rsvps", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not record RSVP.");
      }

      setRsvps(data.rsvps || []);
      setSummary(data.summary || emptySummary);
      if (data.sheetConfig) {
        setSheetConfig(data.sheetConfig);
      }
      if (data.syncedToGoogleSheet) {
        setLastSyncMessage("New RSVP saved to Excel & synced live to Google Sheet.");
      }

      if (typeof BroadcastChannel !== "undefined") {
        const ch = new BroadcastChannel("wedding_rsvp_channel");
        ch.postMessage({ type: "NEW_RSVP", id: data.record?.id });
        ch.close();
      }

      return {
        record: data.record as RsvpRecord,
        syncedToGoogleSheet: Boolean(data.syncedToGoogleSheet),
        sheetConfig: (data.sheetConfig as SheetConfig | null) || sheetConfigRef.current,
      };
    },
    []
  );

  const createGoogleSheet = useCallback(async (): Promise<SheetConfig | null> => {
    const token = accessTokenRef.current;
    if (!token) {
      setNeedsAuth(true);
      return null;
    }

    setIsSyncing(true);
    setSyncError(null);
    try {
      const res = await fetch("/api/sheets/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          connectedEmail: user?.email || undefined,
        }),
      });
      const data = await res.json();
      if (res.status === 401) {
        handleTokenExpired();
        return null;
      }
      if (!res.ok) {
        setSyncError(data.error || "Failed to create Google Sheet.");
        return null;
      }
      setSheetConfig(data.sheetConfig);
      setRsvps(data.rsvps || []);
      setSummary(data.summary || emptySummary);
      setLastSyncMessage(
        "Created Google Sheet and synced all recorded RSVPs."
      );
      return data.sheetConfig as SheetConfig;
    } catch {
      setSyncError("Network error while creating Google Sheet.");
      return null;
    } finally {
      setIsSyncing(false);
    }
  }, [handleTokenExpired, user?.email]);

  const connectGoogleSheet = useCallback(
    async (spreadsheetIdOrUrl: string): Promise<SheetConfig | null> => {
      const token = accessTokenRef.current;
      if (!token) {
        setNeedsAuth(true);
        return null;
      }

      setIsSyncing(true);
      setSyncError(null);
      try {
        const res = await fetch("/api/sheets/connect", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            spreadsheetIdOrUrl,
            connectedEmail: user?.email || undefined,
          }),
        });
        const data = await res.json();
        if (res.status === 401) {
          handleTokenExpired();
          return null;
        }
        if (!res.ok) {
          setSyncError(data.error || "Could not connect to that Google Sheet.");
          return null;
        }
        setSheetConfig(data.sheetConfig);
        setRsvps(data.rsvps || []);
        setSummary(data.summary || emptySummary);
        setLastSyncMessage("Connected Google Sheet and synced RSVPs.");
        return data.sheetConfig as SheetConfig;
      } catch {
        setSyncError("Network error while connecting to Google Sheet.");
        return null;
      } finally {
        setIsSyncing(false);
      }
    },
    [handleTokenExpired, user?.email]
  );

  const disconnectSheet = useCallback(async () => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      await fetch("/api/sheets/config", { method: "DELETE" });
      setSheetConfig(null);
      setLastSyncMessage("Disconnected Google Sheet link.");
    } finally {
      setIsSyncing(false);
    }
  }, []);

  return (
    <GoogleSheetContext.Provider
      value={{
        user,
        accessToken,
        needsAuth,
        isSigningIn,
        authError,
        rsvps,
        summary,
        sheetConfig,
        isSyncing,
        syncError,
        lastSyncMessage,
        isHostModalOpen,
        openHostModal: () => setIsHostModalOpen(true),
        closeHostModal: () => setIsHostModalOpen(false),
        handleGoogleSignIn,
        handleGoogleLogout,
        refreshRsvps,
        submitRsvp,
        createGoogleSheet,
        connectGoogleSheet,
        syncNow: () => syncNowWithToken(),
        disconnectSheet,
      }}
    >
      {children}
    </GoogleSheetContext.Provider>
  );
}

export function useGoogleSheet() {
  const ctx = useContext(GoogleSheetContext);
  if (!ctx) {
    throw new Error("useGoogleSheet must be used inside GoogleSheetProvider");
  }
  return ctx;
}
