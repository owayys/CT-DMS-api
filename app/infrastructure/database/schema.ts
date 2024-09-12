import { relations, sql } from "drizzle-orm";
import {
    pgEnum,
    pgTable,
    text,
    timestamp,
    uuid,
    varchar,
    primaryKey,
    jsonb,
} from "drizzle-orm/pg-core";

/**
 * Defines an `ENUM` field for the `user` table
 */
export const UserRole = pgEnum("userRole", ["ADMIN", "USER"]);

export const UserTable = pgTable("user", {
    Id: uuid("id").primaryKey().defaultRandom(),
    userName: varchar("user_name", { length: 255 }).notNull().unique(),
    userRole: UserRole("user_role").default("USER").notNull(),
    password: varchar("password", { length: 72 }).notNull(),
    createdAt: timestamp("created_at", {
        mode: "string",
    })
        .notNull()
        .defaultNow(),
    updatedAt: timestamp("updated_at", {
        mode: "string",
    })
        .notNull()
        .defaultNow()
        .$onUpdate(() => sql`now()`),
});

export const DocumentTable = pgTable("document", {
    Id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
        .notNull()
        .references(() => UserTable.Id, { onDelete: "cascade" }),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    fileExtension: varchar("file_extension", { length: 255 }).notNull(),
    contentType: varchar("content_type", { length: 255 }).notNull(),
    content: text("content"),
    meta: jsonb("meta"),
    createdAt: timestamp("created_at", {
        mode: "string",
    })
        .notNull()
        .defaultNow(),
    updatedAt: timestamp("updated_at", {
        mode: "string",
    })
        .notNull()
        .defaultNow()
        .$onUpdate(() => sql`now()`),
});

export const TagTable = pgTable(
    "tag",
    {
        documentId: uuid("document_id")
            .references(() => DocumentTable.Id, { onDelete: "cascade" })
            .notNull(),
        key: varchar("key", { length: 60 }).notNull(),
        name: varchar("name", { length: 60 }).notNull(),
    },
    (table) => {
        return {
            pk: primaryKey({ columns: [table.documentId, table.key] }),
        };
    }
);

// RELATIONS

export const userRelations = relations(UserTable, ({ many }) => ({
    documents: many(DocumentTable),
}));

export const documentRelations = relations(DocumentTable, ({ one, many }) => ({
    owner: one(UserTable, {
        fields: [DocumentTable.userId],
        references: [UserTable.Id],
    }),
    tags: many(TagTable),
}));

export const tagRelations = relations(TagTable, ({ one }) => ({
    document: one(DocumentTable, {
        fields: [TagTable.documentId],
        references: [DocumentTable.Id],
    }),
}));
