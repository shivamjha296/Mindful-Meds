import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { 
  requestNotificationPermission, 
  getNotificationPermission,
  startMedicationNotifications,
  stopMedicationNotifications,
  sendTestNotification,
  checkUpcomingMedications
} from '@/services/notificationService';
import { toast } from 'sonner';

// Define notification preferences interface
export interface NotificationPreferences {
  reminderNotifications: boolean;
  missedDoseAlerts: boolean;
  reminderTiming: string;
}

// Define notification context interface
interface NotificationContextType {
  notificationPermission: NotificationPermission;
  requestPermission: () => Promise<NotificationPermission>;
  isNotificationsEnabled: boolean;
  notificationPreferences: NotificationPreferences;
  updateNotificationPreferences: (preferences: Partial<NotificationPreferences>) => void;
  toggleNotifications: (enabled: boolean) => void;
  triggerImmediateCheck: () => void;
}

// Create notification context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Create notification provider component
export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user, userProfile, updateUserProfile } = useAuth();
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [notificationInterval, setNotificationInterval] = useState<NodeJS.Timeout | null>(null);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>({
    reminderNotifications: true,
    missedDoseAlerts: true,
    reminderTiming: "15"
  });

  // Check notification permission on mount
  useEffect(() => {
    const checkPermission = async () => {
      const permission = await getNotificationPermission();
      setNotificationPermission(permission as NotificationPermission);
    };
    
    checkPermission();
  }, []);

  // Load notification preferences from user profile
  useEffect(() => {
    if (userProfile) {
      // Load notification preferences from user profile
      const profilePreferences = userProfile.notificationPreferences;
      if (profilePreferences) {
        setNotificationPreferences(prev => ({
          ...prev,
          ...profilePreferences
        }));
      }
    }
  }, [userProfile]);

  // Function to trigger an immediate check of medications
  const triggerImmediateCheck = () => {
    console.log('Manual trigger: Checking medications now');
    
    // First check if user is authenticated
    if (!user) {
      console.warn('Cannot check medications: User not authenticated');
      toast.error("Please login to check medications");
      return;
    }
    
    // Then check if user profile exists
    if (!userProfile) {
      console.warn('Cannot check medications: User profile not loaded yet');
      toast.warning("User profile is still loading. Please try again in a moment.");
      return;
    }
    
    // Check if medications array exists
    if (!userProfile.medications || !Array.isArray(userProfile.medications)) {
      console.warn('Cannot check medications: No medications found in user profile');
      toast.info("No medications found in your profile. Try adding medications first.");
      return;
    }
    
    // Check if there are valid medications to process
    const validMedications = userProfile.medications.filter(med => med && med.name && med.time);
    if (validMedications.length === 0) {
      console.warn('No valid medications to check');
      toast.info("No valid medications found to check. Make sure your medications have names and scheduled times.");
      return;
    }
    
    // If we got here, we have valid medications to check
    console.log(`Checking ${validMedications.length} medications with preferences:`, notificationPreferences);
    checkUpcomingMedications(validMedications, notificationPreferences);
    toast.success(`Checked ${validMedications.length} medications for reminders`);
  };

  // Start or stop notification interval based on permission and preferences
  useEffect(() => {
    // Check if we should enable notifications
    const shouldEnableNotifications = 
      notificationPermission === 'granted' && 
      (notificationPreferences.reminderNotifications || notificationPreferences.missedDoseAlerts);
    
    console.log('Notification status check:', {
      permission: notificationPermission,
      reminderEnabled: notificationPreferences.reminderNotifications,
      missedDoseEnabled: notificationPreferences.missedDoseAlerts,
      shouldEnable: shouldEnableNotifications,
      hasMedications: userProfile?.medications?.length > 0
    });
    
    // If notifications should be enabled and we have a user with medications
    if (shouldEnableNotifications && user && userProfile?.medications) {
      // Make sure we have valid medications to check
      const validMedications = userProfile.medications.filter(med => med && med.name && med.time);
      console.log('Valid medications for notifications:', validMedications.length);
      
      if (validMedications.length > 0) {
        // Clear any existing interval
        if (notificationInterval) {
          console.log('Clearing existing notification interval:', notificationInterval);
          clearInterval(notificationInterval);
          setNotificationInterval(null);
        }
        
        // Start new notification interval
        console.log('Starting medication notifications with preferences:', notificationPreferences);
        try {
          // Start the interval and store the reference
          const interval = startMedicationNotifications(
            validMedications,
            notificationPreferences
          );
          setNotificationInterval(interval);
          console.log('Notification interval started successfully with ID:', interval);
          
          // Perform an immediate check
          console.log('Triggering immediate medication check');
          checkUpcomingMedications(validMedications, notificationPreferences);
        } catch (error) {
          console.error('Error starting medication notifications:', error);
        }
      } else {
        console.warn('No valid medications found for notifications');
      }
    } else {
      // Stop notifications if they should be disabled
      if (notificationInterval) {
        console.log('Stopping medication notifications interval:', notificationInterval);
        stopMedicationNotifications(notificationInterval);
        setNotificationInterval(null);
      }
    }
    
    // Clean up interval on unmount
    return () => {
      if (notificationInterval) {
        console.log('Cleaning up notification interval on unmount:', notificationInterval);
        stopMedicationNotifications(notificationInterval);
      }
    };
  }, [
    user, 
    userProfile, 
    notificationPermission, 
    notificationPreferences.reminderNotifications,
    notificationPreferences.missedDoseAlerts,
    notificationPreferences.reminderTiming
  ]);

  // Request notification permission
  const requestPermission = async () => {
    const permission = await requestNotificationPermission();
    setNotificationPermission(permission as NotificationPermission);
    return permission;
  };

  // Update notification preferences
  const updateNotificationPreferences = async (preferences: Partial<NotificationPreferences>) => {
    // Update local state
    setNotificationPreferences(prev => ({
      ...prev,
      ...preferences
    }));
    
    // Update user profile if available
    if (user && updateUserProfile) {
      try {
        await updateUserProfile({
          notificationPreferences: {
            ...notificationPreferences,
            ...preferences
          }
        });
        console.log('Notification preferences updated in profile');
      } catch (error) {
        console.error('Error updating notification preferences in profile:', error);
      }
    }
  };

  // Toggle notifications on/off
  const toggleNotifications = (enabled: boolean) => {
    if (enabled) {
      // Enable relevant notification preferences
      updateNotificationPreferences({
        reminderNotifications: true,
        missedDoseAlerts: true
      });
    } else {
      // Disable notification preferences
      updateNotificationPreferences({
        reminderNotifications: false,
        missedDoseAlerts: false
      });
    }
  };

  // Check if notifications are enabled
  const isNotificationsEnabled = 
    notificationPermission === 'granted' && 
    (notificationPreferences.reminderNotifications || notificationPreferences.missedDoseAlerts);

  // Provide context value
  const contextValue: NotificationContextType = {
    notificationPermission,
    requestPermission,
    isNotificationsEnabled,
    notificationPreferences,
    updateNotificationPreferences,
    toggleNotifications,
    triggerImmediateCheck
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

// Create hook for using notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}; 