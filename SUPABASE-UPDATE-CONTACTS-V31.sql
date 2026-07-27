-- Run once in Supabase SQL Editor
update public.app_data
set data_value = (
  select jsonb_agg(
    case
      when member->>'id'='septino' then member || '{"whatsapp":"08116946999"}'::jsonb
      when member->>'id'='lina' then member || '{"whatsapp":"082284879722"}'::jsonb
      when member->>'id'='apryanto' then member || '{"email":"apryanto.chen@gmail.com","whatsapp":"082170809390"}'::jsonb
      when member->>'id'='fredy' then member || '{"name":"Fredy Lim","email":"fredylim372@gmail.com","whatsapp":"082255348259"}'::jsonb
      when member->>'id'='cindy' then member || '{"name":"Cindy Amelia Fortuna","email":"amelliaacin@gmail.com","whatsapp":"081261109667"}'::jsonb
      when member->>'id'='astina' then member || '{"whatsapp":"081270566101"}'::jsonb
      when member->>'id'='devia' then member || '{"whatsapp":"085835294668"}'::jsonb
      when member->>'id'='irin' then member || '{"whatsapp":"081277122263"}'::jsonb
      when member->>'id'='prianto' then member || '{"whatsapp":"081388885292"}'::jsonb
      when member->>'id'='yongki' then member || '{"whatsapp":"081268419799"}'::jsonb
      when member->>'id'='raelyn' then member || '{"whatsapp":"08116946999"}'::jsonb
      else member
    end
  )
  from jsonb_array_elements(data_value) member
),
updated_at=now()
where data_key='members';

update public.app_data
set data_value=replace(replace(replace(data_value::text,
'"Cindy Amelia"','"Cindy Amelia Fortuna"'),
'"Cindy"','"Cindy Amelia Fortuna"'),
'"Fredy"','"Fredy Lim"')::jsonb,
updated_at=now()
where data_key in ('room_groups','flights');
