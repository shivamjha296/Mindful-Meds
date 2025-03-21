import { 
  db, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  Timestamp, 
  updateDoc, 
  doc, 
  getDoc,
  setDoc
} from './firebase';
import { API_URL } from '@/lib/constants';

export interface MedicationReminder {
  id?: string;
  medicationId: string;
  medicationName: string;
  userId: string;
  scheduledTime: Date;
  dosage: string;
  instructions?: string;
  status: 'pending' | 'taken' | 'missed';
  notifiedPatient: boolean;
  notifiedCaregiver: boolean;
  createdAt: Date;
}

export interface CaregiverNotification {
  id?: string;
  userId: string;
  caregiverId: string;
  medicationName: string;
  scheduledTime: Date;
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface Caregiver {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  relationship: string;
}

class NotificationService {
  // Schedule reminders for a medication
  async scheduleReminders(
    userId: string,
    medicationId: string,
    medicationName: string,
    dosage: string,
    frequency: string,
    timeOfDay: string,
    startDate: Date,
    endDate?: Date,
    instructions?: string
  ): Promise<void> {
    try {
      // Calculate reminder times based on frequency and time of day
      const reminderTimes = this.calculateReminderTimes(
        frequency,
        timeOfDay,
        startDate,
        endDate
      );

      // Create reminders in Firestore
      for (const reminderTime of reminderTimes) {
        const reminder: MedicationReminder = {
          medicationId,
          medicationName,
          userId,
          scheduledTime: reminderTime,
          dosage,
          instructions,
          status: 'pending',
          notifiedPatient: false,
          notifiedCaregiver: false,
          createdAt: new Date()
        };

        await addDoc(collection(db, 'medicationReminders'), {
          ...reminder,
          scheduledTime: Timestamp.fromDate(reminder.scheduledTime),
          createdAt: Timestamp.fromDate(reminder.createdAt)
        });
      }
    } catch (error) {
      console.error('Error scheduling reminders:', error);
      throw error;
    }
  }

  // Calculate reminder times based on medication schedule
  private calculateReminderTimes(
    frequency: string,
    timeOfDay: string,
    startDate: Date,
    endDate?: Date
  ): Date[] {
    const reminderTimes: Date[] = [];
    const currentDate = new Date();
    const maxDays = 30; // Schedule reminders for up to 30 days in advance
    
    // Parse the time of day (format: "HH:MM")
    const [hours, minutes] = timeOfDay.split(':').map(Number);
    
    // Set the end date for scheduling (either specified end date or 30 days from now)
    const schedulingEndDate = endDate 
      ? new Date(Math.min(endDate.getTime(), currentDate.getTime() + maxDays * 24 * 60 * 60 * 1000))
      : new Date(currentDate.getTime() + maxDays * 24 * 60 * 60 * 1000);
    
    // Start from the later of start date or current date
    const schedulingStartDate = new Date(Math.max(startDate.getTime(), currentDate.getTime()));
    
    // Set time to beginning of day
    schedulingStartDate.setHours(0, 0, 0, 0);
    schedulingEndDate.setHours(23, 59, 59, 999);
    
    // Loop through each day in the range
    for (let date = new Date(schedulingStartDate); date <= schedulingEndDate; date.setDate(date.getDate() + 1)) {
      // Based on frequency, determine if we should add a reminder for this day
      let shouldAddReminder = false;
      
      switch (frequency) {
        case 'Once daily':
          shouldAddReminder = true;
          break;
        case 'Twice daily':
          // For twice daily, we'll add two reminders with different times
          // Morning dose
          reminderTimes.push(new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes));
          // Evening dose (12 hours later or at specified secondary time)
          reminderTimes.push(new Date(date.getFullYear(), date.getMonth(), date.getDate(), (hours + 12) % 24, minutes));
          shouldAddReminder = false; // Already added reminders
          break;
        case 'Three times daily':
          // For three times daily, add reminders 8 hours apart
          reminderTimes.push(new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes));
          reminderTimes.push(new Date(date.getFullYear(), date.getMonth(), date.getDate(), (hours + 8) % 24, minutes));
          reminderTimes.push(new Date(date.getFullYear(), date.getMonth(), date.getDate(), (hours + 16) % 24, minutes));
          shouldAddReminder = false; // Already added reminders
          break;
        case 'Every other day':
          // Check if this is an "on" day (every other day starting from start date)
          const daysDiff = Math.floor((date.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
          shouldAddReminder = daysDiff % 2 === 0;
          break;
        case 'Weekly':
          // Check if this is the same day of week as the start date
          shouldAddReminder = date.getDay() === startDate.getDay();
          break;
        case 'As needed':
          // For "as needed" medications, we don't schedule automatic reminders
          shouldAddReminder = false;
          break;
        default:
          shouldAddReminder = true;
      }
      
      if (shouldAddReminder) {
        // Create a reminder at the specified time
        reminderTimes.push(new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes));
      }
    }
    
