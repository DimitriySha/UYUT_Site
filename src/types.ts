export interface Apartment {
  id: string;
  title: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  images: string[];
  beds: number;
  maxGuests: number;
  baths: number;
  sqm: number;
  description: string;
  amenities: string[];
  type: 'Studio' | '1-Bedroom' | '2-Bedroom' | 'Luxury' | string;
  bookedDates: string[]; // ISO format YYYY-MM-DD
  status?: 'active' | 'deleted' | 'inactive';
  bookingsCount?: number;
}

export interface Booking {
  id: string;
  apartmentId: string;
  userId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  user_name?: string;
  user_email?: string;
  apt_title?: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
}
