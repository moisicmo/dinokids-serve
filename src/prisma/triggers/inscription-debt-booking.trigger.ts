import { PrismaClient } from '@prisma/client';

export async function createDebtOnBookingTrigger(prisma: PrismaClient) {
  console.log('⚙️ Creando trigger create_debts_on_booking...');

  // 1️⃣ Eliminar trigger previo
  await prisma.$executeRawUnsafe(`
    DROP TRIGGER IF EXISTS trigger_create_debts_on_booking ON "inscriptions";
  `);

  // 2️⃣ Eliminar función previa
  await prisma.$executeRawUnsafe(`
    DROP FUNCTION IF EXISTS create_debts_on_booking();
  `);

  // 3️⃣ Crear función
  await prisma.$executeRawUnsafe(`
    CREATE OR REPLACE FUNCTION create_debts_on_booking()
    RETURNS TRIGGER AS $$
    DECLARE
        booking RECORD;
        debt_id UUID;
        invoice_id UUID;
    BEGIN
        IF NEW.booking_id IS NOT NULL AND NEW.student_id IS NULL THEN
            -- Buscar el booking
            SELECT * INTO booking FROM "bookings" WHERE id = NEW.booking_id;

            IF NOT FOUND THEN
                RAISE NOTICE 'Booking no encontrado para id=%', NEW.booking_id;
                RETURN NEW;
            END IF;

            -- Crear la deuda
            INSERT INTO "debts" (
                inscription_id, total_amount, remaining_balance, type, created_by_id
            ) VALUES (
                NEW.id, booking.amount, booking.amount, 'BOOKING', NEW.created_by_id
            )
            RETURNING id INTO debt_id;

            -- Crear la factura
            INSERT INTO "invoices" (
                code, staff_id, buyer_nit, buyer_name, created_by_id
            ) VALUES (
                substring(gen_random_uuid()::text from 1 for 16),
                NEW.created_by_id,
                booking.dni,
                booking.name,
                NEW.created_by_id
            )
            RETURNING id INTO invoice_id;

            -- Crear el pago
            INSERT INTO "payments" (
                debt_id, invoice_id, reference, amount, created_by_id
            ) VALUES (
                debt_id, invoice_id, 'PAGO AUTOMATICO', booking.amount, NEW.created_by_id
            );
        END IF;

        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // 4️⃣ Crear trigger
  await prisma.$executeRawUnsafe(`
    CREATE TRIGGER trigger_create_debts_on_booking
    AFTER INSERT ON "inscriptions"
    FOR EACH ROW
    EXECUTE FUNCTION create_debts_on_booking();
  `);

  console.log('✅ Trigger create_debts_on_booking creado correctamente');
}
