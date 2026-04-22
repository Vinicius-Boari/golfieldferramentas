UPDATE public.home_config 
SET config = jsonb_set(
  config, 
  '{heroVideo,url}', 
  '"https://ehtlblplrzqdjrviodzi.supabase.co/storage/v1/object/public/hero-videos/hero/1776368308470-tq7p2b.mp4"'::jsonb
);