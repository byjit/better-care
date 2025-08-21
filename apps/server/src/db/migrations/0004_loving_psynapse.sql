PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_message` (
	`id` text PRIMARY KEY NOT NULL,
	`consultation_id` text NOT NULL,
	`sender_id` text,
	`content` text NOT NULL,
	`message_type` text DEFAULT 'user',
	`created_at` integer NOT NULL,
	FOREIGN KEY (`consultation_id`) REFERENCES `consultation`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`sender_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_message`("id", "consultation_id", "sender_id", "content", "message_type", "created_at") SELECT "id", "consultation_id", "sender_id", "content", "message_type", "created_at" FROM `message`;--> statement-breakpoint
DROP TABLE `message`;--> statement-breakpoint
ALTER TABLE `__new_message` RENAME TO `message`;--> statement-breakpoint
PRAGMA foreign_keys=ON;