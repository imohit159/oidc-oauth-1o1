ALTER TABLE "oauth_clients" ADD COLUMN "logo_url" text;--> statement-breakpoint
ALTER TABLE "oauth_clients" ADD COLUMN "website_url" text;--> statement-breakpoint
ALTER TABLE "oauth_clients" ADD COLUMN "publisher_name" text;--> statement-breakpoint
ALTER TABLE "oauth_clients" ADD COLUMN "privacy_policy_url" text;--> statement-breakpoint
ALTER TABLE "oauth_clients" ADD COLUMN "terms_of_service_url" text;--> statement-breakpoint
ALTER TABLE "oauth_clients" ADD COLUMN "verification_status" text DEFAULT 'UNVERIFIED' NOT NULL;