#!/bin/sh

set -e  # Detener si falla algo

echo "Esperando la base de datos..."
sleep 5

echo "DATABASE_URL=${DATABASE_URL}"  # <-- Verificar si llega vacía

if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL está vacía. No se puede continuar."
  exit 1
fi

echo "Generando cliente Prisma..."
yarn prisma generate

echo "Aplicando migraciones..."
yarn prisma migrate deploy

echo "Ejecutando seed..."
yarn prisma db seed

echo "Iniciando NestJS en modo producción..."
yarn start:prod
