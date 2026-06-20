-- Casa Tonio — Données initiales

-- Menu
INSERT INTO menu (id, name, description, price, image, category, allergens, "pizzaOfMonth") VALUES
  (1, 'Margherita',  'Sauce tomate, mozzarella fior di latte, basilic frais',                                                                   '9.50 €',  'https://cdn.website.dish.co/media/83/3f/8425421/CASA-TONIO-jpg-20230309-201756-0000-jpg.jpg', 'Classiques', '["gluten","lactose"]', false),
  (2, 'Regina',      'Sauce tomate, mozzarella, jambon blanc, champignons, origan',                                                            '11.00 €', 'https://cdn.website.dish.co/media/d7/b5/9902186/CASA-TONIO-20230406-213013-jpg.jpg',        'Classiques', '["gluten","lactose"]', false),
  (3, 'Napolitaine', 'Sauce tomate, mozzarella, anchois, câpres, olives noires, origan',                                                       '11.50 €', '',                                                                                     'Classiques', '["gluten","lactose","poisson"]', false),
  (4, '4 Fromages',  'Sauce tomate, mozzarella, gorgonzola, chèvre, parmesan',                                                                 '12.50 €', '',                                                                                     'Spéciales',  '["gluten","lactose"]', false),
  (5, 'Calzone',     'Crème fraîche locale, mozzarella, champignons, lardons, oignons, fromage',                                                '11.50 €', '',                                                                                     'Spéciales',  '["gluten","lactose"]', false),
  (6, 'Pizza du Mois','Découvrez notre création du moment avec des produits de saison et locaux',                                                '13.00 €', 'https://cdn.website.dish.co/media/a4/15/825467.jpg',                                             'Du Moment',  '["gluten","lactose"]', true);

-- Horaires
INSERT INTO hours (jour, midi, soir, ferme) VALUES
  ('lundi',    '11:30 – 14:00', '18:00 – 21:30', false),
  ('mardi',    '',              '',              true),
  ('mercredi', '11:30 – 14:00', '18:30 – 22:00', false),
  ('jeudi',    '',              '',              true),
  ('vendredi', '11:30 – 14:00', '18:30 – 23:30', false),
  ('samedi',   'Fermé midi',    '18:30 – 22:00', false),
  ('dimanche', '11:30 – 14:00', '18:00 – 21:30', false);

-- Settings
INSERT INTO settings (key, value) VALUES ('maxPizzasPerSlot', '9');

-- Témoignages
INSERT INTO testimonials (author, source, date, text, stars) VALUES
  ('Sophie M.', 'Google Maps', '2025-12-15', 'Une vraie pizzeria à l''italienne ! Les produits sont frais et la pâte est excellente. On se croirait en Italie.', 5),
  ('Thomas L.', 'Facebook',    '2026-01-20', 'Meilleures pizzas du secteur ! Le rapport qualité-prix est imbattable et l''accueil est très chaleureux. Je recommande vivement.', 5),
  ('Marie D.',  'Google Maps', '2026-03-08', 'Ravis de ce petit restaurant de village. Les ingrédients locaux font toute la différence. La pizza du mois est toujours une belle surprise.', 5),
  ('David B.',  'Facebook',    '2026-05-02', 'Excellentes pizzas et accueil chaleureux', 5);

-- Slot settings (empty overrides — no specific slot overrides yet)
