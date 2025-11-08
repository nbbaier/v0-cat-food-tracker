-- Create foods table
CREATE TABLE IF NOT EXISTS
   foods (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      preference TEXT NOT NULL CHECK (preference IN ('likes', 'dislikes', 'unknown')),
      notes TEXT NOT NULL DEFAULT '',
      in_stock INTEGER NOT NULL DEFAULT 0,
      added_at INTEGER NOT NULL
   );

-- Insert sample data
INSERT OR IGNORE INTO
   foods (id, name, preference, notes, in_stock, added_at)
VALUES
   (
      '1',
      'Fancy Feast Chicken Pate',
      'likes',
      'Her absolute favorite! Goes crazy when she hears the can open.',
      1,
      strftime('%s', 'now', '-5 days') * 1000
   ),
   (
      '2',
      'Blue Buffalo Salmon',
      'likes',
      'Good for when we run out of chicken. She eats it but not as enthusiastically.',
      1,
      strftime('%s', 'now', '-4 days') * 1000
   ),
   (
      '3',
      'Friskies Turkey & Gravy',
      'dislikes',
      'She sniffed it and walked away. Complete waste of money.',
      0,
      strftime('%s', 'now', '-3 days') * 1000
   ),
   (
      '4',
      'Wellness Core Grain-Free',
      'unknown',
      'Just bought this. Need to try it out this week.',
      1,
      strftime('%s', 'now', '-1 days') * 1000
   ),
   (
      '5',
      'Purina Pro Plan Tuna',
      'likes',
      'Great for special occasions. A bit pricey but she loves it.',
      0,
      strftime('%s', 'now', '-7 days') * 1000
   ),
   (
      '6',
      'Hill''s Science Diet Chicken',
      'dislikes',
      'Vet recommended but she refuses to eat it.',
      1,
      strftime('%s', 'now', '-10 days') * 1000
   ),
   (
      '7',
      'Sheba Perfect Portions Beef',
      'unknown',
      'Need to order more to test properly.',
      0,
      strftime('%s', 'now', '-2 days') * 1000
   );
