export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      customer_activities: {
        Row: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          actor_id: string | null
          customer_id: string
          id: string
          metadata: Json
          occurred_at: string
          source_id: string | null
          source_module: string | null
          source_table: string | null
          summary: string | null
        }
        Insert: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          actor_id?: string | null
          customer_id: string
          id?: string
          metadata?: Json
          occurred_at?: string
          source_id?: string | null
          source_module?: string | null
          source_table?: string | null
          summary?: string | null
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["activity_type"]
          actor_id?: string | null
          customer_id?: string
          id?: string
          metadata?: Json
          occurred_at?: string
          source_id?: string | null
          source_module?: string | null
          source_table?: string | null
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_activities_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_activities_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_statistics"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "customer_activities_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_contacts: {
        Row: {
          birthday: string | null
          created_at: string
          created_by: string | null
          customer_id: string
          department: string | null
          email: string | null
          full_name: string
          id: string
          is_primary: boolean
          job_position: string | null
          linkedin_url: string | null
          mobile: string | null
          notes: string | null
          phone: string | null
          preferred_communication:
            | Database["public"]["Enums"]["preferred_communication"]
            | null
          updated_at: string
        }
        Insert: {
          birthday?: string | null
          created_at?: string
          created_by?: string | null
          customer_id: string
          department?: string | null
          email?: string | null
          full_name: string
          id?: string
          is_primary?: boolean
          job_position?: string | null
          linkedin_url?: string | null
          mobile?: string | null
          notes?: string | null
          phone?: string | null
          preferred_communication?:
            | Database["public"]["Enums"]["preferred_communication"]
            | null
          updated_at?: string
        }
        Update: {
          birthday?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string
          department?: string | null
          email?: string | null
          full_name?: string
          id?: string
          is_primary?: boolean
          job_position?: string | null
          linkedin_url?: string | null
          mobile?: string | null
          notes?: string | null
          phone?: string | null
          preferred_communication?:
            | Database["public"]["Enums"]["preferred_communication"]
            | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_contacts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_contacts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_statistics"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "customer_contacts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_note_revisions: {
        Row: {
          body_html: string
          body_text: string
          edited_at: string
          edited_by: string | null
          id: string
          note_id: string
        }
        Insert: {
          body_html: string
          body_text: string
          edited_at?: string
          edited_by?: string | null
          id?: string
          note_id: string
        }
        Update: {
          body_html?: string
          body_text?: string
          edited_at?: string
          edited_by?: string | null
          id?: string
          note_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_note_revisions_edited_by_fkey"
            columns: ["edited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_note_revisions_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "customer_notes"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_notes: {
        Row: {
          attachments: Json
          body_html: string
          body_text: string
          created_at: string
          created_by: string | null
          customer_id: string
          deleted_at: string | null
          id: string
          is_pinned: boolean
          mentions: string[]
          title: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          attachments?: Json
          body_html?: string
          body_text?: string
          created_at?: string
          created_by?: string | null
          customer_id: string
          deleted_at?: string | null
          id?: string
          is_pinned?: boolean
          mentions?: string[]
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          attachments?: Json
          body_html?: string
          body_text?: string
          created_at?: string
          created_by?: string | null
          customer_id?: string
          deleted_at?: string | null
          id?: string
          is_pinned?: boolean
          mentions?: string[]
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_notes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_statistics"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "customer_notes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_notes_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_tag_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          customer_id: string
          tag_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          customer_id: string
          tag_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          customer_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_tag_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_tag_assignments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customer_statistics"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "customer_tag_assignments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_tag_assignments_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "customer_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_tags: {
        Row: {
          color: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_tags_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          assigned_employee_id: string | null
          city: string | null
          company_logo_url: string | null
          company_name: string
          company_type: Database["public"]["Enums"]["customer_type"]
          country: string | null
          created_at: string
          created_by: string | null
          customer_since: string | null
          deleted_at: string | null
          email: string | null
          id: string
          industry: string | null
          internal_notes: string | null
          labels: string[]
          last_contact_at: string | null
          lead_source: Database["public"]["Enums"]["lead_source"] | null
          next_follow_up_at: string | null
          phone: string | null
          postal_code: string | null
          priority: Database["public"]["Enums"]["customer_priority"]
          status: Database["public"]["Enums"]["customer_status"]
          tax_office: string | null
          updated_at: string
          updated_by: string | null
          vat_number: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          assigned_employee_id?: string | null
          city?: string | null
          company_logo_url?: string | null
          company_name: string
          company_type?: Database["public"]["Enums"]["customer_type"]
          country?: string | null
          created_at?: string
          created_by?: string | null
          customer_since?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          internal_notes?: string | null
          labels?: string[]
          last_contact_at?: string | null
          lead_source?: Database["public"]["Enums"]["lead_source"] | null
          next_follow_up_at?: string | null
          phone?: string | null
          postal_code?: string | null
          priority?: Database["public"]["Enums"]["customer_priority"]
          status?: Database["public"]["Enums"]["customer_status"]
          tax_office?: string | null
          updated_at?: string
          updated_by?: string | null
          vat_number?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          assigned_employee_id?: string | null
          city?: string | null
          company_logo_url?: string | null
          company_name?: string
          company_type?: Database["public"]["Enums"]["customer_type"]
          country?: string | null
          created_at?: string
          created_by?: string | null
          customer_since?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          internal_notes?: string | null
          labels?: string[]
          last_contact_at?: string | null
          lead_source?: Database["public"]["Enums"]["lead_source"] | null
          next_follow_up_at?: string | null
          phone?: string | null
          postal_code?: string | null
          priority?: Database["public"]["Enums"]["customer_priority"]
          status?: Database["public"]["Enums"]["customer_status"]
          tax_office?: string | null
          updated_at?: string
          updated_by?: string | null
          vat_number?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_assigned_employee_id_fkey"
            columns: ["assigned_employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          job_title: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          job_title?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          job_title?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      customer_statistics: {
        Row: {
          average_invoice_value: number | null
          contacts_count: number | null
          customer_id: string | null
          customer_since: string | null
          events_count: number | null
          health_score: number | null
          last_activity_at: string | null
          lifetime_revenue: number | null
          notes_count: number | null
          outstanding_balance: number | null
          paid_invoices: number | null
          pending_invoices: number | null
          projects_count: number | null
          tags_count: number | null
        }
        Insert: {
          average_invoice_value?: never
          contacts_count?: never
          customer_id?: string | null
          customer_since?: string | null
          events_count?: never
          health_score?: never
          last_activity_at?: never
          lifetime_revenue?: never
          notes_count?: never
          outstanding_balance?: never
          paid_invoices?: never
          pending_invoices?: never
          projects_count?: never
          tags_count?: never
        }
        Update: {
          average_invoice_value?: never
          contacts_count?: never
          customer_id?: string | null
          customer_since?: string | null
          events_count?: never
          health_score?: never
          last_activity_at?: never
          lifetime_revenue?: never
          notes_count?: never
          outstanding_balance?: never
          paid_invoices?: never
          pending_invoices?: never
          projects_count?: never
          tags_count?: never
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_customer_activity: {
        Args: {
          _customer_id: string
          _metadata?: Json
          _summary: string
          _type: Database["public"]["Enums"]["activity_type"]
        }
        Returns: undefined
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      activity_type:
        | "customer_created"
        | "customer_updated"
        | "status_changed"
        | "priority_changed"
        | "employee_assigned"
        | "note_added"
        | "note_updated"
        | "contact_added"
        | "contact_updated"
        | "contact_removed"
        | "tag_added"
        | "tag_removed"
        | "customer_archived"
        | "customer_restored"
      app_role: "admin" | "manager" | "employee"
      customer_priority: "low" | "medium" | "high" | "critical"
      customer_status:
        | "lead"
        | "prospect"
        | "active"
        | "on_hold"
        | "inactive"
        | "archived"
      customer_type:
        | "company"
        | "agency"
        | "brand"
        | "nonprofit"
        | "public_sector"
        | "individual"
      lead_source:
        | "referral"
        | "website"
        | "inbound_email"
        | "cold_outreach"
        | "social_media"
        | "event"
        | "partner"
        | "advertising"
        | "other"
      preferred_communication:
        | "email"
        | "phone"
        | "mobile"
        | "whatsapp"
        | "in_person"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      activity_type: [
        "customer_created",
        "customer_updated",
        "status_changed",
        "priority_changed",
        "employee_assigned",
        "note_added",
        "note_updated",
        "contact_added",
        "contact_updated",
        "contact_removed",
        "tag_added",
        "tag_removed",
        "customer_archived",
        "customer_restored",
      ],
      app_role: ["admin", "manager", "employee"],
      customer_priority: ["low", "medium", "high", "critical"],
      customer_status: [
        "lead",
        "prospect",
        "active",
        "on_hold",
        "inactive",
        "archived",
      ],
      customer_type: [
        "company",
        "agency",
        "brand",
        "nonprofit",
        "public_sector",
        "individual",
      ],
      lead_source: [
        "referral",
        "website",
        "inbound_email",
        "cold_outreach",
        "social_media",
        "event",
        "partner",
        "advertising",
        "other",
      ],
      preferred_communication: [
        "email",
        "phone",
        "mobile",
        "whatsapp",
        "in_person",
      ],
    },
  },
} as const
