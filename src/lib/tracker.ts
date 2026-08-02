import { supabase } from './supabase';

// ══════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════
export interface VisitorLog {
  id: string;
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

// ══════════════════════════════════════════════
// BUILD INITIAL LOG RECORD
// ══════════════════════════════════════════════
export async function buildVisitorLog(sessionId: string): Promise<VisitorLog> {
  const ua = navigator.userAgent;
  const { browser, version } = parseBrowser(ua);
  const now = new Date().toISOString();

  // Fetch public IP
  let ip = 'Unavailable';
  try {
    const res = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(4000) });
    const json = await res.json();
    ip = json.ip ?? 'Unavailable';
  } catch {
    ip = 'Unavailable';
  }

  return {
    id: sessionId,
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
    ip_address: ip,
    connection_type: getConnectionType(),
    is_mobile: isMobile(ua),
  };
}

// ══════════════════════════════════════════════
// SUPABASE OPERATIONS
// ══════════════════════════════════════════════
export async function insertVisitorLog(log: VisitorLog): Promise<void> {
  const { error } = await supabase.from('visitor_logs').insert({
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
    referrer: log.referrer,
    ip_address: log.ip_address,
    connection_type: log.connection_type,
    is_mobile: log.is_mobile,
  });
  if (error) console.warn('Visitor log insert error:', error.message);
}

export async function updateVisitorLog(
  sessionId: string,
  data: Partial<{
    session_end: string;
    total_duration_seconds: number;
    active_seconds: number;
    idle_seconds: number;
  }>
): Promise<void> {
  const { error } = await supabase
    .from('visitor_logs')
    .update(data)
    .eq('id', sessionId);
  if (error) console.warn('Visitor log update error:', error.message);
}

export async function fetchVisitorLogs(): Promise<VisitorLog[]> {
  const { data, error } = await supabase
    .from('visitor_logs')
    .select('*')
    .order('session_start', { ascending: false })
    .limit(200);

  if (error) {
    console.error('Fetch visitor logs error:', error.message);
    return [];
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
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
    referrer: row.referrer,
    ip_address: row.ip_address,
    connection_type: row.connection_type,
    is_mobile: row.is_mobile,
    created_at: row.created_at,
  }));
}
