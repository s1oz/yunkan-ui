FROM python:3.12-alpine

WORKDIR /app

COPY serve.py /app/serve.py
COPY public /app/public

ENV TZ=Asia/Shanghai \
    HOST=0.0.0.0 \
    PORT=18081 \
    YUNKAN_API=http://127.0.0.1:23326 \
    YUNKAN_MEDIA=http://127.0.0.1:23406 \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

EXPOSE 18081

LABEL net.unraid.docker.webui="http://[IP]:[PORT:18081]/" \
      net.unraid.docker.icon="https://raw.githubusercontent.com/s1oz/yunkan-ui/main/unraid-icon.png" \
      net.unraid.docker.shell="sh" \
      org.opencontainers.image.title="YunKan-UI" \
      org.opencontainers.image.description="Unofficial YunKan / SkyView web workbench" \
      org.opencontainers.image.source="https://github.com/s1oz/yunkan-ui" \
      org.opencontainers.image.licenses="MIT"

HEALTHCHECK --interval=30s --timeout=5s --start-period=8s --retries=3 \
  CMD python3 -c "import os,urllib.request; urllib.request.urlopen('http://127.0.0.1:%s/'%os.environ.get('PORT','18081'), timeout=4)"

CMD ["python3", "serve.py", "--host", "0.0.0.0"]
