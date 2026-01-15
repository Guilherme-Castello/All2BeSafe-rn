interface Geolocation {
  lat: number;
  lng: number;
}

interface LocationAddressType {
  city: string;
  country: string;
  formatted_address: string;
  title?: string;
  geolocation: Geolocation;
  neighborhood: string;
  number: string;
  placeId: string;
  state: string;
  street: string;
  zipCode: string;
  valid: boolean;
  provided_by?: 'google' | 'foursquare' | 'here';
  isEstabilishment?: boolean;
  source?: 'reverse' | 'select' | 'deeplink';
  date?: Date;
  sequence?: number;
}

export default LocationAddressType;
