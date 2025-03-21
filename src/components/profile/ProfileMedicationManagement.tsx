import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Medication } from '@/lib/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Pill } from 'lucide-react';
import { toast } from 'sonner';
import AddMedication from '@/components/AddMedication';
import MedicationCard from '@/components/MedicationCard';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { fetchMedications, convertToFrontendFormat, convertToFirebaseFormat, deleteMedication } from '@/services/medicationService';
import { sendMedicationTakenNotification } from '@/utils/notificationUtils';

const ProfileMedicationManagement: React.FC = () => {
  const { userProfile, updateUserProfile, profileLoading, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  
  // Check if we should open the edit dialog based on URL params
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId && medications.length > 0) {
      const medicationToEdit = medications.find(med => med.id === editId);
      if (medicationToEdit) {
        setEditingMedication(medicationToEdit);
        setIsAddDialogOpen(true);
      }
    }
  }, [searchParams, medications]);
  
  // Load medications from user profile and backend
  useEffect(() => {
    const loadMedications = async () => {
      try {
        setIsLoading(true);
        
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
        
        // If we have medications in the profile, use those
        if (medsFromProfile.length > 0) {
          setMedications(medsFromProfile);
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
        toast.error("Failed to load medications");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMedications();
  }, [userProfile, updateUserProfile]);
  
  const handleAddMedication = () => {
    setEditingMedication(undefined);
    setIsAddDialogOpen(true);
  };
  
  const handleEditMedication = (id: string) => {
    const medicationToEdit = medications.find(med => med.id === id);
    if (medicationToEdit) {
      setEditingMedication(medicationToEdit);
      setIsAddDialogOpen(true);
      
      // Update URL for direct linking
      searchParams.set('edit', id);
      setSearchParams(searchParams);
    }
  };
  
  const handleDeleteMedication = async (id: string) => {
    try {
      if (!window.confirm("Are you sure you want to delete this medication?")) {
        return;
      }
      
      setIsLoading(true);
      
      // Call the delete function from the service
      const success = await deleteMedication(id);
      
      if (!success) {
        throw new Error('Failed to delete medication from backend');
      }
      
      const updatedMedications = medications.filter(med => med.id !== id);
      
      // Update local state
      setMedications(updatedMedications);
      
      // Convert to the format expected by Firebase
      const firebaseMeds = updatedMedications.map(med => convertToFirebaseFormat(med));
      
      // Update user profile in Firebase
      await updateUserProfile({
        medications: firebaseMeds
      });
      
      toast.success('Medication deleted successfully');
    } catch (error) {
      console.error('Error deleting medication:', error);
      toast.error('Failed to delete medication');
      
      // Revert local state if Firebase update fails
      if (userProfile?.medications) {
        setMedications(
          userProfile.medications
            .map(med => convertToFrontendFormat(med))
            .filter((med): med is Medication => med !== null)
        );
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMarkAsTaken = async (id: string) => {
    try {
      setIsLoading(true);
      const updatedMedications = medications.map(med => 
        med.id === id ? { ...med, taken: true } : med
      );
      
      // Update local state
      setMedications(updatedMedications);
      
      // Convert to the format expected by Firebase
      const firebaseMeds = updatedMedications.map(med => convertToFirebaseFormat(med));
      
      // Update user profile in Firebase
      await updateUserProfile({
        medications: firebaseMeds
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
      
      toast.success('Medication marked as taken');
    } catch (error) {
      console.error('Error marking medication as taken:', error);
      toast.error('Failed to update medication status');
      
      // Revert local state if Firebase update fails
      if (userProfile?.medications) {
        setMedications(
          userProfile.medications
            .map(med => convertToFrontendFormat(med))
            .filter((med): med is Medication => med !== null)
        );
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRefillStock = async (medicationId: string, amount: number) => {
    try {
      setIsLoading(true);
      
      // Find the medication to update
      const updatedMedications = medications.map(med => {
        if (med.id === medicationId) {
          // Calculate new stock by adding the amount
          const currentStock = med.stock || 0;
          return {
            ...med,
            stock: currentStock + amount
          };
        }
        return med;
      });
      
      // Update local state
      setMedications(updatedMedications);
      
      // Convert to the format expected by Firebase
      const firebaseMeds = updatedMedications.map(med => convertToFirebaseFormat(med));
      
      // Update user profile in Firebase
      if (updateUserProfile) {
        await updateUserProfile({
          medications: firebaseMeds
        });
        
        toast.success(`Added ${amount} pills to your stock`);
      }
    } catch (error) {
      console.error('Error refilling medication stock:', error);
      toast.error('Failed to update medication stock');
      
      // Revert local state if Firebase update fails
      if (userProfile?.medications) {
        setMedications(
          userProfile.medications
            .map(med => convertToFrontendFormat(med))
            .filter((med): med is Medication => med !== null)
        );
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmitMedication = async (medication: Medication) => {
    try {
      setIsLoading(true);
      let updatedMedications: Medication[];
      
      if (editingMedication) {
        // Update existing medication
        updatedMedications = medications.map(med => 
          med.id === medication.id ? medication : med
        );
        toast.success('Medication updated successfully');
      } else {
        // Add new medication
        updatedMedications = [...medications, medication];
        toast.success('Medication added successfully');
      }
      
      // Update local state
      setMedications(updatedMedications);
      
      // Convert to the format expected by Firebase
      const firebaseMeds = updatedMedications.map(med => convertToFirebaseFormat(med));
      
      // Update user profile in Firebase
      await updateUserProfile({
        medications: firebaseMeds
      });
      
      // Clear edit param from URL if it exists
      if (searchParams.has('edit')) {
        searchParams.delete('edit');
        setSearchParams(searchParams);
      }
    } catch (error) {
      console.error('Error saving medication:', error);
      toast.error('Failed to save medication');
      
      // Revert local state if Firebase update fails
      if (userProfile?.medications) {
        setMedications(
          userProfile.medications
            .map(med => convertToFrontendFormat(med))
            .filter((med): med is Medication => med !== null)
        );
      }
    } finally {
      setIsLoading(false);
      setIsAddDialogOpen(false);
    }
  };
  
  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <p className="ml-4 text-lg text-muted-foreground">Loading your medications...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Medication Management</h2>
          <p className="text-muted-foreground">
            Add, edit, and manage your medications
          </p>
        </div>
        <Button onClick={handleAddMedication} disabled={isLoading}>
          <Plus className="mr-2 h-4 w-4" />
          Add Medication
        </Button>
      </div>
      
      {isLoading && (
        <div className="flex items-center justify-center h-12 mb-4">
          <LoadingSpinner size="sm" />
          <p className="ml-2 text-sm text-muted-foreground">Updating...</p>
        </div>
      )}
      
      {medications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="rounded-full bg-primary/10 p-3 mb-4">
              <Pill className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">No medications added yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start tracking your medications by adding your first one.
            </p>
            <Button onClick={handleAddMedication} disabled={isLoading}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Medication
            </Button>
          </CardContent>
        </Card>
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
              disabled={isLoading}
            />
          ))}
        </div>
      )}
      
      <AddMedication
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleSubmitMedication}
        editMedication={editingMedication}
      />
    </div>
  );
};

export default ProfileMedicationManagement;