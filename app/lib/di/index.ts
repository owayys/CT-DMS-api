import { Container } from "./Container";
// import { db } from "../../database/database.client";
import { DrizzleUserRepository } from "../../repositories/DrizzleUserRepository";
import { UserService } from "../../services/user.service";
// import { UserController } from "../../controllers/user.controller";
import { DrizzleDocumentRepository } from "../../repositories/DrizzleDocumentRepository";
import { DocumentService } from "../../services/document.service";
// import { DocumentController } from "../../controllers/document.controller";
import {
    DATABASE,
    // DOCUMENT_CONTROLLER,
    DOCUMENT_REPOSITORY,
    DOCUMENT_SERVICE,
    JWT_SERVICE,
    // USER_CONTROLLER,
    USER_REPOSITORY,
    USER_SERVICE,
} from "./di.tokens";
import { DrizzleClientWrapper } from "../../database";
import { JWTService } from "../../services/jwt.service";

// Container.register(DATABASE, db);
Container.register(DATABASE, DrizzleClientWrapper);

Container.register(USER_REPOSITORY, DrizzleUserRepository);
Container.register(USER_SERVICE, UserService);
// Container.register(USER_CONTROLLER, UserController);

Container.register(DOCUMENT_REPOSITORY, DrizzleDocumentRepository);
Container.register(DOCUMENT_SERVICE, DocumentService);
// Container.register(DOCUMENT_CONTROLLER, DocumentController);

Container.register(JWT_SERVICE, JWTService);
