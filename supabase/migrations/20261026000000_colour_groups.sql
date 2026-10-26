-- Colour groups, free delivery and the new article numbering.
-- Run AFTER 20261022000000_product_gallery.sql.
--
-- * group_key     : article number shared by all colours of one watch (for example WGA-48).
-- * group_name    : model name shown on the shop card and product page.
-- * variant_label : the colour name of one option.
-- * free_delivery : orders containing such a watch get free delivery.
-- Colour options get letters: WGA-48a, WGA-48b, ... (assigned by the trigger below).
alter table public.products
  add column if not exists group_key text,
  add column if not exists group_name text,
  add column if not exists variant_label text,
  add column if not exists free_delivery boolean not null default false;
create index if not exists products_group_key_idx on public.products (group_key);

create or replace function public.assign_article_no()
returns trigger language plpgsql security definer set search_path = public
as $$
declare
  v_n integer;
begin
  if new.sku is null or btrim(new.sku) = '' then
    if new.group_key = '__new__' then
      -- Start a new colour group: the group takes the next article number, this watch is option "a".
      new.group_key := 'WGA-' || lpad(nextval('public.article_no_seq')::text, 2, '0');
      new.sku := new.group_key || 'a';
    elsif new.group_key is not null and btrim(new.group_key) <> '' then
      -- Another colour of an existing group: next letter (b, c, d ...).
      select count(*) into v_n from public.products where group_key = new.group_key;
      if v_n >= 26 then
        raise exception 'A colour group can have at most 26 colours.';
      end if;
      new.sku := new.group_key || chr(97 + v_n);
    else
      new.group_key := null;
      new.sku := 'WGA-' || lpad(nextval('public.article_no_seq')::text, 2, '0');
    end if;
  end if;
  return new;
end;
$$;

-- create_order: delivery is free when the order contains a free-delivery watch.
create or replace function public.create_order(
  p_customer_name text,
  p_phone text,
  p_whatsapp text,
  p_email text,
  p_delivery_method text,
  p_payment_method text,
  p_address text,
  p_city text,
  p_notes text,
  p_delivery_fee numeric,
  p_free_delivery_threshold numeric,
  p_items jsonb
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_item record;
  v_product record;
  v_unit_price numeric(10, 2);
  v_subtotal numeric(10, 2) := 0;
  v_fee numeric(10, 2);
  v_order_id uuid;
  v_order_number text;
  v_lines jsonb := '[]'::jsonb;
  v_item_count integer;
  v_any_free boolean := false;
begin
  if p_delivery_method not in ('delivery', 'pickup') then
    raise exception 'invalid_delivery_method';
  end if;
  if p_payment_method not in ('cod', 'pay-at-store') then
    raise exception 'invalid_payment_method';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    raise exception 'empty_order';
  end if;
  v_item_count := jsonb_array_length(p_items);
  if v_item_count < 1 or v_item_count > 50 then
    raise exception 'invalid_item_count';
  end if;

  -- Simple abuse guard: at most 5 orders per phone number per hour.
  if (select count(*) from public.orders
        where phone = p_phone and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'rate_limited';
  end if;

  v_order_id := gen_random_uuid();

  -- Insert the order first with zero totals; totals are filled in after the
  -- authoritative prices are read from public.products (same transaction).
  insert into public.orders (
    id, customer_name, phone, whatsapp, email, delivery_method, payment_method,
    address, city, notes, subtotal, delivery_fee, total
  ) values (
    v_order_id, p_customer_name, p_phone, p_whatsapp, nullif(p_email, ''), p_delivery_method, p_payment_method,
    case when p_delivery_method = 'delivery' then nullif(p_address, '') end,
    case when p_delivery_method = 'delivery' then nullif(p_city, '') end,
    nullif(p_notes, ''), 0, 0, 0
  ) returning order_number into v_order_number;

  -- Merge duplicate product ids, then price each line from the catalog.
  for v_item in
    select (e ->> 'product_id')::bigint as product_id, sum((e ->> 'quantity')::integer) as quantity
    from jsonb_array_elements(p_items) as e
    group by 1
  loop
    if v_item.quantity < 1 or v_item.quantity > 99 then
      raise exception 'invalid_quantity';
    end if;

    select id, name, sku, price, sale_price, stock, free_delivery
      into v_product
      from public.products where id = v_item.product_id;

    if not found then
      raise exception 'unknown_product';
    end if;
    if v_product.stock < v_item.quantity then
      raise exception 'insufficient_stock:%', v_product.name;
    end if;

    v_unit_price := case
      when v_product.sale_price is not null and v_product.sale_price > 0 and v_product.sale_price < v_product.price
        then v_product.sale_price
      else v_product.price
    end;

    insert into public.order_items (order_id, product_id, product_name, sku, unit_price, quantity, line_total)
    values (v_order_id, v_product.id, v_product.name, v_product.sku, v_unit_price, v_item.quantity,
            v_unit_price * v_item.quantity);

    v_subtotal := v_subtotal + v_unit_price * v_item.quantity;
    v_any_free := v_any_free or v_product.free_delivery;
    v_lines := v_lines || jsonb_build_object(
      'name', v_product.name,
      'quantity', v_item.quantity,
      'unit_price', v_unit_price,
      'line_total', v_unit_price * v_item.quantity
    );
  end loop;

  v_fee := case
    when p_delivery_method = 'pickup' then 0
    when v_any_free then 0
    when v_subtotal >= p_free_delivery_threshold then 0
    else p_delivery_fee
  end;

  update public.orders
    set subtotal = v_subtotal, delivery_fee = v_fee, total = v_subtotal + v_fee
    where id = v_order_id;

  insert into public.order_status_history (order_id, from_status, to_status, note)
  values (v_order_id, null, 'new', 'Order placed on the website');

  return jsonb_build_object(
    'order_id', v_order_id,
    'order_number', v_order_number,
    'subtotal', v_subtotal,
    'delivery_fee', v_fee,
    'total', v_subtotal + v_fee,
    'items', v_lines
  );
end;
$$;
