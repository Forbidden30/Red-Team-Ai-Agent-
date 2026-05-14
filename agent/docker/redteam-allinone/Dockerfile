# All-in-one image — orchestrator + kali toolbox + Anthropic SDK.
# Build:
#   docker build -t rt-ai-agent-allinone:latest -f agent/docker/redteam-allinone/Dockerfile .
# Run:
#   docker run --rm -it -e ANTHROPIC_API_KEY=... -p 3000:3000 rt-ai-agent-allinone:latest
#
# This is the simplest path for users who don't want to manage Node + tooling locally.

FROM kalilinux/kali-rolling:latest

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl jq sqlite3 git \
    python3 python3-pip \
    nodejs npm \
    nmap ffuf nuclei httpx-toolkit subfinder amass \
    whatweb dnsutils \
    seclists \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY orchestrator /app/orchestrator
COPY agent /app/agent

WORKDIR /app/orchestrator
RUN npm install --omit=dev && npm run build

EXPOSE 3000
ENV NODE_ENV=production

CMD ["npm", "start"]
