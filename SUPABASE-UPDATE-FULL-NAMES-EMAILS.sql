-- Jalankan sekali di Supabase SQL Editor
update public.app_data
set data_value=(
 select jsonb_agg(
  case
   when member->>'id'='irin' then member || '{"name":"Irin Enzelin","email":"irinenzelin20@gmail.com"}'::jsonb
   when member->>'id'='yongki' then member || '{"name":"Yongki Wijaya"}'::jsonb
   when member->>'id'='rico' then member || '{"name":"Rikko Supriyadi","email":"rikkosupryadi26@gmail.com"}'::jsonb
   when member->>'id'='astina' then member || '{"name":"Astina Fanfani","email":"astinafanfani99@gmail.com"}'::jsonb
   when member->>'id'='cindy' then member || '{"name":"Cindy Amelia"}'::jsonb
   when member->>'id'='devia' then member || '{"email":"siladevidevia@gmail.com"}'::jsonb
   when member->>'id'='lina' then member || '{"email":"sightniner@gmail.com"}'::jsonb
   when member->>'id'='raelyn' then member || '{"email":"jayanthiraelynxenaria@gmail.com"}'::jsonb
   when member->>'id'='septino' then member || '{"email":"septinogao@gmail.com"}'::jsonb
   else member
  end)
 from jsonb_array_elements(data_value) member
),updated_at=now()
where data_key='members';

update public.app_data
set data_value=replace(replace(replace(replace(replace(data_value::text,
'"Irin"','"Irin Enzelin"'),'"Yongki"','"Yongki Wijaya"'),'"Rico"','"Rikko Supriyadi"'),'"Astina"','"Astina Fanfani"'),'"Cindy"','"Cindy Amelia"')::jsonb,
updated_at=now()
where data_key in ('room_groups','flights');
