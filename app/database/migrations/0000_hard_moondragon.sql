DO $$ BEGIN
 CREATE TYPE "public"."userRole" AS ENUM('ADMIN', 'USER');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "document" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"file_extension" varchar(255) NOT NULL,
	"content_type" varchar(255) NOT NULL,
	"content" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "document_tags" (
	"document_id" uuid NOT NULL,
	"tag_id" varchar(60) NOT NULL,
	CONSTRAINT "document_tags_document_id_tag_id_pk" PRIMARY KEY("document_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "download" (
	"id" uuid PRIMARY KEY NOT NULL,
	"download" uuid DEFAULT gen_random_uuid(),
	"expires" timestamp DEFAULT NOW() + INTERVAL '5' MINUTE
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tag" (
	"key" varchar(60) PRIMARY KEY NOT NULL,
	"name" varchar(60) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_name" varchar(255) NOT NULL,
	"user_role" "userRole" DEFAULT 'USER' NOT NULL,
	"password" varchar(72) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_user_name_unique" UNIQUE("user_name")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "document" ADD CONSTRAINT "document_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "document_tags" ADD CONSTRAINT "document_tags_document_id_document_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."document"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "document_tags" ADD CONSTRAINT "document_tags_tag_id_tag_key_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tag"("key") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "download" ADD CONSTRAINT "download_id_document_id_fk" FOREIGN KEY ("id") REFERENCES "public"."document"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
