# Fire Tracker API Documentation

## Overview

Fire Tracker is a comprehensive financial portfolio management API that helps users track their investments, transactions, goals, and budgets. Built with Next.js, TypeScript, Prisma ORM, and Clerk authentication.

## Base URLs

- **Production**: `https://fire-tracker.vercel.app/api`
- **Development**: `http://localhost:3000/api`

## Authentication

Fire Tracker uses Clerk authentication with JWT tokens. Most endpoints require authentication.

### Authentication Header
```
Authorization: Bearer <your-clerk-jwt-token>
```

### Getting Your Token
1. Sign in to the Fire Tracker application
2. Open browser developer tools
3. Find the JWT token in localStorage or from network requests
4. Use this token in the Authorization header

## Features

- **Portfolio Management**: Track multiple accounts, FDs, gold investments, and mutual funds
- **Transaction Tracking**: Record income and expenses with detailed categorization
- **Goal Setting**: Set and track financial goals with progress monitoring
- **Budget Management**: Create and monitor spending budgets by category
- **Market Data**: Get real-time gold and silver rates
- **Import/Export**: Import portfolio data from various formats
- **Reporting**: Generate comprehensive financial reports

## API Endpoints

### 🔐 Authentication & Users

#### Get Current User
```http
GET /users
```

**Response:**
```json
{
  "id": "user_2abc123def456",
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": "2025-08-07T10:30:00Z",
  "updatedAt": "2025-08-07T10:30:00Z"
}
```

---

### 💰 Accounts Management

#### Get All Accounts
```http
GET /accounts
```

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "HDFC Savings Account",
    "balance": 50000.00,
    "createdAt": "2025-08-07T10:30:00Z",
    "userId": "user_2abc123def456"
  }
]
```

#### Create Account
```http
POST /accounts
Content-Type: application/json

{
  "name": "HDFC Savings Account",
  "balance": 50000.00
}
```

#### Get Account by ID
```http
GET /accounts/{id}
```

#### Update Account
```http
PUT /accounts/{id}
Content-Type: application/json

{
  "name": "Updated Account Name",
  "balance": 75000.00
}
```

#### Delete Account
```http
DELETE /accounts/{id}
```

---

### 📊 Transaction Management

#### Get All Transactions
```http
GET /transactions
```

**Query Parameters:**
- `category` (string): Filter by transaction category
- `type` (string): Filter by type (`income` or `expense`)
- `startDate` (string): Filter from date (ISO 8601)
- `endDate` (string): Filter to date (ISO 8601)

**Example:**
```http
GET /transactions?type=expense&category=Groceries&startDate=2025-01-01&endDate=2025-12-31
```

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "type": "expense",
    "amount": 1500.00,
    "category": "Groceries",
    "note": "Weekly grocery shopping",
    "date": "2025-08-07T10:30:00Z",
    "accountId": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "user_2abc123def456",
    "account": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "HDFC Savings Account",
      "balance": 48500.00
    }
  }
]
```

#### Create Transaction
```http
POST /transactions
Content-Type: application/json

{
  "type": "expense",
  "amount": 1500.00,
  "category": "Groceries",
  "note": "Weekly grocery shopping",
  "accountId": "550e8400-e29b-41d4-a716-446655440000",
  "date": "2025-08-07T10:30:00Z"
}
```

#### Get Transaction by ID
```http
GET /transactions/{id}
```

#### Update Transaction
```http
PUT /transactions/{id}
Content-Type: application/json

{
  "type": "expense",
  "amount": 2000.00,
  "category": "Groceries",
  "note": "Updated grocery shopping",
  "accountId": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### Delete Transaction
```http
DELETE /transactions/{id}
```

---

### 🏦 Fixed Deposits (FDs)

#### Get All FDs
```http
GET /fds
```

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "amount": 100000.00,
    "rate": 7.5,
    "startDate": "2025-01-01T00:00:00Z",
    "endDate": "2026-01-01T00:00:00Z",
    "createdAt": "2025-08-07T10:30:00Z",
    "accountId": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "user_2abc123def456",
    "account": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "HDFC Savings Account"
    }
  }
]
```

