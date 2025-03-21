# Notification Testing Tools

This directory contains tools to help you test the notification system in the application.

## Getting Started

1. Make sure both the backend and frontend servers are running:
   - Backend: `cd JR-41-Invictus/src/backend && npm start`
   - Frontend: `cd JR-41-Invictus && npm run dev`

2. Open the following HTML files in your browser:

## Tools Available

### 1. Get Your User ID (`get-user-id.html`)

This tool helps you:
- Log in to your Firebase account
- View your Firebase User ID
- Copy your User ID to use in other tools

### 2. Add Firebase Notification (`add-notification.html`)

This tool adds a notification directly to Firebase Firestore:
- Enter your User ID (or click the link from the User ID tool)
- Fill in notification details
- Click "Add Notification"

### 3. Add API Notification (`add-api-notification.html`)

This tool adds a notification through the backend API:
- Enter your User ID
- Fill in notification details
- Click "Add Notification"

## Why Two Different Methods?

The application has two notification systems:

1. **Firebase Notifications**: These appear in the NotificationsPanel component in the UI
2. **API Notifications**: These are stored in the backend server memory

For testing the NotificationsPanel, you should use the Firebase Notification tool.

## Troubleshooting

If notifications don't appear in the UI:

1. Make sure you're logged in to the application with the same account
2. Check that you're using the correct User ID
3. Verify that both servers are running
4. Check browser console for errors 