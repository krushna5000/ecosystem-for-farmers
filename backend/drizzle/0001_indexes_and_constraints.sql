-- 0001: foreign-key indexes, OTP/verify-token lookups, GIN indexes for array columns,
--       soft-delete-aware unique indexes, per-company brand names, and CHECK constraints.
--
-- * CHECK constraints are added NOT VALID: they are enforced for every new/updated row, but
--   existing rows are not scanned, so legacy data cannot make this migration fail. Once you have
--   confirmed the data is clean, run (per constraint):
--     ALTER TABLE <schema>.<table> VALIDATE CONSTRAINT <name>;
-- * company_schema.companies / vendor_schema.vendors: the plain UNIQUE constraints on gst_no / email /
--   phone become partial unique indexes (WHERE is_delete IS NOT TRUE), so a soft-deleted account no
--   longer blocks re-registration with the same details.
-- * company_schema.brands: brand_name was globally UNIQUE; it is now unique per company.
-- * Drizzle runs migrations inside a transaction, so indexes are built without CONCURRENTLY
--   (a short write lock per table). Fine at current size; for very large tables create them by hand.

ALTER TABLE "company_schema"."companies" DROP CONSTRAINT "companies_gst_no_unique";--> statement-breakpoint
ALTER TABLE "company_schema"."companies" DROP CONSTRAINT "companies_email_unique";--> statement-breakpoint
ALTER TABLE "company_schema"."companies" DROP CONSTRAINT "companies_phone_unique";--> statement-breakpoint
ALTER TABLE "company_schema"."brands" DROP CONSTRAINT "brands_brand_name_unique";--> statement-breakpoint
ALTER TABLE "vendor_schema"."vendors" DROP CONSTRAINT "vendors_email_unique";--> statement-breakpoint
ALTER TABLE "vendor_schema"."vendors" DROP CONSTRAINT "vendors_phone_unique";--> statement-breakpoint
CREATE INDEX "idx_otp_verifications_phone_number_expires_at" ON "user_schema"."otp_verifications" USING btree ("phone_number","expires_at");--> statement-breakpoint
CREATE INDEX "idx_payments_user_id" ON "user_schema"."payments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_payments_plan_id" ON "user_schema"."payments" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_user_id_status" ON "user_schema"."subscriptions" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "idx_subscriptions_plan_id" ON "user_schema"."subscriptions" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX "idx_yield_batches_user_id" ON "user_schema"."yield_batches" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_crops_category_id" ON "farms_schema"."crops" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_farm_crops_farm_id" ON "farms_schema"."farm_crops" USING btree ("farm_id");--> statement-breakpoint
CREATE INDEX "idx_farm_crops_crop_id" ON "farms_schema"."farm_crops" USING btree ("crop_id");--> statement-breakpoint
CREATE INDEX "idx_farms_user_id" ON "farms_schema"."farms" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_farms_pincode_id" ON "farms_schema"."farms" USING btree ("pincode_id");--> statement-breakpoint
CREATE INDEX "idx_farms_field_id" ON "farms_schema"."farms" USING btree ("field_id");--> statement-breakpoint
CREATE INDEX "idx_cities_district_id" ON "location_schema"."cities" USING btree ("district_id");--> statement-breakpoint
CREATE INDEX "idx_districts_state_id" ON "location_schema"."districts" USING btree ("state_id");--> statement-breakpoint
CREATE INDEX "idx_pincodes_village_id" ON "location_schema"."pincodes" USING btree ("village_id");--> statement-breakpoint
CREATE INDEX "idx_villages_city_id" ON "location_schema"."villages" USING btree ("city_id");--> statement-breakpoint
CREATE INDEX "idx_co_companies_company_type" ON "company_schema"."companies" USING btree ("company_type");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_co_companies_gst_no_active" ON "company_schema"."companies" USING btree ("gst_no") WHERE "company_schema"."companies"."is_delete" IS NOT TRUE;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_co_companies_email_active" ON "company_schema"."companies" USING btree ("email") WHERE "company_schema"."companies"."is_delete" IS NOT TRUE;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_co_companies_phone_active" ON "company_schema"."companies" USING btree ("phone") WHERE "company_schema"."companies"."is_delete" IS NOT TRUE;--> statement-breakpoint
CREATE INDEX "idx_co_companies_verify_token" ON "company_schema"."companies" USING btree ("verify_token") WHERE "company_schema"."companies"."verify_token" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_co_brands_company_brand_name" ON "company_schema"."brands" USING btree ("company_id","brand_name");--> statement-breakpoint
CREATE INDEX "idx_co_categories_company_id" ON "company_schema"."categories" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "idx_co_categories_brand_id" ON "company_schema"."categories" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "idx_co_inventory_company_id" ON "company_schema"."inventory" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "idx_co_inventory_product_id" ON "company_schema"."inventory" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_co_company_otp_company_id" ON "company_schema"."company_otp" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "idx_co_company_otp_verification_company_id" ON "company_schema"."company_otp_verification" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "idx_co_products_company_id" ON "company_schema"."products" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "idx_co_products_brand_id" ON "company_schema"."products" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "idx_co_products_category_id" ON "company_schema"."products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_co_products_sub_category_id" ON "company_schema"."products" USING btree ("sub_category_id");--> statement-breakpoint
CREATE INDEX "idx_co_products_crop_ids_gin" ON "company_schema"."products" USING gin ("crop_ids");--> statement-breakpoint
CREATE INDEX "idx_co_products_disease_names_gin" ON "company_schema"."products" USING gin ("disease_names");--> statement-breakpoint
CREATE INDEX "idx_co_service_locations_company_id" ON "company_schema"."service_locations" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "idx_co_sub_categories_company_id" ON "company_schema"."sub_categories" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "idx_co_sub_categories_brand_id" ON "company_schema"."sub_categories" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "idx_co_sub_categories_category_id" ON "company_schema"."sub_categories" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_co_leads_company_id_status" ON "company_schema"."leads" USING btree ("company_id","status");--> statement-breakpoint
CREATE INDEX "idx_co_leads_product_id" ON "company_schema"."leads" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_co_marketplace_listings_user_id" ON "company_schema"."marketplace_listings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_vd_brands_vendor_id" ON "vendor_schema"."brands" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "idx_vd_categories_vendor_id" ON "vendor_schema"."categories" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "idx_vd_categories_brand_id" ON "vendor_schema"."categories" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "idx_vd_inventory_vendor_id" ON "vendor_schema"."inventory" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "idx_vd_inventory_product_id" ON "vendor_schema"."inventory" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_vd_vendor_otp_vendor_id" ON "vendor_schema"."vendor_otp" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "idx_vd_vendor_otp_email" ON "vendor_schema"."vendor_otp" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_vd_vendor_otp_verification_vendor_id" ON "vendor_schema"."vendor_otp_verification" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "idx_vd_products_vendor_id" ON "vendor_schema"."products" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "idx_vd_products_brand_id" ON "vendor_schema"."products" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "idx_vd_products_category_id" ON "vendor_schema"."products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_vd_products_sub_category_id" ON "vendor_schema"."products" USING btree ("sub_category_id");--> statement-breakpoint
CREATE INDEX "idx_vd_products_crop_ids_gin" ON "vendor_schema"."products" USING gin ("crop_ids");--> statement-breakpoint
CREATE INDEX "idx_vd_service_locations_vendor_id" ON "vendor_schema"."service_locations" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "idx_vd_sub_categories_vendor_id" ON "vendor_schema"."sub_categories" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX "idx_vd_sub_categories_brand_id" ON "vendor_schema"."sub_categories" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "idx_vd_sub_categories_category_id" ON "vendor_schema"."sub_categories" USING btree ("category_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_vd_vendors_email_active" ON "vendor_schema"."vendors" USING btree ("email") WHERE "vendor_schema"."vendors"."is_delete" IS NOT TRUE;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_vd_vendors_phone_active" ON "vendor_schema"."vendors" USING btree ("phone") WHERE "vendor_schema"."vendors"."is_delete" IS NOT TRUE;--> statement-breakpoint
CREATE INDEX "idx_vd_vendors_verify_token" ON "vendor_schema"."vendors" USING btree ("verify_token") WHERE "vendor_schema"."vendors"."verify_token" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "company_schema"."inventory" ADD CONSTRAINT "co_inventory_quantity_check" CHECK ("company_schema"."inventory"."quantity" >= 0) NOT VALID;--> statement-breakpoint
ALTER TABLE "company_schema"."inventory" ADD CONSTRAINT "co_inventory_stock_status_check" CHECK ("company_schema"."inventory"."stock_status" IN ('IN_STOCK', 'OUT_OF_STOCK')) NOT VALID;--> statement-breakpoint
ALTER TABLE "company_schema"."leads" ADD CONSTRAINT "co_leads_status_check" CHECK ("company_schema"."leads"."status" IN ('new', 'contacted', 'converted')) NOT VALID;--> statement-breakpoint
ALTER TABLE "vendor_schema"."inventory" ADD CONSTRAINT "vd_inventory_quantity_check" CHECK ("vendor_schema"."inventory"."quantity" >= 0) NOT VALID;--> statement-breakpoint
ALTER TABLE "vendor_schema"."inventory" ADD CONSTRAINT "vd_inventory_stock_status_check" CHECK ("vendor_schema"."inventory"."stock_status" IN ('IN_STOCK', 'OUT_OF_STOCK')) NOT VALID;