#### Create FD
```http
POST /fds
Content-Type: application/json

{
  "amount": 100000.00,
  "rate": 7.5,
  "startDate": "2025-01-01T00:00:00Z",
  "endDate": "2026-01-01T00:00:00Z",
  "accountId": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### Get FD by ID
```http
GET /fds/{id}
```

#### Update FD
```http
PUT /fds/{id}
Content-Type: application/json

{
  "amount": 150000.00,
  "rate": 8.0,
  "startDate": "2025-01-01T00:00:00Z",
  "endDate": "2026-01-01T00:00:00Z",
  "accountId": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### Delete FD
```http
DELETE /fds/{id}
```

---

### 🥇 Gold Investments

#### Get All Gold Investments
```http
GET /gold
```

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "grams": 10.5,
    "value": 55000.00,
    "date": "2025-08-07T10:30:00Z",
    "userId": "user_2abc123def456"
  }
]
```

#### Add Gold Investment
```http
POST /gold
Content-Type: application/json

{
  "grams": 10.5,
  "value": 55000.00,
  "date": "2025-08-07T10:30:00Z"
}
```

#### Get Gold Investment by ID
```http
GET /gold/{id}
```

#### Update Gold Investment
```http
PUT /gold/{id}
Content-Type: application/json

{
  "grams": 15.0,
  "value": 78000.00,
  "date": "2025-08-07T10:30:00Z"
}
```

#### Delete Gold Investment
```http
DELETE /gold/{id}
```

---

### 📈 Mutual Funds

#### Get All Mutual Fund Investments
```http
GET /mutual-funds
```

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440004",
    "schemeCode": 119551,
    "schemeName": "Axis Bluechip Fund - Direct Plan - Growth",
    "fundHouse": "Axis Mutual Fund",
    "schemeType": "Open Ended",
    "schemeCategory": "Equity - Large Cap",
    "units": 150.75,
    "avgPrice": 65.25,
    "totalInvested": 10000.00,
    "purchaseDate": "2025-08-07T10:30:00Z",
    "currentNAV": 68.50,
    "lastUpdated": "2025-08-07T10:30:00Z",
    "isActive": true,
    "notes": "First investment in large cap fund",
    "investmentType": "lumpsum",
    "tags": "[\"equity\", \"large-cap\"]",
    "createdAt": "2025-08-07T10:30:00Z",
    "updatedAt": "2025-08-07T10:30:00Z",
    "userId": "user_2abc123def456"
  }
]
```

#### Search Mutual Fund Schemes
```http
GET /mutual-funds/search?query=axis&limit=10
```

**Query Parameters:**
- `query` (string, required): Search query for scheme name or AMC
- `limit` (integer): Maximum number of results (default: 20)

#### Add Mutual Fund Investment (Lumpsum)
```http
POST /mutual-funds
Content-Type: application/json

{
  "schemeCode": 119551,
  "schemeName": "Axis Bluechip Fund - Direct Plan - Growth",
  "fundHouse": "Axis Mutual Fund",
  "schemeType": "Open Ended",
  "schemeCategory": "Equity - Large Cap",
  "units": 150.75,
  "avgPrice": 65.25,
  "totalInvested": 10000.00,
  "investmentType": "lumpsum",
  "notes": "First investment in large cap fund"
}
```

#### Add SIP Investment
```http
POST /mutual-funds
Content-Type: application/json

{
  "schemeCode": 119551,
  "schemeName": "Axis Bluechip Fund - Direct Plan - Growth",
  "fundHouse": "Axis Mutual Fund",
  "schemeType": "Open Ended",
  "schemeCategory": "Equity - Large Cap",
  "units": 75.5,
  "avgPrice": 66.25,
  "totalInvested": 5000.00,
  "investmentType": "sip",
  "sipAmount": 5000.00,
  "sipDate": 15,
  "sipStartDate": "2025-01-15T00:00:00Z",
  "sipFrequency": "monthly",
  "notes": "Monthly SIP investment"
}
```

