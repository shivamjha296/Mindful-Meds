import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { toast } from "sonner";
import { Lock, Mail, User, Calendar, Clock, Pill, Activity, Shield, Bell } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { UserProfile, DearOne, useAuth } from '@/lib/AuthContext';

const DearOnesPortal = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dearOne, setDearOne] = useState<DearOne | null>(null);
  const [patient, setPatient] = useState<UserProfile | null>(null);
  
  // Check if user is already logged in
  useEffect(() => {
    if (currentUser && userProfile) {
      // If user is logged in as a patient, redirect to dashboard
      if (userProfile.userType === 'patient') {
        toast.info('You are logged in as a patient. Redirecting to dashboard.');
        navigate('/dashboard');
        return;
      }
      
      // If user is logged in as a dear one, check their association
      if (userProfile.userType === 'dearOne') {
        checkIfDearOne(userProfile.email);
      }
    }
  }, [currentUser, userProfile, navigate]);
  
  // Check if the email belongs to a dear one
  const checkIfDearOne = async (email: string) => {
    try {
      setIsLoading(true);
      
      // Query users collection to find users who have this email as a dear one
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      
      let foundDearOne: DearOne | null = null;
      let foundPatient: UserProfile | null = null;
      
      // Loop through all users
      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data() as UserProfile;
        
        // Skip if user has no dear ones
        if (!userData.dearOnes || userData.dearOnes.length === 0) {
          continue;
        }
        
        // Check if this user has a dear one with the given email
        const matchingDearOne = userData.dearOnes.find(d => d.email === email);
        
        if (matchingDearOne) {
          foundDearOne = matchingDearOne;
          foundPatient = userData;
          break;
        }
      }
      
      if (foundDearOne && foundPatient) {
        setDearOne(foundDearOne);
        setPatient(foundPatient);
        setIsAuthenticated(true);
      } else {
        // Not a dear one, but still a caregiver account
        if (userProfile?.userType === 'dearOne') {
          toast.info('You are registered as a caregiver but not connected to any patients yet.');
          setIsAuthenticated(false);
        } else {
          // Not a dear one, log out
          auth.signOut();
          toast.error('You are not registered as a caregiver for any patient');
        }
      }
    } catch (error) {
      console.error('Error checking if dear one:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    try {
      setIsLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check if the user exists in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfile;
        
        // If user is a patient, redirect to dashboard
        if (userData.userType === 'patient') {
          toast.info('You are logged in as a patient. Redirecting to dashboard.');
          navigate('/dashboard');
          return;
        }
      }
      
      // Check if the user is a dear one
      await checkIfDearOne(email);
    } catch (error) {
      console.error("Login error:", error);
      toast.error('Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await auth.signOut();
      setIsAuthenticated(false);
      setDearOne(null);
      setPatient(null);
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to log out');
    }
  };
  
  // If loading, show loading indicator
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-dots">
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    );
  }
  
  // If not authenticated, show login form
  if (!isAuthenticated) {
    return (
      <div className="page-container flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-secondary/20">
        <Card className="w-full max-w-md shadow-lg glassmorphism">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl font-bold">Dear Ones Portal</CardTitle>
            <CardDescription>
              Log in to view and manage your loved one's medications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="you@example.com" 
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a href="#" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="loading-dots">
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                ) : (
                  "Login"
                )}
              </Button>
              
              <p className="text-center text-sm text-muted-foreground mt-4">
                Not a registered caregiver? <a href="/auth" className="text-primary hover:underline">Register here</a> or ask your loved one to add you as a Dear One in their profile.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // If authenticated, show patient information
  return (
    <div className="container max-w-6xl py-24 px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dear Ones Portal</h1>
          <p className="text-muted-foreground">
            Viewing information for <span className="font-medium">{patient?.fullName}</span>
          </p>
        </div>
        <Button variant="outline" onClick={handleLogout}>Log Out</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-muted-foreground">Name</dt>
                <dd className="font-medium">{patient?.fullName}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Email</dt>
                <dd>{patient?.email}</dd>
              </div>
              {patient?.phone && (
                <div>
                  <dt className="text-sm text-muted-foreground">Phone</dt>
                  <dd>{patient?.phone}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm text-muted-foreground">Your Relationship</dt>
                <dd className="capitalize">{dearOne?.relationship}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Your Access Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${dearOne?.accessPermissions.viewMedications ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>View Medications</span>
              </li>
              <li className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${dearOne?.accessPermissions.viewAdherence ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>View Adherence History</span>
              </li>
              <li className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${dearOne?.accessPermissions.viewCalendar ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>View Medication Calendar</span>
              </li>
              <li className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${dearOne?.accessPermissions.markAsTaken ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>Mark Medications as Taken</span>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${dearOne?.notificationPreferences.missedDose ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>Missed Dose Alerts</span>
              </li>
              <li className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${dearOne?.notificationPreferences.lowStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>Low Stock Alerts</span>
              </li>
              <li className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${dearOne?.notificationPreferences.prescriptionUpdates ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>Prescription Updates</span>
              </li>
              <li className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${dearOne?.notificationPreferences.criticalAlerts ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>Critical Health Alerts</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="medications" className="space-y-6">
        <TabsList className="w-full grid grid-cols-3 md:w-auto">
          <TabsTrigger value="medications" className="flex items-center gap-2">
            <Pill className="h-4 w-4" />
            <span>Medications</span>
          </TabsTrigger>
          <TabsTrigger value="adherence" className="flex items-center gap-2" disabled={!dearOne?.accessPermissions.viewAdherence}>
            <Activity className="h-4 w-4" />
            <span>Adherence</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2" disabled={!dearOne?.accessPermissions.viewCalendar}>
            <Calendar className="h-4 w-4" />
            <span>Calendar</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="medications" className="space-y-6">
          {dearOne?.accessPermissions.viewMedications ? (
            patient?.medications && patient.medications.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {patient.medications.map((medication) => (
                  <Card key={medication.id} className="overflow-hidden">
                    <div className="h-2" style={{ backgroundColor: medication.color || '#3b82f6' }}></div>
                    <CardHeader className="pb-2">
                      <CardTitle>{medication.name}</CardTitle>
                      <CardDescription>{medication.dosage}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Frequency</span>
                        <span>{medication.frequency}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Time</span>
                        <span>{medication.timeOfDay}</span>
                      </div>
                      {medication.stock !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Stock</span>
                          <span className={medication.stock < 5 ? 'text-red-500 font-medium' : ''}>
                            {medication.stock} units
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${medication.taken ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {medication.taken ? 'Taken' : 'Not Taken'}
                        </span>
                      </div>
                      {medication.notes && (
                        <div className="pt-2">
                          <span className="text-sm text-muted-foreground">Instructions</span>
                          <p className="text-sm mt-1">{medication.notes}</p>
                        </div>
                      )}
                    </CardContent>
                    {dearOne.accessPermissions.markAsTaken && !medication.taken && (
                      <div className="px-6 pb-4">
                        <Button variant="outline" className="w-full">
                          Mark as Taken
                        </Button>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Pill className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Medications</h3>
                <p className="text-muted-foreground mt-1 max-w-md mx-auto">
                  {patient?.fullName} doesn't have any medications added yet.
                </p>
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Access Restricted</h3>
              <p className="text-muted-foreground mt-1 max-w-md mx-auto">
                You don't have permission to view {patient?.fullName}'s medications.
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="adherence" className="space-y-6">
          {dearOne?.accessPermissions.viewAdherence ? (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Adherence History</h3>
              <p className="text-muted-foreground mt-1 max-w-md mx-auto">
                Adherence history will be displayed here.
              </p>
            </div>
          ) : (
            <div className="text-center py-12">
              <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Access Restricted</h3>
              <p className="text-muted-foreground mt-1 max-w-md mx-auto">
                You don't have permission to view {patient?.fullName}'s adherence history.
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="calendar" className="space-y-6">
          {dearOne?.accessPermissions.viewCalendar ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Medication Calendar</h3>
              <p className="text-muted-foreground mt-1 max-w-md mx-auto">
                Medication calendar will be displayed here.
              </p>
            </div>
          ) : (
            <div className="text-center py-12">
              <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Access Restricted</h3>
              <p className="text-muted-foreground mt-1 max-w-md mx-auto">
                You don't have permission to view {patient?.fullName}'s medication calendar.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DearOnesPortal; 