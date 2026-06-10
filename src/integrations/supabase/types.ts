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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          description: string | null
          id: string
          ip_address: unknown | null
          resource: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          description?: string | null
          id?: string
          ip_address?: unknown | null
          resource: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          description?: string | null
          id?: string
          ip_address?: unknown | null
          resource?: string
          user_id?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          cpf_cnpj: string | null
          created_at: string
          endereco: string | null
          id: string
          nome: string
          possui_whatsapp: boolean | null
          telefone: string
        }
        Insert: {
          cpf_cnpj?: string | null
          created_at?: string
          endereco?: string | null
          id?: string
          nome: string
          possui_whatsapp?: boolean | null
          telefone: string
        }
        Update: {
          cpf_cnpj?: string | null
          created_at?: string
          endereco?: string | null
          id?: string
          nome?: string
          possui_whatsapp?: boolean | null
          telefone?: string
        }
        Relationships: []
      }
      financial_config: {
        Row: {
          crediario_markup: number
          id: string
          pct_dizimo: number
          pct_dono: number
          pct_gastos: number
          pct_vendedor: number
          retirada_markup: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          crediario_markup?: number
          id?: string
          pct_dizimo?: number
          pct_dono?: number
          pct_gastos?: number
          pct_vendedor?: number
          retirada_markup?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          crediario_markup?: number
          id?: string
          pct_dizimo?: number
          pct_dono?: number
          pct_gastos?: number
          pct_vendedor?: number
          retirada_markup?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      installments: {
        Row: {
          created_at: string
          due_date: string
          id: string
          numero_parcela: number | null
          paid_amount: number
          paid_at: string | null
          sale_id: string
          status: string
          total_parcelas: number | null
          valor: number
        }
        Insert: {
          created_at?: string
          due_date: string
          id?: string
          numero_parcela?: number | null
          paid_amount?: number
          paid_at?: string | null
          sale_id: string
          status?: string
          total_parcelas?: number | null
          valor: number
        }
        Update: {
          created_at?: string
          due_date?: string
          id?: string
          numero_parcela?: number | null
          paid_amount?: number
          paid_at?: string | null
          sale_id?: string
          status?: string
          total_parcelas?: number | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "installments_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      partial_payments: {
        Row: {
          client_id: string
          created_at: string
          created_by: string | null
          data_pagamento: string
          id: string
          observacoes: string | null
          sale_id: string | null
          valor_pago: number
        }
        Insert: {
          client_id: string
          created_at?: string
          created_by?: string | null
          data_pagamento?: string
          id?: string
          observacoes?: string | null
          sale_id?: string | null
          valor_pago: number
        }
        Update: {
          client_id?: string
          created_at?: string
          created_by?: string | null
          data_pagamento?: string
          id?: string
          observacoes?: string | null
          sale_id?: string | null
          valor_pago?: number
        }
        Relationships: [
          {
            foreignKeyName: "partial_payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partial_payments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partial_payments_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          categoria: string | null
          created_at: string
          descricao: string | null
          estoque: number
          id: string
          nome: string
          preco_custo: number
          preco_venda_crediario: number
          preco_venda_retirada: number
          sku: string | null
        }
        Insert: {
          categoria?: string | null
          created_at?: string
          descricao?: string | null
          estoque?: number
          id?: string
          nome: string
          preco_custo: number
          preco_venda_crediario: number
          preco_venda_retirada: number
          sku?: string | null
        }
        Update: {
          categoria?: string | null
          created_at?: string
          descricao?: string | null
          estoque?: number
          id?: string
          nome?: string
          preco_custo?: number
          preco_venda_crediario?: number
          preco_venda_retirada?: number
          sku?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          cpf_cnpj: string | null
          created_at: string
          email: string
          id: string
          nome: string
          role: string
          telefone: string | null
        }
        Insert: {
          cpf_cnpj?: string | null
          created_at?: string
          email: string
          id: string
          nome: string
          role: string
          telefone?: string | null
        }
        Update: {
          cpf_cnpj?: string | null
          created_at?: string
          email?: string
          id?: string
          nome?: string
          role?: string
          telefone?: string | null
        }
        Relationships: []
      }
      sales: {
        Row: {
          client_id: string
          created_at: string
          id: string
          lucro_dono: number
          lucro_total: number
          lucro_vendedor: number
          preco_custo: number
          preco_venda: number
          product_id: string
          quantidade: number
          referencia_mensal: string | null
          reserva_dizimo: number
          reserva_gastos: number
          saldo_livre: number
          status: string
          tipo_venda: string
          vendedor_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          lucro_dono: number
          lucro_total: number
          lucro_vendedor: number
          preco_custo: number
          preco_venda: number
          product_id: string
          quantidade?: number
          referencia_mensal?: string | null
          reserva_dizimo: number
          reserva_gastos: number
          saldo_livre: number
          status?: string
          tipo_venda: string
          vendedor_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          lucro_dono?: number
          lucro_total?: number
          lucro_vendedor?: number
          preco_custo?: number
          preco_venda?: number
          product_id?: string
          quantidade?: number
          referencia_mensal?: string | null
          reserva_dizimo?: number
          reserva_gastos?: number
          saldo_livre?: number
          status?: string
          tipo_venda?: string
          vendedor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string | null
          password_hash: string | null
          role: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name?: string | null
          password_hash?: string | null
          role?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          password_hash?: string | null
          role?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_profit_distribution: {
        Args: { preco_custo: number; preco_venda: number }
        Returns: {
          lucro_dono: number
          lucro_total: number
          lucro_vendedor: number
          reserva_dizimo: number
          reserva_gastos: number
          saldo_livre: number
        }[]
      }
      calculate_sale_prices: {
        Args: { custo: number }
        Returns: {
          preco_crediario: number
          preco_retirada: number
        }[]
      }
      clear_all_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
