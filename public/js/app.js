import {
  api, ApiError, asList, camId, camName, isOnline,
  fmtTime, fmtDay, eventTitle, eventSnap, eventSnapUrl, fmtBytes, eventList,
  parseExtra, normEvent, eventIsUnread,
} from "./api.js";
import { installMock } from "./mock.js";
import {
  SLOGAN, PRODUCT, CATALOG, PRESETS, GROUPS, COVER_LABEL,
  loadAddons, saveAddons, applyPreset, isOn, enabledNav,
  moduleById, countEnabled, FIRST_KEY,
} from "./modules.js";

installMock(api);

const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));

const I = {
  mark: `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 9c2.4-4.2 5.3-6.2 6-6.2S12.6 4.8 15 9c-2.4 4.2-5.3 6.2-6 6.2S5.4 13.2 3 9z"/><circle cx="9" cy="9" r="2.3"/></svg>`,
  cam: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="2" y="4" width="9" height="8" rx="1.5"/><path d="m11 7 3-1.5v5L11 9"/></svg>`,
  bolt: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M8 2 4 9h3.5L6.2 14 12 7H8.4L10 2z"/></svg>`,
  clock: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 1.5"/></svg>`,
  user: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="8" cy="6" r="2.2"/><path d="M3.5 13c.6-2.4 2.2-3.5 4.5-3.5s3.9 1.1 4.5 3.5"/></svg>`,
  chip: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="4" y="4" width="8" height="8" rx="1.5"/><path d="M8 2v2M8 12v2M2 8h2M12 8h2"/></svg>`,
  plug: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M6 2v4M10 2v4M4.5 6h7v3a3.5 3.5 0 0 1-7 0z"/></svg>`,
  gear: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="8" cy="8" r="2"/><path d="M8 3v1.5M8 11.5V13M3 8h1.5M11.5 8H13"/></svg>`,
  grid: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="3" width="4" height="4" rx=".8"/><rect x="9" y="3" width="4" height="4" rx=".8"/><rect x="3" y="9" width="4" height="4" rx=".8"/><rect x="9" y="9" width="4" height="4" rx=".8"/></svg>`,
  home: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 7.5 8 3l5 4.5V13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/></svg>`,
  x: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m3 3 8 8M11 3 3 11"/></svg>`,
  disk: `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.7"><ellipse cx="6.5" cy="4" rx="4.2" ry="1.6"/><path d="M2.3 4v5.2c0 .9 1.9 1.6 4.2 1.6s4.2-.7 4.2-1.6V4"/><path d="M2.3 6.6c0 .9 1.9 1.6 4.2 1.6s4.2-.7 4.2-1.6"/></svg>`,
  alert: `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M8 3.2 2.6 13h10.8L8 3.2z"/><path d="M8 7v3.2M8 12.2v.2"/></svg>`,
  ext: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M8 3h5v5M13 3 7 9"/><path d="M11 8.5V12H3V4h3.5"/></svg>`,
  sun: `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="7.5" cy="7.5" r="3"/><path d="M7.5 1.5v1.5M7.5 12v1.5M1.5 7.5H3M12 7.5h1.5M3.2 3.2l1.1 1.1M10.7 10.7l1.1 1.1M3.2 11.8l1.1-1.1M10.7 4.3l1.1-1.1"/></svg>`,
  moon: `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M13 9.2A5.2 5.2 0 0 1 6.8 2 5.4 5.4 0 1 0 13 9.2z"/></svg>`,
  panel: `<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="2" y="3" width="11" height="10" rx="1.5"/><path d="M9.5 3v10"/></svg>`,
  lock: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="7" width="8" height="6" rx="1"/><path d="M5 7V5.2a2 2 0 0 1 4 0V7"/></svg>`,
  unlock: `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="7" width="8" height="6" rx="1"/><path d="M5 7V5.2a2 2 0 0 1 3.7-.9"/></svg>`,
};
const ICONS = { cam: I.cam, bolt: I.bolt, clock: I.clock, user: I.user, chip: I.chip, plug: I.plug, gear: I.gear, grid: I.grid, home: I.home };

const NAV_KEY = "yunkan.navOn";
const LAYOUT_KEY = "yunkan.mosaicLayout";
const THEME_KEY = "yunkan.theme";
const LIVE_KEY = "yunkan.livePrefs";
const ORIG_KEY = "yunkan.origUi";
const RAIL_KEY = "yunkan.railOn";
const LOCK_KEY = "yunkan.layoutLock";

const S = {
  route: "home",
  me: null,
  license: null,
  cameras: [],
  unread: 0,
  selected: null,
  q: "",
  identityTab: "people",
  trainTab: "jobs",
  integTab: "gb28181",
  sysTab: "overview",
  evType: "",
  evCam: "",
  event: null,
  events: [],
  recent: [],
  replayCam: "",
  replayAt: 0,
  replaySpeed: 1,
  replayPlaying: false,
  replayLive: false,
  replaySegs: [],
  replayEventId: null,
  replayAllEvents: [],
  playGen: 0,
  grants: {},
  _snapTimer: 0,
  modal: null,
  addons: loadAddons(),
  expandMod: null,
  pack: {},
  navOn: localStorage.getItem(NAV_KEY) !== "0",
  theme: localStorage.getItem(THEME_KEY) || "night",
  mosaicLayout: null,
  liveAudioId: null,
  railOn: localStorage.getItem(RAIL_KEY) !== "0",
  layoutLock: localStorage.getItem(LOCK_KEY) === "1",
  replayEvAll: false,
  tlStart: 0,
  tlEnd: 0,
  eventPop: null,
  eventTrack: null,
  showBoxes: true,
  showTrack: true,
  livePrefs: {},
  alerts: [],
  logs: [],
  tripwires: null,
  eventExtra: {},
};

const zoomMap = new Map();
let mosaicObs = null;
let replayTimer = 0;
let clockTimer = 0;

const blobs = new Set();
function blobUrl(b) { const u = URL.createObjectURL(b); blobs.add(u); return u; }
function wipeBlobs() {
  const keep = new Set();
  $$("#home-keep img").forEach((img) => {
    if (img.src && img.src.startsWith("blob:")) keep.add(img.src);
  });
  for (const u of [...blobs]) {
    if (keep.has(u)) continue;
    URL.revokeObjectURL(u);
    blobs.delete(u);
  }
}

const players = new Map();
function stopPlayer(key) {
  const p = players.get(key);
  if (!p) return;
  try { p.hls?.destroy(); } catch {}
  try { p.video.pause(); p.video.removeAttribute("src"); p.video.load(); } catch {}
  players.delete(key);
}
function stopAllPlayers() {
  for (const key of [...players.keys()]) stopPlayer(key);
}
function mosaicAlive() {
  return !!$("#home-keep .mtile");
}
function stopPagePlayers() {
  for (const key of [...players.keys()]) {
    if (mosaicAlive() && (key.startsWith("tile-") || key.startsWith("aac-"))) continue;
    stopPlayer(key);
  }
}
function discardMosaic() {
  document.body.classList.remove("yk-home");
  const keep = $("#home-keep");
  if (keep) keep.innerHTML = "";
  S._mosaicKey = "";
  for (const key of [...players.keys()]) {
    if (key.startsWith("tile-") || key.startsWith("aac-")) stopPlayer(key);
  }
}
function stopTilePlayers(id) {
  stopPlayer("tile-" + id);
  stopPlayer("aac-" + id);
}

function toast(msg, kind = "") {
  const t = document.createElement("div");
  t.className = `toast ${kind}`;
  t.textContent = msg;
  $("#toasts").append(t);
  setTimeout(() => t.remove(), 3200);
}

function parseHash() {
  const h = (location.hash || "#/home").replace(/^#/, "");
  const [path, qs] = h.split("?");
  const parts = path.split("/").filter(Boolean);
  const query = Object.fromEntries(new URLSearchParams(qs || ""));
  return { parts, query };
}
function go(to) { location.hash = to.startsWith("#") ? to : `#${to}`; }
function hashPath() { return (location.hash || "#/home").replace(/^#/, ""); }
function goSystemTab(tab) {
  S.sysTab = tab || "overview";
  const next = `/system?tab=${encodeURIComponent(S.sysTab)}`;
  if (hashPath() === next) return render();
  go(next);
}
function feat(mod, id) { return isOn(S.addons, mod, id); }
function persistAddons() { saveAddons(S.addons); }

function origSettingsUrl() {
  const saved = localStorage.getItem(ORIG_KEY);
  if (saved) return saved;
  // Official YunKan web admin defaults to :23406 on the same host (not a fixed IP).
  return `${location.protocol}//${location.hostname}:23406/settings`;
}

function themeIsDay() {
  let t = S.theme || "night";
  if (t === "system") t = matchMedia("(prefers-color-scheme: light)").matches ? "day" : "night";
  if (t === "blue") t = "night";
  return t === "day";
}
function applyTheme() {
  document.documentElement.dataset.theme = themeIsDay() ? "day" : "night";
}

function loadLivePrefs() {
  try { S.livePrefs = JSON.parse(localStorage.getItem(LIVE_KEY) || "{}") || {}; }
  catch { S.livePrefs = {}; }
  if (!S.livePrefs.cams) S.livePrefs.cams = {};
  if (S.livePrefs.source !== "sub") S.livePrefs.source = "main";
  if (typeof S.livePrefs.muted !== "boolean") S.livePrefs.muted = true;
  if (Object.prototype.hasOwnProperty.call(S.livePrefs, "audioId")) {
    S.liveAudioId = S.livePrefs.audioId || null;
  }
}
function defaultAudioCamId() {
  const cams = S.cameras || [];
  const hit = cams.find((c) => isOnline(c) && camId(c)) || cams.find((c) => camId(c));
  return hit ? camId(hit) : null;
}
function ensureDefaultLiveAudio() {
  if (Object.prototype.hasOwnProperty.call(S.livePrefs, "audioId")) {
    S.liveAudioId = S.livePrefs.audioId || null;
    return;
  }
  const id = defaultAudioCamId();
  S.liveAudioId = id;
  S.livePrefs.audioId = id;
  if (id) S.livePrefs.cams[id] = { ...livePref(id), muted: false };
  localStorage.setItem(LIVE_KEY, JSON.stringify(S.livePrefs));
}
function livePref(id) {
  const g = S.livePrefs || {};
  const p = (g.cams && g.cams[id]) || {};
  const userSub = p.userSource === true && p.source === "sub";
  return {
    source: userSub ? "sub" : "main",
    muted: typeof p.muted === "boolean" ? p.muted : (typeof g.muted === "boolean" ? g.muted : true),
    userSource: p.userSource === true,
  };
}
function setLivePref(id, patch) {
  if (!S.livePrefs.cams) S.livePrefs.cams = {};
  if (id) S.livePrefs.cams[id] = { ...livePref(id), ...patch };
  else Object.assign(S.livePrefs, patch);
  if (typeof patch.muted === "boolean" && !id) S.livePrefs.muted = patch.muted;
  localStorage.setItem(LIVE_KEY, JSON.stringify(S.livePrefs));
}

try { S.mosaicLayout = JSON.parse(localStorage.getItem(LAYOUT_KEY) || "null"); } catch { S.mosaicLayout = null; }
loadLivePrefs();
applyTheme();
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { if (S.theme === "system") applyTheme(); });

function toMs(v) {
  if (v == null || v === "") return 0;
  if (typeof v === "number") {
    if (v > 1e12) return v;
    if (v > 1e9) return v * 1000;
    return v;
  }
  const n = Date.parse(v);
  return Number.isNaN(n) ? 0 : n;
}
function pad2(n) { return String(n).padStart(2, "0"); }
function fmtStamp(ms) {
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return "—";
  return `${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}
function fmtClockMs(ms) {
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return "--:--:--";
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

async function loadMe() {
  S.me = await api.get("/api/me").catch(() => api.get("/api/auth/me"));
}
async function loadCameras() {
  S.cameras = asList(await api.get("/api/cameras"), ["cameras"]);
  if (!S.selected && S.cameras[0]) S.selected = camId(S.cameras[0]);
}
async function loadUnread() {
  try {
    const d = await api.get("/api/events/unread-count");
    S.unread = Number(d?.count ?? d?.unread ?? d ?? 0);
  } catch { S.unread = 0; }
}
async function loadAlerts() {
  try {
    const sc = await api.get("/api/system/self-check");
    S.alerts = asList(sc, ["findings", "issues", "alerts"]);
    if (!S.alerts.length && Array.isArray(sc?.findings)) S.alerts = sc.findings;
  } catch { S.alerts = []; }
}

const FINDING_WHY = {
  ep_init_failed: "OpenVINO 加速引擎初始化失败",
  device_missing: "没有可用的核显设备",
  no_igpu: "未检测到 Intel 核显",
  gpu_not_available: "OpenVINO 认不到 GPU",
};
function findingText(f) {
  if (f == null) return "";
  if (typeof f === "string") return f;
  if (f.message) return f.message;
  const id = f.id || f.code || "";
  const why = FINDING_WHY[f.reason] || f.reason || "加速未生效";
  if (id === "inference_cpu_fallback") {
    return `AI 推理配置为 ${f.configured || "OpenVINO"}，实际跑在 ${f.effective || "CPU"} 上（${why}）。不是宕机：检测还在工作，只是没用上核显，CPU 会更忙。`;
  }
  if (id === "decode_fallback") {
    return `视频解码回退到软件解码（${why}）。画面仍能看，CPU 占用会升高。`;
  }
  return id || JSON.stringify(f);
}
function findingHtml(list) {
  const findings = list || [];
  if (!findings.length) return "";
  return `<div class="sheet findings" style="margin-bottom:10px"><h3 style="margin-top:0">自检</h3>
    ${findings.map((f) => `<p class="finding ${esc(f.severity || f.level || "warn")}">${esc(findingText(f))}</p>`).join("")}</div>`;
}

async function loadTripwires() {
  if (Array.isArray(S.tripwires)) return S.tripwires;
  try { S.tripwires = asList(await api.get("/api/tripwires"), ["tripwires"]); }
  catch { S.tripwires = []; }
  return S.tripwires;
}

function mergeEventExtras(list, full) {
  if (!list?.length || !full?.length) return list;
  const byId = {};
  for (const e of full) byId[String(e.id)] = e;
  for (const e of list) {
    const f = byId[String(e.id)];
    if (!f) continue;
    const extra = { ...parseExtra(e), ...parseExtra(f) };
    e.extra = extra;
    if (typeof f.unread === "boolean") e.unread = f.unread;
    else if (f && typeof f === "object") e.unread = eventIsUnread({ ...e, ...f });
    if (!e.direction_label) e.direction_label = f.direction_label || extra.direction_label || "";
    if (!e.direction) e.direction = f.direction || extra.direction;
    if (!e.event_subtype) e.event_subtype = f.event_subtype || extra.event_subtype || "";
    if (!e.summary && f.summary) e.summary = f.summary;
    if (!e.summary_zh && f.summary_zh) e.summary_zh = f.summary_zh;
  }
  return list;
}

function extraLooksEmpty(e) {
  const x = parseExtra(e);
  return !x.direction_label && !x.direction && !x.tripwire_name && !x.tripwire_id
    && !x.tripwire_line && !(Array.isArray(x.detections) && x.detections.length);
}

async function hydrateEventExtras(list) {
  if (!list?.length) return list;
  const missing = list.filter((e) => extraLooksEmpty(e) && !S.eventExtra[e.id]).slice(0, 16);
  if (missing.length) {
    await Promise.all(missing.map(async (e) => {
      try {
        const d = await api.get(`/api/events/${encodeURIComponent(e.id)}`);
        if (d) S.eventExtra[e.id] = parseExtra(d);
      } catch {}
    }));
  }
  for (const e of list) {
    const cached = S.eventExtra[e.id];
    if (cached && typeof cached === "object") e.extra = { ...parseExtra(e), ...cached };
  }
  return list;
}

async function loadRecentEvents() {
  let list = [];
  try { list = eventList(await api.get("/api/events/recent", { limit: 80 })); } catch {}
  if (!list.length) {
    try { list = eventList(await api.get("/api/events", { limit: 80 })); } catch {}
  } else {
    try { mergeEventExtras(list, eventList(await api.get("/api/events", { limit: 80 }))); } catch {}
  }
  await loadTripwires();
  if (list.some(extraLooksEmpty)) await hydrateEventExtras(list);
  S.recent = list.sort((a, b) => toMs(b.event_time) - toMs(a.event_time));
  return S.recent;
}

function spacePct() {
  const sp = S.pack.space || {};
  if (sp.used_pct != null && Number(sp.used_pct) <= 100) return Math.round(Number(sp.used_pct));
  const used = Number(sp.used_bytes ?? sp.used ?? 0);
  const free = Number(sp.free_bytes ?? sp.free ?? 0);
  let total = Number(sp.total_bytes ?? sp.total ?? 0);
  if (!total) total = used + free;
  return total > 0 ? Math.round((used / total) * 100) : null;
}

function numish(v) {
  if (typeof v === "number" && Number.isFinite(v) && v >= 0 && v < 1e6) return v;
  if (typeof v === "string" && v.trim() && Number.isFinite(Number(v))) {
    const n = Number(v);
    if (n >= 0 && n < 1e6) return n;
  }
  if (v && typeof v === "object") {
    for (const k of ["avg", "p50", "mean", "ms", "value", "last", "p95", "ema"]) {
      const n = numish(v[k]);
      if (n != null) return n;
    }
  }
  return null;
}

function findMetric(obj, re, depth = 0) {
  if (!obj || typeof obj !== "object" || depth > 6) return null;
  const entries = Array.isArray(obj) ? obj.map((v, i) => [String(i), v]) : Object.entries(obj);
  for (const [k, v] of entries) {
    if (re.test(k)) {
      const n = numish(v);
      if (n != null) return n;
    }
  }
  for (const [, v] of entries) {
    if (v && typeof v === "object") {
      const n = findMetric(v, re, depth + 1);
      if (n != null) return n;
    }
  }
  return null;
}

function fmtMs(n) {
  if (n == null || !Number.isFinite(Number(n))) return "—";
  const x = Number(n);
  return x >= 100 ? String(Math.round(x)) : (Math.round(x * 10) / 10).toFixed(1);
}

function inferMs() {
  const bag = [S.pack.metrics, S.pack.status, S.pack.selfCheck];
  for (const o of bag) {
    const n = findMetric(o, /infer|detect_lat|det_lat|inference/i);
    if (n != null) return n;
  }
  return null;
}
function decodeMs() {
  const bag = [S.pack.metrics, S.pack.status, S.pack.selfCheck];
  for (const o of bag) {
    const n = findMetric(o, /decode|dec_lat|ffmpeg_ms|hwaccel/i);
    if (n != null) return n;
  }
  return null;
}
function metricLabel(n) {
  return n == null ? "—" : `${fmtMs(n)} ms`;
}

async function fillAuthImg(img) {
  const src = img.dataset.src;
  if (!src) return;
  const tile = img.closest(".mtile");
  if (tile && isTilePlaying(tile)) return;
  try {
    const r = await api.blob(src);
    if (r) img.src = blobUrl(r.blob);
  } catch { img.style.opacity = ".4"; }
}
async function hydrate(rootEl) {
  await Promise.all($$("img[data-src]", rootEl).map(fillAuthImg));
}

function bindClock() {
  const el = $("#yk-clock");
  if (!el) return;
  const tick = () => {
    const n = new Date();
    el.textContent = `${pad2(n.getHours())}:${pad2(n.getMinutes())}:${pad2(n.getSeconds())}`;
  };
  tick();
  if (clockTimer) clearInterval(clockTimer);
  clockTimer = setInterval(tick, 1000);
}

function pickStream(grant, source) {
  if (!grant) return null;
  if (source === "sub" && grant.detect && (grant.detect.stream || grant.detect.app)) return grant.detect;
  return grant.live || grant;
}

function streamHls(grant, streamObj) {
  if (!grant || !streamObj) return "";
  if (streamObj.hls_url) return streamObj.hls_url;
  if (streamObj.url && String(streamObj.url).includes(".m3u8")) return streamObj.url;
  const app = streamObj.app || grant.app || "live";
  const stream = streamObj.stream;
  const token = streamObj.token || grant.token || "";
  if (!stream) return streamObj.url || "";
  const path = `/${encodeURIComponent(app)}/${encodeURIComponent(stream)}/hls.m3u8`;
  return token ? `${path}?token=${encodeURIComponent(token)}` : path;
}

function hlsFromGrant(grant, source = "main") {
  if (!grant) return "";
  const live = pickStream(grant, source) || {};
  return streamHls(grant, live) || grant.hls_url || grant.url || "";
}

function aacHlsFromGrant(grant) {
  const v = grant && grant.aac_variant;
  return v ? streamHls(grant, v) : "";
}

function grantFresh(g) {
  if (!g || typeof g !== "object") return false;
  const exp = g.expires_at || g.live?.expires_at || g.aac_variant?.expires_at;
  if (!exp) return true;
  const t = typeof exp === "number" ? (exp > 1e12 ? exp : exp * 1000) : Date.parse(exp);
  if (!Number.isFinite(t)) return true;
  return Date.now() < t - 120000;
}

async function ensureGrant(id, force = false) {
  const cur = S.grants && S.grants[id];
  if (!force && grantFresh(cur)) return cur;
  S._grantWait = S._grantWait || {};
  if (!force && S._grantWait[id]) return S._grantWait[id];
  const p = api.post(`/api/cameras/${encodeURIComponent(id)}/live-grant`, {}).then((g) => {
    S.grants = S.grants || {};
    S.grants[id] = g;
    delete S._grantWait[id];
    return g;
  }).catch((err) => {
    delete S._grantWait[id];
    throw err;
  });
  S._grantWait[id] = p;
  return p;
}

async function grantLive(id, source) {
  const g = await ensureGrant(id);
  return hlsFromGrant(g, source || livePref(id).source || "main");
}

function prefetchGrants() {
  for (const c of S.cameras || []) {
    const id = camId(c);
    if (!id) continue;
    if (S.grants && grantFresh(S.grants[id])) continue;
    ensureGrant(id).catch(() => {});
  }
}

function playMedia(el, wantSound) {
  if (!el) return;
  el.volume = 1;
  el.muted = !wantSound;
  const p = el.play();
  if (!p || !wantSound) {
    if (p && p.catch) p.catch(() => {});
    return;
  }
  p.catch(() => {
    el.muted = true;
    el.play().catch(() => {});
    const unmute = () => {
      el.muted = false;
      el.play().then(() => window.removeEventListener("pointerdown", unmute)).catch(() => {
        el.muted = true;
        el.play().catch(() => {});
      });
    };
    window.addEventListener("pointerdown", unmute, { once: true });
  });
}

function attachHls(video, url, key, muted = true, extra = {}) {
  stopPlayer(key);
  if (!url || !video) return false;
  video.muted = muted;
  video.autoplay = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  video.setAttribute("autoplay", "");
  video.volume = 1;
  const behind = Number(extra.secondsBehind || 0);
  const onPlay = extra.onPlay || (() => {});
  const onFail = extra.onFail || (() => {});
  const needVideo = extra.needVideo !== false;
  if (window.Hls && window.Hls.isSupported()) {
    const hls = new window.Hls({
      enableWorker: true,
      lowLatencyMode: !behind,
      liveSyncDuration: behind ? Math.max(1, behind) : 2,
      liveMaxLatencyDuration: behind ? undefined : 8,
      maxLiveSyncPlaybackRate: behind ? 1 : 1.8,
    });
    hls.loadSource(url);
    hls.attachMedia(video);
    let shown = false;
    const failOnce = () => { if (!shown) { shown = true; onFail(); } };
    const okOnce = () => { if (!shown) { shown = true; onPlay(); } };
    hls.on(window.Hls.Events.MANIFEST_PARSED, () => { playMedia(video, !muted); });
    video.addEventListener("playing", () => {
      if (!needVideo) { okOnce(); return; }
      setTimeout(() => {
        if (video.videoWidth > 0 && video.readyState >= 2 && !video.paused) okOnce();
        else failOnce();
      }, 400);
    }, { once: true });
    video.addEventListener("error", failOnce);
    hls.on(window.Hls.Events.ERROR, (_, d) => {
      if (d?.fatal) { try { hls.destroy(); } catch {} failOnce(); }
    });
    setTimeout(() => { if (!shown) failOnce(); }, needVideo ? 8000 : 6000);
    players.set(key, { hls, video, url, live: !behind, source: extra.source || "" });
    return true;
  }
  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = url;
    playMedia(video, !muted);
    video.addEventListener("playing", () => {
      if (!needVideo || video.videoWidth > 0) { video.hidden = needVideo ? false : video.hidden; onPlay(); }
      else onFail();
    }, { once: true });
    video.addEventListener("error", onFail, { once: true });
    setTimeout(() => { if (needVideo && video.videoWidth <= 0) onFail(); }, 8000);
    players.set(key, { hls: null, video, url, live: !behind, source: extra.source || "" });
    return true;
  }
  return false;
}

function gateView(kind, extra = {}) {
  const titles = { login: "登录", setup: "创建管理员", db: "配置数据库", license: "激活许可" };
  return `
  <div class="gate">
    <div class="gate-inner">
      <div class="gate-brand">
        <div class="gate-mark">${I.mark}</div>
        <h1>${PRODUCT}</h1>
        <p class="slogan">${SLOGAN}</p>
      </div>
      <form class="gate-card" data-act="gate-submit" data-kind="${kind}">
        <h2>${esc(titles[kind])}</h2>
        <p class="sub">重构后的工作台，不再沿用旧管理后台。</p>
        ${kind === "login" ? `
          <label class="field"><span>用户名</span><input name="username" autocomplete="username" autofocus required /></label>
          <label class="field"><span>密码</span><input name="password" type="password" autocomplete="current-password" required /></label>
          <button class="btn primary full" type="submit" data-act="do-login">进入工作台</button>
          <button class="btn ink full" type="button" data-act="demo" style="margin-top:8px">预览完整界面</button>
          <p class="hint">真实环境用原账号。预览不连接后端。</p>
        ` : ""}
        ${kind === "setup" ? `
          <label class="field"><span>管理员用户名</span><input name="username" required autofocus /></label>
          <label class="field"><span>显示名</span><input name="display_name" /></label>
          <label class="field"><span>密码</span><input name="password" type="password" required /></label>
          <button class="btn primary full" type="submit">创建并进入</button>
        ` : ""}
        ${kind === "db" ? `
          <p class="hint" style="margin-top:0">未配置数据库，将使用内置 SQLite。</p>
          <button class="btn primary full" type="submit">继续</button>
        ` : ""}
        ${kind === "license" ? `
          <p class="hint" style="margin-top:0">本机指纹<br><span class="mono">${esc(extra.fp || "…")}</span></p>
          <label class="field"><span>License Key</span><input name="license_key" required autofocus /></label>
          <button class="btn primary full" type="submit">激活</button>
        ` : ""}
        <p class="err" data-err hidden></p>
      </form>
    </div>
  </div>`;
}

function latestUnread() {
  const list = S.recent.length ? S.recent : S.events;
  return list.find((e) => e.unread) || list[0] || null;
}

function camDayStats() {
  const today = fmtDay();
  const map = {};
  for (const c of S.cameras) map[camId(c)] = { unread: 0, total: 0 };
  const seen = new Set();
  for (const e of [...S.events, ...S.recent]) {
    if (!e || seen.has(String(e.id))) continue;
    seen.add(String(e.id));
    if (fmtDay(e.event_time) !== today) continue;
    const id = String(e.camera_id || "");
    if (!map[id]) map[id] = { unread: 0, total: 0 };
    map[id].total++;
    if (e.unread) map[id].unread++;
  }
  return map;
}

function unreadActionsHtml() {
  if (!S.unread) return "";
  return `<span class="pill accent unread-pill">${S.unread > 99 ? "99+" : S.unread} 未读</span>
    <button class="btn sm" data-act="read-all">全部已读</button>`;
}

function syncUnreadUi() {
  const n = Math.max(0, Number(S.unread) || 0);
  S.unread = n;
  const nav = document.querySelector('.cats a[href="#/events"]');
  if (nav) {
    let b = nav.querySelector(".badge");
    if (n) {
      if (!b) { b = document.createElement("span"); b.className = "badge"; nav.appendChild(b); }
      b.textContent = n > 99 ? "99+" : String(n);
    } else b?.remove();
  }
  const chip = document.querySelector(".unread-chip .count");
  if (n) {
    if (chip) chip.textContent = n > 99 ? "99+" : String(n);
  } else chip?.remove();
  $$(".unread-pill").forEach((el) => {
    if (n) el.textContent = `${n > 99 ? "99+" : n} 未读`;
    else el.remove();
  });
  if (!n) $$("[data-act=read-all]").forEach((el) => el.remove());
  const stats = camDayStats();
  $$(".bar-cam").forEach((btn) => {
    const st = stats[btn.dataset.id] || { unread: 0, total: 0 };
    const em = $("em", btn);
    if (!em) return;
    em.textContent = st.unread;
    em.classList.toggle("zero", !st.unread);
  });
}

function markEventReadLocal(id) {
  if (id == null || id === "") return;
  let changed = false;
  const touch = (e) => {
    if (!e || String(e.id) !== String(id) || !e.unread) return;
    e.unread = false;
    changed = true;
  };
  S.recent.forEach(touch);
  S.events.forEach(touch);
  if (S.event) touch(S.event);
  if (S.eventPop) touch(S.eventPop);
  if (changed && S.unread > 0) S.unread -= 1;
  $$(".ev").forEach((el) => {
    if (String(el.dataset.id) !== String(id)) return;
    el.classList.remove("unread");
    el.querySelector(".ev-unread")?.remove();
  });
  syncUnreadUi();
}

async function markEventRead(id) {
  if (id == null || id === "") return;
  api.post(`/api/events/${encodeURIComponent(id)}/read`, {}).catch(() => {});
  markEventReadLocal(id);
}

async function markAllEventsRead() {
  await api.post("/api/events/read-all", {});
  for (const e of [...S.recent, ...S.events]) if (e) e.unread = false;
  if (S.event) S.event.unread = false;
  if (S.eventPop) S.eventPop.unread = false;
  S.unread = 0;
  $$(".ev.unread").forEach((el) => {
    el.classList.remove("unread");
    el.querySelector(".ev-unread")?.remove();
  });
  syncUnreadUi();
  toast("已全部已读", "ok");
}

function chrome(inner, wide = false) {
  const nav = enabledNav(S.addons).filter((m) => m.id !== "live" && m.id !== "rules");
  const initial = (S.me?.display_name || S.me?.username || "?").slice(0, 1).toUpperCase();
  const route = S.route === "live" ? "home" : S.route;
  const tabs = [
    ["home", I.home, "工作台"],
    ...nav.map((m) => [m.id, ICONS[m.icon] || I.grid, m.name]),
    ["addons", I.grid, "加载项"],
  ];
  const u = latestUnread();
  const stats = camDayStats();
  const disk = spacePct();
  return `
  <div class="ws ${S.navOn ? "nav-on" : ""}">
    <header class="bar">
      <div class="brand" title="${esc(SLOGAN)}">
        <div class="mark">${I.mark}</div>
        <b>YunKan</b>
      </div>
      <button class="btn sm ghost" data-act="toggle-nav" title="折叠分类">${S.navOn ? "收起" : "分类"}</button>
      <nav class="cats">
        ${tabs.map(([id, svg, label]) => `
          <a href="#/${id}" class="${route === id ? "on" : ""}">${svg} ${esc(label)}
            ${id === "events" && S.unread ? `<span class="badge">${S.unread > 99 ? "99+" : S.unread}</span>` : ""}
          </a>`).join("")}
      </nav>
      <div class="bar-cams">
        ${S.cameras.map((c) => {
          const id = camId(c);
          const st = stats[id] || { unread: 0, total: 0 };
          return `<button class="bar-cam" data-act="cam-events" data-id="${esc(id)}" title="打开该相机事件">
            <i class="dot ${isOnline(c) ? "on" : "off"}"></i><b>${esc(camName(c))}</b> <em class="${st.unread ? "" : "zero"}">${st.unread}</em>/${st.total}
          </button>`;
        }).join("")}
      </div>
      <span class="clock" id="yk-clock">--:--:--</span>
      <span class="bar-metrics" title="存储 / 推理 / 解码">
        <span class="stat">${I.disk} <b>${disk == null ? "—" : disk + "%"}</b></span>
        <span class="stat">推理 <b>${esc(metricLabel(inferMs()))}</b></span>
        <span class="stat">解码 <b>${esc(metricLabel(decodeMs()))}</b></span>
      </span>
      ${S.alerts.length ? `<button class="alert-btn" data-act="open-alerts" title="${esc(findingText(S.alerts[0]) || "自检警告")}">${I.alert}</button>` : ""}
      ${u ? `
        <button class="unread-chip" data-act="open-unread" data-id="${esc(u.id)}" title="最新事件">
          ${eventSnap(u) ? `<img data-src="${esc(eventSnapUrl(u, { w: 160 }))}" alt="" />` : ""}
          <span class="grow"><b>${esc(u.camera_name || "")}</b><i>${esc(fmtTime(u.event_time))}</i></span>
          ${S.unread ? `<span class="count">${S.unread > 99 ? "99+" : S.unread}</span>` : ""}
        </button>` : ""}
      <div class="who">
        <button class="btn icon ghost" data-act="orig-settings" title="跳转原生系统设置" aria-label="跳转原生系统设置">${I.gear}</button>
        <button class="btn icon ghost" data-act="toggle-theme" title="${themeIsDay() ? "切换到黑夜模式" : "切换到白天模式"}">${themeIsDay() ? I.moon : I.sun}</button>
        ${api.demo ? `<span class="pill accent">预览</span>` : ""}
        <div class="ava">${esc(initial)}</div>
        <button class="btn sm ghost" data-act="logout">退出</button>
      </div>
    </header>
    <main class="stage ${wide ? "fill" : ""}">${inner}</main>
  </div>`;
}

function locked(id) {
  const m = moduleById(id);
  return chrome(`
    <p class="page-kicker">${SLOGAN}</p>
    <div class="empty">
      <h3>${esc(m?.name || "加载项")} 尚未启用</h3>
      <p>这是可选能力，启用后才会出现在顶栏并请求对应接口。</p>
      <div class="flex" style="justify-content:center;margin-top:12px">
        <button class="btn primary" data-act="enable-mod" data-id="${id}">加载此能力</button>
        <a class="btn" href="#/addons">打开加载项</a>
      </div>
    </div>`);
}

function camAspect(c) {
  const w = Number(c.width || c.res_w || c.video_width || c.stream_width);
  const h = Number(c.height || c.res_h || c.video_height || c.stream_height);
  if (w > 0 && h > 0) return w / h;
  return 16 / 9;
}

function layoutValid(layout) {
  if (!layout || typeof layout !== "object") return false;
  const vals = Object.values(layout);
  if (!vals.length) return false;
  return vals.some((L) => Number(L?.w) > 0.02 && Number(L?.h) > 0.02);
}

function packMosaic(cams, W, H, gap = 2) {
  const n = cams.length;
  if (!n) return [];
  const boxW = Math.max(W, 8);
  const boxH = Math.max(H, 8);
  let best = null;
  for (let cols = 1; cols <= n; cols++) {
    const rows = Math.ceil(n / cols);
    const groups = [];
    for (let r = 0; r < rows; r++) groups.push(cams.slice(r * cols, (r + 1) * cols));
    const lastN = groups[groups.length - 1].length;
    const lonely = n > 2 && lastN === 1 ? 0.85 : 0;
    const empty = cols * rows - n;
    const aspects = groups.map((row) => row.reduce((s, c) => s + camAspect(c), 0) / row.length);
    const varh = aspects.reduce((s, a) => s + Math.abs(a - aspects[0]), 0);
    const score = lonely + empty * 0.15 + varh * 0.2 + Math.abs(cols - Math.ceil(Math.sqrt(n))) * 0.05;
    if (!best || score < best.score) best = { score, groups };
  }
  const rows = best.groups.length;
  const rowH = (boxH - gap * Math.max(rows - 1, 0)) / rows;
  const tiles = [];
  best.groups.forEach((row, ri) => {
    const y = ri * (rowH + gap);
    const sumAr = row.reduce((s, c) => s + camAspect(c), 0);
    const inner = boxW - gap * Math.max(row.length - 1, 0);
    let x = 0;
    row.forEach((c, i) => {
      const w = i === row.length - 1 ? boxW - x : (camAspect(c) / sumAr) * inner;
      tiles.push({ id: camId(c), cam: c, x, y, w, h: rowH });
      x += w + gap;
    });
  });
  return tiles;
}

function applyZoom(tile, st) {
  const media = $(".media", tile);
  if (!media) return;
  media.style.transform = `translate(${st.x}px, ${st.y}px) scale(${st.s})`;
}

function viewZoom(el, st) {
  if (!el || !st) return;
  el.style.transformOrigin = "center center";
  el.style.transform = (st.s === 1 && !st.x && !st.y) ? "" : `translate(${st.x}px, ${st.y}px) scale(${st.s})`;
  el.classList.toggle("is-zoomed", st.s > 1.01);
}

function wheelViewZoom(el, key, e, max = 6) {
  const st = zoomMap.get(key) || { s: 1, x: 0, y: 0 };
  const r = el.getBoundingClientRect();
  const px = (e.clientX - r.left) / Math.max(1, r.width);
  const py = (e.clientY - r.top) / Math.max(1, r.height);
  const next = Math.min(max, Math.max(1, e.deltaY < 0 ? st.s * 1.12 : st.s / 1.12));
  if (next === 1) { st.s = 1; st.x = 0; st.y = 0; }
  else {
    st.x = (st.x - (px - 0.5) * r.width) * (next / st.s) + (px - 0.5) * r.width;
    st.y = (st.y - (py - 0.5) * r.height) * (next / st.s) + (py - 0.5) * r.height;
    st.s = next;
  }
  zoomMap.set(key, st);
  viewZoom(el, st);
  return st;
}

function panViewPointer(el, key, e) {
  const st = zoomMap.get(key) || { s: 1, x: 0, y: 0 };
  if (st.s <= 1.01) return false;
  e.preventDefault();
  const x0 = st.x, y0 = st.y, ox = e.clientX, oy = e.clientY;
  const prev = el.style.cursor;
  el.style.cursor = "grabbing";
  const move = (ev) => {
    st.x = x0 + (ev.clientX - ox);
    st.y = y0 + (ev.clientY - oy);
    viewZoom(el, st);
  };
  const up = () => {
    el.style.cursor = prev;
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", up);
  };
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", up);
  return true;
}

function catchUpLive(p) {
  if (!p || !p.live || !p.video) return false;
  const video = p.video;
  try {
    if (video.paused) video.play().catch(() => {});
    let target = null;
    if (p.hls && p.hls.liveSyncPosition != null && Number.isFinite(p.hls.liveSyncPosition)) {
      target = p.hls.liveSyncPosition;
    } else if (video.buffered && video.buffered.length) {
      target = video.buffered.end(video.buffered.length - 1) - 1.2;
    }
    if (target != null && Number.isFinite(target) && target - video.currentTime > 2.5) {
      video.currentTime = Math.max(0, target);
      return true;
    }
  } catch {}
  return false;
}

function persistMosaic() {
  if (S.layoutLock) return;
  const box = $("#mosaic");
  if (!box) return;
  const W = box.clientWidth, H = box.clientHeight;
  if (W < 16 || H < 16) return;
  const layout = {};
  let ok = false;
  $$(".mtile", box).forEach((el) => {
    const w = el.offsetWidth / W, h = el.offsetHeight / H;
    if (w > 0.02 && h > 0.02) ok = true;
    layout[el.dataset.id] = { x: el.offsetLeft / W, y: el.offsetTop / H, w, h };
  });
  if (!ok) return;
  S.mosaicLayout = layout;
  localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout));
}

function layoutMosaic() {
  const box = $("#mosaic");
  if (!box) return;
  const W = box.clientWidth;
  const H = box.clientHeight;
  if (W < 8 || H < 8) return;
  let tiles;
  if (layoutValid(S.mosaicLayout)) {
    tiles = S.cameras.map((c) => {
      const id = camId(c);
      const L = S.mosaicLayout[id];
      if (!L || !(L.w > 0) || !(L.h > 0)) return null;
      return { id, cam: c, x: L.x * W, y: L.y * H, w: L.w * W, h: L.h * H };
    }).filter(Boolean);
    if (tiles.length < S.cameras.length) tiles = packMosaic(S.cameras, W, H, 2);
  } else tiles = packMosaic(S.cameras, W, H, 2);
  $$(".mtile", box).forEach((el) => {
    const t = tiles.find((x) => x.id === el.dataset.id);
    if (!t) return;
    el.style.left = ((t.x / W) * 100) + "%";
    el.style.top = ((t.y / H) * 100) + "%";
    el.style.width = ((t.w / W) * 100) + "%";
    el.style.height = ((t.h / H) * 100) + "%";
    const st = zoomMap.get(el.dataset.id);
    if (st) applyZoom(el, st);
  });
  if (!layoutValid(S.mosaicLayout)) persistMosaic();
}

function bindMosaic(opts = {}) {
  const box = $("#mosaic");
  if (!box) return;
  if (mosaicObs) mosaicObs.disconnect();
  mosaicObs = new ResizeObserver(() => {
    if (!layoutValid(S.mosaicLayout)) layoutMosaic();
  });
  mosaicObs.observe(box);
  if (!layoutValid(S.mosaicLayout)) layoutMosaic();
  startSnapRefresh();
  if (opts.keepLive) {
    startLiveWatch();
    return;
  }
  prefetchGrants();
  startMosaicLive();
  startLiveWatch();
}

function startSnapRefresh() {
  if (S._snapTimer) clearInterval(S._snapTimer);
  const last = S._snapBlobs || (S._snapBlobs = {});
  const tick = () => {
    if (document.hidden || !document.body.classList.contains("yk-home")) return;
    $$(".mtile").forEach((tile) => {
      if (isTilePlaying(tile)) return;
      const img = $("img", tile);
      const id = tile.dataset.id;
      if (!img || !id) return;
      api.blob(`/api/cameras/${encodeURIComponent(id)}/snapshot`).then((r) => {
        if (!r?.blob || !img.isConnected) return;
        const prev = last[id];
        img.src = blobUrl(r.blob);
        last[id] = img.src;
        if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      }).catch(() => {});
    });
  };
  S._snapTimer = setInterval(tick, 4000);
}

function tileVideo(tile) {
  return $("video.live-video", tile) || $("video:not(.live-aac)", tile);
}
function tileAac(tile) {
  return $("video.live-aac", tile) || $("audio.live-aac", tile);
}
function isTilePlaying(tile) {
  const video = tileVideo(tile);
  return !!(video && !video.hidden && video.videoWidth > 0 && video.readyState >= 2);
}

function showTileSnap(tile) {
  const video = tileVideo(tile);
  const img = $("img", tile);
  if (video) {
    video.hidden = true;
    video.classList.remove("is-live");
    try { video.pause(); } catch {}
  }
  if (img) img.style.opacity = "1";
}

function applyTileSound(id, tile, wantSound) {
  const video = tileVideo(tile);
  const aac = tileAac(tile);
  const grant = S.grants && S.grants[id];
  const aacUrl = wantSound ? aacHlsFromGrant(grant) : "";
  const useSidecar = !!(wantSound && aacUrl);
  if (video) {
    video.volume = 1;
    video.muted = useSidecar ? true : !wantSound;
    if (wantSound && !useSidecar) playMedia(video, true);
    else if (!wantSound) video.muted = true;
  }
  if (useSidecar && aac) {
    const cur = players.get("aac-" + id);
    if (!cur || cur.url !== aacUrl) {
      aac.removeAttribute("hidden");
      attachHls(aac, aacUrl, "aac-" + id, false, {
        needVideo: false,
        onPlay: () => {},
        onFail: () => {
          stopPlayer("aac-" + id);
          if (video) playMedia(video, true);
        },
      });
    } else playMedia(aac, true);
  } else {
    stopPlayer("aac-" + id);
    if (aac) {
      aac.muted = true;
      try { aac.pause(); } catch {}
    }
  }
}

function tileWantsSound(id) {
  return !!(S.liveAudioId && String(S.liveAudioId) === String(id));
}

function setLiveAudio(id) {
  S.liveAudioId = id || null;
  S.livePrefs.audioId = S.liveAudioId;
  const tiles = $$(".mtile");
  tiles.forEach((tile) => {
    const tid = tile.dataset.id;
    const on = tileWantsSound(tid);
    setLivePref(tid, { muted: !on });
    tile.classList.toggle("has-sound", on);
    const muteBtn = $("[data-act=tile-mute]", tile);
    if (muteBtn) muteBtn.textContent = on ? "有声" : "已静音";
    applyTileSound(tid, tile, on);
  });
  if (!tiles.length) localStorage.setItem(LIVE_KEY, JSON.stringify(S.livePrefs));
}

async function startMosaicLive() {
  if (!feat("live", "hls")) return;
  const tiles = $$(".mtile");
  if (!tiles.length) return;
  await Promise.all(tiles.map((tile) => applyTileLive(tile.dataset.id, tile)));
}

function startLiveWatch() {
  if (S._liveWatch) clearInterval(S._liveWatch);
  S._liveWatch = setInterval(() => {
    if (document.hidden || !document.body.classList.contains("yk-home") || !$("#mosaic")) return;
    $$(".mtile").forEach((tile) => {
      const id = tile.dataset.id;
      const p = players.get("tile-" + id);
      if (!p) return;
      catchUpLive(p);
    });
  }, 8000);
}

let mosaicRecovering = false;
async function recoverMosaicLive(forceRestart = false) {
  if (!$("#mosaic") || mosaicRecovering) return;
  if (!document.body.classList.contains("yk-home")) return;
  mosaicRecovering = true;
  try {
    const hiddenFor = S._hiddenAt ? Date.now() - S._hiddenAt : 0;
    S._hiddenAt = 0;
    const restart = forceRestart || hiddenFor > 5000;
    for (const tile of $$(".mtile")) {
      const id = tile.dataset.id;
      if (!id) continue;
      const p = players.get("tile-" + id);
      if (!restart && p && isTilePlaying(tile)) {
        const want = livePref(id).source;
        if (p.source && p.source !== want && p.source !== "sub-ephemeral") {
          await applyTileLive(id, tile);
          continue;
        }
        catchUpLive(p);
        applyTileSound(id, tile, tileWantsSound(id));
        continue;
      }
      await applyTileLive(id, tile);
    }
  } finally {
    mosaicRecovering = false;
  }
}

async function focusTileAudio(id, tile) {
  if (!id || !tile) return;
  const already = tileWantsSound(id) && isTilePlaying(tile);
  setLiveAudio(id);
  if (!isTilePlaying(tile)) await applyTileLive(id, tile);
  applyTileSound(id, tile, true);
  if (already) return;
  const cam = S.cameras.find((c) => camId(c) === id);
  toast(`${camName(cam || { id })} 有声`, "ok");
}

async function applyTileLive(id, tile) {
  const video = tileVideo(tile);
  const img = $("img", tile);
  const pref = livePref(id);
  const srcBtn = $("[data-act=tile-src]", tile);
  const muteBtn = $("[data-act=tile-mute]", tile);
  if (srcBtn) srcBtn.textContent = pref.source === "main" ? "主码流" : "子码流";
  if (muteBtn) muteBtn.textContent = tileWantsSound(id) ? "有声" : "已静音";
  if (!feat("live", "hls") || !video) return false;
  try {
    const grant = await ensureGrant(id);
    const url = hlsFromGrant(grant, pref.source);
    const cur = players.get("tile-" + id);
    if (cur && cur.url === url && isTilePlaying(tile)) {
      applyTileSound(id, tile, tileWantsSound(id));
      return true;
    }
    if (!url) { showTileSnap(tile); toast("该路暂无直播流", "bad"); return false; }
    let failed = false;
    video.muted = true;
    video.volume = 1;
    attachHls(video, url, "tile-" + id, true, {
      source: pref.source,
      onPlay: () => {
        video.hidden = false;
        video.classList.add("is-live");
        if (img) img.style.opacity = "0";
        applyTileSound(id, tile, tileWantsSound(id));
      },
      onFail: () => {
        if (failed) return;
        failed = true;
        showTileSnap(tile);
        stopPlayer("aac-" + id);
        if (pref.source === "main") {
          if (srcBtn) srcBtn.textContent = "主码流";
          const subUrl = hlsFromGrant(S.grants && S.grants[id], "sub");
          if (subUrl && subUrl !== url) {
            attachHls(video, subUrl, "tile-" + id, true, {
              source: "sub-ephemeral",
              onPlay: () => {
                video.hidden = false;
                video.classList.add("is-live");
                if (img) img.style.opacity = "0";
                applyTileSound(id, tile, tileWantsSound(id));
              },
              onFail: () => showTileSnap(tile),
            });
          }
        }
      },
    });
    return true;
  } catch (ex) {
    showTileSnap(tile);
    toast(ex.message || "直播失败", "bad");
    return false;
  }
}

function tileLayoutStyle(id) {
  const L = layoutValid(S.mosaicLayout) ? S.mosaicLayout[id] : null;
  if (!L) return "";
  return `left:${(L.x * 100).toFixed(3)}%;top:${(L.y * 100).toFixed(3)}%;width:${(L.w * 100).toFixed(3)}%;height:${(L.h * 100).toFixed(3)}%`;
}

const TYPE_ZH = {
  person: "人员", vehicle: "车辆", car: "车辆", pet: "宠物", cat: "猫", dog: "狗",
  bird: "鸟", face: "人脸", motion: "移动", fall: "跌倒", gesture: "手势",
};

function eventKind(ev) {
  const raw = ev.type || ev.event_type || ev.label || ev.extra?.detections?.[0]?.label || ev.extra?.label || "";
  return TYPE_ZH[String(raw).toLowerCase()] || raw || "检测";
}
function eventScore(ev) {
  const s = ev.confidence ?? ev.score ?? ev.extra?.detections?.[0]?.score ?? ev.extra?.score ?? ev.extra?.confidence;
  const n = Number(s);
  if (!Number.isFinite(n) || n <= 0) return "";
  const pct = n <= 1 ? n * 100 : n;
  return `${Math.round(pct)}%`;
}
function eventAgo(ev) {
  const t = toMs(ev.event_time);
  if (!t) return "";
  const sec = Math.max(0, Math.round((Date.now() - t) / 1000));
  if (sec < 60) return `${sec}秒前`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}分钟前`;
  const hr = Math.round(min / 60);
  if (hr < 48) return `${hr}小时前`;
  return `${Math.round(hr / 24)}天前`;
}

const DIR_ZH = {
  in: "进入", out: "离开", enter: "进入", leave: "离开", exit: "离开",
  inbound: "进入", outbound: "离开", incoming: "进入", outgoing: "离开",
  home: "回家", away: "离家", arrive: "回家", depart: "离家",
  coming: "回家", going: "离家", coming_home: "回家", leaving_home: "离家",
  go_home: "回家", leave_home: "离家", arrive_home: "回家",
  forward: "正向", reverse: "反向",
  left_to_right: "从左到右", right_to_left: "从右到左",
  l2r: "从左到右", r2l: "从右到左",
  entry: "进入",
};
function isForwardDir(raw) {
  const s = String(raw == null ? "" : raw).toLowerCase();
  return s === "forward" || s === "in" || s === "enter" || s === "entry" || s === "1" || s === "true" || s === "home";
}
function isReverseDir(raw) {
  const s = String(raw == null ? "" : raw).toLowerCase();
  return s === "reverse" || s === "out" || s === "leave" || s === "exit" || s === "-1" || s === "false" || s === "away";
}
function tripwireForEvent(ev, x) {
  const list = S.tripwires || [];
  if (!list.length) return null;
  const id = x.tripwire_id ?? x.tripwire ?? ev.tripwire_id;
  const name = x.tripwire_name || x.line_name || "";
  const cam = String(ev.camera_id || "");
  return list.find((t) => (id != null && String(t.id) === String(id))
    || (name && t.name === name && (!cam || String(t.camera_id || "") === cam))
    || (name && t.name === name)) || null;
}
function eventDir(ev) {
  const x = parseExtra(ev);
  const labeled = [
    x.direction_label, ev.direction_label, x.home_away_label, x.crossing_label,
    x.label, x.dir_label, x.forward_label && isForwardDir(x.direction) ? x.forward_label : "",
    x.reverse_label && isReverseDir(x.direction) ? x.reverse_label : "",
  ].find((v) => v && String(v).trim());
  if (labeled && /[\u4e00-\u9fff]/.test(String(labeled))) return String(labeled).trim();
  if (labeled && DIR_ZH[String(labeled).toLowerCase()]) return DIR_ZH[String(labeled).toLowerCase()];
  const tw = tripwireForEvent(ev, x);
  if (tw) {
    if (isForwardDir(x.direction || ev.direction)) return tw.forward_label || labeled || "";
    if (isReverseDir(x.direction || ev.direction)) return tw.reverse_label || labeled || "";
    if (tw.forward_label || tw.reverse_label) {
      const d = String(x.direction || ev.direction || "").toLowerCase();
      if (d === String(tw.forward_label || "").toLowerCase()) return tw.forward_label;
      if (d === String(tw.reverse_label || "").toLowerCase()) return tw.reverse_label;
    }
  }
  const raw = String(
    x.direction || ev.direction || x.crossing || x.home_away || x.presence
    || x.trip_direction || x.side || ev.event_subtype || x.event_subtype || ""
  ).trim();
  if (raw) {
    if (/[\u4e00-\u9fff]/.test(raw)) return raw;
    const key = raw.toLowerCase();
    if (DIR_ZH[key]) return DIR_ZH[key];
    if (key.includes("home") && !key.includes("leave")) return "回家";
    if (key.includes("away") || key.includes("leave") || key.includes("depart")) return "离家";
  }
  const sum = String(ev.summary || ev.summary_zh || ev.title || "");
  const m = sum.match(/回家|离家|进门|出门|进入|离开/);
  if (m) return m[0];
  return (tw && (tw.forward_label || tw.reverse_label)) || x.tripwire_name || "";
}

function eventCard(ev, opts = {}) {
  const cam = ev.camera_name || ev.camera_id || "";
  const snap = eventSnap(ev);
  const score = eventScore(ev);
  const dir = eventDir(ev);
  const kind = eventKind(ev);
  const ago = eventAgo(ev);
  const when = fmtTime(ev.event_time);
  const act = opts.act || "open-ev";
  const extra = opts.extra || "";
  const attrs = opts.attrs || "";
  const l1 = dir ? `${cam} (${dir})` : cam;
  const l2 = [kind, score].filter(Boolean).join(" ");
  const l3 = [ago, when].filter((v) => v && v !== "—").join("  ");
  return `
    <div class="ev ${ev.unread ? "unread" : ""} ${extra}" data-act="${esc(act)}" data-id="${esc(ev.id)}" ${attrs}>
      ${snap ? `<img data-src="${esc(eventSnapUrl(ev, { annotate: true, w: 320 }))}" alt="" />` : `<div class="ev-ph"></div>`}
      <div class="ev-meta">
        <b class="ev-l1" title="${esc(l1)}"><span class="ev-name">${esc(l1)}</span>${ev.unread ? `<span class="pill accent ev-unread">未读</span>` : ""}</b>
        <i class="ev-l2">${esc(l2)}</i>
        <i class="ev-l3">${esc(l3)}</i>
      </div>
    </div>`;
}

function homeMosaicHtml(recent) {
  const list = [...(recent || [])].sort((a, b) => toMs(b.event_time) - toMs(a.event_time));
  return `
    <div class="protect ${S.railOn ? "" : "rail-off"} ${S.layoutLock ? "layout-lock" : ""}">
      <div class="mosaic" id="mosaic">${S.cameras.map((c) => {
        const id = camId(c);
        const pref = livePref(id);
        const sounding = tileWantsSound(id);
        return `<div class="mtile ${sounding ? "has-sound" : ""}" data-id="${esc(id)}" tabindex="0" style="${tileLayoutStyle(id)}">
          <div class="media">
            <img data-src="/api/cameras/${esc(id)}/snapshot" alt="" />
            <video class="live-video" playsinline muted autoplay hidden></video>
            <video class="live-aac" playsinline muted autoplay></video>
          </div>
          <div class="tile-tools">
            <button data-act="tile-src" data-id="${esc(id)}">${pref.source === "main" ? "主码流" : "子码流"}</button>
            <button data-act="tile-mute" data-id="${esc(id)}">${sounding ? "有声" : "已静音"}</button>
          </div>
          <div class="zoom-hint">${S.layoutLock ? "点击切声 · 滚轮放大" : "点击切声 · 拖动 · 滚轮放大"}</div>
          <div class="cap"><i class="dot ${isOnline(c) ? "on" : "off"}"></i>${esc(camName(c))}
            ${c.detection_enabled ? `<span class="pill accent">AI</span>` : ""}
            <span class="snd-flag pill ready">有声</span></div>
          <i class="rz" data-act="tile-rz"></i>
        </div>`;
      }).join("") || `<div class="empty" style="margin:24px">还没有摄像机</div>`}</div>
      <button class="rail-tab" data-act="toggle-rail" title="${S.railOn ? "折叠事件栏" : "展开事件栏"}">${I.panel} 事件</button>
      <aside class="rail">
        <div class="rail-h">事件 <span class="pill">${list.length}</span>
          <div class="grow"></div>
          ${unreadActionsHtml()}
          <button class="btn sm ghost" data-act="toggle-lock" title="${S.layoutLock ? "解锁布局" : "锁定布局，禁止拖动拉伸"}">${S.layoutLock ? I.lock : I.unlock} ${S.layoutLock ? "已锁定" : "锁定布局"}</button>
          <button class="btn sm ghost" data-act="reset-layout">重置布局</button>
          <button class="btn icon ghost" data-act="toggle-rail" title="折叠事件栏">${I.panel}</button>
        </div>
        <div class="rail-list">${list.map((ev) => eventCard(ev)).join("") || `<div class="empty">暂无事件</div>`}</div>
      </aside>
    </div>`;
}

function refreshHomeRail() {
  const list = [...(S.recent || [])].sort((a, b) => toMs(b.event_time) - toMs(a.event_time));
  const rail = $("#home-keep .rail-list");
  if (rail) rail.innerHTML = list.map((ev) => eventCard(ev)).join("") || `<div class="empty">暂无事件</div>`;
  const pill = $("#home-keep .rail-h .pill");
  if (pill) pill.textContent = String(list.length);
}

function mosaicCamKey() {
  return (S.cameras || []).map((c) => camId(c)).join("|");
}

function eventStageHtml(ev) {
  if (!ev) return `<div class="empty" style="margin:24px">选择右侧事件</div>`;
  const src = S.showBoxes ? eventSnapUrl(ev, { annotate: true }) : eventSnapUrl(ev);
  return `
    <div class="ev-frame" id="ev-frame" data-z="ev">
      ${src ? `<img id="ev-img" data-src="${esc(src)}" alt="" />` : ""}
      <canvas class="track-cv" id="ev-cv"></canvas>
    </div>
    <div class="ev-tools">
      <span class="pill accent">${esc(eventTitle(ev))}</span>
      <span class="tiny" style="color:#fff">${esc([ev.camera_name || "", eventDir(ev) ? `(${eventDir(ev)})` : "", eventKind(ev), eventScore(ev), eventAgo(ev), fmtTime(ev.event_time)].filter(Boolean).join("  "))}</span>
      <button class="chip ${S.showBoxes ? "on" : ""}" data-act="toggle-boxes">检测框</button>
      <button class="chip ${S.showTrack ? "on" : ""}" data-act="toggle-track">运动轨迹</button>
      ${isOn(S.addons, "replay") ? `<button class="btn sm primary" data-act="jump-replay" data-cam="${esc(ev.camera_id || "")}" data-ts="${esc(ev.event_time || "")}" data-eid="${esc(ev.id)}">跳转回放</button>` : ""}
      <span class="tiny" style="color:#fff">滚轮缩放 · 拖动平移</span>
    </div>`;
}

function eventsPage() {
  const types = [["", "全部"], ["person", "人物"], ["vehicle", "车辆"], ["pet", "宠物"], ["face", "人脸"], ["motion", "移动"]];
  const ev = S.event || S.events[0];
  return chrome(`
    <div class="ev-stage">
      <div class="ev-view" id="ev-view">${eventStageHtml(ev)}</div>
      <aside class="rail">
        <div class="rail-h">
          <input class="search" data-act="ev-q" placeholder="搜索" value="${esc(S.q)}" style="width:140px;flex:1" />
          ${unreadActionsHtml()}
        </div>
        <div class="toolbar cam-filter" style="padding:6px 8px;margin:0">
          <button class="chip ${!S.evCam ? "on" : ""}" data-act="cam-events" data-id="">全部</button>
          ${S.cameras.map((c) => {
            const id = camId(c);
            return `<button class="chip ${S.evCam === id ? "on" : ""}" data-act="cam-events" data-id="${esc(id)}">${esc(camName(c))}</button>`;
          }).join("")}
        </div>
        <div class="toolbar" style="padding:6px 8px;margin:0">${types.map(([t, l]) =>
          `<button class="chip ${S.evType === t ? "on" : ""}" data-act="ev-type" data-v="${t}">${l}</button>`).join("")}</div>
        <div class="rail-list">${S.events.map((e) => {
          const sel = S.event && String(S.event.id) === String(e.id) ? "sel" : "";
          return eventCard(e, { act: "select-ev", extra: sel });
        }).join("") || `<div class="empty">暂无事件</div>`}</div>
      </aside>
    </div>`, true);
}

function isBirdLabel(ev, tr) {
  const t = String(ev?.type || ev?.event_type || ev?.label || tr?.label || ev?.extra?.detections?.[0]?.label || "").toLowerCase();
  return t === "bird";
}

function trackPoints(tr, ev) {
  const raw = tr?.points || tr?.path || tr?.polyline || tr?.samples || tr?.track || [];
  const fw = Number(tr?.frame_w || tr?.width || ev?.extra?.frame_w || 0);
  const fh = Number(tr?.frame_h || tr?.height || ev?.extra?.frame_h || 0);
  const bird = isBirdLabel(ev, tr);
  return raw.map((p) => {
    let x, y;
    if (Array.isArray(p) && p.length >= 5 && Number.isFinite(+p[1]) && Number.isFinite(+p[4])) {
      x = (+p[1] + +p[3]) / 2;
      y = bird ? (+p[2] + +p[4]) / 2 : +p[4];
    } else if (Array.isArray(p) && p.length >= 3) { x = +p[1]; y = +p[2]; }
    else if (Array.isArray(p)) { x = +p[0]; y = +p[1]; }
    else if (p && p.x1 != null && p.x2 != null) {
      x = (+p.x1 + +p.x2) / 2;
      y = bird ? (+p.y1 + +p.y2) / 2 : +p.y2;
    } else {
      x = +(p.x ?? p.cx ?? p.nx ?? 0);
      y = +(p.y ?? p.cy ?? p.ny ?? p.y2 ?? 0);
    }
    if (fw > 1 && fh > 1 && (x > 1.2 || y > 1.2)) {
      x /= fw;
      y /= fh;
    }
    return { x: Math.min(1, Math.max(0, x)), y: Math.min(1, Math.max(0, y)) };
  }).filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
}

function parseBbox(b) {
  if (!b) return null;
  let x, y, w, h;
  if (Array.isArray(b) && b.length >= 4) {
    x = +b[0]; y = +b[1];
    if (b[2] > 1 && b[2] > b[0]) { w = +b[2] - x; h = +b[3] - y; }
    else { w = +b[2]; h = +b[3]; }
  } else if (typeof b === "object") {
    x = +(b.x ?? b.left ?? 0); y = +(b.y ?? b.top ?? 0);
    w = +(b.w ?? b.width ?? 0); h = +(b.h ?? b.height ?? 0);
  } else return null;
  return { x, y, w, h };
}

function containRect(img, wrap) {
  if (!img || !wrap) return null;
  const iw = img.naturalWidth || 0;
  const ih = img.naturalHeight || 0;
  if (!iw || !ih) return null;
  const W = wrap.clientWidth, H = wrap.clientHeight;
  if (!W || !H) return null;
  const elW = img.offsetWidth || W;
  const elH = img.offsetHeight || H;
  const elX = img.offsetLeft || 0;
  const elY = img.offsetTop || 0;
  const scale = Math.min(elW / iw, elH / ih);
  const dw = iw * scale, dh = ih * scale;
  return { ox: elX + (elW - dw) / 2, oy: elY + (elH - dh) / 2, dw, dh, iw, ih };
}

function paintOverlay(wrap, img, cv, ev, track) {
  if (!wrap || !cv) return;
  const ctx = cv.getContext("2d");
  cv.width = wrap.clientWidth;
  cv.height = wrap.clientHeight;
  ctx.clearRect(0, 0, cv.width, cv.height);
  if (!img) return;
  const box = containRect(img, wrap);
  if (!box) return;
  ctx.save();
  ctx.beginPath();
  ctx.rect(box.ox, box.oy, box.dw, box.dh);
  ctx.clip();
  const fw = Number(track?.frame_w || ev?.extra?.frame_w || 0);
  const fh = Number(track?.frame_h || ev?.extra?.frame_h || 0);
  const nx = (v) => (v > 1.2 ? v / (fw > 1 ? fw : box.iw || 1) : v);
  const ny = (v) => (v > 1.2 ? v / (fh > 1 ? fh : box.ih || 1) : v);
  if (S.showTrack && track) {
    const pts = trackPoints(track, ev).map((p) => ({
      x: box.ox + p.x * box.dw,
      y: box.oy + p.y * box.dh,
    }));
    if (pts.length > 1) {
      ctx.strokeStyle = "#ffb020";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
      ctx.stroke();
      ctx.fillStyle = "#ffb020";
      pts.forEach((p) => { ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill(); });
    }
  }
  const src = img.dataset?.src || img.src || "";
  if (S.showBoxes && !src.includes("annotate=1")) {
    const dets = ev?.extra?.detections || ev?.detections || track?.detections || [];
    for (const d of dets) {
      const b = parseBbox(d.bbox || d.box || d);
      if (!b || !b.w) continue;
      const x = box.ox + nx(b.x) * box.dw;
      const y = box.oy + ny(b.y) * box.dh;
      const w = nx(b.w) * box.dw;
      const h = ny(b.h) * box.dh;
      ctx.strokeStyle = "#3ee0a0";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);
      const label = d.label || d.class_name || d.type || "";
      if (label) {
        ctx.font = "12px sans-serif";
        const tw = ctx.measureText(label).width + 8;
        ctx.fillStyle = "rgba(0,0,0,.65)";
        ctx.fillRect(x, Math.max(0, y - 16), tw, 16);
        ctx.fillStyle = "#3ee0a0";
        ctx.fillText(label, x + 4, Math.max(12, y - 4));
      }
    }
  }
  ctx.restore();
}

async function loadEventTrack(ev) {
  S.eventTrack = null;
  if (!ev?.id || !feat("events", "tracks")) return;
  try {
    const d = await api.get(`/api/events/${ev.id}/track`);
    S.eventTrack = d?.points ? d : (d?.track || d);
  } catch { S.eventTrack = null; }
}

function bindEventOverlay(rootEl = document) {
  const wrap = $("#ev-frame", rootEl) || $(".zview", rootEl);
  if (!wrap) return;
  const img = $("img", wrap);
  const cv = $("canvas", wrap);
  const ev = S.eventPop || S.event;
  const draw = () => paintOverlay(wrap, img, cv, ev, S.eventTrack);
  if (img) {
    if (img.complete && img.naturalWidth) draw();
    img.addEventListener("load", draw);
  }
  if (wrap._ro) wrap._ro.disconnect();
  wrap._ro = new ResizeObserver(() => draw());
  wrap._ro.observe(wrap);
  requestAnimationFrame(draw);
}

function parseSegs(data) {
  let list = asList(data, ["segments", "recordings", "items"]);
  if (!list.length && data?.channels) {
    list = [];
    for (const ch of asList(data.channels, ["channels"])) {
      list.push(...asList(ch, ["recordings", "segments", "items"]));
    }
  }
  return list.map((s) => {
    let start = s.start_time || s.start || s.start_ms || s.begin;
    let end = s.end_time || s.end || s.end_ms;
    const dur = s.duration_ms != null ? Number(s.duration_ms) : Number(s.duration || s.durSec || 0) * 1000;
    const startMs = toMs(start);
    let endMs = toMs(end);
    if (!endMs && startMs) endMs = startMs + dur;
    return { id: s.id || s.recording_id, start: startMs, end: endMs, raw: s };
  }).filter((s) => s.start && s.end > s.start);
}

function eachDay(a, b) {
  const out = [];
  const s = new Date(`${fmtDay(a)}T00:00:00`);
  const e = new Date(`${fmtDay(b)}T00:00:00`);
  for (let t = s.getTime(); t <= e.getTime(); t += 86400000) out.push(fmtDay(new Date(t)));
  return out;
}

function ensureTlWindow() {
  if (S.tlStart && S.tlEnd && S.tlEnd > S.tlStart) return;
  const end = Date.now();
  S.tlEnd = end;
  S.tlStart = end - 24 * 3600 * 1000;
}

function setTlSpan(ms, center) {
  const c = center || (S.tlStart + S.tlEnd) / 2;
  const span = Math.max(60 * 1000, Math.min(7 * 86400000, ms));
  S.tlStart = c - span / 2;
  S.tlEnd = S.tlStart + span;
}

async function loadReplayData() {
  ensureTlWindow();
  if (!S.replayCam && S.cameras[0]) S.replayCam = camId(S.cameras[0]);
  const startDate = fmtDay(S.tlStart);
  const endDate = fmtDay(S.tlEnd);
  let data = null;
  try {
    data = await api.get(`/api/cameras/${encodeURIComponent(S.replayCam)}/timeline`, {
      start_date: startDate, end_date: endDate,
    });
  } catch {
    const segs = [];
    for (const d of eachDay(S.tlStart, S.tlEnd)) {
      try { segs.push(...asList(await api.get("/api/recordings/segments", { camera: S.replayCam, date: d }), ["segments"])); }
      catch {}
    }
    data = { segments: segs };
  }
  S.replaySegs = parseSegs(data);
  let evs = [];
  try { evs = eventList(await api.get("/api/events", { limit: 120 })); } catch {}
  if (!evs.length) evs = S.recent.slice();
  await loadTripwires();
  if (evs.some(extraLooksEmpty)) await hydrateEventExtras(evs);
  S.replayAllEvents = evs;
  S.replayEvents = evs.filter((e) => {
    const t = toMs(e.event_time);
    const camOk = !S.replayCam || String(e.camera_id) === String(S.replayCam);
    return camOk && t >= S.tlStart - 86400000 && t <= S.tlEnd + 86400000;
  });
}

function tlPct(ms) {
  const span = Math.max(1, S.tlEnd - S.tlStart);
  return ((ms - S.tlStart) / span) * 100;
}

function timelineInner() {
  const span = Math.max(1, S.tlEnd - S.tlStart);
  const hours = span > 3 * 86400000 ? 12 : span > 86400000 ? 6 : span > 6 * 3600000 ? 1 : span > 3600000 ? 0.25 : 1 / 12;
  const step = hours * 3600000;
  const ticks = [];
  const first = Math.ceil(S.tlStart / step) * step;
  for (let t = first; t <= S.tlEnd; t += step) ticks.push(t);
  const days = eachDay(S.tlStart, S.tlEnd);
  const now = Date.now();
  return `
    ${days.map((d) => {
      const t = new Date(`${d}T00:00:00`).getTime();
      const p = tlPct(t);
      if (p < 0 || p > 100) return "";
      return `<div class="tl-day" style="left:${p}%">${d.slice(5)}</div>`;
    }).join("")}
    ${ticks.map((t) => {
      const p = tlPct(t);
      if (p < 0 || p > 100) return "";
      return `<div class="tl-tick" style="left:${p}%"><span>${fmtClockMs(t)}</span></div>`;
    }).join("")}
    ${(S.replaySegs || []).map((s) => {
      const left = tlPct(s.start);
      const right = tlPct(s.end);
      if (right < 0 || left > 100) return "";
      const l = Math.max(0, left);
      const w = Math.min(100, right) - l;
      return `<div class="tl-seg" style="left:${l}%;width:${Math.max(0.15, w)}%"></div>`;
    }).join("")}
    ${(S.replayEvents || []).map((e) => {
      const p = tlPct(toMs(e.event_time));
      if (p < 0 || p > 100) return "";
      return `<button class="tl-ev" data-act="tl-jump" data-ms="${toMs(e.event_time)}" title="${esc(eventTitle(e))}" style="left:${p}%"></button>`;
    }).join("")}
    ${now >= S.tlStart && now <= S.tlEnd ? `<div class="tl-now" style="left:${tlPct(now)}%"></div>` : ""}
    <div class="tl-head" id="tl-head" style="left:${tlPct(S.replayAt || now)}%"></div>`;
}

function replayRailEvents() {
  let list = (S.replayAllEvents || S.replayEvents || []).slice()
    .sort((a, b) => toMs(b.event_time) - toMs(a.event_time));
  if (!S.replayEvAll && S.replayCam) {
    list = list.filter((e) => String(e.camera_id) === String(S.replayCam));
  }
  return list;
}

function replayRailHtml() {
  const railEvs = replayRailEvents();
  return `
      <div class="rail-h">事件 <span class="pill">${railEvs.length}</span></div>
      <div class="toolbar cam-filter" style="padding:6px 8px;margin:0">
        <button class="chip ${S.replayEvAll ? "on" : ""}" data-act="rp-ev-cam" data-id="">全部</button>
        ${S.cameras.map((c) => {
          const id = camId(c);
          return `<button class="chip ${!S.replayEvAll && S.replayCam === id ? "on" : ""}" data-act="rp-ev-cam" data-id="${esc(id)}">${esc(camName(c))}</button>`;
        }).join("")}
      </div>
      <div class="rail-list">${railEvs.slice(0, 80).map((e) => eventCard(e, {
        act: "tl-jump",
        extra: String(e.id) === String(S.replayEventId) ? "sel" : "",
        attrs: `data-ms="${toMs(e.event_time)}" data-cam="${esc(e.camera_id || "")}" data-eid="${esc(e.id)}"`,
      })).join("") || `<div class="empty">窗口内无事件</div>`}</div>`;
}

function replayPage() {
  ensureTlWindow();
  const t = S.replayAt || Date.now();
  const speeds = [0.5, 1, 2, 4, 8];
  const spans = [[3600000, "1小时"], [6 * 3600000, "6小时"], [86400000, "24小时"], [3 * 86400000, "3天"]];
  return chrome(`
    <div class="replay-shell">
    <div class="toolbar" style="padding:8px 12px;margin:0;background:var(--bg2);border-bottom:1px solid var(--line)">
      <button class="btn sm ${S.replayLive ? "primary" : ""}" data-act="go-live">${S.replayLive ? "实时中" : "实时"}</button>
      <div class="cam-pills">${S.cameras.map((c) => {
        const id = camId(c);
        return `<button class="rp-cam ${S.replayCam === id ? "on" : ""}" data-act="rp-cam" data-id="${esc(id)}">${esc(camName(c))}</button>`;
      }).join("")}</div>
      <input type="date" data-act="rp-date" value="${esc(fmtDay(t))}" style="background:var(--bg);border:1px solid var(--line);border-radius:6px;padding:5px 8px" />
      <span class="mono" id="rp-clock">${fmtStamp(t)}</span>
      <button class="btn sm" data-act="rp-toggle">${S.replayPlaying ? "暂停" : "播放"}</button>
      <div class="speeds">${speeds.map((sp) =>
        `<button class="chip ${S.replaySpeed === sp ? "on" : ""}" data-act="rp-speed" data-v="${sp}">${sp}x</button>`).join("")}</div>
      <div class="grow"></div>
      ${spans.map(([ms, l]) => `<button class="chip" data-act="tl-span" data-ms="${ms}">${l}</button>`).join("")}
      ${feat("replay", "export") ? `<button class="btn sm" data-act="export-rec">导出</button>` : ""}
    </div>
    <div class="player-wrap">
      ${S.replayLive ? `<span class="live-badge" id="live-badge">LIVE</span>` : ""}
      <div class="player-stage" id="rp-stage">
        <img class="poster" id="rp-poster" data-src="/api/cameras/${esc(S.replayCam)}/snapshot" alt="" />
        <video id="rp-video" playsinline hidden></video>
      </div>
    </div>
    <aside class="jump-rail">${replayRailHtml()}</aside>
    <div class="tl-box">
      <div class="tl-legend">
        <span><i class="lg-seg"></i>录像分段</span>
        <span><i class="lg-ev"></i>检测事件</span>
        <span><i class="lg-head"></i>播放位置</span>
        <span><i class="lg-now"></i>当前时间</span>
        <span class="muted">滚轮缩放 · 拖动平移 · 点击跳转</span>
        <span class="mono" id="tl-hover"></span>
      </div>
      <div class="tl" data-act="tl-seek" id="tl">${timelineInner()}</div>
      <div class="tl-times"><span>${fmtStamp(S.tlStart)}</span><span>${fmtStamp((S.tlStart + S.tlEnd) / 2)}</span><span>${fmtStamp(S.tlEnd)}</span></div>
    </div>
    </div>`, true);
}

function refreshTimelineDom() {
  const tl = $("#tl");
  if (!tl) return;
  tl.innerHTML = timelineInner();
  const clock = $("#rp-clock");
  if (clock) clock.textContent = fmtStamp(S.replayAt || Date.now());
}

function idsPage(people, pets, visits) {
  const tabs = [
    feat("identities", "people") && ["people", "人物"],
    feat("identities", "pets") && ["pets", "宠物"],
    feat("identities", "visits") && ["visits", "访客"],
  ].filter(Boolean);
  if (tabs.length && !tabs.some((t) => t[0] === S.identityTab)) S.identityTab = tabs[0][0];
  let body = "";
  if (S.identityTab === "people") {
    body = `<div class="people">${people.map((p) => `
      <button class="person" data-act="open-person" data-id="${p.id}">
        ${p.cover ? `<img class="ava-lg" data-src="${esc(p.cover)}" />` : `<div class="ava-lg ph">${esc((p.name || "?").slice(0, 1))}</div>`}
        <b>${esc(p.name || "未命名")}</b>
        <i class="tiny muted">${esc(fmtTime(p.last_seen))} · ${p.sample_count ?? 0} 样本</i>
      </button>`).join("") || `<div class="empty">还没有人物</div>`}</div>`;
  } else if (S.identityTab === "pets") {
    body = `<div class="people">${pets.map((p) => `
      <button class="person" data-act="open-pet" data-id="${p.id}">
        ${p.cover ? `<img class="ava-lg" data-src="${esc(p.cover)}" />` : `<div class="ava-lg ph">${esc((p.name || "?").slice(0, 1))}</div>`}
        <b>${esc(p.name || "未命名")}</b>
        <i class="tiny muted">${esc(p.species || "")}</i>
      </button>`).join("") || `<div class="empty">还没有宠物</div>`}</div>`;
  } else {
    body = `<div class="sheet" style="padding:0"><table class="table">
      <thead><tr><th>时间</th><th>对象</th><th>相机</th></tr></thead>
      <tbody>${visits.map((v) => `<tr>
        <td>${esc(fmtTime(v.start_time))}</td><td>${esc(v.person_name || "访客")}</td>
        <td>${esc(v.camera_name || "")}</td></tr>`).join("")}</tbody></table></div>`;
  }
  return chrome(`
    <p class="page-kicker">对象</p>
    <div class="toolbar">
      <h1 class="page-title" style="margin:0;font-size:28px">认得的人与动物</h1>
      <div class="grow"></div>
      ${tabs.map(([k, l]) => `<button class="chip ${S.identityTab === k ? "on" : ""}" data-act="id-tab" data-v="${k}">${l}</button>`).join("")}
      <button class="btn sm primary" data-act="enroll">录入</button>
    </div>${body}`);
}

function trainingPage(pack) {
  const tabs = [
    feat("training", "label") && ["jobs", "训练"],
    feat("training", "tensorrt") && ["trt", "OpenVINO 引擎"],
    feat("training", "vlm") && ["vlm", "VLM"],
  ].filter(Boolean);
  if (tabs.length && !tabs.some((t) => t[0] === S.trainTab)) S.trainTab = tabs[0][0];
  let body = "";
  if (S.trainTab === "jobs") {
    const jobs = asList(pack.jobs);
    const stats = pack.stats || {};
    body = `<div class="grid-3" style="margin-bottom:14px">
      <div class="metric"><b>${stats.labeled ?? 128}</b><span>已标注</span></div>
      <div class="metric"><b>${stats.pending ?? 17}</b><span>待标注</span></div>
      <div class="metric"><b>${jobs.length}</b><span>任务</span></div>
    </div>${jobs.map((j) => `<div class="sheet" style="margin-bottom:10px">
      <div class="flex"><b>${esc(j.name)}</b><span class="pill">${esc(j.status)}</span></div>
      <div class="progress" style="margin-top:8px"><i style="width:${Math.round((j.progress || 0) * 100)}%"></i></div>
    </div>`).join("")}`;
  } else if (S.trainTab === "trt") {
    body = asList(pack.models, ["models"]).map((m) => `
      <div class="sheet flex" style="margin-bottom:8px"><div class="grow"><b>${esc(m.name)}</b>
        <div class="tiny muted">${esc(m.backend || "OpenVINO")} · ${esc(m.engine)}</div></div>
        <button class="btn sm" data-act="convert" data-name="${esc(m.name)}">转换</button></div>`).join("");
  } else {
    body = (pack.vlm?.models || []).map((m) => `
      <div class="sheet flex" style="margin-bottom:8px"><div class="grow"><b>${esc(m.name)}</b>
        <div class="tiny muted">${m.installed ? "已安装" : "未安装"}</div></div></div>`).join("");
  }
  return chrome(`
    <p class="page-kicker">模型</p>
    <div class="toolbar">
      <h1 class="page-title" style="margin:0;font-size:28px">让识别更准</h1>
      <div class="grow"></div>
      ${tabs.map(([k, l]) => `<button class="chip ${S.trainTab === k ? "on" : ""}" data-act="train-tab" data-v="${k}">${l}</button>`).join("")}
    </div>${body}`);
}

function integPage(pack) {
  const tabs = [
    feat("integrations", "gb28181") && ["gb28181", "GB28181"],
    feat("integrations", "homekit") && ["homekit", "HomeKit"],
  ].filter(Boolean);
  if (tabs.length && !tabs.some((t) => t[0] === S.integTab)) S.integTab = tabs[0][0];
  let body = "";
  if (S.integTab === "gb28181") {
    const cfg = pack.gbCfg || {};
    body = `<div class="grid-2" style="margin-bottom:12px">
      <div class="sheet"><div class="tiny muted">SIP ID</div><div class="mono">${esc(cfg.sip_id || "—")}</div></div>
      <div class="sheet"><button class="btn sm" data-act="gb-refresh">刷新目录</button></div>
    </div>${asList(pack.gb, ["devices"]).map((d) => `
      <div class="sheet flex" style="margin-bottom:8px"><i class="dot ${d.online ? "on" : "off"}"></i>
        <div class="grow"><b>${esc(d.name)}</b><div class="tiny muted">${esc(d.id)}</div></div>
        <button class="btn sm">导入</button></div>`).join("")}`;
  } else {
    body = asList(pack.hk, ["cameras"]).map((c) => `
      <div class="sheet flex" style="margin-bottom:8px"><div class="grow"><b>${esc(c.name)}</b></div>
        <button class="switch ${c.enabled ? "on" : ""}" data-act="hk-toggle" data-id="${c.id}"><i></i></button></div>`).join("");
  }
  return chrome(`
    <p class="page-kicker">接入</p>
    <div class="toolbar">
      <h1 class="page-title" style="margin:0;font-size:28px">接到其他世界</h1>
      <div class="grow"></div>
      ${tabs.map(([k, l]) => `<button class="chip ${S.integTab === k ? "on" : ""}" data-act="integ-tab" data-v="${k}">${l}</button>`).join("")}
    </div>${body}`);
}

function systemPage(pack) {
  const tabs = [
    ["overview", "总览"],
    feat("system", "cameras") && ["cameras", "相机"],
    feat("system", "users") && ["users", "用户"],
    feat("system", "storage") && ["storage", "存储"],
    feat("system", "cloud115") && ["cloud115", "115"],
    feat("system", "logs") && ["logs", "日志"],
    feat("system", "acme") && ["acme", "证书"],
    feat("system", "upgrade") && ["upgrade", "升级"],
    feat("system", "license") && ["license", "许可"],
  ].filter(Boolean);
  if (tabs.length && !tabs.some((t) => t[0] === S.sysTab)) S.sysTab = tabs[0][0];
  let body = "";
  if (S.sysTab === "overview") {
    const st = pack.status || {};
    const metrics = pack.metrics || {};
    body = `${findingHtml(S.alerts)}<div class="grid-2">
      <div class="sheet"><h3 style="margin-top:0">运行时</h3>
        <p>推理 ${esc(st.inference || "OpenVINO")} · 解码 ${esc(st.decode || "VAAPI")}<br>
        CPU ${esc(metrics.cpu_pct ?? 18)}% · 内存 ${esc(metrics.rss_mb ?? 1240)} MB</p>
        <p class="tiny muted">${SLOGAN}</p></div>
      <div class="sheet"><h3 style="margin-top:0">服务</h3>
        ${(pack.services?.services || [{ name: "api" }, { name: "detection" }]).map((s) =>
          `<div class="flex" style="margin:6px 0"><i class="dot on"></i>${esc(s.name)}<div class="grow"></div>
            <button class="btn sm" data-act="restart" data-name="${esc(s.name)}">重启</button></div>`).join("")}</div>
    </div>`;
  } else if (S.sysTab === "cameras") {
    body = `<div class="toolbar"><button class="btn sm primary" data-act="add-cam">添加</button>
      <button class="btn sm" data-act="det-pause">全部暂停检测</button>
      <button class="btn sm" data-act="det-resume">全部恢复</button></div>
      <div class="sheet" style="padding:0"><table class="table"><thead><tr><th>名称</th><th>厂商</th><th>分辨率</th><th>检测</th><th></th></tr></thead>
      <tbody>${S.cameras.map((c) => `<tr><td>${esc(camName(c))}</td><td>${esc(c.vendor || "")}</td>
        <td class="mono">${c.width || "?"}×${c.height || "?"}</td>
        <td><button class="switch ${c.detection_enabled ? "on" : ""}" data-act="toggle-det" data-id="${esc(camId(c))}"><i></i></button></td>
        <td><button class="btn sm" data-act="edit-cam" data-id="${esc(camId(c))}">编辑</button>
            <button class="btn sm danger" data-act="del-cam" data-id="${esc(camId(c))}">删除</button></td></tr>`).join("")}</tbody></table></div>`;
  } else if (S.sysTab === "users") {
    body = `<div class="toolbar"><button class="btn sm primary" data-act="add-user">新建用户</button></div>
      <div class="sheet" style="padding:0"><table class="table"><thead><tr><th>用户</th><th>角色</th></tr></thead>
      <tbody>${asList(pack.users).map((u) => `<tr><td>${esc(u.display_name || u.username)}</td><td>${esc(u.role)}</td></tr>`).join("")}</tbody></table></div>`;
  } else if (S.sysTab === "storage") {
    const sp = pack.space || {};
    body = `<div class="grid-2"><div class="metric"><b>${fmtBytes(sp.used_bytes || sp.used)}</b><span>已用</span></div>
      <div class="metric"><b>${fmtBytes(sp.free_bytes || sp.free)}</b><span>剩余</span></div></div>`;
  } else if (S.sysTab === "logs") {
    const lines = S.logs || [];
    body = `${findingHtml(S.alerts)}
      <div class="log-box">${esc((lines.length ? lines : ["暂无日志"]).join("\n"))}</div>
      <div class="flex" style="margin-top:10px">
        <button class="btn sm" data-act="orig-settings" title="跳转原生系统设置">${I.gear} 系统设置</button>
      </div>`;
  } else if (S.sysTab === "license") {
    const L = S.license || pack.license || {};
    body = `<div class="sheet"><p>状态 ${esc(L.status || "—")} · ${esc(L.tier || "")}<br>到期 ${esc(L.expires_at || "永久")}</p>
      <button class="btn sm" data-act="lic-refresh">刷新</button></div>`;
  } else {
    body = `<div class="sheet"><p class="muted">此分区已作为加载项接入，对接原 API。完整配置请用原生系统设置。</p>
      <button class="btn sm" data-act="orig-settings" title="跳转原生系统设置">${I.gear} 系统设置</button></div>`;
  }
  return chrome(`
    <p class="page-kicker">系统</p>
    <div class="toolbar">
      <h1 class="page-title" style="margin:0;font-size:28px">系统</h1>
      <div class="grow"></div>
      ${tabs.map(([k, l]) => `<button class="chip ${S.sysTab === k ? "on" : ""}" data-act="sys-tab" data-v="${k}">${l}</button>`).join("")}
      <button class="btn sm" data-act="orig-settings" title="跳转原生系统设置">${I.gear} 系统设置</button>
    </div>${body}`);
}

function addonsPage() {
  return chrome(`
    <p class="page-kicker">加载项</p>
    <h1 class="page-title">用多少，开多少</h1>
    <p class="page-lead">${SLOGAN}。对照原 SkyView 能力：<b>已复刻</b>走同一套 API 且本界面可用；<b>部分复刻</b>有列表/开关，细节仍以原生系统设置为准；<b>仅接口</b>后端有、这里还没做成完整交互。</p>
    <div class="cover-legend">
      <span class="pill ready">已复刻</span><span class="pill partial">部分复刻</span><span class="pill api">仅接口</span>
    </div>
    <div class="toolbar">${PRESETS.map((p) =>
      `<button class="chip" data-act="preset" data-id="${p.id}">${esc(p.name)}</button>`).join("")}
      <span class="tiny muted">已加载 ${countEnabled(S.addons)} / ${CATALOG.length}</span>
    </div>
    <div class="mod-grid">${CATALOG.map((m) => {
      const st = S.addons[m.id];
      const on = !!st?.on;
      const open = S.expandMod === m.id;
      return `<article class="mod ${on ? "on" : ""}">
        <div class="flex">
          <div class="grow"><h3>${esc(m.name)}</h3><p class="tiny muted">${esc(m.blurb)}</p></div>
          <button class="switch ${on ? "on" : ""}" data-act="toggle-mod" data-id="${m.id}"><i></i></button>
        </div>
        <div class="flex"><span class="pill">${GROUPS[m.group].name}</span><span class="pill">${m.apis} APIs</span>
          <button class="btn sm ghost" data-act="expand-mod" data-id="${m.id}">${open ? "收起" : "功能"}</button></div>
        ${open ? m.features.map((f) => `<div class="feat"><span>${esc(f.name)}</span>
          <span class="pill ${f.cover || "api"}">${COVER_LABEL[f.cover] || "仅接口"}</span>
          <button class="switch ${st.features[f.id] ? "on" : ""}" data-act="toggle-feat" data-mod="${m.id}" data-id="${f.id}" ${on ? "" : "disabled"}><i></i></button>
        </div>`).join("") : ""}
      </article>`;
    }).join("")}</div>`);
}

function modalHtml(kind, ctx = {}) {
  if (kind === "add-cam" || kind === "edit-cam") {
    const c = ctx.cam || {};
    return `<div class="modal-bg" data-act="close-modal"><form class="modal" data-act="save-cam" data-id="${esc(camId(c))}">
      <h3>${c.id ? "编辑摄像机" : "添加摄像机"}</h3>
      <label class="field"><span>名称</span><input name="name" value="${esc(c.name || "")}" required /></label>
      <label class="field"><span>主码流 RTSP</span><input name="rtsp_main" value="${esc(c.rtsp_main || "")}" /></label>
      <label class="field"><span>子码流 RTSP</span><input name="rtsp_sub" value="${esc(c.rtsp_sub || "")}" /></label>
      <div class="flex" style="justify-content:flex-end"><button type="button" class="btn" data-act="close-modal">取消</button>
        <button class="btn primary" type="submit">保存</button></div>
    </form></div>`;
  }
  if (kind === "enroll") {
    return `<div class="modal-bg" data-act="close-modal"><form class="modal" data-act="do-enroll">
      <h3>录入</h3>
      <label class="field"><span>名称</span><input name="name" required /></label>
      <div class="flex" style="justify-content:flex-end"><button type="button" class="btn" data-act="close-modal">取消</button>
        <button class="btn primary" type="submit">保存</button></div>
    </form></div>`;
  }
  if (kind === "add-user") {
    return `<div class="modal-bg" data-act="close-modal"><form class="modal" data-act="save-user">
      <h3>新建用户</h3>
      <label class="field"><span>用户名</span><input name="username" required /></label>
      <label class="field"><span>密码</span><input name="password" type="password" required /></label>
      <div class="flex" style="justify-content:flex-end"><button type="button" class="btn" data-act="close-modal">取消</button>
        <button class="btn primary" type="submit">创建</button></div>
    </form></div>`;
  }
  return "";
}

async function jumpReplay(ev) {
  if (!ev) return;
  const cam = ev.camera_id || ev.camera || "";
  const ts = toMs(ev.event_time || ev.ts || 0);
  if (cam) S.replayCam = String(cam);
  if (ts) {
    S.replayAt = ts;
    S.tlStart = ts - 30 * 60 * 1000;
    S.tlEnd = ts + 30 * 60 * 1000;
  }
  S.replayEventId = ev.id || ev.event_id || null;
  S.replayLive = false;
  S.replayPlaying = true;
  S.replayEvAll = false;
  go("/replay");
}

function eventPopHtml(ev) {
  if (!ev) return "";
  const src = S.showBoxes ? eventSnapUrl(ev, { annotate: true }) : eventSnapUrl(ev);
  return `<div class="evpop" id="evpop">
    <div class="evpop-card" id="evpop-card">
      <div class="evpop-h">
        <b>${esc(eventTitle(ev))}</b>
        <div class="grow"></div>
        <span class="tiny muted">${esc([ev.camera_name || "", eventDir(ev), fmtTime(ev.event_time)].filter(Boolean).join(" · "))}</span>
        <button class="btn icon ghost" data-act="close-pop" type="button">${I.x}</button>
      </div>
      <div class="evpop-b"><div class="zview" data-z="evpop" id="ev-frame">
        ${src ? `<img data-src="${esc(src)}" alt="" />` : ""}
        <canvas class="track-cv"></canvas>
      </div></div>
      <div class="evpop-f">
        <button class="chip ${S.showBoxes ? "on" : ""}" data-act="toggle-boxes">检测框</button>
        <button class="chip ${S.showTrack ? "on" : ""}" data-act="toggle-track">运动轨迹</button>
        ${isOn(S.addons, "replay") ? `<button class="btn sm primary" data-act="jump-replay" data-cam="${esc(ev.camera_id || "")}" data-ts="${esc(ev.event_time || "")}" data-eid="${esc(ev.id)}">跳转回放</button>` : ""}
        ${feat("events", "feedback") ? `
          <button class="btn sm" data-act="fb" data-id="${ev.id}" data-v="correct">正确</button>
          <button class="btn sm" data-act="fb" data-id="${ev.id}" data-v="false">误报</button>` : ""}
        <button class="btn sm danger" data-act="del-ev" data-id="${ev.id}">删除</button>
        <span class="tiny muted">滚轮缩放 · 拖动平移</span>
      </div>
    </div>
  </div>`;
}

function closeEventPop() {
  $("#evpop")?.remove();
  S.eventPop = null;
}

async function showEventPop(id) {
  if (!id) return;
  let ev = S.recent.find((x) => String(x.id) === String(id)) || S.events.find((x) => String(x.id) === String(id));
  try {
    const d = await api.get(`/api/events/${id}`);
    if (d) {
      const n = normEvent(d);
      ev = { ...(ev || {}), ...n, extra: { ...parseExtra(ev), ...parseExtra(n) } };
      S.eventExtra[n.id] = parseExtra(ev);
    }
  } catch {}
  if (!ev) return;
  await markEventRead(id);
  ev.unread = false;
  S.eventPop = ev;
  await loadEventTrack(ev);
  zoomMap.delete("evpop");
  $("#evpop")?.remove();
  root.insertAdjacentHTML("beforeend", eventPopHtml(ev));
  await hydrate($("#evpop"));
  bindEventOverlay($("#evpop"));
}

function msFromTimelineEvent(e, tl) {
  const r = tl.getBoundingClientRect();
  const p = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
  return S.tlStart + p * (S.tlEnd - S.tlStart);
}

function setReplayLiveUi(on) {
  S.replayLive = !!on;
  const btn = $("[data-act=go-live]");
  if (btn) {
    btn.classList.toggle("primary", S.replayLive);
    btn.textContent = S.replayLive ? "实时中" : "实时";
  }
  const wrap = $(".player-wrap");
  if (!wrap) return;
  const badge = $(".live-badge", wrap);
  if (S.replayLive && !badge) wrap.insertAdjacentHTML("afterbegin", `<span class="live-badge">LIVE</span>`);
  if (!S.replayLive) badge?.remove();
}

function applySpeed(video) {
  const rate = Number(S.replaySpeed) || 1;
  S.replaySpeed = rate;
  if (video) video.playbackRate = rate;
  const p = players.get("replay");
  if (p?.video && p.video !== video) p.video.playbackRate = rate;
  $$(".speeds .chip").forEach((n) => n.classList.toggle("on", Number(n.dataset.v) === rate));
}

async function seekReplay(ms, opts = {}) {
  S.replayAt = ms;
  S.replayPlaying = true;
  if (opts.live) setReplayLiveUi(true);
  else {
    setReplayLiveUi(false);
    if (!opts.keepEvent) S.replayEventId = opts.eventId || null;
  }
  refreshTimelineDom();
  await playReplaySource();
  tickReplay();
}

function showPoster(poster, cam) {
  if (!poster) return;
  poster.hidden = false;
  const src = `/api/cameras/${encodeURIComponent(cam)}/snapshot?t=${Date.now()}`;
  poster.dataset.src = src;
  fillAuthImg(poster).catch(() => {});
}

async function playRecording(video, poster, recId, seekSec) {
  const url = `/api/recordings/${encodeURIComponent(recId)}/download`;
  const cur = video.getAttribute("src") || "";
  video.hidden = false;
  if (poster) poster.hidden = true;
  applySpeed(video);
  if (cur.includes(`/recordings/${recId}/`)) {
    try { video.currentTime = Math.max(0, seekSec); } catch {}
    if (S.replayPlaying) video.play().catch(() => {});
    return true;
  }
  stopPlayer("replay");
  const gen = ++S.playGen;
  video.src = url;
  const onMeta = () => {
    if (S.playGen !== gen) return;
    try { video.currentTime = Math.max(0, seekSec); } catch {}
    if (S.replayPlaying) video.play().catch(() => {});
  };
  video.addEventListener("loadedmetadata", onMeta, { once: true });
  video.load();
  players.set("replay", { hls: null, video, url });
  return true;
}

async function playReplaySource() {
  const video = $("#rp-video");
  const poster = $("#rp-poster");
  if (!video) return;
  const cam = S.replayCam;
  if (S.replayLive) {
    try {
      const url = await grantLive(cam, livePref(cam).source);
      if (url) {
        attachHls(video, url, "replay", livePref(cam).muted, {
          onPlay: () => { video.hidden = false; if (poster) poster.hidden = true; },
          onFail: () => { video.hidden = true; showPoster(poster, cam); },
        });
        return;
      }
    } catch {}
    showPoster(poster, cam);
    video.hidden = true;
    if (S._liveSnap) clearInterval(S._liveSnap);
    S._liveSnap = setInterval(() => showPoster(poster, cam), 700);
    return;
  }
  if (S._liveSnap) { clearInterval(S._liveSnap); S._liveSnap = 0; }
  const prev = players.get("replay");
  if (prev?.hls) stopPlayer("replay");

  const t = S.replayAt;
  const gen = ++S.playGen;
  if (S.replayEventId) {
    try {
      const clip = await api.get(`/api/events/${S.replayEventId}/clip`);
      if (S.playGen !== gen) return;
      if (clip?.clip_available) {
        stopPlayer("replay");
        video.src = `/api/events/${S.replayEventId}/clip/video?t=${gen}`;
        video.hidden = false;
        if (poster) poster.hidden = true;
        applySpeed(video);
        if (S.replayPlaying) video.play().catch(() => {});
        players.set("replay", { hls: null, video, url: video.src });
        return;
      }
      if (clip?.recording_id) {
        await playRecording(video, poster, clip.recording_id, (clip.seek_ms || 0) / 1000);
        return;
      }
    } catch {}
  }

  const seg = (S.replaySegs || []).find((s) => t >= s.start && t < s.end)
    || (S.replaySegs || []).filter((s) => s.start <= t).sort((a, b) => b.start - a.start)[0];
  if (seg?.id) {
    try {
      await playRecording(video, poster, seg.id, Math.max(0, (t - seg.start) / 1000));
      return;
    } catch {}
    try {
      const info = await api.get(`/api/recordings/${seg.id}/url`);
      const url = info?.url || info?.hls_url || "";
      if (url) {
        if (String(url).includes(".m3u8")) {
          attachHls(video, url, "replay", true);
          video.hidden = false;
          if (poster) poster.hidden = true;
          return;
        }
        video.src = url;
        video.hidden = false;
        if (poster) poster.hidden = true;
        if (S.replayPlaying) video.play().catch(() => {});
        return;
      }
    } catch {}
  }

  try {
    const lr = await api.get(`/api/cameras/${encodeURIComponent(cam)}/live-replay`, { ts: Math.round(t) });
    if (lr?.mode === "hls_live") {
      const url = hlsFromGrant(lr, livePref(cam).source);
      if (url) {
        attachHls(video, url, "replay", true, { secondsBehind: lr.seconds_behind_live });
        video.hidden = false;
        if (poster) poster.hidden = true;
        return;
      }
    }
  } catch {}
  showPoster(poster, cam);
  video.hidden = true;
}

function tickReplay() {
  if (replayTimer) cancelAnimationFrame(replayTimer);
  let last = performance.now();
  const step = (now) => {
    if (!S.replayPlaying) return;
    const dt = (now - last) / 1000;
    last = now;
    if (S.replayLive) S.replayAt = Date.now();
    else S.replayAt = (S.replayAt || 0) + dt * 1000 * S.replaySpeed;
    if (S.replayAt > S.tlEnd) {
      const span = S.tlEnd - S.tlStart;
      S.tlStart = S.replayAt - span * 0.8;
      S.tlEnd = S.tlStart + span;
    }
    refreshTimelineDom();
    replayTimer = requestAnimationFrame(step);
  };
  replayTimer = requestAnimationFrame(step);
}

const root = $("#root");
const frame = () => $("#frame") || root;

function enterDemo() {
  api.setDemo(true);
  api.setToken("demo-token");
  S.me = null;
  S.cameras = [];
}
function enterApp() {
  localStorage.setItem(FIRST_KEY, "1");
  persistAddons();
  S.me = null;
  S.cameras = [];
}
function formData(el) { return Object.fromEntries(new FormData(el).entries()); }
function showGateError(form, message) {
  const err = form && $("[data-err]", form);
  if (!err) { toast(message, "bad"); return; }
  err.hidden = false;
  err.textContent = message;
}
async function submitGate(form) {
  if (!form) return;
  const kind = form.dataset.kind;
  const d = formData(form);
  const btn = $("button[type=submit]", form);
  try {
    if (btn) { btn.disabled = true; btn.textContent = "正在进入…"; }
    if (kind === "login") {
      const username = (d.username || "").trim();
      const password = d.password || "";
      if (!username || !password) throw new Error("请输入用户名和密码");
      await api.login(username, password);
    } else if (kind === "setup") await api.setupAdmin(d);
    else if (kind === "db") await api.post("/api/setup/database", { type: "sqlite" });
    else if (kind === "license") await api.post("/api/license/activate", { license_key: d.license_key });
    enterApp();
    go("/home");
    await render();
  } catch (ex) {
    showGateError(form, ex.message || "登录失败");
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = kind === "login" ? "进入工作台" : "继续"; }
  }
}

