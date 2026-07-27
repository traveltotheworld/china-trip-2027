-- China Trip 2027 V36
-- Jalankan sekali di Supabase SQL Editor agar dataset Identitas Perjalanan tersedia di Admin.

insert into public.app_data (data_key, data_value, description)
values (
  'trip',
  '{"title": "China Trip 2027", "subtitle": "Shanghai • Suzhou • Hangzhou", "date": "06–14 March 2027", "meeting": "Batam Centre Ferry Terminal", "leader": "Septino", "leaderPhone": "Nomor belum diisi", "whatsapp": "#"}'::jsonb,
  'Judul, tanggal, titik kumpul dan kontak perjalanan'
)
on conflict (data_key)
do update set
  data_value = excluded.data_value,
  description = excluded.description,
  updated_at = now();

-- Dataset lain yang sudah ada tetap dipertahankan dan dapat diedit melalui Admin Portal.
