import { Container } from "./Container";
// import { DrizzleUserRepository } from "../../repositories/DrizzleUserRepository";
import { UserService } from "../../services/user.service";
// import { UserController } from "../../controllers/user.controller";
// import { DrizzleDocumentRepository } from "../../repositories/DrizzleDocumentRepository";
import { DocumentService } from "../../services/document.service";
// import { DocumentController } from "../../controllers/document.controller";
import {
    DATABASE,
    DOCUMENT_MAPPER,
    // DOCUMENT_CONTROLLER,
    DOCUMENT_REPOSITORY,
    DOCUMENT_SERVICE,
    // JWT_CONTROLLER,
    JWT_SERVICE,
    LOGGER,
    TAG_MAPPER,
    USER_MAPPER,
    // USER_CONTROLLER,
    USER_REPOSITORY,
    USER_SERVICE,
} from "./di.tokens";
import { DrizzleClientWrapper } from "../../database";
import { JWTService } from "../../services/jwt.service";
import { BunyanLogger } from "../logging/BunyanLogger";
import { UserMapper } from "../../mappers/user.mapper";
import { DocumentMapper } from "../../mappers/document.mapper";
import { TagMapper } from "../../mappers/tag.mapper";
import { UserRepository } from "../../database/user.repository";
import { DocumentRepository } from "../../database/document.repository";
// import { JWTController } from "../../controllers/jwt.controller";
Container.register(LOGGER, BunyanLogger);

Container.register(DATABASE, DrizzleClientWrapper);

// Container.register(USER_REPOSITORY, DrizzleUserRepository);
Container.register(USER_REPOSITORY, UserRepository);
Container.register(USER_SERVICE, UserService);
// Container.register(USER_CONTROLLER, UserController);
Container.register(USER_MAPPER, UserMapper);

// Container.register(DOCUMENT_REPOSITORY, DrizzleDocumentRepository);
Container.register(DOCUMENT_REPOSITORY, DocumentRepository);
Container.register(DOCUMENT_SERVICE, DocumentService);
// Container.register(DOCUMENT_CONTROLLER, DocumentController);
Container.register(DOCUMENT_MAPPER, DocumentMapper);
Container.register(TAG_MAPPER, TagMapper);

Container.register(JWT_SERVICE, JWTService);
// Container.register(JWT_CONTROLLER, JWTController)
