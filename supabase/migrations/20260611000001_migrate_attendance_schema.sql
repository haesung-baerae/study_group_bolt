-- Migrate legacy attendance_records schema (date + present_ids) to per-member rows
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'attendance_records'
      AND column_name = 'present_ids'
  ) THEN
    CREATE TABLE attendance_records_new (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      date date NOT NULL,
      user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      status text NOT NULL CHECK (status IN ('출석', '결석')),
      UNIQUE (date, user_id)
    );

    INSERT INTO attendance_records_new (date, user_id, status)
    SELECT ar.date, user_id, '출석'
    FROM attendance_records ar
    CROSS JOIN LATERAL unnest(ar.present_ids) AS user_id;

    DROP TABLE attendance_records;
    ALTER TABLE attendance_records_new RENAME TO attendance_records;

    ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "attendance_select" ON attendance_records;
    CREATE POLICY "attendance_select" ON attendance_records FOR SELECT
      TO authenticated USING (true);

    DROP POLICY IF EXISTS "attendance_insert_admin" ON attendance_records;
    CREATE POLICY "attendance_insert_admin" ON attendance_records FOR INSERT
      TO authenticated
      WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

    DROP POLICY IF EXISTS "attendance_update_admin" ON attendance_records;
    CREATE POLICY "attendance_update_admin" ON attendance_records FOR UPDATE
      TO authenticated
      USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
      WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
  END IF;
END $$;
