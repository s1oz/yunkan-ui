/** YunKan-OpenVINO — optional add-on catalog. */

export const SLOGAN = "OpenVINO 加速，云瞰每一帧";
export const PRODUCT = "YunKan-OpenVINO";
export const STORE_KEY = "yunkan.addons";
export const PRESET_KEY = "yunkan.preset";
export const FIRST_KEY = "yunkan.firstRun";

export const GROUPS = {
  core: { name: "核心", hint: "监控日常必用" },
  intel: { name: "智能", hint: "识别、规则与模型" },
  extra: { name: "扩展", hint: "协议与平台接入" },
};

export const CATALOG = [
  {
    id: "live",
    name: "画面墙",
    icon: "cam",
    group: "core",
    defaultOn: true,
    apis: 33,
    blurb: "工作台多路直播、主/子码流、静音、云台、对讲与补光。",
    features: [
      { id: "hls", name: "HLS 直播（主/子码流）", defaultOn: true, cover: "ready" },
      { id: "mute", name: "静音记忆", defaultOn: true, cover: "ready" },
      { id: "birdseye", name: "鸟瞰拼接", defaultOn: false, cover: "api" },
      { id: "ptz", name: "云台与预置位", defaultOn: true, cover: "partial" },
      { id: "talkback", name: "语音对讲 / TTS", defaultOn: false, cover: "partial" },
      { id: "light", name: "补光灯", defaultOn: true, cover: "ready" },
      { id: "discover", name: "局域网发现", defaultOn: true, cover: "partial" },
    ],
  },
  {
    id: "events",
    name: "事件中心",
    icon: "bolt",
    group: "core",
    defaultOn: true,
    apis: 19,
    blurb: "检测事件、带框快照、运动轨迹、已读、反馈与跳转回放。",
    features: [
      { id: "sse", name: "实时推送", defaultOn: true, cover: "partial" },
      { id: "boxes", name: "检测框 annotate", defaultOn: true, cover: "ready" },
      { id: "tracks", name: "运动轨迹", defaultOn: true, cover: "ready" },
      { id: "feedback", name: "正误反馈", defaultOn: true, cover: "ready" },
      { id: "export", name: "快照导出", defaultOn: true, cover: "partial" },
      { id: "clips", name: "事件短片", defaultOn: false, cover: "api" },
    ],
  },
  {
    id: "replay",
    name: "录像回放",
    icon: "clock",
    group: "core",
    defaultOn: true,
    apis: 24,
    blurb: "跨天时间轴、分段对齐、页内实时、导出与延时摄影。",
    features: [
      { id: "timeline", name: "跨天时间轴", defaultOn: true, cover: "ready" },
      { id: "live", name: "页内切到实时", defaultOn: true, cover: "ready" },
      { id: "export", name: "录像导出", defaultOn: true, cover: "partial" },
      { id: "timelapse", name: "延时摄影", defaultOn: false, cover: "api" },
      { id: "gbplay", name: "国标回放", defaultOn: false, cover: "api" },
    ],
  },
  {
    id: "identities",
    name: "对象档案",
    icon: "user",
    group: "intel",
    defaultOn: false,
    apis: 60,
    blurb: "人物库、人脸样本、访客时间线，以及宠物档案。",
    features: [
      { id: "people", name: "人物 / 人脸", defaultOn: true, cover: "partial" },
      { id: "visits", name: "访客记录", defaultOn: true, cover: "partial" },
      { id: "pets", name: "宠物档案", defaultOn: true, cover: "partial" },
      { id: "petzones", name: "宠物区域与摘要", defaultOn: false, cover: "api" },
    ],
  },
  {
    id: "training",
    name: "模型工坊",
    icon: "chip",
    group: "intel",
    defaultOn: false,
    apis: 27,
    blurb: "样本标注、本地/云端训练、OpenVINO 引擎与 VLM 导入。",
    features: [
      { id: "label", name: "标注与训练任务", defaultOn: true, cover: "partial" },
      { id: "tensorrt", name: "OpenVINO / TensorRT 引擎", defaultOn: true, cover: "partial" },
      { id: "vlm", name: "VLM 视觉模型", defaultOn: false, cover: "api" },
    ],
  },
  {
    id: "integrations",
    name: "协议接入",
    icon: "plug",
    group: "extra",
    defaultOn: false,
    apis: 16,
    blurb: "国标 GB28181 平台接入与回放，HomeKit 相机共享。",
    features: [
      { id: "gb28181", name: "GB28181 国标", defaultOn: true, cover: "partial" },
      { id: "homekit", name: "HomeKit", defaultOn: false, cover: "api" },
    ],
  },
  {
    id: "system",
    name: "系统管理",
    icon: "gear",
    group: "core",
    defaultOn: true,
    apis: 87,
    blurb: "总览、相机、用户、存储、许可、115 云盘、日志、证书与升级。检测开关也在这里。",
    features: [
      { id: "cameras", name: "相机管理 / 检测开关", defaultOn: true, cover: "ready" },
      { id: "users", name: "多用户与 ACL", defaultOn: true, cover: "partial" },
      { id: "storage", name: "存储与清理", defaultOn: true, cover: "partial" },
      { id: "cloud115", name: "115 云盘", defaultOn: false, cover: "api" },
      { id: "logs", name: "服务日志 / 自检", defaultOn: true, cover: "ready" },
      { id: "acme", name: "HTTPS 证书", defaultOn: false, cover: "api" },
      { id: "upgrade", name: "系统升级", defaultOn: true, cover: "api" },
      { id: "license", name: "许可", defaultOn: true, cover: "ready" },
    ],
  },
];

