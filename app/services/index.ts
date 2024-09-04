// import { db } from "../database/database.client";
// import { DrizzleDocumentRepository } from "../repositories/DrizzleDocumentRepository";
// import { DrizzleUserRepository } from "../repositories/DrizzleUserRepository";
// import { DocumentService } from "./document.service";
// import { JWTService } from "./jwt.service";
// import { UserService } from "./user.service";

// export class ServiceFactory {
//     createUserService() {
//         const userRepository = new DrizzleUserRepository(db);
//         return new UserService(userRepository);
//     }

//     createDocumentService() {
//         const documentRepository = new DrizzleDocumentRepository(db);
//         return new DocumentService(documentRepository);
//     }

//     createJWTService() {
//         const userRepository = new DrizzleUserRepository(db);
//         return new JWTService(userRepository);
//     }
// }
