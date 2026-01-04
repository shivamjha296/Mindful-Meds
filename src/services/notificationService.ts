import { Medication } from '@/lib/AuthContext';
import { toast } from 'sonner';
import { API_URL } from '@/lib/constants';

// Check if browser supports notifications
const isNotificationSupported = () => {
  return 'Notification' in window;
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!isNotificationSupported()) {
    console.warn('Notifications are not supported in this browser');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

// Get notification permission status
export const getNotificationPermission = (): string => {
  if (!isNotificationSupported()) {
    return 'not-supported';
  }
  return Notification.permission;
};

// Send a browser notification
export const sendBrowserNotification = (title: string, options: NotificationOptions = {}): boolean => {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    // Fall back to toast notification if browser notifications aren't available
    toast(title, {
      description: options.body || '',
      duration: 10000,
    });
    return false;
  }

  try {
    const notification = new Notification(title, {
      icon: '/favicon.ico',
      ...options,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
      if (options.data?.url) {
        window.location.href = options.data.url;
      }
    };

    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    
    // Fall back to toast notification
    toast({
      title,
      description: options.body || '',
      duration: 10000,
    });
    return false;
  }
};

// Send a notification when a medication is taken
export const sendMedicationTakenNotification = (medication: Medication, preferences?: any): void => {
  if (!medication || !medication.name) {
    console.warn('Invalid medication for taken notification');
    return;
  }

  console.log('Sending medication taken notification for:', medication.name);
  
  const title = `Medication Taken: ${medication.name}`;
  const body = `You've successfully taken your ${medication.dosage || 'prescribed'} dose of ${medication.name}.`;
  
  // Wrap in try-catch to prevent errors from breaking the app
  try {
    // Send browser notification
    sendBrowserNotification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      data: {
        medicationId: medication.id,
        url: '/dashboard',
      },
      // Use a different notification sound if available
      silent: false,
    });
  } catch (error) {
    console.error('Error sending browser notification:', error);
  }
  
  // Show a simple toast notification (sonner format) - wrapped in try-catch
  try {
    toast.success(`${medication.name} marked as taken`, {
      duration: 3000,
    });
  } catch (error) {
    console.error('Error showing toast:', error);
  }
  
  // Store notification in local storage - wrapped in try-catch
  try {
    storeLocalNotification({
      id: `taken-${medication.id}-${Date.now()}`,
      title,
      message: body,
      time: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString(),
      isRead: false,
      type: 'info',
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error storing notification:', error);
  }
};

// Store notification in local storage
export const storeLocalNotification = (notification: any): void => {
  try {
    // Get existing notifications
    const storedNotifications = localStorage.getItem('medx_notifications');
    let notifications = storedNotifications ? JSON.parse(storedNotifications) : [];
    
    // Add new notification at the beginning
    notifications = [notification, ...notifications];
    
    // Limit to 50 notifications
    if (notifications.length > 50) {
      notifications = notifications.slice(0, 50);
    }
    
    // Save back to local storage
    localStorage.setItem('medx_notifications', JSON.stringify(notifications));
    console.log('Notification stored locally:', notification.title);
  } catch (error) {
    console.error('Error storing notification in local storage:', error);
  }
};

// Get notifications from local storage
export const getLocalNotifications = (): any[] => {
  try {
    const storedNotifications = localStorage.getItem('medx_notifications');
    return storedNotifications ? JSON.parse(storedNotifications) : [];
  } catch (error) {
    console.error('Error getting notifications from local storage:', error);
    return [];
  }
};

// Mark local notification as read
export const markLocalNotificationAsRead = (notificationId: string): void => {
  try {
    // Get existing notifications
    const storedNotifications = localStorage.getItem('medx_notifications');
    if (!storedNotifications) return;
    
    let notifications = JSON.parse(storedNotifications);
    
    // Update notification
    notifications = notifications.map((notification: any) => 
      notification.id === notificationId 
        ? { ...notification, isRead: true } 
        : notification
    );
    
    // Save back to local storage
    localStorage.setItem('medx_notifications', JSON.stringify(notifications));
    console.log('Notification marked as read locally:', notificationId);
  } catch (error) {
    console.error('Error marking notification as read in local storage:', error);
  }
};

// Clear all local notifications
export const clearLocalNotifications = (): void => {
  try {
    localStorage.removeItem('medx_notifications');
    console.log('All local notifications cleared');
  } catch (error) {
    console.error('Error clearing notifications from local storage:', error);
  }
};

// Check for upcoming medication doses and send notifications
export const checkUpcomingMedications = (medications: Medication[], userPreferences?: any): void => {
  if (!medications || medications.length === 0) {
    console.log('No medications to check');
    return;
  }

  console.log('Checking upcoming medications:', medications.length, 'medications');
  console.log('User preferences:', userPreferences);

  // Default preferences if not provided
  const preferences = userPreferences || {
    reminderNotifications: true,
    missedDoseAlerts: true,
    reminderTiming: "15"
  };

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;
  
  console.log('Current time:', now.toLocaleTimeString(), '(', currentTimeInMinutes, 'minutes from midnight)');
  
  // Check each medication
  medications.forEach(medication => {
    // Skip if medication is invalid or missing required properties
    if (!medication || !medication.name) {
      console.log('Skipping invalid medication:', medication);
      return;
    }
    
    // Skip if medication time is missing
    if (!medication.time) {
      console.log('Skipping medication with missing time:', medication.name);
      return;
    }
    
    console.log('Checking medication:', medication.name, 'scheduled for', medication.time, 'taken:', medication.taken);
    
    // Skip if already taken today
    if (medication.taken) {
      console.log('Medication already taken today, skipping');
      return;
    }
    
    // Check if medication is active for today
    const startDate = medication.startDate ? new Date(medication.startDate) : null;
    const endDate = medication.endDate ? new Date(medication.endDate) : null;
    
    if ((startDate && startDate > now) || (endDate && endDate < now)) {
      console.log('Medication not active yet or has ended, skipping');
      return; // Medication not active yet or has ended
    }
    
    // Parse medication time
    try {
      const [hoursStr, minutesStr] = medication.time.split(':');
      const hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);
      
      // Validate time components
      if (isNaN(hours) || isNaN(minutes)) {
        console.log('Invalid time format for medication:', medication.name, medication.time);
        return;
      }
      
      const medicationTimeInMinutes = hours * 60 + minutes;
      
      console.log('Medication time:', hours + ':' + minutes, '(', medicationTimeInMinutes, 'minutes from midnight)');
      
      // Calculate time difference in minutes
      let timeDifferenceInMinutes = medicationTimeInMinutes - currentTimeInMinutes;
      
      // Handle case where medication time is for tomorrow (e.g., it's 23:50 and med time is 00:30)
      if (timeDifferenceInMinutes < -720) { // More than 12 hours in the past
        timeDifferenceInMinutes += 1440; // Add 24 hours (1440 minutes)
        console.log('Medication time appears to be for tomorrow, adjusting difference');
      }
      
      // Handle case where medication time was yesterday (e.g., it's 00:30 and med time is 23:50)
      if (timeDifferenceInMinutes > 720) { // More than 12 hours in the future
        timeDifferenceInMinutes -= 1440; // Subtract 24 hours
        console.log('Medication time appears to be from yesterday, adjusting difference');
      }
      
      console.log('Time difference:', timeDifferenceInMinutes, 'minutes');
      
      // Get the reminder timing preference (default to 15 minutes)
      const reminderTimingMinutes = parseInt(preferences.reminderTiming || "15", 10);
      
      console.log('Reminder timing preference:', reminderTimingMinutes, 'minutes');
      
      // Check if we should send a reminder notification
      // Send reminder if:
      // 1. Reminder notifications are enabled
      // 2. The medication is due within the reminder window
      // 3. The medication is not overdue by more than 60 minutes
      const shouldSendReminder = preferences.reminderNotifications && 
        timeDifferenceInMinutes <= reminderTimingMinutes && 
        timeDifferenceInMinutes > -60;
      
      // Check if we should send a missed dose alert
      // Send missed dose alert if:
      // 1. Missed dose alerts are enabled
      // 2. The medication is overdue by at least 1 minute
      // 3. The medication is not overdue by more than 60 minutes
      const shouldSendMissedAlert = preferences.missedDoseAlerts && 
        timeDifferenceInMinutes < 0 && 
        timeDifferenceInMinutes >= -60;
      
      console.log('Should send reminder:', shouldSendReminder);
      console.log('Should send missed alert:', shouldSendMissedAlert);
      
      if (shouldSendReminder) {
        // Upcoming medication reminder
        const notificationTitle = `Medication Reminder: ${medication.name}`;
        const notificationBody = timeDifferenceInMinutes > 0 
          ? `Your ${medication.dosage || 'prescribed'} dose of ${medication.name} is due in ${timeDifferenceInMinutes} minutes.`
          : `Your ${medication.dosage || 'prescribed'} dose of ${medication.name} is due now.`;
        
        console.log('Sending reminder notification:', notificationTitle, notificationBody);
        
        // Send browser notification
        sendBrowserNotification(notificationTitle, {
          body: notificationBody,
          data: {
            medicationId: medication.id,
            url: '/dashboard',
          },
          requireInteraction: true,
        });
        
        // Also show a toast notification
        toast.info(notificationTitle, {
          description: notificationBody,
          duration: 10000,
        });
        
        // Store notification in local storage for recent notifications
        storeLocalNotification({
          id: `reminder-${medication.id}-${Date.now()}`,
          title: notificationTitle,
          message: notificationBody,
          time: now.toLocaleTimeString(),
          date: now.toLocaleDateString(),
          isRead: false,
          type: 'reminder',
          timestamp: Date.now()
        });
      } else if (shouldSendMissedAlert) {
        // Missed or due medication alert
        const notificationTitle = `Time to take ${medication.name}!`;
        const notificationBody = `Your ${medication.dosage || 'prescribed'} dose of ${medication.name} is ${Math.abs(timeDifferenceInMinutes)} minutes overdue.`;
        
        console.log('Sending missed dose notification:', notificationTitle, notificationBody);
        
        // Send browser notification
        sendBrowserNotification(notificationTitle, {
          body: notificationBody,
          data: {
            medicationId: medication.id,
            url: '/dashboard',
          },
          requireInteraction: true,
        });
        
        // Also show a toast notification
        toast.warning(notificationTitle, {
          description: notificationBody,
          duration: 10000,
        });
        
        // Store notification in local storage for recent notifications
        storeLocalNotification({
          id: `missed-${medication.id}-${Date.now()}`,
          title: notificationTitle,
          message: notificationBody,
          time: now.toLocaleTimeString(),
          date: now.toLocaleDateString(),
          isRead: false,
          type: 'alert',
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error('Error processing medication time for', medication.name, ':', error);
    }
  });
};

// Start checking for medication notifications at regular intervals
export const startMedicationNotifications = (
  medications: Medication[],
  preferences?: any
): NodeJS.Timeout => {
  console.log('Starting medication notification checks with:', {
    medicationCount: medications?.length || 0,
    preferences
  });

  // Filter out invalid medications
  const validMedications = medications?.filter(med => med && med.name && med.time) || [];
  
  console.log(`Found ${validMedications.length} valid medications for notifications`);
  
  if (validMedications.length === 0) {
    console.warn('No valid medications to check for notifications');
  }
  
  // Perform an immediate check
  try {
    console.log('Performing immediate medication check');
    checkUpcomingMedications(validMedications, preferences);
  } catch (error) {
    console.error('Error in immediate medication check:', error);
  }
  
  // Set up interval to check every minute
  const intervalId = setInterval(() => {
    try {
      console.log('Checking medications on interval');
      checkUpcomingMedications(validMedications, preferences);
    } catch (error) {
      console.error('Error checking medications on interval:', error);
    }
  }, 30000); // Check every 30 seconds for testing (change to 60000 for production)
  
  console.log('Medication notification interval started with ID:', intervalId);
  return intervalId;
};

// Stop medication notification checks
export const stopMedicationNotifications = (intervalId: NodeJS.Timeout): void => {
  console.log('Stopping medication notification interval:', intervalId);
  clearInterval(intervalId);
};

// Send a test notification
export const sendTestNotification = (emailEnabled: boolean = false): void => {
  const now = new Date();
  const title = "Test Notification";
  const body = "This is a test notification from MedX";
  
  // Send browser notification
  sendBrowserNotification(title, {
    body,
    icon: "/favicon.ico"
  });
  
  // Store notification in local storage for recent notifications
  storeLocalNotification({
    id: `test-${Date.now()}`,
    title,
    message: body,
    time: now.toLocaleTimeString(),
    date: now.toLocaleDateString(),
    isRead: false,
    type: 'info',
    timestamp: Date.now()
  });
  
  toast.success("Test notification sent");
};

// Fetch recent notifications from the backend
export const fetchRecentNotifications = async (userId: string): Promise<any[]> => {
  if (!userId) {
    console.warn('No user ID provided for fetching notifications');
    return [];
  }

  try {
    console.log('Fetching notifications for user:', userId);
    
    // First try to get from local storage
    const localNotifications = getLocalNotifications();
    console.log('Found local notifications:', localNotifications.length);
    
    // Try to fetch from the backend only if we're in production
    if (process.env.NODE_ENV === 'production') {
      try {
        const response = await fetch(`${API_URL}/notifications?userId=${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
    
        if (!response.ok) {
          throw new Error(`Failed to fetch notifications: ${response.statusText}`);
        }
    
        const backendNotifications = await response.json();
        console.log('Fetched backend notifications:', backendNotifications.length);
        
        // Combine with local notifications
        const combinedNotifications = [...backendNotifications, ...localNotifications];
        
        // Remove duplicates (if any) by ID
        const uniqueNotifications = combinedNotifications.filter((notification, index, self) =>
          index === self.findIndex(n => n.id === notification.id)
        );
        
        // Sort by timestamp (newest first)
        uniqueNotifications.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        
        return uniqueNotifications;
      } catch (error) {
        console.warn('Backend notifications not available, using local only:', error);
      }
    }
    
    // Return local notifications if backend failed or we're in development
    return localNotifications;
  } catch (error) {
    console.error('Error in fetchRecentNotifications:', error);
    return [];
  }
};

// Save a notification to the backend
export const saveNotification = async (notification: any): Promise<boolean> => {
  if (!notification) {
    console.warn('No notification provided to save');
    return false;
  }

  try {
    // Always store locally
    storeLocalNotification(notification);
    
    // Only try to save to backend in production
    if (process.env.NODE_ENV === 'production') {
      try {
        const response = await fetch(`${API_URL}/notifications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(notification),
        });
    
        if (!response.ok) {
          throw new Error(`Failed to save notification: ${response.statusText}`);
        }
    
        console.log('Notification saved to backend successfully');
      } catch (error) {
        console.warn('Backend save notification not available:', error);
        // Already saved locally, so return true
        return true;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error in saveNotification:', error);
    return false;
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  if (!notificationId) {
    console.warn('No notification ID provided to mark as read');
    return false;
  }

  try {
    // Always update locally
    markLocalNotificationAsRead(notificationId);
    
    // Only try to update backend in production
    if (process.env.NODE_ENV === 'production') {
      try {
        const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        });
    
        if (!response.ok) {
          throw new Error(`Failed to mark notification as read: ${response.statusText}`);
        }
    
        console.log('Notification marked as read in backend successfully');
      } catch (error) {
        console.warn('Backend mark as read not available:', error);
        // Already updated locally, so return true
        return true;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error in markNotificationAsRead:', error);
    return false;
  }
};

// Clear all notifications
export const clearAllNotifications = async (userId: string): Promise<boolean> => {
  if (!userId) {
    console.warn('No user ID provided to clear notifications');
    return false;
  }

  try {
    // Always clear locally
    clearLocalNotifications();
    
    // Only try to clear backend in production
    if (process.env.NODE_ENV === 'production') {
      try {
        const response = await fetch(`${API_URL}/notifications/clear?userId=${userId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });
    
        if (!response.ok) {
          throw new Error(`Failed to clear notifications: ${response.statusText}`);
        }
    
        console.log('All notifications cleared from backend successfully');
      } catch (error) {
        console.warn('Backend clear notifications not available:', error);
        // Already cleared locally, so return true
        return true;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error in clearAllNotifications:', error);
    return false;
  }
};

export default {
  requestNotificationPermission,
  getNotificationPermission,
  sendBrowserNotification,
  sendMedicationTakenNotification,
  checkUpcomingMedications,
  startMedicationNotifications,
  stopMedicationNotifications,
  sendTestNotification,
  fetchRecentNotifications,
  saveNotification,
  markNotificationAsRead,
  clearAllNotifications,
  storeLocalNotification,
  getLocalNotifications,
  markLocalNotificationAsRead,
  clearLocalNotifications
}; 