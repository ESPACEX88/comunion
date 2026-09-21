export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      check_ins: {
        Row: {
          checked_on: string;
          created_at: string;
          duo_id: string | null;
          id: string;
          mood: string;
          note: string | null;
          user_id: string;
        };
        Insert: {
          checked_on?: string;
          created_at?: string;
          duo_id?: string | null;
          id?: string;
          mood: string;
          note?: string | null;
          user_id: string;
        };
        Update: {
          checked_on?: string;
          duo_id?: string | null;
          mood?: string;
          note?: string | null;
        };
        Relationships: [];
      };
      duo_members: {
        Row: { duo_id: string; joined_at: string; role: string; user_id: string };
        Insert: { duo_id: string; joined_at?: string; role?: string; user_id: string };
        Update: { role?: string };
        Relationships: [];
      };
      duos: {
        Row: {
          created_at: string;
          created_by: string;
          id: string;
          invite_code: string;
          name: string;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          id?: string;
          invite_code: string;
          name?: string;
        };
        Update: { name?: string };
        Relationships: [];
      };
      heart_verses: {
        Row: {
          author_id: string;
          created_at: string;
          duo_id: string;
          id: string;
          note: string | null;
          reference: string;
          text: string;
        };
        Insert: {
          author_id: string;
          created_at?: string;
          duo_id: string;
          id?: string;
          note?: string | null;
          reference: string;
          text: string;
        };
        Update: { note?: string | null; reference?: string; text?: string };
        Relationships: [];
      };
      plan_answers: {
        Row: {
          answer: string;
          created_at: string;
          day_number: number;
          id: string;
          plan_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          answer: string;
          created_at?: string;
          day_number: number;
          id?: string;
          plan_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: { answer?: string; updated_at?: string };
        Relationships: [];
      };
      plan_completions: {
        Row: {
          completed_on: string;
          created_at: string;
          day_number: number;
          id: string;
          plan_id: string;
          used_grace: boolean;
          user_id: string;
        };
        Insert: {
          completed_on?: string;
          created_at?: string;
          day_number: number;
          id?: string;
          plan_id: string;
          used_grace?: boolean;
          user_id: string;
        };
        Update: { completed_on?: string; used_grace?: boolean };
        Relationships: [];
      };
      plan_days: {
        Row: {
          day_number: number;
          id: string;
          plan_id: string;
          prompt: string | null;
          scripture_ref: string;
        };
        Insert: {
          day_number: number;
          id?: string;
          plan_id: string;
          prompt?: string | null;
          scripture_ref: string;
        };
        Update: { prompt?: string | null; scripture_ref?: string };
        Relationships: [];
      };
      plans: {
        Row: {
          created_at: string;
          days: number;
          description: string | null;
          duo_id: string;
          grace_days_per_week: number;
          id: string;
          is_active: boolean;
          starts_on: string;
          title: string;
        };
        Insert: {
          created_at?: string;
          days: number;
          description?: string | null;
          duo_id: string;
          grace_days_per_week?: number;
          id?: string;
          is_active?: boolean;
          starts_on?: string;
          title: string;
        };
        Update: { is_active?: boolean; title?: string };
        Relationships: [];
      };
      prayers: {
        Row: {
          author_id: string;
          body: string;
          created_at: string;
          duo_id: string;
          for_partner: boolean;
          id: string;
          is_answered: boolean;
        };
        Insert: {
          author_id: string;
          body: string;
          created_at?: string;
          duo_id: string;
          for_partner?: boolean;
          id?: string;
          is_answered?: boolean;
        };
        Update: { is_answered?: boolean; body?: string };
        Relationships: [];
      };
      journal_entries: {
        Row: {
          id: string;
          user_id: string;
          entry_on: string;
          title: string | null;
          body: string;
          mood: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          entry_on?: string;
          title?: string | null;
          body: string;
          mood?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          entry_on?: string;
          title?: string | null;
          body?: string;
          mood?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      personal_plans: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          days: number;
          starts_on: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          days: number;
          starts_on?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: { title?: string; is_active?: boolean };
        Relationships: [];
      };
      personal_plan_days: {
        Row: {
          id: string;
          plan_id: string;
          day_number: number;
          scripture_ref: string;
          prompt: string | null;
        };
        Insert: {
          id?: string;
          plan_id: string;
          day_number: number;
          scripture_ref: string;
          prompt?: string | null;
        };
        Update: { scripture_ref?: string; prompt?: string | null };
        Relationships: [];
      };
      personal_completions: {
        Row: {
          id: string;
          plan_id: string;
          user_id: string;
          day_number: number;
          completed_on: string;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          plan_id: string;
          user_id: string;
          day_number: number;
          completed_on?: string;
          note?: string | null;
          created_at?: string;
        };
        Update: { completed_on?: string; note?: string | null };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          display_name: string;
          id: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          display_name: string;
          id: string;
          updated_at?: string;
        };
        Update: { avatar_url?: string | null; display_name?: string; updated_at?: string };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_duo: {
        Args: { p_name?: string };
        Returns: Database['public']['Tables']['duos']['Row'];
      };
      join_duo: {
        Args: { p_code: string };
        Returns: Database['public']['Tables']['duos']['Row'];
      };
      is_duo_member: { Args: { p_duo_id: string }; Returns: boolean };
      ensure_personal_salmos_plan: {
        Args: Record<string, never>;
        Returns: Database['public']['Tables']['personal_plans']['Row'];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
