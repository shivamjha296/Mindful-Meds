import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CalendarDays, ListTodo, Clock } from "lucide-react";
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

export const ProfileDashboardSettings = () => {
  const { userProfile, updateUserProfile } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [defaultView, setDefaultView] = useState<'grid' | 'timeline' | 'calendar'>(
    userProfile?.dashboardPreferences?.defaultView || 'grid'
  );

  // Handle view preference change
  const handleViewChange = async (value: 'grid' | 'timeline' | 'calendar') => {
    try {
      setIsUpdating(true);
      setDefaultView(value);
      
      if (updateUserProfile) {
        await updateUserProfile({
          dashboardPreferences: {
            defaultView: value
          }
        });
        
        toast.success('Dashboard view preference updated');
      }
    } catch (error) {
      console.error('Error updating dashboard view preference:', error);
      toast.error('Failed to update dashboard view preference');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard Preferences</CardTitle>
        <CardDescription>
          Customize how your medication dashboard appears
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-4">Default View</h3>
            <RadioGroup 
              value={defaultView} 
              onValueChange={(value) => handleViewChange(value as 'grid' | 'timeline' | 'calendar')}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2 border p-4 rounded-md hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="grid" id="grid-view" disabled={isUpdating} />
                <Label htmlFor="grid-view" className="flex items-center cursor-pointer">
                  <ListTodo className="h-5 w-5 mr-2 text-blue-500" />
                  <div>
                    <p className="font-medium">Grid View</p>
                    <p className="text-sm text-muted-foreground">
                      Display medications in a grid layout
                    </p>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 border p-4 rounded-md hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="timeline" id="timeline-view" disabled={isUpdating} />
                <Label htmlFor="timeline-view" className="flex items-center cursor-pointer">
                  <Clock className="h-5 w-5 mr-2 text-purple-500" />
                  <div>
                    <p className="font-medium">Timeline View</p>
                    <p className="text-sm text-muted-foreground">
                      Display medications in a chronological timeline
                    </p>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 border p-4 rounded-md hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="calendar" id="calendar-view" disabled={isUpdating} />
                <Label htmlFor="calendar-view" className="flex items-center cursor-pointer">
                  <CalendarDays className="h-5 w-5 mr-2 text-green-500" />
                  <div>
                    <p className="font-medium">Calendar View</p>
                    <p className="text-sm text-muted-foreground">
                      Display medications in a calendar format
                    </p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileDashboardSettings; 