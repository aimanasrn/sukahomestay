import { supabasePublic } from "../config/supabase.js";
import { ApiError } from "../utils/api-error.js";

const selection = `*, property_images(*), property_amenities(amenities(*)), rooms(*, room_images(*), room_amenities(amenities(*))), rate_plans(*), seasonal_rates(*), reviews(*)`;
function imageUrl(bucket: "property-images" | "room-images", path: string) {
  if (/^(https?:|\/)/.test(path)) return path;
  return supabasePublic.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
function mapProperty(row: any) {
  return {
    ...row, maxGuests: row.max_guests, basePriceSen: row.base_price_sen, checkInTime: row.check_in_time, checkOutTime: row.check_out_time,
    cleaningFeeSen: row.cleaning_fee_sen, securityDepositSen: row.security_deposit_sen,
    houseRules: row.house_rules, cancellationPolicy: row.cancellation_policy,
    images: (row.property_images ?? []).sort((a: any, b: any) => a.sort_order - b.sort_order).map((i: any) => ({ ...i, url: imageUrl("property-images", i.storage_path), sortOrder: i.sort_order })),
    amenities: (row.property_amenities ?? []).map((a: any) => ({ amenity: a.amenities })),
    rooms: (row.rooms ?? []).filter((r: any) => r.active).map((r: any) => ({ ...r, propertyId: r.property_id, roomType: r.room_type, bedConfig: r.bed_config, priceSen: r.price_sen, availableUnits: r.available_units, images: (r.room_images ?? []).map((i: any) => ({ ...i, url: imageUrl("room-images", i.storage_path) })), amenities: (r.room_amenities ?? []).map((a: any) => ({ amenity: a.amenities })) })),
    ratePlans: row.rate_plans ?? [], seasonalRates: row.seasonal_rates ?? [], reviews: row.reviews ?? [],
  };
}
export async function listPublished() {
  const { data, error } = await supabasePublic.from("properties").select(selection).eq("status", "PUBLISHED").order("created_at");
  if (error) throw new ApiError(502, `Unable to load properties: ${error.message}`, "SUPABASE_QUERY_FAILED");
  return (data ?? []).map(mapProperty);
}
export async function bySlug(slug: string) {
  const { data, error } = await supabasePublic.from("properties").select(selection).eq("slug", slug).eq("status", "PUBLISHED").maybeSingle();
  if (error) throw new ApiError(502, `Unable to load property: ${error.message}`, "SUPABASE_QUERY_FAILED");
  return data ? mapProperty(data) : null;
}
