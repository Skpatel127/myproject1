-- ==========================================================
-- OPTIONAL demo data. Run after schema.sql and after you have
-- signed up at least one user (so profiles has a row to link to).
-- ==========================================================

insert into clients (name, industry, health, monthly_deliverables, contract_start)
values
  ('Northbridge Coffee Co.', 'Food & Beverage', 'healthy', 12, '2025-11-01'),
  ('Verdant Skincare', 'Beauty', 'attention', 8, '2026-01-15'),
  ('Fold & Co. Furniture', 'Retail', 'at_risk', 6, '2025-06-01');

insert into leads (name, company, source, stage, expected_value, probability, follow_up_date)
values
  ('Priya Shah', 'Lumen Fitness', 'Referral', 'meeting_scheduled', 4500, 60, current_date + 3),
  ('Marcus Webb', 'Basil & Bloom', 'Website', 'proposal_sent', 3200, 40, current_date + 7),
  ('Elena Vukovic', 'Drift Outdoors', 'Cold outreach', 'new', 6000, 20, current_date + 1);

-- Content + tasks reference a client — grab one client id to attach demo rows to:
do $$
declare
  demo_client_id uuid;
begin
  select id into demo_client_id from clients where name = 'Northbridge Coffee Co.' limit 1;

  insert into content_items (client_id, title, content_type, platform, stage, publish_date)
  values
    (demo_client_id, 'Autumn menu reveal reel', 'Reel', 'Instagram', 'client_approval', current_date + 5),
    (demo_client_id, 'Behind-the-roast carousel', 'Carousel', 'Instagram', 'editing', current_date + 9),
    (demo_client_id, 'Loyalty program launch post', 'Static post', 'Facebook', 'published', current_date - 2);

  insert into tasks (client_id, title, status, priority, due_date)
  values
    (demo_client_id, 'Confirm shoot location with client', 'waiting_client', 'high', current_date + 2),
    (demo_client_id, 'Edit autumn reveal reel', 'in_progress', 'urgent', current_date + 4),
    (demo_client_id, 'Draft loyalty program copy', 'completed', 'normal', current_date - 5);
end $$;
