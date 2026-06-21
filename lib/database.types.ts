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
      cambios_servicio: {
        Row: {
          actualizado_en: string
          creado_en: string
          empresa_id: string
          fase: Database["public"]["Enums"]["fase_ccss"] | null
          fecha_entrega_terreno: string | null
          id: string
          nombre: string
          observaciones: string | null
          plazo_dias_habiles: number | null
          proyeccion_uf: number
          proyecto_id: string
          sector: Database["public"]["Enums"]["sector_obra"] | null
          tipo_financiamiento: Database["public"]["Enums"]["tipo_financiamiento"]
          ubicacion: string | null
        }
        Insert: {
          actualizado_en?: string
          creado_en?: string
          empresa_id: string
          fase?: Database["public"]["Enums"]["fase_ccss"] | null
          fecha_entrega_terreno?: string | null
          id?: string
          nombre: string
          observaciones?: string | null
          plazo_dias_habiles?: number | null
          proyeccion_uf?: number
          proyecto_id: string
          sector?: Database["public"]["Enums"]["sector_obra"] | null
          tipo_financiamiento: Database["public"]["Enums"]["tipo_financiamiento"]
          ubicacion?: string | null
        }
        Update: {
          actualizado_en?: string
          creado_en?: string
          empresa_id?: string
          fase?: Database["public"]["Enums"]["fase_ccss"] | null
          fecha_entrega_terreno?: string | null
          id?: string
          nombre?: string
          observaciones?: string | null
          plazo_dias_habiles?: number | null
          proyeccion_uf?: number
          proyecto_id?: string
          sector?: Database["public"]["Enums"]["sector_obra"] | null
          tipo_financiamiento?: Database["public"]["Enums"]["tipo_financiamiento"]
          ubicacion?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cambios_servicio_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cambios_servicio_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "proyectos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cambios_servicio_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "v_kpis_proyecto"
            referencedColumns: ["proyecto_id"]
          },
        ]
      }
      empresas: {
        Row: {
          creado_en: string
          id: string
          nombre: string
          tipo: string | null
        }
        Insert: {
          creado_en?: string
          id?: string
          nombre: string
          tipo?: string | null
        }
        Update: {
          creado_en?: string
          id?: string
          nombre?: string
          tipo?: string | null
        }
        Relationships: []
      }
      estados_pago: {
        Row: {
          creado_en: string
          estado: Database["public"]["Enums"]["estado_ep"]
          factura_url: string | null
          fecha: string | null
          id: string
          monto_uf: number
          numero_ep: number
          orden_compra_id: string
        }
        Insert: {
          creado_en?: string
          estado?: Database["public"]["Enums"]["estado_ep"]
          factura_url?: string | null
          fecha?: string | null
          id?: string
          monto_uf: number
          numero_ep: number
          orden_compra_id: string
        }
        Update: {
          creado_en?: string
          estado?: Database["public"]["Enums"]["estado_ep"]
          factura_url?: string | null
          fecha?: string | null
          id?: string
          monto_uf?: number
          numero_ep?: number
          orden_compra_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "estados_pago_orden_compra_id_fkey"
            columns: ["orden_compra_id"]
            isOneToOne: false
            referencedRelation: "ordenes_compra"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estados_pago_orden_compra_id_fkey"
            columns: ["orden_compra_id"]
            isOneToOne: false
            referencedRelation: "v_oc_resumen"
            referencedColumns: ["id"]
          },
        ]
      }
      hitos: {
        Row: {
          cambio_servicio_id: string | null
          creado_en: string
          descripcion: string
          fecha: string
          id: string
          proyecto_id: string | null
          tipo: string | null
        }
        Insert: {
          cambio_servicio_id?: string | null
          creado_en?: string
          descripcion: string
          fecha: string
          id?: string
          proyecto_id?: string | null
          tipo?: string | null
        }
        Update: {
          cambio_servicio_id?: string | null
          creado_en?: string
          descripcion?: string
          fecha?: string
          id?: string
          proyecto_id?: string | null
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hitos_cambio_servicio_id_fkey"
            columns: ["cambio_servicio_id"]
            isOneToOne: false
            referencedRelation: "cambios_servicio"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hitos_cambio_servicio_id_fkey"
            columns: ["cambio_servicio_id"]
            isOneToOne: false
            referencedRelation: "v_ccss_resumen"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hitos_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "proyectos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hitos_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "v_kpis_proyecto"
            referencedColumns: ["proyecto_id"]
          },
        ]
      }
      ordenes_compra: {
        Row: {
          cambio_servicio_id: string
          creado_en: string
          estado: Database["public"]["Enums"]["estado_oc"]
          fecha_emision: string | null
          id: string
          monto_uf: number
          numero_oc: string
        }
        Insert: {
          cambio_servicio_id: string
          creado_en?: string
          estado?: Database["public"]["Enums"]["estado_oc"]
          fecha_emision?: string | null
          id?: string
          monto_uf: number
          numero_oc: string
        }
        Update: {
          cambio_servicio_id?: string
          creado_en?: string
          estado?: Database["public"]["Enums"]["estado_oc"]
          fecha_emision?: string | null
          id?: string
          monto_uf?: number
          numero_oc?: string
        }
        Relationships: [
          {
            foreignKeyName: "ordenes_compra_cambio_servicio_id_fkey"
            columns: ["cambio_servicio_id"]
            isOneToOne: false
            referencedRelation: "cambios_servicio"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordenes_compra_cambio_servicio_id_fkey"
            columns: ["cambio_servicio_id"]
            isOneToOne: false
            referencedRelation: "v_ccss_resumen"
            referencedColumns: ["id"]
          },
        ]
      }
      perfiles: {
        Row: {
          activo: boolean
          creado_en: string
          id: string
          nombre: string | null
          rol: Database["public"]["Enums"]["rol_usuario"]
        }
        Insert: {
          activo?: boolean
          creado_en?: string
          id: string
          nombre?: string | null
          rol?: Database["public"]["Enums"]["rol_usuario"]
        }
        Update: {
          activo?: boolean
          creado_en?: string
          id?: string
          nombre?: string | null
          rol?: Database["public"]["Enums"]["rol_usuario"]
        }
        Relationships: []
      }
      proyectos: {
        Row: {
          creado_en: string
          ds153_uf: number
          id: string
          moneda: string
          nombre: string
        }
        Insert: {
          creado_en?: string
          ds153_uf?: number
          id?: string
          moneda?: string
          nombre: string
        }
        Update: {
          creado_en?: string
          ds153_uf?: number
          id?: string
          moneda?: string
          nombre?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_ccss_resumen: {
        Row: {
          contratado_uf: number | null
          empresa_id: string | null
          estado: string | null
          facturado_uf: number | null
          fase: Database["public"]["Enums"]["fase_ccss"] | null
          id: string | null
          n_oc: number | null
          nombre: string | null
          observaciones: string | null
          plazo_dias_habiles: number | null
          proyeccion_uf: number | null
          proyecto_id: string | null
          saldo_uf: number | null
          sector: Database["public"]["Enums"]["sector_obra"] | null
          tipo_financiamiento:
            | Database["public"]["Enums"]["tipo_financiamiento"]
            | null
          ubicacion: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cambios_servicio_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cambios_servicio_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "proyectos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cambios_servicio_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "v_kpis_proyecto"
            referencedColumns: ["proyecto_id"]
          },
        ]
      }
      v_kpis_proyecto: {
        Row: {
          brecha_ds153_uf: number | null
          ds153_uf: number | null
          facturado_uf: number | null
          nombre: string | null
          pct_facturado: number | null
          proyeccion_total_uf: number | null
          proyecto_id: string | null
          saldo_uf: number | null
          total_ccss: number | null
          total_contratado_uf: number | null
        }
        Relationships: []
      }
      v_oc_resumen: {
        Row: {
          cambio_servicio_id: string | null
          facturado_uf: number | null
          id: string | null
          monto_uf: number | null
          numero_oc: string | null
          saldo_uf: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ordenes_compra_cambio_servicio_id_fkey"
            columns: ["cambio_servicio_id"]
            isOneToOne: false
            referencedRelation: "cambios_servicio"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordenes_compra_cambio_servicio_id_fkey"
            columns: ["cambio_servicio_id"]
            isOneToOne: false
            referencedRelation: "v_ccss_resumen"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      rol_actual: { Args: never; Returns: string }
    }
    Enums: {
      estado_ep: "pendiente" | "cursado"
      estado_oc: "emitida" | "pagada_parcial" | "pagada_total" | "anulada"
      fase_ccss: "ingenieria" | "construccion"
      rol_usuario: "admin" | "gestor" | "aprobador" | "visualizador"
      sector_obra: "AVN" | "AGV" | "otro"
      tipo_financiamiento: "con_oc" | "proyeccion" | "autofinanciamiento"
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
      estado_ep: ["pendiente", "cursado"],
      estado_oc: ["emitida", "pagada_parcial", "pagada_total", "anulada"],
      fase_ccss: ["ingenieria", "construccion"],
      rol_usuario: ["admin", "gestor", "aprobador", "visualizador"],
      sector_obra: ["AVN", "AGV", "otro"],
      tipo_financiamiento: ["con_oc", "proyeccion", "autofinanciamiento"],
    },
  },
} as const
