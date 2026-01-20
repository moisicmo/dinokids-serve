import { prisma } from '@/lib/prisma';

// -- Crea automáticamente las deudas de inscripción y mensualidad
// -- al activar un registro, si dichas deudas aún no existen.

export async function createDebtTrigger() {
  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION create_debts_on_price()
    RETURNS TRIGGER AS $$
    DECLARE
        inscription_price NUMERIC;
        month_price NUMERIC;
        existing_debt RECORD;
        existing_month_debt RECORD;
    BEGIN
        IF NEW."active" = true THEN
            inscription_price := COALESCE(NEW."inscription_price", 0);
            month_price := COALESCE(NEW."month_price", 0);

            -- Verificar si existe deuda tipo INSCRIPTION
            SELECT 1 INTO existing_debt
            FROM "debts"
            WHERE "inscription_id" = NEW."inscription_id" AND "type" = 'INSCRIPTION';

            IF NOT FOUND THEN
                INSERT INTO "debts" ("inscription_id", "total_amount", "remaining_balance", "type", "created_by")
                VALUES (NEW."inscription_id", inscription_price, inscription_price, 'INSCRIPTION', NEW."created_by");
            END IF;

            -- Verificar si existe deuda tipo MONTH
            SELECT 1 INTO existing_month_debt
            FROM "debts"
            WHERE "inscription_id" = NEW."inscription_id" AND "type" = 'MONTH';

            IF NOT FOUND THEN
                INSERT INTO "debts" ("inscription_id", "total_amount", "remaining_balance", "type", "created_by")
                VALUES (NEW."inscription_id", month_price, month_price, 'MONTH', NEW."created_by");
            END IF;
        END IF;

        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Eliminar trigger si ya existe
  await prisma.$executeRawUnsafe(`
    DROP TRIGGER IF EXISTS trigger_create_payment_on_price ON "prices";
  `);

  // Crear el trigger
  await prisma.$executeRawUnsafe(`
    CREATE TRIGGER trigger_create_payment_on_price
    AFTER INSERT ON "prices"
    FOR EACH ROW
    EXECUTE FUNCTION create_debts_on_price();
  `);
}