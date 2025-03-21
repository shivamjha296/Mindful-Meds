import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  auth, 
  db,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  User
} from './firebase';
import { toast } from 'sonner';
import { syncMedications } from '@/services/medicationService';

// Define medical condition interface
export interface MedicalCondition {
  id: string;
  condition: string;
  diagnosisDate?: string;
  treatment?: string;
  notes?: string;
}

// Define dear one interface
export interface DearOne {
  id: string;
  name: string;
  email: string;
  phone?: string;
  relationship: string;
  notificationPreferences: {
    missedDose: boolean;
    lowStock: boolean;
    prescriptionUpdates: boolean;
    criticalAlerts: boolean;
  };
  accessPermissions: {
    viewMedications: boolean;
    viewAdherence: boolean;
    viewCalendar: boolean;
    markAsTaken: boolean;
  };
  createdAt: Date;
}

// Define medication interface
export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  startDate: string;
  endDate?: string;
  instructions?: string;
  color?: string;
  taken?: boolean;
  createdAt: Date;
  stock?: number; // Number of pills available
}

// Define user profile interface
export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  userType: 'patient' | 'dearOne';
  dearOnes?: DearOne[];
  medications?: Array<{
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    timeOfDay: string;
    startDate: Date;
    endDate?: Date | null;
    notes?: string;
    addedAt: Date;
    taken?: boolean;
    stock?: number; // Number of pills available
  }>;
  recentActivity?: Array<{
    user: string;
    action: string;
    timestamp: Date;
  }>;
  notificationPreferences?: {
    reminderNotifications: boolean;
    missedDoseAlerts: boolean;
    reminderTiming: string;
    refillReminders?: boolean;
  };
  dashboardPreferences?: {
    defaultView: 'grid' | 'timeline' | 'calendar';
  };
  medicalInfo?: {
    height?: string;
    weight?: string;
    bloodType?: string;
    allergies?: string[];
    additionalInfo?: string;
    conditions?: MedicalCondition[];
    medications?: Medication[]; // Legacy support
    emergencyContact?: {
      name: string;
      relationship: string;
      phone: string;
    };
  };
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  profileLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string, userType: 'patient' | 'dearOne') => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  updateUserPassword: (currentPassword: string, newPassword: string) => Promise<void>;
  addDearOne: (dearOne: Omit<DearOne, 'id' | 'createdAt'>) => Promise<void>;
  updateDearOne: (id: string, data: Partial<DearOne>) => Promise<void>;
  removeDearOne: (id: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  // Fetch user profile data
  const fetchUserProfile = async (uid: string) => {
    try {
      setProfileLoading(true);
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfile;
        setUserProfile({
          ...userData,
          createdAt: userData.createdAt instanceof Date ? userData.createdAt : new Date(userData.createdAt),
          updatedAt: userData.updatedAt instanceof Date ? userData.updatedAt : new Date(userData.updatedAt)
        });
      } else {
        console.log('No user profile found, creating default profile');
        // Create a default profile if none exists
        if (currentUser && currentUser.email) {
          const defaultProfile: UserProfile = {
            uid: uid,
            fullName: currentUser.displayName || "User",
            email: currentUser.email,
            userType: 'patient',
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          // Save the default profile to Firestore
          await setDoc(userDocRef, defaultProfile);
          setUserProfile(defaultProfile);
          console.log('Created default profile:', defaultProfile);
        } else {
          console.log('Cannot create default profile: no current user or email');
          setUserProfile(null);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Failed to load user profile');
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        await fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Fetch user profile to check user type
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfile;
        setUserProfile(userData);
        
        toast.success('Logged in successfully');
        return userData.userType; // Return the user type for redirection
      } else {
        // If no profile exists, create a basic one (this should rarely happen)
        const newProfile: UserProfile = {
          uid: user.uid,
          fullName: user.displayName || 'User',
          email: user.email || '',
          userType: 'patient', // Default to patient
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await setDoc(userDocRef, newProfile);
        setUserProfile(newProfile);
        
        toast.success('Logged in successfully');
        return 'patient'; // Default to patient
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to login. Please check your credentials.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName: string, userType: 'patient' | 'dearOne') => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create user profile in Firestore
      const newProfile: UserProfile = {
        uid: user.uid,
        fullName,
        email,
        userType,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await setDoc(doc(db, 'users', user.uid), newProfile);
      setUserProfile(newProfile);
      
      toast.success('Account created successfully');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Failed to create account. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      setUserProfile(null);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser) {
      console.error("No current user found when trying to update profile");
      toast.error('You must be logged in to update your profile');
      return;
    }
    
    try {
      console.log("Updating user profile for user:", currentUser.uid);
      console.log("Update data:", JSON.stringify(data, null, 2));
      setProfileLoading(true);
      const userDocRef = doc(db, 'users', currentUser.uid);
      
      // Get current user data to merge with updates
      const currentUserDoc = await getDoc(userDocRef);
      let currentData = {};
      let isNewProfile = false;
      
      if (currentUserDoc.exists()) {
        currentData = currentUserDoc.data();
        console.log("Current user data from Firestore:", JSON.stringify(currentData, null, 2));
      } else {
        // If no profile exists, create a new one
        isNewProfile = true;
        console.log("No existing profile found, creating new profile");
        currentData = {
          uid: currentUser.uid,
          email: currentUser.email,
          fullName: data.fullName || currentUser.displayName || "User",
          userType: data.userType || 'patient',
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }
      
      // Special handling for medications
      if (data.medications) {
        console.log("Updating medications:", JSON.stringify(data.medications, null, 2));
        
        // Add activity log for medication changes
        const recentActivity = (currentData as any).recentActivity || [];
        const newActivity = {
          user: (currentData as any).fullName || "User",
          action: `Updated medications`,
          timestamp: new Date()
        };
        
        data = {
          ...data,
          recentActivity: [newActivity, ...recentActivity.slice(0, 9)] // Keep last 10 activities
        };
        
        // Sync medications with the backend if needed
        // await syncMedications(data.medications);
      }
      
      // Special handling for nested medicalInfo fields (legacy support)
      if (data.medicalInfo) {
        // If we're updating medications, we need to handle them specially
        if (data.medicalInfo.medications) {
          // Make sure we preserve the existing medicalInfo structure
          const existingMedicalInfo = (currentData as any).medicalInfo || {};
          
          // Update the medications array
          data = {
            ...data,
            medicalInfo: {
              ...existingMedicalInfo,
              ...data.medicalInfo,
            }
          };
          
          console.log("Updated medicalInfo with medications:", JSON.stringify(data.medicalInfo, null, 2));
          
          // Sync medications with the backend
          if (data.medicalInfo.medications) {
            console.log("Syncing medications with backend:", data.medicalInfo.medications);
            try {
              const syncResult = await syncMedications(data.medicalInfo.medications);
              if (!syncResult) {
                console.warn("Failed to sync medications with backend");
              }
            } catch (error) {
              console.error("Error syncing medications:", error);
            }
          }
        }
      }
      
      // Prepare the update data
      const updateData = {
        ...currentData,
        ...data,
        updatedAt: new Date()
      };
      
      console.log("Final update data:", JSON.stringify(updateData, null, 2));
      
      if (isNewProfile) {
        await setDoc(userDocRef, updateData);
      } else {
        await updateDoc(userDocRef, updateData);
      }
      
      // Update local state
      setUserProfile(prev => prev ? { ...prev, ...updateData } as UserProfile : updateData as UserProfile);
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const updateUserPassword = async (currentPassword: string, newPassword: string) => {
    if (!currentUser || !currentUser.email) {
      toast.error('You must be logged in to change your password');
      return;
    }
    
    try {
      setLoading(true);
      
      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );
      
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPassword);
      
      toast.success('Password updated successfully');
    } catch (error) {
      console.error('Password update error:', error);
      toast.error('Failed to update password. Please check your current password.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addDearOne = async (dearOne: Omit<DearOne, 'id' | 'createdAt'>) => {
    if (!currentUser) {
      console.error("No current user found when trying to add dear one");
      toast.error('You must be logged in to add a dear one');
      return;
    }
    
    try {
      setProfileLoading(true);
      const userDocRef = doc(db, 'users', currentUser.uid);
      
      // Create a new dear one with ID and timestamp
      const newDearOne: DearOne = {
        ...dearOne,
        id: crypto.randomUUID(),
        createdAt: new Date()
      };
      
      // Get the current user profile
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        throw new Error('User profile not found');
      }
      
      const userData = userDoc.data() as UserProfile;
      const dearOnes = userData.dearOnes || [];
      
      // Add the new dear one to the array
      await updateDoc(userDocRef, {
        dearOnes: [...dearOnes, newDearOne]
      });
      
      // Update the local user profile
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          dearOnes: [...(userProfile.dearOnes || []), newDearOne]
        });
      }
      
      toast.success('Dear one added successfully');
    } catch (error) {
      console.error('Error adding dear one:', error);
      toast.error('Failed to add dear one');
      throw error;
    } finally {
      setProfileLoading(false);
    }
  };

  const updateDearOne = async (id: string, data: Partial<DearOne>) => {
    if (!currentUser) {
      console.error("No current user found when trying to update dear one");
      toast.error('You must be logged in to update a dear one');
      return;
    }
    
    try {
      setProfileLoading(true);
      const userDocRef = doc(db, 'users', currentUser.uid);
      
      // Get the current user profile
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        throw new Error('User profile not found');
      }
      
      const userData = userDoc.data() as UserProfile;
      const dearOnes = userData.dearOnes || [];
      
      // Find the dear one to update
      const dearOneIndex = dearOnes.findIndex(d => d.id === id);
      if (dearOneIndex === -1) {
        throw new Error('Dear one not found');
      }
      
      // Update the dear one
      const updatedDearOnes = [...dearOnes];
      updatedDearOnes[dearOneIndex] = {
        ...updatedDearOnes[dearOneIndex],
        ...data
      };
      
      // Update in Firestore
      await updateDoc(userDocRef, {
        dearOnes: updatedDearOnes
      });
      
      // Update the local user profile
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          dearOnes: updatedDearOnes
        });
      }
      
      toast.success('Dear one updated successfully');
    } catch (error) {
      console.error('Error updating dear one:', error);
      toast.error('Failed to update dear one');
      throw error;
    } finally {
      setProfileLoading(false);
    }
  };

  const removeDearOne = async (id: string) => {
    if (!currentUser) {
      console.error("No current user found when trying to remove dear one");
      toast.error('You must be logged in to remove a dear one');
      return;
    }
    
    try {
      setProfileLoading(true);
      const userDocRef = doc(db, 'users', currentUser.uid);
      
      // Get the current user profile
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        throw new Error('User profile not found');
      }
      
      const userData = userDoc.data() as UserProfile;
      const dearOnes = userData.dearOnes || [];
      
      // Filter out the dear one to remove
      const updatedDearOnes = dearOnes.filter(d => d.id !== id);
      
      // Update in Firestore
      await updateDoc(userDocRef, {
        dearOnes: updatedDearOnes
      });
      
      // Update the local user profile
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          dearOnes: updatedDearOnes
        });
      }
      
      toast.success('Dear one removed successfully');
    } catch (error) {
      console.error('Error removing dear one:', error);
      toast.error('Failed to remove dear one');
      throw error;
    } finally {
      setProfileLoading(false);
    }
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    profileLoading,
    login,
    register,
    logout,
    updateUserProfile,
    updateUserPassword,
    addDearOne,
    updateDearOne,
    removeDearOne
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 