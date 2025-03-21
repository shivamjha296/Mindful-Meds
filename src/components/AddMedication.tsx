import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { Medication } from '@/lib/AuthContext';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from 'date-fns';
import { CalendarIcon, Clock } from 'lucide-react';

// Define the form schema
const medicationFormSchema = z.object({
  name: z.string().min(2, { message: "Medication name is required" }),
  dosage: z.string().min(1, { message: "Dosage is required" }),
  frequency: z.string().min(1, { message: "Frequency is required" }),
  time: z.string().min(1, { message: "Time is required" }),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date().optional(),
  instructions: z.string().optional(),
  color: z.string().default('#3b82f6'),
  stock: z.number().min(0, { message: "Stock cannot be negative" }).default(0),
});

type MedicationFormValues = z.infer<typeof medicationFormSchema>;

interface AddMedicationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (medication: Medication) => void;
  editMedication?: Medication;
}

const AddMedication: React.FC<AddMedicationProps> = ({
  open,
  onOpenChange,
  onSubmit,
  editMedication
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form with default values or edit values
  const form = useForm<MedicationFormValues>({
    resolver: zodResolver(medicationFormSchema),
    defaultValues: {
      name: '',
      dosage: '',
      frequency: 'daily',
      time: '08:00',
      startDate: new Date(),
      instructions: '',
      color: '#3b82f6',
      stock: 0,
    },
  });
  
  // Update form values when editing a medication
  useEffect(() => {
    if (editMedication) {
      form.reset({
        name: editMedication.name,
        dosage: editMedication.dosage,
        frequency: editMedication.frequency,
        time: editMedication.time,
        startDate: editMedication.startDate ? new Date(editMedication.startDate) : new Date(),
        endDate: editMedication.endDate ? new Date(editMedication.endDate) : undefined,
        instructions: editMedication.instructions || '',
        color: editMedication.color || '#3b82f6',
        stock: editMedication.stock || 0,
      });
    } else {
      form.reset({
        name: '',
        dosage: '',
        frequency: 'daily',
        time: '08:00',
        startDate: new Date(),
        instructions: '',
        color: '#3b82f6',
        stock: 0,
      });
    }
  }, [editMedication, form]);
  
  const handleSubmit = async (values: MedicationFormValues) => {
    setIsSubmitting(true);
    try {
      const medicationData: Medication = {
        id: editMedication?.id || uuidv4(),
        name: values.name,
        dosage: values.dosage,
        frequency: values.frequency,
        time: values.time,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate ? values.endDate.toISOString() : undefined,
        instructions: values.instructions,
        color: values.color,
        taken: editMedication?.taken || false,
        stock: values.stock,
        createdAt: editMedication?.createdAt || new Date(),
      };
      
      console.log("Submitting medication data:", medicationData);
      onSubmit(medicationData);
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting medication:', error);
      toast.error('Failed to save medication. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Color options
  const colorOptions = [
    { value: '#3b82f6', label: 'Blue' },
    { value: '#ef4444', label: 'Red' },
    { value: '#10b981', label: 'Green' },
    { value: '#f59e0b', label: 'Yellow' },
    { value: '#8b5cf6', label: 'Purple' },
    { value: '#ec4899', label: 'Pink' },
    { value: '#6b7280', label: 'Gray' },
  ];
  
  // Frequency options
  const frequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'twice-daily', label: 'Twice Daily' },
    { value: 'every-other-day', label: 'Every Other Day' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'as-needed', label: 'As Needed' },
  ];
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editMedication ? 'Edit Medication' : 'Add New Medication'}</DialogTitle>
          <DialogDescription>
            {editMedication 
              ? 'Update the details of your medication.' 
              : 'Enter the details of your medication to add it to your profile.'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medication Name</FormLabel>
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
                  <FormLabel>Dosage</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 10mg, 1 tablet" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock (Number of Pills)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0" 
                      placeholder="e.g., 30" 
                      {...field} 
                      onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {frequencyOptions.map(option => (
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
              
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        <Input type="time" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="pl-3 text-left font-normal"
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
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
                            variant="outline"
                            className="pl-3 text-left font-normal"
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
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
            </div>
            
            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instructions (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Special instructions for taking this medication" 
                      className="resize-none" 
                      {...field} 
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
                  <FormLabel>Color</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <div className="flex items-center">
                          <div 
                            className="w-4 h-4 rounded-full mr-2" 
                            style={{ backgroundColor: field.value }}
                          ></div>
                          <SelectValue placeholder="Select color" />
                        </div>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {colorOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center">
                            <div 
                              className="w-4 h-4 rounded-full mr-2" 
                              style={{ backgroundColor: option.value }}
                            ></div>
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : editMedication ? 'Update' : 'Add'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMedication; 