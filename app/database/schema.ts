import { relations, sql } from "drizzle-orm";
import {
    pgEnum,
    pgTable,
    text,
    timestamp,
    uuid,
    varchar,
    primaryKey,
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
    }).defaultNow(),
    updatedAt: timestamp("updated_at", {
        mode: "string",
    })
        .defaultNow()
        .$onUpdate(() => sql`now()`),
});

export const DocumentTable = pgTable("document", {
    Id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
        .notNull()
        .references(() => UserTable.Id),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    fileExtension: varchar("file_extension", { length: 255 }).notNull(),
    contentType: varchar("content_type", { length: 255 }).notNull(),
    content: text("content"),
    createdAt: timestamp("created_at", {
        mode: "string",
    }).defaultNow(),
    updatedAt: timestamp("updated_at", {
        mode: "string",
    })
        .defaultNow()
        .$onUpdate(() => sql`now()`),
});

export const DownloadTable = pgTable("download", {
    Id: uuid("id")
        .references(() => DocumentTable.Id)
        .primaryKey(),
    link: uuid("download").defaultRandom(),
    expires: timestamp("expires", {
        mode: "string",
    }).default(sql`NOW() + INTERVAL '5' MINUTE`),
});

export const TagTable = pgTable("tag", {
    key: varchar("key", { length: 60 }).primaryKey().notNull(),
    name: varchar("name", { length: 60 }).notNull(),
});

export const DocumentTagsTable = pgTable(
    "document_tags",
    {
        documentId: uuid("document_id")
            .references(() => DocumentTable.Id)
            .notNull(),
        tagId: varchar("tag_id", { length: 60 })
            .references(() => TagTable.key)
            .notNull(),
    },
    (table) => {
        return {
            pk: primaryKey({ columns: [table.documentId, table.tagId] }),
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
    tags: many(DocumentTagsTable),
}));

export const tagRelations = relations(TagTable, ({ one, many }) => ({
    document: many(DocumentTagsTable),
}));

export const documentTagRelations = relations(DocumentTagsTable, ({ one }) => ({
    document: one(DocumentTable, {
        fields: [DocumentTagsTable.documentId],
        references: [DocumentTable.Id],
    }),
    tag: one(TagTable, {
        fields: [DocumentTagsTable.tagId],
        references: [TagTable.key],
    }),
}));