async function render() {
  const parsed = parseHash();
  S.route = parsed.parts[0] || "home";
  const enteringHome = S.route === "home" || S.route === "live";
  if (!enteringHome) document.body.classList.remove("yk-home");
  stopPagePlayers();
  if (S._snapTimer) { clearInterval(S._snapTimer); S._snapTimer = 0; }
  if (S._liveWatch) { clearInterval(S._liveWatch); S._liveWatch = 0; }
  wipeBlobs();
  if (replayTimer) { cancelAnimationFrame(replayTimer); replayTimer = 0; }
  if (parsed.query.cam) S.evCam = parsed.query.cam;
  if (S.route === "system" && parsed.query.tab) S.sysTab = parsed.query.tab;
  if (!api.token && !api.demo) {
    discardMosaic();
    stopAllPlayers();
    await renderGate();
    return;
  }
  try {
    if (!S.me) await loadMe();
    if (!S.cameras.length) await loadCameras();
    await loadUnread();
    await loadAlerts();
    try { await loadRecentEvents(); } catch {}
    try { S.pack.metrics = await api.get("/api/system/metrics"); } catch {}
    try { S.pack.space = await api.get("/api/storage/space"); } catch {}
    try { S.pack.status = S.pack.status || await api.get("/api/system/status"); } catch {}
    try { S.pack.selfCheck = await api.get("/api/system/self-check"); } catch {}
  } catch (e) {
    if (e.status === 401) {
      api.setToken(""); api.setDemo(false);
      discardMosaic();
      stopAllPlayers();
      toast("登录已失效，请重新登录", "bad");
      await renderGate();
      return;
    }
    toast(e.message || "加载失败", "bad");
  }

  if (S.route === "home" || S.route === "live") await renderHome();
  else if (S.route === "addons") frame().innerHTML = addonsPage();
  else if (S.route === "events") {
    if (!isOn(S.addons, "events")) frame().innerHTML = locked("events");
    else await renderEvents();
  }
  else if (S.route === "replay") {
    if (!isOn(S.addons, "replay")) frame().innerHTML = locked("replay");
    else await renderReplay();
  }
  else if (S.route === "identities") {
    if (!isOn(S.addons, "identities")) frame().innerHTML = locked("identities");
    else await renderIds();
  }
  else if (S.route === "training") {
    if (!isOn(S.addons, "training")) frame().innerHTML = locked("training");
    else await renderTraining();
  }
  else if (S.route === "integrations") {
    if (!isOn(S.addons, "integrations")) frame().innerHTML = locked("integrations");
    else await renderInteg();
  }
  else if (S.route === "system") {
    if (!isOn(S.addons, "system")) frame().innerHTML = locked("system");
    else await renderSystem();
  } else await renderHome();

  if (S.modal) root.insertAdjacentHTML("beforeend", modalHtml(S.modal.kind, S.modal.ctx));
  await hydrate(root);
  bindClock();
}

