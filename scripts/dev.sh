#!/usr/bin/env sh

case "$1" in
  up)
    docker compose -f docker-compose.dev.yml up -d
    ;;
  down)
    docker compose -f docker-compose.dev.yml down
    ;;
  *)
    echo "Usage: $0 up|down"
    exit 1
    ;;
esac
