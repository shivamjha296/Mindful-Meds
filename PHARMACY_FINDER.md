# Pharmacy Finder Feature

This document provides an overview of the Pharmacy Finder feature in the JR-41-Invictus medication management application.

## Overview

The Pharmacy Finder feature allows users to find nearby pharmacies when their medication is out of stock or running low. This feature integrates with the Google Maps API to provide real-time location data and directions to nearby pharmacies.

## Features

- **Automatic Location Detection**: Uses the browser's geolocation API to determine the user's current location
- **Nearby Pharmacy Search**: Finds pharmacies within a specified radius of the user's location
- **Interactive Map**: Displays pharmacies on a Google Map with markers
- **Pharmacy Details**: Shows information about each pharmacy, including:
  - Name and address
  - Distance from user's location
  - Phone number (when available)
  - Opening hours (when available)
- **Get Directions**: Provides directions to the selected pharmacy using Google Maps
- **Customizable Search Radius**: Allows users to adjust the search radius to find more pharmacies

## Implementation

The Pharmacy Finder feature is implemented using the following components:

1. **PharmacyFinderAdvanced.tsx**: The main component that integrates with the Google Maps API to display nearby pharmacies
2. **MedicationCard.tsx**: Updated to show a "Find Nearby Pharmacies" button when medication stock is low or out of stock
3. **Google Maps API**: Used for mapping, geocoding, and the Places API to find pharmacies

## Setup Instructions

To use the Pharmacy Finder feature, you need to set up a Google Maps API key:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Directions API
4. Create an API key with appropriate restrictions
5. Add the API key to your `.env` file:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```
6. Restart your development server

## Usage

The Pharmacy Finder is automatically integrated into the medication management workflow:

1. When a medication's stock is low (less than 5 pills), a warning is displayed on the medication card
2. When a medication is out of stock (0 pills), an alert is displayed on the medication card
3. In both cases, a "Find Nearby Pharmacies" button is shown
4. Clicking this button opens the Pharmacy Finder dialog
5. The user can view nearby pharmacies on the map and in a list
6. The user can click on a pharmacy to see more details
7. The user can get directions to a pharmacy by clicking the "Get Directions" button

## Fallback Behavior

If the Google Maps API key is not configured or if there are issues with the API:

1. A simplified version of the Pharmacy Finder is shown without the interactive map
2. Users are provided with instructions on how to set up the Google Maps API
3. Users can still open Google Maps in a new tab to search for pharmacies manually

## Future Enhancements

Potential future enhancements for the Pharmacy Finder feature:

1. **Medication Availability**: Integration with pharmacy APIs to check if specific medications are in stock
2. **Prescription Transfer**: Allow users to transfer prescriptions to nearby pharmacies
3. **Pharmacy Filtering**: Filter pharmacies by features (24/7, drive-through, etc.)
4. **Saved Pharmacies**: Allow users to save their preferred pharmacies
5. **Automatic Refill Reminders**: Send notifications when medications are running low, suggesting nearby pharmacies

## Technical Notes

- The Pharmacy Finder uses the browser's geolocation API, which requires user permission
- For privacy reasons, location data is only used within the application and is not stored
- The Google Maps API has usage limits and may incur costs if used extensively
- The feature is designed to work on both desktop and mobile devices 