import { supabase } from './supabase';

// ══════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════
export interface VisitorLog {
  id: string;
  user_name?: string;
  session_start: string;
  session_end?: string;
  total_duration_seconds: number;
  active_seconds: number;
  idle_seconds: number;
  browser: string;
  browser_version: string;
  os: string;
  device_type: string;
  screen_resolution: string;
  viewport_size: string;
  timezone: string;
  language: string;
  referrer: string;
  ip_address: string;
  connection_type: string;
  is_mobile: boolean;
  created_at?: string;
}

// ══════════════════════════════════════════════
// BROWSER / OS DETECTION
// ══════════════════════════════════════════════
function parseBrowser(ua: string): { browser: string; version: string } {
  if (/Edg\//.test(ua)) {
    const v = ua.match(/Edg\/([\d.]+)/)?.[1] ?? '';
    return { browser: 'Microsoft Edge', version: v };
  }
  if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) {
    const v = ua.match(/Chrome\/([\d.]+)/)?.[1] ?? '';
    return { browser: 'Google Chrome', version: v };
  }
  if (/Firefox\//.test(ua)) {
    const v = ua.match(/Firefox\/([\d.]+)/)?.[1] ?? '';
    return { browser: 'Mozilla Firefox', version: v };
  }
  if (/Safari\//.test(ua) && !/Chrome/.test(ua)) {
    const v = ua.match(/Version\/([\d.]+)/)?.[1] ?? '';
    return { browser: 'Apple Safari', version: v };
  }
  if (/OPR\//.test(ua) || /Opera/.test(ua)) {
    const v = ua.match(/OPR\/([\d.]+)/)?.[1] ?? '';
    return { browser: 'Opera', version: v };
  }
  return { browser: 'Unknown Browser', version: '' };
}

function parseOS(ua: string): string {
  if (/Windows NT 10/.test(ua)) return 'Windows 10/11';
  if (/Windows NT 6.3/.test(ua)) return 'Windows 8.1';
  if (/Windows NT 6.1/.test(ua)) return 'Windows 7';
  if (/Windows/.test(ua)) return 'Windows';
  if (/iPhone OS/.test(ua)) return `iOS ${ua.match(/iPhone OS ([\d_]+)/)?.[1]?.replace(/_/g, '.') ?? ''}`;
  if (/iPad/.test(ua)) return `iPadOS ${ua.match(/CPU OS ([\d_]+)/)?.[1]?.replace(/_/g, '.') ?? ''}`;
  if (/Android/.test(ua)) return `Android ${ua.match(/Android ([\d.]+)/)?.[1] ?? ''}`;
  if (/Mac OS X/.test(ua)) return `macOS ${ua.match(/Mac OS X ([\d_.]+)/)?.[1]?.replace(/_/g, '.') ?? ''}`;
  if (/Linux/.test(ua)) return 'Linux';
  if (/CrOS/.test(ua)) return 'ChromeOS';
  return 'Unknown OS';
}

function getDeviceType(ua: string): string {
  if (/iPad/.test(ua)) return 'Tablet';
  if (/Mobile|Android|iPhone|iPod/.test(ua)) return 'Mobile';
  return 'Desktop';
}

function isMobile(ua: string): boolean {
  return /Mobile|Android|iPhone|iPod/.test(ua);
}

function getConnectionType(): string {
  const nav = navigator as any;
  const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
  if (!conn) return 'Unknown';
  return conn.effectiveType ?? conn.type ?? 'Unknown';
}

// ══════════════════════════════════════════════
// SESSION ID GENERATOR
// ══════════════════════════════════════════════
export function generateSessionId(): string {
  return `vs-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
}

let currentSessionId: string | null = null;

export function setCurrentSessionId(id: string) {
  currentSessionId = id;
}

export function updateCurrentVisitorName(name: string) {
  const trimmed = name?.trim();
  if (!trimmed) return;
  try {
    localStorage.setItem('kinna_user_global_name', trimmed);
    localStorage.setItem('kinna_space_player_name', trimmed);
    localStorage.setItem('kinna_runner_player_name', trimmed);
  } catch {}

  if (currentSessionId) {
    // Immediate update
    updateVisitorLog(currentSessionId, { user_name: trimmed });
    // Backup retry after 1.5s in case insert was in-flight
    setTimeout(() => {
      if (currentSessionId) {
        updateVisitorLog(currentSessionId, { user_name: trimmed });
      }
    }, 1500);
  }
}

// ══════════════════════════════════════════════
// BUILD INITIAL LOG RECORD (SYNCHRONOUS & INSTANT)
// ══════════════════════════════════════════════
export function buildVisitorLog(sessionId: string): VisitorLog {
  setCurrentSessionId(sessionId);
  const ua = navigator.userAgent;
  const { browser, version } = parseBrowser(ua);
  const now = new Date().toISOString();

  let name = 'Anonymous';
  try {
    name = localStorage.getItem('kinna_user_global_name') || localStorage.getItem('kinna_space_player_name') || 'Anonymous';
  } catch {}

  // Fetch public IP in background asynchronously so insert completes in 1ms!
  setTimeout(async () => {
    try {
      const res = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(3000) });
      const json = await res.json();
      if (json.ip) {
        updateVisitorLog(sessionId, { ip_address: json.ip } as any);
      }
    } catch {}
  }, 100);

  return {
    id: sessionId,
    user_name: name,
    session_start: now,
    total_duration_seconds: 0,
    active_seconds: 0,
    idle_seconds: 0,
    browser,
    browser_version: version,
    os: parseOS(ua),
    device_type: getDeviceType(ua),
    screen_resolution: `${screen.width}×${screen.height}`,
    viewport_size: `${window.innerWidth}×${window.innerHeight}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language || 'Unknown',
    referrer: document.referrer || 'Direct Visit',
    ip_address: 'Locating...',
    connection_type: getConnectionType(),
    is_mobile: isMobile(ua),
  };
}

