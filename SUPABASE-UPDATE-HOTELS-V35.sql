-- China Trip 2027 V35
-- Jalankan sekali di Supabase SQL Editor.

update public.app_data
set data_value = (
  select jsonb_agg(
    case
      when hotel->>'city' = 'Shanghai'
        then hotel || '{
          "datesGroupA":"04–09 Mar 2027",
          "datesGroupB":"06–09 Mar 2027"
        }'::jsonb
      else hotel
    end
  )
  from jsonb_array_elements(data_value) hotel
),
updated_at = now()
where data_key = 'hotels';

update public.app_data
set data_value = (
  select jsonb_agg(item order by sort_order)
  from (
    select
      '{
        "city":"Shangrao",
        "name":"Wangxiangu Zhonglou Homestay (Wangxiangu Scenic Area)",
        "dates":"03–04 Mar 2027",
        "address":"No. 13 Ludixin Street, Wangxian Village, Wangxian Township, Guangxin District, Shangrao, Jiangxi, China",
        "mapsQuery":"望仙谷钟楼民宿 上饶",
        "groupOnly":"group-a",
        "sourceUrl":"https://id.trip.com/hotels/Shangrao-hotel-detail-111115638/Wangxiangu-Zhonglou-Homestay%28Wangxiangu-Scenic-Area%29/"
      }'::jsonb as item,
      0 as sort_order
    where not exists (
      select 1
      from jsonb_array_elements(data_value) existing
      where existing->>'city' = 'Shangrao'
    )

    union all

    select existing, ordinality::int
    from jsonb_array_elements(data_value) with ordinality as t(existing, ordinality)
  ) combined
),
updated_at = now()
where data_key = 'hotels';

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
