import { PrismaClient } from '@prisma/client';

// -- Actualiza automáticamente el remaining_balance de la deuda
// -- restando el monto de cada nuevo pago registrado.

export async function createUpdateRemainingBalanceTrigger(prisma: PrismaClient) {
  // Crear la función
  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION update_debt_remaining_balance()
    RETURNS TRIGGER AS $$
    BEGIN
        UPDATE "debts"
        SET "remaining_balance" = "remaining_balance" - NEW."amount"
        WHERE "id" = NEW."debt_id";
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Eliminar trigger si existe
  await prisma.$executeRawUnsafe(`
    DROP TRIGGER IF EXISTS after_insert_payment ON "payments";
  `);

  // Crear el trigger
  await prisma.$executeRawUnsafe(`
    CREATE TRIGGER after_insert_payment
    AFTER INSERT ON "payments"
    FOR EACH ROW
    EXECUTE FUNCTION update_debt_remaining_balance();
  `);
}
