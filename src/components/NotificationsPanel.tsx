import React, { useState, useEffect } from 'react';
import { Bell, BellRing, Calendar, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/lib/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs, doc, updateDoc, limit, Timestamp } from 'firebase/firestore';
import { useNotifications } from '@/lib/NotificationContext';
import { toast } from 'sonner';
import { requestNotificationPermission } from '@/utils/notificationUtils';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  date: string;
  isRead: boolean;
  type: 'reminder' | 'alert' | 'info';
}

const NotificationsPanel = () => {
  const { user } = useAuth();
  const { notificationPermission, requestPermission } = useNotifications();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // Fetch notifications from Firestore
  const fetchNotifications = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      const notificationsRef = collection(db, 'users', user.uid, 'notifications');
      const q = query(
        notificationsRef,
        where('read', '==', false),
        orderBy('timestamp', 'desc'),
        limit(5)
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
          type: determineNotificationType(data.title || '')
        });
      });
      
      setNotifications(fetchedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch notifications when component mounts and when popover opens
  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open, user]);

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
    if (!user?.uid) return;
    
    try {
      const notificationRef = doc(db, 'users', user.uid, 'notifications', id);
      await updateDoc(notificationRef, {
        read: true
      });
      
      setNotifications(notifications.filter(notification => notification.id !== id));
    } catch (error) {
      console.error('Error marking notification as read:', error);
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {notifications.length > 0 && (
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {notificationPermission !== 'granted' ? (
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Enable browser notifications to receive medication reminders
                </p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleRequestPermission}
                >
                  Enable Notifications
                </Button>
              </div>
            ) : loading ? (
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground">Loading notifications...</p>
              </div>
            ) : notifications.length > 0 ? (
              <div className="max-h-[300px] overflow-auto">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className="p-3 border-b last:border-b-0 hover:bg-secondary/50"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full p-1 ${
                          notification.type === 'alert' ? 'bg-red-100 text-red-600' :
                          notification.type === 'info' ? 'bg-green-100 text-green-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {getNotificationTypeIcon(notification.type)}
                        </span>
                        <h3 className="text-sm font-medium">{notification.title}</h3>
                      </div>
                      <button 
                        onClick={() => markAsRead(notification.id)}
                        className="p-1 rounded-full text-muted-foreground hover:bg-secondary"
                        title="Dismiss"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground ml-7 mb-1">{notification.message}</p>
                    <div className="flex justify-end text-xs text-muted-foreground">
                      <span>{notification.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground">No new notifications</p>
              </div>
            )}
            <div className="p-2 border-t">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-xs"
                onClick={() => window.location.href = '/notifications'}
              >
                View all notifications
              </Button>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsPanel; 