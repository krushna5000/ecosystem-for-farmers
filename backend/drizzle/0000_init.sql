CREATE SCHEMA "admins_schema";
--> statement-breakpoint
CREATE SCHEMA "user_schema";
--> statement-breakpoint
CREATE SCHEMA "farms_schema";
--> statement-breakpoint
CREATE SCHEMA "location_schema";
--> statement-breakpoint
CREATE SCHEMA "company_schema";
--> statement-breakpoint
CREATE SCHEMA "vendor_schema";
--> statement-breakpoint
CREATE SCHEMA "website_schema";
--> statement-breakpoint
CREATE TABLE "super_admins" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(150) NOT NULL,
	"password" text NOT NULL,
	"role" varchar(50) NOT NULL,
	CONSTRAINT "super_admins_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "admins_schema"."admins" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(100) NOT NULL,
	"password" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "admins_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "user_schema"."kyc" (
	"kyc_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"aadhaar_no" varchar(12) NOT NULL,
	"registered_phone_no" varchar(20) NOT NULL,
	"kyc_status" varchar(20) DEFAULT 'pending',
	"rejection_reason" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "kyc_aadhaar_no_unique" UNIQUE("aadhaar_no"),
	CONSTRAINT "kyc_kyc_status_check" CHECK ("user_schema"."kyc"."kyc_status" IN ('pending', 'approved', 'rejected'))
);
--> statement-breakpoint
CREATE TABLE "user_schema"."onboarding_data" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"user_name" varchar(255),
	"state_id" integer,
	"district_id" integer,
	"village_id" integer,
	"village_name" varchar(255),
	"land_size_hectares" numeric(10, 2),
	"current_crop_name" varchar(255),
	"sowing_date" varchar(50),
	"crop_stage" varchar(100),
	"crop_stage_image_url" varchar(500),
	"is_completed" boolean DEFAULT false,
	"language" varchar(5),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_schema"."otp_verifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"phone_number" varchar(20) NOT NULL,
	"otp_code" varchar(10) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"is_used" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "user_schema"."payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"plan_id" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"transaction_id" varchar(100) NOT NULL,
	"payment_status" varchar(20) NOT NULL,
	"paid_at" timestamp DEFAULT now(),
	CONSTRAINT "payments_transaction_id_unique" UNIQUE("transaction_id"),
	CONSTRAINT "payments_payment_status_check" CHECK ("user_schema"."payments"."payment_status" IN ('initiated', 'success', 'failed'))
);
--> statement-breakpoint
CREATE TABLE "user_schema"."plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"plan_name" varchar(50) NOT NULL,
	"plan_price" numeric(10, 2) NOT NULL,
	"plan_description" text,
	"duration_days" integer NOT NULL,
	"max_fields" integer,
	"max_area_per_field" integer,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_schema"."subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"plan_id" integer NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"status" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "subscriptions_status_check" CHECK ("user_schema"."subscriptions"."status" IN ('active', 'expired', 'cancelled', 'pending'))
);
--> statement-breakpoint
CREATE TABLE "user_schema"."users" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" varchar(255),
	"phone_number" varchar(20) NOT NULL,
	"is_verified" boolean DEFAULT false,
	"language" varchar(20) DEFAULT 'English',
	"user_type" varchar(10) DEFAULT 'app',
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_phone_number_unique" UNIQUE("phone_number")
);
--> statement-breakpoint
CREATE TABLE "user_schema"."yield_batches" (
	"id" serial PRIMARY KEY NOT NULL,
	"batch_no" varchar(50) NOT NULL,
	"min_yield" numeric(10, 2),
	"max_yield" numeric(10, 2),
	"rate" numeric(10, 2) NOT NULL,
	"validity_days" integer NOT NULL,
	"user_id" integer NOT NULL,
	"status" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "yield_batches_batch_no_unique" UNIQUE("batch_no"),
	CONSTRAINT "yield_batches_status_check" CHECK ("user_schema"."yield_batches"."status" IN ('sold', 'unsold'))
);
--> statement-breakpoint
CREATE TABLE "farms_schema"."crop_categories" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "farms_schema"."crop_categories_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"category_name" varchar(50) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "crop_categories_category_name_unique" UNIQUE("category_name")
);
--> statement-breakpoint
CREATE TABLE "farms_schema"."crop_stages" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "farms_schema"."crop_stages_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"stage_name" varchar(50) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "crop_stages_stage_name_unique" UNIQUE("stage_name")
);
--> statement-breakpoint
CREATE TABLE "farms_schema"."crops" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer NOT NULL,
	"crop_name" varchar(100) NOT NULL,
	"crop_stage_id" jsonb,
	"t_base" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "farms_schema"."farm_crops" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "farms_schema"."farm_crops_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"farm_id" integer NOT NULL,
	"crop_id" integer NOT NULL,
	"current_stage" jsonb,
	"sowing_date" date,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "farms_schema"."farms" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "farms_schema"."farms_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer NOT NULL,
	"farm_name" varchar(100) NOT NULL,
	"field_id" bigint NOT NULL,
	"pincode_id" integer NOT NULL,
	"farm_coordinates" json NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "location_schema"."cities" (
	"city_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "location_schema"."cities_city_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"city_name" varchar(100) NOT NULL,
	"district_id" integer NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "unique_city_per_district" UNIQUE("city_name","district_id")
);
--> statement-breakpoint
CREATE TABLE "location_schema"."districts" (
	"district_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "location_schema"."districts_district_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"district_name" varchar(100) NOT NULL,
	"state_id" integer NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "unique_district_per_state" UNIQUE("district_name","state_id")
);
--> statement-breakpoint
CREATE TABLE "location_schema"."pincodes" (
	"pincode_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "location_schema"."pincodes_pincode_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"pincode" varchar(6) NOT NULL,
	"village_id" integer NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "unique_pincode_per_village" UNIQUE("pincode","village_id")
);
--> statement-breakpoint
CREATE TABLE "location_schema"."states" (
	"state_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "location_schema"."states_state_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"state_name" varchar(100) NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "states_state_name_unique" UNIQUE("state_name")
);
--> statement-breakpoint
CREATE TABLE "location_schema"."villages" (
	"village_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "location_schema"."villages_village_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"village_name" varchar(150) NOT NULL,
	"city_id" integer NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "unique_village_per_city" UNIQUE("village_name","city_id")
);
--> statement-breakpoint
CREATE TABLE "company_schema"."companies" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_type" integer NOT NULL,
	"llp_no" varchar(100),
	"cin_no" varchar(100),
	"name" varchar(200) NOT NULL,
	"address" text NOT NULL,
	"gst_no" varchar(50) NOT NULL,
	"email" varchar(150) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"password" varchar(255),
	"is_active" boolean DEFAULT true,
	"is_approved" boolean DEFAULT false,
	"is_delete" boolean DEFAULT false NOT NULL,
	"verify_token" text,
	"logo_url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "companies_gst_no_unique" UNIQUE("gst_no"),
	CONSTRAINT "companies_email_unique" UNIQUE("email"),
	CONSTRAINT "companies_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "company_schema"."company" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_name" varchar(255) NOT NULL,
	"phone_number" varchar(20) NOT NULL,
	"email" varchar(255),
	"contact_person_name" varchar(255),
	"contact_person_phone" varchar(20),
	"pan_number" varchar(20),
	"business_address" text,
	"approval_status" varchar(20) DEFAULT 'pending',
	"rejection_reason" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "company_phone_number_unique" UNIQUE("phone_number"),
	CONSTRAINT "company_email_unique" UNIQUE("email"),
	CONSTRAINT "company_pan_number_unique" UNIQUE("pan_number"),
	CONSTRAINT "company_approval_status_check" CHECK ("company_schema"."company"."approval_status" IN ('pending', 'approved', 'rejected'))
);
--> statement-breakpoint
CREATE TABLE "company_schema"."brands" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"logo" text,
	"brand_name" varchar(150) NOT NULL,
	"status" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "brands_brand_name_unique" UNIQUE("brand_name")
);
--> statement-breakpoint
CREATE TABLE "company_schema"."categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"brand_id" integer NOT NULL,
	"category_name" varchar(150) NOT NULL,
	"status" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "company_schema"."inventory" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"stock_status" varchar(50) DEFAULT 'IN_STOCK',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "company_schema"."company_otp" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"phone" varchar(20) NOT NULL,
	"otp_code" varchar(10) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company_schema"."company_otp_verification" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"otp_code" varchar(10),
	"is_verified" boolean DEFAULT false,
	"verified_at" timestamp,
	"attempts" integer DEFAULT 0,
	"blocked_until" timestamp,
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company_schema"."products" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"brand_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	"sub_category_id" integer NOT NULL,
	"product_name" varchar(200) NOT NULL,
	"description" text,
	"chemical_composition" jsonb NOT NULL,
	"image" text,
	"status" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"crop_ids" integer[] DEFAULT '{}',
	"disease_names" varchar(255)[] DEFAULT '{}'
);
--> statement-breakpoint
CREATE TABLE "company_schema"."service_locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"state" varchar(100) NOT NULL,
	"city" varchar(100) NOT NULL,
	"pincode" varchar(10) NOT NULL,
	"is_serviceable" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "company_schema"."sub_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"brand_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	"sub_category_name" varchar(150) NOT NULL,
	"status" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "company_schema"."company_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" varchar(100) NOT NULL,
	"description" text,
	CONSTRAINT "company_types_type_unique" UNIQUE("type")
);
--> statement-breakpoint
CREATE TABLE "company_schema"."leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_id" integer NOT NULL,
	"product_id" integer,
	"phone_number" varchar(20),
	"status" varchar(20) DEFAULT 'new',
	"source" varchar(100),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "company_schema"."marketplace_listings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"crop_name" varchar(100) NOT NULL,
	"variety" varchar(100),
	"min_yield" numeric(10, 2),
	"max_yield" numeric(10, 2),
	"desired_rate" numeric(10, 2) NOT NULL,
	"image_url" text,
	"status" varchar(20) DEFAULT 'pending',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "marketplace_listings_status_check" CHECK ("company_schema"."marketplace_listings"."status" IN ('pending', 'deal_done', 'cancelled'))
);
--> statement-breakpoint
CREATE TABLE "vendor_schema"."brands" (
	"id" serial PRIMARY KEY NOT NULL,
	"vendor_id" integer NOT NULL,
	"logo" text,
	"brand_name" varchar(150) NOT NULL,
	"status" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vendor_schema"."categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"vendor_id" integer NOT NULL,
	"brand_id" integer NOT NULL,
	"category_name" varchar(150) NOT NULL,
	"status" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vendor_schema"."inventory" (
	"id" serial PRIMARY KEY NOT NULL,
	"vendor_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"stock_status" varchar(50) DEFAULT 'IN_STOCK',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vendor_schema"."vendor_otp" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "vendor_schema"."vendor_otp_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"vendor_id" integer NOT NULL,
	"email" varchar(150),
	"otp" varchar(10) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "vendor_schema"."vendor_otp_verification" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "vendor_schema"."vendor_otp_verification_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"vendor_id" integer NOT NULL,
	"otp" varchar(10),
	"is_verified" boolean DEFAULT false,
	"verified_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "vendor_schema"."products" (
	"id" serial PRIMARY KEY NOT NULL,
	"vendor_id" integer NOT NULL,
	"brand_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	"sub_category_id" integer NOT NULL,
	"product_name" varchar(200) NOT NULL,
	"description" text,
	"chemical_composition" jsonb NOT NULL,
	"image" text,
	"status" boolean DEFAULT true,
	"crop_ids" integer[] DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vendor_schema"."service_locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"vendor_id" integer NOT NULL,
	"state" varchar(100) NOT NULL,
	"city" varchar(100) NOT NULL,
	"pincode" varchar(10) NOT NULL,
	"is_serviceable" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vendor_schema"."sub_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"vendor_id" integer NOT NULL,
	"brand_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	"sub_category_name" varchar(150) NOT NULL,
	"status" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vendor_schema"."vendors" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "vendor_schema"."vendors_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(150) NOT NULL,
	"email" varchar(150) NOT NULL,
	"password" varchar(100),
	"phone" varchar(20) NOT NULL,
	"shop_act_no" varchar(50),
	"shop_act_pdf" text,
	"gst_no" varchar(50),
	"gst_pdf" text,
	"licence_no" varchar(50),
	"licence_pdf" text,
	"pan_no" varchar(20),
	"pan_pdf" text,
	"is_active" boolean DEFAULT true,
	"is_approve" boolean DEFAULT false,
	"is_delete" boolean DEFAULT false,
	"verify_token" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "vendors_email_unique" UNIQUE("email"),
	CONSTRAINT "vendors_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "website_schema"."blogs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"tags" text[] DEFAULT '{}',
	"images" text[] DEFAULT '{}',
	"video" text,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"word_count" integer DEFAULT 0,
	"char_count" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"published_at" timestamp with time zone,
	CONSTRAINT "blogs_status_check" CHECK ("website_schema"."blogs"."status" IN ('draft', 'published'))
);
--> statement-breakpoint
CREATE TABLE "website_schema"."connections" (
	"connection_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "website_schema"."connections_connection_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255),
	"email" varchar(150),
	"mobile" varchar(15),
	"query" text,
	"status" varchar(50),
	"source" varchar(100),
	"ip_address" "inet",
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "website_schema"."jobs" (
	"job_id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "website_schema"."jobs_job_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"job_title" varchar(255) NOT NULL,
	"location" varchar(255),
	"salary_range" varchar(100),
	"job_type" varchar(100),
	"job_description" text,
	"link" varchar(500),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "website_schema"."team_members" (
	"emp_id" varchar(20) PRIMARY KEY NOT NULL,
	"name" varchar(150) NOT NULL,
	"position" varchar(150) NOT NULL,
	"image_url" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"thoughts" text,
	"sub_thoughts" text,
	"is_reversed_layout" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "website_schema"."admin" (
	"admin_id" uuid PRIMARY KEY NOT NULL,
	"admin_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "admin_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "user_schema"."kyc" ADD CONSTRAINT "kyc_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "user_schema"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_schema"."onboarding_data" ADD CONSTRAINT "onboarding_data_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "user_schema"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_schema"."onboarding_data" ADD CONSTRAINT "onboarding_data_state_id_states_state_id_fk" FOREIGN KEY ("state_id") REFERENCES "location_schema"."states"("state_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_schema"."onboarding_data" ADD CONSTRAINT "onboarding_data_district_id_districts_district_id_fk" FOREIGN KEY ("district_id") REFERENCES "location_schema"."districts"("district_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_schema"."payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "user_schema"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_schema"."payments" ADD CONSTRAINT "payments_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "user_schema"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_schema"."subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "user_schema"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_schema"."subscriptions" ADD CONSTRAINT "subscriptions_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "user_schema"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_schema"."yield_batches" ADD CONSTRAINT "yield_batches_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "user_schema"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farms_schema"."crops" ADD CONSTRAINT "crops_category_id_crop_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "farms_schema"."crop_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farms_schema"."farm_crops" ADD CONSTRAINT "farm_crops_farm_id_farms_id_fk" FOREIGN KEY ("farm_id") REFERENCES "farms_schema"."farms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farms_schema"."farm_crops" ADD CONSTRAINT "farm_crops_crop_id_crops_id_fk" FOREIGN KEY ("crop_id") REFERENCES "farms_schema"."crops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farms_schema"."farms" ADD CONSTRAINT "farms_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "user_schema"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "farms_schema"."farms" ADD CONSTRAINT "farms_pincode_id_pincodes_pincode_id_fk" FOREIGN KEY ("pincode_id") REFERENCES "location_schema"."pincodes"("pincode_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location_schema"."cities" ADD CONSTRAINT "cities_district_id_districts_district_id_fk" FOREIGN KEY ("district_id") REFERENCES "location_schema"."districts"("district_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location_schema"."districts" ADD CONSTRAINT "districts_state_id_states_state_id_fk" FOREIGN KEY ("state_id") REFERENCES "location_schema"."states"("state_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location_schema"."pincodes" ADD CONSTRAINT "pincodes_village_id_villages_village_id_fk" FOREIGN KEY ("village_id") REFERENCES "location_schema"."villages"("village_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location_schema"."villages" ADD CONSTRAINT "villages_city_id_cities_city_id_fk" FOREIGN KEY ("city_id") REFERENCES "location_schema"."cities"("city_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_schema"."companies" ADD CONSTRAINT "companies_company_type_company_types_id_fk" FOREIGN KEY ("company_type") REFERENCES "company_schema"."company_types"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_schema"."brands" ADD CONSTRAINT "brands_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "company_schema"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_schema"."categories" ADD CONSTRAINT "categories_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "company_schema"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_schema"."categories" ADD CONSTRAINT "categories_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "company_schema"."brands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_schema"."inventory" ADD CONSTRAINT "inventory_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "company_schema"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_schema"."inventory" ADD CONSTRAINT "inventory_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "company_schema"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_schema"."company_otp" ADD CONSTRAINT "company_otp_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "company_schema"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_schema"."company_otp_verification" ADD CONSTRAINT "company_otp_verification_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "company_schema"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_schema"."products" ADD CONSTRAINT "products_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "company_schema"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_schema"."products" ADD CONSTRAINT "products_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "company_schema"."brands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_schema"."products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "company_schema"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_schema"."products" ADD CONSTRAINT "products_sub_category_id_sub_categories_id_fk" FOREIGN KEY ("sub_category_id") REFERENCES "company_schema"."sub_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_schema"."service_locations" ADD CONSTRAINT "service_locations_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "company_schema"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_schema"."sub_categories" ADD CONSTRAINT "sub_categories_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "company_schema"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_schema"."sub_categories" ADD CONSTRAINT "sub_categories_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "company_schema"."brands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_schema"."sub_categories" ADD CONSTRAINT "sub_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "company_schema"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_schema"."leads" ADD CONSTRAINT "leads_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "company_schema"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_schema"."leads" ADD CONSTRAINT "leads_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "company_schema"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_schema"."marketplace_listings" ADD CONSTRAINT "marketplace_listings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "user_schema"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_schema"."brands" ADD CONSTRAINT "brands_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "vendor_schema"."vendors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_schema"."categories" ADD CONSTRAINT "categories_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "vendor_schema"."vendors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_schema"."categories" ADD CONSTRAINT "categories_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "vendor_schema"."brands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_schema"."inventory" ADD CONSTRAINT "inventory_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "vendor_schema"."vendors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_schema"."inventory" ADD CONSTRAINT "inventory_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "vendor_schema"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_schema"."vendor_otp" ADD CONSTRAINT "vendor_otp_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "vendor_schema"."vendors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_schema"."vendor_otp_verification" ADD CONSTRAINT "vendor_otp_verification_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "vendor_schema"."vendors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_schema"."products" ADD CONSTRAINT "products_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "vendor_schema"."vendors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_schema"."products" ADD CONSTRAINT "products_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "vendor_schema"."brands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_schema"."products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "vendor_schema"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_schema"."products" ADD CONSTRAINT "products_sub_category_id_sub_categories_id_fk" FOREIGN KEY ("sub_category_id") REFERENCES "vendor_schema"."sub_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_schema"."service_locations" ADD CONSTRAINT "service_locations_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "vendor_schema"."vendors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_schema"."sub_categories" ADD CONSTRAINT "sub_categories_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "vendor_schema"."vendors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_schema"."sub_categories" ADD CONSTRAINT "sub_categories_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "vendor_schema"."brands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_schema"."sub_categories" ADD CONSTRAINT "sub_categories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "vendor_schema"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_kyc_user" ON "user_schema"."kyc" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_onboarding_user_id" ON "user_schema"."onboarding_data" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_onboarding_state_id" ON "user_schema"."onboarding_data" USING btree ("state_id");--> statement-breakpoint
CREATE INDEX "idx_onboarding_district_id" ON "user_schema"."onboarding_data" USING btree ("district_id");--> statement-breakpoint
CREATE INDEX "idx_onboarding_village_id" ON "user_schema"."onboarding_data" USING btree ("village_id");--> statement-breakpoint
CREATE INDEX "idx_onboarding_is_completed" ON "user_schema"."onboarding_data" USING btree ("is_completed");--> statement-breakpoint
CREATE INDEX "idx_onboarding_created_at" ON "user_schema"."onboarding_data" USING btree ("created_at");