async function renderGate() {
  let kind = "login";
  let extra = {};
  if (!api.demo) {
    try {
      const setup = await api.get("/api/setup/status");
      const authSetup = await api.get("/api/auth/setup-status");
      if (setup?.phase === "database_unconfigured") kind = "db";
      else if (setup?.phase === "admin_missing" || authSetup?.needs_setup) kind = "setup";
      else {
        const lic = await api.get("/api/license/status");
        const st = String(lic?.status || "").toLowerCase();
        if (st && !["valid", "ok", "licensed", "active"].includes(st) && lic?.is_pro !== true) {
          kind = "license";
          extra.fp = (await api.get("/api/license/fingerprint").catch(() => ({}))).machine_id_hash || "";
        }
      }
    } catch {}
  }
  discardMosaic();
  frame().innerHTML = gateView(kind, extra);
}

async function renderHome() {
  await loadRecentEvents();
  try { S.pack.metrics = await api.get("/api/system/metrics"); } catch {}
  try { S.pack.space = await api.get("/api/storage/space"); } catch {}
  try { S.pack.status = await api.get("/api/system/status"); } catch {}
  ensureDefaultLiveAudio();
  document.body.classList.add("yk-home");
  frame().innerHTML = chrome("", true);
  const keep = $("#home-keep");
  const key = mosaicCamKey();
  const reuse = keep && keep.querySelector(".mtile") && S._mosaicKey === key;
  if (reuse) {
    const p = $(".protect", keep);
    p?.classList.toggle("rail-off", !S.railOn);
    p?.classList.toggle("layout-lock", S.layoutLock);
    refreshHomeRail();
    bindMosaic({ keepLive: true });
    recoverMosaicLive(false);
    return;
  }
  if (keep) keep.innerHTML = homeMosaicHtml(S.recent);
  S._mosaicKey = key;
  bindMosaic();
}
async function renderEvents() {
  let data = {};
  try { data = await api.get("/api/events", { limit: 80, type: S.evType || undefined, camera: S.evCam || undefined, q: S.q || undefined }); } catch {}
  S.events = eventList(data);
  await loadTripwires();
  if (S.events.some(extraLooksEmpty)) await hydrateEventExtras(S.events);
  if (!S.events.length && S.recent.length) {
    S.events = S.recent.filter((e) => !S.evCam || String(e.camera_id) === String(S.evCam));
  }
  if (S.evCam) S.events = S.events.filter((e) => String(e.camera_id) === String(S.evCam));
  if (!S.event || (S.evCam && String(S.event.camera_id) !== String(S.evCam))) S.event = S.events[0] || null;
  if (S.event) await loadEventTrack(S.event);
  frame().innerHTML = eventsPage();
  await hydrate(root);
  bindEventOverlay();
  const evFrame = $("#ev-frame");
  const st = zoomMap.get("ev");
  if (evFrame && st) viewZoom(evFrame, st);
}
async function renderReplay() {
  if (!S.replayCam && S.cameras[0]) S.replayCam = camId(S.cameras[0]);
  if (!S.replayAt) S.replayAt = Date.now();
  ensureTlWindow();
  await loadReplayData();
  frame().innerHTML = replayPage();
  await hydrate(root);
  await playReplaySource();
  if (S.replayPlaying) tickReplay();
  const stage = $("#rp-stage");
  const st = zoomMap.get("replay");
  if (stage && st) viewZoom(stage, st);
}
async function renderIds() {
  let people = [], pets = [], visits = [];
  try { people = asList(await api.get("/api/people", { status: "all" })); } catch {}
  try { pets = asList(await api.get("/api/pets")); } catch {}
  try { visits = asList(await api.get("/api/visits", { limit: 40 })); } catch {}
  frame().innerHTML = idsPage(people, pets, visits);
  await hydrate(root);
}
async function renderTraining() {
  const pack = {};
  try { pack.jobs = await api.get("/api/training/jobs"); } catch {}
  try { pack.stats = await api.get("/api/training/annotations/stats"); } catch {}
  try { pack.models = await api.get("/api/tensorrt/models"); } catch {}
  try { pack.vlm = await api.get("/api/system/vlm/models"); } catch {}
  frame().innerHTML = trainingPage(pack);
}
async function renderInteg() {
  const pack = {};
  try { pack.gb = await api.get("/api/gb28181/devices"); } catch {}
  try { pack.gbCfg = await api.get("/api/gb28181/config"); } catch {}
  try { pack.hk = await api.get("/api/homekit/cameras"); } catch {}
  frame().innerHTML = integPage(pack);
}
async function renderSystem() {
  const pack = {};
  try { pack.status = await api.get("/api/system/status"); } catch {}
  try { pack.metrics = await api.get("/api/system/metrics"); } catch {}
  try { pack.users = await api.get("/api/users"); } catch {}
  try { pack.space = await api.get("/api/storage/space"); } catch {}
  try { pack.services = await api.get("/api/system/services"); } catch {}
  try { S.license = await api.get("/api/license/status"); pack.license = S.license; } catch {}
  if (S.sysTab === "logs") {
    try {
      const d = await api.get("/api/logs/api");
      S.logs = asList(d, ["lines", "logs", "items"]).map((x) => typeof x === "string" ? x : (x.line || x.message || JSON.stringify(x)));
    } catch { S.logs = []; }
  }
  S.pack = { ...S.pack, ...pack };
  frame().innerHTML = systemPage(pack);
}

