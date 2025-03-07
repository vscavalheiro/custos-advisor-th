# Custos Advisor - Accounting System

A full-stack accounting system that allows users to manage accounts and transactions for a small business.

## Features

- **User Authentication**: Secure JWT-based authentication
- **Account Management**: Create and manage different types of accounts (bank, expense, etc.)
- **Transaction Tracking**: Record income and expense transactions
- **Financial Reports**: Generate reports for specific time periods
- **Dashboard**: View account balances and transaction history

## Technology Stack

### Backend

- **Python 3.8+**
- **Flask**: Web framework
- **SQLAlchemy**: ORM for database operations
- **Flask-JWT-Extended**: Authentication with JWT
- **SQLite**: Database (can be replaced with PostgreSQL or MySQL)

### Frontend

- **React**: UI library
- **TypeScript**: Type-safe JavaScript
- **React Router**: Navigation
- **Context API**: State management
- **Axios**: API requests
- **Chart.js**: Data visualization

## Backend Setup

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

### Installation

1. Clone the repository:
   git clone https://github.com/yourusername/custos-advisor-th.git
   cd custos-advisor-th

2. Set up a virtual environment (recommended):
   python -m venv venv
   source venv/bin/activate # On Windows: venv\Scripts\activate

3. Install dependencies:
   cd back-end
   pip install -r requirements.txt

4. Run the application:
   python app.py

The backend server will start at http://localhost:5000.

### API Endpoints

#### Authentication

- POST /api/auth/register: Register a new user
- POST /api/auth/login: Login and get JWT token
- GET /api/auth/me: Get current user information

#### Accounts

- GET /api/accounts: List all accounts
- POST /api/accounts: Create a new account
- GET /api/accounts/:id: Get account details
- PUT /api/accounts/:id: Update account
- DELETE /api/accounts/:id: Delete account

#### Transactions

- GET /api/transactions: List all transactions
- GET /api/transactions?account_id=:id: List transactions for a specific account
- POST /api/transactions: Create a new transaction
- GET /api/transactions/:id: Get transaction details
- DELETE /api/transactions/:id: Delete transaction

#### Reports

- GET /api/reports/summary: Get summary of all accounts
- GET /api/reports/summary?start_date=:date&end_date=:date: Get summary for a date range
- GET /api/reports/monthly?year=:year&month=:month: Get monthly report

### Database Schema

The application uses SQLite with the following schema:

- **users**: User accounts for authentication

  - id, username, email, password_hash, created_at

- **accounts**: Financial accounts

  - id, name, type, balance, user_id, created_at

- **transactions**: Financial transactions
  - id, account_id, amount, type (credit/debit), description, date

## Testing the API

You can test the API using tools like Postman or curl:

1. Register a new user:
   curl -X POST http://localhost:5000/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

2. Login to get a token:
   curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"testuser","password":"password123"}'

3. Use the token for authenticated requests:
   curl -X GET http://localhost:5000/api/accounts \
    -H "Authorization: Bearer YOUR_TOKEN_HERE"

## Security Notes

- The JWT secret key is fixed for development. In production, use environment variables.
- Default SQLite database is used for simplicity. For production, consider PostgreSQL or MySQL.
- Password hashing is implemented using Werkzeug's security functions.

## System Architecture

The current architecture of the system was designed in a simplified way to meet the challenge requirements and facilitate rapid development. Routes and business logic are organized in Flask blueprints, which provides a basic separation of concerns.

For a larger and more structured application that would require scalability, it would be more appropriate to use a more robust layered architecture:

- **Controllers Layer**: Responsible for receiving HTTP requests and returning responses.
- **Services Layer**: Would contain business logic, validations, and orchestration of operations.
- **Models Layer**: Data representation and interaction with the database.
- **Repositories Layer**: Abstraction for database access, facilitating testing and maintenance.

This layered approach would provide:

- Better separation of concerns
- Improved code testability
- Easier maintenance and evolution
- Better scalability for larger teams

However, for the purposes of this challenge, the current architecture offers a good balance between simplicity and organization.

## Frontend Setup

### Prerequisites

- Node.js 14.0 or higher
- npm (Node package manager)

### Installation

1. Navigate to the frontend directory:

   ```
   cd front-end
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Run the application:
   ```
   npm start
   ```

The frontend application will start at http://localhost:3000.

### Frontend Structure

The React application is structured as follows:

- **src/api/**: API client configuration and service functions

  - axios.ts: Axios instance with interceptors for JWT authentication
  - auth.ts: Authentication API calls
  - accounts.ts: Account management API calls
  - transactions.ts: Transaction API calls
  - reports.ts: Reports API calls

- **src/components/**: Reusable UI components

  - Layout/: Page layout components
  - Forms/: Form components for data entry
  - Charts/: Data visualization components

- **src/contexts/**: React context providers

  - AuthContext.tsx: Authentication state management

- **src/interfaces/**: TypeScript interfaces

  - models.ts: Data model interfaces

- **src/pages/**: Application pages

  - Dashboard.tsx: Main dashboard
  - accounts/: Account management pages
  - transactions/: Transaction management pages
  - reports/: Financial reports pages
  - Login.tsx & Register.tsx: Authentication pages

- **src/routes.tsx**: Application routing with protected routes

### Technology Details

- **React 19**: Modern UI library
- **TypeScript**: Type-safe JavaScript
- **React Router 7**: Client-side routing
- **Material UI 6**: Component library for consistent design
- **Axios**: HTTP client for API requests
- **Chart.js**: Data visualization library
- **Formik & Yup**: Form handling and validation
- **date-fns**: Date manipulation utilities

### Authentication Flow

The frontend implements a token-based authentication flow:

1. User registers or logs in through the authentication pages
2. JWT token is stored in localStorage
3. Axios interceptor automatically adds the token to all API requests
4. Protected routes check authentication status before rendering
5. Token expiration is handled by redirecting to the login page
