import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/lib/AuthContext';
import { DearOne } from '@/lib/AuthContext';
import { toast } from 'sonner';
import { UserPlus, Edit, Trash2, Mail, Phone, UserCheck, Shield, Bell, Info } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export const ProfileDearOnes = () => {
  const { userProfile, addDearOne, updateDearOne, removeDearOne } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDearOne, setSelectedDearOne] = useState<DearOne | null>(null);
  
  // Form state for adding a new dear one
  const [newDearOne, setNewDearOne] = useState({
    name: '',
    email: '',
    phone: '',
    relationship: '',
    notificationPreferences: {
      missedDose: true,
      lowStock: true,
      prescriptionUpdates: true,
      criticalAlerts: true
    },
    accessPermissions: {
      viewMedications: true,
      viewAdherence: true,
      viewCalendar: true,
      markAsTaken: false
    }
  });
  
  // Handle input change for new dear one
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewDearOne(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle relationship select change
  const handleRelationshipChange = (value: string) => {
    setNewDearOne(prev => ({
      ...prev,
      relationship: value
    }));
  };
  
  // Handle notification preference change
  const handleNotificationPrefChange = (key: keyof DearOne['notificationPreferences'], value: boolean) => {
    setNewDearOne(prev => ({
      ...prev,
      notificationPreferences: {
        ...prev.notificationPreferences,
        [key]: value
      }
    }));
  };
  
  // Handle access permission change
  const handleAccessPermChange = (key: keyof DearOne['accessPermissions'], value: boolean) => {
    setNewDearOne(prev => ({
      ...prev,
      accessPermissions: {
        ...prev.accessPermissions,
        [key]: value
      }
    }));
  };
  
  // Handle add dear one
  const handleAddDearOne = async () => {
    if (!newDearOne.name || !newDearOne.email || !newDearOne.relationship) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      await addDearOne({
        name: newDearOne.name,
        email: newDearOne.email,
        phone: newDearOne.phone,
        relationship: newDearOne.relationship,
        notificationPreferences: newDearOne.notificationPreferences,
        accessPermissions: newDearOne.accessPermissions
      });
      
      toast.success(`${newDearOne.name} has been added successfully`);
      
      // Reset form and close dialog
      setNewDearOne({
        name: '',
        email: '',
        phone: '',
        relationship: '',
        notificationPreferences: {
          missedDose: true,
          lowStock: true,
          prescriptionUpdates: true,
          criticalAlerts: true
        },
        accessPermissions: {
          viewMedications: true,
          viewAdherence: true,
          viewCalendar: true,
          markAsTaken: false
        }
      });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error adding dear one:', error);
      toast.error('Failed to add contact. Please try again.');
    }
  };
  
  // Handle edit dear one
  const handleEditDearOne = (dearOne: DearOne) => {
    setSelectedDearOne(dearOne);
    setIsEditDialogOpen(true);
  };
  
  // Handle update dear one
  const handleUpdateDearOne = async () => {
    if (!selectedDearOne) return;
    
    try {
      await updateDearOne(selectedDearOne.id, selectedDearOne);
      toast.success(`${selectedDearOne.name}'s information has been updated`);
      setIsEditDialogOpen(false);
      setSelectedDearOne(null);
    } catch (error) {
      console.error('Error updating dear one:', error);
      toast.error('Failed to update contact. Please try again.');
    }
  };
  
  // Handle delete dear one
  const handleDeleteDearOne = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name} from your contacts?`)) {
      try {
        await removeDearOne(id);
        toast.success(`${name} has been removed from your contacts`);
      } catch (error) {
        console.error('Error removing dear one:', error);
        toast.error('Failed to remove contact. Please try again.');
      }
    }
  };
  
  // Get relationship display name
  const getRelationshipDisplay = (relationship: string) => {
    const relationshipMap: Record<string, string> = {
      'spouse': 'Spouse',
      'parent': 'Parent',
      'child': 'Child',
      'sibling': 'Sibling',
      'friend': 'Friend',
      'caregiver': 'Caregiver',
      'doctor': 'Doctor',
      'other': 'Other'
    };
    
    return relationshipMap[relationship] || relationship;
  };
  
  return (
    <>
      <Card className="shadow-sm border-blue-100">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-blue-600" />
                Dear Ones
              </CardTitle>
              <CardDescription>
                Manage family members and caregivers who can receive notifications and access your medication details.
              </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 whitespace-nowrap">
                  <UserPlus className="h-4 w-4" />
                  <span>Add Person</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add a Dear One</DialogTitle>
                  <DialogDescription>
                    Add a family member or caregiver who can receive notifications about your medications.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={newDearOne.name}
                      onChange={handleInputChange}
                      className="col-span-3"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={newDearOne.email}
                      onChange={handleInputChange}
                      className="col-span-3"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="text-right">
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={newDearOne.phone}
                      onChange={handleInputChange}
                      className="col-span-3"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="relationship" className="text-right">
                      Relationship
                    </Label>
                    <Select 
                      onValueChange={handleRelationshipChange}
                      value={newDearOne.relationship}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="spouse">Spouse</SelectItem>
                        <SelectItem value="parent">Parent</SelectItem>
                        <SelectItem value="child">Child</SelectItem>
                        <SelectItem value="sibling">Sibling</SelectItem>
                        <SelectItem value="friend">Friend</SelectItem>
                        <SelectItem value="caregiver">Caregiver</SelectItem>
                        <SelectItem value="doctor">Doctor</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Separator className="my-2" />
                  
                  <Tabs defaultValue="notifications" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="notifications">Notifications</TabsTrigger>
                      <TabsTrigger value="permissions">Permissions</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="notifications" className="space-y-4 mt-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="missedDose" className="flex-1">Missed Dose Alerts</Label>
                        <Switch 
                          id="missedDose" 
                          checked={newDearOne.notificationPreferences.missedDose}
                          onCheckedChange={(checked) => handleNotificationPrefChange('missedDose', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="lowStock" className="flex-1">Low Stock Alerts</Label>
                        <Switch 
                          id="lowStock" 
                          checked={newDearOne.notificationPreferences.lowStock}
                          onCheckedChange={(checked) => handleNotificationPrefChange('lowStock', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="prescriptionUpdates" className="flex-1">Prescription Updates</Label>
                        <Switch 
                          id="prescriptionUpdates" 
                          checked={newDearOne.notificationPreferences.prescriptionUpdates}
                          onCheckedChange={(checked) => handleNotificationPrefChange('prescriptionUpdates', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="criticalAlerts" className="flex-1">Critical Alerts</Label>
                        <Switch 
                          id="criticalAlerts" 
                          checked={newDearOne.notificationPreferences.criticalAlerts}
                          onCheckedChange={(checked) => handleNotificationPrefChange('criticalAlerts', checked)}
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="permissions" className="space-y-4 mt-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="viewMedications" className="flex-1">View Medications</Label>
                        <Switch 
                          id="viewMedications" 
                          checked={newDearOne.accessPermissions.viewMedications}
                          onCheckedChange={(checked) => handleAccessPermChange('viewMedications', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="viewAdherence" className="flex-1">View Adherence</Label>
                        <Switch 
                          id="viewAdherence" 
                          checked={newDearOne.accessPermissions.viewAdherence}
                          onCheckedChange={(checked) => handleAccessPermChange('viewAdherence', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="viewCalendar" className="flex-1">View Calendar</Label>
                        <Switch 
                          id="viewCalendar" 
                          checked={newDearOne.accessPermissions.viewCalendar}
                          onCheckedChange={(checked) => handleAccessPermChange('viewCalendar', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="markAsTaken" className="flex-1">Mark Medications as Taken</Label>
                        <Switch 
                          id="markAsTaken" 
                          checked={newDearOne.accessPermissions.markAsTaken}
                          onCheckedChange={(checked) => handleAccessPermChange('markAsTaken', checked)}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddDearOne}>Add Person</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {userProfile?.dearOnes && userProfile.dearOnes.length > 0 ? (
            <div className="space-y-6">
              <div className="flex items-center gap-2 p-4 rounded-lg bg-blue-50 text-blue-700 mb-4">
                <Info className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm">
                  These people will receive notifications based on your settings and can access your medication information.
                </p>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Relationship</TableHead>
                      <TableHead className="hidden md:table-cell">Contact</TableHead>
                      <TableHead className="hidden md:table-cell">Permissions</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userProfile.dearOnes.map((dearOne) => (
                      <TableRow key={dearOne.id}>
                        <TableCell className="font-medium">{dearOne.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {getRelationshipDisplay(dearOne.relationship)}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex flex-col space-y-1">
                            <span className="text-sm flex items-center">
                              <Mail className="h-3 w-3 mr-2 text-muted-foreground" />
                              {dearOne.email}
                            </span>
                            {dearOne.phone && (
                              <span className="text-sm flex items-center">
                                <Phone className="h-3 w-3 mr-2 text-muted-foreground" />
                                {dearOne.phone}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {dearOne.accessPermissions.viewMedications && (
                              <Badge variant="secondary" className="text-xs">View Meds</Badge>
                            )}
                            {dearOne.accessPermissions.viewAdherence && (
                              <Badge variant="secondary" className="text-xs">View Adherence</Badge>
                            )}
                            {dearOne.accessPermissions.markAsTaken && (
                              <Badge variant="secondary" className="text-xs">Mark as Taken</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEditDearOne(dearOne)}
                              className="h-8 w-8"
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDeleteDearOne(dearOne.id, dearOne.name)}
                              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <UserCheck className="h-12 w-12 text-blue-200 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Dear Ones Added Yet</h3>
              <p className="text-slate-600 max-w-md mb-6">
                Add family members or caregivers who can receive notifications about your medications and help you stay on track.
              </p>
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add Your First Person
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {selectedDearOne && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit {selectedDearOne.name}</DialogTitle>
              <DialogDescription>
                Update contact information and preferences.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  value={selectedDearOne.name}
                  onChange={(e) => setSelectedDearOne({...selectedDearOne, name: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-email" className="text-right">
                  Email
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={selectedDearOne.email}
                  onChange={(e) => setSelectedDearOne({...selectedDearOne, email: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-phone" className="text-right">
                  Phone
                </Label>
                <Input
                  id="edit-phone"
                  value={selectedDearOne.phone}
                  onChange={(e) => setSelectedDearOne({...selectedDearOne, phone: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-relationship" className="text-right">
                  Relationship
                </Label>
                <Select 
                  value={selectedDearOne.relationship}
                  onValueChange={(value) => setSelectedDearOne({...selectedDearOne, relationship: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spouse">Spouse</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="child">Child</SelectItem>
                    <SelectItem value="sibling">Sibling</SelectItem>
                    <SelectItem value="friend">Friend</SelectItem>
                    <SelectItem value="caregiver">Caregiver</SelectItem>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator className="my-2" />
              
              <Tabs defaultValue="notifications" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  <TabsTrigger value="permissions">Permissions</TabsTrigger>
                </TabsList>
                
                <TabsContent value="notifications" className="space-y-4 mt-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="edit-missedDose" className="flex-1">Missed Dose Alerts</Label>
                    <Switch 
                      id="edit-missedDose" 
                      checked={selectedDearOne.notificationPreferences.missedDose}
                      onCheckedChange={(checked) => setSelectedDearOne({
                        ...selectedDearOne, 
                        notificationPreferences: {
                          ...selectedDearOne.notificationPreferences,
                          missedDose: checked
                        }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="edit-lowStock" className="flex-1">Low Stock Alerts</Label>
                    <Switch 
                      id="edit-lowStock" 
                      checked={selectedDearOne.notificationPreferences.lowStock}
                      onCheckedChange={(checked) => setSelectedDearOne({
                        ...selectedDearOne, 
                        notificationPreferences: {
                          ...selectedDearOne.notificationPreferences,
                          lowStock: checked
                        }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="edit-prescriptionUpdates" className="flex-1">Prescription Updates</Label>
                    <Switch 
                      id="edit-prescriptionUpdates" 
                      checked={selectedDearOne.notificationPreferences.prescriptionUpdates}
                      onCheckedChange={(checked) => setSelectedDearOne({
                        ...selectedDearOne, 
                        notificationPreferences: {
                          ...selectedDearOne.notificationPreferences,
                          prescriptionUpdates: checked
                        }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="edit-criticalAlerts" className="flex-1">Critical Alerts</Label>
                    <Switch 
                      id="edit-criticalAlerts" 
                      checked={selectedDearOne.notificationPreferences.criticalAlerts}
                      onCheckedChange={(checked) => setSelectedDearOne({
                        ...selectedDearOne, 
                        notificationPreferences: {
                          ...selectedDearOne.notificationPreferences,
                          criticalAlerts: checked
                        }
                      })}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="permissions" className="space-y-4 mt-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="edit-viewMedications" className="flex-1">View Medications</Label>
                    <Switch 
                      id="edit-viewMedications" 
                      checked={selectedDearOne.accessPermissions.viewMedications}
                      onCheckedChange={(checked) => setSelectedDearOne({
                        ...selectedDearOne, 
                        accessPermissions: {
                          ...selectedDearOne.accessPermissions,
                          viewMedications: checked
                        }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="edit-viewAdherence" className="flex-1">View Adherence</Label>
                    <Switch 
                      id="edit-viewAdherence" 
                      checked={selectedDearOne.accessPermissions.viewAdherence}
                      onCheckedChange={(checked) => setSelectedDearOne({
                        ...selectedDearOne, 
                        accessPermissions: {
                          ...selectedDearOne.accessPermissions,
                          viewAdherence: checked
                        }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="edit-viewCalendar" className="flex-1">View Calendar</Label>
                    <Switch 
                      id="edit-viewCalendar" 
                      checked={selectedDearOne.accessPermissions.viewCalendar}
                      onCheckedChange={(checked) => setSelectedDearOne({
                        ...selectedDearOne, 
                        accessPermissions: {
                          ...selectedDearOne.accessPermissions,
                          viewCalendar: checked
                        }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="edit-markAsTaken" className="flex-1">Mark Medications as Taken</Label>
                    <Switch 
                      id="edit-markAsTaken" 
                      checked={selectedDearOne.accessPermissions.markAsTaken}
                      onCheckedChange={(checked) => setSelectedDearOne({
                        ...selectedDearOne, 
                        accessPermissions: {
                          ...selectedDearOne.accessPermissions,
                          markAsTaken: checked
                        }
                      })}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdateDearOne}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}; 