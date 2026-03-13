# RoomSplit - Complete Feature Documentation

## 🏠 Project Overview

RoomSplit is a comprehensive roommate expense management application built with Next.js, TypeScript, and PostgreSQL. It transforms messy shared bills into a clean, auditable ledger system for tracking rooms, expenses, and balances in collaborative dashboards.

## 🚀 Technology Stack

- **Frontend**: Next.js 16.1.6, React 18, TypeScript
- **Backend**: Next.js API Routes, Server Actions
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js (Google + Email/Password)
- **UI**: Tailwind CSS, Radix UI Components, Lucide React Icons
- **Styling**: TailwindCSS with custom animations
- **Charts**: Recharts for analytics
- **Theme**: Dark/Light mode support with next-themes

## 📋 Core Features

### 🔐 Authentication System
- **Google OAuth Integration**: Secure login with Google accounts
- **Email/Password Authentication**: Traditional login with bcryptjs hashing
- **Session Management**: Persistent sessions with NextAuth.js
- **User Profiles**: Name, email, and avatar support

### 🏢 Room Management
- **Create Rooms**: Set up shared spaces for flats, PGs, or houses
- **Room Details**: Name, description, currency settings
- **Invite System**: Unique invite codes for easy member onboarding
- **Member Roles**: Admin and member role-based permissions
- **Multi-Room Support**: Manage up to 3 active rooms (free tier)

### 💰 Expense Tracking
- **Add Expenses**: Log rent, utilities, groceries, and shared costs
- **Split Types**: 
  - Equal splits (automatic)
  - Exact amounts (custom distribution)
  - Percentage splits (flexible allocation)
- **Expense Categories**: Organize expenses by type (food, utilities, rent, etc.)
- **Expense Details**: Title, amount, date, notes, and receipt attachments
- **Payment Tracking**: Who paid what and when

### ⚖️ Balance Calculations
- **Automatic Balance Computing**: Real-time balance updates per member
- **Settlement Tracking**: Record payments between roommates
- **Net Balance View**: See who owes whom across all rooms
- **Per-Room Breakdown**: Individual room balance summaries

### 👥 Member Management
- **Member Directory**: View all roommates across your rooms
- **Member Profiles**: Names, emails, and shared rooms
- **Role Management**: Admin controls for room settings
- **Activity Tracking**: Member participation in expenses

### 📈 Analytics & Reporting
- **Dashboard Overview**: Key metrics and recent activity
- **Spending Analytics**: 
  - Total income vs expenses
  - Savings calculations
  - Monthly trends
- **Category Reports**: Spending breakdown by expense categories
- **Room Reports**: Per-room expense analysis
- **Monthly Reports**: Year-over-month expense tracking
- **Visual Charts**: Interactive charts using Recharts

### 💳 Income Tracking
- **Personal Income**: Log salary, freelance work, bonuses, rental income
- **Income Categories**: Organize income sources
- **Income Analytics**: Track total earnings and patterns
- **Date Tracking**: Historical income records

### 🎯 Budget Management
- **Budget Creation**: Set spending limits by category
- **Budget Periods**: Monthly or yearly budget cycles
- **Budget Tracking**: Monitor spending against limits
- **Exceeded Budget Alerts**: Visual indicators for overspending
- **Personal & Room Budgets**: Flexible budget scope

### 🔄 Subscription Tracking
- **Recurring Payments**: Track Netflix, Spotify, utilities, etc.
- **Billing Cycles**: Monthly or yearly subscription tracking
- **Next Payment Dates**: Upcoming payment reminders
- **Monthly Equivalent**: Convert yearly costs to monthly for budgeting
- **Total Subscription Cost**: Overview of all recurring expenses

### 📊 Activity Feed
- **Real-time Updates**: Live activity across all rooms
- **Activity Types**:
  - Member joined room
  - Room created
  - Expense added/deleted
  - Settlement completed
- **Activity History**: Recent actions with timestamps
- **Cross-Room Visibility**: See activity from all your rooms

### 🔍 Search & Discovery
- **Global Search**: Find expenses, members, and rooms quickly
- **Smart Filtering**: Filter by date, amount, category, or member
- **Quick Access**: Search popover for fast navigation

### ⚙️ Settings & Preferences
- **Account Settings**: Profile management
- **Theme Toggle**: Dark/light mode switching
- **Currency Settings**: Per-room currency configuration
- **Notification Preferences**: Email and in-app notifications

### 📱 Responsive Design
- **Mobile-First**: Fully responsive across all devices
- **Progressive Web App**: PWA capabilities
- **Touch-Friendly**: Optimized for mobile interactions
- **Desktop Experience**: Enhanced features for larger screens

## 🏗️ Architecture Overview

### Database Schema (PostgreSQL + Prisma)

**Core Models:**
- **User**: Authentication and profile data
- **Room**: Shared spaces with invite codes
- **RoomMember**: Many-to-many relationship with roles
- **Expense**: Financial transactions with split types
- **ExpenseParticipant**: Individual expense shares
- **Settlement**: Payment records between users
- **Category**: Expense and income categorization
- **Budget**: Spending limits by category
- **Income**: Personal earnings tracking
- **Subscription**: Recurring payment management
- **Activity**: Audit trail of all actions

### Frontend Structure

**Pages:**
- `/` - Landing page with marketing content
- `/login` - Authentication forms
- `/signup` - User registration
- `/dashboard` - Main application hub
- `/dashboard/rooms` - Room management
- `/dashboard/expenses` - Expense tracking
- `/dashboard/balances` - Settlement overview
- `/dashboard/members` - Member directory
- `/dashboard/income` - Income management
- `/dashboard/budgets` - Budget tracking
- `/dashboard/subscriptions` - Recurring payments
- `/dashboard/analytics` - Spending insights
- `/dashboard/reports` - Financial reports
- `/dashboard/activity` - Activity feed
- `/dashboard/settings` - User preferences

