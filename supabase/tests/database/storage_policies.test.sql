begin;
select plan(4);
select policies_are('storage','objects',array[
 'avatars_owner_delete','avatars_owner_insert','avatars_owner_select','avatars_owner_update',
 'property_images_admin_delete','property_images_admin_insert','property_images_admin_update',
 'receipts_customer_insert','receipts_customer_select','receipts_owner_delete','receipts_owner_update',
 'room_images_admin_delete','room_images_admin_insert','room_images_admin_update'
]::name[],'expected Storage policies are installed');
select is((select public from storage.buckets where id='payment-receipts'),false,'payment receipts bucket is private');
select is((select file_size_limit::bigint from storage.buckets where id='payment-receipts'),5242880::bigint,'receipt size is capped at 5 MB');
select is((select public from storage.buckets where id='property-images'),true,'property images are public');
select * from finish();
rollback;