export const PRESETS = [
  {
    id: "home",
    name: "家庭",
    desc: "画面 + 事件 + 回放 + 人物宠物",
    modules: ["live", "events", "replay", "identities", "system"],
  },
  {
    id: "studio",
    name: "工作室",
    desc: "监控与录像，少打扰",
    modules: ["live", "events", "replay", "system"],
  },
  {
    id: "full",
    name: "全功能",
    desc: "加载全部能力",
    modules: CATALOG.map((m) => m.id),
  },
  {
    id: "minimal",
    name: "精简",
    desc: "只要画面和事件",
    modules: ["live", "events"],
  },
];

function defaultState() {
  const mods = {};
  for (const m of CATALOG) {
    const feats = {};
    for (const f of m.features) feats[f.id] = !!f.defaultOn;
    mods[m.id] = { on: !!m.defaultOn, features: feats };
  }
  return mods;
}

export function loadAddons() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
    if (!raw || typeof raw !== "object") return defaultState();
    const base = defaultState();
    for (const m of CATALOG) {
      if (raw[m.id]) {
        base[m.id].on = !!raw[m.id].on;
        const feats = raw[m.id].features || {};
        for (const f of m.features) {
          if (f.id in feats) base[m.id].features[f.id] = !!feats[f.id];
        }
      }
    }
    return base;
  } catch {
    return defaultState();
  }
}

export function saveAddons(state) {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

export function applyPreset(id) {
  const p = PRESETS.find((x) => x.id === id);
  if (!p) return loadAddons();
  const state = defaultState();
  const set = new Set(p.modules);
  for (const m of CATALOG) {
    state[m.id].on = set.has(m.id);
    if (id === "full") {
      for (const f of m.features) state[m.id].features[f.id] = true;
    }
  }
  saveAddons(state);
  localStorage.setItem(PRESET_KEY, id);
  return state;
}

export function isOn(state, mod, feat) {
  const m = state[mod];
  if (!m || !m.on) return false;
  if (!feat) return true;
  return !!m.features[feat];
}

export function enabledNav(state) {
  return CATALOG.filter((m) => state[m.id]?.on);
}

export function moduleById(id) {
  return CATALOG.find((m) => m.id === id);
}

export function countEnabled(state) {
  return CATALOG.filter((m) => state[m.id]?.on).length;
}

export const COVER_LABEL = {
  ready: "已复刻",
  partial: "部分复刻",
  api: "仅接口",
};
