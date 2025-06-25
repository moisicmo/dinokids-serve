import { PrismaClient } from '@prisma/client';

export async function createKardexOutputTrigger(prisma: PrismaClient) {
  // Crear la función
  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION register_kardex_on_output()
    RETURNS TRIGGER AS $$
    DECLARE
      last_stock INT := 0;
    BEGIN
      -- Obtener el último stock de la presentación
      SELECT COALESCE((
        SELECT "stock"
        FROM "kardexs"
        WHERE "product_presentation_id" = NEW."product_presentation_id"
          AND "branch_id" = NEW."branch_id"
        ORDER BY "created_at" DESC
        LIMIT 1
      ), 0) INTO last_stock;

      -- Insertar nuevo registro en kardex restando la cantidad
      INSERT INTO "kardexs" (
        "branch_id", "product_presentation_id", "reference_id", "type_reference", "stock"
      )
      VALUES (
        NEW."branch_id",
        NEW."product_presentation_id",
        NEW."id",
        'outputs',
        last_stock - NEW."quantity"
      );

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Eliminar trigger si existe
  await prisma.$executeRawUnsafe(`
    DROP TRIGGER IF EXISTS trigger_kardex_output ON "outputs";
  `);

  // Crear el trigger
  await prisma.$executeRawUnsafe(`
    CREATE TRIGGER trigger_kardex_output
    AFTER INSERT ON "outputs"
    FOR EACH ROW
    EXECUTE FUNCTION register_kardex_on_output();
  `);
}
