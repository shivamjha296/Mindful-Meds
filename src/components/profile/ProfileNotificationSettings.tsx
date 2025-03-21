import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "@/components/ui/label";
import { Bell, AlertCircle, Clock, Calendar, Smartphone, Mail, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ProfileNotificationSettings = () => {
  return (
    <>
      <Card className="shadow-sm border-blue-100">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Manage how and when you receive notifications about your medications.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-8">
          <div className="space-y-5">
            <h3 className="text-sm font-medium text-slate-900 flex items-center gap-2">
              <Bell className="h-4 w-4 text-blue-600" />
              Notification Types
            </h3>
            
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">Medication Reminders</h4>
                    <p className="text-sm text-slate-600">
                      Receive reminders when it's time to take your medication.
                    </p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">Missed Dose Alerts</h4>
                    <p className="text-sm text-slate-600">
                      Get notified if you've missed taking a scheduled medication.
                    </p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">Refill Reminders</h4>
                    <p className="text-sm text-slate-600">
                      Receive alerts when your medications are running low.
                    </p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">Appointment Reminders</h4>
                    <p className="text-sm text-slate-600">
                      Get notifications about upcoming doctor appointments.
                    </p>
                  </div>
                </div>
                <Switch />
              </div>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div className="space-y-5">
            <h3 className="text-sm font-medium text-slate-900 flex items-center gap-2">
              <Settings className="h-4 w-4 text-blue-600" />
              Delivery Methods
            </h3>
            
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Smartphone className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">Push Notifications</h4>
                    <p className="text-sm text-slate-600">
                      Receive notifications on your device.
                    </p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">Email Notifications</h4>
                    <p className="text-sm text-slate-600">
                      Receive notifications via email.
                    </p>
                  </div>
                </div>
                <Switch />
              </div>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div className="space-y-5">
            <h3 className="text-sm font-medium text-slate-900 flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              Reminder Timing
            </h3>
            
            <div className="p-4 rounded-lg bg-slate-50">
              <RadioGroup defaultValue="15" className="space-y-3">
                <div className="flex items-center space-x-3 p-2 rounded hover:bg-slate-100">
                  <RadioGroupItem value="5" id="r1" />
                  <Label htmlFor="r1" className="font-medium text-slate-900">5 minutes before</Label>
                </div>
                <div className="flex items-center space-x-3 p-2 rounded hover:bg-slate-100">
                  <RadioGroupItem value="15" id="r2" />
                  <Label htmlFor="r2" className="font-medium text-slate-900">15 minutes before</Label>
                </div>
                <div className="flex items-center space-x-3 p-2 rounded hover:bg-slate-100">
                  <RadioGroupItem value="30" id="r3" />
                  <Label htmlFor="r3" className="font-medium text-slate-900">30 minutes before</Label>
                </div>
                <div className="flex items-center space-x-3 p-2 rounded hover:bg-slate-100">
                  <RadioGroupItem value="60" id="r4" />
                  <Label htmlFor="r4" className="font-medium text-slate-900">1 hour before</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Save Preferences
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
