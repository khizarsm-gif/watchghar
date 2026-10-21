-- Article numbers (WGA-01, WGA-02, ...). Stored in products.sku so order snapshots, search and admin keep working.
-- Run AFTER 20261006120000_orders.sql.
create sequence if not exists public.article_no_seq;

-- Backfill existing products in creation order.
with ranked as (select id, row_number() over (order by id) as rn from public.products)
update public.products p set sku = 'WGA-' || lpad(r.rn::text, 2, '0') from ranked r where p.id = r.id;

select setval('public.article_no_seq', (select count(*) from public.products));

-- Every new product (admin portal or SQL) gets the next article number unless one is given.
create or replace function public.assign_article_no()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if new.sku is null or btrim(new.sku) = '' then
    new.sku := 'WGA-' || lpad(nextval('public.article_no_seq')::text, 2, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists products_assign_article_no on public.products;
create trigger products_assign_article_no
  before insert on public.products
  for each row execute function public.assign_article_no();

create unique index if not exists products_sku_unique on public.products (sku);