root.addEventListener("submit", async (e) => {
  const form = e.target.closest("form[data-act]");
  if (!form) return;
  e.preventDefault();
  const act = form.dataset.act;
  try {
    if (act === "gate-submit") { await submitGate(form); return; }
    if (act === "save-cam") {
      const d = formData(form);
      const payload = { name: d.name, source_type: "rtsp", rtsp_main: d.rtsp_main || null, rtsp_sub: d.rtsp_sub || null, enabled: true };
      if (form.dataset.id) await api.put(`/api/cameras/${form.dataset.id}`, payload);
      else await api.post("/api/cameras", payload);
      S.modal = null; S.cameras = []; toast("已保存", "ok"); await loadCameras(); await render();
    }
    if (act === "save-user") { await api.post("/api/users", formData(form)); S.modal = null; toast("已创建", "ok"); await render(); }
    if (act === "do-enroll") { S.modal = null; toast("已记录", "ok"); await render(); }
  } catch (ex) { toast(ex.message, "bad"); }
});

root.addEventListener("click", async (e) => {
  if (e.target.id === "evpop") { closeEventPop(); return; }
  const el = e.target.closest("[data-act]");
  if (!el || el.tagName === "FORM") return;
  const act = el.dataset.act;
  try {
    if (act === "do-login") { e.preventDefault(); e.stopPropagation(); await submitGate(el.closest("form")); return; }
    if (act === "demo") { enterDemo(); enterApp(); go("/home"); await render(); return; }
    if (act === "logout") {
      discardMosaic();
      stopAllPlayers();
      api.logout(); S.me = null; S.cameras = []; go("/home"); await render(); return;
    }
    if (act === "toggle-nav") {
      S.navOn = !S.navOn;
      localStorage.setItem(NAV_KEY, S.navOn ? "1" : "0");
      await render();
      return;
    }
    if (act === "orig-settings") {
      window.open(origSettingsUrl(), "_blank", "noopener");
      return;
    }
    if (act === "toggle-theme") {
      S.theme = themeIsDay() ? "night" : "day";
      localStorage.setItem(THEME_KEY, S.theme);
      applyTheme();
      el.title = themeIsDay() ? "切换到黑夜模式" : "切换到白天模式";
      el.innerHTML = themeIsDay() ? I.moon : I.sun;
      return;
    }
    if (act === "toggle-lock") {
      S.layoutLock = !S.layoutLock;
      localStorage.setItem(LOCK_KEY, S.layoutLock ? "1" : "0");
      const p = $(".protect");
      p?.classList.toggle("layout-lock", S.layoutLock);
      el.innerHTML = `${S.layoutLock ? I.lock : I.unlock} ${S.layoutLock ? "已锁定" : "锁定布局"}`;
      el.title = S.layoutLock ? "解锁布局" : "锁定布局，禁止拖动拉伸";
      $$(".zoom-hint").forEach((h) => {
        h.textContent = S.layoutLock ? "点击切声 · 滚轮放大" : "点击切声 · 拖动 · 滚轮放大";
      });
      toast(S.layoutLock ? "布局已锁定" : "布局已解锁", "ok");
      return;
    }
    if (act === "toggle-rail") {
      S.railOn = !S.railOn;
      localStorage.setItem(RAIL_KEY, S.railOn ? "1" : "0");
      const p = $(".protect");
      if (p) {
        p.classList.toggle("rail-off", !S.railOn);
        const tab = $(".rail-tab", p);
        if (tab) tab.title = S.railOn ? "折叠事件栏" : "展开事件栏";
        requestAnimationFrame(() => layoutMosaic());
      } else await render();
      return;
    }
    if (act === "open-alerts") {
      await goSystemTab("logs");
      return;
    }
    if (act === "cam-events") {
      S.evCam = el.dataset.id || "";
      S.event = null;
      go(S.evCam ? `/events?cam=${encodeURIComponent(S.evCam)}` : "/events");
      return;
    }
    if (act === "open-unread") { await showEventPop(el.dataset.id); return; }
    if (act === "close-pop") { closeEventPop(); return; }
    if (act === "reset-layout") {
      S.mosaicLayout = null;
      localStorage.removeItem(LAYOUT_KEY);
      layoutMosaic();
      toast("已恢复自动布局", "ok");
      return;
    }
    if (act === "select-ev") {
      zoomMap.delete("ev");
      S.event = S.events.find((x) => String(x.id) === String(el.dataset.id)) || S.event;
      await markEventRead(el.dataset.id);
      if (S.event) await loadEventTrack(S.event);
      const view = $("#ev-view");
      if (view) {
        view.innerHTML = eventStageHtml(S.event);
        await hydrate(view);
        bindEventOverlay();
      }
      $$(".ev.sel").forEach((n) => n.classList.remove("sel"));
      el.classList.add("sel");
      return;
    }
    if (act === "toggle-boxes") {
      S.showBoxes = !S.showBoxes;
      if (S.eventPop) { await showEventPop(S.eventPop.id); return; }
      await renderEvents();
      return;
    }
    if (act === "toggle-track") {
      S.showTrack = !S.showTrack;
      bindEventOverlay($("#evpop") || document);
      el.classList.toggle("on", S.showTrack);
      return;
    }
    if (act === "jump-replay") {
      closeEventPop();
      await jumpReplay({ camera_id: el.dataset.cam, event_time: el.dataset.ts, id: el.dataset.eid });
      return;
    }
    if (act === "rp-cam") {
      S.replayCam = el.dataset.id;
      S.replayEvAll = false;
      S.replayEventId = null;
      S.replayLive = false;
      zoomMap.delete("replay");
      await render();
      return;
    }
    if (act === "rp-ev-cam") {
      const id = el.dataset.id || "";
      if (!id) {
        S.replayEvAll = true;
        const rail = $(".jump-rail");
        if (rail) { rail.innerHTML = replayRailHtml(); await hydrate(rail); }
        else await render();
        return;
      }
      S.replayEvAll = false;
      if (S.replayCam === id) {
        const rail = $(".jump-rail");
        if (rail) { rail.innerHTML = replayRailHtml(); await hydrate(rail); }
        else await render();
        return;
      }
      S.replayCam = id;
      S.replayEventId = null;
      S.replayLive = false;
      zoomMap.delete("replay");
      await render();
      return;
    }
    if (act === "go-live") {
      S.replayPlaying = true;
      S.replayEventId = null;
      S.replayAt = Date.now();
      if (S.replayAt < S.tlStart || S.replayAt > S.tlEnd) {
        S.tlEnd = S.replayAt;
        S.tlStart = S.replayAt - 3600000;
      }
      setReplayLiveUi(true);
      await playReplaySource();
      tickReplay();
      return;
    }
    if (act === "rp-toggle") {
      S.replayPlaying = !S.replayPlaying;
      el.textContent = S.replayPlaying ? "暂停" : "播放";
      const video = $("#rp-video");
      if (S.replayPlaying) {
        video?.play().catch(() => {});
        tickReplay();
      } else {
        video?.pause();
      }
      return;
    }
    if (act === "rp-speed") {
      S.replaySpeed = parseFloat(el.dataset.v) || 1;
      applySpeed($("#rp-video"));
      return;
    }
    if (act === "tl-jump") {
      if (el.dataset.cam) S.replayCam = el.dataset.cam;
      await seekReplay(Number(el.dataset.ms), { eventId: el.dataset.eid || null });
      return;
    }
    if (act === "tl-span") {
      setTlSpan(Number(el.dataset.ms), S.replayAt || Date.now());
      await loadReplayData();
      refreshTimelineDom();
      return;
    }
    if (act === "tl-seek") { return; }
    if (act === "tile-src") {
      e.preventDefault();
      e.stopPropagation();
      const id = el.dataset.id;
      const tile = el.closest(".mtile");
      const next = livePref(id).source === "main" ? "sub" : "main";
      setLivePref(id, { source: next, userSource: true });
      el.textContent = next === "main" ? "主码流" : "子码流";
      stopTilePlayers(id);
      const ok = await applyTileLive(id, tile);
      if (ok) toast(next === "main" ? "正在播放主码流" : "正在播放子码流", "ok");
      return;
    }
    if (act === "tile-mute") {
      e.preventDefault();
      e.stopPropagation();
      const id = el.dataset.id;
      const tile = el.closest(".mtile");
      if (tileWantsSound(id)) {
        setLiveAudio(null);
        toast("已静音", "ok");
        return;
      }
      await focusTileAudio(id, tile);
      return;
    }
    if (act === "toggle-mod") { S.addons[el.dataset.id].on = !S.addons[el.dataset.id].on; persistAddons(); await render(); return; }
    if (act === "toggle-feat") { S.addons[el.dataset.mod].features[el.dataset.id] = !S.addons[el.dataset.mod].features[el.dataset.id]; persistAddons(); await render(); return; }
    if (act === "expand-mod") { S.expandMod = S.expandMod === el.dataset.id ? null : el.dataset.id; await render(); return; }
    if (act === "enable-mod") { S.addons[el.dataset.id].on = true; persistAddons(); go("/" + el.dataset.id); await render(); return; }
    if (act === "preset") { S.addons = applyPreset(el.dataset.id); toast("已套用预设", "ok"); await render(); return; }
    if (act === "add-cam") { S.modal = { kind: "add-cam", ctx: {} }; await render(); return; }
    if (act === "edit-cam") {
      const cam = S.cameras.find((c) => camId(c) === el.dataset.id) || {};
      S.modal = { kind: "edit-cam", ctx: { cam } }; await render(); return;
    }
    if (act === "close-modal") { S.modal = null; await render(); return; }
    if (act === "toggle-det") { await api.post(`/api/detection/toggle/${el.dataset.id}`, {}); S.cameras = []; await loadCameras(); await render(); return; }
    if (act === "ptz") return;
    if (act === "ptz-stop") await api.post(`/api/cameras/${el.dataset.id}/ptz/stop`, {});
    if (act === "light") { await api.post(`/api/cameras/${el.dataset.id}/light`, { state: el.dataset.state }); toast("补光已切换", "ok"); }
    if (act === "talk-start") { await api.post(`/api/cameras/${el.dataset.id}/talkback/start`, {}).catch(() => {}); toast("对讲开始", "ok"); }
    if (act === "talk-stop") { await api.post(`/api/cameras/${el.dataset.id}/talkback/stop`, {}).catch(() => {}); toast("对讲停止", "ok"); }
    if (act === "discover") toast("正在扫描局域网…", "ok");
    if (act === "open-events") { S.evCam = el.dataset.id; go("/events?cam=" + encodeURIComponent(el.dataset.id)); }
    if (act === "ev-type") { S.evType = el.dataset.v; await render(); }
    if (act === "read-all") {
      e.preventDefault();
      await markAllEventsRead();
      return;
    }
    if (act === "open-ev") { await showEventPop(el.dataset.id); return; }
    if (act === "fb") { await api.post(`/api/events/${el.dataset.id}/feedback`, { verdict: el.dataset.v }); toast("已记录", "ok"); }
    if (act === "del-ev") {
      await api.del(`/api/events/${el.dataset.id}`);
      S.event = null; closeEventPop();
      toast("已删除", "ok"); await render(); return;
    }
    if (act === "del-cam") {
      if (!confirm("删除这台摄像机？")) return;
      await api.del(`/api/cameras/${el.dataset.id}`); S.cameras = []; toast("已删除", "ok"); await render();
    }
    if (act === "open-replay") { S.replayCam = el.dataset.id; S.replayAt = Date.now(); go("/replay"); return; }
    if (act === "id-tab") { S.identityTab = el.dataset.v; await render(); }
    if (act === "train-tab") { S.trainTab = el.dataset.v; await render(); }
    if (act === "integ-tab") { S.integTab = el.dataset.v; await render(); }
    if (act === "sys-tab") { await goSystemTab(el.dataset.v); return; }
    if (act === "enroll") { S.modal = { kind: "enroll", ctx: {} }; await render(); }
    if (act === "add-user") { S.modal = { kind: "add-user", ctx: {} }; await render(); }
    if (act === "det-pause") { await api.post("/api/detection/pause-all", {}); toast("已暂停", "ok"); await render(); }
    if (act === "det-resume") { await api.post("/api/detection/resume-all", {}); toast("已恢复", "ok"); await render(); }
    if (act === "lic-refresh") { await api.post("/api/license/refresh", {}).catch(() => {}); toast("已刷新", "ok"); await render(); }
    if (act === "gb-refresh") toast("已刷新目录", "ok");
    if (act === "hk-toggle") toast("已切换 HomeKit", "ok");
    if (act === "restart") toast(`已请求重启 ${el.dataset.name}`, "ok");
    if (act === "convert") toast(`已排队 ${el.dataset.name}`, "ok");
    if (act === "export-rec") toast("已创建导出", "ok");
    if (act === "open-person" || act === "open-pet") toast("详情已打开（预览）", "");
  } catch (ex) { toast(ex.message, "bad"); }
});

