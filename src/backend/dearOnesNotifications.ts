import { db, auth } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, query, where, Timestamp, addDoc } from 'firebase/firestore';
import { UserProfile, DearOne, Medication } from '@/lib/AuthContext';
import { sendEmail } from './emailService';

// Function to send browser notification
export const sendBrowserNotification = async (title: string, body: string, userId?: string) => {
  try {
    // Check if browser notifications are supported
    if (!("Notification" in window)) {
      console.log("This browser does not support desktop notification");
      return;
    }
    
    // Check if permission is already granted
    if (Notification.permission === "granted") {
      // Create notification
      const notification = new Notification(title, {
        body: body,
        icon: '/logo.png' // Assuming there's a logo in the public folder
      });
      
      // Store notification in Firestore if userId is provided
      if (userId) {
        try {
          const notificationsRef = collection(db, 'users', userId, 'notifications');
          await addDoc(notificationsRef, {
            title,
            body,
            read: false,
            timestamp: Timestamp.now()
          });
        } catch (error) {
          console.error('Error storing notification:', error);
        }
      }
      
      return notification;
    } else if (Notification.permission !== "denied") {
      // Request permission
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          const notification = new Notification(title, {
            body: body,
            icon: '/logo.png'
          });
          
          // Store notification in Firestore if userId is provided
          if (userId) {
            try {
              const notificationsRef = collection(db, 'users', userId, 'notifications');
              addDoc(notificationsRef, {
                title,
                body,
                read: false,
                timestamp: Timestamp.now()
              });
            } catch (error) {
              console.error('Error storing notification:', error);
            }
          }
          
          return notification;
        }
      });
    }
  } catch (error) {
    console.error('Error sending browser notification:', error);
  }
};

// Check for missed medications and notify dear ones
export const checkMissedMedications = async () => {
  try {
    // Get all users
    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data() as UserProfile;
      const userId = userDoc.id;
      
      // Skip if user has no medications or no dear ones
      if (!userData.medications || !userData.dearOnes || userData.dearOnes.length === 0) {
        continue;
      }
      
      // Check each medication
      for (const medication of userData.medications) {
        // Skip if medication is already taken or doesn't have a scheduled time
        if (medication.taken || !medication.timeOfDay) {
          continue;
        }
        
        // Parse the scheduled time
        const [hours, minutes] = medication.timeOfDay.split(':').map(Number);
        const scheduledTime = new Date();
        scheduledTime.setHours(hours, minutes, 0, 0);
        
        // Get current time
        const now = new Date();
        
        // Check if medication is missed (30 minutes past scheduled time)
        const timeDifference = now.getTime() - scheduledTime.getTime();
        const missedThreshold = 30 * 60 * 1000; // 30 minutes in milliseconds
        
        if (timeDifference > missedThreshold) {
          // Medication is missed, notify dear ones who have missedDose preference enabled
          const dearOnesForNotification = userData.dearOnes.filter(
            dearOne => dearOne.notificationPreferences.missedDose
          );
          
          // Send notifications to each dear one
          for (const dearOne of dearOnesForNotification) {
            await notifyDearOneAboutMissedDose(userData, dearOne, medication);
            
            // Send browser notification to dear one if they have a userId
            if (dearOne.userId) {
              const title = `Medication Alert: ${userData.fullName} missed a dose`;
              const body = `${userData.fullName} has missed their scheduled dose of ${medication.name} (${medication.dosage}) at ${medication.timeOfDay}.`;
              await sendBrowserNotification(title, body, dearOne.userId);
            }
          }
        }
      }
    }
    
    console.log('Missed medication check completed');
  } catch (error) {
    console.error('Error checking missed medications:', error);
  }
};

// Check for low medication stock and notify dear ones
export const checkLowMedicationStock = async () => {
  try {
    // Get all users
    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data() as UserProfile;
      const userId = userDoc.id;
      
      // Skip if user has no medications or no dear ones
      if (!userData.medications || !userData.dearOnes || userData.dearOnes.length === 0) {
        continue;
      }
      
      // Check each medication
      for (const medication of userData.medications) {
        // Skip if medication doesn't have stock information
        if (medication.stock === undefined) {
          continue;
        }
        
        // Check if stock is low (less than 5)
        const lowStockThreshold = 5;
        
        if (medication.stock < lowStockThreshold) {
          // Stock is low, notify dear ones who have lowStock preference enabled
          const dearOnesForNotification = userData.dearOnes.filter(
            dearOne => dearOne.notificationPreferences.lowStock
          );
          
          // Send notifications to each dear one
          for (const dearOne of dearOnesForNotification) {
            await notifyDearOneAboutLowStock(userData, dearOne, medication);
            
            // Send browser notification to dear one if they have a userId
            if (dearOne.userId) {
              const title = `Medication Alert: ${userData.fullName}'s medication is running low`;
              const body = `${userData.fullName}'s medication ${medication.name} (${medication.dosage}) is running low. Current stock: ${medication.stock} units.`;
              await sendBrowserNotification(title, body, dearOne.userId);
            }
          }
        }
      }
    }
    
    console.log('Low medication stock check completed');
  } catch (error) {
    console.error('Error checking low medication stock:', error);
  }
};

