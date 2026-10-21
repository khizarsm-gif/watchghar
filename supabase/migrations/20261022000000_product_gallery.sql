-- Extra photos per product (shown as thumbnails on the product page).
-- products.image stays the main photo used in the shop grid.
alter table public.products add column if not exists gallery text[] not null default '{}';
