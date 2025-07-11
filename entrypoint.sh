#!/bin/sh

set -e  # Detener si falla algo

echo "Iniciando NestJS en modo producción..."
yarn start:prod
