# 💊 Mindful Meds

A modern medication management platform that helps patients track medications and enables caregivers to monitor adherence remotely.

## What It Does

**For Patients:**
- Track medications with dosage, timing, and instructions
- Get smart reminders and notifications
- Monitor medication stock levels
- Find nearby pharmacies with Google Maps integration
- View medication schedule in grid, timeline, or calendar views

**For Caregivers (Dear Ones):**
- Monitor patient medication adherence
- Receive alerts for missed doses or low stock
- View patient medication schedule remotely
- Support multiple patients

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Backend:** Firebase (Auth + Firestore)
- **UI:** Tailwind CSS + shadcn/ui
- **Maps:** Google Maps API (Places + JavaScript API)

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env` file:
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Google Maps (Optional)
VITE_GOOGLE_MAPS_API_KEY=your_maps_api_key
```

### 3. Set Up Firestore Rules
In Firebase Console → Firestore Database → Rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 4. Run Development Server
```bash
npm run dev
```

## How to Use

### As a Patient:
1. **Register** → Create account as "Patient"
2. **Add Medications** → Click "My Medications" → "Add Medication"
3. **Mark as Taken** → Click checkmark icon on medication card
4. **Manage Stock** → Add pill count when adding medication
5. **Add Caregivers** → Go to Profile → "Dear Ones" → Add caregiver email

### As a Caregiver (Dear One):
1. **Register** → Create account as "Dear One"
2. **Get Added** → Patient must add your email to their Dear Ones list
3. **Login** → Use Dear Ones Portal to view patient medications
4. **Monitor** → Receive notifications about patient adherence

## License\n\nMIT License - Feel free to use this project for learning and development.
