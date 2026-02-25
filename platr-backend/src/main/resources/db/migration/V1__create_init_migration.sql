CREATE TABLE categories
(
    category_id   UUID NOT NULL,
    created_at    TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at    TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    category_type VARCHAR(255),
    CONSTRAINT pk_categories PRIMARY KEY (category_id)
);

CREATE TABLE ingredients
(
    ingredient_id UUID        NOT NULL,
    created_at    TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at    TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    name          VARCHAR(50) NOT NULL,
    unit_hint     VARCHAR(20),
    CONSTRAINT pk_ingredients PRIMARY KEY (ingredient_id)
);

CREATE TABLE meal_plan_recipes
(
    meal_plan_recipe_id UUID         NOT NULL,
    created_at          TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at          TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    meal_plan_id        UUID         NOT NULL,
    recipe_id           UUID         NOT NULL,
    meal_type           VARCHAR(255) NOT NULL,
    day_of_week         VARCHAR(255) NOT NULL,
    CONSTRAINT pk_meal_plan_recipes PRIMARY KEY (meal_plan_recipe_id)
);

CREATE TABLE meal_plans
(
    meal_plan_id UUID          NOT NULL,
    created_at   TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at   TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    week_start   date          NOT NULL,
    notes        VARCHAR(1000) NOT NULL,
    user_id      UUID          NOT NULL,
    CONSTRAINT pk_meal_plans PRIMARY KEY (meal_plan_id)
);

CREATE TABLE recipe_categories
(
    recipe_category_id UUID NOT NULL,
    created_at         TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at         TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    recipe_id          UUID NOT NULL,
    category_id        UUID NOT NULL,
    CONSTRAINT pk_recipe_categories PRIMARY KEY (recipe_category_id)
);

CREATE TABLE recipe_ingredients
(
    recipe_ingredient_id UUID             NOT NULL,
    created_at           TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at           TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    recipe_id            UUID             NOT NULL,
    ingredient_id        UUID             NOT NULL,
    quantity             DOUBLE PRECISION NOT NULL,
    unit                 VARCHAR(20),
    CONSTRAINT pk_recipe_ingredients PRIMARY KEY (recipe_ingredient_id)
);

CREATE TABLE recipes
(
    recipe_id         UUID             NOT NULL,
    created_at        TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at        TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    title             VARCHAR(50)      NOT NULL,
    description       VARCHAR(500)     NOT NULL,
    prep_time_minutes INTEGER          NOT NULL,
    difficulty        VARCHAR(255)     NOT NULL,
    avg_rating        DOUBLE PRECISION NOT NULL,
    image_url         VARCHAR(255),
    calories          INTEGER,
    user_id           UUID             NOT NULL,
    CONSTRAINT pk_recipes PRIMARY KEY (recipe_id)
);

CREATE TABLE reviews
(
    review_id  UUID          NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    rating     INTEGER       NOT NULL,
    text       VARCHAR(1000) NOT NULL,
    user_id    UUID          NOT NULL,
    recipe_id  UUID          NOT NULL,
    CONSTRAINT pk_reviews PRIMARY KEY (review_id)
);

CREATE TABLE user_roles
(
    user_id UUID NOT NULL,
    roles   VARCHAR(255)
);

CREATE TABLE users
(
    user_id         UUID         NOT NULL,
    created_at      TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at      TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    username        VARCHAR(50)  NOT NULL,
    email           VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    displayed_name  VARCHAR(50)  NOT NULL,
    CONSTRAINT pk_users PRIMARY KEY (user_id)
);

ALTER TABLE recipe_ingredients
    ADD CONSTRAINT uc_5a005819a99605d9e5d0d6e05 UNIQUE (recipe_id, ingredient_id);

ALTER TABLE recipe_categories
    ADD CONSTRAINT uc_92b4f45f664bd0dbf6e931b4b UNIQUE (recipe_id, category_id);

ALTER TABLE meal_plan_recipes
    ADD CONSTRAINT uc_ad2432d083fb6966684b2dd9a UNIQUE (meal_plan_id, meal_type, day_of_week);

ALTER TABLE users
    ADD CONSTRAINT uc_users_email UNIQUE (email);

ALTER TABLE users
    ADD CONSTRAINT uc_users_username UNIQUE (username);

ALTER TABLE meal_plans
    ADD CONSTRAINT FK_MEAL_PLANS_ON_USER FOREIGN KEY (user_id) REFERENCES users (user_id);

ALTER TABLE meal_plan_recipes
    ADD CONSTRAINT FK_MEAL_PLAN_RECIPES_ON_MEAL_PLAN FOREIGN KEY (meal_plan_id) REFERENCES meal_plans (meal_plan_id);

ALTER TABLE meal_plan_recipes
    ADD CONSTRAINT FK_MEAL_PLAN_RECIPES_ON_RECIPE FOREIGN KEY (recipe_id) REFERENCES recipes (recipe_id);

ALTER TABLE recipes
    ADD CONSTRAINT FK_RECIPES_ON_USER FOREIGN KEY (user_id) REFERENCES users (user_id);

ALTER TABLE recipe_categories
    ADD CONSTRAINT FK_RECIPE_CATEGORIES_ON_CATEGORY FOREIGN KEY (category_id) REFERENCES categories (category_id);

ALTER TABLE recipe_categories
    ADD CONSTRAINT FK_RECIPE_CATEGORIES_ON_RECIPE FOREIGN KEY (recipe_id) REFERENCES recipes (recipe_id);

ALTER TABLE recipe_ingredients
    ADD CONSTRAINT FK_RECIPE_INGREDIENTS_ON_INGREDIENT FOREIGN KEY (ingredient_id) REFERENCES ingredients (ingredient_id);

ALTER TABLE recipe_ingredients
    ADD CONSTRAINT FK_RECIPE_INGREDIENTS_ON_RECIPE FOREIGN KEY (recipe_id) REFERENCES recipes (recipe_id);

ALTER TABLE reviews
    ADD CONSTRAINT FK_REVIEWS_ON_RECIPE FOREIGN KEY (recipe_id) REFERENCES recipes (recipe_id);

ALTER TABLE reviews
    ADD CONSTRAINT FK_REVIEWS_ON_USER FOREIGN KEY (user_id) REFERENCES users (user_id);

ALTER TABLE user_roles
    ADD CONSTRAINT fk_user_roles_on_user FOREIGN KEY (user_id) REFERENCES users (user_id);