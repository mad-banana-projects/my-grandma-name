-- Product variants: size/color/option-specific price, images, and links.
-- Products without variants use the parent products row directly.
-- Products with variants: UI shows a selector; selected variant drives price and image.
create table public.product_variants (
  id            uuid default gen_random_uuid() primary key,
  product_id    uuid references public.products(id) on delete cascade not null,
  label         text not null,
  price         numeric(10,2),
  image_urls    text[],
  product_url   text,
  affiliate_url text,
  display_order integer default 0,
  is_active     boolean default true
);

-- Public read for active variants (mirrors the products policy).
alter table public.product_variants enable row level security;

create policy "product_variants: public read active"
  on public.product_variants for select
  using (is_active = true);
