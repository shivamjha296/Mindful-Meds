import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, ExternalLink, Phone, Clock } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  distance: number;
  phone?: string;
  openNow?: boolean;
  openHours?: string;
}

interface PharmacyFinderProps {
  medicationName: string;
  onClose: () => void;
}

const PharmacyFinder: React.FC<PharmacyFinderProps> = ({ medicationName, onClose }) => {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mapUrl, setMapUrl] = useState<string | null>(null);

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          
          // In a real app, you would call an API to get nearby pharmacies
          // For demo purposes, we'll use mock data
          fetchNearbyPharmacies(latitude, longitude);
          
          // Generate Google Maps URL
          const googleMapsUrl = `https://www.google.com/maps/search/pharmacies/@${latitude},${longitude},14z`;
          setMapUrl(googleMapsUrl);
        },
        (error) => {
          console.error("Error getting location:", error);
          setError("Unable to access your location. Please enable location services.");
          setLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
    }
  }, []);

  const fetchNearbyPharmacies = (latitude: number, longitude: number) => {
    // In a production app, you would call an API like Google Places API
    // For demo purposes, we'll use mock data
    setTimeout(() => {
      const mockPharmacies: Pharmacy[] = [
        {
          id: "1",
          name: "QuickCare Pharmacy",
          address: "123 Health St, Medical District",
          distance: 0.8,
          phone: "555-123-4567",
          openNow: true,
          openHours: "8:00 AM - 10:00 PM"
        },
        {
          id: "2",
          name: "Community Drugstore",
          address: "456 Wellness Ave, Care Center",
          distance: 1.2,
          phone: "555-987-6543",
          openNow: true,
          openHours: "24 hours"
        },
        {
          id: "3",
          name: "MediPlus Pharmacy",
          address: "789 Remedy Rd, Healing Plaza",
          distance: 1.7,
          phone: "555-456-7890",
          openNow: false,
          openHours: "9:00 AM - 7:00 PM"
        },
        {
          id: "4",
          name: "Family Health Pharmacy",
          address: "321 Care Lane, Wellness Center",
          distance: 2.3,
          phone: "555-789-0123",
          openNow: true,
          openHours: "8:00 AM - 9:00 PM"
        }
      ];
      
      setPharmacies(mockPharmacies);
      setLoading(false);
    }, 1500); // Simulate API delay
  };

  const openDirections = (pharmacy: Pharmacy) => {
    if (userLocation) {
      const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${encodeURIComponent(pharmacy.address)}&travelmode=driving`;
      window.open(directionsUrl, '_blank');
    }
  };

  const openMap = () => {
    if (mapUrl) {
      window.open(mapUrl, '_blank');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          Nearby Pharmacies
        </h2>
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>
      
      <p className="text-muted-foreground">
        {medicationName ? `Your ${medicationName} is out of stock. Here are nearby pharmacies where you might find it.` : 'Find nearby pharmacies to refill your medication.'}
      </p>
      
      {error && (
        <div className="p-4 border border-red-200 bg-red-50 rounded-lg text-red-700">
          {error}
        </div>
      )}
      
      <div className="aspect-video w-full rounded-lg overflow-hidden border shadow-sm bg-gray-100 mb-4">
        {loading ? (
          <Skeleton className="h-full w-full" />
        ) : mapUrl ? (
          <div className="relative h-full w-full bg-gray-200 flex items-center justify-center">
            <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center p-4 text-center">
              <MapPin className="h-12 w-12 text-primary mb-2" />
              <h3 className="text-lg font-medium mb-2">Map Preview</h3>
              <p className="text-sm text-gray-500 mb-4">For privacy reasons, the map is not displayed directly in this demo.</p>
              <Button onClick={openMap}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Map in Google Maps
              </Button>
            </div>
          </div>
        ) : null}
      </div>
      
      <div className="space-y-3">
        <h3 className="text-lg font-medium">Nearby Locations</h3>
        
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="pb-2">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))
        ) : (
          pharmacies.map(pharmacy => (
            <Card key={pharmacy.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <span>{pharmacy.name}</span>
                  <span className="text-sm font-normal text-muted-foreground flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {pharmacy.distance} miles
                  </span>
                </CardTitle>
                <CardDescription>
                  {pharmacy.address}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex flex-col space-y-1 text-sm">
                  {pharmacy.phone && (
                    <div className="flex items-center">
                      <Phone className="h-3 w-3 mr-2 text-muted-foreground" />
                      <a href={`tel:${pharmacy.phone}`} className="text-primary hover:underline">
                        {pharmacy.phone}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-2 text-muted-foreground" />
                    <span className={pharmacy.openNow ? "text-green-600" : "text-red-600"}>
                      {pharmacy.openNow ? "Open now" : "Closed"} • {pharmacy.openHours}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => openDirections(pharmacy)}
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Get Directions
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
      
      <div className="text-sm text-muted-foreground mt-4">
        <p>Note: In a production app, this would use the Google Maps API or a similar service to show real pharmacy data.</p>
      </div>
    </div>
  );
};

export default PharmacyFinder; 