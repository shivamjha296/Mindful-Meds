const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock database with user-specific data
let userMedications = {};
let dashboardData = {
  title: 'Main Dashboard',
  stats: {
    totalUsers: 120,
    activeUsers: 42,
    totalRevenue: 54000,
    conversionRate: 12.5
  },
  medications: [], // This will be replaced with user-specific medications
  recentActivity: [
    { action: 'User signup', user: 'john.doe@example.com', timestamp: new Date() }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
};

// Helper function to get user-specific medications
const getUserMedications = (userId) => {
  if (!userId) {
    return [];
  }
  
  // Initialize user medications if they don't exist
  if (!userMedications[userId]) {
    userMedications[userId] = [];
  }
  
  return userMedications[userId];
};

// Routes

// Get dashboard data with user-specific medications
app.get('/api/dashboard', (req, res) => {
  const userId = req.query.userId;
  
  if (userId) {
    // Return user-specific medications
    const userMeds = getUserMedications(userId);
    
    // Create a copy of dashboard data with user-specific medications
    const userDashboard = {
      ...dashboardData,
      medications: userMeds
    };
    
    res.json(userDashboard);
  } else {
    // Return generic dashboard without medications
    res.json({
      ...dashboardData,
      medications: []
    });
  }
});

// Add medication
app.post('/api/dashboard/medications', (req, res) => {
  const { userId, name, dosage, frequency, timeOfDay, startDate, notes, stock } = req.body;
  
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }
  
  if (!name || !dosage || !frequency) {
    return res.status(400).json({ message: 'Medication name, dosage, and frequency are required' });
  }
  
  // Create a new medication
  const newMedication = {
    name,
    dosage,
    frequency,
    timeOfDay: timeOfDay || 'Not specified',
    startDate: startDate ? new Date(startDate) : new Date(),
    notes: notes || '',
    stock: stock !== undefined ? stock : 0,
    addedAt: new Date()
  };
  
  // Get user medications
  const userMeds = getUserMedications(userId);
  
  // Add to the user's medications array
  userMeds.push(newMedication);
  
  // Add an activity for the medication addition
  dashboardData.recentActivity.unshift({
    action: `Added medication: ${name} (Stock: ${stock || 0})`,
    user: userId,
    timestamp: new Date()
  });
  
  // Keep only the 10 most recent activities
  if (dashboardData.recentActivity.length > 10) {
    dashboardData.recentActivity = dashboardData.recentActivity.slice(0, 10);
  }
  
  dashboardData.updatedAt = new Date();
  
  // Return user-specific dashboard
  res.status(200).json({
    ...dashboardData,
    medications: userMeds
  });
});

// Update medication
app.put('/api/dashboard/medications', (req, res) => {
  const { userId, index, medication } = req.body;
  
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }
  
  if (index === undefined || !medication) {
    return res.status(400).json({ message: 'Medication index and updated data are required' });
  }
  
  // Get user medications
  const userMeds = getUserMedications(userId);
  
  // Check if the medication exists
  if (index < 0 || index >= userMeds.length) {
    return res.status(404).json({ message: 'Medication not found at specified index' });
  }
  
  // Get previous stock value for activity log
  const previousStock = userMeds[index].stock || 0;
  const newStock = medication.stock !== undefined ? medication.stock : previousStock;
  
  // Update the medication
  userMeds[index] = {
    ...userMeds[index],
    ...medication,
    updatedAt: new Date()
  };
  
  // Add an activity for the medication update
  let actionMessage = `Updated medication: ${userMeds[index].name}`;
  
  // Add stock change information if stock was updated
  if (previousStock !== newStock) {
    actionMessage += ` (Stock changed from ${previousStock} to ${newStock})`;
  }
  
  dashboardData.recentActivity.unshift({
    action: actionMessage,
    user: userId,
    timestamp: new Date()
  });
  
  // Keep only the 10 most recent activities
  if (dashboardData.recentActivity.length > 10) {
    dashboardData.recentActivity = dashboardData.recentActivity.slice(0, 10);
  }
  
  dashboardData.updatedAt = new Date();
  
  // Return user-specific dashboard
  res.status(200).json({
    ...dashboardData,
    medications: userMeds
  });
});

// Delete medication
app.delete('/api/dashboard/medications', (req, res) => {
  const { userId, index } = req.body;
  
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }
  
  if (index === undefined) {
    return res.status(400).json({ message: 'Medication index is required' });
  }
  
  // Get user medications
  const userMeds = getUserMedications(userId);
  
  // Check if the medication exists
  if (index < 0 || index >= userMeds.length) {
    return res.status(404).json({ message: 'Medication not found at specified index' });
  }
  
  // Store the name for the activity log
  const medicationName = userMeds[index].name;
  
  // Remove the medication
  userMeds.splice(index, 1);
  
  // Add an activity for the medication deletion
  dashboardData.recentActivity.unshift({
    action: `Removed medication: ${medicationName}`,
    user: userId,
    timestamp: new Date()
  });
  
  // Keep only the 10 most recent activities
  if (dashboardData.recentActivity.length > 10) {
    dashboardData.recentActivity = dashboardData.recentActivity.slice(0, 10);
  }
  
  dashboardData.updatedAt = new Date();
  
  // Return user-specific dashboard
  res.status(200).json({
    ...dashboardData,
    medications: userMeds
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Dashboard API available at http://localhost:${PORT}/api/dashboard`);
}); 