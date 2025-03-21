import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Calendar, Pill } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Medication } from "@/components/MedicationCard";
import { convertToFrontendFormat } from "@/services/medicationService";

// Define a type for medication history entries
interface MedicationHistoryEntry {
  id: string;
  name: string;
  dosage: string;
  date: string;
  time: string;
  status: 'taken' | 'missed';
}

type MedicationStatus = 'taken' | 'missed' | 'skipped';

export const ProfileMedicationHistory = () => {
  const { userProfile, profileLoading } = useAuth();
  const navigate = useNavigate();
  const [medicationHistory, setMedicationHistory] = useState<MedicationHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Generate medication history from user's medications
  useEffect(() => {
    const generateMedicationHistory = async () => {
      try {
        setIsLoading(true);
        if (userProfile?.medications && userProfile.medications.length > 0) {
          const history: MedicationHistoryEntry[] = [];
          
          // Convert Firebase medications to frontend format and filter out null values
          const medications = userProfile.medications
            .map(med => convertToFrontendFormat(med))
            .filter((med): med is Medication => med !== null);
          
          // Process each medication to create history entries
          medications.forEach((med) => {
            // Create an entry for the medication
            const startDate = new Date(med.startDate);
            const endDate = med.endDate ? new Date(med.endDate) : new Date();
            const today = new Date();
            
            // For simplicity, we'll show entries for the last 7 days
            for (let i = 0; i < 7; i++) {
              const date = new Date();
              date.setDate(date.getDate() - i);
              
              // Only include if the date is within the medication's date range
              if (date >= startDate && date <= endDate) {
                const dateStr = date.toISOString().split('T')[0];
                
                // For today, use the actual taken status
                // For past days, randomly assign taken/missed for demo purposes
                // In a real app, you would have actual historical data
                const isTodayEntry = i === 0;
                const status = isTodayEntry ? (med.taken ? 'taken' : 'missed') : 
                              (Math.random() > 0.2 ? 'taken' : 'missed');
                
                history.push({
                  id: `${med.id}-${dateStr}`,
                  name: med.name,
                  dosage: med.dosage,
                  date: dateStr,
                  time: med.time,
                  status: status
                });
              }
            }
          });
          
          // Sort by date (newest first)
          history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          
          setMedicationHistory(history);
        } else {
          setMedicationHistory([]);
        }
      } catch (error) {
        console.error("Error generating medication history:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    generateMedicationHistory();
  }, [userProfile]);

  const handleAddMedication = () => {
    navigate('/add-medication');
  };

  if (profileLoading || isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <LoadingSpinner size="lg" />
          <p className="ml-4 text-muted-foreground">Loading medication history...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Medication History</CardTitle>
        <CardDescription>
          Review your medication history and adherence.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="recent">
          <TabsList className="mb-4">
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="monthly">Monthly Report</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recent">
            {medicationHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg">
                <div className="rounded-full bg-primary/10 p-3 mb-4">
                  <Pill className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-2">No medication history</h3>
                <p className="text-muted-foreground text-center mb-4">
                  You haven't added any medications yet.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={handleAddMedication}
                >
                  Add Medication
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {medicationHistory.map((med) => (
                  <div 
                    key={med.id} 
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <StatusIcon status={med.status as MedicationStatus} />
                      <div>
                        <h4 className="font-medium">{med.name} {med.dosage}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(med.date).toLocaleDateString()} at {med.time}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-medium ${getStatusColor(med.status as MedicationStatus)}`}>
                      {capitalizeFirstLetter(med.status)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="monthly">
            <div className="flex items-center justify-center rounded-lg border border-dashed p-8">
              <div className="flex flex-col items-center text-center gap-2">
                <Calendar className="h-8 w-8 text-muted-foreground" />
                <h3 className="font-medium">Monthly Reports</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Detailed monthly medication adherence reports will be available soon. 
                  Check back later for insights into your medication routine.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

const StatusIcon = ({ status }: { status: MedicationStatus }) => {
  switch (status) {
    case 'taken':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'missed':
      return <XCircle className="h-5 w-5 text-red-500" />;
    case 'skipped':
      return <Calendar className="h-5 w-5 text-amber-500" />;
    default:
      return null;
  }
};

const getStatusColor = (status: MedicationStatus): string => {
  switch (status) {
    case 'taken':
      return 'text-green-500';
    case 'missed':
      return 'text-red-500';
    case 'skipped':
      return 'text-amber-500';
    default:
      return '';
  }
};

const capitalizeFirstLetter = (string: string): string => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};
