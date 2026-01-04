import { Medication } from '@/lib/AuthContext';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, setDoc } from 'firebase/firestore';
import { notifyPrescriptionUpdates } from '@/backend/dearOnesNotifications';
import { sendMedicationTakenNotification } from '@/utils/notificationUtils';
import { API_URL, MEDICATION_COLORS } from "@/lib/constants";

// Helper function to get the current user ID
const getCurrentUserId = () => {
  const user = auth.currentUser;
  return user ? user.uid : null;
};

// Fetch medications from Firebase
export const fetchMedications = async () => {
  try {
    const userId = getCurrentUserId();
    if (!userId) {
      console.error('No user is currently logged in');
      return [];
    }
    
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.error('User document not found');
      return [];
    }
    
    const userData = userDoc.data();
    return userData.medications || [];
  } catch (error) {
    console.error('Error fetching medications:', error);
    return [];
  }
};

// Normalize medication data between Firebase and backend formats
export const normalizeMedication = (medication: any) => {
  // Handle Firebase Timestamp objects
  const getDateValue = (dateField: any) => {
    if (!dateField) return null;
    
    // Handle Firebase Timestamp
    if (dateField && dateField.seconds !== undefined) {
      return new Date(dateField.seconds * 1000);
    }
    
    // Handle Date objects
    if (dateField instanceof Date) {
      return dateField;
    }
    
    // Handle ISO strings
    if (typeof dateField === 'string') {
      try {
        const date = new Date(dateField);
        // Check if date is valid
        if (!isNaN(date.getTime())) {
          return date;
        }
      } catch (e) {
        console.error("Invalid date string:", dateField);
      }
    }
    
    return new Date(); // Default to current date if invalid
  };
  
  // Validate that this is actually a medication object
  if (!medication || !medication.name || !medication.dosage) {
    console.error("Invalid medication object:", medication);
    return null;
  }
  
  return {
    id: medication.id || String(Date.now()),
    name: medication.name,
    dosage: medication.dosage,
    frequency: medication.frequency || 'Once daily',
    timeOfDay: medication.timeOfDay || medication.time || '08:00',
    startDate: getDateValue(medication.startDate),
    endDate: getDateValue(medication.endDate),
    notes: medication.notes || medication.instructions || '',
    taken: medication.taken || false,
    stock: medication.stock !== undefined ? medication.stock : 0,
    addedAt: getDateValue(medication.addedAt) || getDateValue(medication.createdAt) || new Date()
  };
};

// Convert Firebase medication to frontend format
export const convertToFrontendFormat = (medication: any): Medication | null => {
  const normalized = normalizeMedication(medication);
  
  // If normalization failed, return null
  if (!normalized) {
    return null;
  }
  
  return {
    id: normalized.id,
    name: normalized.name,
    dosage: normalized.dosage,
    frequency: normalized.frequency,
    time: normalized.timeOfDay,
    startDate: normalized.startDate ? normalized.startDate.toISOString() : new Date().toISOString(),
    endDate: normalized.endDate ? normalized.endDate.toISOString() : undefined,
    instructions: normalized.notes,
    color: MEDICATION_COLORS[Math.floor(Math.random() * MEDICATION_COLORS.length)],
    taken: normalized.taken,
    stock: normalized.stock,
    createdAt: normalized.addedAt
  };
};

// Convert frontend medication to Firebase format
export const convertToFirebaseFormat = (medication: Medication) => {
  return {
    id: medication.id,
    name: medication.name,
    dosage: medication.dosage,
    frequency: medication.frequency,
    timeOfDay: medication.time,
    startDate: medication.startDate ? new Date(medication.startDate) : new Date(),
    endDate: medication.endDate ? new Date(medication.endDate) : null,
    notes: medication.instructions || '',
    taken: medication.taken || false,
    stock: medication.stock || 0,
    addedAt: medication.createdAt || new Date()
  };
};

