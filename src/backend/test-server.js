const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3002; // Use a different port to avoid conflicts

// Middleware
app.use(cors());
app.use(express.json());

// Mock database - user-specific
let userDatabase = {};

// Initialize a user's data if it doesn't exist
function initializeUserData(userId) {
  if (!userDatabase[userId]) {
    userDatabase[userId] = {
      userId: userId,
      medications: [],
      notifications: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
  return userDatabase[userId];
}

// Routes

// Get user dashboard data
app.get('/api/dashboard/:userId', (req, res) => {
  const { userId } = req.params;
  
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }
  
  const userData = initializeUserData(userId);
  res.json(userData);
});

// Get user notifications
app.get('/api/notifications/:userId', (req, res) => {
  const { userId } = req.params;
  
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }
  
  const userData = initializeUserData(userId);
  res.json(userData.notifications);
});

// Create notification
app.post('/api/notifications', (req, res) => {
  const { userId, title, message, type } = req.body;
  
  if (!userId || !title || !message || !type) {
    return res.status(400).json({ 
      message: 'User ID, title, message, and type are required' 
    });
  }
  
  const userData = initializeUserData(userId);
  
  // Create a new notification
  const newNotification = {
    id: Date.now().toString(),
    userId,
    title,
    message,
    type,
    read: false,
    createdAt: new Date()
  };
  
  // Add to the notifications array
  userData.notifications.push(newNotification);
  userData.updatedAt = new Date();
  
  res.status(201).json(newNotification);
});

// Add medication
app.post('/api/medications', (req, res) => {
  const { userId, name, dosage, frequency, timeOfDay, startDate, notes, stock } = req.body;
  
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }
  
  if (!name || !dosage || !frequency) {
    return res.status(400).json({ message: 'Medication name, dosage, and frequency are required' });
  }
  
  const userData = initializeUserData(userId);
  
  // Create a new medication
  const newMedication = {
    id: Date.now().toString(),
    name,
    dosage,
    frequency,
    timeOfDay: timeOfDay || 'Not specified',
    startDate: startDate ? new Date(startDate) : new Date(),
    notes: notes || '',
    stock: stock !== undefined ? stock : 0,
    addedAt: new Date()
  };
  
  // Add to the medications array
  userData.medications.push(newMedication);
  userData.updatedAt = new Date();
  
  // Add activity
  if (!userData.recentActivity) {
    userData.recentActivity = [];
  }
  
  userData.recentActivity.unshift({
    action: `Added medication: ${name} (Stock: ${stock || 0})`,
    user: userId,
    timestamp: new Date()
  });
  
  res.status(201).json(newMedication);
});

// Update medication
app.put('/api/medications/:medicationId', (req, res) => {
  const { userId, medication } = req.body;
  const { medicationId } = req.params;
  
  if (!userId || !medicationId) {
    return res.status(400).json({ message: 'User ID and medication ID are required' });
  }
  
  const userData = initializeUserData(userId);
  
  // Find the medication
  const index = userData.medications.findIndex(med => med.id === medicationId);
  
  if (index === -1) {
    return res.status(404).json({ message: 'Medication not found' });
  }
  
  // Get previous stock value for activity log
  const previousStock = userData.medications[index].stock || 0;
  const newStock = medication.stock !== undefined ? medication.stock : previousStock;
  
  // Update the medication
  userData.medications[index] = {
    ...userData.medications[index],
    ...medication,
    updatedAt: new Date()
  };
  
  // Add activity
  if (!userData.recentActivity) {
    userData.recentActivity = [];
  }
  
  let actionMessage = `Updated medication: ${userData.medications[index].name}`;
  
  // Add stock change information if stock was updated
  if (previousStock !== newStock) {
    actionMessage += ` (Stock changed from ${previousStock} to ${newStock})`;
  }
  
  userData.recentActivity.unshift({
    action: actionMessage,
    user: userId,
    timestamp: new Date()
  });
  
  res.status(200).json(userData.medications[index]);
});

// Start server
app.listen(PORT, () => {
  console.log(`Test server is running on http://localhost:${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
}); 