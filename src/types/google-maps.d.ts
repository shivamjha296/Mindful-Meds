// Type definitions for Google Maps API
// These are simplified definitions for the specific features we're using

declare global {
  interface Window {
    google: typeof google;
  }
}

declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: Element, opts?: MapOptions);
      setCenter(latLng: LatLng | LatLngLiteral): void;
      setZoom(zoom: number): void;
      setOptions(options: MapOptions): void;
      panTo(latLng: LatLng | LatLngLiteral): void;
      panBy(x: number, y: number): void;
      fitBounds(bounds: LatLngBounds | LatLngBoundsLiteral): void;
      getBounds(): LatLngBounds;
      getCenter(): LatLng;
      getZoom(): number;
      getDiv(): Element;
    }

    interface MapOptions {
      center?: LatLng | LatLngLiteral;
      zoom?: number;
      mapTypeId?: string;
      mapTypeControl?: boolean;
      fullscreenControl?: boolean;
      streetViewControl?: boolean;
      zoomControl?: boolean;
      styles?: any[];
    }

    class LatLng {
      constructor(lat: number, lng: number, noWrap?: boolean);
      lat(): number;
      lng(): number;
      toString(): string;
      toUrlValue(precision?: number): string;
      toJSON(): LatLngLiteral;
      equals(other: LatLng): boolean;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    class LatLngBounds {
      constructor(sw?: LatLng, ne?: LatLng);
      contains(latLng: LatLng): boolean;
      equals(other: LatLngBounds | LatLngBoundsLiteral): boolean;
      extend(point: LatLng): LatLngBounds;
      getCenter(): LatLng;
      getNorthEast(): LatLng;
      getSouthWest(): LatLng;
      isEmpty(): boolean;
      toJSON(): LatLngBoundsLiteral;
      toSpan(): LatLng;
      toString(): string;
      toUrlValue(precision?: number): string;
      union(other: LatLngBounds | LatLngBoundsLiteral): LatLngBounds;
    }

    interface LatLngBoundsLiteral {
      east: number;
      north: number;
      south: number;
      west: number;
    }

    class Marker {
      constructor(opts?: MarkerOptions);
      setMap(map: Map | null): void;
      setPosition(latLng: LatLng | LatLngLiteral): void;
      setTitle(title: string): void;
      setLabel(label: string | MarkerLabel): void;
      setIcon(icon: string | Icon | Symbol): void;
      setOpacity(opacity: number): void;
      setVisible(visible: boolean): void;
      setZIndex(zIndex: number): void;
      getMap(): Map | null;
      getPosition(): LatLng | null;
      getTitle(): string;
      getLabel(): string | MarkerLabel;
      getIcon(): string | Icon | Symbol;
      getOpacity(): number;
      getVisible(): boolean;
      getZIndex(): number;
      addListener(eventName: string, handler: Function): MapsEventListener;
    }

    interface MarkerOptions {
      position: LatLng | LatLngLiteral;
      map?: Map;
      title?: string;
      label?: string | MarkerLabel;
      icon?: string | Icon | Symbol;
      opacity?: number;
      visible?: boolean;
      zIndex?: number;
      animation?: Animation;
      clickable?: boolean;
      draggable?: boolean;
    }

    interface MarkerLabel {
      text: string;
      color?: string;
      fontFamily?: string;
      fontSize?: string;
      fontWeight?: string;
    }

    interface Icon {
      url: string;
      size?: Size;
      scaledSize?: Size;
      origin?: Point;
      anchor?: Point;
      labelOrigin?: Point;
    }

    class Size {
      constructor(width: number, height: number, widthUnit?: string, heightUnit?: string);
      width: number;
      height: number;
      equals(other: Size): boolean;
      toString(): string;
    }

    class Point {
      constructor(x: number, y: number);
      x: number;
      y: number;
      equals(other: Point): boolean;
      toString(): string;
    }

    enum Animation {
      BOUNCE,
      DROP
    }

    enum SymbolPath {
      BACKWARD_CLOSED_ARROW,
      BACKWARD_OPEN_ARROW,
      CIRCLE,
      FORWARD_CLOSED_ARROW,
      FORWARD_OPEN_ARROW
    }

    interface Symbol {
      path: SymbolPath | string;
      fillColor?: string;
      fillOpacity?: number;
      scale?: number;
      strokeColor?: string;
      strokeOpacity?: number;
      strokeWeight?: number;
    }

    interface MapsEventListener {
      remove(): void;
    }

    namespace places {
      class PlacesService {
        constructor(attrContainer: Map | Element);
        nearbySearch(request: PlaceSearchRequest, callback: (results: PlaceResult[] | null, status: PlacesServiceStatus, pagination: PlaceSearchPagination | null) => void): void;
        getDetails(request: PlaceDetailsRequest, callback: (result: PlaceResult | null, status: PlacesServiceStatus) => void): void;
      }

      interface PlaceSearchRequest {
        bounds?: LatLngBounds | LatLngBoundsLiteral;
        location?: LatLng | LatLngLiteral;
        radius?: number;
        keyword?: string;
        name?: string;
        type?: string;
      }

      interface PlaceDetailsRequest {
        placeId: string;
        fields?: string[];
      }

      interface PlaceResult {
        place_id?: string;
        name?: string;
        vicinity?: string;
        formatted_address?: string;
        formatted_phone_number?: string;
        geometry?: {
          location?: LatLng;
          viewport?: LatLngBounds;
        };
        opening_hours?: {
          isOpen(): boolean;
          weekday_text?: string[];
        };
        photos?: PlacePhoto[];
        types?: string[];
        rating?: number;
        user_ratings_total?: number;
      }

      interface PlacePhoto {
        getUrl(opts: PhotoOptions): string;
        height: number;
        width: number;
        html_attributions: string[];
      }

      interface PhotoOptions {
        maxWidth?: number;
        maxHeight?: number;
      }

      interface PlaceSearchPagination {
        hasNextPage: boolean;
        nextPage(): void;
      }

      enum PlacesServiceStatus {
        OK,
        ZERO_RESULTS,
        OVER_QUERY_LIMIT,
        REQUEST_DENIED,
        INVALID_REQUEST,
        UNKNOWN_ERROR,
        NOT_FOUND
      }
    }
  }
}

export {}; 