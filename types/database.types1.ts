export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string | null;
          icon: string | null;
          id: string;
          name: string;
        };
        Insert: {
          created_at?: string | null;
          icon?: string | null;
          id: string;
          name: string;
        };
        Update: {
          created_at?: string | null;
          icon?: string | null;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      category_translations: {
        Row: {
          category_id: string;
          language_code: string;
          name: string;
        };
        Insert: {
          category_id: string;
          language_code: string;
          name: string;
        };
        Update: {
          category_id?: string;
          language_code?: string;
          name?: string;
        };
        Relationships: [
          {
            foreignKeyName: "category_translations_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };
      coupons: {
        Row: {
          code: string;
          created_at: string | null;
          description: string | null;
          discount_amount: number | null;
          discount_percent: number | null;
          enabled: boolean | null;
          expires_at: string | null;
          id: number;
          max_usage: number | null;
          min_order_amount: number | null;
          used_count: number | null;
        };
        Insert: {
          code: string;
          created_at?: string | null;
          description?: string | null;
          discount_amount?: number | null;
          discount_percent?: number | null;
          enabled?: boolean | null;
          expires_at?: string | null;
          id?: number;
          max_usage?: number | null;
          min_order_amount?: number | null;
          used_count?: number | null;
        };
        Update: {
          code?: string;
          created_at?: string | null;
          description?: string | null;
          discount_amount?: number | null;
          discount_percent?: number | null;
          enabled?: boolean | null;
          expires_at?: string | null;
          id?: number;
          max_usage?: number | null;
          min_order_amount?: number | null;
          used_count?: number | null;
        };
        Relationships: [];
      };
      inventory: {
        Row: {
          low_stock_threshold: number | null;
          product_id: number;
          reserved: number | null;
          stock: number;
          updated_at: string | null;
        };
        Insert: {
          low_stock_threshold?: number | null;
          product_id: number;
          reserved?: number | null;
          stock?: number;
          updated_at?: string | null;
        };
        Update: {
          low_stock_threshold?: number | null;
          product_id?: number;
          reserved?: number | null;
          stock?: number;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "inventory_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: true;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      order_items: {
        Row: {
          id: number;
          order_id: number;
          product_id: number;
          quantity: number;
          total_price: number;
          unit: string | null;
          unit_price: number;
        };
        Insert: {
          id?: number;
          order_id: number;
          product_id: number;
          quantity: number;
          total_price: number;
          unit?: string | null;
          unit_price: number;
        };
        Update: {
          id?: number;
          order_id?: number;
          product_id?: number;
          quantity?: number;
          total_price?: number;
          unit?: string | null;
          unit_price?: number;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      orders: {
        Row: {
          coupon_code: string | null;
          created_at: string | null;
          currency: string | null;
          discount: number | null;
          id: number;
          shipping: number | null;
          status: string | null;
          subtotal: number;
          tax: number | null;
          total_price: number;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          coupon_code?: string | null;
          created_at?: string | null;
          currency?: string | null;
          discount?: number | null;
          id?: number;
          shipping?: number | null;
          status?: string | null;
          subtotal: number;
          tax?: number | null;
          total_price: number;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          coupon_code?: string | null;
          created_at?: string | null;
          currency?: string | null;
          discount?: number | null;
          id?: number;
          shipping?: number | null;
          status?: string | null;
          subtotal?: number;
          tax?: number | null;
          total_price?: number;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      product_categories: {
        Row: {
          category_id: string;
          product_id: number;
        };
        Insert: {
          category_id: string;
          product_id: number;
        };
        Update: {
          category_id?: string;
          product_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "product_categories_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_categories_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      product_translations: {
        Row: {
          description: string | null;
          language_code: string;
          name: string;
          product_id: number;
          short_description: string | null;
        };
        Insert: {
          description?: string | null;
          language_code: string;
          name: string;
          product_id: number;
          short_description?: string | null;
        };
        Update: {
          description?: string | null;
          language_code?: string;
          name?: string;
          product_id?: number;
          short_description?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "product_translations_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
      products: {
        Row: {
          coupon_id: number | null;
          created_at: string | null;
          currency: string | null;
          description: string | null;
          id: number;
          images: string[] | null;
          is_active: boolean | null;
          name: string;
          price: number;
          related_products: number[] | null;
          short_description: string | null;
          stock: number | null;
          sustainability_score: number | null;
          unit: string | null;
          updated_at: string | null;
        };
        Insert: {
          coupon_id?: number | null;
          created_at?: string | null;
          currency?: string | null;
          description?: string | null;
          id?: number;
          images?: string[] | null;
          is_active?: boolean | null;
          name: string;
          price: number;
          related_products?: number[] | null;
          short_description?: string | null;
          stock?: number | null;
          sustainability_score?: number | null;
          unit?: string | null;
          updated_at?: string | null;
        };
        Update: {
          coupon_id?: number | null;
          created_at?: string | null;
          currency?: string | null;
          description?: string | null;
          id?: number;
          images?: string[] | null;
          is_active?: boolean | null;
          name?: string;
          price?: number;
          related_products?: number[] | null;
          short_description?: string | null;
          stock?: number | null;
          sustainability_score?: number | null;
          unit?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "products_coupon_id_fkey";
            columns: ["coupon_id"];
            isOneToOne: false;
            referencedRelation: "coupons";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string | null;
          email: string | null;
          id: string;
          name: string;
          phone: string | null;
          role: string | null;
          updated_at: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string | null;
          email?: string | null;
          id: string;
          name: string;
          phone?: string | null;
          role?: string | null;
          updated_at?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string | null;
          email?: string | null;
          id?: string;
          name?: string;
          phone?: string | null;
          role?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          comment: string | null;
          created_at: string | null;
          id: number;
          is_published: boolean | null;
          product_id: number;
          rating: number;
          title: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          comment?: string | null;
          created_at?: string | null;
          id?: number;
          is_published?: boolean | null;
          product_id: number;
          rating: number;
          title?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          comment?: string | null;
          created_at?: string | null;
          id?: number;
          is_published?: boolean | null;
          product_id?: number;
          rating?: number;
          title?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
