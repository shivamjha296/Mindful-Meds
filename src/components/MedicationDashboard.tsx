import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Plus, ListTodo, Clock, Calendar as CalendarIcon, PieChart } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar";
import { useAuth } from '@/lib/AuthContext';
import { Medication } from '@/lib/AuthContext';
import MedicationCard from "@/components/MedicationCard";
import TimelineView from "@/components/TimelineView";
import { toast } from '@/components/ui/use-toast';
import { sendMedicationTakenNotification } from '@/utils/notificationUtils';

export function MedicationDashboard() {
  const navigate = useNavigate();
  const { user, userProfile, updateUserProfile } = useAuth();
  const [selectedDay, setSelectedDay] = useState<Date>(new Date());
  const [medications, setMedications] = useState<Medication[]>([]);
  const [activeView, setActiveView] = useState<'grid' | 'timeline' | 'calendar'>(
    userProfile?.dashboardPreferences?.defaultView || 'grid'
  );
  
  // Update active view when userProfile changes
  useEffect(() => {
    if (userProfile?.dashboardPreferences?.defaultView) {
      setActiveView(userProfile.dashboardPreferences.defaultView);
    }
  }, [userProfile]);
  
  // Handle view change
  const handleViewChange = async (view: 'grid' | 'timeline' | 'calendar') => {
    setActiveView(view);
    
    // Save user preference
    try {
      if (updateUserProfile) {
        await updateUserProfile({
          dashboardPreferences: {
            defaultView: view
          }
        });
      }
    } catch (error) {
      console.error('Error saving view preference:', error);
      // Continue with the view change even if saving fails
    }
  };
  
  // Load medications from user profile
  useEffect(() => {
    if (userProfile?.medicalInfo?.medications) {
      console.log("Loading medications for dashboard:", userProfile.medicalInfo.medications);
      
      // Debug output for each medication's stock
      userProfile.medicalInfo.medications.forEach(med => {
        console.log(`Medication ${med.name}, Stock: ${med.stock}, Type: ${typeof med.stock}`);
      });
      
      setMedications(userProfile.medicalInfo.medications);
    }
  }, [userProfile]);
  
  const handleMarkAsTaken = async (id: string) => {
    try {
      const updatedMedications = medications.map(med => {
        if (med.id === id) {
          // If marking as taken, decrement stock (if available)
          const newStock = med.stock !== undefined ? Math.max(0, med.stock - 1) : med.stock;
          return { 
            ...med, 
            taken: true,
            stock: newStock
          };
        }
        return med;
      });
      
      // Update local state
      setMedications(updatedMedications);
      
      // Update user profile
      await updateUserProfile({
        medicalInfo: {
          medications: updatedMedications
        }
      });
      
      // Get the updated medication
      const updatedMed = updatedMedications.find(med => med.id === id);
      
      // Send notification for medication taken
      if (updatedMed && user?.uid) {
        sendMedicationTakenNotification(
          user.uid,
          updatedMed.name,
          updatedMed.dosage || 'prescribed dose'
        );
      }
      
      // Show appropriate toast message
      if (updatedMed?.stock !== undefined && updatedMed.stock <= 5 && updatedMed.stock > 0) {
        toast({
          title: "Medication Taken",
          description: `Running low on ${updatedMed.name}. Only ${updatedMed.stock} doses remaining.`,
        });
      } else if (updatedMed?.stock === 0) {
        toast({
          title: "Medication Taken",
          description: `You've used your last dose of ${updatedMed.name}. Please refill soon.`,
        });
      } else {
        toast({
          title: "Medication marked as taken",
          description: "Great job staying on track with your medication!",
        });
      }
    } catch (error) {
      console.error('Error updating medication status:', error);
      toast({
        title: "Error",
        description: "Failed to update medication status",
      });
    }
  };
  
  const handleDeleteMedication = async (id: string) => {
    try {
      const updatedMedications = medications.filter(med => med.id !== id);
      
      // Update local state
      setMedications(updatedMedications);
      
      // Update user profile
      await updateUserProfile({
        medicalInfo: {
          medications: updatedMedications
        }
      });
      
      toast({
        title: "Medication deleted",
        description: "The medication has been removed from your list.",
      });
    } catch (error) {
      console.error('Error deleting medication:', error);
      toast({
        title: "Error",
        description: "Failed to delete medication",
      });
    }
  };
  
  const handleRefillStock = async (id: string, amount: number) => {
    try {
      const updatedMedications = medications.map(med => {
        if (med.id === id) {
          const currentStock = med.stock !== undefined ? med.stock : 0;
          return { 
            ...med, 
            stock: currentStock + amount
          };
        }
        return med;
      });
      
      // Update local state
      setMedications(updatedMedications);
      
      // Update user profile
      await updateUserProfile({
        medicalInfo: {
          medications: updatedMedications
        }
      });
      
      // Get the updated medication
      const updatedMed = updatedMedications.find(med => med.id === id);
      
      toast({
        title: "Stock Updated",
        description: `Added ${amount} pills to ${updatedMed?.name}. New stock: ${updatedMed?.stock} pills.`,
      });
    } catch (error) {
      console.error('Error updating medication stock:', error);
      toast({
        title: "Error",
        description: "Failed to update medication stock",
      });
    }
  };
  
  const handleEditMedication = (id: string) => {
    navigate(`/profile?tab=medical&edit=${id}`);
  };
  
  // Get medications for today
  const todayMedications = medications.filter(med => {
    // In a real app, we would check if the medication should be taken on the selected day
    // based on start date, end date, and frequency
    return true;
  });
  
  // Stats data
  const stats = [
    { 
      name: 'Adherence Rate', 
      value: medications.length > 0 
        ? `${Math.round((medications.filter(m => m.taken).length / medications.length) * 100)}%` 
        : '0%', 
      icon: <PieChart className="h-5 w-5 text-green-500" /> 
    },
    { 
      name: 'Active Medications', 
      value: medications.length.toString(), 
      icon: <ListTodo className="h-5 w-5 text-blue-500" /> 
    },
    { 
      name: 'Today\'s Doses', 
      value: `${medications.filter(m => m.taken).length}/${medications.length}`, 
      icon: <Clock className="h-5 w-5 text-purple-500" /> 
    },
  ];
  
  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm">
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                {stat.icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Quick Actions */}
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Medication Overview</h2>
        <Button onClick={() => navigate('/profile?tab=medical')}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Medication
        </Button>
      </div>
      
      {/* Main Content */}
      <Tabs defaultValue={activeView} value={activeView} onValueChange={(value) => handleViewChange(value as 'grid' | 'timeline' | 'calendar')} className="mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="timeline" className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Timeline View
          </TabsTrigger>
          <TabsTrigger value="grid" className="flex items-center">
            <ListTodo className="h-4 w-4 mr-2" />
            Grid View
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center">
            <CalendarDays className="h-4 w-4 mr-2" />
            Calendar
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="timeline">
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Showing medications for {selectedDay.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border overflow-hidden">
            {medications.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No medications found. Add your first medication to get started.</p>
                <Button 
                  className="mt-4" 
                  onClick={() => navigate('/profile?tab=medical')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Medication
                </Button>
              </div>
            ) : (
              <TimelineView 
                medications={todayMedications} 
                onMarkAsTaken={handleMarkAsTaken} 
              />
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="grid">
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Showing all your active medications
            </p>
          </div>
          {medications.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-xl p-6 shadow-sm border">
              <p className="text-muted-foreground">No medications found. Add your first medication to get started.</p>
              <Button 
                className="mt-4" 
                onClick={() => navigate('/profile?tab=medical')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Medication
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {medications.map(medication => (
                <MedicationCard 
                  key={medication.id} 
                  medication={medication}
                  onEdit={handleEditMedication}
                  onDelete={handleDeleteMedication}
                  onMarkAsTaken={handleMarkAsTaken}
                  onRefillStock={handleRefillStock}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="calendar">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-4 border-none shadow-sm">
              <CardHeader>
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2 text-primary" />
                  <h3 className="font-medium">Select Date</h3>
                </div>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDay}
                  onSelect={(date) => date && setSelectedDay(date)}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>
            
            <div className="lg:col-span-8">
              <Card className="h-full border-none shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <ListTodo className="h-5 w-5 mr-2 text-primary" />
                      <h3 className="font-medium">
                        Medications for {selectedDay.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </h3>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {medications.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No medications found for this date.</p>
                      <Button 
                        className="mt-4" 
                        onClick={() => navigate('/profile?tab=medical')}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Medication
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {todayMedications.map(medication => (
                        <MedicationCard
                          key={medication.id}
                          medication={medication}
                          compact={true}
                          onMarkAsTaken={handleMarkAsTaken}
                          onRefillStock={handleRefillStock}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Upcoming Doses */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Today's Upcoming Doses</h2>
        {medications.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-xl p-6 shadow-sm border">
            <p className="text-muted-foreground">No medications found. Add your first medication to get started.</p>
            <Button 
              className="mt-4" 
              onClick={() => navigate('/profile?tab=medical')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Medication
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {medications
              .filter(med => !med.taken)
              .slice(0, 4)
              .map(medication => (
                <MedicationCard
                  key={medication.id}
                  medication={medication}
                  compact={true}
                  onMarkAsTaken={handleMarkAsTaken}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
} 