// ══════════════════════════════════════════════
// SUPABASE OPERATIONS
// ══════════════════════════════════════════════
export async function insertVisitorLog(log: VisitorLog): Promise<void> {
  let nameVal = log.user_name || 'Anonymous';
  try {
    const latest = localStorage.getItem('kinna_user_global_name');
    if (latest && latest.trim()) nameVal = latest.trim();
  } catch {}

  const tag = `[USR:${nameVal}]`;
  const cleanReferrer = (log.referrer || 'Direct Visit').replace(/\s*\[USR:.*?\]/g, '');
  const cleanConn = (log.connection_type || 'Unknown').replace(/\s*\[USR:.*?\]/g, '');

  const baseRecord: any = {
    id: log.id,
    session_start: log.session_start,
    total_duration_seconds: log.total_duration_seconds,
    active_seconds: log.active_seconds,
    idle_seconds: log.idle_seconds,
    browser: log.browser,
    browser_version: log.browser_version,
    os: log.os,
    device_type: log.device_type,
    screen_resolution: log.screen_resolution,
    viewport_size: log.viewport_size,
    timezone: log.timezone,
    language: log.language,
    referrer: `${cleanReferrer} ${tag}`,
    ip_address: log.ip_address,
    connection_type: `${cleanConn} ${tag}`,
    is_mobile: log.is_mobile,
  };

  // 1. Attempt insert with user_name column
  const { error: err1 } = await supabase.from('visitor_logs').insert({
    ...baseRecord,
    user_name: nameVal,
    name: nameVal,
  });

  if (err1) {
    // 2. Fallback attempt with name column only
    const { error: err2 } = await supabase.from('visitor_logs').insert({
      ...baseRecord,
      name: nameVal,
    });
    if (err2) {
      // 3. Guaranteed fallback with base record (contains embedded name tag)
      await supabase.from('visitor_logs').insert(baseRecord);
    }
  }
}

export async function updateVisitorLog(
  sessionId: string,
  data: Partial<{
    user_name: string;
    session_end: string;
    total_duration_seconds: number;
    active_seconds: number;
    idle_seconds: number;
  }>
): Promise<void> {
  const payload: any = { ...data };

  if (data.user_name) {
    const nameVal = data.user_name;
    const tag = `[USR:${nameVal}]`;
    payload.referrer = `Direct Visit ${tag}`;
    payload.connection_type = `Unknown ${tag}`;
  }

  // 1. Attempt update as-is
  const { error: err1 } = await supabase
    .from('visitor_logs')
    .update(payload)
    .eq('id', sessionId);

  if (err1 && data.user_name) {
    // 2. Fallback without user_name/name columns (uses encoded referrer & connection_type)
    const basePayload: any = { ...payload };
    delete basePayload.user_name;
    delete basePayload.name;

    await supabase
      .from('visitor_logs')
      .update(basePayload)
      .eq('id', sessionId);
  }
}

export async function fetchTotalVisitorCount(): Promise<number> {
  const { count, error } = await supabase
    .from('visitor_logs')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Fetch total visitor count error:', error.message);
    return 0;
  }
  return count ?? 0;
}

export async function fetchVisitorLogs(): Promise<VisitorLog[]> {
  const { data, error } = await supabase
    .from('visitor_logs')
    .select('*')
    .order('session_start', { ascending: false })
    .limit(1000);

  if (error) {
    console.error('Fetch visitor logs error:', error.message);
    return [];
  }

  return (data ?? []).map((row: any) => {
    // Extract name from user_name column, name column, or embedded telemetry tag
    const refMatch = row.referrer?.match(/\[USR:(.*?)\]/)?.[1];
    const connMatch = row.connection_type?.match(/\[USR:(.*?)\]/)?.[1];
    const rawName = row.user_name || row.name || refMatch || connMatch;

    const cleanReferrer = (row.referrer || 'Direct Visit').replace(/\s*\[USR:.*?\]/g, '').trim();
    const cleanConn = (row.connection_type || 'Unknown').replace(/\s*\[USR:.*?\]/g, '').trim();

    return {
      id: row.id,
      user_name: (rawName && rawName.trim() && rawName !== 'Anonymous') ? rawName.trim() : 'Anonymous',
      session_start: row.session_start,
      session_end: row.session_end,
      total_duration_seconds: row.total_duration_seconds ?? 0,
      active_seconds: row.active_seconds ?? 0,
      idle_seconds: row.idle_seconds ?? 0,
      browser: row.browser,
      browser_version: row.browser_version,
      os: row.os,
      device_type: row.device_type,
      screen_resolution: row.screen_resolution,
      viewport_size: row.viewport_size,
      timezone: row.timezone,
      language: row.language,
      referrer: cleanReferrer || 'Direct Visit',
      ip_address: row.ip_address,
      connection_type: cleanConn || 'Unknown',
      is_mobile: row.is_mobile,
      created_at: row.created_at,
    };
  });
}
