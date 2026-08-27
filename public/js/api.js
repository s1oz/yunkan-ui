const TOKEN_KEY = "yunkan.token";

export class ApiError extends Error {
  constructor(status, message, data, code) {
    super(message || `HTTP ${status}`);
    this.status = status;
    this.data = data;
    this.code = code;
  }
}

function qs(path, query) {
  if (!query) return path;
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null || v === "") continue;
    u.set(k, String(v));
  }
  const s = u.toString();
  return s ? `${path}?${s}` : path;
}

function unwrap(body) {
  if (body && typeof body === "object" && "code" in body && "data" in body) {
    return { code: body.code, data: body.data, message: body.message };
  }
  return { data: body };
}

function asToken(v) {
  if (!v) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object") {
    return asToken(v.access_token || v.accessToken || v.token || v.jwt || v.id_token || v.value);
  }
  return "";
}

function pickToken(data) {
  if (!data) return "";
  if (typeof data === "string") return data;
  return (
    asToken(data.access_token) ||
    asToken(data.accessToken) ||
    asToken(data.token) ||
    asToken(data.jwt) ||
    asToken(data.id_token) ||
    asToken(data.idToken) ||
    asToken(data.authorization) ||
    ""
  );
}

export function asList(data, keys = []) {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];
  const names = [
    ...keys,
    "items", "cameras", "events", "people", "pets", "users",
    "layouts", "groups", "segments", "zones", "tripwires",
    "automations", "runs", "jobs", "annotations", "candidates",
    "visits", "samples", "devices", "backends", "logs", "models",
    "channels", "exports", "recent", "results", "rows", "list", "recordings",
  ];
  for (const k of names) if (Array.isArray(data[k])) return data[k];
  return [];
}

export function camId(c) {
  return String(c?.id ?? c?.camera_id ?? c?.uid ?? "");
}
export function camName(c) {
  return c?.name || c?.display_name || camId(c) || "未命名";
}
export function isOnline(c) {
  if (typeof c?.online === "boolean") return c.online;
  if (typeof c?.is_online === "boolean") return c.is_online;
  const s = String(c?.status || c?.state || "").toLowerCase();
  if (s.includes("online") || s === "running" || s === "ok") return true;
  if (s.includes("offline") || s === "down") return false;
  return null;
}

export const api = {
  token: localStorage.getItem(TOKEN_KEY) || "",
  demo: localStorage.getItem("yunkan.demo") === "1",
  mock: null,

  setToken(t) {
    this.token = t || "";
    if (t) {
      localStorage.setItem(TOKEN_KEY, t);
      document.cookie = `yunkan_auth=${encodeURIComponent(t)}; path=/; SameSite=Lax`;
    } else {
      localStorage.removeItem(TOKEN_KEY);
      document.cookie = "yunkan_auth=; path=/; max-age=0";
    }
  },

  setDemo(on) {
    this.demo = !!on;
    if (on) localStorage.setItem("yunkan.demo", "1");
    else localStorage.removeItem("yunkan.demo");
  },

  async request(path, opts = {}) {
    if (this.demo && this.mock) return this.mock(path, opts);
    const headers = { ...(opts.headers || {}) };
    if (this.token && !headers.Authorization) headers.Authorization = `Bearer ${this.token}`;
    const init = { method: opts.method || "GET", headers };
    if (opts.json !== undefined) {
      headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(opts.json);
    } else if (opts.body !== undefined) {
      init.body = opts.body;
    }
    const r = await fetch(path, init);
    if (opts.raw) return r;
    const ct = r.headers.get("content-type") || "";
    if (!ct.includes("json")) {
      if (r.status === 204) return null;
      if (!r.ok) throw new ApiError(r.status, await r.text());
      return r;
    }
    const body = await r.json();
    const { code, data, message } = unwrap(body);
    const ok = r.ok && (code === undefined || code === 0 || code === 200);
    if (!ok) {
      if (r.status === 401 || code === 401) throw new ApiError(401, message || "未登录", data, code);
      throw new ApiError(r.status, message || "请求失败", data, code);
    }
    return data === undefined ? body : data;
  },

  get(path, query) {
    return this.request(qs(path, query));
  },
  post(path, json) {
    return this.request(path, { method: "POST", json });
  },
  put(path, json) {
    return this.request(path, { method: "PUT", json });
  },
  patch(path, json) {
    return this.request(path, { method: "PATCH", json });
  },
  del(path, json) {
    return this.request(path, { method: "DELETE", json });
  },

  async blob(path, query) {
    if (this.demo && this.mock) {
      const data = await this.mock(qs(path, query), { method: "GET", raw: true });
      if (data instanceof Response) {
        if (data.status === 204) return null;
        const stale = data.headers.get("X-Snapshot-Stale") === "1";
        return { blob: await data.blob(), stale };
      }
      if (data?.blob) return data;
    }
    const r = await this.request(qs(path, query), { raw: true });
    if (r && r.blob instanceof Blob) return r;
    if (r.status === 204) return null;
    if (!r.ok) throw new ApiError(r.status, await r.text());
    const stale = r.headers.get("X-Snapshot-Stale") === "1";
    return { blob: await r.blob(), stale };
  },

  async login(username, password) {
    const data = await this.post("/api/auth/login", { username, password });
    const token = pickToken(data);
    if (!token) {
      const keys = data && typeof data === "object" ? Object.keys(data).join(",") : typeof data;
      throw new ApiError(500, `登录成功但未返回 token（${keys || "空响应"}）`, data);
    }
    this.setToken(token);
    this.setDemo(false);
    return data;
  },

  async setupAdmin(payload) {
    const data = await this.post("/api/auth/setup", payload);
    const token = pickToken(data);
    if (token) this.setToken(token);
    return data;
  },

  logout() {
    const t = this.token;
    const wasDemo = this.demo;
    this.setToken("");
    this.setDemo(false);
    if (t && !wasDemo) this.post("/api/auth/logout", {}).catch(() => {});
  },
};

