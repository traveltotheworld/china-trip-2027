-- Run once in Supabase SQL Editor
update public.app_data
set data_value = (
  select jsonb_agg(
    case
      when member->>'id'='raelyn'
        then member || '{"name":"Raelyn Xenaria Jayanthi"}'::jsonb
      when member->>'id'='cindy'
        then member || '{"name":"Cindy Amelia Fortuna"}'::jsonb
      else member
    end
  )
  from jsonb_array_elements(data_value) member
),
updated_at=now()
where data_key='members';

update public.app_data
set data_value = replace(
  replace(
    replace(data_value::text,
      '"Raelyn"', '"Raelyn Xenaria Jayanthi"'),
    '"Cindy Amelia Fortuna Amelia Fortuna"', '"Cindy Amelia Fortuna"'),
  '"Cindy Amelia"', '"Cindy Amelia Fortuna"'
)::jsonb,
updated_at=now()
where data_key='room_groups';
