CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Seed all category types
INSERT INTO categories (category_id, created_at, updated_at, category_type)
SELECT gen_random_uuid(), NOW(), NOW(), t.category_type
FROM (VALUES ('VEGAN'), ('ITALIAN'), ('ROMANIAN'), ('INDIAN'), ('CHINESE'), ('JAPANESE')) AS t(category_type)
WHERE NOT EXISTS (SELECT 1 FROM categories c WHERE c.category_type = t.category_type);

-- Seed common ingredients
INSERT INTO ingredients (ingredient_id, created_at, updated_at, name, unit_hint)
SELECT gen_random_uuid(), NOW(), NOW(), t.name, t.unit_hint
FROM (VALUES
    ('Tomato', 'pcs'),
    ('Onion', 'pcs'),
    ('Garlic', 'cloves'),
    ('Olive Oil', 'tbsp'),
    ('Salt', 'tsp'),
    ('Black Pepper', 'tsp'),
    ('Chicken Breast', 'g'),
    ('Rice', 'g'),
    ('Pasta', 'g'),
    ('Butter', 'g'),
    ('Egg', 'pcs'),
    ('Milk', 'ml'),
    ('Flour', 'g'),
    ('Sugar', 'g'),
    ('Cheese', 'g'),
    ('Bell Pepper', 'pcs'),
    ('Carrot', 'pcs'),
    ('Potato', 'pcs'),
    ('Lemon', 'pcs'),
    ('Basil', 'g'),
    ('Oregano', 'tsp'),
    ('Cumin', 'tsp'),
    ('Paprika', 'tsp'),
    ('Soy Sauce', 'ml'),
    ('Ginger', 'g'),
    ('Mushroom', 'g'),
    ('Spinach', 'g'),
    ('Broccoli', 'g'),
    ('Beef', 'g'),
    ('Pork', 'g'),
    ('Shrimp', 'g'),
    ('Tofu', 'g'),
    ('Coconut Milk', 'ml'),
    ('Chili Flakes', 'tsp'),
    ('Cilantro', 'g'),
    ('Lime', 'pcs'),
    ('Avocado', 'pcs'),
    ('Corn', 'g'),
    ('Bread', 'pcs'),
    ('Cream', 'ml')
) AS t(name, unit_hint)
WHERE NOT EXISTS (SELECT 1 FROM ingredients i WHERE i.name = t.name);
