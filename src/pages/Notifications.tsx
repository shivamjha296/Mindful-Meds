import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Bell, BellRing, Calendar, Check, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/lib/AuthContext';
import { useNotifications } from '@/lib/NotificationContext';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { sendTestNotification } from '@/services/notificationService';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  date: string;
  isRead: boolean;
  type: 'reminder' | 'alert' | 'info';
  timestamp: number;
}

const Notifications = () => {
  const { currentUser } = useAuth();
  const { 
    notificationPermission, 
    requestPermission, 
    isNotificationsEnabled, 
    notificationPreferences, 
    updateNotificationPreferences,
    toggleNotifications,
    triggerImmediateCheck
  } = useNotifications();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingMedications, setCheckingMedications] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  
  // Fetch notifications from Firestore
  const fetchNotifications = async () => {
    if (!currentUser?.uid) return;
    
    try {
      setLoading(true);
      const notificationsRef = collection(db, 'users', currentUser.uid, 'notifications');
      const q = query(
        notificationsRef,
        orderBy('timestamp', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const fetchedNotifications: Notification[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedNotifications.push({
          id: doc.id,
          title: data.title || 'Notification',
          message: data.body || '',
          time: data.timestamp ? new Date(data.timestamp.toDate()).toLocaleTimeString() : '',
          date: data.timestamp ? new Date(data.timestamp.toDate()).toLocaleDateString() : '',
          isRead: data.read || false,
          type: determineNotificationType(data.title || ''),
          timestamp: data.timestamp ? data.timestamp.toDate().getTime() : Date.now()
        });
      });
      
      setNotifications(fetchedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch notifications on component mount
  useEffect(() => {
    if (currentUser?.uid) {
      fetchNotifications();
    }
  }, [currentUser]);
  
  // Refresh notifications when notification settings change
  useEffect(() => {
    if (currentUser?.uid) {
      fetchNotifications();
    }
  }, [isNotificationsEnabled, currentUser]);
  
  // Determine notification type based on title
  const determineNotificationType = (title: string): 'reminder' | 'alert' | 'info' => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('reminder') || lowerTitle.includes('time to take')) {
      return 'reminder';
    } else if (lowerTitle.includes('alert') || lowerTitle.includes('missed') || lowerTitle.includes('low')) {
      return 'alert';
    } else {
      return 'info';
    }
  };
  
  // Mark notification as read
  const markAsRead = async (id: string) => {
    if (!currentUser?.uid) return;
    
    try {
      const notificationRef = doc(db, 'users', currentUser.uid, 'notifications', id);
      await updateDoc(notificationRef, {
        read: true
      });
      
      setNotifications(notifications.map(notification => 
        notification.id === id ? { ...notification, isRead: true } : notification
      ));
      
      toast.success("Notification marked as read");
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to update notification');
    }
  };
  
  // Clear all notifications
  const clearAllNotifications = async () => {
    if (!currentUser?.uid || notifications.length === 0) return;
    
    try {
      const batch: Promise<void>[] = [];
      
      for (const notification of notifications) {
        const notificationRef = doc(db, 'users', currentUser.uid, 'notifications', notification.id);
        batch.push(deleteDoc(notificationRef));
      }
      
      await Promise.all(batch);
      setNotifications([]);
      toast.success("All notifications cleared");
    } catch (error) {
      console.error('Error clearing notifications:', error);
      toast.error('Failed to clear notifications');
    }
  };
  
  // Request browser notification permission
  const handleRequestPermission = async () => {
    const permission = await requestPermission();
    if (permission === 'granted') {
      toast.success('Notification permission granted');
    } else {
      toast.error('Notification permission denied');
    }
  };

  // Handle sending test notification
  const handleTestNotification = () => {
    setSendingTest(true);
    sendTestNotification(false);
    toast.success('Test notification sent');
    
    // Refresh notifications after a short delay
    setTimeout(() => {
      setSendingTest(false);
      fetchNotifications();
    }, 1000);
  };

  // Handle manual medication check
  const handleManualCheck = () => {
    setCheckingMedications(true);
    triggerImmediateCheck();
    toast.success('Checking for medication reminders');
    
    // Refresh notifications after a short delay
    setTimeout(() => {
      setCheckingMedications(false);
      fetchNotifications();
    }, 1000);
  };
  
  // Get notification type icon
  const getNotificationTypeIcon = (type: string) => {
    switch(type) {
      case 'reminder':
        return <Bell className="h-4 w-4" />;
      case 'alert':
        return <BellRing className="h-4 w-4" />;
      case 'info':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };
  
  // Get notification type badge
  const getNotificationTypeBadge = (type: string) => {
    switch(type) {
      case 'reminder':
        return <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">Reminder</Badge>;
      case 'alert':
        return <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">Alert</Badge>;
      case 'info':
        return <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">Info</Badge>;
      default:
        return <Badge variant="outline">Notification</Badge>;
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 pt-24">
        <h1 className="text-3xl font-bold mb-6">Notifications</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Recent Notifications</CardTitle>
                  {notifications.length > 0 && (
                    <button 
                      onClick={clearAllNotifications}
                      className="text-sm text-primary hover:underline"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                <CardDescription>
                  {loading ? (
                    "Loading notifications..."
                  ) : notifications.length > 0 ? (
                    `You have ${notifications.filter(n => !n.isRead).length} unread notifications`
                  ) : (
                    "No new notifications"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : notifications.length > 0 ? (
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`p-4 rounded-lg transition-colors ${
                          notification.isRead ? 'bg-secondary/50' : 'bg-secondary'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`rounded-full p-1 ${
                              notification.type === 'alert' ? 'bg-red-100 text-red-600' :
                              notification.type === 'info' ? 'bg-green-100 text-green-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                              {getNotificationTypeIcon(notification.type)}
                            </span>
                            <h3 className="font-medium">{notification.title}</h3>
                            {getNotificationTypeBadge(notification.type)}
                          </div>
                          {!notification.isRead && (
                            <button 
                              onClick={() => markAsRead(notification.id)}
                              className="p-1 rounded-full text-green-600 hover:bg-green-100"
                              title="Mark as read"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        <p className="text-muted-foreground mb-2">{notification.message}</p>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{notification.time}</span>
                          <span>{notification.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No notifications to display</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Test Notifications</CardTitle>
                <CardDescription>Send a test notification to verify your settings</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">Click the button below to send a test notification.</p>
                <Button onClick={handleTestNotification} disabled={sendingTest}>
                  {sendingTest ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...
                    </>
                  ) : (
                    <>
                      <Bell className="h-4 w-4 mr-2" /> Send Test Notification
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
            
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Check Medications</CardTitle>
                <CardDescription>Check for upcoming medication reminders</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">Manually check for medication reminders now.</p>
                <Button onClick={handleManualCheck} disabled={checkingMedications}>
                  {checkingMedications ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Checking...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" /> Check Now
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Configure how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {notificationPermission !== 'granted' && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                    <p className="text-amber-800 text-sm mb-2">
                      Browser notifications are not enabled. Enable them to receive medication reminders.
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleRequestPermission}
                    >
                      Enable Notifications
                    </Button>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notifications">Enable Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications for your medications
                    </p>
                  </div>
                  <Switch 
                    id="notifications" 
                    checked={isNotificationsEnabled}
                    disabled={notificationPermission !== 'granted'}
                    onCheckedChange={(checked) => {
                      toggleNotifications(checked);
                      toast.success(checked ? "Notifications enabled" : "Notifications disabled");
                    }}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Notification Types</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="reminders">Medication Reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        Get reminded when it's time to take medication
                      </p>
                    </div>
                    <Switch 
                      id="reminders" 
                      checked={notificationPreferences.reminderNotifications}
                      disabled={!isNotificationsEnabled}
                      onCheckedChange={(checked) => {
                        updateNotificationPreferences({ reminderNotifications: checked });
                      }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="alerts">Missed Dose Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Get alerted when you miss a medication dose
                      </p>
                    </div>
                    <Switch 
                      id="alerts" 
                      checked={notificationPreferences.missedDoseAlerts}
                      disabled={!isNotificationsEnabled}
                      onCheckedChange={(checked) => {
                        updateNotificationPreferences({ missedDoseAlerts: checked });
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
