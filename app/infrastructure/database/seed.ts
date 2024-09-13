import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { UserTable, DocumentTable, TagTable } from "./schema";
import { faker } from "@faker-js/faker";
import { UUID } from "../../domain/value-objects/uuid.value-object";
import { writeFile } from "fs";
import { UserPassword } from "../../domain/value-objects/user-password.value-object";

function randomMetadata() {
    let objects = [
        {
            item1: faker.string.alphanumeric(),
            item2: faker.number.int(),
            item3: faker.datatype.boolean(),
            item4: {
                item5: [
                    faker.number.int(),
                    faker.number.int(),
                    faker.string.alphanumeric(),
                    {
                        item6: faker.datatype.boolean(),
                    },
                ],
            },
            item7: [
                faker.string.alphanumeric(),
                faker.string.alphanumeric(),
                faker.number.int(),
            ],
        },
        {
            item1: faker.string.alphanumeric(),
            item2: faker.number.int(),
            item3: {
                item4: faker.datatype.boolean(),
                item5: faker.number.int(),
            },
            item6: [
                faker.string.alphanumeric(),
                faker.number.int(),
                faker.datatype.boolean(),
                {
                    item7: faker.string.alphanumeric(),
                    item8: [
                        faker.number.int(),
                        faker.datatype.boolean(),
                        faker.number.int(),
                        faker.datatype.boolean(),
                    ],
                },
            ],
        },
        {
            item1: faker.string.alphanumeric(),
            item2: faker.number.int(),
            item3: faker.datatype.boolean(),
            item4: {
                item5: [faker.number.int(), faker.number.int()],
            },
            item6: [
                faker.string.alphanumeric(),
                faker.string.alphanumeric(),
                [
                    { item7: faker.string.alphanumeric() },
                    faker.string.alphanumeric(),
                ],
            ],
        },
    ];
    const random = Math.floor(Math.random() * objects.length);
    return objects[random];
}

const main = async () => {
    const client = postgres(process.env.DATABASE_URI as string);
    const db = drizzle(client);
    let userData: (typeof UserTable.$inferInsert)[] = [
        {
            Id: UUID.generate().toString(),
            userName: faker.internet.userName(),
            password: faker.internet.password(),
        },
    ];
    const documentData: (typeof DocumentTable.$inferInsert)[] = [];
    const tagData: (typeof TagTable.$inferInsert)[] = [];

    for (let i = 0; i < 20; i++) {
        userData.push({
            Id: UUID.generate().toString(),
            userName: faker.internet.userName(),
            password: faker.internet.password(),
        });
    }

    const documents: any[] = [];

    for (const user of userData) {
        for (let i = 0; i < 10; i++) {
            let doc = {
                Id: UUID.generate().toString(),
                userId: user.Id!,
                fileName: faker.system.commonFileName().split(".")[0],
                fileExtension: `.${faker.system.fileExt()}`,
                contentType: faker.system.mimeType(),
                content: faker.lorem.lines({ min: 1, max: 3 }),
                meta: randomMetadata(),
            };
            documentData.push(doc);
            let docTags = [];
            for (let i = 0; i < 5; i++) {
                let tag = {
                    documentId: doc.Id!,
                    key: `${doc.fileName}_tag_${i + 1}`,
                    name: faker.word.adjective(),
                };
                tagData.push(tag);
                docTags.push({ key: tag.key, name: tag.name });
            }
            documents.push({ ...doc, tags: docTags });
        }
    }

    writeFile(
        "./app/infrastructure/database/seeded/seeded-users.json",
        JSON.stringify(userData),
        "utf8",
        function (err) {
            if (err) {
                return console.log(err);
            }

            console.log("seeded-users.json file was saved!");
        }
    );

    writeFile(
        "./app/infrastructure/database/seeded/seeded-documents.json",
        JSON.stringify(documents),
        "utf8",
        function (err) {
            if (err) {
                return console.log(err);
            }

            console.log("seeded-documents.json file was saved!");
        }
    );

    userData = userData.map((user) => {
        return {
            ...user,
            password: UserPassword.fromPlain(user.password).toString(),
        };
    });

    userData.push({
        Id: UUID.generate().toString(),
        userName: "ryomen",
        password: UserPassword.fromPlain("sukuna").toString(),
        userRole: "ADMIN",
    });
    userData.push({
        Id: UUID.generate().toString(),
        userName: "megumi",
        password: UserPassword.fromPlain("fushiguro").toString(),
        userRole: "USER",
    });
    userData.push({
        Id: UUID.generate().toString(),
        userName: "nanami",
        password: UserPassword.fromPlain("kento").toString(),
        userRole: "USER",
    });

    try {
        await db
            .transaction(async (tx) => {
                try {
                    console.log("SEEDING...");
                    console.log("SEEDING USERS...");
                    await tx.insert(UserTable).values(userData);
                    console.log("SEEDING DOCUMENTS...");
                    await tx.insert(DocumentTable).values(documentData);
                    console.log("SEEDING DOCUMENT TAGS...");
                    await tx.insert(TagTable).values(tagData);
                    console.log("SEEDING COMPLETE");
                } catch (err) {
                    tx.rollback();
                    console.error(err);
                }
            })
            .then(() => {
                console.log("DONE!");
            });
    } catch (err) {
        console.log(err);
    }
};

await main();
