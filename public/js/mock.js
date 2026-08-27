/** Demo data + request interceptor so the UI can be previewed without a backend. */

function svgBlob(svg) {
  return new Blob([svg], { type: "image/svg+xml" });
}

function sceneSvg(kind, title, time, portrait = false) {
  const palettes = {
    living: { sky: "#5b6f8a", a: "#c9b496", b: "#e0b07a", c: "#88b090", lamp: "#ffe18a" },
    door: { sky: "#4a5d74", a: "#8b9aab", b: "#c4a07a", c: "#6b7c90", lamp: "#ffe9b8" },
    garage: { sky: "#4d5563", a: "#7a8494", b: "#d08a4a", c: "#9aa3b0", lamp: "#ffd27a" },
    yard: { sky: "#4d8a6e", a: "#6fbf84", b: "#d5e48a", c: "#3f7a52", lamp: "#f7ffd0" },
    hall: { sky: "#6a7382", a: "#cfc6b6", b: "#e8dcc4", c: "#8b93a0", lamp: "#fff6d8" },
    studio: { sky: "#4d6f90", a: "#8fb0cc", b: "#d7e7f4", c: "#f2f6fa", lamp: "#c4ecff" },
  };
  const p = palettes[kind] || palettes.living;
  const gid = "g" + kind;
  const extras = {
    living: `<rect x="0" y="92" width="260" height="68" fill="#3d4554"/><rect x="28" y="78" width="96" height="52" rx="6" fill="${p.b}"/><rect x="148" y="48" width="86" height="72" rx="3" fill="${p.a}"/><rect x="158" y="56" width="66" height="40" fill="${p.c}"/><circle cx="214" cy="36" r="14" fill="${p.lamp}"/>`,
    door: `<rect x="0" y="108" width="260" height="52" fill="#2f3a48"/><rect x="88" y="28" width="84" height="120" rx="4" fill="${p.b}"/><rect x="96" y="36" width="68" height="88" fill="#8d6a48"/><circle cx="154" cy="96" r="5" fill="${p.lamp}"/><rect x="18" y="118" width="54" height="32" rx="2" fill="${p.c}"/>`,
    garage: `<rect x="0" y="100" width="260" height="60" fill="#2a3038"/><rect x="22" y="58" width="216" height="78" rx="4" fill="${p.a}"/><rect x="40" y="86" width="90" height="40" rx="8" fill="${p.b}"/><rect x="148" y="90" width="74" height="36" rx="8" fill="${p.c}"/><circle cx="58" cy="126" r="8" fill="#222"/><circle cx="112" cy="126" r="8" fill="#222"/>`,
    yard: `<rect x="0" y="110" width="260" height="50" fill="${p.c}"/><circle cx="78" cy="72" r="36" fill="${p.a}"/><rect x="70" y="90" width="16" height="40" fill="#6b4a32"/><rect x="150" y="78" width="88" height="52" rx="3" fill="${p.b}"/>`,
    hall: `<polygon points="0,40 260,40 260,160 0,160" fill="${p.a}"/><polygon points="0,40 130,18 260,40" fill="${p.b}"/><rect x="112" y="52" width="36" height="108" fill="${p.c}"/><rect x="118" y="88" width="24" height="48" fill="${p.lamp}"/>`,
    studio: `<rect x="0" y="108" width="260" height="52" fill="#3b4a5c"/><rect x="24" y="64" width="130" height="64" rx="4" fill="${p.a}"/><rect x="168" y="36" width="72" height="56" rx="4" fill="${p.c}"/><rect x="176" y="44" width="56" height="40" fill="${p.lamp}"/><rect x="40" y="84" width="70" height="12" rx="2" fill="${p.b}"/>`,
  };
  const W = portrait ? 160 : 260;
  const H = portrait ? 260 : 160;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * 2}" height="${H * 2}">
  <defs>
    <linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${p.sky}"/>
      <stop offset="1" stop-color="#141b26"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#${gid})"/>
  ${portrait ? `<g transform="translate(${(W - 260) / 2}, ${(H - 160) / 2})">${extras[kind] || extras.living}</g>` : (extras[kind] || extras.living)}
  <rect x="0" y="${H - 22}" width="${W}" height="22" fill="#000" opacity=".45"/>
  <text x="8" y="${H - 7}" fill="#d7dee8" font-size="10" font-family="ui-monospace,monospace">${title}  ${time}</text>
  <circle cx="${W - 12}" cy="12" r="4" fill="#3ee0a0"/>
