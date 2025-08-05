# Fire Tracker - Multi-Tenant Architecture Plan

## 🎯 **Multi-Tenancy Overview**

Currently, your Fire Tracker is a **single-tenant application** where all data is shared. To support multiple users, we need to implement **Row-Level Security (RLS)** multi-tenancy.

---

## 🏗️ **Current Issues**

### ❌ **Missing User Context**
- No `userId` fields in database models
- No user data isolation
- All users would see each other's data
- No authentication-based data filtering

### ❌ **Security Vulnerabilities**
- API endpoints don't filter by user
- Database queries return all records
- No authorization checks

---

## ✅ **Recommended Multi-Tenant Architecture**

### **Option 1: Row-Level Security (Recommended)**
- Single database with `userId` field in each table
- Clerk user ID as the tenant identifier
- API-level filtering by authenticated user
- Best for your current use case

### **Option 2: Database Per Tenant**
- Separate database for each user
- More complex but better isolation
- Overkill for personal finance app

### **Option 3: Schema Per Tenant**
- Separate schema per user in same database
- Complex setup, not recommended for SQLite

---

## 🔧 **Implementation Plan for Row-Level Security**

### **Phase 1: Database Schema Updates**

#### Add User Fields to All Models
```prisma
model User {
  id        String   @id // Clerk user ID
  email     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relationships
  accounts     Account[]
  transactions Transaction[]
  fds          FD[]
  gold         Gold[]
  goals        Goal[]
}

model Account {
  id        String   @id @default(uuid())
  name      String
  balance   Float
  createdAt DateTime @default(now())
  userId    String   // Add user foreign key
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Existing relationships
  transactions Transaction[]
  fds       FD[]
}

// Apply same pattern to all models...
```

### **Phase 2: API Security Updates**

#### Update All API Routes
```typescript
// Example: /api/accounts/route.ts
export async function GET(request: NextRequest) {
  const { userId } = auth() // Get user from Clerk
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const accounts = await prisma.account.findMany({
    where: { userId }, // Only return user's data
  })
  
  return NextResponse.json(accounts)
}
```

### **Phase 3: Frontend User Context**

#### Add User Context Provider
```typescript
// contexts/UserContext.tsx
export const UserProvider = ({ children }) => {
  const { user } = useUser()
  return (
    <UserContext.Provider value={{ user }}>
      {children}
    </UserContext.Provider>
  )
}
```

---

## 📋 **Step-by-Step Implementation**

### **Step 1: Update Database Schema**
1. Add User model
2. Add userId to all existing models
3. Add foreign key relationships
4. Create migration

### **Step 2: Data Migration**
1. Create default user for existing data
2. Assign all existing records to default user
3. Verify data integrity

### **Step 3: Update API Routes**
1. Add authentication checks
2. Filter queries by userId
3. Validate user ownership
4. Update all CRUD operations

### **Step 4: Update Frontend**
1. Add user context
2. Update data fetching
3. Add loading states
4. Handle authentication flows

### **Step 5: Testing**
1. Test with multiple users
2. Verify data isolation
3. Test authentication flows
4. Performance testing

---

## 🚀 **Database Migration Strategy**

### **Option A: Gradual Migration (Recommended)**
1. Add optional userId fields
2. Populate with default user
3. Make fields required
4. Update application logic

### **Option B: Fresh Start**
1. Export existing data
2. Update schema completely
3. Re-import with user associations
4. More disruptive but cleaner

---

## 🔐 **Security Considerations**

### **Authentication Flow**
```typescript
// middleware.ts - Update to handle user context
export default clerkMiddleware((auth, req) => {
  // Protect all API routes except public ones
  if (req.nextUrl.pathname.startsWith('/api/')) {
    const { userId } = auth()
    if (!userId && !publicRoutes.includes(req.nextUrl.pathname)) {
      return new Response('Unauthorized', { status: 401 })
    }
  }
})
```

### **Data Access Patterns**
```typescript
// utils/dataAccess.ts
export const getUserData = async (userId: string, model: string) => {
  // Centralized data access with user filtering
  return prisma[model].findMany({
    where: { userId }
  })
}
```

---

## 📊 **Database Schema Changes Required**

### **Before (Current)**
```prisma
model Account {
  id        String   @id @default(uuid())
  name      String
  balance   Float
  // No user association
}
```

### **After (Multi-tenant)**
```prisma
model Account {
  id        String   @id @default(uuid())
  name      String
  balance   Float
  userId    String   // New field
  user      User     @relation(fields: [userId], references: [id])
  
  @@index([userId]) // Performance optimization
}
```

---

## 🎯 **Implementation Priority**

### **High Priority (Phase 1 Completion)**
1. ✅ Add User model to schema
2. ✅ Add userId to all models
3. ✅ Create migration
4. ✅ Update API routes for user filtering

### **Medium Priority**
1. Update frontend with user context
2. Add proper error handling
3. Implement data validation

### **Low Priority**
1. Performance optimizations
2. Advanced security features
3. User management features

---

## 🔄 **Migration Timeline**

### **Week 1: Database Updates**
- Schema changes
- Migration creation
- Data migration testing

### **Week 2: API Security**
- Update all API routes
- Add authentication checks
- Test data isolation

### **Week 3: Frontend Updates**
- User context implementation
- UI updates for multi-user
- Testing and bug fixes

### **Week 4: Testing & Deployment**
- Comprehensive testing
- Performance optimization
- Production deployment

---

## 💡 **Recommendations**

### **For Your Use Case**
1. **Start with Row-Level Security** - Simplest and most appropriate
2. **Use Clerk User IDs** - Already integrated, reliable
3. **Gradual migration** - Less disruptive to current functionality
4. **SQLite → PostgreSQL** - Consider for production multi-tenancy

### **Production Considerations**
- **Database**: Upgrade to PostgreSQL for better multi-tenancy support
- **Hosting**: Vercel/Railway for easy Clerk integration
- **Monitoring**: Add user activity tracking
- **Backup**: Per-user data export capabilities

---

## 🚀 **Ready to Start?**

The next logical step would be to implement the database schema changes first. Would you like me to:

1. **Update the Prisma schema** with User model and userId fields?
2. **Create the migration** to add multi-tenancy?
3. **Update a sample API route** to show the pattern?

This would transform your single-user Fire Tracker into a proper multi-tenant SaaS application!
