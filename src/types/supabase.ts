
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      routes: {
        Row: {
          id: string
          name: string
          origin: string
          destination: string
          description: string | null
          transport_type: string
          color: string | null
          additional_info: string | null
          featured_image: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          origin: string
          destination: string
          description?: string | null
          transport_type: string
          color?: string | null
          additional_info?: string | null
          featured_image?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          origin?: string
          destination?: string
          description?: string | null
          transport_type?: string
          color?: string | null
          additional_info?: string | null
          featured_image?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      schedules: {
        Row: {
          id: string
          route_id: string
          effective_from: string
          effective_until: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          route_id: string
          effective_from: string
          effective_until?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          route_id?: string
          effective_from?: string
          effective_until?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      schedule_days: {
        Row: {
          id: string
          schedule_id: string
          day_type: string // 'mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun', 'holiday'
          created_at: string
        }
        Insert: {
          id?: string
          schedule_id: string
          day_type: string
          created_at?: string
        }
        Update: {
          id?: string
          schedule_id?: string
          day_type?: string
          created_at?: string
        }
      }
      departure_times: {
        Row: {
          id: string
          schedule_id: string
          time: string
          created_at: string
        }
        Insert: {
          id?: string
          schedule_id: string
          time: string
          created_at?: string
        }
        Update: {
          id?: string
          schedule_id?: string
          time?: string
          created_at?: string
        }
      }
      departure_time_info: {
        Row: {
          id: string
          departure_time_id: string
          time_info_id: string
          created_at: string
        }
        Insert: {
          id?: string
          departure_time_id: string
          time_info_id: string
          created_at?: string
        }
        Update: {
          id?: string
          departure_time_id?: string
          time_info_id?: string
          created_at?: string
        }
      }
      time_infos: {
        Row: {
          id: string
          symbol: string
          description: string
          created_at: string
        }
        Insert: {
          id?: string
          symbol: string
          description: string
          created_at?: string
        }
        Update: {
          id?: string
          symbol?: string
          description?: string
          created_at?: string
        }
      }
      fares: {
        Row: {
          id: string
          name: string
          price: number
          currency: string
          description: string | null
          fare_type: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          price: number
          currency: string
          description?: string | null
          fare_type: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          price?: number
          currency?: string
          description?: string | null
          fare_type?: string
          created_at?: string
        }
      }
      schedule_fares: {
        Row: {
          id: string
          schedule_id: string
          fare_id: string
          created_at: string
        }
        Insert: {
          id?: string
          schedule_id: string
          fare_id: string
          created_at?: string
        }
        Update: {
          id?: string
          schedule_id?: string
          fare_id?: string
          created_at?: string
        }
      }
      departure_time_fares: {
        Row: {
          id: string
          departure_time_id: string
          fare_id: string
          created_at: string
        }
        Insert: {
          id?: string
          departure_time_id: string
          fare_id: string
          created_at?: string
        }
        Update: {
          id?: string
          departure_time_id?: string
          fare_id?: string
          created_at?: string
        }
      }
      public_holidays: {
        Row: {
          id: string
          date: string
          title: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          date: string
          title: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          date?: string
          title?: string
          description?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Insertable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updatable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