// Sync medications with Firebase
export const syncMedications = async (medications: any[]) => {
  try {
    const userId = getCurrentUserId();
    if (!userId) {
      console.error('No user is currently logged in');
      return false;
    }
    
    console.log(`Syncing medications with Firebase for user ${userId}:`, medications);
    
    // Get current Firebase medications for this user
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      // Create the user document if it doesn't exist
      await setDoc(userDocRef, {
        medications: medications.map(med => normalizeMedication(med))
      });
      return true;
    }
    
    // Update the medications array in the user document
    await updateDoc(userDocRef, {
      medications: medications.map(med => normalizeMedication(med))
    });
    
    return true;
  } catch (error) {
    console.error('Error syncing medications:', error);
    return false;
  }
};

// Add a new medication
export const addMedication = async (medication: any) => {
  try {
    console.log('addMedication called with:', medication);
    
    const userId = getCurrentUserId();
    if (!userId) {
      const error = 'No user is currently logged in';
      console.error(error);
      console.error('Auth state:', auth.currentUser);
      throw new Error(error);
    }
    
    console.log('User ID:', userId);
    
    const normalizedMedication = normalizeMedication(medication);
    if (!normalizedMedication) {
      const error = 'Invalid medication data';
      console.error(error, medication);
      throw new Error(error);
    }
    
    console.log('Normalized medication:', normalizedMedication);
    
    const userDocRef = doc(db, 'users', userId);
    console.log('Fetching user document...');
    const userDoc = await getDoc(userDocRef);
    
    console.log('User document exists:', userDoc.exists());
    
    if (!userDoc.exists()) {
      // Create the user document with the medication
      console.log('Creating new user document with medication...');
      await setDoc(userDocRef, {
        uid: userId,
        email: auth.currentUser?.email || '',
        fullName: auth.currentUser?.displayName || 'User',
        userType: 'patient',
        medications: [normalizedMedication],
        createdAt: new Date(),
        updatedAt: new Date()
      }, { merge: true });
      console.log('User document created successfully');
    } else {
      // Add the medication to the existing array
      console.log('Updating existing user document...');
      const userData = userDoc.data();
      const currentMedications = userData.medications || [];
      console.log('Current medications count:', currentMedications.length);
      
      await updateDoc(userDocRef, {
        medications: [...currentMedications, normalizedMedication],
        updatedAt: new Date()
      });
      console.log('Medication added successfully');
    }
    
    // Verify the save
    const verifyDoc = await getDoc(userDocRef);
    const verifyData = verifyDoc.data();
    console.log('Verification - Total medications after save:', verifyData?.medications?.length || 0);
    
    // Notify dear ones about the new medication
    try {
      await notifyPrescriptionUpdates(userId, normalizedMedication, true);
    } catch (error) {
      console.error('Error notifying dear ones about new medication:', error);
      // Continue even if notification fails
    }
    
    return true;
  } catch (error: any) {
    console.error('Error adding medication:', error);
    console.error('Error details:', {
      code: error?.code,
      message: error?.message,
      stack: error?.stack
    });
    
    // Check for specific Firebase errors
    if (error?.code === 'permission-denied') {
      console.error('PERMISSION DENIED: Your Firestore security rules may not allow this operation.');
      console.error('Please check your Firebase console > Firestore Database > Rules');
    }
    
    throw error;
  }
};

// Update an existing medication
export const updateMedication = async (indexOrId: number | string, medication: any) => {
  try {
    const userId = getCurrentUserId();
    if (!userId) {
      console.error('No user is currently logged in');
      return false;
    }
    
    const normalizedMedication = normalizeMedication(medication);
    if (!normalizedMedication) {
      console.error('Invalid medication data');
      return false;
    }
    
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.error('User document not found');
      return false;
    }
    
    const userData = userDoc.data();
    const medications = userData.medications || [];
    
    // Find the medication to update
    let medicationId: string;
    if (typeof indexOrId === 'number') {
      // If indexOrId is a number, use it as an index
      if (indexOrId < 0 || indexOrId >= medications.length) {
        console.error(`Invalid medication index: ${indexOrId}`);
        return false;
      }
      medicationId = medications[indexOrId].id;
    } else {
      // If indexOrId is a string, use it as an ID
      medicationId = indexOrId;
    }
    
    // Find the medication index by ID
    const index = medications.findIndex((med: any) => med.id === medicationId);
    if (index === -1) {
      console.error(`Medication with ID ${medicationId} not found`);
      return false;
    }
    
    // Update the medication
    medications[index] = normalizedMedication;
    
    // Update the medications array in the user document
    await updateDoc(userDocRef, {
      medications: medications
    });
    
    // Notify dear ones about the updated medication
    try {
      await notifyPrescriptionUpdates(userId, normalizedMedication, false);
    } catch (error) {
      console.error('Error notifying dear ones about updated medication:', error);
      // Continue even if notification fails
    }
    
    return true;
  } catch (error) {
    console.error('Error updating medication:', error);
    return false;
  }
};

