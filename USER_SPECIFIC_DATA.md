# Implementing User-Specific Data in JR-41-Invictus

This document outlines the changes made to implement user-specific data in the JR-41-Invictus application, ensuring that each user can only see their own medications and notifications.

## Backend Changes

### 1. Server Data Structure

The backend server has been modified to store data in a user-specific structure:

```javascript
// Before: Global data structure
let dashboardData = {
  medications: [...],
  // Other data
};

// After: User-specific data structure
let userDatabase = {
  'user123': {
    userId: 'user123',
    medications: [...],
    notifications: [...],
    // Other user-specific data
  },
  'user456': {
    // Another user's data
  }
};
```

### 2. API Endpoints

All API endpoints have been updated to include user ID as a parameter:

- **GET /api/dashboard/:userId** - Get user-specific dashboard data
- **GET /api/medications/:userId** - Get user's medications
- **POST /api/medications** - Add medication (requires userId in body)
- **PUT /api/medications/:medicationId** - Update medication (requires userId in body)
- **DELETE /api/medications/:medicationId** - Delete medication (requires userId in query)
- **GET /api/notifications/:userId** - Get user's notifications
- **POST /api/notifications** - Create notification (requires userId in body)
- **PUT /api/notifications/:notificationId** - Update notification (requires userId in body)
- **DELETE /api/notifications/:notificationId** - Delete notification (requires userId in query)

### 3. Helper Function

A helper function was added to initialize user data if it doesn't exist:

```javascript
function initializeUserData(userId) {
  if (!userDatabase[userId]) {
    userDatabase[userId] = {
      userId: userId,
      profile: { /* ... */ },
      medications: [],
      notifications: [],
      // Other initial data
    };
  }
  return userDatabase[userId];
}
```

## Frontend Changes

### 1. MedicationService

The `MedicationService.ts` file has been updated to include user ID in all API calls:

```typescript
// Before
export const fetchMedications = async () => {
  // ...
};

// After
export const fetchMedications = async (userId: string) => {
  // ...
};

// Before
export const syncMedications = async (medications: any[]) => {
  // ...
};

// After
export const syncMedications = async (userId: string, medications: any[]) => {
  // ...
};
```

### 2. AuthContext

The `AuthContext.tsx` file has been updated to pass the user ID to the medication service:

```typescript
// Before
if (data.medicalInfo.medications) {
  await syncMedications(data.medicalInfo.medications);
}

// After
if (data.medicalInfo.medications) {
  await syncMedications(currentUser.uid, data.medicalInfo.medications);
}
```

### 3. NotificationService

The `NotificationService.ts` file has been updated to store notifications in both Firebase and the backend API:

```typescript
// Added code to store notifications in backend API
try {
  await fetch(`${API_URL}/notifications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId: reminder.userId,
      title: `Time to take ${reminder.medicationName}`,
      message: `Dosage: ${reminder.dosage}\n${reminder.instructions || ''}`,
      type: 'medication_reminder',
      medicationId: reminder.medicationId,
      reminderId: reminder.id,
      read: false
    }),
  });
} catch (apiError) {
  console.error('Error storing notification in backend API:', apiError);
  // Continue even if backend API fails - we already stored in Firebase
}
```

### 4. NotificationsPanel

The `NotificationsPanel.tsx` component has been updated to fetch notifications from both Firebase and the backend API:

```typescript
// Added function to fetch notifications from backend API
const fetchBackendNotifications = async () => {
  if (!currentUser) return;
  
  try {
    const response = await fetch(`${API_URL}/notifications/${currentUser.uid}`);
    
    if (!response.ok) {
      console.error('Failed to fetch notifications from backend API');
      return;
    }
    
    const backendNotifications = await response.json();
    
    // Process backend notifications if needed
    console.log('Backend notifications:', backendNotifications);
  } catch (error) {
    console.error('Error fetching backend notifications:', error);
  }
};
```

## Implementation Steps

1. Update the backend server to use a user-specific data structure
2. Modify all API endpoints to include user ID
3. Update frontend services to pass user ID to API calls
4. Add medication stock tracking functionality
   - Update Medication interfaces to include stock property
   - Modify backend endpoints to handle stock data
   - Update frontend components to display and manage stock
5. Test the implementation by creating notifications for different users

## Medication Stock Tracking

The application now includes functionality to track medication stock (number of pills available):

1. **Data Structure**: The Medication interface has been updated to include a `stock` property:
   ```typescript
   export interface Medication {
     // existing properties
     stock?: number; // Number of pills available
   }
   ```

2. **Backend Changes**:
   - The medication creation endpoint now accepts a `stock` parameter
   - The medication update endpoint tracks stock changes
   - Activity logs include information about stock changes

3. **Frontend Changes**:
   - The medication form now includes a field for entering stock
   - The dashboard displays the current stock for each medication
   - When stock is low (below a threshold), a visual indicator is shown

4. **Usage**:
   - When adding a medication, users can specify the initial stock
   - When taking a medication, stock is automatically decremented
   - Users can manually update stock when refilling prescriptions

## Security Considerations

1. Always validate the user ID on the server side
2. Implement proper authentication to ensure users can only access their own data
3. Consider adding Firebase security rules to restrict access to user-specific data
4. Add error handling for cases where user ID is missing or invalid

## Testing

To test the implementation:

1. Create multiple user accounts
2. Add medications and notifications for each user
3. Verify that each user can only see their own data
4. Test edge cases like missing user ID or invalid user ID 