#### Get Mutual Fund Investment by ID
```http
GET /mutual-funds/{id}
```

#### Update Mutual Fund Investment
```http
PUT /mutual-funds/{id}
Content-Type: application/json

{
  "units": 200.0,
  "avgPrice": 67.0,
  "totalInvested": 13400.00,
  "currentNAV": 68.50,
  "notes": "Updated investment details"
}
```

#### Delete Mutual Fund Investment
```http
DELETE /mutual-funds/{id}
```

---

### 🎯 Goals Management

#### Get All Goals
```http
GET /goals
```

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440005",
    "title": "Emergency Fund",
    "targetAmount": 500000.00,
    "targetDate": "2026-08-07T00:00:00Z",
    "category": "emergency",
    "description": "Build emergency fund for 6 months expenses",
    "isCompleted": false,
    "createdAt": "2025-08-07T10:30:00Z",
    "updatedAt": "2025-08-07T10:30:00Z",
    "userId": "user_2abc123def456",
    "fundAdditions": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440010",
        "amount": 5000.00,
        "note": "Monthly contribution",
        "date": "2025-08-07T10:30:00Z",
        "goalId": "550e8400-e29b-41d4-a716-446655440005",
        "userId": "user_2abc123def456",
        "createdAt": "2025-08-07T10:30:00Z"
      }
    ]
  }
]
```

#### Create Goal
```http
POST /goals
Content-Type: application/json

{
  "title": "Emergency Fund",
  "targetAmount": 500000.00,
  "targetDate": "2026-08-07T00:00:00Z",
  "category": "emergency",
  "description": "Build emergency fund for 6 months expenses"
}
```

**Goal Categories:**
- `emergency`: Emergency fund goals
- `investment`: Investment goals
- `savings`: General savings goals
- `purchase`: Purchase goals (car, house, etc.)
- `other`: Other financial goals

#### Get Goal by ID
```http
GET /goals/{id}
```

#### Update Goal
```http
PUT /goals/{id}
Content-Type: application/json

{
  "title": "Updated Emergency Fund",
  "targetAmount": 600000.00,
  "targetDate": "2027-01-01T00:00:00Z",
  "category": "emergency",
  "description": "Updated emergency fund target"
}
```

#### Delete Goal
```http
DELETE /goals/{id}
```

---

### 💳 Budget Management

#### Get All Budgets
```http
GET /budgets
```

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440006",
    "category": "Groceries",
    "limit": 15000.00,
    "period": "monthly",
    "startDate": "2025-08-01T00:00:00Z",
    "endDate": "2025-12-31T23:59:59Z",
    "isActive": true,
    "createdAt": "2025-08-07T10:30:00Z",
    "updatedAt": "2025-08-07T10:30:00Z",
    "userId": "user_2abc123def456"
  }
]
```

#### Create Budget
```http
POST /budgets
Content-Type: application/json

{
  "category": "Groceries",
  "limit": 15000.00,
  "period": "monthly",
  "startDate": "2025-08-01T00:00:00Z",
  "endDate": "2025-12-31T23:59:59Z"
}
```

**Budget Periods:**
- `monthly`: Monthly budget
- `weekly`: Weekly budget
- `yearly`: Yearly budget

#### Get Budget by ID
```http
GET /budgets/{id}
```

#### Update Budget
```http
PUT /budgets/{id}
Content-Type: application/json

{
  "category": "Groceries",
  "limit": 18000.00,
  "period": "monthly"
}
```

#### Delete Budget
```http
DELETE /budgets/{id}
```

---

### 📊 Market Data (Public Endpoints)

#### Get Current Gold and Silver Rates
```http
GET /gold-rate
```

**No authentication required**

**Response:**
```json
{
  "goldRate22k": 5850.00,
  "silverRate": 75.50,
  "source": "GRT Jewels",
  "success": true,
  "lastUpdated": "2025-08-07T10:30:00Z"
}
```

