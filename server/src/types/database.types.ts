// Generated-compatible Supabase Database type. Regenerate after applying migrations with:
// npm run supabase:types -- --project-id <project-ref>
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
type Rel = { foreignKeyName: string; columns: string[]; isOneToOne: boolean; referencedRelation: string; referencedColumns: string[] };
type Table<Row, Insert = Partial<Row>, Update = Partial<Insert>> = { Row: Row; Insert: Insert; Update: Update; Relationships: Rel[] };

export type Database = {
  public: {
    Tables: {
      profiles: Table<{ id: string; full_name: string; phone: string | null; role: Database["public"]["Enums"]["user_role"]; avatar_path: string | null; created_at: string; updated_at: string }>;
      properties: Table<{ id: string; name: string; slug: string; description: string; address: string; city: string; state: string; latitude: number | null; longitude: number | null; check_in_time: string; check_out_time: string; max_guests: number; bedrooms: number; bathrooms: number; base_price_sen: number; cleaning_fee_sen: number; security_deposit_sen: number; house_rules: string; cancellation_policy: string; status: Database["public"]["Enums"]["property_status"]; created_at: string; updated_at: string }>;
      rooms: Table<{ id: string; property_id: string; name: string; room_type: string; capacity: number; bed_config: string; price_sen: number; available_units: number; active: boolean; created_at: string; updated_at: string }>;
      property_images: Table<{ id: string; property_id: string; storage_path: string; alt: string; sort_order: number; created_at: string }>;
      room_images: Table<{ id: string; room_id: string; storage_path: string; alt: string; sort_order: number; created_at: string }>;
      amenities: Table<{ id: string; name: string; icon: string | null }>;
      property_amenities: Table<{ property_id: string; amenity_id: string }>;
      room_amenities: Table<{ room_id: string; amenity_id: string }>;
      rate_plans: Table<{ id: string; property_id: string; name: string; weekday_price_sen: number; weekend_price_sen: number; public_holiday_price_sen: number | null; extra_guest_fee_sen: number; included_guests: number; minimum_stay: number; maximum_stay: number; active: boolean; created_at: string; updated_at: string }>;
      seasonal_rates: Table<{ id: string; property_id: string; name: string; start_date: string; end_date: string; nightly_price_sen: number }>;
      availability_blocks: Table<{ id: string; property_id: string; room_id: string | null; start_date: string; end_date: string; type: Database["public"]["Enums"]["block_type"]; note: string | null; created_by: string | null; created_at: string }>;
      bookings: Table<{ id: string; booking_reference: string; idempotency_key: string | null; customer_id: string | null; guest_name: string; guest_phone: string; guest_email: string; property_id: string; inventory_type: Database["public"]["Enums"]["inventory_type"]; check_in: string; check_out: string; adult_count: number; child_count: number; special_request: string | null; status: Database["public"]["Enums"]["booking_status"]; subtotal_amount: number; cleaning_fee: number; additional_fee: number; total_amount: number; pending_expires_at: string | null; payment_expires_at: string | null; auto_expiry_disabled: boolean; terms_accepted_at: string; house_rules_accepted_at: string; cancellation_policy_accepted_at: string; privacy_policy_accepted_at: string; approved_by: string | null; approved_at: string | null; rejected_by: string | null; rejected_at: string | null; rejection_reason: string | null; confirmed_by: string | null; confirmed_at: string | null; cancelled_by: string | null; cancelled_at: string | null; cancellation_reason: string | null; internal_notes: string | null; created_at: string; updated_at: string }>;
      booking_items: Table<{ id: string; booking_id: string; property_id: string; room_id: string | null; inventory_type: Database["public"]["Enums"]["inventory_type"]; quantity: number; nightly_rate_sen: number; total_sen: number; created_at: string }>;
      booking_guests: Table<{ id: string; booking_id: string; full_name: string; email: string | null; phone: string | null; is_primary: boolean; created_at: string }>;
      manual_payments: Table<{ id: string; booking_id: string; payment_method: string | null; bank_name: string | null; transaction_reference: string | null; amount_sen: number | null; payment_date: string | null; receipt_path: string | null; internal_notes: string | null; verification_status: Database["public"]["Enums"]["payment_verification_status"]; verified_by: string | null; verified_at: string | null; rejection_reason: string | null; created_at: string; updated_at: string }>;
      refunds: Table<{ id:string; manual_payment_id:string; amount_sen:number; status:Database["public"]["Enums"]["refund_status"]; reason:string|null; created_at:string; updated_at:string }>;
      reviews: Table<{ id: string; customer_id: string; property_id: string; booking_id: string; rating: number; comment: string | null; approved: boolean; created_at: string; updated_at: string }>;
      notifications: Table<{ id: string; customer_id: string | null; booking_id: string | null; type: Database["public"]["Enums"]["notification_type"]; channel: string; subject: string; content: string; read_at: string | null; sent_at: string | null; created_at: string }>;
      audit_logs: Table<{ id: string; actor_id: string | null; action: string; entity_type: string; entity_id: string | null; metadata: Json | null; ip_address: unknown | null; created_at: string }>;
      app_settings: Table<{ id: string; key: string; value: Json; updated_at: string }>;
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: {
      user_role: "CUSTOMER" | "ADMIN";
      property_status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
      booking_status: "PENDING_APPROVAL" | "AWAITING_PAYMENT" | "PAYMENT_SUBMITTED" | "CONFIRMED" | "CHECKED_IN" | "COMPLETED" | "REJECTED" | "CANCELLED" | "EXPIRED";
      inventory_type: "ENTIRE_PROPERTY" | "ROOM";
      block_type: "OWNER_BLOCK" | "MAINTENANCE";
      payment_verification_status: "NOT_SUBMITTED" | "PENDING_VERIFICATION" | "VERIFIED" | "REJECTED";
      refund_status: "PENDING" | "SUCCEEDED" | "FAILED";
      notification_type: "BOOKING_CREATED" | "PAYMENT_RECEIVED" | "BOOKING_CONFIRMED" | "PAYMENT_FAILED" | "BOOKING_CANCELLED" | "CHECKIN_REMINDER" | "CHECKOUT_REMINDER" | "REFUND_PROCESSED";
    };
    CompositeTypes: Record<never, never>;
  };
};
