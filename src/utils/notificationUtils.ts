import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

// Check if browser supports notifications
export const isNotificationSupported = (): boolean => {
  return 'Notification' in window;
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!isNotificationSupported()) {
    console.warn('Notifications are not supported in this browser');
    return 'denied';
  }

  try {
    return await Notification.requestPermission();
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
};

// Get current notification permission
export const getNotificationPermission = (): NotificationPermission | 'not-supported' => {
  if (!isNotificationSupported()) {
    return 'not-supported';
  }
  return Notification.permission;
};

// Send a browser notification
export const sendBrowserNotification = async (
  title: string, 
  options: NotificationOptions = {},
  userId?: string
): Promise<Notification | null> => {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    console.warn('Browser notifications not supported or permission not granted');
    return null;
  }

  try {
    // Create and show the notification
    const notification = new Notification(title, {
      icon: '/logo.png',
      ...options
    });

    // Handle notification click
    notification.onclick = () => {
      window.focus();
      notification.close();
      if (options.data?.url) {
        window.location.href = options.data.url;
      }
    };

    // Store notification in Firestore if userId is provided
    if (userId) {
      try {
        const notificationsRef = collection(db, 'users', userId, 'notifications');
        await addDoc(notificationsRef, {
          title,
          body: options.body || '',
          read: false,
          timestamp: Timestamp.now(),
          data: options.data || {}
        });
      } catch (error) {
        console.error('Error storing notification in Firestore:', error);
      }
    }

    return notification;
  } catch (error) {
    console.error('Error sending browser notification:', error);
    return null;
  }
};

// Send a medication reminder notification
export const sendMedicationReminderNotification = async (
  userId: string,
  medicationName: string,
  dosage: string,
  instructions?: string
): Promise<Notification | null> => {
  const title = `Time to take ${medicationName}`;
  const body = `Dosage: ${dosage}${instructions ? `\nInstructions: ${instructions}` : ''}`;
  
  return await sendBrowserNotification(
    title,
    {
      body,
      icon: '/logo.png',
      badge: '/logo.png',
      data: {
        type: 'medication_reminder',
        medicationName,
        dosage,
        url: '/dashboard'
      }
    },
    userId
  );
};

// Send a missed dose notification
export const sendMissedDoseNotification = async (
  userId: string,
  medicationName: string,
  dosage: string,
  scheduledTime: string
): Promise<Notification | null> => {
  const title = `Missed Dose Alert`;
  const body = `You missed your ${medicationName} (${dosage}) dose scheduled for ${scheduledTime}`;
  
  return await sendBrowserNotification(
    title,
    {
      body,
      icon: '/logo.png',
      badge: '/logo.png',
      data: {
        type: 'missed_dose',
        medicationName,
        dosage,
        scheduledTime,
        url: '/dashboard'
      }
    },
    userId
  );
};

// Send a low stock notification
export const sendLowStockNotification = async (
  userId: string,
  medicationName: string,
  currentStock: number
): Promise<Notification | null> => {
  const title = `Low Stock Alert`;
  const body = `Your ${medicationName} is running low. Current stock: ${currentStock} units.`;
  
  return await sendBrowserNotification(
    title,
    {
      body,
      icon: '/logo.png',
      badge: '/logo.png',
      data: {
        type: 'low_stock',
        medicationName,
        currentStock,
        url: '/add-medication'
      }
    },
    userId
  );
};

// Send a medication taken confirmation
export const sendMedicationTakenNotification = async (
  userId: string,
  medicationName: string,
  dosage: string
): Promise<Notification | null> => {
  const title = `Medication Taken`;
  const body = `You've successfully taken your ${medicationName} (${dosage}).`;
  
  return await sendBrowserNotification(
    title,
    {
      body,
      icon: '/logo.png',
      badge: '/logo.png',
      data: {
        type: 'medication_taken',
        medicationName,
        dosage,
        url: '/dashboard'
      }
    },
    userId
  );
}; 