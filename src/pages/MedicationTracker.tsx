import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import TimelineView from '@/components/TimelineView';
import { Check, List, Pill } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';

interface MedicationHistoryItem {
  id: string;
  medicationName: string;
  dosage: string;
  status: 'taken' | 'missed' | 'skipped';
  scheduledTime: string;
  actualTime?: string;
  date: Date;
}

// Sample medication history data
const generateSampleMedicationHistory = (): MedicationHistoryItem[] => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  
  return [
    {
      id: '1',
      medicationName: 'Lisinopril',
      dosage: '10mg',
      status: 'taken',
      scheduledTime: '08:00 AM',
      actualTime: '08:05 AM',
      date: today
    },
    {
      id: '2',
      medicationName: 'Metformin',
      dosage: '500mg',
      status: 'missed',
      scheduledTime: '02:30 PM',
      date: today
    },
    {
      id: '3',
      medicationName: 'Atorvastatin',
      dosage: '20mg',
      status: 'taken',
      scheduledTime: '08:00 PM',
      actualTime: '08:15 PM',
      date: today
    },
    {
      id: '4',
      medicationName: 'Lisinopril',
      dosage: '10mg',
      status: 'taken',
      scheduledTime: '08:00 AM',
      actualTime: '08:10 AM',
      date: yesterday
    },
    {
      id: '5',
      medicationName: 'Metformin',
      dosage: '500mg',
      status: 'taken',
      scheduledTime: '02:30 PM',
      actualTime: '02:45 PM',
      date: yesterday
    },
    {
      id: '6',
      medicationName: 'Atorvastatin',
      dosage: '20mg',
      status: 'skipped',
      scheduledTime: '08:00 PM',
      date: yesterday
    },
    {
      id: '7',
      medicationName: 'Lisinopril',
      dosage: '10mg',
      status: 'taken',
      scheduledTime: '08:00 AM',
      actualTime: '08:00 AM',
      date: twoDaysAgo
    }
  ];
};

const MedicationTracker = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [medicationHistory] = useState<MedicationHistoryItem[]>(generateSampleMedicationHistory());
  
  // Filter medication history based on selected date
  const filteredHistory = medicationHistory.filter(item => 
    item.date.toDateString() === date.toDateString()
  );
  
  // Calculate adherence rate for selected date
  const calculateAdherenceRate = (items: MedicationHistoryItem[]) => {
    if (items.length === 0) return 0;
    const takenCount = items.filter(item => item.status === 'taken').length;
    return Math.round((takenCount / items.length) * 100);
  };
  
  const adherenceRate = calculateAdherenceRate(filteredHistory);
  
  const StatusBadge = ({ status }: { status: string }) => {
    switch(status) {
      case 'taken':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Taken</Badge>;
      case 'missed':
        return <Badge className="bg-red-100 text-red-700 border-red-200">Missed</Badge>;
      case 'skipped':
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Skipped</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };
  
  // Generate timeline events from medication history
  const timelineEvents = filteredHistory.map(item => ({
    time: item.actualTime || item.scheduledTime,
    title: `${item.medicationName} (${item.dosage})`,
    description: item.status === 'taken' 
      ? `Taken at ${item.actualTime}` 
      : item.status === 'missed'
        ? 'Missed dose'
        : 'Skipped dose',
    status: item.status,
  }));
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 pt-24">
        <h1 className="text-3xl font-bold mb-6">Medication Tracker</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Select Date</CardTitle>
                <CardDescription>View your medication history</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Daily Summary</CardTitle>
                <CardDescription>
                  {date.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Adherence Rate</span>
                    <span className="font-semibold">{adherenceRate}%</span>
                  </div>
                  
                  <div className="w-full bg-secondary rounded-full h-2.5">
                    <div 
                      className="h-2.5 rounded-full bg-primary" 
                      style={{ width: `${adherenceRate}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between mt-4">
                    <div className="text-center">
                      <div className="text-lg font-bold">{filteredHistory.filter(item => item.status === 'taken').length}</div>
                      <div className="text-xs text-muted-foreground">Taken</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">{filteredHistory.filter(item => item.status === 'missed').length}</div>
                      <div className="text-xs text-muted-foreground">Missed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold">{filteredHistory.filter(item => item.status === 'skipped').length}</div>
                      <div className="text-xs text-muted-foreground">Skipped</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Medication History</CardTitle>
                <CardDescription>
                  View your medication intake for {date.toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="timeline" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="timeline" className="flex items-center gap-2">
                      <List className="h-4 w-4" />
                      Timeline
                    </TabsTrigger>
                    <TabsTrigger value="list" className="flex items-center gap-2">
                      <Pill className="h-4 w-4" />
                      List View
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="timeline">
                    {timelineEvents.length > 0 ? (
                      <TimelineView events={timelineEvents} />
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12">
                        <Pill className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No medication history for this date</p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="list">
                    {filteredHistory.length > 0 ? (
                      <div className="space-y-4">
                        {filteredHistory.map((item) => (
                          <div key={item.id} className="flex items-start p-4 border rounded-lg">
                            <div className={`p-2 rounded-full mr-4 ${
                              item.status === 'taken' ? 'bg-green-100' : 
                              item.status === 'missed' ? 'bg-red-100' : 'bg-amber-100'
                            }`}>
                              {item.status === 'taken' ? (
                                <Check className="h-5 w-5 text-green-600" />
                              ) : (
                                <Pill className={`h-5 w-5 ${
                                  item.status === 'missed' ? 'text-red-600' : 'text-amber-600'
                                }`} />
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <h3 className="font-medium">{item.medicationName} ({item.dosage})</h3>
                                <StatusBadge status={item.status} />
                              </div>
                              
                              <div className="text-sm text-muted-foreground mt-1">
                                <div>Scheduled: {item.scheduledTime}</div>
                                {item.actualTime && (
                                  <div>Taken at: {item.actualTime}</div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12">
                        <Pill className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No medication history for this date</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicationTracker;
