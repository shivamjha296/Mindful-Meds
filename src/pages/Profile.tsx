import React, { useState, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Edit, Save, User, Lock, Bell, Shield, Loader2, UserCheck, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ProfileMedicationHistory } from '@/components/profile/ProfileMedicationHistory';
import { ProfileNotificationSettings } from '@/components/profile/ProfileNotificationSettings';
import { ProfileMedicalInfo } from '@/components/profile/ProfileMedicalInfo';
import { ProfileDearOnes } from '@/components/profile/ProfileDearOnes';
import { TestForm } from '@/components/profile/TestForm';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Profile form schema
const profileFormSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }).or(z.string().optional()),
  phone: z.string().optional(),
  bio: z.string().max(160).optional(),
  avatar: z.string().optional()
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const securityFormSchema = z.object({
  currentPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
  newPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SecurityFormValues = z.infer<typeof securityFormSchema>;

const Profile = () => {
  const { userProfile, updateUserProfile, updateUserPassword, profileLoading, currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      bio: "",
      avatar: ""
    },
    mode: "onChange",
  });

  // Security form
  const securityForm = useForm<SecurityFormValues>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    },
    mode: "onChange",
  });

  // Update form values when user profile is loaded
  useEffect(() => {
    if (userProfile) {
      profileForm.reset({
        fullName: userProfile.fullName || "",
        email: userProfile.email || "",
        phone: userProfile.phone || "",
        bio: userProfile.bio || "",
        avatar: userProfile.avatar || ""
      });
    } else if (currentUser?.email) {
      // If userProfile is null but we have currentUser, at least set the email
      profileForm.setValue("email", currentUser.email);
    }
  }, [userProfile, profileForm, currentUser]);

  const onProfileSubmit = async (data: ProfileFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Create a complete profile update object
      const profileData = {
        fullName: data.fullName,
        email: data.email || currentUser?.email || "", // Include email from currentUser if available
        phone: data.phone,
        bio: data.bio,
        avatar: data.avatar
      };
      
      await updateUserProfile(profileData);
      setIsEditing(false);
      toast.success("Profile updated successfully");
      
      // Refresh the page to ensure we get the latest profile data
      if (!userProfile) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const onSecuritySubmit = async (data: SecurityFormValues) => {
    try {
      setIsSubmitting(true);
      await updateUserPassword(data.currentPassword, data.newPassword);
      securityForm.reset();
      toast.success("Password updated successfully");
    } catch (error) {
      console.error("Password update error:", error);
      toast.error("Failed to update password. Please check your current password and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="container max-w-6xl py-24 px-4 md:px-6 flex items-center justify-center flex-grow">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container max-w-6xl py-24 px-4 md:px-6 flex-grow">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal information, security settings, and notification preferences.
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="w-full grid grid-cols-2 md:grid-cols-5 md:w-auto bg-blue-50 p-1 rounded-xl">
            <TabsTrigger value="personal" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 rounded-lg">
              <User className="h-4 w-4" />
              <span className="hidden md:inline">Personal Info</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 rounded-lg">
              <Lock className="h-4 w-4" />
              <span className="hidden md:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 rounded-lg">
              <Bell className="h-4 w-4" />
              <span className="hidden md:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="medical" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 rounded-lg">
              <Shield className="h-4 w-4" />
              <span className="hidden md:inline">Medical Info</span>
            </TabsTrigger>
            <TabsTrigger value="dearones" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-700 rounded-lg">
              <UserCheck className="h-4 w-4" />
              <span className="hidden md:inline">Dear Ones</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Personal Information Tab */}
          <TabsContent value="personal" className="space-y-6 animate-in fade-in-50 duration-300">
            <Card className="shadow-sm border-blue-100">
              <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Update your personal details and profile information.
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setIsEditing(!isEditing)}
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  {isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                </Button>
              </CardHeader>
              <CardContent className="pt-6">
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={profileForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Full Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your name" 
                                {...field} 
                                disabled={!isEditing}
                                className={!isEditing ? "bg-slate-50" : ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Email</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder={currentUser?.email || "name@example.com"} 
                                {...field} 
                                value={field.value || currentUser?.email || ""}
                                disabled={true} // Email cannot be changed
                                className="bg-slate-50"
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              Email cannot be changed.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Phone Number</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your phone number" 
                                {...field} 
                                disabled={!isEditing}
                                className={!isEditing ? "bg-slate-50" : ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={profileForm.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Bio</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell us about yourself" 
                              className={`resize-none ${!isEditing ? "bg-slate-50" : ""}`}
                              {...field} 
                              disabled={!isEditing}
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Brief description for your profile. Maximum 160 characters.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {isEditing && (
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
                    )}
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            <ProfileMedicationHistory />
          </TabsContent>
          
          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6 animate-in fade-in-50 duration-300">
            <Card className="shadow-sm border-blue-100">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-blue-600" />
                  Password
                </CardTitle>
                <CardDescription>
                  Update your password to keep your account secure.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Form {...securityForm}>
                  <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-6">
                    <FormField
                      control={securityForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Current Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Enter current password" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={securityForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">New Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Enter new password" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              Password must be at least 8 characters.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={securityForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium">Confirm New Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Confirm new password" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          "Update Password"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-blue-100">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Two-Factor Authentication
                </CardTitle>
                <CardDescription>
                  Add an extra layer of security to your account.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
                  <div>
                    <h4 className="font-medium text-slate-900">Text Message Authentication</h4>
                    <p className="text-sm text-slate-600">
                      Receive a code via SMS to verify your identity.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Coming soon</span>
                    <Switch disabled />
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
                  <div>
                    <h4 className="font-medium text-slate-900">Authenticator App</h4>
                    <p className="text-sm text-slate-600">
                      Use an authenticator app to generate verification codes.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Coming soon</span>
                    <Switch disabled />
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-4 rounded-lg bg-blue-50 text-blue-700 mt-4">
                  <Info className="h-5 w-5 flex-shrink-0" />
                  <p className="text-sm">
                    Two-factor authentication adds an extra layer of security to your account. When enabled, you'll be required to provide a verification code in addition to your password when signing in.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Notifications Tab */}
          <TabsContent value="notifications" className="animate-in fade-in-50 duration-300">
            <ProfileNotificationSettings />
          </TabsContent>
          
          {/* Medical Info Tab */}
          <TabsContent value="medical" className="animate-in fade-in-50 duration-300">
            <ProfileMedicalInfo />
          </TabsContent>
          
          {/* Dear Ones Tab */}
          <TabsContent value="dearones" className="animate-in fade-in-50 duration-300">
            <ProfileDearOnes />
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
};

export default Profile;