</svg>`;
}

function avatarSvg(letter, bg) {
  return `<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
    <rect width="80" height="80" rx="16" fill="${bg}"/>
    <text x="40" y="52" text-anchor="middle" fill="#fff" font-size="36" font-family="system-ui">${letter}</text>
  </svg>`;
}

const now = Date.now();
const ago = (m) => new Date(now - m * 60000).toISOString();

const DB = {
  me: { id: 1, username: "admin", display_name: "云瞰管理员", role: "admin", has_avatar: false },
  license: {
    status: "valid", sku: "pro", tier: "pro", is_pro: true,
    customer_email: "preview@yunkan.local", expires_at: "2027-12-31", days_left: 490,
  },
  cameras: [
    { id: "cam-1", name: "客厅", vendor: "hikvision", online: true, has_ptz: true, has_sub: true, detection_enabled: true, record_mode: "event", scene: "living", width: 1920, height: 1080 },
    { id: "cam-2", name: "门口", vendor: "dahua", online: true, has_ptz: false, has_sub: true, detection_enabled: true, record_mode: "continuous", scene: "door", width: 1080, height: 1920 },
    { id: "cam-3", name: "小湃", vendor: "reolink", online: true, has_ptz: true, has_sub: true, detection_enabled: true, record_mode: "event", scene: "garage", width: 1920, height: 1080 },
    { id: "cam-4", name: "后院", vendor: "onvif", online: true, has_ptz: false, has_sub: false, detection_enabled: true, record_mode: "event", scene: "yard", width: 1920, height: 1080 },
    { id: "cam-5", name: "楼道", vendor: "vigi", online: false, has_ptz: false, has_sub: false, detection_enabled: false, record_mode: "off", scene: "hall", width: 1080, height: 1920 },
    { id: "cam-6", name: "工作室", vendor: "tplink", online: true, has_ptz: false, has_sub: true, detection_enabled: true, record_mode: "continuous", scene: "studio", width: 2560, height: 1440 },
  ],
  events: [
    { id: "e1", type: "person", summary: "识别到 陈晨", camera_id: "cam-2", camera_name: "门口", event_time: ago(4), unread: true, snapshot_url: "/api/events/snapshot/e1", extra: { detections: [{ label: "person", bbox: [0.28, 0.22, 0.38, 0.62], score: 0.94 }], direction: "forward", direction_label: "回家", tripwire_id: 1, tripwire_name: "门口绊线", forward_left_to_right: true } },
    { id: "e2", type: "pet", summary: "橘猫进入客厅", camera_id: "cam-1", camera_name: "客厅", event_time: ago(12), unread: true, snapshot_url: "/api/events/snapshot/e2", extra: { detections: [{ label: "cat", bbox: [0.42, 0.48, 0.22, 0.28], score: 0.88 }], direction: "in" } },
    { id: "e3", type: "vehicle", summary: "车辆驶入车库", camera_id: "cam-3", camera_name: "小湃", event_time: ago(28), unread: false, snapshot_url: "/api/events/snapshot/e3", extra: { detections: [{ label: "car", bbox: [0.18, 0.4, 0.62, 0.38], score: 0.91 }], direction: "in", direction_label: "进入" } },
    { id: "e4", type: "person", summary: "访客停留 42 秒", camera_id: "cam-2", camera_name: "门口", event_time: ago(51), unread: false, snapshot_url: "/api/events/snapshot/e4", extra: JSON.stringify({ detections: [{ label: "person", bbox: [0.3, 0.2, 0.4, 0.66], score: 0.81 }], direction: "reverse", tripwire_id: 1, tripwire_name: "门口绊线" }) },
    { id: "e5", type: "motion", summary: "后院移动", camera_id: "cam-4", camera_name: "后院", event_time: ago(73), unread: false, snapshot_url: "/api/events/snapshot/e5", extra: { detections: [{ label: "person", bbox: [0.55, 0.3, 0.2, 0.5], score: 0.64 }] } },
    { id: "e6", type: "face", summary: "人脸：林夏", camera_id: "cam-6", camera_name: "工作室", event_time: ago(96), unread: false, snapshot_url: "/api/events/snapshot/e6", extra: { detections: [{ label: "face", bbox: [0.4, 0.22, 0.18, 0.24], score: 0.97 }] } },
    { id: "e7", type: "pet", summary: "狗靠近食盆", camera_id: "cam-4", camera_name: "后院", event_time: ago(140), unread: false, snapshot_url: "/api/events/snapshot/e7", extra: { detections: [{ label: "dog", bbox: [0.36, 0.52, 0.28, 0.3], score: 0.86 }] } },
    { id: "e8", type: "person", summary: "人员经过楼道", camera_id: "cam-5", camera_name: "楼道", event_time: ago(210), unread: false, snapshot_url: "/api/events/snapshot/e8", extra: { detections: [{ label: "person", bbox: [0.32, 0.18, 0.36, 0.7], score: 0.77 }] } },
  ],
  people: [
    { id: "p1", name: "陈晨", sample_count: 24, last_seen: ago(4), cover: "/api/faces/samples/p1/photo" },
    { id: "p2", name: "林夏", sample_count: 18, last_seen: ago(96), cover: "/api/faces/samples/p2/photo" },
    { id: "p3", name: "未命名 #14", sample_count: 3, last_seen: ago(400), cover: "/api/faces/samples/p3/photo" },
  ],
  pets: [
    { id: "t1", name: "橘子", species: "cat", sample_count: 31, cover: "/api/pets/samples/t1/photo" },
    { id: "t2", name: "豆豆", species: "dog", sample_count: 12, cover: "/api/pets/samples/t2/photo" },
  ],
  visits: [
    { id: "v1", person_name: "快递员", camera_name: "门口", start_time: ago(51), duration_sec: 42 },
    { id: "v2", person_name: "陈晨", camera_name: "门口", start_time: ago(4), duration_sec: 8 },
    { id: "v3", person_name: "未识别", camera_name: "楼道", start_time: ago(210), duration_sec: 16 },
  ],
  automations: [
    { id: "a1", name: "门口有人 · 推送手机", trigger_event_types: ["person"], enabled: true },
    { id: "a2", name: "夜间车库车辆 · 开灯", trigger_event_types: ["vehicle"], enabled: true },
    { id: "a3", name: "宠物进入禁区 · TTS 劝离", trigger_event_types: ["pet"], enabled: false },
  ],
  users: [
    { id: 1, username: "admin", display_name: "云瞰管理员", role: "admin", is_active: true },
    { id: 2, username: "family", display_name: "家人", role: "viewer", is_active: true },
  ],
  jobs: [
    { id: "j1", name: "人物增量 v3", status: "running", progress: 0.62, created_at: ago(40) },
    { id: "j2", name: "宠物召回微调", status: "done", progress: 1, created_at: ago(1400) },
  ],
  models: [
    { name: "yolo26n", engine: "ready", backend: "OpenVINO" },
    { name: "yolo26s", engine: "converting", backend: "OpenVINO" },
    { name: "face-r50", engine: "ready", backend: "OpenVINO" },
  ],
  gb: [
    { id: "34020000001320000001", name: "小区南门", channels: 4, online: true },
    { id: "34020000001320000002", name: "地下车库", channels: 8, online: true },
  ],
  tripwires: [
    { id: 1, camera_id: "cam-2", name: "门口绊线", forward_label: "回家", reverse_label: "离家", forward_left_to_right: true },
    { id: 2, camera_id: "cam-3", name: "车库绊线", forward_label: "进入", reverse_label: "离开", forward_left_to_right: true },
  ],
  presets: {
    "cam-1": [{ token: "home", name: "沙发位" }, { token: "tv", name: "电视墙" }],
    "cam-3": [{ token: "gate", name: "卷帘门" }, { token: "spot", name: "车位" }],
  },
  segments: [
    { id: "s0", start_time: ago(26 * 60), duration_ms: 180 * 60000, storage_backend: "local" },
    { id: "s1", start_time: ago(360), duration_ms: 90 * 60000, storage_backend: "local" },
    { id: "s2", start_time: ago(180), duration_ms: 70 * 60000, storage_backend: "local" },
    { id: "s3", start_time: ago(90), duration_ms: 40 * 60000, storage_backend: "local" },
    { id: "s4", start_time: ago(20), duration_ms: 18 * 60000, storage_backend: "local" },
  ],
};

function withEnd(s) {
  const start = new Date(s.start_time).getTime();
  return { ...s, end_time: new Date(start + (s.duration_ms || 0)).toISOString(), start_ms: start, end_ms: start + (s.duration_ms || 0) };
}

function mockTrack(ev) {
  const dets = ev?.extra?.detections || [{ label: ev?.type || "object", bbox: [0.3, 0.25, 0.28, 0.5] }];
  const b = dets[0]?.bbox || [0.3, 0.25, 0.28, 0.5];
  const cx = b[0] + b[2] / 2, cy = b[1] + b[3] / 2;
  return {
    event_id: ev?.id,
    frame_w: 1920,
    frame_h: 1080,
    points: [
      { x: Math.max(0.05, cx - 0.22), y: Math.min(0.92, cy + 0.12), t: 0 },
      { x: cx - 0.08, y: cy + 0.04, t: 400 },
      { x: cx, y: cy, t: 800 },
      { x: Math.min(0.92, cx + 0.16), y: Math.max(0.08, cy - 0.1), t: 1400 },
    ],
    detections: dets,
  };
}

const CAM_SCENE = Object.fromEntries(DB.cameras.map((c) => [c.id, c.scene]));
const LETTER_COLOR = { 陈: "#1B6FE8", 林: "#0E9F8A", 未: "#64748B", 橘: "#D97706", 豆: "#7C3AED" };

function parse(path) {
  const u = new URL(path, "http://local");
  return { path: u.pathname, query: Object.fromEntries(u.searchParams), method: "GET" };
}

function json(data) {
  return data;
}

function match(path, pattern) {
  const a = path.split("/").filter(Boolean);
  const b = pattern.split("/").filter(Boolean);
  if (a.length !== b.length) return null;
  const params = {};
  for (let i = 0; i < a.length; i++) {
    if (b[i].startsWith("{") && b[i].endsWith("}")) params[b[i].slice(1, -1)] = decodeURIComponent(a[i]);
    else if (a[i] !== b[i]) return null;
  }
  return params;
}

export function snapshotDataUri(cameraId) {
  const cam = DB.cameras.find((c) => c.id === cameraId);
  const svg = sceneSvg(
    cam?.scene || "living",
    cam?.name || cameraId,
    new Date().toLocaleTimeString("zh-CN", { hour12: false }),
    !!(cam && cam.height > cam.width),
  );
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

export function installMock(api) {
  api.mock = async (path, opts = {}) => {
    const method = (opts.method || "GET").toUpperCase();
    const { path: p, query } = parse(path);
    const body = opts.json || {};

    if (p === "/api/setup/status") return { phase: "complete", database: "sqlite" };
    if (p === "/api/auth/setup-status") return { needs_setup: false };
    if (p === "/api/license/status") return DB.license;
    if (p === "/api/license/fingerprint") return { machine_id_hash: "yk-ov-preview-9f2a" };
    if (p === "/api/auth/login") {
      if (body.username && body.password) return { access_token: "demo-token" };
      throw Object.assign(new Error("用户名或密码错误"), { status: 401 });
    }
    if (p === "/api/auth/logout") return {};
    if (p === "/api/me" || p === "/api/auth/me") return DB.me;
    if (p === "/api/cameras" && method === "GET") return { cameras: DB.cameras };
    if (p === "/api/cameras" && method === "POST") {
      const id = "cam-" + (DB.cameras.length + 1);
      const cam = { id, name: body.name || "新相机", vendor: body.vendor || "onvif", online: true, has_ptz: false, detection_enabled: !!body.detection_enabled, record_mode: "event", scene: "studio" };
      DB.cameras.push(cam);
      return cam;
    }
    {
      const m = match(p, "/api/cameras/{id}");
      if (m && method === "GET") return DB.cameras.find((c) => c.id === m.id) || {};
      if (m && method === "PUT") {
        const c = DB.cameras.find((x) => x.id === m.id);
        if (c) Object.assign(c, body);
        return c;
      }
      if (m && method === "DELETE") {
        DB.cameras = DB.cameras.filter((x) => x.id !== m.id);
        return {};
      }
    }
    if (p.includes("/snapshot") && p.startsWith("/api/cameras/")) {
      const id = decodeURIComponent(p.split("/")[3] || "");
      const cam = DB.cameras.find((c) => c.id === id);
      const svg = sceneSvg(cam?.scene || "living", cam?.name || id, new Date().toLocaleTimeString("zh-CN", { hour12: false }), !!(cam && cam.height > cam.width));
      return { blob: svgBlob(svg), stale: false };
    }
    {
      const m = match(p, "/api/cameras/{id}/live-grant");
      if (m) return {
        token: "demo",
        live: { app: "live", stream: m.id },
        detect: { app: "detect", stream: m.id + "_sub" },
        aac_variant: { app: "live", stream: m.id + "_aac", token: "demo" },
      };
    }
    {
      const m = match(p, "/api/cameras/{id}/live-replay");
      if (m) {
        const ts = Number(query.ts || 0);
        if (ts && now - ts < 90 * 1000) return { mode: "hls_live", seconds_behind_live: 8, live: { hls_url: "", stream: m.id } };
        return { mode: "recording" };
      }
    }
    {
      const m = match(p, "/api/cameras/{id}/timeline");
      if (m) {
        return {
          segments: DB.segments.map(withEnd),
          events: DB.events.filter((e) => !m.id || e.camera_id === m.id),
        };
      }
    }
    {
      const m = match(p, "/api/cameras/{id}/presets");
      if (m) return { items: DB.presets[m.id] || [] };
    }
    {
      const m = match(p, "/api/cameras/{id}/light");
      if (m) return { state: "auto" };
    }
    {
      const m = match(p, "/api/cameras/{id}/talkback");
      if (m) return { active: false };
    }
    {
      const m = match(p, "/api/cameras/{id}/ptz") || match(p, "/api/cameras/{id}/ptz/stop");
      if (m) return {};
    }

    if (p === "/api/tripwires") return { tripwires: DB.tripwires };
    {
      const m = match(p, "/api/cameras/{id}/tripwires");
      if (m) return { tripwires: DB.tripwires.filter((t) => t.camera_id === m.id) };
    }
    if (p === "/api/events") {
      let list = DB.events.slice();
      if (query.type) list = list.filter((e) => e.type === query.type);
      if (query.camera) list = list.filter((e) => e.camera_id === query.camera);
      if (query.q) list = list.filter((e) => (e.summary || "").includes(query.q));
      return { items: list };
    }
    if (p === "/api/events/unread-count") return { count: DB.events.filter((e) => e.unread || e.is_read === false).length };
    if (p === "/api/events/recent") {
      const list = DB.events.filter((e) => !query.camera || e.camera_id === query.camera);
      return { items: list.slice(0, Number(query.limit || 5)) };
    }
    if (p === "/api/events/read-all" && method === "POST") {
      DB.events.forEach((e) => { e.unread = false; });
      return {};
    }
    if (p.startsWith("/api/events/snapshot/") || p === "/api/events/snapshot") {
      const id = query.event_id || p.split("/").pop();
      const ev = DB.events.find((e) => e.id === id);
      const cam = DB.cameras.find((c) => c.id === ev?.camera_id);
      const scene = CAM_SCENE[ev?.camera_id] || "living";
      const portrait = !!(cam && cam.height > cam.width);
      let svg = sceneSvg(scene, ev?.summary || "事件", "", portrait);
      if (query.annotate === "1" && ev?.extra?.detections) {
        const boxes = ev.extra.detections.map((d) => {
          const [x, y, w, h] = d.bbox;
          const W = portrait ? 160 : 260, H = portrait ? 260 : 160;
          return `<rect x="${x * W}" y="${y * H}" width="${w * W}" height="${h * H}" fill="none" stroke="#3ee0a0" stroke-width="3"/>
            <text x="${x * W}" y="${Math.max(12, y * H - 4)}" fill="#3ee0a0" font-size="11">${d.label || ""}</text>`;
        }).join("");
        svg = svg.replace("</svg>", `${boxes}</svg>`);
      }
      return { blob: svgBlob(svg), stale: false };
    }
    {
      const m = match(p, "/api/events/{id}/track");
      if (m) {
        const ev = DB.events.find((e) => e.id === m.id);
        if (!ev) throw Object.assign(new Error("not found"), { status: 404 });
        return mockTrack(ev);
      }
    }
    {
      const m = match(p, "/api/events/{id}/read");
      if (m) {
        const e = DB.events.find((x) => x.id === m.id);
        if (e) e.unread = false;
        return {};
      }
    }
    {
      const m = match(p, "/api/events/{id}/feedback");
      if (m) return {};
    }
    {
      const m = match(p, "/api/events/{id}");
      if (m && method === "GET") return DB.events.find((e) => e.id === m.id) || {};
      if (m && method === "DELETE") {
        DB.events = DB.events.filter((e) => e.id !== m.id);
        return {};
      }
    }

    if (p === "/api/recordings/segments") return { segments: DB.segments.map(withEnd) };
    if (p === "/api/recordings/dates") return { dates: [new Date().toISOString().slice(0, 10)] };
    {
      const m = match(p, "/api/recordings/{id}/url");
      if (m) return { url: "" };
    }

    if (p === "/api/people") return { people: DB.people };
    if (p === "/api/pets") return { pets: DB.pets };
    if (p === "/api/visits") return { visits: DB.visits };
    if (p.startsWith("/api/faces/samples/") || p.startsWith("/api/pets/samples/")) {
      const name = decodeURIComponent(p.split("/")[4] || "?");
      const letter = (DB.people.find((x) => x.id === name)?.name || DB.pets.find((x) => x.id === name)?.name || "?").slice(0, 1);
      const bg = LETTER_COLOR[letter] || "#1B6FE8";
      return { blob: svgBlob(avatarSvg(letter, bg)), stale: false };
    }
    {
      const m = match(p, "/api/people/{id}") || match(p, "/api/pets/{id}") || match(p, "/api/visits/{id}");
      if (m) {
        return (
          DB.people.find((x) => x.id === m.id) ||
          DB.pets.find((x) => x.id === m.id) ||
          DB.visits.find((x) => x.id === m.id) ||
          {}
        );
      }
    }

    if (p === "/api/detection/status") {
      return {
        cameras: DB.cameras.map((c) => ({
          id: c.id, name: c.name, detection_enabled: c.detection_enabled,
          status: c.detection_enabled ? "运行 · OpenVINO" : "关闭",
        })),
      };
    }
    {
      const m = match(p, "/api/detection/toggle/{id}");
      if (m) {
        const c = DB.cameras.find((x) => x.id === m.id);
        if (c) c.detection_enabled = !c.detection_enabled;
        return {};
      }
    }
    if (p === "/api/detection/pause-all") {
      DB.cameras.forEach((c) => { c.detection_enabled = false; });
      return {};
    }
    if (p === "/api/detection/resume-all") {
      DB.cameras.forEach((c) => { c.detection_enabled = true; });
      return {};
    }
    if (p === "/api/detection/inference-backends") {
      return { items: [{ id: "openvino", name: "OpenVINO", active: true }, { id: "cpu", name: "CPU", active: false }] };
    }
    if (p === "/api/automations") return { automations: DB.automations };
    {
      const m = match(p, "/api/automations/{id}");
      if (m && method === "PUT") {
        const a = DB.automations.find((x) => x.id === m.id);
        if (a) Object.assign(a, body);
        return a;
      }
      if (m && method === "POST") return {};
    }
    if (p === "/api/daily-digest") {
      return { date: new Date().toISOString().slice(0, 10), summary: "今日 8 条事件：人物 3、宠物 2、车辆 1、移动 2。门口访客 1 次，识别命中 陈晨、林夏。" };
    }
    if (p === "/api/daily-digest/generate") return {};

    if (p === "/api/training/jobs") return { jobs: DB.jobs };
    if (p === "/api/training/candidates") return { candidates: DB.events.slice(0, 4) };
    if (p === "/api/training/annotations/stats") return { labeled: 128, pending: 17 };
    if (p === "/api/tensorrt/models" || p === "/api/tensorrt/status") return { models: DB.models };
    if (p === "/api/system/vlm/models") {
      return { models: [{ name: "qwen2-vl-2b", installed: true, quant: "int4" }, { name: "internvl-mini", installed: false, quant: "int4" }] };
    }

    if (p === "/api/gb28181/devices") return { devices: DB.gb };
    if (p === "/api/gb28181/pending") return { channels: [] };
    if (p === "/api/gb28181/config") return { sip_id: "34020000002000000001", sip_domain: "3402000000", port: 5060 };
    if (p === "/api/homekit/cameras") {
      return { cameras: DB.cameras.map((c) => ({ id: c.id, name: c.name, enabled: c.id === "cam-1" })) };
    }

    if (p === "/api/users" && method === "POST") {
      DB.users.push({ id: Date.now(), username: body.username, display_name: body.username, role: body.role || "viewer", is_active: true });
      return {};
    }
    if (p === "/api/users") return { users: DB.users };
    if (p === "/api/storage/space") return { used_bytes: 186 * 1024 ** 3, free_bytes: 812 * 1024 ** 3, total: 1024 * 1024 ** 3 };
    if (p === "/api/system/status") return { mode: "normal", inference: "OpenVINO", decode: "VAAPI", database: "sqlite" };
    if (p === "/api/system/metrics") return {
      cpu_pct: 18, rss_mb: 1240,
      processes: {
        detection: { infer_ms: 12.4, decode_ms: 6.8, infer_latency_ms: 12.4 },
      },
      gpu: "iGPU · OpenVINO",
    };
    if (p === "/api/system/self-check") return {
      findings: [{ level: "warn", code: "decode_fallback", message: "楼道相机解码回落到软件" }],
      metrics_available: true, inference_ep: "OpenVINO",
    };
    if (p === "/api/system/services") {
      return { supervisor: "compose", services: [
        { name: "api", status: "up" }, { name: "detection", status: "up" },
        { name: "automation", status: "up" }, { name: "faces", status: "up" },
      ]};
    }
    if (p === "/api/system/version") return { version: "0.1.0-openvino", latest: "0.1.0-openvino" };
    if (p === "/api/admin/overview") return { cameras: DB.cameras.length, events_today: 8, people: 3, pets: 2 };
    if (p === "/api/cloud115/account") return { logged_in: false };
    if (p === "/api/system/acme/status") return { active: false, days_left: null };
    if (p === "/api/logs/services") return { services: ["api", "detection", "automation"] };
    if (p.startsWith("/api/logs/")) return { lines: ["[10:02:11] detection using OpenVINO GPU", "[10:02:14] event person cam-2"] };

    if (method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE") return {};
    return {};
  };
}
