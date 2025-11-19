-- Drop and recreate the view without SECURITY DEFINER
DROP VIEW IF EXISTS public.poll_results;

CREATE VIEW public.poll_results 
WITH (security_invoker = true)
AS
SELECT 
  po.id as option_id,
  po.poll_id,
  po.option_text,
  COUNT(v.id) as vote_count
FROM public.poll_options po
LEFT JOIN public.votes v ON po.id = v.option_id
GROUP BY po.id, po.poll_id, po.option_text;