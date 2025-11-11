-- Create policies - allow public access for this simple app
create policy "Allow public to view foods"
  on public.foods for select
  using (true);

create policy "Allow public to insert foods"
  on public.foods for insert
  with check (true);

create policy "Allow public to update foods"
  on public.foods for update
  using (true);

create policy "Allow public to delete foods"
  on public.foods for delete
  using (true);
