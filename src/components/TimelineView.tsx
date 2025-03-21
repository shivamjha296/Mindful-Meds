import React from 'react';
import { Medication } from '@/lib/AuthContext';
import { Button } from "@/components/ui/button";
import { Check, Clock } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface TimelineViewProps {
  medications: Medication[];
  onMarkAsTaken: (id: string) => void;
}

const TimelineView: React.FC<TimelineViewProps> = ({ medications, onMarkAsTaken }) => {
  // Sort medications by time
  const sortedMedications = [...medications].sort((a, b) => {
    const timeA = a.time.split(':').map(Number);
    const timeB = b.time.split(':').map(Number);
    
    // Compare hours first
    if (timeA[0] !== timeB[0]) {
      return timeA[0] - timeB[0];
    }
    
    // If hours are the same, compare minutes
    return timeA[1] - timeB[1];
  });
  
  // Group medications by hour
  const groupedByHour: Record<string, Medication[]> = {};
  
  sortedMedications.forEach(med => {
    const hour = med.time.split(':')[0];
    if (!groupedByHour[hour]) {
      groupedByHour[hour] = [];
    }
    groupedByHour[hour].push(med);
  });
  
  // Format time for display
  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const date = new Date();
      date.setHours(parseInt(hours, 10));
      date.setMinutes(parseInt(minutes, 10));
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } catch (e) {
      return timeString;
    }
  };
  
  // Get hour label
  const getHourLabel = (hour: string) => {
    const hourNum = parseInt(hour, 10);
    if (hourNum === 0) return '12 AM';
    if (hourNum === 12) return '12 PM';
    return hourNum > 12 ? `${hourNum - 12} PM` : `${hourNum} AM`;
  };
  
  if (medications.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No medications scheduled for today.</p>
      </div>
    );
  }
  
  return (
    <div className="relative bg-white rounded-lg border shadow-sm p-4 min-h-[500px]">
      {/* Timeline line */}
      <div className="absolute left-[20px] top-0 bottom-0 w-[2px] bg-slate-100"></div>
      
      {/* Timeline events */}
      <div className="space-y-8 pl-10">
        {Object.keys(groupedByHour).sort().map(hour => {
          return (
            <div key={hour} className="relative pt-2">
              {/* Hour marker */}
              <div className="absolute left-[-30px] w-[12px] h-[12px] rounded-full bg-slate-200 mt-2"></div>
              
              {/* Hour label */}
              <div className="text-base font-medium text-slate-700 mb-4">
                {getHourLabel(hour)}
              </div>
              
              {/* Medications for this hour */}
              <div className="space-y-4">
                {groupedByHour[hour].map(medication => (
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
                          {medication.instructions && (
                            <div className="mt-2 text-sm text-slate-500 max-w-md">
                              {medication.instructions}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2">
                        <div className="flex items-center text-sm text-slate-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTime(medication.time)}
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
                            onClick={() => onMarkAsTaken(medication.id)}
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
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimelineView;
