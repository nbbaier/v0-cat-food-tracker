-- Updated to use inventory_quantity instead of in_stock
insert into public.foods (name, notes, preference, inventory_quantity) values
  ('Fancy Feast Chicken', 'Her favorite wet food', 'likes', 3),
  ('Purina Pro Plan Salmon', 'Good for her coat', 'likes', 2),
  ('Whiskas Tuna', 'Makes her throw up', 'dislikes', 0),
  ('Royal Canin Indoor', 'Dry food for daily feeding', 'likes', 5),
  ('Meow Mix Original', 'She refused to eat it', 'dislikes', 0),
  ('Sheba Perfect Portions', 'Convenient single servings', 'likes', 4),
  ('Blue Buffalo Wilderness', 'Trying grain-free option', 'unknown', 1);
