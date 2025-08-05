# Fire Tracker - Personal Finance Management System

## 📋 Table of Contents
- [Overview](#overview)
- [Project Structure](#project-structure)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Database Schema](#database-schema)
- [API Routes](#api-routes)
- [Components](#components)
- [Utilities](#utilities)
- [User Interface](#user-interface)
- [Recent Enhancements](#recent-enhancements)
- [Installation & Setup](#installation--setup)
- [Usage Guide](#usage-guide)

## 🔍 Overview

Fire Tracker is a comprehensive personal finance management application built with Next.js 15, designed to help users track their financial portfolio including accounts, fixed deposits, gold investments, and transactions. The application features professional data grids, smart notifications, and comprehensive financial analytics.

## 📁 Project Structure

```
fire-tracker/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── accounts/
│   │   │   ├── fds/
│   │   │   ├── gold/
│   │   │   └── transactions/
│   │   ├── accounts/
│   │   ├── fds/
│   │   ├── gold/
│   │   ├── transactions/
│   │   └── page.tsx (Dashboard)
│   ├── components/
│   │   ├── DataGrid.tsx
│   │   ├── DatePicker.tsx
│   │   └── MaturedFDNotification.tsx
│   ├── lib/
│   │   ├── ag-grid-init.ts
│   │   └── prisma.ts
│   └── utils/
│       ├── dateHelpers.ts
│       └── fdUtils.ts
├── prisma/
│   └── schema.prisma
└── package.json
```

## ✨ Features

### 🏦 Account Management
- **Create and manage multiple financial accounts**
- **Track account balances in real-time**
- **Professional data grid with sorting and filtering**
- **Account deletion with confirmation dialogs**

### 💰 Fixed Deposits (FDs)
- **Comprehensive FD tracking with account relationships**
- **Historical FD entry support (past start dates)**
- **Automatic maturity amount calculations**
- **Smart maturity notifications:**
  - 🚨 **Overdue FDs** (past maturity date)
  - ⏰ **Approaching maturity** (within 45 days)
- **Account-linked FD creation**
- **Professional AG Grid with custom cell renderers**

### 🥇 Gold Investment Tracking
- **Track gold investments by weight (grams) and value**
- **Date-based investment records**
- **Total portfolio value calculations**
- **Professional data management interface**

### 💳 Transaction Management
- **Income and expense transaction tracking**
- **Category-based organization**
- **Account-linked transactions**
- **Date-based filtering and sorting**
- **Notes and descriptions support**

### 📊 Dashboard Analytics
- **Comprehensive portfolio overview**
- **Real-time asset calculations:**
  - Total account balances
  - FD investments and maturity values
  - Gold portfolio value
  - Net cash flow analysis
- **Smart notifications for FD maturities**
- **Visual cards with color-coded metrics**

## 🛠 Technology Stack

### Frontend
- **Next.js 15** with App Router
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **AG Grid React** for professional data tables

### Backend
- **Next.js API Routes**
- **Prisma ORM** for database management
- **SQLite** database

### Libraries & Tools
- **AG Grid Community** for data grids
- **React DatePicker** for date inputs
- **TypeScript** for type safety

## 🗃 Database Schema

### Account Model
```prisma
model Account {
  id        String   @id @default(cuid())
  name      String
  balance   Float
  createdAt DateTime @default(now())
  
  // Relations
  transactions Transaction[]
  fds          FD[]
}
```

### FD (Fixed Deposit) Model
```prisma
model FD {
  id        String   @id @default(cuid())
  amount    Float
  rate      Float
  startDate DateTime
  endDate   DateTime
  createdAt DateTime @default(now())
  accountId String
  
  // Relations
  account   Account  @relation(fields: [accountId], references: [id])
}
```

### Gold Model
```prisma
model Gold {
  id    String   @id @default(cuid())
  grams Float
  value Float
  date  DateTime
}
```

### Transaction Model
```prisma
model Transaction {
  id        String   @id @default(cuid())
  type      String   // 'income' or 'expense'
  amount    Float
  category  String
  note      String?
  date      DateTime
  accountId String?
  
  // Relations
  account   Account? @relation(fields: [accountId], references: [id])
}
```

## 🔌 API Routes

### Accounts API (`/api/accounts`)
- **GET** - Fetch all accounts
- **POST** - Create new account
- **DELETE** `/api/accounts/[id]` - Delete account

### FDs API (`/api/fds`)
- **GET** - Fetch all FDs with account relationships
- **POST** - Create new FD with account validation
- **DELETE** `/api/fds/[id]` - Delete FD

### Gold API (`/api/gold`)
- **GET** - Fetch all gold investments
- **POST** - Create new gold investment
- **DELETE** `/api/gold/[id]` - Delete gold investment

### Transactions API (`/api/transactions`)
- **GET** - Fetch all transactions with account relationships
- **POST** - Create new transaction
- **DELETE** `/api/transactions/[id]` - Delete transaction

## 🧩 Components

### DataGrid Component
**Location**: `src/components/DataGrid.tsx`
**Purpose**: Reusable AG Grid wrapper with consistent styling
**Features**:
- Global AG Grid module registration
- Legacy theme support for CSS compatibility
- Default column configurations
- Responsive design
- Professional appearance

### DatePicker Component
**Location**: `src/components/DatePicker.tsx`
**Purpose**: Consistent date input across the application
**Features**:
- Date validation
- Min/max date constraints
- Consistent styling
- TypeScript support

### FD Notification Component
**Location**: `src/components/MaturedFDNotification.tsx`
**Purpose**: Smart FD maturity notifications
**Features**:
- Dual notification system (overdue + approaching)
- Expandable/collapsible details
- Color-coded urgency levels
- Dismissible notifications
- Maturity value calculations
- Direct navigation to FD management

## 🔧 Utilities

### Date Helpers (`src/utils/dateHelpers.ts`)
- `formatDateForInput()` - Format dates for HTML input fields
- `formatDateForDisplay()` - Format dates for user display
- `getToday()` - Get current date

### FD Utilities (`src/utils/fdUtils.ts`)
- `getMaturedFDs()` - Find overdue fixed deposits
- `getApproachingMaturityFDs()` - Find FDs maturing within specified days
- `calculateMaturityAmount()` - Calculate FD maturity values
- TypeScript interfaces for FD data structures

### AG Grid Initialization (`src/lib/ag-grid-init.ts`)
- Global AG Grid module registration
- Singleton pattern to prevent multiple registrations
- Error handling for module initialization
- Automatic initialization on import

## 🎨 User Interface

### Dashboard (`/`)
- **Portfolio overview cards**
- **FD maturity notifications**
- **Asset summary calculations**
- **Quick navigation to all sections**
- **Real-time data updates**

### Accounts Page (`/accounts`)
- **Account creation form**
- **AG Grid with account listings**
- **Balance tracking**
- **Account deletion functionality**

### FDs Page (`/fds`)
- **FD creation with account selection**
- **Historical date support**
- **Maturity calculations**
- **AG Grid with account relationships**
- **Professional data management**

### Gold Page (`/gold`)
- **Gold investment tracking**
- **Weight and value management**
- **Date-based records**
- **Portfolio value calculations**

### Transactions Page (`/transactions`)
- **Income/expense categorization**
- **Account-linked transactions**
- **Category management**
- **Transaction notes support**

## 🚀 Recent Enhancements

### AG Grid Integration
- **Replaced all HTML tables** with professional AG Grid components
- **Implemented sorting, filtering, and pagination**
- **Added custom cell renderers** for complex data display
- **Resolved module registration issues** with global initialization
- **Fixed theming conflicts** with legacy theme support

### FD-Account Relationships
- **Database schema migration** to link FDs with accounts
- **Account selection** in FD creation forms
- **Updated API endpoints** to support account relationships
- **Enhanced data display** with account information in grids

### Smart Notification System
- **Dual-alert system** for FD maturities:
  - Overdue FDs (red/orange alerts)
  - Approaching maturity within 45 days (yellow alerts)
- **Expandable notification interface**
- **Dismissible notifications**
- **Detailed FD information** with maturity calculations
- **Visual priority indicators**

### Historical Data Support
- **Removed date restrictions** for FD start dates
- **Support for adding past FD entries**
- **Flexible date validation** while maintaining data integrity

## 📋 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation Steps
```bash
# Clone the repository
git clone <repository-url>
cd fire-tracker

# Install dependencies
npm install

# Set up database
npx prisma generate
npx prisma migrate dev

# Start development server
npm run dev
```

### Environment Setup
Create `.env` file:
```env
DATABASE_URL="file:./dev.db"
```

## 📖 Usage Guide

### Getting Started
1. **Launch the application** at `http://localhost:3000`
2. **Create accounts** first (savings, checking, investment accounts)
3. **Add transactions** to track income and expenses
4. **Create FDs** and link them to accounts
5. **Track gold investments** for diversified portfolio
6. **Monitor dashboard** for portfolio overview and notifications

### FD Management Best Practices
1. **Always select an account** when creating FDs
2. **Use historical dates** for existing FDs
3. **Monitor notifications** for upcoming maturities
4. **Plan renewals** 45 days in advance
5. **Track maturity values** for better financial planning

### Data Management
- **Use AG Grid features** for sorting and filtering large datasets
- **Delete confirmations** prevent accidental data loss
- **Account relationships** provide complete audit trails
- **Professional interface** supports efficient data entry

### Dashboard Insights
- **Portfolio overview** shows total asset distribution
- **Notification system** ensures no missed opportunities
- **Real-time calculations** provide accurate financial status
- **Visual indicators** help prioritize financial decisions

---

## 🎯 Key Achievements

✅ **Professional Data Management** - AG Grid integration across all tables  
✅ **Smart Financial Planning** - Automated FD maturity notifications  
✅ **Complete Audit Trail** - Account relationships for all investments  
✅ **Historical Data Support** - Flexible date handling for past entries  
✅ **User-Friendly Interface** - Intuitive navigation and data entry  
✅ **Real-Time Analytics** - Live portfolio calculations and insights  
✅ **Type-Safe Development** - Full TypeScript implementation  
✅ **Scalable Architecture** - Clean separation of concerns and reusable components  

The Fire Tracker application provides a comprehensive solution for personal finance management with professional-grade features and an intuitive user experience.

---

## 🚀 SaaS Transformation Roadmap

### 🎯 Vision Statement
Transform Fire Tracker from a personal finance tool into a comprehensive SaaS platform serving individuals, families, and small businesses with advanced financial management capabilities.

## 📅 Phase 1: Foundation (Months 1-3)

### 🔐 Authentication & Multi-tenancy
- **User Authentication System**
  - Email/password registration and login
  - OAuth integration (Google, Apple, Microsoft)
  - Password reset and email verification
  - Two-factor authentication (2FA)

- **Multi-tenant Architecture**
  - Tenant isolation in database
  - User workspace management
  - Role-based access control (RBAC)
  - Organization/family account structure

- **Database Migration**
  - Add `User`, `Organization`, and `Workspace` models
  - Implement tenant-specific data isolation
  - Migrate existing models to support multi-tenancy
  - Add proper indexing and performance optimizations

### 💳 Subscription Management
- **Pricing Tiers**
  - **Free Tier**: Basic features, limited accounts/transactions
  - **Personal Pro**: Advanced features, unlimited data
  - **Family Plan**: Multi-user access, shared portfolios
  - **Business Plan**: Advanced analytics, team collaboration

- **Payment Integration**
  - Stripe integration for subscription billing
  - Multiple payment methods support
  - Automated billing and invoicing
  - Usage-based billing for enterprise features

## 📅 Phase 2: Enhanced Features (Months 4-6)

### 📊 Advanced Analytics & Reporting
- **Investment Analytics**
  - Portfolio performance tracking
  - Asset allocation visualization
  - Risk assessment and recommendations
  - Historical performance analysis

- **Financial Health Score**
  - Credit score integration
  - Debt-to-income ratio analysis
  - Emergency fund adequacy
  - Investment diversification metrics

- **Custom Reports & Dashboards**
  - Drag-and-drop dashboard builder
  - Scheduled report generation
  - Export to PDF/Excel
  - White-label reporting for advisors

### 🔄 Integrations & Data Import
- **Bank Account Integration**
  - Open Banking API connections
  - Automatic transaction import
  - Real-time balance updates
  - Multi-currency support

- **Investment Platform Integration**
  - Stock broker API connections
  - Mutual fund tracking
  - Cryptocurrency portfolio integration
  - Real-time market data

- **Document Management**
  - Receipt and document upload
  - OCR for automatic data extraction
  - Tax document organization
  - Secure cloud storage

## 📅 Phase 3: Collaboration & Advanced Tools (Months 7-9)

### 👥 Collaboration Features
- **Family/Team Workspaces**
  - Shared account access with permissions
  - Collaborative budgeting and planning
  - Expense approval workflows
  - Activity logs and audit trails

- **Financial Advisor Portal**
  - Client portfolio overview
  - Performance reporting
  - Goal tracking and recommendations
  - Secure client communication

### 🎯 Goal Setting & Planning
- **Financial Goal Management**
  - Retirement planning calculator
  - Education savings planning
  - Home purchase planning
  - Debt payoff strategies

- **AI-Powered Insights**
  - Spending pattern analysis
  - Investment recommendations
  - Risk tolerance assessment
  - Automated savings suggestions

### 📱 Mobile Applications
- **React Native Mobile App**
  - Full feature parity with web app
  - Offline transaction entry
  - Push notifications for important events
  - Biometric authentication

## 📅 Phase 4: Enterprise & Scale (Months 10-12)

### 🏢 Enterprise Features
- **Advanced Security**
  - SOC 2 Type II compliance
  - GDPR compliance
  - Data encryption at rest and in transit
  - Regular security audits

- **Enterprise Integration**
  - SSO integration (SAML, OIDC)
  - API access for custom integrations
  - Webhook support for real-time updates
  - Custom branding and white-labeling

### 🌍 Global Expansion
- **Internationalization**
  - Multi-language support
  - Regional currency support
  - Local banking integration
  - Compliance with local regulations

- **Advanced Taxation**
  - Tax calculation and optimization
  - Capital gains/loss tracking
  - Tax document generation
  - Integration with tax software

## 🛠 Technical Architecture Evolution

### Infrastructure Upgrades
- **Database Migration**
  - PostgreSQL for production scalability
  - Redis for caching and session management
  - Database sharding for tenant isolation
  - Read replicas for performance

- **Cloud Infrastructure**
  - Containerization with Docker
  - Kubernetes for orchestration
  - Auto-scaling based on demand
  - Multi-region deployment

- **Monitoring & Observability**
  - Application performance monitoring
  - Error tracking and alerting
  - User analytics and behavior tracking
  - Business intelligence dashboards

### Security & Compliance
- **Data Protection**
  - End-to-end encryption
  - Regular security penetration testing
  - OWASP security standards compliance
  - Data backup and disaster recovery

- **Regulatory Compliance**
  - PCI DSS compliance for payment processing
  - Financial services regulations compliance
  - Privacy policy and terms of service
  - Regular compliance audits

## 💰 Revenue Model Strategy

### Subscription Tiers
1. **Free Tier** ($0/month)
   - 2 accounts, 50 transactions/month
   - Basic dashboard and reports
   - Community support

2. **Personal Pro** ($9.99/month)
   - Unlimited accounts and transactions
   - Advanced analytics and reports
   - Goal tracking and planning
   - Priority email support

3. **Family Plan** ($19.99/month)
   - Up to 5 users
   - Shared workspaces
   - Collaborative budgeting
   - Family financial planning tools

4. **Business Plan** ($49.99/month)
   - Team collaboration features
   - Advanced reporting and analytics
   - API access
   - Dedicated account manager

5. **Enterprise** (Custom pricing)
   - White-labeling options
   - Custom integrations
   - On-premise deployment options
   - SLA guarantees

### Additional Revenue Streams
- **Financial Advisory Services**
  - Partner with certified financial advisors
  - Revenue sharing model
  - Premium advisory tier

- **Marketplace Integrations**
  - Credit card and loan recommendations
  - Insurance product recommendations
  - Investment product partnerships

## 📈 Go-to-Market Strategy

### Phase 1: Product-Market Fit
- **Beta Testing Program**
  - Invite existing users to test new features
  - Gather feedback and iterate
  - Build case studies and testimonials

- **Content Marketing**
  - Financial education blog
  - YouTube channel with tutorials
  - Podcast sponsorships
  - SEO optimization

### Phase 2: User Acquisition
- **Digital Marketing**
  - Google Ads for financial keywords
  - Facebook and Instagram advertising
  - Influencer partnerships
  - Affiliate marketing program

- **Strategic Partnerships**
  - Integration with popular financial apps
  - Partnerships with banks and credit unions
  - Financial advisor network partnerships

### Phase 3: Scale & Retention
- **Customer Success Program**
  - Onboarding optimization
  - In-app guidance and tutorials
  - Regular check-ins and support
  - User community building

- **Referral Program**
  - Incentivized user referrals
  - Family plan sharing benefits
  - Corporate partnership referrals

## 🔮 Future Innovation Opportunities

### Emerging Technologies
- **AI/ML Integration**
  - Predictive financial modeling
  - Automated investment rebalancing
  - Fraud detection and prevention
  - Personalized financial coaching

- **Blockchain Integration**
  - Cryptocurrency portfolio management
  - DeFi protocol integration
  - NFT asset tracking
  - Blockchain-based identity verification

### Advanced Features
- **Robo-Advisory Services**
  - Automated investment management
  - Risk-adjusted portfolio optimization
  - Tax-loss harvesting
  - Rebalancing automation

- **Financial Marketplace**
  - Best rate finder for loans/savings
  - Insurance comparison and purchase
  - Investment product marketplace
  - Financial product recommendations

## 🎯 Success Metrics & KPIs

### User Metrics
- Monthly Active Users (MAU)
- Customer Acquisition Cost (CAC)
- Customer Lifetime Value (LTV)
- User retention rates
- Feature adoption rates

### Business Metrics
- Monthly Recurring Revenue (MRR)
- Churn rate by tier
- Conversion rates from free to paid
- Average Revenue Per User (ARPU)
- Net Promoter Score (NPS)

### Technical Metrics
- Application uptime and reliability
- Page load times and performance
- API response times
- Error rates and resolution times
- Security incident frequency

---

This roadmap transforms Fire Tracker from a personal finance tool into a comprehensive SaaS platform that can serve millions of users while maintaining the core simplicity and effectiveness that makes it valuable.
