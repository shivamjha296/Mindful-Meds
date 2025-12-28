# 💊 Mindful Meds - Comprehensive Medication Management System

<div align="center">

![Mindful Meds](https://img.shields.io/badge/Medication-Management-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-3178C6?style=for-the-badge&logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-11.4.0-FFCA28?style=for-the-badge&logo=firebase)
![Vite](https://img.shields.io/badge/Vite-5.4.1-646CFF?style=for-the-badge&logo=vite)

**A modern, comprehensive medication tracking and management platform designed to help patients maintain medication adherence while keeping caregivers informed.**

[Features](#-key-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Usage](#-usage) • [Architecture](#-architecture)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [Architecture](#-architecture)
- [Features Deep Dive](#-features-deep-dive)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**Mindful Meds** is a cutting-edge medication management application designed to solve the common problem of medication non-adherence. Built with React, TypeScript, and Firebase, this platform provides patients with an intuitive interface to track their medications while allowing trusted caregivers (Dear Ones) to monitor and support medication adherence remotely.

### Why Mindful Meds?

- **50% of patients** don't take medications as prescribed
- **125,000 deaths** annually in the US due to medication non-adherence
- **$100-$300 billion** in avoidable healthcare costs each year

Mindful Meds addresses these issues by providing:
- Smart reminders and notifications
- Visual medication tracking
- Caregiver monitoring capabilities
- Stock management with pharmacy finder
- Comprehensive adherence reporting

---

## ✨ Key Features

### 🏥 For Patients

#### 1. **Comprehensive Medication Management**
- ✅ Add, edit, and delete medications with detailed information
- ✅ Track dosage, frequency, timing, and special instructions
- ✅ Set start and end dates for treatment courses
- ✅ Color-coded medication cards for quick visual identification
- ✅ Real-time medication stock tracking
- ✅ Low stock alerts and out-of-stock warnings

#### 2. **Smart Medication Dashboard**
- ✅ **Three Viewing Modes:**
  - **Grid View**: Card-based overview of all medications
  - **Timeline View**: Chronological display organized by hour
  - **Calendar View**: Date-based medication schedule
- ✅ User preference saving for default view
- ✅ Today's medication schedule at a glance
- ✅ Adherence rate tracking and visualization
- ✅ Quick-action buttons for marking medications as taken

#### 3. **Intelligent Notification System**
- ✅ Browser push notifications for medication reminders
- ✅ Customizable notification preferences:
  - Reminder notifications
  - Missed dose alerts
  - Refill reminders
  - Custom reminder timing
- ✅ Notification history tracking in Firebase
- ✅ Real-time notification panel with unread indicators
- ✅ Automatic notifications to Dear Ones for critical events

#### 4. **Stock Management & Pharmacy Finder**
- ✅ Real-time medication stock tracking (pill count)
- ✅ Automatic stock depletion when marking medications as taken
- ✅ Low stock warnings (< 5 pills)
- ✅ Out-of-stock alerts
- ✅ **Advanced Pharmacy Finder:**
  - Google Maps integration
  - Automatic location detection
  - Nearby pharmacy search with customizable radius
  - Interactive map with pharmacy markers
  - Pharmacy details (name, address, phone, hours)
  - One-click directions via Google Maps
  - Fallback mode if Maps API is unavailable

#### 5. **Medical Profile Management**
- ✅ Complete medical information storage:
  - Height, weight, blood type
  - Allergies and sensitivities
  - Medical conditions with diagnosis dates
  - Treatment history
  - Emergency contact information
- ✅ Medication history tracking
- ✅ Monthly adherence reports
- ✅ Profile customization (avatar, bio, contact info)

#### 6. **Medication Tracker**
- ✅ Historical medication intake tracking
- ✅ Calendar-based history view
- ✅ Daily adherence summaries
- ✅ Status tracking (taken, missed, skipped)
- ✅ Timeline and list view options
- ✅ Adherence rate calculations
- ✅ Visual adherence indicators

### 👥 For Caregivers (Dear Ones)

#### 7. **Dear Ones Portal**
- ✅ Dedicated caregiver access portal
- ✅ Separate authentication system
- ✅ Secure connection to patient accounts
- ✅ **Granular Access Permissions:**
  - View medications
  - View adherence history
  - View medication calendar
  - Mark medications as taken
- ✅ **Customizable Notification Preferences:**
  - Missed dose alerts
  - Low stock notifications
  - Prescription updates
  - Critical alerts

#### 8. **Caregiver Monitoring Features**
- ✅ Real-time medication status monitoring
- ✅ Patient adherence tracking
- ✅ Medication calendar access
- ✅ Remote medication management capabilities
- ✅ Activity history view
- ✅ Multiple caregivers support
- ✅ Relationship designation (family, friend, healthcare provider)

### 🔐 Security & Authentication

#### 9. **Robust Authentication System**
- ✅ Firebase Authentication integration
- ✅ Email/password authentication
- ✅ **Dual User Types:**
  - Patient accounts
  - Dear One (caregiver) accounts
- ✅ Protected routes based on user type
- ✅ Password change functionality
- ✅ Secure session management
- ✅ User-specific data isolation

### 📊 Data Management

#### 10. **Comprehensive Data Architecture**
- ✅ **Firebase Firestore Integration:**
  - Real-time data synchronization
  - User-specific data storage
  - Subcollections for notifications
- ✅ **Backend API Server:**
  - Express.js REST API
  - User-specific medication endpoints
  - Dashboard data management
  - Activity tracking
- ✅ **Data Synchronization:**
  - Frontend-backend data sync
  - Firebase-backend coordination
  - Automatic conflict resolution

### 🎨 User Interface

#### 11. **Modern, Responsive Design**
- ✅ Built with Shadcn/ui component library
- ✅ Tailwind CSS for styling
- ✅ Fully responsive (mobile, tablet, desktop)
- ✅ Dark mode support (via next-themes)
- ✅ Glassmorphism effects
- ✅ Smooth animations and transitions
- ✅ Accessible UI components (ARIA compliant)
- ✅ Toast notifications for user feedback

#### 12. **Advanced UI Components**
- ✅ Custom medication cards with status indicators
- ✅ Interactive calendars with date selection
- ✅ Timeline visualization
- ✅ Progress bars and charts
- ✅ Modals and dialogs
- ✅ Form validation with React Hook Form + Zod
- ✅ Loading states and skeletons
- ✅ Error boundaries

---

## 🛠 Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3.1 | UI framework |
| **TypeScript** | 5.5.3 | Type-safe development |
| **Vite** | 5.4.1 | Build tool and dev server |
| **React Router** | 6.26.2 | Client-side routing |
| **Tailwind CSS** | 3.4.11 | Utility-first CSS framework |
| **Shadcn/ui** | Latest | Component library |
| **Radix UI** | Latest | Accessible component primitives |

### Backend & Services

| Technology | Version | Purpose |
|------------|---------|---------|
| **Firebase** | 11.4.0 | Authentication & Database |
| **Express.js** | 4.18.2 | REST API server |
| **Node.js** | Latest | Server runtime |

### State Management & Forms

| Technology | Version | Purpose |
|------------|---------|---------|
| **React Hook Form** | 7.53.0 | Form handling |
| **Zod** | 3.23.8 | Schema validation |
| **TanStack Query** | 5.56.2 | Data fetching & caching |

### Additional Libraries

| Technology | Version | Purpose |
|------------|---------|---------|
| **date-fns** | 3.6.0 | Date manipulation |
| **Lucide React** | 0.462.0 | Icon library |
| **Recharts** | 2.12.7 | Data visualization |
| **Sonner** | 1.5.0 | Toast notifications |
| **Google Maps API** | N/A | Pharmacy location services |

---

## 📦 Installation

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Firebase Account** (for authentication and database)
- **Google Maps API Key** (optional, for pharmacy finder)

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/mindful-meds.git
cd mindful-meds
```

### Step 2: Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd src/backend
npm install
cd ../..
```

### Step 3: Firebase Setup

1. Create a new Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** (Email/Password)
3. Create a **Firestore Database**
4. Copy your Firebase configuration

### Step 4: Environment Configuration

Create a `.env` file in the root directory:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Google Maps API (Optional - for pharmacy finder)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Backend API URL
VITE_API_URL=http://localhost:3001
```

### Step 5: Firestore Security Rules

Add these security rules to your Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profiles - users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // User notifications subcollection
      match /notifications/{notificationId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Allow caregivers to read patient data if they're in the dearOnes array
    match /users/{userId} {
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(userId)) &&
        get(/databases/$(database)/documents/users/$(userId)).data.dearOnes[request.auth.email] != null;
    }
  }
}
```

### Step 6: Start the Application

```bash
# Terminal 1: Start the frontend
npm run dev

# Terminal 2: Start the backend API
cd src/backend
npm start
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

---

## ⚙️ Configuration

### Google Maps API Setup (Optional)

For the pharmacy finder feature to work:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable these APIs:
   - Maps JavaScript API
   - Places API
   - Directions API
4. Create an API key with appropriate restrictions
5. Add the key to your `.env` file as `VITE_GOOGLE_MAPS_API_KEY`

### Notification Permissions

Browser notifications require user permission. The app will:
1. Automatically request permission on first login
2. Show a permission prompt in the notifications panel
3. Store the permission status in localStorage
4. Respect browser notification settings

---

## 🚀 Usage

### For Patients

#### Getting Started
1. **Register** as a patient on the Auth page
2. **Complete your profile** with medical information
3. **Add medications** with dosage, frequency, and timing
4. **Enable notifications** to receive medication reminders

#### Daily Usage
1. **Check Dashboard** to see today's medications
2. **Mark medications as taken** when you take them
3. **Monitor stock levels** and refill when needed
4. **Use Pharmacy Finder** when running low on medications

#### Managing Caregivers
1. Navigate to **Profile** → **Dear Ones** tab
2. Click **"Add Dear One"**
3. Enter caregiver details and relationship
4. Set **access permissions** for what they can view/do
5. Configure **notification preferences** for alerts
6. Send invitation (they'll need to register as a Dear One)

### For Caregivers (Dear Ones)

#### Getting Started
1. **Register** as a Dear One on the Auth page
2. **Navigate** to the Dear Ones Portal
3. **Login** with your credentials
4. System will automatically connect you to your patient

#### Monitoring Patient
1. **View Medications** tab to see all active medications
2. **Check Adherence** tab to monitor medication compliance
3. **View Calendar** to see upcoming medication schedule
4. **Receive Notifications** for missed doses or low stock

---

## 🏗 Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐  │
│  │   Pages    │  │ Components │  │   Context/State       │  │
│  │            │  │            │  │   - AuthContext       │  │
│  │ - Auth     │  │ - Navbar   │  │   - Notification      │  │
│  │ - Dashboard│  │ - Cards    │  │     Context           │  │
│  │ - Profile  │  │ - Calendar │  │                       │  │
│  │ - Tracker  │  │ - Timeline │  │   Services            │  │
│  │ - Portal   │  │ - Dialogs  │  │   - Medication        │  │
│  │            │  │            │  │   - Notification      │  │
│  └────────────┘  └────────────┘  └──────────────────────┘  │
└───────────┬─────────────────────────────────┬───────────────┘
            │                                 │
            │ Firebase SDK                    │ REST API
            │                                 │
    ┌───────▼────────┐              ┌────────▼─────────┐
    │                │              │                   │
    │    Firebase    │              │  Express Backend  │
    │                │              │                   │
    │  - Auth        │              │  - Medications    │
    │  - Firestore   │◄─────────────┤  - Dashboard      │
    │  - Storage     │   Sync       │  - Activity       │
    │                │              │                   │
    └────────────────┘              └───────────────────┘
```

### Data Flow

#### User Authentication
```
User Input → Firebase Auth → AuthContext → Protected Routes → User Profile
```

#### Medication Management
```
Add/Edit Med → Form Validation (Zod) → Firebase Firestore → Backend API → Context Update → UI Refresh
```

#### Notifications
```
Scheduled Event → Notification Service → Browser API → Firebase Store → Context → UI Notification Panel
```

### File Structure

```
mindful-meds/
├── public/                          # Static assets
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   ├── components/                  # Reusable components
│   │   ├── ui/                      # Shadcn UI components
│   │   ├── profile/                 # Profile-specific components
│   │   ├── AddMedication.tsx        # Medication form
│   │   ├── MedicationCard.tsx       # Individual med card
│   │   ├── MedicationDashboard.tsx  # Main dashboard
│   │   ├── NotificationsPanel.tsx   # Notification UI
│   │   ├── PharmacyFinderAdvanced.tsx # Pharmacy finder
│   │   ├── TimelineView.tsx         # Timeline visualization
│   │   └── ...
│   ├── pages/                       # Route pages
│   │   ├── Auth.tsx                 # Login/Register
│   │   ├── Dashboard.tsx            # Main dashboard
│   │   ├── Profile.tsx              # User profile
│   │   ├── MedicationTracker.tsx    # History tracker
│   │   ├── DearOnesPortal.tsx       # Caregiver portal
│   │   └── ...
│   ├── lib/                         # Core libraries
│   │   ├── AuthContext.tsx          # Authentication context
│   │   ├── NotificationContext.tsx  # Notification context
│   │   ├── firebase.ts              # Firebase config
│   │   ├── constants.ts             # App constants
│   │   └── utils.ts                 # Utility functions
│   ├── services/                    # API services
│   │   ├── medicationService.ts     # Medication CRUD
│   │   └── notificationService.ts   # Notification logic
│   ├── utils/                       # Utility functions
│   │   └── notificationUtils.ts     # Notification helpers
│   ├── hooks/                       # Custom React hooks
│   │   ├── use-toast.ts
│   │   └── use-mobile.tsx
│   ├── types/                       # TypeScript definitions
│   │   └── google-maps.d.ts
│   ├── backend/                     # Express backend
│   │   ├── server.js                # Main server
│   │   ├── emailService.ts          # Email notifications
│   │   ├── smsService.ts            # SMS notifications
│   │   └── dearOnesNotifications.ts # Caregiver alerts
│   ├── App.tsx                      # Root component
│   ├── main.tsx                     # Entry point
│   └── index.css                    # Global styles
├── package.json                     # Dependencies
├── vite.config.ts                   # Vite configuration
├── tailwind.config.ts               # Tailwind config
├── tsconfig.json                    # TypeScript config
└── README.md                        # This file
```

---

## 🔍 Features Deep Dive

### Medication Stock Management

The stock management system intelligently tracks medication inventory:

**How It Works:**
1. When adding a medication, specify initial stock count
2. Each time medication is marked as taken, stock decrements by 1
3. System shows visual indicators:
   - ✅ **Green**: Sufficient stock (> 5 pills)
   - ⚠️ **Yellow**: Low stock warning (1-5 pills)
   - ❌ **Red**: Out of stock (0 pills)
4. Low stock triggers:
   - Visual badge on medication card
   - Optional notification to user
   - "Find Nearby Pharmacies" button appears
   - Notification to Dear Ones (if enabled)

**Refill Feature:**
- Quick refill button on each medication card
- Enter number of pills to add
- Updates stock instantly across all views

### Pharmacy Finder Integration

Advanced pharmacy locator with Google Maps:

**Features:**
- **Automatic Location Detection**: Uses browser geolocation API
- **Radius Search**: Customizable search radius (1-25 miles)
- **Interactive Map**: Markers for each pharmacy location
- **Pharmacy Details**:
  - Name and address
  - Distance from user
  - Phone number
  - Operating hours
  - Currently open/closed status
- **One-Click Directions**: Opens Google Maps with route
- **Fallback Mode**: Works without API key (manual search)

**Privacy:**
- Location only used for search
- Not stored or transmitted
- User can manually enter location
- Respects browser privacy settings

### Notification System Architecture

Multi-layered notification system:

**Browser Notifications:**
```typescript
// Medication Reminder
{
  title: "Time to take Lisinopril",
  body: "Dosage: 10mg\nInstructions: Take with food",
  icon: "/logo.png",
  badge: "/logo.png",
  timestamp: Date.now()
}
```

**Firebase Storage:**
```typescript
// Stored in Firestore
/users/{userId}/notifications/{notificationId}
{
  title: string,
  body: string,
  read: boolean,
  timestamp: Timestamp,
  type: 'reminder' | 'alert' | 'info',
  data: object
}
```

**Dear One Notifications:**
- Automatically sent for:
  - Missed doses (customizable threshold)
  - Low medication stock
  - Out of stock situations
  - Critical alerts
- Respects Dear One notification preferences
- Sent via email/SMS (backend services)

### Dear Ones Permission System

Granular access control for caregivers:

**Permission Types:**

1. **View Medications** (`viewMedications`)
   - See list of all patient medications
   - View dosage and schedule information
   - Access medication details

2. **View Adherence** (`viewAdherence`)
   - View medication adherence statistics
   - See historical intake data
   - Access adherence reports

3. **View Calendar** (`viewCalendar`)
   - See upcoming medication schedule
   - View medication calendar
   - Check past medication dates

4. **Mark As Taken** (`markAsTaken`)
   - Mark medications as taken on behalf of patient
   - Update medication status
   - Record intake time

**Implementation:**
```typescript
interface AccessPermissions {
  viewMedications: boolean;
  viewAdherence: boolean;
  viewCalendar: boolean;
  markAsTaken: boolean;
}

// Usage in components
{dearOne.accessPermissions.viewMedications && (
  <MedicationList />
)}
```

### Adherence Tracking Algorithm

Sophisticated adherence calculation:

**Daily Adherence:**
```typescript
Daily Adherence = (Taken Medications / Scheduled Medications) × 100
```

**Overall Adherence:**
```typescript
Overall Adherence = (Total Taken / Total Scheduled) × 100
```

**Factors Considered:**
- Medications taken on time
- Medications taken late (still counts as taken)
- Missed medications
- Skipped medications (user-initiated)
- Medication frequency (daily, twice-daily, etc.)
- Active date range (start date to end date)

**Reporting:**
- Real-time adherence percentage
- Visual progress bars
- Color-coded indicators
- Historical adherence graphs
- Monthly adherence reports

---

## 📡 API Documentation

### Backend REST API

**Base URL:** `http://localhost:3001/api`

#### Medications

**Get User Medications**
```http
GET /dashboard/:userId
Response: {
  medications: Medication[],
  stats: DashboardStats,
  recentActivity: Activity[]
}
```

**Add Medication**
```http
POST /dashboard/medications
Body: {
  userId: string,
  name: string,
  dosage: string,
  frequency: string,
  timeOfDay: string,
  startDate: Date,
  notes?: string,
  stock?: number
}
Response: { medication: Medication }
```

**Update Medication**
```http
PUT /medications/:medicationId
Body: {
  userId: string,
  ...updates
}
Response: { medication: Medication }
```

**Delete Medication**
```http
DELETE /medications/:medicationId?userId={userId}
Response: { success: boolean }
```

### Firebase Firestore Structure

```
/users/{userId}
  - uid: string
  - fullName: string
  - email: string
  - userType: 'patient' | 'dearOne'
  - medications: Medication[]
  - dearOnes: DearOne[]
  - medicalInfo: MedicalInfo
  - notificationPreferences: NotificationPreferences
  - createdAt: Timestamp
  - updatedAt: Timestamp
  
  /notifications/{notificationId}
    - title: string
    - body: string
    - read: boolean
    - timestamp: Timestamp
    - type: string
    - data: object
```

---

## 🧪 Testing

### Manual Testing Checklist

**Authentication:**
- [ ] User registration (patient)
- [ ] User registration (dear one)
- [ ] Login with email/password
- [ ] Logout
- [ ] Protected route access
- [ ] Password change

**Medication Management:**
- [ ] Add new medication
- [ ] Edit medication
- [ ] Delete medication
- [ ] Mark as taken
- [ ] Stock increment/decrement
- [ ] Low stock warning
- [ ] Out of stock alert

**Dashboard Views:**
- [ ] Grid view
- [ ] Timeline view
- [ ] Calendar view
- [ ] View preference saving
- [ ] Medication filtering

**Notifications:**
- [ ] Browser permission request
- [ ] Medication reminders
- [ ] Notification panel
- [ ] Mark as read
- [ ] Dear one notifications

**Dear Ones Portal:**
- [ ] Caregiver login
- [ ] Patient connection
- [ ] Permission-based access
- [ ] Medication viewing
- [ ] Adherence monitoring

**Pharmacy Finder:**
- [ ] Location detection
- [ ] Pharmacy search
- [ ] Map display
- [ ] Directions link
- [ ] Fallback mode

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Code Standards

- Use TypeScript for type safety
- Follow React best practices
- Use functional components with hooks
- Implement proper error handling
- Add comments for complex logic
- Write descriptive commit messages

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Shadcn/ui** for the beautiful component library
- **Radix UI** for accessible component primitives
- **Firebase** for authentication and database services
- **Google Maps** for location services
- **Lucide** for the icon set
- **Vite** for blazing-fast development

---

## 📞 Support

For support, questions, or feature requests:

- **Email**: support@mindfulmeds.com
- **GitHub Issues**: [Create an issue](https://github.com/yourusername/mindful-meds/issues)
- **Documentation**: [View Docs](https://docs.mindfulmeds.com)

---

## 🗺️ Roadmap

### Upcoming Features

- [ ] **Mobile Apps** (iOS & Android with React Native)
- [ ] **Medication Reminders via SMS**
- [ ] **Voice Assistant Integration** (Alexa, Google Assistant)
- [ ] **Prescription OCR** (scan and auto-add medications)
- [ ] **Insurance Integration** for coverage checks
- [ ] **Pharmacy API Integration** for real-time stock checks
- [ ] **Doctor Portal** for prescription management
- [ ] **Health Data Export** (PDF reports, CSV)
- [ ] **Medication Interaction Checker**
- [ ] **Multi-language Support**
- [ ] **Offline Mode** with sync when online
- [ ] **Apple Health / Google Fit Integration**
- [ ] **Wearable Device Support** (Apple Watch, Fitbit)
- [ ] **Telemedicine Integration**
- [ ] **AI-powered Adherence Predictions**

---

<div align="center">

**Built with ❤️ for better health outcomes**

⭐ Star this repo if you find it helpful!

</div>