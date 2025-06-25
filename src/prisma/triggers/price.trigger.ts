// prisma/triggers/price-active.trigger.ts
import { PrismaClient } from '@prisma/client';

export async function createPriceActiveTrigger(prisma: PrismaClient) {
  // Crear la función
  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION set_previous_prices_inactive()
    RETURNS TRIGGER AS $$
    BEGIN
      UPDATE "prices"
      SET "active" = FALSE
      WHERE "product_presentation_id" = NEW."product_presentation_id"
        AND "active" = TRUE;

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Eliminar trigger si existe
  await prisma.$executeRawUnsafe(`
    DROP TRIGGER IF EXISTS trigger_set_previous_prices_inactive ON "prices";
  `);

  // Crear el trigger
  await prisma.$executeRawUnsafe(`
    CREATE TRIGGER trigger_set_previous_prices_inactive
    BEFORE INSERT ON "prices"
    FOR EACH ROW
    EXECUTE FUNCTION set_previous_prices_inactive();
  `);
}
