# A minimal Kali-based toolbox. Adjust the package list for your engagement needs.
# Build:
#   docker build -t rt-ai-agent-kali:latest -f agent/docker/kali-redteam/Dockerfile .
#
# Note: this image is for AUTHORIZED engagements only. The packages here are standard
# pentest tooling; their misuse is illegal in most jurisdictions.

FROM kalilinux/kali-rolling:latest

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl jq sqlite3 git python3 python3-pip \
    nmap ffuf nuclei httpx-toolkit subfinder amass \
    whatweb dnsutils whois \
    seclists \
    && rm -rf /var/lib/apt/lists/*

# Sub-user for tools that complain about running as root.
RUN useradd -m -s /bin/bash operator
WORKDIR /work
USER operator

CMD ["bash"]