This endpoint fetches real-time gold (22K) and silver rates from multiple sources including:
- Exchange Rate API
- GRT Jewels
- Static fallback rates

---

### 📥 Portfolio Import/Export

#### Import Portfolio Data (JSON)
```http
POST /import-portfolio
Content-Type: application/json

{
  "data": {
    "accounts": [
      {
        "name": "Imported Savings Account",
        "balance": 25000.00
      }
    ],
    "transactions": [
      {
        "type": "income",
        "amount": 50000.00,
        "category": "Salary",
        "note": "Monthly salary",
        "accountId": "account-id-here"
      }
    ],
    "fds": [
      {
        "amount": 50000.00,
        "rate": 7.25,
        "startDate": "2025-01-01T00:00:00Z",
        "endDate": "2026-01-01T00:00:00Z",
        "accountId": "account-id-here"
      }
    ],
    "gold": [
      {
        "grams": 5.0,
        "value": 28000.00
      }
    ],
    "goals": [
      {
        "title": "Car Purchase",
        "targetAmount": 800000.00,
        "category": "purchase",
        "description": "Save for new car"
      }
    ]
  }
}
```

#### Import Portfolio Data (File Upload)
```http
POST /import-portfolio
Content-Type: multipart/form-data

file: [CSV or Excel file]
```

**Supported file formats:**
- CSV files with proper headers
- Excel files (.xlsx)

**Response:**
```json
{
  "message": "Portfolio imported successfully",
  "summary": {
    "accountsImported": 17,
    "transactionsImported": 25,
    "fdsImported": 13,
    "goldImported": 5,
    "goalsImported": 3
  }
}
```

---

### 📈 Reports and Analytics

#### Get Financial Reports
```http
GET /reports?type=overview
```

**Query Parameters:**
- `type` (string, required): Type of report
  - `overview`: Basic financial overview
  - `detailed`: Detailed financial breakdown
  - `category-wise`: Expenses grouped by category
  - `monthly`: Monthly financial summary
  - `yearly`: Yearly financial summary
- `startDate` (string): Start date for the report (ISO 8601)
- `endDate` (string): End date for the report (ISO 8601)

**Examples:**
```http
GET /reports?type=detailed&startDate=2025-01-01&endDate=2025-12-31
GET /reports?type=category-wise&startDate=2025-01-01&endDate=2025-12-31
GET /reports?type=monthly&startDate=2025-08-01&endDate=2025-08-31
```

**Response:**
```json
{
  "type": "overview",
  "period": {
    "startDate": "2025-01-01T00:00:00Z",
    "endDate": "2025-12-31T23:59:59Z"
  },
  "summary": {
    "totalIncome": 600000.00,
    "totalExpenses": 300000.00,
    "netSavings": 300000.00,
    "totalAssets": 1250000.00
  },
  "breakdown": {
    "accountBalances": [
      {
        "accountName": "HDFC Savings",
        "balance": 75000.00
      }
    ],
    "categoryWiseExpenses": [
      {
        "category": "Groceries",
        "amount": 45000.00
      }
    ],
    "investments": {
      "fds": 500000.00,
      "gold": 150000.00,
      "mutualFunds": 200000.00
    }
  },
  "generatedAt": "2025-08-07T10:30:00Z"
}
```

---

### 🔧 Development Endpoints

#### Test Database Connection
```http
GET /test-db
```

**No authentication required**

**Response:**
```json
{
  "status": "Database connection successful",
  "timestamp": "2025-08-07T10:30:00Z"
}
```

---

## Error Responses

All endpoints return consistent error responses:

### 400 Bad Request
```json
{
  "error": "Invalid input data",
  "details": "Name and balance are required",
  "timestamp": "2025-08-07T10:30:00Z"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "details": "Valid authentication token required",
  "timestamp": "2025-08-07T10:30:00Z"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found",
  "details": "The requested resource could not be found",
  "timestamp": "2025-08-07T10:30:00Z"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "details": "An unexpected error occurred",
  "timestamp": "2025-08-07T10:30:00Z"
}
```

---

## Rate Limits

