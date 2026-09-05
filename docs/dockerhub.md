# YunKan-UI

Unofficial web workbench for [YunKan](https://github.com/mrtian2016/yunkan) / SkyView: free-form live mosaic, AI events, timeline playback.

云瞰非官方 Web 工作台。不替换官方容器，只反向代理本机 API `23326` 和 HLS `23406`。

- **GitHub:** https://github.com/s1oz/yunkan-ui
- **Image:** `s1oz/yunkan-ui:latest` · also `ghcr.io/s1oz/yunkan-ui:latest`

> Unofficial. Not affiliated with the YunKan authors. YunKan itself is commercial, closed-source, licensed per household.

Slogan: **OpenVINO 加速，云瞰每一帧**

## Run (same machine as YunKan)

```bash
docker pull s1oz/yunkan-ui:latest
docker run -d --name YunKan-UI --network host --restart unless-stopped \
  -e YUNKAN_API=http://127.0.0.1:23326 \
  -e YUNKAN_MEDIA=http://127.0.0.1:23406 \
  -e PORT=18081 \
  s1oz/yunkan-ui:latest
```

Open `http://<host>:18081/`. Host networking is required so `127.0.0.1:23326` / `:23406` reach YunKan on the same box.

Login with the same account as the official UI, or add `?demo=1` for a mock preview.

## YunKan on another host

```bash
docker run -d --name YunKan-UI -p 18081:18081 --restart unless-stopped \
  -e YUNKAN_API=http://192.168.1.10:23326 \
  -e YUNKAN_MEDIA=http://192.168.1.10:23406 \
  s1oz/yunkan-ui:latest
```

Do **not** use `127.0.0.1` for `YUNKAN_*` on bridge networking.

## Environment

| Variable | Default | Role |
| --- | --- | --- |
| `YUNKAN_API` | `http://127.0.0.1:23326` | REST API |
| `YUNKAN_MEDIA` | `http://127.0.0.1:23406` | Stock admin + HLS |
| `PORT` | `18081` | Listen port |
| `TZ` | `Asia/Shanghai` | Timezone |

## Screenshots

Demo data only.

[Live mosaic](https://raw.githubusercontent.com/s1oz/yunkan-ui/main/docs/screenshots/live.png) ·
[Events](https://raw.githubusercontent.com/s1oz/yunkan-ui/main/docs/screenshots/events.png) ·
[Replay](https://raw.githubusercontent.com/s1oz/yunkan-ui/main/docs/screenshots/replay.png)

## License

MIT for this UI. YunKan backend is separate and commercial.
