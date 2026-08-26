# YunKan-OpenVINO UI

**An alternative web workbench for [YunKan](https://github.com/mrtian2016/yunkan) — mosaic live view, AI events, and timeline playback. OpenVINO on the box, one page in the browser.**

[简体中文](./README.zh-CN.md) · Official product: [mrtian2016/yunkan](https://github.com/mrtian2016/yunkan) · [yun-kan.com](https://yun-kan.com/en)

---

This is a **rewritten web UI**, not a reskin of the stock admin. It talks to the same local YunKan / SkyView API that the official Docker image already exposes. Video and inference stay on your machine.

> Unofficial. Not affiliated with or endorsed by the YunKan authors. YunKan itself is commercial, closed-source, licensed per household.

Slogan: **OpenVINO 加速，云瞰每一帧**.

## Screenshots

Demo data only — no real cameras, no LAN addresses.

| Live mosaic | AI event center |
| :---: | :---: |
| ![Live](./docs/screenshots/live.png) | ![Events](./docs/screenshots/events.png) |
| **Playback timeline** | **Add-ons** |
| ![Replay](./docs/screenshots/replay.png) | ![Add-ons](./docs/screenshots/addons.png) |
| **Day theme** | **Phone** |
| ![Day](./docs/screenshots/live-day.png) | ![Mobile](./docs/screenshots/live-mobile.png) |

Login / preview: ![Login](./docs/screenshots/login.png)

## What you get

- 🖥️ **Free-form mosaic** — drag, resize, mix portrait and landscape tiles. Click a tile to hear that camera only.
- 🔊 **Live audio that browsers can play** — picture from `live` / `detect` HLS, sound from the AAC variant. Main stream falls back to sub if H.265 will not decode.
- ⚡ **Event rail** — camera + home/away, type + confidence, relative and wall-clock time. Collapse the rail when you want the wall full-bleed.
- 🎯 **Event center** — annotated snapshot, boxes, track path, wheel zoom and pan, jump to playback.
- 📼 **Timeline replay** — segments, events, speed, in-page live. Filter the right-hand list by **All** or one camera.
- 🧩 **Add-ons** — turn capabilities on only when you need them (identities, training, GB28181, HomeKit, …).
- 🌙 **Day / night** — one header button.
- ⚙️ **Official settings** — the gear opens the stock YunKan admin on the **same hostname**, port `23406` (not a hardcoded IP).

## Requirements

- A running **YunKan** (SkyView) instance. The UI does not record, detect, or store video itself.
- Python 3.9+ (stdlib only — no pip packages to serve the UI).
- A Chromium or Firefox based browser with [hls.js](https://github.com/video-dev/hls.js/) (vendored).

Typical backend ports from the official image:

| Port | Role |
| --- | --- |
| `23326` | REST API |
| `23406` | Official web admin + HLS media |

## Run

Preview with mock cameras (no backend):

```bash
python3 serve.py --host 0.0.0.0 --port 18081
```

Open http://127.0.0.1:18081/ and click **预览完整界面**, or add `?demo=1`.

Talk to a real YunKan box:

```bash
python3 serve.py \
  --api   http://127.0.0.1:23326 \
  --media http://127.0.0.1:23406 \
  --host  0.0.0.0 \
  --port  18081
```

Or:

```bash
export YUNKAN_API=http://127.0.0.1:23326
export YUNKAN_MEDIA=http://127.0.0.1:23406
./start.sh
```

Log in with the same account you use in the official UI. The static host only reverse-proxies `/api/`, snapshots, and HLS — it does not keep your password.

## Jump to official settings

The header gear is **not** a baked-in IP. It opens:

```text
{current page protocol}//{current hostname}:23406/settings
```

If you browse this UI at `http://nas.local:18081/`, the gear goes to `http://nas.local:23406/settings`. Override anytime by setting `localStorage.yunkan.origUi` to a full URL.

## Layout

```text
public/          static UI (HTML / CSS / JS)
  js/vendor/     hls.js
serve.py         static files + same-origin proxy
start.sh         Unix helper
docs/screenshots README images (demo data)
```

`preview/` is a local capture dump and is not part of the published tree.

## Privacy

This repository contains:

- no LAN IPs
- no tokens or passwords
- no real camera frames (README shots use the built-in demo illustrator)

Do not commit `preview/` captures from a live NVR — those may include household footage.

## License

MIT for this UI. See [LICENSE](./LICENSE).

YunKan the product remains commercial and closed-source. Use this workbench only with a backend you are licensed to run.

---

*OpenVINO 加速，云瞰每一帧.*
