-- Run this whole file once in Supabase: SQL Editor > New query > Run
create table products(id bigint primary key, slug text unique not null, title text not null,
  price numeric(10,2) not null check(price>=0), old_price numeric(10,2), model text, category text,
  trending bool default false, description text, inside text[] default '{}', tags text[] default '{}',
  images text[] default '{}', active bool default true, created_at timestamptz default now());
create table prompt_files(product_id bigint primary key references products(id) on delete cascade, content text not null default '');
create table settings(id int primary key check(id=1), data jsonb not null default '{}');
create table orders(id uuid primary key default gen_random_uuid(), reference text unique not null, email text not null,
  whatsapp text not null, telegram text, items jsonb not null, amount numeric(10,2) not null, gateway text,
  status text not null default 'pending', ip text, created_at timestamptz default now());
create table admins(email text primary key);

create function is_admin() returns boolean language sql stable security definer set search_path=public as
$$ select exists(select 1 from admins where email = auth.jwt()->>'email') $$;

alter table products enable row level security;
alter table prompt_files enable row level security;
alter table settings enable row level security;
alter table orders enable row level security;
alter table admins enable row level security;

create policy "public reads active products" on products for select using (active or is_admin());
create policy "admin writes products" on products for all using (is_admin()) with check (is_admin());
create policy "public reads settings" on settings for select using (true);
create policy "admin writes settings" on settings for all using (is_admin()) with check (is_admin());
create policy "admin all prompt files" on prompt_files for all using (is_admin()) with check (is_admin());
create policy "admin reads orders" on orders for select using (is_admin());
create policy "admin sees own row" on admins for select using (email = auth.jwt()->>'email');

insert into storage.buckets(id,name,public) values('media','media',true) on conflict do nothing;
create policy "media public read" on storage.objects for select using (bucket_id='media');
create policy "media admin insert" on storage.objects for insert with check (bucket_id='media' and is_admin());
create policy "media admin update" on storage.objects for update using (bucket_id='media' and is_admin());
create policy "media admin delete" on storage.objects for delete using (bucket_id='media' and is_admin());

-- AFTER creating your admin user in Authentication > Users, run (use your real email):
-- insert into admins(email) values ('you@example.com');
