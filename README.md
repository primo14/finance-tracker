# FinTrack — Personal Finance Tracker

A full-stack personal finance application built with Java Spring Boot and React. Track income and expenses, set monthly budgets, visualize spending trends, and organize transactions with custom categories.

## Tech Stack

**Backend**
- Java 21, Spring Boot 3.2
- Spring Security with stateless JWT authentication
- Spring Data JPA + Hibernate
- PostgreSQL
- Maven
- JUnit 5 + Mockito (unit tests)

**Frontend**
- React 18, Vite 5
- React Router v6
- Recharts (bar chart, pie chart)
- Axios

**DevOps**
- GitHub Actions CI/CD — runs backend unit tests against a PostgreSQL service container and validates the Vite production build on every push to `main` and `develop`

## Features

- **Authentication** — JWT-secured register and login; tokens stored client-side, auto-redirect on expiry
- **Dashboard** — greeting, net balance / income / expense / savings rate stat cards, 6-month income vs. expense bar chart, current-month spending pie chart, budget snapshot
- **Transactions** — add, edit, and delete transactions; filter by All / Income / Expense; search by description; running totals
- **Budgets** — set monthly spend limits per category; progress bars with over-budget alerts and end-of-month spending projections; unbudgeted spending section
- **Categories** — default system categories (read-only) plus user-created custom categories with emoji icons; full CRUD with inline editing; deleting a category safely detaches linked transactions

## Project Structure

```
finance-tracker/
├── backend/                  # Spring Boot API
│   └── src/main/java/com/financetracker/
│       ├── config/           # Security, CORS
│       ├── controller/       # REST endpoints
│       ├── dto/              # Request / response objects
│       ├── exception/        # Global exception handler
│       ├── model/            # JPA entities
│       ├── repository/       # Spring Data repositories
│       ├── security/         # JWT filter, token provider
│       └── service/          # Business logic
└── frontend/                 # React + Vite app
    └── src/
        ├── api/              # Axios client + API modules
        ├── components/       # Layout, TransactionForm, etc.
        ├── context/          # Auth context
        └── pages/            # Dashboard, Transactions, Budgets, Categories
```

## Getting Started

### Prerequisites

- Java 21
- Node 18+
- PostgreSQL 14+

### Database setup

```bash
psql -U postgres -c "CREATE DATABASE finance_tracker;"
```

### Backend

```bash
cd backend
./mvnw spring-boot:run
```

The API starts on `http://localhost:8080`. Default database config (set in `application.yml`):

```
url: jdbc:postgresql://localhost:5432/finance_tracker
username: postgres
password: postgres
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app starts on `http://localhost:5173`. API requests are proxied to `http://localhost:8080` via Vite.

### Running tests

```bash
cd backend
./mvnw test
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/transactions` | List all transactions |
| POST | `/api/transactions` | Create a transaction |
| PUT | `/api/transactions/{id}` | Update a transaction |
| DELETE | `/api/transactions/{id}` | Delete a transaction |
| GET | `/api/transactions/summary` | Balance, income, expense totals + category breakdown |
| GET | `/api/transactions/monthly` | 6-month income vs. expense summary |
| GET | `/api/budgets` | Current month's budgets with spending |
| POST | `/api/budgets` | Create or update a budget |
| DELETE | `/api/budgets/{id}` | Delete a budget |
| GET | `/api/categories` | List all categories (default + user custom) |
| POST | `/api/categories` | Create a custom category |
| PUT | `/api/categories/{id}` | Update a custom category |
| DELETE | `/api/categories/{id}` | Delete a custom category |

All endpoints except `/api/auth/**` require `Authorization: Bearer <token>`.

## Branch Strategy

```
main       ← production-ready releases
develop    ← integration branch
feature/*  ← feature branches, merged back into develop
```
