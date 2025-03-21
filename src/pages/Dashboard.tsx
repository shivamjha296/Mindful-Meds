import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CalendarDays, Plus, ListTodo, Clock, Calendar as CalendarIcon, PieChart, Pill, Badge, Check } from 'lucide-react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MedicationCard from "@/components/MedicationCard";
import TimelineView from "@/components/TimelineView";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Medication } from "@/lib/AuthContext";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { 
  fetchMedications, 
  convertToFrontendFormat, 
  convertToFirebaseFormat, 
  deleteMedication,
  syncMedications
} from "@/services/medicationService";
import { API_URL } from "@/lib/constants";
import { sendMedicationTakenNotification } from '@/services/notificationService';

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { userProfile, updateUserProfile, profileLoading } = useAuth();
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  
  // Load medications from user profile and backend
  useEffect(() => {
    const loadMedications = async () => {
      try {
        setLoading(true);
        
        // First, check if we have medications in the user profile
        let medsFromProfile: Medication[] = [];
        if (userProfile?.medications && Array.isArray(userProfile.medications)) {
          console.log("Loading medications from user profile:", userProfile.medications);
          
          // Convert the medications from the user profile format to our Medication type
          // and filter out any null values (invalid medications)
          medsFromProfile = userProfile.medications
            .map(med => convertToFrontendFormat(med))
            .filter((med): med is Medication => med !== null);
        }
        
        // Then, fetch medications from the backend
        const backendMeds = await fetchMedications();
        console.log("Medications from backend:", backendMeds);
        
        // If we have medications in the profile, use those and sync with backend
        if (medsFromProfile.length > 0) {
          setMedications(medsFromProfile);
          
          // Convert to the format expected by Firebase and sync with backend
          if (updateUserProfile) {
            const firebaseMeds = medsFromProfile.map(med => convertToFirebaseFormat(med));
            
            // Sync with backend in the background
            syncMedications(firebaseMeds).catch(error => {
              console.error("Error syncing medications with backend:", error);
            });
          }
        } 
        // Otherwise, if we have medications from the backend, convert and use those
        else if (backendMeds.length > 0) {
          const convertedMeds: Medication[] = backendMeds.map((med, index) => ({
            id: `backend-${index}`,
            name: med.name,
            dosage: med.dosage,
            frequency: med.frequency,
            time: med.timeOfDay || '08:00',
            startDate: med.startDate ? new Date(med.startDate).toISOString() : new Date().toISOString(),
            endDate: med.endDate ? new Date(med.endDate).toISOString() : undefined,
            instructions: med.notes || '',
            color: ['blue', 'green', 'purple', 'red', 'yellow'][index % 5],
            taken: false,
            stock: med.stock !== undefined ? med.stock : 0,
            createdAt: new Date()
          }));
          
          setMedications(convertedMeds);
          
          // Update the user profile with these medications
          if (updateUserProfile) {
            // Convert to the format expected by Firebase
            const firebaseMeds = convertedMeds.map(med => convertToFirebaseFormat(med));
            
            await updateUserProfile({
              medications: firebaseMeds
            });
          }
        } else {
          console.log("No medications found in user profile or backend");
          setMedications([]);
        }
      } catch (error) {
        console.error("Error loading medications:", error);
        setError("Failed to load medications. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    // Only load medications if we have a user profile
    if (userProfile) {
      loadMedications();
    }
  }, [userProfile]);
  
  const handleMarkAsTaken = async (medicationId: string) => {
    try {
      // Update local state
      const updatedMedications = medications.map(med => {
        if (med.id === medicationId) {
          // If marking as taken, decrement stock (if available)
          const currentStock = med.stock !== undefined ? med.stock : 0;
          const newStock = !med.taken && currentStock !== undefined ? Math.max(0, currentStock - 1) : currentStock;
          
          console.log(`Marking medication ${med.name} as ${!med.taken ? 'taken' : 'not taken'}`);
          console.log(`Current stock: ${currentStock}, New stock: ${newStock}`);
          
          return { 
            ...med, 
            taken: !med.taken,
            stock: newStock
          };
        }
        return med;
      });
      
      setMedications(updatedMedications);
      
      // Convert to the format expected by Firebase
      const firebaseMeds = updatedMedications.map(med => convertToFirebaseFormat(med));
      
      // Update user profile in Firebase
      if (userProfile && updateUserProfile) {
        await updateUserProfile({
          medications: firebaseMeds
        });
      }
      
      // Get the updated medication
      const updatedMed = updatedMedications.find(med => med.id === medicationId);
      
      // Send notification if medication was marked as taken
      if (updatedMed?.taken) {
        // Send a notification that the medication was taken
        sendMedicationTakenNotification(updatedMed);
        
        // Show appropriate toast message
        if (updatedMed.stock !== undefined && updatedMed.stock <= 5 && updatedMed.stock > 0) {
          toast({
            title: "Medication Taken",
            description: `Running low on ${updatedMed.name}. Only ${updatedMed.stock} doses remaining.`,
          });
        } else if (updatedMed.stock === 0) {
          toast({
            title: "Medication Taken",
            description: `You've used your last dose of ${updatedMed.name}. Please refill soon.`,
          });
        } else {
          toast({
            title: "Success",
            description: "Medication marked as taken",
          });
        }
      } else {
        toast({
          title: "Success",
          description: "Medication marked as not taken",
        });
      }
    } catch (error) {
      console.error("Error updating medication status:", error);
      setError("Failed to update medication status. Please try again.");
      
      // Revert local state if Firebase update fails
      if (userProfile?.medications) {
        setMedications(
          userProfile.medications
            .map(med => convertToFrontendFormat(med))
            .filter((med): med is Medication => med !== null)
        );
      }
    }
  };
  
  const handleAddMedication = () => {
    navigate('/add-medication');
  };
  
  // Handle deleting a medication
  const handleDeleteMedication = async (medicationId: string) => {
    try {
      if (!window.confirm("Are you sure you want to delete this medication?")) {
        return;
      }
      
      setLoading(true);
      
      // Call the delete function from the service
      const success = await deleteMedication(medicationId);
      
      if (!success) {
        throw new Error('Failed to delete medication from backend');
      }
      
      // Filter out the deleted medication
      const updatedMedications = medications.filter(med => med.id !== medicationId);
      setMedications(updatedMedications);
      
      // Convert to the format expected by Firebase
      const firebaseMeds = updatedMedications.map(med => convertToFirebaseFormat(med));
      
      // Update user profile in Firebase
      if (userProfile && updateUserProfile) {
        await updateUserProfile({
          medications: firebaseMeds
        });
      }
      
      toast({
        title: "Success",
        description: "Medication deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting medication:", error);
      setError("Failed to delete medication. Please try again.");
      
      // Revert local state if Firebase update fails
      if (userProfile?.medications) {
        setMedications(
          userProfile.medications
            .map(med => convertToFrontendFormat(med))
            .filter((med): med is Medication => med !== null)
        );
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleRefillStock = async (medicationId: string, amount: number) => {
    try {
      // Update local state
      const updatedMedications = medications.map(med => {
        if (med.id === medicationId) {
          const currentStock = med.stock !== undefined ? med.stock : 0;
          return { 
            ...med, 
            stock: currentStock + amount
          };
        }
        return med;
      });
      
      setMedications(updatedMedications);
      
      // Convert to the format expected by Firebase
      const firebaseMeds = updatedMedications.map(med => convertToFirebaseFormat(med));
      
      // Update user profile in Firebase
      if (userProfile && updateUserProfile) {
        await updateUserProfile({
          medications: firebaseMeds
        });
      }
      
      // Get the updated medication
      const updatedMed = updatedMedications.find(med => med.id === medicationId);
      
      toast({
        title: "Stock Updated",
        description: `Added ${amount} pills to ${updatedMed?.name}. New stock: ${updatedMed?.stock} pills.`,
      });
    } catch (error) {
      console.error("Error updating medication stock:", error);
      setError("Failed to update medication stock. Please try again.");
      
      // Revert local state if Firebase update fails
      if (userProfile?.medications) {
        setMedications(
          userProfile.medications
            .map(med => convertToFrontendFormat(med))
            .filter((med): med is Medication => med !== null)
        );
      }
    }
  };
  
  // Filter medications for the selected day
  const getMedicationsForSelectedDay = () => {
    const selectedDateStr = selectedDay.toISOString().split('T')[0];
    return medications.filter(med => {
      const startDate = new Date(med.startDate);
      const endDate = med.endDate ? new Date(med.endDate) : null;
      
      // Check if the selected day is within the medication date range
      const isAfterStart = selectedDay >= startDate;
      const isBeforeEnd = endDate ? selectedDay <= endDate : true;
      
      return isAfterStart && isBeforeEnd;
    });
  };
  
  // Get medications for the selected day
  const medicationsForSelectedDay = getMedicationsForSelectedDay();
  
  // Calculate adherence rate
  const calculateAdherenceRate = () => {
    if (medications.length === 0) return 0;
    const takenCount = medications.filter(med => med.taken).length;
    return Math.round((takenCount / medications.length) * 100);
  };
  
  // Get today's medications
  const getTodaysMedications = () => {
    const today = new Date().toISOString().split('T')[0];
    return medications.filter(med => {
      const startDate = new Date(med.startDate);
      const endDate = med.endDate ? new Date(med.endDate) : null;
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate ? endDate.toISOString().split('T')[0] : null;
      
      return (startDateStr <= today && (!endDateStr || endDateStr >= today));
    });
  };
  
  // Get today's medications
  const todaysMedications = getTodaysMedications();
  
  // Calculate today's adherence rate
  const calculateTodaysAdherenceRate = () => {
    if (todaysMedications.length === 0) return 0;
    const takenCount = todaysMedications.filter(med => med.taken).length;
    return Math.round((takenCount / todaysMedications.length) * 100);
  };
  
  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
        <p className="ml-4 text-lg text-muted-foreground">Loading your medications...</p>
      </div>
    );
  }
  
  // Stats data
  const stats = [
    { name: 'Adherence Rate', value: calculateAdherenceRate().toString() + '%', icon: <PieChart className="h-5 w-5 text-green-500" /> },
    { name: 'Active Medications', value: medications.length.toString(), icon: <ListTodo className="h-5 w-5 text-blue-500" /> },
    { name: 'Today\'s Doses', value: todaysMedications.length.toString() + '/' + todaysMedications.filter(med => !med.taken).length.toString(), icon: <Clock className="h-5 w-5 text-purple-500" /> },
  ];
  
  // Get medications for today
  const todayMedications = todaysMedications;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow pt-24 pb-16">
        <div className="container max-w-7xl mx-auto px-4 md:px-6">
          <h1 className="text-3xl font-bold mb-6">Medication Dashboard</h1>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="flex items-center p-6">
                  <div className="rounded-full bg-primary/10 p-3 mr-4">
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                    <h3 className="text-2xl font-bold">{stat.value}</h3>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Medication List */}
            <div className="lg:col-span-2">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Medication Overview</h2>
                <Button onClick={handleAddMedication}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Medication
                </Button>
              </div>
              
              <Tabs defaultValue="timeline">
                <TabsList className="mb-4">
                  <TabsTrigger value="timeline" className="px-6 py-3 text-base">
                    <Clock className="h-5 w-5 mr-2" />
                    Timeline
                  </TabsTrigger>
                  <TabsTrigger value="grid" className="px-6 py-3 text-base">
                    <ListTodo className="h-5 w-5 mr-2" />
                    Grid
                  </TabsTrigger>
                  <TabsTrigger value="calendar" className="px-6 py-3 text-base">
                    <CalendarDays className="h-5 w-5 mr-2" />
                    Calendar
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="timeline" className="space-y-4 min-h-[500px] w-full">
                  {medications.length === 0 ? (
                    <Card className="min-h-[400px]">
                      <CardContent className="flex flex-col items-center justify-center p-8">
                        <div className="rounded-full bg-primary/10 p-4 mb-5">
                          <Pill className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-medium mb-3">No medications added yet</h3>
                        <p className="text-muted-foreground text-center mb-5 text-base">
                          Start tracking your medications by adding your first one.
                        </p>
                        <Button 
                          variant="outline" 
                          className="mt-4 px-6 py-2 text-base"
                          onClick={handleAddMedication}
                        >
                          Add Medication
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="min-h-[500px] w-full">
                      <TimelineView 
                        medications={medications} 
                        onMarkAsTaken={handleMarkAsTaken} 
                      />
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="grid" className="space-y-4 min-h-[500px]">
                  {medications.length === 0 ? (
                    <Card className="min-h-[400px]">
                      <CardContent className="flex flex-col items-center justify-center p-8">
                        <div className="rounded-full bg-primary/10 p-4 mb-5">
                          <Pill className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-medium mb-3">No medications added yet</h3>
                        <p className="text-muted-foreground text-center mb-5 text-base">
                          Start tracking your medications by adding your first one.
                        </p>
                        <Button 
                          variant="outline" 
                          className="mt-4 px-6 py-2 text-base"
                          onClick={handleAddMedication}
                        >
                          Add Medication
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {medications.map(medication => (
                        <MedicationCard 
                          key={medication.id} 
                          medication={medication}
                          onEdit={() => navigate(`/add-medication?edit=${medication.id}`)}
                          onDelete={handleDeleteMedication}
                          onMarkAsTaken={handleMarkAsTaken}
                          onRefillStock={handleRefillStock}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="calendar">
                  <Card className="min-h-[500px]">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="md:w-1/2">
                          <div className="bg-white rounded-lg border shadow-sm p-4">
                            <Calendar
                              mode="single"
                              selected={selectedDay}
                              onSelect={(date) => date && setSelectedDay(date)}
                              className="rounded-md"
                            />
                          </div>
                        </div>
                        <div className="md:w-1/2">
                          <div className="bg-white rounded-lg border shadow-sm p-6 h-full">
                            <h3 className="text-lg font-medium mb-4 text-slate-900">
                              Medications for {selectedDay.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </h3>
                            {medicationsForSelectedDay.length === 0 ? (
                              <div className="flex flex-col items-center justify-center py-8 text-center">
                                <Pill className="h-8 w-8 text-slate-300 mb-4" />
                                <p className="text-slate-500 mb-4">No medications scheduled for this day</p>
                                <Button 
                                  variant="outline" 
                                  className="mt-2"
                                  onClick={handleAddMedication}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Medication
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                {medicationsForSelectedDay.map(medication => (
                                  <div 
                                    key={medication.id} 
                                    className="p-4 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors"
                                  >
                                    <div className="flex justify-between items-start">
                                      <div className="flex items-start">
                                        <div 
                                          className="w-4 h-4 rounded-full mt-1 mr-3 flex-shrink-0" 
                                          style={{ backgroundColor: medication.color || '#3b82f6' }}
                                        ></div>
                                        <div>
                                          <h4 className="font-medium text-slate-900">{medication.name}</h4>
                                          <div className="text-sm text-slate-500 mt-1">{medication.dosage}</div>
                                        </div>
                                      </div>
                                      
                                      <div className="flex flex-col items-end space-y-2">
                                        <div className="flex items-center text-sm text-slate-500">
                                          <Clock className="h-3 w-3 mr-1" />
                                          {new Date(`2000-01-01T${medication.time}`).toLocaleTimeString('en-US', { 
                                            hour: 'numeric', 
                                            minute: '2-digit' 
                                          })}
                                        </div>
                                        
                                        {medication.taken ? (
                                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                            Taken
                                          </Badge>
                                        ) : (
                                          <Button 
                                            size="sm" 
                                            variant="outline" 
                                            className="h-8 border-blue-200 text-blue-700 hover:bg-blue-50"
                                            onClick={() => handleMarkAsTaken(medication.id)}
                                          >
                                            <Check className="h-4 w-4 mr-1" />
                                            Take
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Right Column - Today's Doses & Calendar */}
            <div>
              <Card className="mb-6">
                <CardHeader>
                  <h2 className="text-xl font-semibold mb-4">Today's Upcoming Doses</h2>
                </CardHeader>
                <CardContent>
                  {todayMedications.filter(med => !med.taken).length === 0 ? (
                    <div className="text-center p-4">
                      <p className="text-muted-foreground">No medications left to take today</p>
                      <p className="text-sm text-green-600 mt-2">All done for today! 🎉</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {todayMedications
                        .filter(med => !med.taken)
                        .map(medication => (
                          <MedicationCard 
                            key={medication.id} 
                            medication={medication}
                            compact
                            onMarkAsTaken={handleMarkAsTaken}
                            onEdit={() => navigate(`/add-medication?edit=${medication.id}`)}
                            onDelete={handleDeleteMedication}
                            onRefillStock={handleRefillStock}
                          />
                        ))
                      }
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold mb-4">Medication Adherence</h2>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Today's Adherence</p>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div 
                          className="bg-green-500 h-2.5 rounded-full" 
                          style={{ width: `${calculateTodaysAdherenceRate()}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-right mt-1">{calculateTodaysAdherenceRate()}%</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Overall Adherence</p>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div 
                          className="bg-primary h-2.5 rounded-full" 
                          style={{ width: `${calculateAdherenceRate()}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-right mt-1">{calculateAdherenceRate()}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
