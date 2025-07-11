#!/bin/sh

echo "Esperando la base de datos..."
sleep 5

echo "Generando cliente Prisma..."
yarn prisma generate

echo "Aplicando migraciones..."
yarn prisma migrate deploy

echo "Ejecutando seed..."
yarn prisma db seed

echo "Iniciando NestJS en modo producción..."
yarn start:prod
