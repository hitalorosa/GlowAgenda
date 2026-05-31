-- ============================================================
-- Toque de Lírio by Natielle — Banco de Dados
-- Execute este script no SQL Editor do Supabase
-- ============================================================

-- Extensão para geração de bytes aleatórios
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ------------------------------------------------------------
-- Serviços oferecidos
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL
);

-- ------------------------------------------------------------
-- Dias de trabalho configuráveis pela Natielle
-- day_of_week: 0=Domingo, 1=Segunda, ..., 6=Sábado
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS working_days (
  day_of_week INTEGER PRIMARY KEY CHECK (day_of_week BETWEEN 0 AND 6),
  is_active BOOLEAN DEFAULT false,
  start_time TIME DEFAULT '16:00',
  end_time TIME DEFAULT '20:00'
);

-- ------------------------------------------------------------
-- Dias ou intervalos bloqueados pela profissional
-- start_time/end_time NULL = dia inteiro bloqueado
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS blocked_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocked_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- Agendamentos dos clientes
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  service_id UUID REFERENCES services(id),
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
  cancel_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date, status);

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE working_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Serviços: leitura pública, escrita apenas autenticado
CREATE POLICY "services_read" ON services FOR SELECT USING (true);
CREATE POLICY "services_write" ON services FOR ALL USING (auth.role() = 'authenticated');

-- Dias de trabalho: leitura pública, escrita apenas autenticado
CREATE POLICY "working_days_read" ON working_days FOR SELECT USING (true);
CREATE POLICY "working_days_write" ON working_days FOR ALL USING (auth.role() = 'authenticated');

-- Bloqueios: leitura pública, escrita apenas autenticado
CREATE POLICY "blocked_slots_read" ON blocked_slots FOR SELECT USING (true);
CREATE POLICY "blocked_slots_write" ON blocked_slots FOR ALL USING (auth.role() = 'authenticated');

-- Agendamentos: inserção anônima; leitura/edição por token ou autenticado
CREATE POLICY "bookings_insert" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "bookings_read_by_token" ON bookings FOR SELECT
  USING (true);
CREATE POLICY "bookings_update_by_token" ON bookings FOR UPDATE
  USING (true);
CREATE POLICY "bookings_admin" ON bookings FOR ALL USING (auth.role() = 'authenticated');

-- ------------------------------------------------------------
-- Seed: serviços iniciais
-- ------------------------------------------------------------
INSERT INTO services (name, duration_minutes) VALUES
  ('Esmaltação em gel com cuticulagem', 120),
  ('Esmaltação normal com cuticulagem', 90),
  ('Cuticulagem e extensão de unha', 180),
  ('Spá de mão', 15)
ON CONFLICT DO NOTHING;

-- Seed: dias de trabalho (Segunda a Sábado ativos por padrão)
INSERT INTO working_days (day_of_week, is_active, start_time, end_time) VALUES
  (0, false, '16:00', '20:00'),  -- Domingo
  (1, true,  '16:00', '20:00'),  -- Segunda
  (2, true,  '16:00', '20:00'),  -- Terça
  (3, true,  '16:00', '20:00'),  -- Quarta
  (4, true,  '16:00', '20:00'),  -- Quinta
  (5, true,  '16:00', '20:00'),  -- Sexta
  (6, true,  '16:00', '20:00')   -- Sábado
ON CONFLICT (day_of_week) DO NOTHING;
