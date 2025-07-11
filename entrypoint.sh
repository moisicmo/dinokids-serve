#!/bin/sh

set -e

echo "Compilando NestJS..."
yarn build

echo "Iniciando NestJS en modo producción..."
yarn start:prod
