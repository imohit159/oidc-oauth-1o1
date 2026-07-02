ALTER TABLE "login_throttles" RENAME COLUMN "email_normalized" TO "email";--> statement-breakpoint
ALTER TABLE "login_throttles" DROP CONSTRAINT "login_throttles_email_normalized_unique";--> statement-breakpoint
ALTER TABLE "user_identities" DROP COLUMN "email_normalized";--> statement-breakpoint
ALTER TABLE "login_throttles" ADD CONSTRAINT "login_throttles_email_unique" UNIQUE("email");