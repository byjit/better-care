DROP INDEX "user_email_unique";--> statement-breakpoint
DROP INDEX "session_token_unique";--> statement-breakpoint
ALTER TABLE `user` ALTER COLUMN "role" TO "role" text DEFAULT 'patient';--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
ALTER TABLE `user` ADD `onboard` integer DEFAULT true NOT NULL;