**Components:**
- Reusable UI components in `/components/ui/`
- Dashboard-specific components in `/components/dashboard/`
- Form components with validation
- Chart components for data visualization

### Backend Actions

**Server Actions:**
- `rooms.ts` - Room CRUD operations
- `expenses.ts` - Expense management and splits
- `balances.ts` - Balance calculations
- `settlements.ts` - Payment tracking
- `budgets.ts` - Budget management
- `subscriptions.ts` - Subscription tracking
- `income.ts` - Income management
- `analytics.ts` - Data aggregation
- `reports.ts` - Report generation
- `activities.ts` - Activity logging
- `categories.ts` - Category management

## 🎯 User Journey Flow

### 1. Onboarding
1. User signs up (Google/email)
2. Creates first room or joins with invite code
3. Invites roommates via shareable link
4. Sets up room preferences (currency, categories)

### 2. Daily Usage
1. Add expenses as they occur
2. Track who paid what
3. View real-time balances
4. Settle up when needed

### 3. Monthly Management
1. Review monthly reports
2. Check budget compliance
3. Analyze spending patterns
4. Plan for upcoming expenses

## 🔒 Security Features

- **Secure Authentication**: NextAuth.js with secure session handling
- **Password Hashing**: bcryptjs for credential storage
- **Input Validation**: Server-side form validation
- **SQL Injection Protection**: Prisma ORM parameterized queries
- **XSS Protection**: React's built-in XSS prevention
- **CSRF Protection**: Next.js built-in CSRF tokens

## 🚀 Performance Optimizations

- **Server Components**: Reduced client-side JavaScript
- **Database Indexing**: Optimized query performance
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic bundle optimization
- **Caching Strategy**: RevalidatePath for cache invalidation

## 📊 Data Management

### Expense Splitting Logic
- **Equal Split**: Amount ÷ Number of members
- **Exact Split**: Custom amounts per member
- **Percentage Split**: Amount × Percentage per member

### Balance Calculation
```javascript
Net Balance = (Expenses Paid) - (Share of Expenses) + (Settlements Received) - (Settlements Paid)
```

### Budget Tracking
- Real-time spending calculation
- Category-based aggregation
- Period-based comparisons (monthly/yearly)

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface
- **Micro-interactions**: Smooth animations and transitions
- **Loading States**: Skeleton loaders and progress indicators
- **Error Handling**: User-friendly error messages
- **Empty States**: Helpful guidance for new users
- **Accessibility**: ARIA labels and keyboard navigation

## 📈 Analytics Features

- **Spending Trends**: Monthly expense patterns
- **Category Breakdown**: Where money is spent
- **Income vs Expenses**: Financial health overview
- **Room Comparisons**: Multi-room spending analysis
- **Savings Tracking**: Net savings calculations

## 🔔 Notification System

- **Activity Feed**: Real-time updates
- **Balance Changes**: Notifications for settlements
- **Budget Alerts**: Overspending warnings
- **Payment Reminders**: Upcoming subscription notifications

## 🌐 Multi-Currency Support

- **Per-Room Currency**: Different currencies per room
- **Currency Symbols**: Automatic symbol display ($, ₹, €, £)
- **Consistent Display**: Proper formatting for each currency

## 📤 Export Capabilities

- **Data Export**: Export expense and balance data
- **Report Generation**: Printable monthly reports
- **CSV Downloads**: Spreadsheet-compatible exports

## 🔧 Development Features

- **TypeScript**: Full type safety
- **ESLint**: Code quality enforcement
- **Hot Reload**: Development efficiency
- **Environment Variables**: Secure configuration
- **Database Seeding**: Sample data for development

## 🚀 Deployment Ready

- **Environment Configuration**: Production-ready setup
- **Database Migrations**: Prisma migration system
- **Build Optimization**: Production build optimizations
- **Error Monitoring**: Structured error logging

## 📋 Feature Completeness Status

### ✅ Fully Implemented
- Authentication system (Google + Email/Password)
- Room management with invite codes
- Expense tracking with all split types
- Balance calculations and settlements
- Member management and roles
- Income tracking and categorization
- Budget management with alerts
- Subscription tracking
- Analytics and reporting
- Activity feed
- Search functionality
- Responsive design
- Dark/light theme
- Multi-currency support

### 🔄 In Progress
- Advanced notification system
- Mobile app notifications
- Advanced reporting features

### 📋 Planned Features
- Receipt image uploads
- Automated expense categorization
- Bank account integration
- Advanced analytics with AI insights
- Mobile applications (iOS/Android)

## 🎯 Business Value

### For Roommates
- **Transparency**: Clear view of all shared expenses
- **Fairness**: Accurate split calculations
- **Convenience**: Mobile-friendly expense tracking
- **Accountability**: Audit trail of all transactions

### For Households
- **Financial Organization**: Centralized expense management
- **Budget Control**: Spending limits and tracking
- **Conflict Reduction**: Clear financial agreements
- **Time Savings**: Automated calculations and tracking

## 🔮 Future Enhancements

- **AI-Powered Insights**: Spending pattern analysis
- **Bank Integration**: Automatic transaction import
- **Bill Reminders**: Smart payment notifications
- **Group Chat**: In-app communication features
- **Advanced Reporting**: Custom report builder
- **API Access**: Third-party integrations

---

*This documentation covers all implemented features as of the current version. RoomSplit is a production-ready application with comprehensive expense management capabilities for shared living situations.*
