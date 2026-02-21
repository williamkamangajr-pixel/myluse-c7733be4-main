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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_chat_history: {
        Row: {
          content: string
          created_at: string
          id: string
          metadata: Json | null
          role: string
          session_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role: string
          session_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role?: string
          session_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action_type: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          new_value: Json | null
          old_value: Json | null
          performed_by: string
          user_agent: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_value?: Json | null
          old_value?: Json | null
          performed_by: string
          user_agent?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_value?: Json | null
          old_value?: Json | null
          performed_by?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      bonds: {
        Row: {
          bond_type: string | null
          coupon_rate: number | null
          created_at: string
          credit_rating: string | null
          current_price: number | null
          face_value: number | null
          id: string
          issue_date: string | null
          issuer: string | null
          maturity_date: string | null
          name: string
          payment_frequency: string | null
          ticker: string
          updated_at: string
          yield_to_maturity: number | null
        }
        Insert: {
          bond_type?: string | null
          coupon_rate?: number | null
          created_at?: string
          credit_rating?: string | null
          current_price?: number | null
          face_value?: number | null
          id?: string
          issue_date?: string | null
          issuer?: string | null
          maturity_date?: string | null
          name: string
          payment_frequency?: string | null
          ticker: string
          updated_at?: string
          yield_to_maturity?: number | null
        }
        Update: {
          bond_type?: string | null
          coupon_rate?: number | null
          created_at?: string
          credit_rating?: string | null
          current_price?: number | null
          face_value?: number | null
          id?: string
          issue_date?: string | null
          issuer?: string | null
          maturity_date?: string | null
          name?: string
          payment_frequency?: string | null
          ticker?: string
          updated_at?: string
          yield_to_maturity?: number | null
        }
        Relationships: []
      }
      broker_activity_log: {
        Row: {
          action: string
          broker_id: string | null
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
        }
        Insert: {
          action: string
          broker_id?: string | null
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
        }
        Update: {
          action?: string
          broker_id?: string | null
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "broker_activity_log_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
        ]
      }
      broker_client_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          broker_id: string
          client_session_id: string
          id: string
          is_active: boolean | null
          notes: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          broker_id: string
          client_session_id: string
          id?: string
          is_active?: boolean | null
          notes?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          broker_id?: string
          client_session_id?: string
          id?: string
          is_active?: boolean | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "broker_client_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broker_client_assignments_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
        ]
      }
      broker_order_actions: {
        Row: {
          action_type: string
          biometric_verified: boolean | null
          broker_id: string | null
          created_at: string | null
          id: string
          ip_address: string | null
          new_status: string | null
          order_id: string
          previous_status: string | null
          reason: string | null
        }
        Insert: {
          action_type: string
          biometric_verified?: boolean | null
          broker_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_status?: string | null
          order_id: string
          previous_status?: string | null
          reason?: string | null
        }
        Update: {
          action_type?: string
          biometric_verified?: boolean | null
          broker_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_status?: string | null
          order_id?: string
          previous_status?: string | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "broker_order_actions_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
        ]
      }
      broker_roles: {
        Row: {
          broker_id: string
          granted_at: string | null
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["broker_role"]
        }
        Insert: {
          broker_id: string
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["broker_role"]
        }
        Update: {
          broker_id?: string
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["broker_role"]
        }
        Relationships: [
          {
            foreignKeyName: "broker_roles_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broker_roles_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
        ]
      }
      broker_sessions: {
        Row: {
          broker_id: string
          created_at: string | null
          expires_at: string | null
          id: string
          ip_address: string | null
          is_active: boolean | null
          session_token: string
          user_agent: string | null
        }
        Insert: {
          broker_id: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          session_token: string
          user_agent?: string | null
        }
        Update: {
          broker_id?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          session_token?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "broker_sessions_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
        ]
      }
      broker_settings: {
        Row: {
          broker_id: string
          created_at: string | null
          display_preferences: Json | null
          id: string
          notification_preferences: Json | null
          trading_preferences: Json | null
          updated_at: string | null
        }
        Insert: {
          broker_id: string
          created_at?: string | null
          display_preferences?: Json | null
          id?: string
          notification_preferences?: Json | null
          trading_preferences?: Json | null
          updated_at?: string | null
        }
        Update: {
          broker_id?: string
          created_at?: string | null
          display_preferences?: Json | null
          id?: string
          notification_preferences?: Json | null
          trading_preferences?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "broker_settings_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: true
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
        ]
      }
      brokers: {
        Row: {
          address: string | null
          approved_at: string | null
          approved_by: string | null
          broker_id: string
          broker_name: string
          city: string | null
          company_name: string | null
          country: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean | null
          last_login_at: string | null
          license_expiry_date: string | null
          license_number: string | null
          password_hash: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          approved_at?: string | null
          approved_by?: string | null
          broker_id: string
          broker_name: string
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          license_expiry_date?: string | null
          license_number?: string | null
          password_hash?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          approved_at?: string | null
          approved_by?: string | null
          broker_id?: string
          broker_name?: string
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          license_expiry_date?: string | null
          license_number?: string | null
          password_hash?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      dividend_history: {
        Row: {
          created_at: string
          dividend_per_share: number
          dividend_type: string | null
          ex_dividend_date: string
          id: string
          payment_date: string | null
          record_date: string | null
          stock_ticker: string
        }
        Insert: {
          created_at?: string
          dividend_per_share: number
          dividend_type?: string | null
          ex_dividend_date: string
          id?: string
          payment_date?: string | null
          record_date?: string | null
          stock_ticker: string
        }
        Update: {
          created_at?: string
          dividend_per_share?: number
          dividend_type?: string | null
          ex_dividend_date?: string
          id?: string
          payment_date?: string | null
          record_date?: string | null
          stock_ticker?: string
        }
        Relationships: []
      }
      lasi_history: {
        Row: {
          change: number | null
          change_percent: number | null
          created_at: string
          date: string
          id: string
          value: number
          value_traded: number | null
          volume: number | null
        }
        Insert: {
          change?: number | null
          change_percent?: number | null
          created_at?: string
          date: string
          id?: string
          value: number
          value_traded?: number | null
          volume?: number | null
        }
        Update: {
          change?: number | null
          change_percent?: number | null
          created_at?: string
          date?: string
          id?: string
          value?: number
          value_traded?: number | null
          volume?: number | null
        }
        Relationships: []
      }
      market_alerts: {
        Row: {
          alert_type: string
          broker_id: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_read: boolean | null
          message: string
          severity: string | null
          title: string
        }
        Insert: {
          alert_type: string
          broker_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          severity?: string | null
          title: string
        }
        Update: {
          alert_type?: string
          broker_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          severity?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "market_alerts_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
        ]
      }
      market_halt_recommendations: {
        Row: {
          alert_ids: string[] | null
          created_at: string
          decision_at: string | null
          decision_by: string | null
          decision_notes: string | null
          id: string
          reason: string
          recommendation_type: string
          recommended_by: string
          severity: string
          status: string
        }
        Insert: {
          alert_ids?: string[] | null
          created_at?: string
          decision_at?: string | null
          decision_by?: string | null
          decision_notes?: string | null
          id?: string
          reason: string
          recommendation_type: string
          recommended_by: string
          severity?: string
          status?: string
        }
        Update: {
          alert_ids?: string[] | null
          created_at?: string
          decision_at?: string | null
          decision_by?: string | null
          decision_notes?: string | null
          id?: string
          reason?: string
          recommendation_type?: string
          recommended_by?: string
          severity?: string
          status?: string
        }
        Relationships: []
      }
      market_summary: {
        Row: {
          advancing_stocks: number | null
          created_at: string
          declining_stocks: number | null
          id: string
          index_change: number | null
          index_change_percent: number | null
          index_name: string
          index_value: number
          last_updated: string
          market_status: string | null
          total_value_traded: number | null
          total_volume: number | null
          unchanged_stocks: number | null
        }
        Insert: {
          advancing_stocks?: number | null
          created_at?: string
          declining_stocks?: number | null
          id?: string
          index_change?: number | null
          index_change_percent?: number | null
          index_name?: string
          index_value?: number
          last_updated?: string
          market_status?: string | null
          total_value_traded?: number | null
          total_volume?: number | null
          unchanged_stocks?: number | null
        }
        Update: {
          advancing_stocks?: number | null
          created_at?: string
          declining_stocks?: number | null
          id?: string
          index_change?: number | null
          index_change_percent?: number | null
          index_name?: string
          index_value?: number
          last_updated?: string
          market_status?: string | null
          total_value_traded?: number | null
          total_volume?: number | null
          unchanged_stocks?: number | null
        }
        Relationships: []
      }
      marketplace_audit_log: {
        Row: {
          action_type: string
          broker_id: string | null
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          ip_address: string | null
          new_value: Json | null
          notes: string | null
          old_value: Json | null
          performed_by: string
          performed_by_type: string
        }
        Insert: {
          action_type: string
          broker_id?: string | null
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          ip_address?: string | null
          new_value?: Json | null
          notes?: string | null
          old_value?: Json | null
          performed_by: string
          performed_by_type: string
        }
        Update: {
          action_type?: string
          broker_id?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_value?: Json | null
          notes?: string | null
          old_value?: Json | null
          performed_by?: string
          performed_by_type?: string
        }
        Relationships: []
      }
      marketplace_listings: {
        Row: {
          asking_price: number | null
          created_at: string
          expires_at: string | null
          id: string
          notes: string | null
          price_type: string
          quantity: number
          reserved_shares: number
          sell_id: string
          seller_broker_id: string
          seller_csd_last4: string
          seller_session_id: string
          status: string
          stock_ticker: string
          updated_at: string
        }
        Insert: {
          asking_price?: number | null
          created_at?: string
          expires_at?: string | null
          id?: string
          notes?: string | null
          price_type: string
          quantity: number
          reserved_shares?: number
          sell_id: string
          seller_broker_id: string
          seller_csd_last4: string
          seller_session_id: string
          status?: string
          stock_ticker: string
          updated_at?: string
        }
        Update: {
          asking_price?: number | null
          created_at?: string
          expires_at?: string | null
          id?: string
          notes?: string | null
          price_type?: string
          quantity?: number
          reserved_shares?: number
          sell_id?: string
          seller_broker_id?: string
          seller_csd_last4?: string
          seller_session_id?: string
          status?: string
          stock_ticker?: string
          updated_at?: string
        }
        Relationships: []
      }
      marketplace_offers: {
        Row: {
          buyer_broker_id: string
          buyer_csd_last4: string
          buyer_sell_id: string
          buyer_session_id: string
          created_at: string
          id: string
          listing_id: string
          offer_price: number
          quantity: number
          status: string
          updated_at: string
        }
        Insert: {
          buyer_broker_id: string
          buyer_csd_last4: string
          buyer_sell_id: string
          buyer_session_id: string
          created_at?: string
          id?: string
          listing_id: string
          offer_price: number
          quantity: number
          status?: string
          updated_at?: string
        }
        Update: {
          buyer_broker_id?: string
          buyer_csd_last4?: string
          buyer_sell_id?: string
          buyer_session_id?: string
          created_at?: string
          id?: string
          listing_id?: string
          offer_price?: number
          quantity?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_offers_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_transactions: {
        Row: {
          buyer_broker_approved_at: string | null
          buyer_broker_id: string
          buyer_session_id: string
          completed_at: string | null
          created_at: string
          id: string
          listing_id: string
          offer_id: string | null
          ppt_tax: number
          price_per_share: number
          quantity: number
          seller_broker_approved_at: string | null
          seller_broker_id: string
          seller_receives: number
          seller_session_id: string
          status: string
          stock_ticker: string
          subtotal: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          buyer_broker_approved_at?: string | null
          buyer_broker_id: string
          buyer_session_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          listing_id: string
          offer_id?: string | null
          ppt_tax?: number
          price_per_share: number
          quantity: number
          seller_broker_approved_at?: string | null
          seller_broker_id: string
          seller_receives: number
          seller_session_id: string
          status?: string
          stock_ticker: string
          subtotal: number
          total_amount: number
          updated_at?: string
        }
        Update: {
          buyer_broker_approved_at?: string | null
          buyer_broker_id?: string
          buyer_session_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          listing_id?: string
          offer_id?: string | null
          ppt_tax?: number
          price_per_share?: number
          quantity?: number
          seller_broker_approved_at?: string | null
          seller_broker_id?: string
          seller_receives?: number
          seller_session_id?: string
          status?: string
          stock_ticker?: string
          subtotal?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_transactions_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "marketplace_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_transactions_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "marketplace_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          session_id: string
          title: string
          type: string | null
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          session_id: string
          title: string
          type?: string | null
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          session_id?: string
          title?: string
          type?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          broker_fee: number
          broker_id: string
          created_at: string
          executed_at: string | null
          id: string
          luse_fee: number
          notes: string | null
          price_per_share: number
          ptt_fee: number
          sec_fee: number
          session_id: string
          shares: number
          status: string
          stock_name: string
          stock_ticker: string
          subtotal: number
          total_amount: number
          total_fees: number
          trade_type: string
          updated_at: string
        }
        Insert: {
          broker_fee?: number
          broker_id: string
          created_at?: string
          executed_at?: string | null
          id?: string
          luse_fee?: number
          notes?: string | null
          price_per_share: number
          ptt_fee?: number
          sec_fee?: number
          session_id: string
          shares: number
          status?: string
          stock_name: string
          stock_ticker: string
          subtotal: number
          total_amount: number
          total_fees?: number
          trade_type: string
          updated_at?: string
        }
        Update: {
          broker_fee?: number
          broker_id?: string
          created_at?: string
          executed_at?: string | null
          id?: string
          luse_fee?: number
          notes?: string | null
          price_per_share?: number
          ptt_fee?: number
          sec_fee?: number
          session_id?: string
          shares?: number
          status?: string
          stock_name?: string
          stock_ticker?: string
          subtotal?: number
          total_amount?: number
          total_fees?: number
          trade_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      portfolio_bond_holdings: {
        Row: {
          bond_ticker: string
          created_at: string
          id: string
          portfolio_id: string
          purchase_date: string
          purchase_price: number
          units: number
          updated_at: string
        }
        Insert: {
          bond_ticker: string
          created_at?: string
          id?: string
          portfolio_id: string
          purchase_date?: string
          purchase_price: number
          units?: number
          updated_at?: string
        }
        Update: {
          bond_ticker?: string
          created_at?: string
          id?: string
          portfolio_id?: string
          purchase_date?: string
          purchase_price?: number
          units?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_bond_holdings_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_holdings: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          portfolio_id: string
          purchase_date: string
          purchase_price: number
          shares_owned: number
          status: string
          stock_ticker: string
          trade_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          portfolio_id: string
          purchase_date?: string
          purchase_price: number
          shares_owned?: number
          status?: string
          stock_ticker: string
          trade_type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          portfolio_id?: string
          purchase_date?: string
          purchase_price?: number
          shares_owned?: number
          status?: string
          stock_ticker?: string
          trade_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_holdings_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_snapshots: {
        Row: {
          created_at: string
          daily_change: number | null
          daily_change_percent: number | null
          date: string
          id: string
          portfolio_id: string
          total_value: number
        }
        Insert: {
          created_at?: string
          daily_change?: number | null
          daily_change_percent?: number | null
          date: string
          id?: string
          portfolio_id: string
          total_value: number
        }
        Update: {
          created_at?: string
          daily_change?: number | null
          daily_change_percent?: number | null
          date?: string
          id?: string
          portfolio_id?: string
          total_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_snapshots_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolios: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_default: boolean | null
          name: string
          session_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          session_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          session_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      price_alerts: {
        Row: {
          created_at: string
          direction: string
          id: string
          is_active: boolean | null
          is_triggered: boolean | null
          session_id: string
          stock_ticker: string
          target_price: number
          triggered_at: string | null
        }
        Insert: {
          created_at?: string
          direction?: string
          id?: string
          is_active?: boolean | null
          is_triggered?: boolean | null
          session_id: string
          stock_ticker: string
          target_price: number
          triggered_at?: string | null
        }
        Update: {
          created_at?: string
          direction?: string
          id?: string
          is_active?: boolean | null
          is_triggered?: boolean | null
          session_id?: string
          stock_ticker?: string
          target_price?: number
          triggered_at?: string | null
        }
        Relationships: []
      }
      price_history: {
        Row: {
          close_price: number
          created_at: string
          date: string
          high_price: number | null
          id: string
          low_price: number | null
          open_price: number | null
          stock_id: string
          value_traded: number | null
          volume: number | null
        }
        Insert: {
          close_price: number
          created_at?: string
          date: string
          high_price?: number | null
          id?: string
          low_price?: number | null
          open_price?: number | null
          stock_id: string
          value_traded?: number | null
          volume?: number | null
        }
        Update: {
          close_price?: number
          created_at?: string
          date?: string
          high_price?: number | null
          id?: string
          low_price?: number | null
          open_price?: number | null
          stock_id?: string
          value_traded?: number | null
          volume?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "price_history_stock_id_fkey"
            columns: ["stock_id"]
            isOneToOne: false
            referencedRelation: "stocks"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_trade_summaries: {
        Row: {
          closing_price: number | null
          created_at: string
          date: string
          high_price: number | null
          id: string
          low_price: number | null
          opening_price: number | null
          stock_ticker: string
          trades_count: number | null
          value_traded: number | null
          volume_traded: number | null
        }
        Insert: {
          closing_price?: number | null
          created_at?: string
          date: string
          high_price?: number | null
          id?: string
          low_price?: number | null
          opening_price?: number | null
          stock_ticker: string
          trades_count?: number | null
          value_traded?: number | null
          volume_traded?: number | null
        }
        Update: {
          closing_price?: number | null
          created_at?: string
          date?: string
          high_price?: number | null
          id?: string
          low_price?: number | null
          opening_price?: number | null
          stock_ticker?: string
          trades_count?: number | null
          value_traded?: number | null
          volume_traded?: number | null
        }
        Relationships: []
      }
      stocks: {
        Row: {
          change: number | null
          change_percent: number | null
          created_at: string
          current_price: number
          description: string | null
          dividend_yield: number | null
          employees: number | null
          eps: number | null
          founded_year: number | null
          headquarters: string | null
          high_52w: number | null
          id: string
          logo_url: string | null
          low_52w: number | null
          market_cap: number | null
          name: string
          pe_ratio: number | null
          previous_close: number | null
          sector: string | null
          ticker: string
          updated_at: string
          volume: number | null
          website: string | null
        }
        Insert: {
          change?: number | null
          change_percent?: number | null
          created_at?: string
          current_price?: number
          description?: string | null
          dividend_yield?: number | null
          employees?: number | null
          eps?: number | null
          founded_year?: number | null
          headquarters?: string | null
          high_52w?: number | null
          id?: string
          logo_url?: string | null
          low_52w?: number | null
          market_cap?: number | null
          name: string
          pe_ratio?: number | null
          previous_close?: number | null
          sector?: string | null
          ticker: string
          updated_at?: string
          volume?: number | null
          website?: string | null
        }
        Update: {
          change?: number | null
          change_percent?: number | null
          created_at?: string
          current_price?: number
          description?: string | null
          dividend_yield?: number | null
          employees?: number | null
          eps?: number | null
          founded_year?: number | null
          headquarters?: string | null
          high_52w?: number | null
          id?: string
          logo_url?: string | null
          low_52w?: number | null
          market_cap?: number | null
          name?: string
          pe_ratio?: number | null
          previous_close?: number | null
          sector?: string | null
          ticker?: string
          updated_at?: string
          volume?: number | null
          website?: string | null
        }
        Relationships: []
      }
      surveillance_alert_actions: {
        Row: {
          action_type: string
          alert_id: string
          created_at: string
          id: string
          metadata: Json | null
          new_status: string | null
          notes: string | null
          performed_by: string
          previous_status: string | null
        }
        Insert: {
          action_type: string
          alert_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          new_status?: string | null
          notes?: string | null
          performed_by: string
          previous_status?: string | null
        }
        Update: {
          action_type?: string
          alert_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          new_status?: string | null
          notes?: string | null
          performed_by?: string
          previous_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "surveillance_alert_actions_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "surveillance_alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      surveillance_alerts: {
        Row: {
          alert_type: string
          assigned_to: string | null
          created_at: string
          description: string | null
          event_id: string | null
          id: string
          metadata: Json | null
          priority: number | null
          severity: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          alert_type: string
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          event_id?: string | null
          id?: string
          metadata?: Json | null
          priority?: number | null
          severity?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          alert_type?: string
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          event_id?: string | null
          id?: string
          metadata?: Json | null
          priority?: number | null
          severity?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "surveillance_alerts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "surveillance_events"
            referencedColumns: ["id"]
          },
        ]
      }
      surveillance_events: {
        Row: {
          created_at: string
          detected_at: string
          entity_id: string
          entity_type: string
          event_data: Json
          event_type: string
          id: string
          rule_id: string | null
          severity: string
        }
        Insert: {
          created_at?: string
          detected_at?: string
          entity_id: string
          entity_type: string
          event_data?: Json
          event_type: string
          id?: string
          rule_id?: string | null
          severity?: string
        }
        Update: {
          created_at?: string
          detected_at?: string
          entity_id?: string
          entity_type?: string
          event_data?: Json
          event_type?: string
          id?: string
          rule_id?: string | null
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "surveillance_events_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "surveillance_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      surveillance_rules: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          parameters: Json
          rule_code: string
          rule_name: string
          rule_type: string
          severity: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          parameters?: Json
          rule_code: string
          rule_name: string
          rule_type: string
          severity?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          parameters?: Json
          rule_code?: string
          rule_name?: string
          rule_type?: string
          severity?: string
          updated_at?: string
        }
        Relationships: []
      }
      surveillance_snapshots: {
        Row: {
          alerts_created: number | null
          anomalies_detected: number | null
          created_at: string
          id: string
          metrics: Json | null
          snapshot_data: Json
          snapshot_type: string
        }
        Insert: {
          alerts_created?: number | null
          anomalies_detected?: number | null
          created_at?: string
          id?: string
          metrics?: Json | null
          snapshot_data?: Json
          snapshot_type: string
        }
        Update: {
          alerts_created?: number | null
          anomalies_detected?: number | null
          created_at?: string
          id?: string
          metrics?: Json | null
          snapshot_data?: Json
          snapshot_type?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          last_modified_by: string | null
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          last_modified_by?: string | null
          setting_key: string
          setting_value?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          last_modified_by?: string | null
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      user_passkeys: {
        Row: {
          backed_up: boolean | null
          counter: number
          created_at: string
          credential_id: string
          device_type: string | null
          id: string
          last_used_at: string | null
          public_key: string
          transports: string[] | null
          user_id: string
        }
        Insert: {
          backed_up?: boolean | null
          counter?: number
          created_at?: string
          credential_id: string
          device_type?: string | null
          id?: string
          last_used_at?: string | null
          public_key: string
          transports?: string[] | null
          user_id: string
        }
        Update: {
          backed_up?: boolean | null
          counter?: number
          created_at?: string
          credential_id?: string
          device_type?: string | null
          id?: string
          last_used_at?: string | null
          public_key?: string
          transports?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string
          csd_number: string | null
          email: string | null
          full_name: string | null
          id: string
          kyc_verified: boolean | null
          kyc_verified_at: string | null
          kyc_verified_by: string | null
          mobile_money_number: string | null
          mobile_money_provider: string | null
          notification_preferences: Json | null
          passcode: string | null
          selected_broker_id: string | null
          session_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          csd_number?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          kyc_verified?: boolean | null
          kyc_verified_at?: string | null
          kyc_verified_by?: string | null
          mobile_money_number?: string | null
          mobile_money_provider?: string | null
          notification_preferences?: Json | null
          passcode?: string | null
          selected_broker_id?: string | null
          session_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          csd_number?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          kyc_verified?: boolean | null
          kyc_verified_at?: string | null
          kyc_verified_by?: string | null
          mobile_money_number?: string | null
          mobile_money_provider?: string | null
          notification_preferences?: Json | null
          passcode?: string | null
          selected_broker_id?: string | null
          session_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          payment_method: string | null
          reference: string | null
          status: string
          type: string
          wallet_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          payment_method?: string | null
          reference?: string | null
          status?: string
          type: string
          wallet_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          payment_method?: string | null
          reference?: string | null
          status?: string
          type?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          balance: number
          created_at: string
          currency: string
          id: string
          session_id: string
          updated_at: string
        }
        Insert: {
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          session_id: string
          updated_at?: string
        }
        Update: {
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          session_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      watchlist: {
        Row: {
          added_at: string
          id: string
          session_id: string
          stock_ticker: string
        }
        Insert: {
          added_at?: string
          id?: string
          session_id: string
          stock_ticker: string
        }
        Update: {
          added_at?: string
          id?: string
          session_id?: string
          stock_ticker?: string
        }
        Relationships: []
      }
    }
    Views: {
      platform_liquidity: {
        Row: {
          active_wallets: number | null
          last_updated: string | null
          total_kwacha: number | null
        }
        Relationships: []
      }
      wallet_with_names: {
        Row: {
          balance: number | null
          full_name: string | null
          mobile_money_number: string | null
          session_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      broker_has_role: {
        Args: {
          _broker_id: string
          _role: Database["public"]["Enums"]["broker_role"]
        }
        Returns: boolean
      }
      get_broker_by_email: {
        Args: { _email: string }
        Returns: {
          broker_id: string
          broker_name: string
          email: string
          id: string
          is_active: boolean
          license_number: string
          password_hash: string
        }[]
      }
      get_broker_dashboard_stats: {
        Args: never
        Returns: {
          pending_orders_count: number
          today_orders_count: number
          total_aum: number
          total_clients: number
        }[]
      }
      get_current_broker_id: { Args: never; Returns: string }
      log_broker_order_action: {
        Args: {
          _action_type: string
          _biometric_verified?: boolean
          _broker_id: string
          _new_status?: string
          _order_id: string
          _previous_status?: string
          _reason?: string
        }
        Returns: string
      }
      register_broker: {
        Args: {
          _broker_name: string
          _email: string
          _license_number: string
          _password_hash: string
          _phone?: string
        }
        Returns: string
      }
      revoke_client_kyc: { Args: { _session_id: string }; Returns: boolean }
      update_broker_login: { Args: { _broker_id: string }; Returns: undefined }
      verify_client_kyc: {
        Args: { _session_id: string; _verified_by: string }
        Returns: boolean
      }
      verify_user_pin: {
        Args: { input_pin: string; input_session_id: string }
        Returns: boolean
      }
    }
    Enums: {
      broker_role: "admin" | "senior_broker" | "broker" | "trainee"
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
      broker_role: ["admin", "senior_broker", "broker", "trainee"],
    },
  },
} as const
