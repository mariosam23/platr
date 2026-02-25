ALTER TABLE reviews
    ADD CONSTRAINT uc_reviews_user_recipe UNIQUE (user_id, recipe_id);
