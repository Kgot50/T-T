import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          phone: string | null;
          guardian_mode: boolean;
          accessibility_settings: {
            highContrast: boolean;
            textToSpeech: boolean;
            speechToText: boolean;
            colorBlindMode: 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';
          };
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          phone?: string | null;
          guardian_mode?: boolean;
          accessibility_settings?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          phone?: string | null;
          guardian_mode?: boolean;
          accessibility_settings?: any;
          updated_at?: string;
        };
      };
      emergency_contacts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          phone: string;
          relationship: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          phone: string;
          relationship: string;
          created_at?: string;
        };
        Update: {
          name?: string;
          phone?: string;
          relationship?: string;
        };
      };
      incidents: {
        Row: {
          id: string;
          location: { lat: number; lng: number };
          type: 'danger' | 'warning' | 'info';
          description: string;
          reported_by_id: string | null;
          reported_by_name: string;
          anonymous: boolean;
          verified: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          location: { lat: number; lng: number };
          type: 'danger' | 'warning' | 'info';
          description: string;
          reported_by_id?: string | null;
          reported_by_name: string;
          anonymous?: boolean;
          verified?: boolean;
          created_at?: string;
        };
        Update: {
          verified?: boolean;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          user_id: string;
          user_name: string;
          message: string;
          type: 'message' | 'incident' | 'alert';
          channel: 'general' | 'alerts' | 'nearby';
          location: { lat: number; lng: number } | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          user_name: string;
          message: string;
          type?: 'message' | 'incident' | 'alert';
          channel?: 'general' | 'alerts' | 'nearby';
          location?: { lat: number; lng: number } | null;
          created_at?: string;
        };
      };
      safety_zones: {
        Row: {
          id: string;
          location: { lat: number; lng: number };
          type: 'police' | 'hospital' | 'fire' | 'safe_zone';
          name: string;
          radius: number;
          created_at: string;
        };
      };
      sos_alerts: {
        Row: {
          id: string;
          user_id: string;
          location: { lat: number; lng: number };
          status: 'active' | 'cancelled' | 'resolved';
          created_at: string;
          resolved_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          location: { lat: number; lng: number };
          status?: 'active' | 'cancelled' | 'resolved';
          created_at?: string;
          resolved_at?: string | null;
        };
        Update: {
          status?: 'active' | 'cancelled' | 'resolved';
          resolved_at?: string | null;
        };
      };
    };
  };
}
