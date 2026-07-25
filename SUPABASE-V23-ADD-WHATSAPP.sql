-- China Trip 2027 V23
-- Menambahkan kolom WhatsApp kosong ke setiap peserta di dataset JSON members.
-- Jalankan sekali melalui Supabase SQL Editor.

update public.app_data
set data_value = (
  select jsonb_agg(
    case
      when member ? 'whatsapp' then member
      else member || jsonb_build_object('whatsapp', '')
    end
  )
  from jsonb_array_elements(data_value) as member
),
updated_at = now()
where data_key = 'members';

select data_value
from public.app_data
where data_key = 'members';
