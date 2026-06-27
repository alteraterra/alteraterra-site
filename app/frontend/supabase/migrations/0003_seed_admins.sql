-- Replace these emails with the actual admin list before applying.
insert into public.admins (email) values
  ('oscarmottaquintana@gmail.com')
  on conflict (email) do nothing;
