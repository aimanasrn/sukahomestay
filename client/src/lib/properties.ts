import { supabase } from "./supabase";
import type { Property } from "./types";

const select = `*, property_images(*), property_amenities(amenities(*)), rooms(*, room_images(*), room_amenities(amenities(*)))`;
function publicUrl(bucket: "property-images"|"room-images", path:string){ return /^(https?:|\/)/.test(path) ? path : supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl; }
function map(row:any):Property { return {
  id:row.id,name:row.name,slug:row.slug,description:row.description,address:row.address,city:row.city,state:row.state,
  maxGuests:row.max_guests,bedrooms:row.bedrooms,bathrooms:row.bathrooms,basePriceSen:row.base_price_sen,cleaningFeeSen:row.cleaning_fee_sen,securityDepositSen:row.security_deposit_sen,
  checkInTime:row.check_in_time,checkOutTime:row.check_out_time,houseRules:row.house_rules,cancellationPolicy:row.cancellation_policy,
  images:(row.property_images??[]).sort((a:any,b:any)=>a.sort_order-b.sort_order).map((i:any)=>({id:i.id,url:publicUrl("property-images",i.storage_path),alt:i.alt})),
  amenities:(row.property_amenities??[]).map((a:any)=>({amenity:a.amenities})),
  rooms:(row.rooms??[]).filter((r:any)=>r.active).map((r:any)=>({id:r.id,name:r.name,roomType:r.room_type,capacity:r.capacity,bedConfig:r.bed_config,priceSen:r.price_sen,images:(r.room_images??[]).map((i:any)=>({id:i.id,url:publicUrl("room-images",i.storage_path),alt:i.alt}))})),
}; }
export async function publishedProperties(){const {data,error}=await supabase.from("properties").select(select).eq("status","PUBLISHED").order("created_at");if(error)throw error;return(data??[]).map(map);}
export async function publishedProperty(slug:string){const {data,error}=await supabase.from("properties").select(select).eq("slug",slug).eq("status","PUBLISHED").single();if(error)throw error;return map(data);}