// Notify dear one about missed dose
const notifyDearOneAboutMissedDose = async (
  user: UserProfile,
  dearOne: DearOne,
  medication: any
) => {
  try {
    // Prepare email content
    const subject = `Medication Alert: ${user.fullName} missed a dose`;
    const message = `
      <h2>Medication Missed</h2>
      <p>Hello ${dearOne.name},</p>
      <p>${user.fullName} has missed their scheduled dose of ${medication.name} (${medication.dosage}).</p>
      <p>The medication was scheduled to be taken at ${medication.timeOfDay}.</p>
      <p>Please check in with them to ensure they take their medication.</p>
      <p>Thank you for your care and support.</p>
    `;
    
    // Send email notification
    await sendEmail(dearOne.email, subject, message);
    
    console.log(`Notification sent to ${dearOne.name} about missed dose for ${user.fullName}`);
  } catch (error) {
    console.error('Error sending missed dose notification:', error);
  }
};

// Notify dear one about low medication stock
const notifyDearOneAboutLowStock = async (
  user: UserProfile,
  dearOne: DearOne,
  medication: any
) => {
  try {
    // Prepare email content
    const subject = `Medication Alert: ${user.fullName}'s ${medication.name} is running low`;
    const message = `
      <h2>Medication Running Low</h2>
      <p>Hello ${dearOne.name},</p>
      <p>${user.fullName}'s medication ${medication.name} (${medication.dosage}) is running low.</p>
      <p>Current stock: ${medication.stock} units</p>
      <p>Please help ensure they get a refill soon to avoid missing doses.</p>
      <p>Thank you for your care and support.</p>
    `;
    
    // Send email notification
    await sendEmail(dearOne.email, subject, message);
    
    console.log(`Notification sent to ${dearOne.name} about low stock for ${user.fullName}`);
  } catch (error) {
    console.error('Error sending low stock notification:', error);
  }
};

// Notify dear ones about prescription updates
export const notifyPrescriptionUpdates = async (
  userId: string,
  medication: any,
  isNew: boolean
) => {
  try {
    // Get user data
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      console.error('User not found');
      return;
    }
    
    const userData = userDoc.data() as UserProfile;
    
    // Skip if user has no dear ones
    if (!userData.dearOnes || userData.dearOnes.length === 0) {
      return;
    }
    
    // Get dear ones who have prescriptionUpdates preference enabled
    const dearOnesForNotification = userData.dearOnes.filter(
      dearOne => dearOne.notificationPreferences.prescriptionUpdates
    );
    
    // Skip if no dear ones to notify
    if (dearOnesForNotification.length === 0) {
      return;
    }
    
    // Prepare email content
    const action = isNew ? 'added' : 'updated';
    const subject = `Medication Update: ${userData.fullName} has ${action} a medication`;
    
    // Send notifications to each dear one
    for (const dearOne of dearOnesForNotification) {
      const message = `
        <h2>Medication ${isNew ? 'Added' : 'Updated'}</h2>
        <p>Hello ${dearOne.name},</p>
        <p>${userData.fullName} has ${action} the following medication to their regimen:</p>
        <p><strong>${medication.name}</strong> (${medication.dosage})</p>
        <p>Frequency: ${medication.frequency}</p>
        <p>Time: ${medication.timeOfDay}</p>
        <p>Instructions: ${medication.notes || 'None provided'}</p>
        <p>Thank you for your care and support.</p>
      `;
      
      // Send email notification
      await sendEmail(dearOne.email, subject, message);
      
      // Send browser notification to dear one if they have a userId
      if (dearOne.userId) {
        const title = `Medication ${isNew ? 'Added' : 'Updated'}: ${userData.fullName}`;
        const body = `${userData.fullName} has ${action} ${medication.name} (${medication.dosage}) to their medication regimen.`;
        await sendBrowserNotification(title, body, dearOne.userId);
      }
      
      console.log(`Notification sent to ${dearOne.name} about prescription update for ${userData.fullName}`);
    }
  } catch (error) {
    console.error('Error sending prescription update notification:', error);
  }
}; 