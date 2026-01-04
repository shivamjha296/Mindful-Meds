import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Plus, 
  Save, 
  Clock, 
  Calendar, 
  ChevronLeft, 
  Pill, 
  AlertCircle, 
  RotateCcw,
  Check,
  Trash2
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
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { Medication } from '@/lib/AuthContext';
import { useAuth } from '@/lib/AuthContext';
import { API_URL } from '@/lib/constants';
import { 
  convertToFirebaseFormat, 
  convertToFrontendFormat, 
  deleteMedication,
  updateMedication,
  addMedication
} from '@/services/medicationService';

// Define the form schema
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Medication name must be at least 2 characters.",
  }),
  dosage: z.string().min(1, {
    message: "Dosage is required.",
  }),
  frequency: z.string({
    required_error: "Frequency is required.",
  }),
  time: z.string({
    required_error: "Time is required.",
  }),
  startDate: z.date({
    required_error: "Start date is required.",
  }),
  endDate: z.date().optional(),
  instructions: z.string().optional(),
  color: z.string().optional(),
  stock: z.number().min(0, {
    message: "Stock must be a positive number.",
  }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const AddMedication = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile, updateUserProfile } = useAuth();
  const queryParams = new URLSearchParams(location.search);
  const editId = queryParams.get('edit');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Medication data for editing
  const [medicationData, setMedicationData] = useState<Medication | null>(null);
  
  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      dosage: '',
      frequency: 'Once daily',
      time: '',
      startDate: new Date(),
      instructions: '',
      color: 'blue',
      stock: 0,
    },
  });
  
  // Fetch medication data if editing
  useEffect(() => {
    if (editId) {
      setIsEditing(true);
      
      const fallbackToSampleData = () => {
        // Create a default medication if API fails
        const defaultMedication: Medication = {
          id: editId || '1',
          name: 'Sample Medication',
          dosage: '100mg',
          frequency: 'Once daily',
          time: '08:00',
          startDate: new Date().toISOString().split('T')[0],
          instructions: 'Take as directed',
          color: 'blue',
          createdAt: new Date(),
          stock: 30
        };
        
        setMedicationData(defaultMedication);
        
        // Set form values
        form.setValue('name', defaultMedication.name);
        form.setValue('dosage', defaultMedication.dosage);
        form.setValue('frequency', defaultMedication.frequency);
        form.setValue('time', defaultMedication.time);
        form.setValue('startDate', new Date(defaultMedication.startDate));
        if (defaultMedication.endDate) {
          form.setValue('endDate', new Date(defaultMedication.endDate));
        }
        if (defaultMedication.instructions) {
          form.setValue('instructions', defaultMedication.instructions);
        }
        if (defaultMedication.color) {
          form.setValue('color', defaultMedication.color);
        }
        if (defaultMedication.stock !== undefined) {
          form.setValue('stock', defaultMedication.stock);
        }
      };
      
      const fetchMedicationData = async () => {
        try {
          setIsLoading(true);
          
          // Fetch dashboard data from the backend
          const response = await fetch(API_URL);
          
          if (!response.ok) {
            throw new Error('Failed to fetch dashboard data');
          }
          
          const data = await response.json();
          
          if (data.medications && Array.isArray(data.medications)) {
            // Find the medication by index
            const index = parseInt(editId);
            const medication = data.medications[index];
            
            if (medication) {
              // Format the medication data for the form
              const formattedMedication: Partial<Medication> = {
                id: editId,
                name: medication.name,
                dosage: medication.dosage,
                frequency: medication.frequency,
                time: medication.timeOfDay || '08:00',
                startDate: medication.startDate ? new Date(medication.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                endDate: medication.endDate ? new Date(medication.endDate).toISOString().split('T')[0] : undefined,
                instructions: medication.notes || '',
                color: ['blue', 'green', 'purple', 'red', 'yellow'][index % 5],
                stock: medication.stock || 0,
                createdAt: new Date(),
              };
              
              setMedicationData(formattedMedication as Medication);
              
              // Set form values
              form.setValue('name', formattedMedication.name as string);
              form.setValue('dosage', formattedMedication.dosage as string);
              form.setValue('frequency', formattedMedication.frequency as string);
              form.setValue('time', formattedMedication.time as string);
              form.setValue('startDate', new Date(formattedMedication.startDate as string));
              if (formattedMedication.endDate) {
                form.setValue('endDate', new Date(formattedMedication.endDate as string));
              }
              if (formattedMedication.instructions) {
                form.setValue('instructions', formattedMedication.instructions as string);
              }
              if (formattedMedication.color) {
                form.setValue('color', formattedMedication.color as string);
              }
              if (formattedMedication.stock !== undefined) {
                form.setValue('stock', formattedMedication.stock as number);
              }
              
              return;
            }
          }
          
          // If we couldn't find the medication in the backend, fall back to sample data
          fallbackToSampleData();
          
        } catch (error) {
          console.error('Error fetching medication data:', error);
          fallbackToSampleData();
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchMedicationData();
    }
  }, [editId, form]);
  
  // Form submission
  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);
      
      // Create a medication object for Firebase using the service
      const firebaseMedication = convertToFirebaseFormat({
        id: isEditing && editId ? editId : Date.now().toString(),
        name: values.name,
        dosage: values.dosage,
        frequency: values.frequency,
        time: values.time,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate ? values.endDate.toISOString() : undefined,
        instructions: values.instructions || '',
        color: values.color || '#4F46E5',
        taken: false,
        stock: values.stock || 0,
        createdAt: new Date(),
      });
      
      let success = false;
      
      if (isEditing && editId) {
        // Update existing medication using the service
        success = await updateMedication(editId, {
          name: values.name,
          dosage: values.dosage,
          frequency: values.frequency,
          timeOfDay: values.time,
          startDate: values.startDate,
          endDate: values.endDate,
          notes: values.instructions,
          stock: values.stock || 0
        });
        
        if (!success) {
          throw new Error('Failed to update medication');
        }
        
        // Update the medication in the user profile
        if (userProfile && updateUserProfile) {
          // Get current medications
          const currentMedications = userProfile.medications || [];
          
          // Update the medication in the array
          const updatedMedications = currentMedications.map(med => 
            med.id === editId ? firebaseMedication : med
          );
          
          // Update the user profile
          await updateUserProfile({
            medications: updatedMedications
          });
          
          console.log("Updated medications in Firebase:", updatedMedications);
        }
        
        toast({
          title: "Success",
          description: "Medication updated successfully",
        });
      } else {
        // Add new medication using the service
        console.log('Calling addMedication with:', {
          name: values.name,
          dosage: values.dosage,
          frequency: values.frequency,
          timeOfDay: values.time,
          startDate: values.startDate,
          endDate: values.endDate,
          notes: values.instructions,
          stock: values.stock || 0
        });
        
        try {
          success = await addMedication({
            name: values.name,
            dosage: values.dosage,
            frequency: values.frequency,
            timeOfDay: values.time,
            startDate: values.startDate,
            endDate: values.endDate,
            notes: values.instructions,
            stock: values.stock || 0
          });
          
          if (!success) {
            throw new Error('Failed to add medication - service returned false');
          }
          
          console.log('Medication added successfully via service');
        } catch (serviceError) {
          console.error('Error from addMedication service:', serviceError);
          throw serviceError;
        }
        
        // Add the medication to the user profile
        if (userProfile && updateUserProfile) {
          // Get current medications
          const currentMedications = userProfile.medications || [];
          
          // Add the new medication to the array
          const updatedMedications = [...currentMedications, firebaseMedication];
          
          // Update the user profile
          await updateUserProfile({
            medications: updatedMedications
          });
          
          console.log("Added new medication to Firebase:", firebaseMedication);
          console.log("Updated medications in Firebase:", updatedMedications);
        } else {
          console.warn('User profile or updateUserProfile not available');
        }
        
        toast({
          title: "Success",
          description: "Medication added successfully",
        });
      }
      
      // Navigate back to the dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving medication:', error);
      toast({
        title: "Error",
        description: "Failed to save medication. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reset form
  const handleReset = () => {
    form.reset();
    toast({
      title: "Form reset",
      description: "All fields have been cleared.",
    });
  };
  
  // Handle delete medication
  const handleDeleteMedication = async () => {
    if (!editId) return;
    
    try {
      if (!window.confirm("Are you sure you want to delete this medication? This action cannot be undone.")) {
        return;
      }
      
      setIsLoading(true);
      
      // Call the delete function from the service
      const success = await deleteMedication(editId);
      
      if (!success) {
        throw new Error('Failed to delete medication from backend');
      }
      
      // Update the medication in the user profile
      if (userProfile && updateUserProfile) {
        // Get current medications
        const currentMedications = userProfile.medications || [];
        
        // Filter out the deleted medication
        const updatedMedications = currentMedications.filter(med => med.id !== editId);
        
        // Update the user profile
        await updateUserProfile({
          medications: updatedMedications
        });
      }
      
      toast({
        title: "Success",
        description: "Medication deleted successfully",
      });
      
      // Navigate back to the dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting medication:', error);
      toast({
        title: "Error",
        description: "Failed to delete medication. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      
      <main className="flex-grow pt-20 pb-16">
        <div className="container max-w-3xl mx-auto px-4">
          <div className="flex justify-start w-full mb-4">
            <Button 
              variant="ghost" 
              className="pl-0" 
              onClick={() => navigate('/dashboard')}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          
          <div className="bg-white shadow-sm rounded-xl p-6 border">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                <Pill className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">
                {isEditing ? 'Edit Medication' : 'Add New Medication'}
              </h1>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {/* Essential Information Section */}
                <div className="space-y-4 pb-5 border-b">
                  <h2 className="text-lg font-medium text-slate-900">Essential Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medication Name*</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter medication name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="dosage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dosage*</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 500mg, 10ml" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                {/* Schedule Section */}
                <div className="space-y-4 pb-5 border-b">
                  <h2 className="text-lg font-medium text-slate-900">Schedule</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frequency*</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Once daily">Once daily</SelectItem>
                              <SelectItem value="Twice daily">Twice daily</SelectItem>
                              <SelectItem value="Three times daily">Three times daily</SelectItem>
                              <SelectItem value="Every other day">Every other day</SelectItem>
                              <SelectItem value="Weekly">Weekly</SelectItem>
                              <SelectItem value="As needed">As needed</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time*</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input 
                                type="time" 
                                {...field} 
                              />
                            </FormControl>
                            <Clock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Start Date*</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className="w-full pl-3 text-left font-normal"
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <CalendarComponent
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>End Date (Optional)</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className="w-full pl-3 text-left font-normal"
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Leave blank for ongoing</span>
                                  )}
                                  <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <CalendarComponent
                                mode="single"
                                selected={field.value as Date}
                                onSelect={field.onChange}
                                initialFocus
                                disabled={(date) => date < form.getValues('startDate')}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                {/* Additional Details Section */}
                <div className="space-y-4 pb-5 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-slate-900">Additional Details</h2>
                    <p className="text-sm text-slate-500">Optional</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="stock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Stock (Pills/Units)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="e.g., 30" 
                              {...field}
                              onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                              min={0}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color Tag</FormLabel>
                          <div className="grid grid-cols-5 gap-3 mt-2">
                            {[
                              { color: 'blue', hex: '#3b82f6' },
                              { color: 'green', hex: '#10b981' },
                              { color: 'red', hex: '#ef4444' },
                              { color: 'yellow', hex: '#f59e0b' },
                              { color: 'purple', hex: '#8b5cf6' }
                            ].map((item) => (
                              <div 
                                key={item.color} 
                                className={`
                                  w-8 h-8 rounded-full cursor-pointer transition-all
                                  ${field.value === item.color ? 'ring-2 ring-primary ring-offset-2' : 'hover:ring-1 hover:ring-slate-300'}
                                `}
                                style={{ backgroundColor: item.hex }}
                                onClick={() => form.setValue('color', item.color)}
                              >
                                {field.value === item.color && (
                                  <div className="flex items-center justify-center h-full">
                                    <Check className="h-4 w-4 text-white" />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          <FormDescription className="text-xs mt-2">
                            Color for identifying this medication in your dashboard.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="instructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Instructions</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., Take with food, Take before bedtime..."
                            {...field}
                            rows={2}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex justify-between items-center pt-2">
                  <div className="flex space-x-2">
                    {isEditing && (
                      <Button 
                        type="button" 
                        variant="destructive"
                        onClick={handleDeleteMedication}
                        disabled={isLoading}
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    )}
                  </div>
                  <div className="flex space-x-3">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => navigate('/dashboard')}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
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
                          {isEditing ? 'Updating...' : 'Saving...'}
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          {isEditing ? 'Update' : 'Save'} Medication
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </div>
          
          <div className="mt-4 p-3 border border-amber-200 bg-amber-50 rounded-lg flex items-start">
            <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-xs text-amber-700">
              Always consult with your healthcare provider before making changes to your medication routine.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AddMedication;
