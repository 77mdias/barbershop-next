#!/bin/sh
set -e

# Instala as dependências do Tailwind CSS se não existirem
if [ ! -d "/app/node_modules/autoprefixer" ] || [ ! -d "/app/node_modules/tailwindcss" ]; then
  echo "Instalando dependências do Tailwind CSS..."
  npm install autoprefixer postcss tailwindcss --save-dev
fi

# Executa o comando passado para o script
exec "$@"