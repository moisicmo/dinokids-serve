#!/bin/sh

# Esperar a que la base de datos esté lista (opcional: instalar wait-for-it o usar sleep)
echo "Esperando la base de datos..."
sleep 5

echo "Generando cliente Prisma..."
yarn prisma generate

echo "Aplicando migraciones..."
yarn prisma migrate dev

echo "Ejecutando seed..."
yarn prisma db seed

echo "Iniciando NestJS en modo desarrollo..."
yarn start:dev
