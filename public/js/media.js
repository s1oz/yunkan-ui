/** Shared HLS player, volume, and element fullscreen helpers. */

export const players = new Map();

let volumeOf = () => 1;
export function setMediaVolumeGetter(fn) {
  volumeOf = typeof fn === "function" ? fn : () => 1;
}
export function mediaVolume() {
  const v = Number(volumeOf());
  return Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 1;
}

export function stopPlayer(key) {
  const p = players.get(key);
  if (!p) return;
  try { p.hls?.destroy(); } catch {}
  try { p.video.pause(); p.video.removeAttribute("src"); p.video.load(); } catch {}
  players.delete(key);
}

export function stopAllPlayers() {
  for (const key of [...players.keys()]) stopPlayer(key);
}

export function playMedia(el, wantSound) {
  if (!el) return;
  el.volume = mediaVolume();
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
      if (el.closest?.("#home-keep") && !document.body.classList.contains("yk-home")) return;
      el.muted = false;
      el.volume = mediaVolume();
      el.play().then(() => window.removeEventListener("pointerdown", unmute)).catch(() => {
        el.muted = true;
        el.play().catch(() => {});
      });
    };
    window.addEventListener("pointerdown", unmute, { once: true });
  });
}

export function applyMediaVolume(root = document) {
  const v = mediaVolume();
  root.querySelectorAll?.("video, audio")?.forEach((el) => { el.volume = v; });
  root.querySelectorAll?.("[data-act=vol]")?.forEach((el) => {
    const n = String(Math.round(v * 100));
    if (el.value !== n) el.value = n;
    const lab = el.closest?.(".vol-ctl");
    if (lab) lab.title = `音量 ${n}%`;
  });
}

export function attachHls(video, url, key, muted = true, extra = {}) {
  stopPlayer(key);
  if (!url || !video) return false;
  video.muted = muted;
  video.autoplay = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  video.setAttribute("autoplay", "");
  video.volume = mediaVolume();
  const behind = Number(extra.secondsBehind || 0);
  const onPlay = extra.onPlay || (() => {});
  const onFail = extra.onFail || (() => {});
  const needVideo = extra.needVideo !== false;
  const rec = { hls: null, video, url, live: !behind, source: extra.source || "" };
  if (window.Hls && window.Hls.isSupported()) {
    const live = !behind;
    const hls = new window.Hls({
      enableWorker: true,
      lowLatencyMode: live,
      liveSyncDuration: live ? 2 : Math.max(1, behind),
      liveMaxLatencyDuration: live ? 8 : undefined,
      maxLiveSyncPlaybackRate: live ? 1.8 : 1,
      maxBufferLength: live ? 8 : 30,
      maxMaxBufferLength: live ? 16 : 60,
      backBufferLength: live ? 8 : 30,
      maxBufferSize: live ? 6 * 1000 * 1000 : 30 * 1000 * 1000,
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
    rec.hls = hls;
    players.set(key, rec);
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
    players.set(key, rec);
    return true;
  }
  return false;
}

export function catchUpLive(p) {
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

export function fsElement() {
  return document.fullscreenElement || document.webkitFullscreenElement || null;
}

export async function requestFs(el) {
  if (!el) return false;
  const req = el.requestFullscreen || el.webkitRequestFullscreen;
  if (!req) return false;
  await req.call(el);
  return true;
}

export async function exitFs() {
  const fn = document.exitFullscreen || document.webkitExitFullscreen;
  if (!fn || !fsElement()) return false;
  await fn.call(document);
  return true;
}

export async function toggleFs(el) {
  if (!el) return false;
  const cur = fsElement();
  if (cur === el) return exitFs();
  if (cur) await exitFs();
  return requestFs(el);
}
