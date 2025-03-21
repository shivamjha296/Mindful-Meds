import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useAuth } from '@/lib/AuthContext';

export function MedicalInfoProfile() {
  const { profileLoading } = useAuth();
  
  if (profileLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Medical Information</CardTitle>
          <CardDescription>Your personal health information and vitals.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Medical information will be displayed here.</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Medical Conditions</CardTitle>
          <CardDescription>Your medical history and ongoing conditions.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Medical conditions will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
} 