// Delete a medication
export const deleteMedication = async (medicationId: string) => {
  try {
    const userId = getCurrentUserId();
    if (!userId) {
      console.error('No user is currently logged in');
      return false;
    }
    
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.error('User document not found');
      return false;
    }
    
    const userData = userDoc.data();
    const medications = userData.medications || [];
    
    // Find the medication to delete
    let index: number;
    if (medicationId.startsWith('backend-')) {
      // Extract the index from the ID
      index = parseInt(medicationId.replace('backend-', ''));
      if (index < 0 || index >= medications.length) {
        console.error(`Invalid medication index: ${index}`);
        return false;
      }
    } else {
      // Find the medication index by ID
      index = medications.findIndex((med: any) => med.id === medicationId);
      if (index === -1) {
        console.error(`Medication with ID ${medicationId} not found`);
        return false;
      }
    }
    
    // Remove the medication
    const medicationToRemove = medications[index];
    
    // Update the medications array in the user document
    // Since arrayRemove requires exact object matching, we'll use a different approach
    medications.splice(index, 1);
    await updateDoc(userDocRef, {
      medications: medications
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting medication:', error);
    return false;
  }
};

// Mark medication as taken
export const markMedicationAsTaken = async (medicationId: string, taken: boolean = true) => {
  try {
    const userId = getCurrentUserId();
    if (!userId) {
      console.error('No user is currently logged in');
      return false;
    }
    
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.error('User document not found');
      return false;
    }
    
    const userData = userDoc.data();
    const medications = userData.medications || [];
    
    // Find the medication to update
    const index = medications.findIndex((med: any) => med.id === medicationId);
    if (index === -1) {
      console.error(`Medication with ID ${medicationId} not found`);
      return false;
    }
    
    // Update the medication
    medications[index].taken = taken;
    
    // Update the medications array in the user document
    await updateDoc(userDocRef, {
      medications: medications
    });
    
    // Send notification if medication is marked as taken
    if (taken) {
      const medication = medications[index];
      sendMedicationTakenNotification(
        userId,
        medication.name,
        medication.dosage || 'prescribed dose'
      );
    }
    
    return true;
  } catch (error) {
    console.error('Error marking medication as taken:', error);
    return false;
  }
};

// Update medication stock
export const updateMedicationStock = async (medicationId: string, newStock: number) => {
  try {
    const userId = getCurrentUserId();
    if (!userId) {
      console.error('No user is currently logged in');
      return false;
    }
    
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.error('User document not found');
      return false;
    }
    
    const userData = userDoc.data();
    const medications = userData.medications || [];
    
    // Find the medication to update
    const index = medications.findIndex((med: any) => med.id === medicationId);
    if (index === -1) {
      console.error(`Medication with ID ${medicationId} not found`);
      return false;
    }
    
    // Update the medication
    medications[index].stock = newStock;
    
    // Update the medications array in the user document
    await updateDoc(userDocRef, {
      medications: medications
    });
    
    return true;
  } catch (error) {
    console.error('Error updating medication stock:', error);
    return false;
  }
};

export default {
  fetchMedications,
  syncMedications,
  addMedication,
  updateMedication,
  deleteMedication,
  normalizeMedication,
  convertToFrontendFormat,
  convertToFirebaseFormat,
  markMedicationAsTaken,
  updateMedicationStock
}; 