import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, ExternalLink, Phone, Clock, Search, Loader2 } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

// This would be imported from your environment variables in a real app
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  distance: number;
  phone?: string;
  openNow?: boolean;
  openHours?: string;
  location: {
    lat: number;
    lng: number;
  };
}

interface PharmacyFinderProps {
  medicationName: string;
  onClose: () => void;
}

const PharmacyFinderAdvanced: React.FC<PharmacyFinderProps> = ({ medicationName, onClose }) => {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchRadius, setSearchRadius] = useState<number>(5); // miles
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  // Load Google Maps API
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      setError("Google Maps API key is not configured. Please add it to your environment variables.");
      setLoading(false);
      return;
    }

    // Check if Google Maps API is already loaded
    if (window.google && window.google.maps) {
      initializeMap();
      return;
    }

    // Load Google Maps API
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = initializeMap;
    script.onerror = () => {
      setError("Failed to load Google Maps API. Please try again later.");
      setLoading(false);
    };
    document.head.appendChild(script);

    return () => {
      // Clean up markers when component unmounts
      if (markersRef.current) {
        markersRef.current.forEach(marker => marker.setMap(null));
      }
    };
  }, []);

  // Initialize map when Google Maps API is loaded and user location is available
  useEffect(() => {
    if (window.google && window.google.maps && userLocation && mapRef.current) {
      initializeGoogleMap();
    }
  }, [userLocation]);

  const initializeMap = () => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
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
  };

  const initializeGoogleMap = () => {
    if (!userLocation || !mapRef.current || !window.google) return;

    // Create a new Google Map
    const mapOptions: google.maps.MapOptions = {
      center: userLocation,
      zoom: 13,
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
      zoomControl: true,
    };

    googleMapRef.current = new google.maps.Map(mapRef.current, mapOptions);

    // Add a marker for the user's location
    new google.maps.Marker({
      position: userLocation,
      map: googleMapRef.current,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: "#4285F4",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 2,
      },
      title: "Your Location",
    });

    // Search for pharmacies
    searchPharmacies();
  };

  const searchPharmacies = () => {
    if (!userLocation || !googleMapRef.current || !window.google) return;

    setLoading(true);

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Create a Places service
    const service = new google.maps.places.PlacesService(googleMapRef.current);

    // Search for pharmacies
    const request: google.maps.places.PlaceSearchRequest = {
      location: userLocation,
      radius: searchRadius * 1609.34, // Convert miles to meters
      type: "pharmacy",
    };

    service.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        // Process results
        const pharmacyResults: Pharmacy[] = results.map((place, index) => {
          // Calculate distance (this is a simplified calculation)
          const placeLocation = place.geometry?.location;
          const distance = placeLocation 
            ? calculateDistance(
                userLocation.lat, 
                userLocation.lng, 
                placeLocation.lat(), 
                placeLocation.lng()
              ) 
            : 0;

          // Create a marker for this pharmacy
          if (placeLocation && googleMapRef.current) {
            const marker = new google.maps.Marker({
              position: { lat: placeLocation.lat(), lng: placeLocation.lng() },
              map: googleMapRef.current,
              title: place.name,
              animation: google.maps.Animation.DROP,
            });

            // Add click event to marker
            marker.addListener("click", () => {
              const pharmacy: Pharmacy = {
                id: place.place_id || `pharmacy-${index}`,
                name: place.name || "Unknown Pharmacy",
                address: place.vicinity || "Address unavailable",
                distance: parseFloat(distance.toFixed(1)),
                openNow: place.opening_hours?.isOpen() || false,
                location: {
                  lat: placeLocation.lat(),
                  lng: placeLocation.lng(),
                },
              };
              setSelectedPharmacy(pharmacy);
              
              // Get more details about this place
              getPlaceDetails(place.place_id);
            });

            markersRef.current.push(marker);
          }

          return {
            id: place.place_id || `pharmacy-${index}`,
            name: place.name || "Unknown Pharmacy",
            address: place.vicinity || "Address unavailable",
            distance: parseFloat(distance.toFixed(1)),
            openNow: place.opening_hours?.isOpen() || false,
            location: {
              lat: placeLocation?.lat() || 0,
              lng: placeLocation?.lng() || 0,
            },
          };
        });

        // Sort by distance
        pharmacyResults.sort((a, b) => a.distance - b.distance);
        
        setPharmacies(pharmacyResults);
        setLoading(false);
      } else {
        console.error("Error fetching pharmacies:", status);
        setError("Failed to fetch nearby pharmacies. Please try again later.");
        setLoading(false);
      }
    });
  };

  const getPlaceDetails = (placeId: string | undefined) => {
    if (!placeId || !googleMapRef.current) return;

    const service = new google.maps.places.PlacesService(googleMapRef.current);
    
    service.getDetails(
      {
        placeId: placeId,
        fields: ["formatted_phone_number", "opening_hours"],
      },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          setPharmacies(prev => 
            prev.map(pharmacy => 
              pharmacy.id === placeId 
                ? {
                    ...pharmacy,
                    phone: place.formatted_phone_number || pharmacy.phone,
                    openHours: place.opening_hours?.weekday_text?.join(", ") || pharmacy.openHours,
                  }
                : pharmacy
            )
          );
        }
      }
    );
  };

  // Calculate distance between two coordinates in miles
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3958.8; // Radius of the Earth in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  };

  const openDirections = (pharmacy: Pharmacy) => {
    if (userLocation) {
      const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${pharmacy.location.lat},${pharmacy.location.lng}&travelmode=driving`;
      window.open(directionsUrl, '_blank');
    }
  };

  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setSearchRadius(value);
    }
  };

  const handleSearch = () => {
    searchPharmacies();
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
      
      <div className="flex items-center space-x-2 mb-4">
        <div className="flex-1">
          <Input
            type="number"
            value={searchRadius}
            onChange={handleRadiusChange}
            min={1}
            max={50}
            placeholder="Search radius in miles"
            className="w-full"
          />
        </div>
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
          Search
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <div 
            ref={mapRef} 
            className="w-full h-[400px] rounded-lg border shadow-sm bg-gray-100"
            style={{ display: GOOGLE_MAPS_API_KEY ? 'block' : 'none' }}
          ></div>
          
          {!GOOGLE_MAPS_API_KEY && (
            <div className="w-full h-[400px] rounded-lg border shadow-sm bg-gray-100 flex items-center justify-center">
              <div className="text-center p-4">
                <MapPin className="h-12 w-12 text-primary mx-auto mb-2" />
                <h3 className="text-lg font-medium mb-2">Map Not Available</h3>
                <p className="text-sm text-gray-500">
                  Google Maps API key is not configured. Please add it to your environment variables.
                </p>
              </div>
            </div>
          )}
        </div>
        
        <div className="space-y-3 md:max-h-[400px] md:overflow-y-auto">
          <h3 className="text-lg font-medium sticky top-0 bg-white py-2">Nearby Pharmacies</h3>
          
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
          ) : pharmacies.length > 0 ? (
            pharmacies.map(pharmacy => (
              <Card 
                key={pharmacy.id} 
                className={`overflow-hidden cursor-pointer transition-all ${selectedPharmacy?.id === pharmacy.id ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setSelectedPharmacy(pharmacy)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-base">
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
                    {pharmacy.openNow !== undefined && (
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-2 text-muted-foreground" />
                        <span className={pharmacy.openNow ? "text-green-600" : "text-red-600"}>
                          {pharmacy.openNow ? "Open now" : "Closed"}
                          {pharmacy.openHours && ` • ${pharmacy.openHours}`}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={(e) => {
                      e.stopPropagation();
                      openDirections(pharmacy);
                    }}
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Get Directions
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="text-center p-4 border rounded-lg">
              <p>No pharmacies found within {searchRadius} miles. Try increasing your search radius.</p>
            </div>
          )}
        </div>
      </div>
      
      {!GOOGLE_MAPS_API_KEY && (
        <div className="text-sm text-muted-foreground mt-4 p-4 border rounded-lg bg-amber-50">
          <h4 className="font-medium text-amber-800 mb-2">Setup Instructions</h4>
          <ol className="list-decimal pl-5 space-y-1 text-amber-700">
            <li>Get a Google Maps API key from the <a href="https://console.cloud.google.com/google/maps-apis" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a></li>
            <li>Enable the Places API and Maps JavaScript API</li>
            <li>Add the API key to your .env file as VITE_GOOGLE_MAPS_API_KEY</li>
            <li>Restart your development server</li>
          </ol>
        </div>
      )}
    </div>
  );
};

export default PharmacyFinderAdvanced; 