export type ProviderId =
  | "Amadeus"
  | "Sabre"
  | "Travelport"
  | "Indigo"
  | "AirIndia"
  | "MakeMyTrip"
  | "Booking"
  | "Expedia"
  | "Agoda";

export type OfferKind = "flight" | "hotel";

export type FlightOffer = {
  kind: "flight";
  offerId: string;
  provider: ProviderId;
  from: string;
  to: string;
  departDate: string; // YYYY-MM-DD
  airline: string;
  flightNumber: string;
  departTime: string; // HH:mm
  arriveTime: string; // HH:mm
  durationMinutes: number;
  stops: number;
  price: {
    currency: string;
    total: number;
  };
  deepLink?: string;
};

export type HotelOffer = {
  kind: "hotel";
  offerId: string;
  provider: ProviderId;
  city: string;
  hotelName: string;
  rating: number; // 1-5
  nights: number;
  price: {
    currency: string;
    total: number;
  };
  deepLink?: string;
};

export type Offer = FlightOffer | HotelOffer;

export type BookingStatus = "pending" | "confirmed" | "cancelled";

export type Booking = {
  bookingId: string;
  createdAt: string;
  status: BookingStatus;
  passengerName: string;
  email?: string;
  phone?: string;
  mode: "in_platform" | "redirect";
  offer: Offer;
};

export type TrackingPing = {
  id: string;
  timestamp: number;
  lat: number;
  lng: number;
  accuracy?: number;
};

export type TravelPlace = {
  id: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  tags: string[];
};

export type DbData = {
  bookings: Booking[];
  tracking: TrackingPing[];
  places: TravelPlace[];
};
