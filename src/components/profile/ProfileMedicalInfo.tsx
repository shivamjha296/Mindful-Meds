import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Shield, Info } from "lucide-react";
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Define schemas for form validation
const medicalInfoSchema = z.object({
  height: z.string().optional(),
  weight: z.string().optional(),
  bloodType: z.string().optional(),
  additionalInfo: z.string().optional(),
});

type MedicalInfoValues = z.infer<typeof medicalInfoSchema>;

export function ProfileMedicalInfo() {
  const { userProfile, updateUserProfile, profileLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Medical info form
  const medicalInfoForm = useForm<MedicalInfoValues>({
    resolver: zodResolver(medicalInfoSchema),
    defaultValues: {
      height: "",
      weight: "",
      bloodType: "",
      additionalInfo: "",
    },
  });
  
  // Load medical info from user profile
  useEffect(() => {
    if (userProfile?.medicalInfo) {
      const medInfo = userProfile.medicalInfo;
      
      medicalInfoForm.reset({
        height: medInfo.height || "",
        weight: medInfo.weight || "",
        bloodType: medInfo.bloodType || "",
        additionalInfo: medInfo.additionalInfo || "",
      });
    }
  }, [userProfile, medicalInfoForm]);
  
  const onMedicalInfoSubmit = async (data: MedicalInfoValues) => {
    try {
      setIsSubmitting(true);
      
      // Create a complete medical info update
      const updateData = {
        medicalInfo: {
          ...(userProfile?.medicalInfo || {}),  // Preserve existing medical info if any
          height: data.height,
          weight: data.weight,
          bloodType: data.bloodType,
          additionalInfo: data.additionalInfo,
        }
      };
      
      await updateUserProfile(updateData);
      
      // If userProfile was null, reload the page to get the new profile
      if (!userProfile) {
        toast.success("Medical information saved. Refreshing page...");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast.success("Medical information updated successfully");
      }
    } catch (error) {
      console.error("Error updating medical info:", error);
      toast.error("Failed to update medical information");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (profileLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card className="shadow-sm border-blue-100">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Medical Information
          </CardTitle>
          <CardDescription>
            Your personal health information and vitals. This information can be shared with healthcare providers.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 p-4 rounded-lg bg-blue-50 text-blue-700 mb-6">
            <Info className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">
              This information is private and will only be shared with healthcare providers you authorize.
            </p>
          </div>
          
          <Form {...medicalInfoForm}>
            <form onSubmit={medicalInfoForm.handleSubmit(onMedicalInfoSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <FormField
                  control={medicalInfoForm.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Height</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="e.g., 5'8&quot;" 
                          className="bg-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={medicalInfoForm.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Weight</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="e.g., 160 lbs" 
                          className="bg-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={medicalInfoForm.control}
                  name="bloodType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Blood Type</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="e.g., O+" 
                          className="bg-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={medicalInfoForm.control}
                name="additionalInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Additional Information</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Any other health information that healthcare providers should know." 
                        className="resize-none bg-white min-h-[120px]"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Include allergies, chronic conditions, or other important health information.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
