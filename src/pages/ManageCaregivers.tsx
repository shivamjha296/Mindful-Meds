import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  UserPlus, 
  Save, 
  ChevronLeft, 
  Trash2, 
  Mail, 
  Phone, 
  User, 
  Heart
} from 'lucide-react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/AuthContext";
import { notificationService, Caregiver } from "@/lib/NotificationService";
import { db, doc, getDoc, updateDoc, Timestamp } from "@/lib/firebase";

// Define the form schema
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().optional(),
  relationship: z.string({
    required_error: "Relationship is required.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const ManageCaregivers = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      relationship: '',
    },
  });

  // Fetch caregivers on component mount
  useEffect(() => {
    const fetchCaregivers = async () => {
      if (!currentUser) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to manage caregivers.",
          variant: "destructive"
        });
        navigate('/auth');
        return;
      }

      try {
        setIsLoading(true);
        const fetchedCaregivers = await notificationService.getCaregivers(currentUser.uid);
        setCaregivers(fetchedCaregivers);
      } catch (error) {
        console.error('Error fetching caregivers:', error);
        toast({
          title: "Error",
          description: "Failed to load caregivers. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCaregivers();
  }, [currentUser, navigate, toast]);

  // Form submission
  const onSubmit = async (values: FormValues) => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to add caregivers.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Add caregiver
      const caregiverId = await notificationService.addCaregiver(currentUser.uid, values);
      
      // Add to local state
      setCaregivers([...caregivers, { ...values, id: caregiverId }]);
      
      // Reset form
      form.reset();
      
      // Show success message
      toast({
        title: "Caregiver added",
        description: `${values.name} has been added as a caregiver.`,
      });
    } catch (error) {
      console.error('Error adding caregiver:', error);
      toast({
        title: "Error",
        description: "Failed to add caregiver. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete caregiver
  const handleDeleteCaregiver = async (caregiverId: string) => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to delete caregivers.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsDeleting(caregiverId);
      
      // Get current user data
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }
      
      const userData = userDoc.data();
      const updatedCaregivers = (userData.caregivers || []).filter(
        (caregiver: Caregiver) => caregiver.id !== caregiverId
      );
      
      // Update user document
      await updateDoc(userRef, {
        caregivers: updatedCaregivers,
        updatedAt: Timestamp.now()
      });
      
      // Update local state
      setCaregivers(caregivers.filter(caregiver => caregiver.id !== caregiverId));
      
      // Show success message
      toast({
        title: "Caregiver removed",
        description: "The caregiver has been removed successfully.",
      });
    } catch (error) {
      console.error('Error deleting caregiver:', error);
      toast({
        title: "Error",
        description: "Failed to remove caregiver. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(null);
    }
  };

  // Relationship options
  const relationshipOptions = [
    { value: 'spouse', label: 'Spouse' },
    { value: 'parent', label: 'Parent' },
    { value: 'child', label: 'Child' },
    { value: 'sibling', label: 'Sibling' },
    { value: 'friend', label: 'Friend' },
    { value: 'caretaker', label: 'Caretaker' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container max-w-7xl mx-auto px-4">
          <Button 
            variant="ghost" 
            className="mb-6" 
            onClick={() => navigate('/dashboard')}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <UserPlus className="h-5 w-5 mr-2 text-primary" />
                    Add Caregiver
                  </CardTitle>
                  <CardDescription>
                    Add someone who should be notified if you miss taking your medication
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter caregiver's name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter email address" type="email" {...field} />
                            </FormControl>
                            <FormDescription>
                              They will receive email notifications
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter phone number" type="tel" {...field} />
                            </FormControl>
                            <FormDescription>
                              For SMS notifications (if enabled)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="relationship"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Relationship</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select relationship" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {relationshipOptions.map(option => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <span className="animate-spin mr-2">
                              <svg className="h-4 w-4" viewBox="0 0 24 24">
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                  fill="none"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                              </svg>
                            </span>
                            Adding...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Add Caregiver
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-7">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="h-5 w-5 mr-2 text-primary" />
                    Your Caregivers
                  </CardTitle>
                  <CardDescription>
                    People who will be notified if you miss taking your medication
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                    </div>
                  ) : caregivers.length === 0 ? (
                    <div className="text-center py-8 border border-dashed rounded-lg">
                      <User className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                      <h3 className="mt-4 text-lg font-medium">No caregivers added yet</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Add caregivers who should be notified if you miss taking your medication
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {caregivers.map((caregiver) => (
                        <div 
                          key={caregiver.id} 
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-medium">{caregiver.name}</h3>
                              <p className="text-sm text-muted-foreground capitalize">
                                {caregiver.relationship}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="flex flex-col items-end">
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Mail className="h-3.5 w-3.5 mr-1" />
                                {caregiver.email}
                              </div>
                              {caregiver.phone && (
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Phone className="h-3.5 w-3.5 mr-1" />
                                  {caregiver.phone}
                                </div>
                              )}
                            </div>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  disabled={isDeleting === caregiver.id}
                                >
                                  {isDeleting === caregiver.id ? (
                                    <div className="animate-spin h-4 w-4 border-2 border-destructive border-t-transparent rounded-full"></div>
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove Caregiver</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to remove {caregiver.name} as a caregiver? 
                                    They will no longer receive notifications if you miss taking your medication.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    className="bg-destructive hover:bg-destructive/90"
                                    onClick={() => handleDeleteCaregiver(caregiver.id!)}
                                  >
                                    Remove
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ManageCaregivers; 