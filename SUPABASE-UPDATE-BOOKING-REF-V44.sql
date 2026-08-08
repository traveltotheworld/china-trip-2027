-- China Trip 2027 V44
-- Run this in Supabase SQL Editor to update the LIVE app_data.members record.
-- This is needed if the deployed site reads members from Supabase.

UPDATE public.app_data
SET data_value = (
  SELECT jsonb_agg(
    CASE elem->>'id'
      WHEN 'astina' THEN elem || jsonb_build_object('bookingReference','BLPB0FK','xiamenBookingReference','PWP4CK')
      WHEN 'cindy' THEN elem || jsonb_build_object('bookingReference','BLPB0FK','xiamenBookingReference','PWP4CK')
      WHEN 'rico' THEN elem || jsonb_build_object('bookingReference','BLPB0FK','xiamenBookingReference','PWP4CK')
      WHEN 'devia' THEN elem || jsonb_build_object('bookingReference','BLPB0FK','xiamenBookingReference','PWP4CK')
      WHEN 'yongki' THEN elem || jsonb_build_object('bookingReference','BLPB0FK','xiamenBookingReference','PWP4CK')
      WHEN 'prianto' THEN elem || jsonb_build_object('bookingReference','BLPBR0K','xiamenBookingReference','PWP4CK')
      WHEN 'fredy' THEN elem || jsonb_build_object('bookingReference','BLPB0FK','xiamenBookingReference','PWP4CK')
      WHEN 'apryanto' THEN elem || jsonb_build_object('bookingReference','BLPB0FK','xiamenBookingReference','')
      WHEN 'irin' THEN elem || jsonb_build_object('bookingReference','BLPB0FK','xiamenBookingReference','')
      ELSE elem
    END
  )
  FROM jsonb_array_elements(data_value) AS elem
)
WHERE data_key = 'members';

-- Verify:
SELECT data_key, data_value
FROM public.app_data
WHERE data_key = 'members';