if (api.token) {
  document.cookie = `yunkan_auth=${encodeURIComponent(api.token)}; path=/; SameSite=Lax`;
}

export function fmtTime(v) {
  if (!v) return "—";
  const d = typeof v === "number" ? new Date(v > 1e12 ? v : v * 1000) : new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fmtDay(v = new Date()) {
  const d = v instanceof Date ? v : new Date(v);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function eventTitle(ev) {
  return ev.summary || ev.summary_zh || ev.label || ev.type || ev.event_type || ev.title || "事件";
}

export function eventSnap(ev) {
  return ev.snapshot_url || ev.snapshot || ev.thumb_url || "";
}

export function parseExtra(e) {
  if (!e || typeof e !== "object") return {};
  let x = e.extra;
  if (typeof x === "string") {
    const s = x.trim();
    if (!s) x = {};
    else {
      try { x = JSON.parse(s); } catch { x = {}; }
    }
  }
  if (!x || typeof x !== "object" || Array.isArray(x)) {
    const alt = e.payload || e.event_extra || e.meta;
    if (typeof alt === "string") {
      try { x = JSON.parse(alt); } catch { x = {}; }
    } else if (alt && typeof alt === "object" && !Array.isArray(alt)) x = alt;
    else x = {};
  }
  return x;
}

export function eventIsUnread(e) {
  if (!e || typeof e !== "object") return false;
  if (e.unread === true || e.is_unread === true) return true;
  if (e.unread === false || e.is_unread === false) return false;
  const read = e.is_read ?? e.read ?? e.has_read;
  if (read === false || read === 0 || read === "0") return true;
  if (read === true || read === 1 || read === "1") return false;
  if ("read_at" in e) return !e.read_at;
  return false;
}

export function normEvent(e) {
  if (!e || typeof e !== "object") return e;
  const extra = parseExtra(e);
  const id = e.id ?? e.event_id ?? e.uid;
  const camera_id = e.camera_id ?? e.camera ?? e.cam_id ?? e.channel_id ?? "";
  const event_time = e.event_time || e.ts || e.created_at || e.time || e.start_time || e.timestamp;
  const unread = eventIsUnread(e);
  return {
    ...e,
    extra,
    id,
    camera_id: camera_id == null ? "" : String(camera_id),
    camera_name: e.camera_name || e.cam_name || e.channel_name || "",
    event_time,
    unread,
    type: e.type || e.event_type || extra.event_type || extra.label || extra.detections?.[0]?.label,
    event_subtype: e.event_subtype || extra.event_subtype || extra.subtype || "",
    direction: e.direction || extra.direction,
    direction_label: e.direction_label || extra.direction_label || extra.crossing_label || "",
    snapshot_url: e.snapshot_url || e.snapshot || e.thumb_url || e.image_url || "",
  };
}

export function eventList(data, extraKeys = []) {
  let list = asList(data, extraKeys);
  if (!list.length && data && typeof data === "object" && !Array.isArray(data)) {
    for (const v of Object.values(data)) {
      if (Array.isArray(v) && v.length && v[0] && typeof v[0] === "object") {
        list = v;
        break;
      }
    }
  }
  return list.map(normEvent).filter((e) => e && e.id != null && e.id !== "");
}

export function eventSnapUrl(ev, opts = {}) {
  const s = eventSnap(ev);
  if (!s) return "";
  try {
    const u = new URL(s, "http://local.invalid");
    if (opts.annotate) {
      u.searchParams.set("annotate", "1");
      if (ev?.id != null) u.searchParams.set("event_id", String(ev.id));
    }
    if (opts.w) u.searchParams.set("w", String(opts.w));
    return u.pathname + u.search;
  } catch {
    const join = s.includes("?") ? "&" : "?";
    const extra = [];
    if (opts.annotate) extra.push("annotate=1", ev?.id != null ? `event_id=${encodeURIComponent(ev.id)}` : "");
    if (opts.w) extra.push(`w=${opts.w}`);
    return s + join + extra.filter(Boolean).join("&");
  }
}

export function fmtBytes(n) {
  n = Number(n);
  if (!Number.isFinite(n) || n <= 0) return "—";
  const u = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; }
  return `${n.toFixed(n >= 10 || i === 0 ? 0 : 1)} ${u[i]}`;
}
