
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type TransportType = 'bus' | 'train' | 'ferry' | 'tram' | 'metro' | 'other';
export type FareType = 'standard' | 'concession' | 'student' | 'senior' | 'child' | 'other';
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD' | 'CAD';
export type AnnouncementUrgency = 'info' | 'important' | 'urgent';

export interface Database {
  public: {
    Tables: {
      routes: {
        Row: {
          id: string;
          name: string;
          code?: string;
          description?: string;
          origin: string;
          destination: string;
          transport_type: TransportType;
          featured_image?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code?: string;
          description?: string;
          origin: string;
          destination: string;
          transport_type?: TransportType;
          featured_image?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          description?: string;
          origin?: string;
          destination?: string;
          transport_type?: TransportType;
          featured_image?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      public_holidays: {
        Row: {
          id: string;
          name: string;
          date: string;
          description?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          date: string;
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          date?: string;
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      time_infos: {
        Row: {
          id: string;
          symbol: string;
          description: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          symbol: string;
          description: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          symbol?: string;
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      schedules: {
        Row: {
          id: string;
          route_id: string;
          name: string;
          effective_from?: string;
          effective_until?: string;
          is_weekend_schedule: boolean;
          is_holiday_schedule: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          route_id: string;
          name: string;
          effective_from?: string;
          effective_until?: string;
          is_weekend_schedule?: boolean;
          is_holiday_schedule?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          route_id?: string;
          name?: string;
          effective_from?: string;
          effective_until?: string;
          is_weekend_schedule?: boolean;
          is_holiday_schedule?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      departure_times: {
        Row: {
          id: string;
          schedule_id: string;
          time: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          schedule_id: string;
          time: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          schedule_id?: string;
          time?: string;
          created_at?: string;
        };
      };
      departure_time_infos: {
        Row: {
          id: string;
          departure_time_id: string;
          time_info_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          departure_time_id: string;
          time_info_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          departure_time_id?: string;
          time_info_id?: string;
          created_at?: string;
        };
      };
      fares: {
        Row: {
          id: string;
          schedule_id: string;
          name: string;
          fare_type: FareType;
          price: number;
          currency: CurrencyCode;
          description?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          schedule_id: string;
          name: string;
          fare_type?: FareType;
          price: number;
          currency?: CurrencyCode;
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          schedule_id?: string;
          name?: string;
          fare_type?: FareType;
          price?: number;
          currency?: CurrencyCode;
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      departure_time_fares: {
        Row: {
          id: string;
          departure_time_id: string;
          fare_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          departure_time_id: string;
          fare_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          departure_time_id?: string;
          fare_id?: string;
          created_at?: string;
        };
      };
      announcements: {
        Row: {
          id: string;
          title: string;
          content: string;
          route_id?: string;
          urgency: AnnouncementUrgency;
          effective_from?: string;
          effective_until?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          route_id?: string;
          urgency?: AnnouncementUrgency;
          effective_from?: string;
          effective_until?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          route_id?: string;
          urgency?: AnnouncementUrgency;
          effective_from?: string;
          effective_until?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
