#!/bin/bash

echo "🔍 Diagnosticando problemas Docker..."
echo ""

echo "1. Testando conectividade com Docker Hub:"
curl -s -I https://registry-1.docker.io/ | head -1 || echo "❌ Falha na conectividade"

echo ""
echo "2. Verificando configuração Docker:"
cat /etc/docker/daemon.json 2>/dev/null || echo "📄 Arquivo daemon.json não existe"

echo ""
echo "3. Testando DNS:"
nslookup registry-1.docker.io || echo "❌ Falha no DNS"

echo ""
echo "4. Verificando IPv6:"
ip -6 route show | head -3

echo ""
echo "5. Status do Docker:"
systemctl is-active docker

echo ""
echo "6. Testando proxy:"
echo "HTTP_PROXY: $HTTP_PROXY"
echo "HTTPS_PROXY: $HTTPS_PROXY"

echo ""
echo "7. Testando pull simples:"
timeout 10 docker pull hello-world:latest || echo "❌ Falha no pull"