    return reminderTimes;
  }

  // Get pending reminders for a user
  async getPendingReminders(userId: string): Promise<MedicationReminder[]> {
    try {
      const remindersRef = collection(db, 'medicationReminders');
      const q = query(
        remindersRef,
        where('userId', '==', userId),
        where('status', '==', 'pending')
      );
      
      const querySnapshot = await getDocs(q);
      const reminders: MedicationReminder[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        reminders.push({
          id: doc.id,
          medicationId: data.medicationId,
          medicationName: data.medicationName,
          userId: data.userId,
          scheduledTime: data.scheduledTime.toDate(),
          dosage: data.dosage,
          instructions: data.instructions,
          status: data.status,
          notifiedPatient: data.notifiedPatient,
          notifiedCaregiver: data.notifiedCaregiver,
          createdAt: data.createdAt.toDate()
        });
      });
      
      return reminders;
    } catch (error) {
      console.error('Error getting pending reminders:', error);
      throw error;
    }
  }

  // Mark a reminder as taken
  async markReminderAsTaken(reminderId: string): Promise<void> {
    try {
      const reminderRef = doc(db, 'medicationReminders', reminderId);
      await updateDoc(reminderRef, {
        status: 'taken',
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error marking reminder as taken:', error);
      throw error;
    }
  }

  // Check for due reminders and send notifications
  async checkAndSendReminders(): Promise<void> {
    try {
      const now = new Date();
      const remindersRef = collection(db, 'medicationReminders');
      
      // Get reminders that are due but not yet notified to patient
      const dueRemindersQuery = query(
        remindersRef,
        where('status', '==', 'pending'),
        where('notifiedPatient', '==', false),
        where('scheduledTime', '<=', Timestamp.fromDate(now))
      );
      
      const dueRemindersSnapshot = await getDocs(dueRemindersQuery);
      
      for (const reminderDoc of dueRemindersSnapshot.docs) {
        const reminder = reminderDoc.data() as MedicationReminder;
        
        // Send notification to patient
        await this.sendPatientNotification(reminder);
        
        // Mark reminder as notified to patient
        await updateDoc(reminderDoc.ref, {
          notifiedPatient: true,
          updatedAt: Timestamp.now()
        });
      }
      
      // Check for missed reminders (1 hour past due)
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const missedRemindersQuery = query(
        remindersRef,
        where('status', '==', 'pending'),
        where('notifiedCaregiver', '==', false),
        where('scheduledTime', '<=', Timestamp.fromDate(oneHourAgo))
      );
      
      const missedRemindersSnapshot = await getDocs(missedRemindersQuery);
      
      for (const reminderDoc of missedRemindersSnapshot.docs) {
        const reminder = reminderDoc.data() as MedicationReminder;
        
        // Mark reminder as missed
        await updateDoc(reminderDoc.ref, {
          status: 'missed',
          updatedAt: Timestamp.now()
        });
        
        // Send notification to caregiver
        await this.sendCaregiverNotification(reminder);
        
        // Mark reminder as notified to caregiver
        await updateDoc(reminderDoc.ref, {
          notifiedCaregiver: true,
          updatedAt: Timestamp.now()
        });
      }
    } catch (error) {
      console.error('Error checking and sending reminders:', error);
      throw error;
    }
  }

  // Send notification to patient
  private async sendPatientNotification(reminder: MedicationReminder): Promise<void> {
    try {
      // In a real app, this would send a push notification, SMS, or email
      console.log(`Sending reminder to patient for ${reminder.medicationName}`);
      
      // For web notifications
      if (Notification.permission === 'granted') {
        new Notification(`Time to take ${reminder.medicationName}`, {
          body: `Dosage: ${reminder.dosage}\n${reminder.instructions || ''}`,
          icon: '/favicon.ico'
        });
      }
      
      // Store the notification in Firestore for in-app display
      await addDoc(collection(db, 'notifications'), {
        userId: reminder.userId,
        title: `Time to take ${reminder.medicationName}`,
        message: `Dosage: ${reminder.dosage}\n${reminder.instructions || ''}`,
        type: 'medication_reminder',
        medicationId: reminder.medicationId,
        reminderId: reminder.id,
        read: false,
        createdAt: Timestamp.now()
      });
      
      // Also store in backend API for redundancy
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
    } catch (error) {
      console.error('Error sending patient notification:', error);
      throw error;
    }
  }

  // Send notification to caregiver
  private async sendCaregiverNotification(reminder: MedicationReminder): Promise<void> {
    try {
      // Get user's caregivers
      const userDoc = await getDoc(doc(db, 'users', reminder.userId));
      
      if (!userDoc.exists()) {
        console.error('User not found');
        return;
      }
      
      const userData = userDoc.data();
      const caregivers = userData.caregivers || [];
      
      for (const caregiver of caregivers) {
        // In a real app, this would send an SMS, email, or push notification
        console.log(`Sending missed medication alert to caregiver ${caregiver.name} for ${reminder.medicationName}`);
        
        // Store the notification in Firestore
        const notification: CaregiverNotification = {
          userId: reminder.userId,
          caregiverId: caregiver.id,
          medicationName: reminder.medicationName,
          scheduledTime: reminder.scheduledTime,
          message: `${userData.fullName || 'Your loved one'} missed their ${reminder.medicationName} dose (${reminder.dosage}) scheduled for ${reminder.scheduledTime.toLocaleTimeString()}.`,
          read: false,
          createdAt: new Date()
        };
        
        await addDoc(collection(db, 'caregiverNotifications'), {
          ...notification,
          scheduledTime: Timestamp.fromDate(notification.scheduledTime),
          createdAt: Timestamp.fromDate(notification.createdAt)
        });
      }
    } catch (error) {
      console.error('Error sending caregiver notification:', error);
      throw error;
    }
  }

  // Add a caregiver for a user
  async addCaregiver(userId: string, caregiver: Caregiver): Promise<string> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      
      const userData = userDoc.data();
      const caregivers = userData.caregivers || [];
      
      // Generate a unique ID for the caregiver
      const caregiverId = Date.now().toString();
      const newCaregiver = { ...caregiver, id: caregiverId };
      
      // Add caregiver to user's caregivers array
      await updateDoc(userRef, {
        caregivers: [...caregivers, newCaregiver],
        updatedAt: Timestamp.now()
      });
      
      return caregiverId;
    } catch (error) {
      console.error('Error adding caregiver:', error);
      throw error;
    }
  }

  // Get caregivers for a user
  async getCaregivers(userId: string): Promise<Caregiver[]> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      
      const userData = userDoc.data();
      return userData.caregivers || [];
    } catch (error) {
      console.error('Error getting caregivers:', error);
      throw error;
    }
  }

  // Request notification permission
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }
    
    if (Notification.permission === 'granted') {
      return true;
    }
    
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    
    return false;
  }
}

// Create and export a singleton instance
export const notificationService = new NotificationService();
export default NotificationService; 