FROM mitmproxy/mitmproxy:latest

WORKDIR /work
COPY scripts/proxy_addon.py /addons/proxy_addon.py

ENTRYPOINT ["mitmweb", "--web-host", "0.0.0.0", "-s", "/addons/proxy_addon.py"]
