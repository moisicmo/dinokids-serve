import { PrismaClient } from '@prisma/client';

// -- Crea automáticamente una deuda, una factura y un pago asociado
// -- cuando se registra un nuevo dato con booking_id y sin student_id.

export async function createDebtOnBookingTrigger(prisma: PrismaClient) {

  await prisma.$executeRawUnsafe(`
  CREATE OR REPLACE FUNCTION create_debts_on_booking()
  RETURNS TRIGGER AS $$
  DECLARE
      booking RECORD;
      debt_id UUID;
      invoice_id UUID;
  BEGIN
      IF NEW."booking_id" IS NOT NULL AND NEW."student_id" IS NULL THEN
          -- Buscar el booking 
          SELECT * INTO booking
          FROM "bookings" b
          WHERE b.id = NEW."booking_id";

          -- Crear el debt asociado a la inscripción
          INSERT INTO "debts" ("inscription_id", "total_amount", "remaining_balance", "type")
          VALUES (
              NEW.id,
              booking.amount,
              booking.amount,
              'BOOKING'
          )
          RETURNING id INTO debt_id;

          -- Crear el invoice
          INSERT INTO "invoices" ("code", "staff_id", "buyer_nit", "buyer_name")
          VALUES (
              substring(gen_random_uuid()::text from 1 for 64),
              NEW."staff_id",
              booking.dni,
              booking.name
          )
          RETURNING id INTO invoice_id;

          -- Crear el Payment asociado a debts y invoices
          INSERT INTO "payments" ("debt_id", "invoice_id", "reference", "amount")
          VALUES (
              debt_id,
              invoice_id,
              'PAGO AUTOMATICO',
              booking.amount
          );
      END IF;

      RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
  `);

  // Eliminar trigger si existe
  await prisma.$executeRawUnsafe(`
    DROP TRIGGER IF EXISTS trigger_create_debts_on_booking ON "inscriptions";
  `);

  // Crear el trigger
  await prisma.$executeRawUnsafe(`
    CREATE TRIGGER trigger_create_debts_on_booking
    AFTER INSERT ON "inscriptions"
    FOR EACH ROW
    EXECUTE FUNCTION create_debts_on_booking();
  `);
}