root.addEventListener("pointerdown", (e) => {
  const el = e.target.closest("[data-act=ptz]");
  if (el) {
    e.preventDefault();
    api.post(`/api/cameras/${el.dataset.id}/ptz`, { direction: el.dataset.dir, speed: 0.4 }).catch(() => {});
    const up = () => {
      api.post(`/api/cameras/${el.dataset.id}/ptz/stop`, {}).catch(() => {});
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointerup", up);
    return;
  }
  const tl = e.target.closest("#tl");
  if (tl) {
    e.preventDefault();
    const startX = e.clientX;
    const a0 = S.tlStart, b0 = S.tlEnd;
    let moved = 0;
    const move = (ev) => {
      moved += Math.abs(ev.clientX - startX);
      const r = tl.getBoundingClientRect();
      const dx = (ev.clientX - startX) / r.width * (b0 - a0);
      S.tlStart = a0 - dx;
      S.tlEnd = b0 - dx;
      refreshTimelineDom();
    };
    const up = async (ev) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      if (moved < 12) await seekReplay(msFromTimelineEvent(ev, tl));
      else await loadReplayData().then(refreshTimelineDom);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return;
  }
  if (e.target.closest(".tile-tools, [data-act=tile-src], [data-act=tile-mute], [data-act=reset-layout], [data-act=toggle-rail], [data-act=toggle-lock], .ev-tools, .evpop-h, .evpop-f")) return;
  const pw = e.target.closest(".player-wrap");
  if (pw) {
    const stage = $("#rp-stage", pw) || pw;
    if (panViewPointer(stage, "replay", e)) return;
  }
  const zv = e.target.closest(".zview, .ev-frame");
  if (zv) {
    const key = zv.dataset.z || "ev";
    if (panViewPointer(zv, key, e)) return;
  }
  const tile = e.target.closest(".mtile");
  if (!tile) return;
  const box = $("#mosaic");
  if (!box) return;
  const id = tile.dataset.id;
  const st = zoomMap.get(id) || { s: 1, x: 0, y: 0 };
  const br = box.getBoundingClientRect();
  if (e.target.closest("[data-act=tile-rz]")) {
    if (S.layoutLock) return;
    e.preventDefault();
    e.stopPropagation();
    const x0 = tile.offsetLeft, y0 = tile.offsetTop;
    const move = (ev) => {
      let w = ev.clientX - br.left - x0;
      let h = ev.clientY - br.top - y0;
      w = Math.max(80, Math.min(box.clientWidth - x0, w));
      h = Math.max(64, Math.min(box.clientHeight - y0, h));
      tile.style.width = w + "px";
      tile.style.height = h + "px";
    };
    const up = () => {
      persistMosaic();
      layoutMosaic();
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return;
  }
  if (st.s > 1 && e.target.closest(".media")) {
    e.preventDefault();
    tile.style.cursor = "grabbing";
    const ox = e.clientX, oy = e.clientY, x0 = st.x, y0 = st.y;
    const move = (ev) => { st.x = x0 + (ev.clientX - ox); st.y = y0 + (ev.clientY - oy); applyZoom(tile, st); };
    const up = () => {
      tile.style.cursor = "";
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return;
  }
  if (S.layoutLock) {
    focusTileAudio(id, tile);
    return;
  }
  const ox = e.clientX - br.left - tile.offsetLeft;
  const oy = e.clientY - br.top - tile.offsetTop;
  const sx = e.clientX, sy = e.clientY;
  let dragging = false;
  const move = (ev) => {
    const dist = Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy);
    if (!dragging && dist < 8) return;
    dragging = true;
    e.preventDefault();
    tile.style.zIndex = 5;
    let x = ev.clientX - br.left - ox;
    let y = ev.clientY - br.top - oy;
    x = Math.max(0, Math.min(box.clientWidth - tile.offsetWidth, x));
    y = Math.max(0, Math.min(box.clientHeight - tile.offsetHeight, y));
    tile.style.left = x + "px";
    tile.style.top = y + "px";
  };
  const up = () => {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", up);
    if (!dragging) {
      focusTileAudio(id, tile);
      return;
    }
    tile.style.zIndex = "";
    persistMosaic();
    layoutMosaic();
  };
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", up);
});

root.addEventListener("pointermove", (e) => {
  const tl = e.target.closest?.("#tl");
  const label = $("#tl-hover");
  if (!label) return;
  if (!tl) { if (!e.buttons) label.textContent = ""; return; }
  label.textContent = fmtStamp(msFromTimelineEvent(e, tl));
});

root.addEventListener("wheel", (e) => {
  const tl = e.target.closest("#tl");
  if (tl) {
    e.preventDefault();
    const r = tl.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    const span = Math.max(1000, S.tlEnd - S.tlStart);
    const center = S.tlStart + p * span;
    const next = e.deltaY < 0 ? span / 1.22 : span * 1.22;
    const ns = Math.max(60 * 1000, Math.min(7 * 86400000, next));
    S.tlStart = center - ns * p;
    S.tlEnd = S.tlStart + ns;
    clearTimeout(root._tlZoom);
    refreshTimelineDom();
    root._tlZoom = setTimeout(() => { loadReplayData().then(refreshTimelineDom); }, 180);
    return;
  }
  const pw = e.target.closest(".player-wrap");
  if (pw) {
    e.preventDefault();
    const stage = $("#rp-stage", pw) || pw;
    wheelViewZoom(stage, "replay", e, 4);
    return;
  }
  const zv = e.target.closest(".zview, .ev-frame");
  if (zv) {
    e.preventDefault();
    wheelViewZoom(zv, zv.dataset.z || "ev", e, 8);
    return;
  }
  const tile = e.target.closest(".mtile");
  if (!tile) return;
  e.preventDefault();
  const id = tile.dataset.id;
  const st = zoomMap.get(id) || { s: 1, x: 0, y: 0 };
  const next = e.deltaY < 0 ? st.s * 1.12 : st.s / 1.12;
  st.s = Math.min(6, Math.max(1, next));
  if (st.s === 1) { st.x = 0; st.y = 0; }
  zoomMap.set(id, st);
  applyZoom(tile, st);
  const hint = $(".zoom-hint", tile);
  if (hint) hint.textContent = st.s === 1 ? "点击切声 · 拖动 · 滚轮放大" : `${st.s.toFixed(1)}x`;
}, { passive: false });

root.addEventListener("change", async (e) => {
  const el = e.target.closest("[data-act]");
  if (!el) return;
  if (el.dataset.act === "ev-cam") { S.evCam = el.value; await render(); }
  if (el.dataset.act === "rp-cam") { S.replayCam = el.value || el.dataset.id; S.replayEvAll = false; S.replayLive = false; S.replayEventId = null; await render(); }
  if (el.dataset.act === "rp-date") {
    const day = el.value;
    S.tlStart = new Date(`${day}T00:00:00`).getTime();
    S.tlEnd = S.tlStart + 86400000;
    S.replayAt = S.tlStart + 12 * 3600000;
    S.replayLive = false;
    await render();
  }
  if (el.dataset.act === "theme") {
    S.theme = el.value === "day" ? "day" : "night";
    localStorage.setItem(THEME_KEY, S.theme);
    applyTheme();
  }
});
root.addEventListener("keydown", (e) => {
  const q = e.target.closest("[data-act=ev-q]");
  if (q && e.key === "Enter") { S.q = q.value.trim(); render(); }
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape" && e.key !== "Esc") return;
  if ($("#evpop")) {
    e.preventDefault();
    closeEventPop();
  }
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    S._hiddenAt = Date.now();
    return;
  }
  recoverMosaicLive();
});
window.addEventListener("focus", () => {
  if (!document.hidden) recoverMosaicLive();
});
window.addEventListener("pageshow", () => recoverMosaicLive());

if (new URLSearchParams(location.search).has("demo")) enterDemo();
window.addEventListener("hashchange", () => render());
render().catch((e) => {
  frame().innerHTML = `<div class="gate"><div class="gate-card"><p class="err">${esc(e.message)}</p></div></div>`;
});