Currently, there are no specific rate limits implemented, but we recommend:
- Maximum 100 requests per minute per user
- Bulk operations should be paginated
- Use appropriate caching for repeated requests

---

## Data Models

### User
```typescript
interface User {
  id: string;        // Clerk user ID
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Account
```typescript
interface Account {
  id: string;
  name: string;
  balance: number;
  createdAt: Date;
  userId: string;
}
```

### Transaction
```typescript
interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  note?: string;
  date: Date;
  accountId: string;
  userId: string;
}
```

### Fixed Deposit (FD)
```typescript
interface FD {
  id: string;
  amount: number;
  rate: number;      // Interest rate percentage
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  accountId: string;
  userId: string;
}
```

### Gold Investment
```typescript
interface Gold {
  id: string;
  grams: number;     // Weight in grams
  value: number;     // Total value in INR
  date: Date;
  userId: string;
}
```

### Mutual Fund
```typescript
interface MutualFund {
  id: string;
  schemeCode: number;
  schemeName: string;
  fundHouse: string;
  schemeType: string;
  schemeCategory: string;
  units: number;
  avgPrice: number;
  totalInvested: number;
  purchaseDate: Date;
  currentNAV?: number;
  lastUpdated: Date;
  isActive: boolean;
  notes?: string;
  investmentType: "lumpsum" | "sip";
  tags: string;      // JSON array of tags
  
  // SIP specific fields
  sipAmount?: number;
  sipDate?: number;  // Day of month (1-31)
  sipStartDate?: Date;
  sipEndDate?: Date;
  sipFrequency?: "monthly" | "quarterly";
  
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}
```

### Goal
```typescript
interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  targetDate?: Date;
  category: "emergency" | "investment" | "savings" | "purchase" | "other";
  description?: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}
```

### Budget
```typescript
interface Budget {
  id: string;
  category: string;
  limit: number;
  period: "monthly" | "weekly" | "yearly";
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}
```

---

## Common Use Cases

### 1. Creating a Complete Portfolio Entry
```javascript
// 1. Create an account
const account = await fetch('/api/accounts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'HDFC Savings',
    balance: 100000
  })
});

// 2. Add some transactions
const transaction = await fetch('/api/transactions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'income',
    amount: 50000,
    category: 'Salary',
    accountId: account.id
  })
});

// 3. Create an FD investment
const fd = await fetch('/api/fds', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 50000,
    rate: 7.5,
    startDate: '2025-01-01',
    endDate: '2026-01-01',
    accountId: account.id
  })
});
```

### 2. Setting Up Financial Goals
```javascript
// Create an emergency fund goal
const emergencyGoal = await fetch('/api/goals', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Emergency Fund',
    targetAmount: 500000,
    category: 'emergency',
    description: '6 months of expenses'
  })
});

// Create a budget for tracking expenses
const budget = await fetch('/api/budgets', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    category: 'Groceries',
    limit: 15000,
    period: 'monthly'
  })
});
```

### 3. Tracking Mutual Fund SIP
```javascript
// Add a SIP investment
const sipInvestment = await fetch('/api/mutual-funds', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    schemeCode: 119551,
    schemeName: 'Axis Bluechip Fund - Direct Plan - Growth',
    fundHouse: 'Axis Mutual Fund',
    schemeType: 'Open Ended',
    schemeCategory: 'Equity - Large Cap',
    units: 75.5,
    avgPrice: 66.25,
    totalInvested: 5000,
    investmentType: 'sip',
    sipAmount: 5000,
    sipDate: 15,
    sipStartDate: '2025-01-15',
    sipFrequency: 'monthly'
  })
});
```

---

## Support

For API support and questions:
- **Email**: support@firetracker.app
- **Documentation**: Check the OpenAPI/Swagger specification
- **Issues**: Report bugs through the application's feedback system

---

## Changelog

### Version 1.0.0 (August 2025)
- Initial API release
- Complete CRUD operations for all financial entities
- Portfolio import/export functionality
- Real-time market data integration
- Comprehensive reporting system
- Clerk authentication integration
