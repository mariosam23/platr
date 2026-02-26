# Platr

A recipe management and meal planning REST API built with Kotlin and Spring Boot.

## Tech Stack

- **Language:** Kotlin 2.2
- **Framework:** Spring Boot 4.0
- **Database:** PostgreSQL
- **Migrations:** Flyway
- **Auth:** JWT (access + refresh tokens)
- **Build Tool:** Gradle (Kotlin DSL)
- **Java:** 23
- **API Docs:** SpringDoc OpenAPI / Swagger UI

## Features

- **Recipe management** — Create, update, delete, and search recipes with ingredients, categories, and difficulty levels
- **Recipe reviews** — Users can rate and review recipes (one review per user per recipe); average ratings are automatically calculated
- **Meal planning** — Organize recipes into weekly meal plans by day and meal type (breakfast, lunch, dinner, snack)
- **User management** — Registration, login, and admin-managed user listing/deletion
- **JWT authentication** — Stateless auth with 1-hour access tokens and 24-hour refresh tokens
- **Role-based authorization** — USER and ADMIN roles with resource-level ownership checks
- **Search & filtering** — Search recipes by text, category, or ingredients with pagination

## Data Model

| Entity | Description |
|---|---|
| **User** | Accounts with username, email, display name, and roles |
| **Recipe** | Title, description, prep time, difficulty, calories, image URL, average rating |
| **Ingredient** | Reusable ingredient definitions with unit hints |
| **RecipeIngredient** | Links recipes to ingredients with quantity and unit |
| **Category** | Recipe categories (Vegan, Italian, Romanian, Indian, Chinese, Japanese) |
| **Review** | User rating (numeric) and text review for a recipe |
| **MealPlan** | Weekly plan with a start date and notes |
| **MealPlanRecipe** | Assigns a recipe to a specific day and meal type within a plan |

All entities include `createdAt` and `updatedAt` audit timestamps.

## API Endpoints

### Authentication — `/api/auth`

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Log in and receive tokens |
| POST | `/api/auth/refresh` | Public | Refresh an expired access token |

### Recipes — `/api/recipes`

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/api/recipes` | Public | List/search recipes (supports `search`, `category`, `ingredientIds`, pagination) |
| GET | `/api/recipes/{id}` | Public | Get recipe details |
| POST | `/api/recipes` | USER, ADMIN | Create a recipe |
| PUT | `/api/recipes/{id}` | Owner, ADMIN | Update a recipe |
| DELETE | `/api/recipes/{id}` | Owner, ADMIN | Delete a recipe |

### Reviews — `/api/recipes/{id}/reviews`

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/api/recipes/{id}/reviews` | Public | Get paginated reviews for a recipe |
| POST | `/api/recipes/{id}/reviews` | USER, ADMIN | Add a review |
| PUT | `/api/recipes/{id}/reviews/{reviewId}` | Owner, ADMIN | Update a review |
| DELETE | `/api/recipes/{id}/reviews/{reviewId}` | Owner, ADMIN | Delete a review |

### Meal Plans — `/api/mealplans`

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/api/mealplans` | USER, ADMIN | List the authenticated user's meal plans |
| GET | `/api/mealplans/{id}` | Owner, ADMIN | Get a meal plan |
| POST | `/api/mealplans` | USER, ADMIN | Create a meal plan |
| PUT | `/api/mealplans/{id}` | Owner, ADMIN | Update a meal plan |
| DELETE | `/api/mealplans/{id}` | Owner, ADMIN | Delete a meal plan |

### Users — `/api/users`

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/api/users` | ADMIN | List all users |
| GET | `/api/users/{uuid}` | Self, ADMIN | Get user details |
| DELETE | `/api/users/{uuid}` | Self, ADMIN | Delete a user |

## Getting Started

### Prerequisites

- Java 23+
- PostgreSQL
- Gradle

### Environment Variables

Create a `.env` file in `platr-backend/` with the following:

```properties
DB_URL=jdbc:postgresql://localhost:5432/platr
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_db_password
JWT_SECRET=your_jwt_secret_key
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@platr.com
ADMIN_PASSWORD=your_admin_password
```

### Run

```bash
cd platr-backend
./gradlew bootRun
```

The server starts on port **9023**. Swagger UI is available at `http://localhost:9023/swagger-ui.html`


## Project Structure

```
platr/
└── platr-backend/
    └── src/main/kotlin/com/Platr/api/
        ├── controller/    # REST controllers
        ├── service/       # Business logic
        ├── repository/    # Spring Data JPA repositories
        ├── entity/        # JPA entities
        ├── dto/           # Request/response DTOs
        ├── config/        # Security, JWT, and app configuration
        ├── exception/     # Custom exceptions and global error handler
        └── enums/         # Role, Difficulty, MealType, CategoryType
```
