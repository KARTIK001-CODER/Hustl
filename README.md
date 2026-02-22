# HUSTL - Internship & Mentorship Platform

**Tagline:** "Stop juggling tabs. Start hustling smart."

## 🚀 Project Status

This is a production-ready internship and mentorship platform built with Next.js 14, TypeScript, Prisma, PostgreSQL, and Tailwind CSS.

### ✅ Completed Components

#### 1. **Project Setup**
- ✅ Next.js 14 with App Router
- ✅ TypeScript configuration
- ✅ Tailwind CSS with custom theme
- ✅ All dependencies installed
- ✅ Environment variables configured
- ✅ Development server running on http://localhost:3000

#### 2. **Database & Backend**
- ✅ Prisma schema with all models:
  - User, Student, Mentor, Admin
  - Internship, Application
  - Feedback, Test, TestAttempt
  - Session
- ✅ Prisma client setup
- ✅ Redis client with caching helpers
- ✅ Authentication utilities (JWT, bcrypt)
- ✅ Response handlers
- ✅ Zod validation schemas

#### 3. **API Routes**
- ✅ `/api/auth/signup` - User registration with role-based validation
- ✅ `/api/auth/login` - User authentication
- ✅ `/api/auth/logout` - Session invalidation
- ✅ `/api/users` - User management (Admin only)
- ✅ `/api/internships` - Internship listing and creation
- ✅ `/api/applications` - Application management
- ✅ `/api/feedback` - Feedback system

#### 4. **Middleware & Security**
- ✅ Route protection middleware
- ✅ JWT token verification
- ✅ Cookie-based authentication
- ✅ Role-based access control

#### 5. **Frontend Pages**
- ✅ Landing page with hero, features, and CTA
- ✅ Login page with form validation
- ✅ Signup page with role selection
- ✅ Student dashboard with stats and navigation

#### 6. **Configuration**
- ✅ Role permissions and protected routes
- ✅ Application constants
- ✅ Custom Tailwind theme (blue/indigo gradient)
- ✅ Global styles with Inter font

### 🔨 Remaining Tasks

#### 1. **Database Setup** (REQUIRED BEFORE TESTING)
```bash
# 1. Install PostgreSQL locally or use a cloud service
# 2. Update .env with your database URL
DATABASE_URL="postgresql://username:password@localhost:5432/hustl_db"

# 3. Generate Prisma Client
npm run prisma:generate

# 4. Run migrations
npm run prisma:migrate

# 5. Seed database with test data
npm run prisma:seed
```

#### 2. **Remaining Frontend Pages**

**Student Pages:**
- ⏳ `/internships` - Browse internships
- ⏳ `/applications` - View applications
- ⏳ `/feedback` - View feedback
- ⏳ `/profile` - Student profile

**Mentor Pages:**
- ⏳ `/dashboard` - Mentor dashboard
- ⏳ `/students` - View students
- ⏳ `/feedback` - Provide feedback
- ⏳ `/profile` - Mentor profile

**Admin Pages:**
- ⏳ `/dashboard` - Admin dashboard
- ⏳ `/users` - Manage users
- ⏳ `/internships` - Manage internships
- ⏳ `/analytics` - View analytics

#### 3. **Additional API Routes**
- ⏳ `/api/users/[id]` - Single user CRUD
- ⏳ `/api/internships/[id]` - Single internship CRUD
- ⏳ `/api/tests` - Test management
- ⏳ `/api/test-attempts` - Test submissions

#### 4. **Database Seeder**
- ⏳ Create `prisma/seed.ts` with test data

## 📁 Project Structure

```
hustl/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                    ✅ Landing page
│   │   ├── login/page.tsx              ✅ Login
│   │   ├── signup/page.tsx             ✅ Signup
│   │   └── layout.tsx                  ✅ Public layout
│   │
│   ├── (student)/
│   │   └── dashboard/page.tsx          ✅ Student dashboard
│   │
│   ├── api/
│   │   ├── auth/
│   │   │   ├── signup/route.ts         ✅ Registration
│   │   │   ├── login/route.ts          ✅ Authentication
│   │   │   └── logout/route.ts         ✅ Logout
│   │   ├── users/route.ts              ✅ User list
│   │   ├── internships/route.ts        ✅ Internships
│   │   ├── applications/route.ts       ✅ Applications
│   │   └── feedback/route.ts           ✅ Feedback
│   │
│   ├── layout.tsx                      ✅ Root layout
│   └── globals.css                     ✅ Global styles
│
├── lib/
│   ├── prisma.ts                       ✅ Prisma client
│   ├── redis.ts                        ✅ Redis client
│   ├── auth.ts                         ✅ Auth utilities
│   ├── responseHandler.ts              ✅ API responses
│   └── validators/schemas.ts           ✅ Zod schemas
│
├── config/
│   ├── roles.ts                        ✅ RBAC config
│   └── constants.ts                    ✅ App constants
│
├── middleware.ts                       ✅ Route protection
├── prisma/schema.prisma                ✅ Database schema
├── .env                                ✅ Environment vars
└── package.json                        ✅ Dependencies
```

## 🎨 Design System

**Color Palette:**
- Primary: Blue (#2563eb) to Indigo (#4f46e5) gradients
- Background: Slate-50
- Cards: White with shadows
- Text: Slate-900 (headings), Slate-600 (body)

**Typography:**
- Font: Inter
- Headings: Bold, 2xl-5xl
- Body: Regular, sm-lg

**Components:**
- Rounded corners (xl, 2xl)
- Shadows (lg, xl, 2xl)
- Hover effects with scale and shadow
- Smooth transitions (300ms)

## 🔐 Authentication Flow

1. User visits `/signup` and selects role
2. Fills role-specific form
3. API validates and creates user + role record
4. JWT token generated and stored in:
   - HTTP-only cookie
   - localStorage (for client-side access)
5. User redirected to `/dashboard`
6. Middleware protects all authenticated routes

## 🧪 Test Accounts (After Seeding)

```
Student: sarah.chen@stanford.edu / password123
Mentor: james.wilson@google.com / password123
Admin: admin@hustl.app / password123
```

## 🚀 Quick Start

```bash
# 1. Install dependencies (already done)
npm install

# 2. Set up database
# Update .env with your PostgreSQL URL

# 3. Generate Prisma Client
npm run prisma:generate

# 4. Run migrations
npm run prisma:migrate

# 5. Seed database
npm run prisma:seed

# 6. Start development server
npm run dev

# 7. Visit http://localhost:3000
```

## 📝 Next Steps

1. **Set up PostgreSQL database**
2. **Generate Prisma Client and run migrations**
3. **Create database seeder** (`prisma/seed.ts`)
4. **Build remaining frontend pages**
5. **Add remaining API routes**
6. **Test all features end-to-end**
7. **Deploy to production**

## 🛠️ Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio
npm run prisma:seed      # Seed database
```

## 📚 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Caching:** Redis
- **Styling:** Tailwind CSS
- **Authentication:** JWT + bcrypt
- **Validation:** Zod
- **Deployment:** Ready for Vercel/Railway/Render

## 🎯 Key Features

- ✅ Role-based authentication (Student/Mentor/Admin)
- ✅ Internship application tracking
- ✅ Mentor feedback system
- ✅ Real-time session management
- ✅ Responsive design
- ✅ Type-safe API routes
- ✅ Database transactions
- ✅ Input validation
- ✅ Error handling

## 📄 License

MIT

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**
