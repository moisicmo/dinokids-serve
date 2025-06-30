import { PrismaClient } from '@prisma/client';

export async function createInscriptionTypeTrigger(prisma: PrismaClient) {
  // Crear la función
  await prisma.$executeRawUnsafe(`
  CREATE OR REPLACE FUNCTION validate_and_set_inscription_type() 
  RETURNS TRIGGER AS $$
  BEGIN
    IF NEW."student_id" IS NULL AND NEW."booking_id" IS NULL THEN
      RAISE EXCEPTION 'Both student_id and booking_id cannot be null';
    END IF;

    IF NEW."student_id" IS NOT NULL THEN
      NEW."inscription_type" := 'STUDENTS';
    ELSIF NEW."booking_id" IS NOT NULL THEN
      NEW."inscription_type" := 'BOOKINGS';
    END IF;

    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
  `);

  // Eliminar trigger si existe
  await prisma.$executeRawUnsafe(`
    DROP TRIGGER IF EXISTS before_insert_inscription ON "inscriptions";
  `);

  // Crear el trigger
  await prisma.$executeRawUnsafe(`
    CREATE TRIGGER before_insert_inscription
    BEFORE INSERT ON "inscriptions"
    FOR EACH ROW
    EXECUTE FUNCTION validate_and_set_inscription_type();
  `);
}
