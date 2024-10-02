import { Container } from "./Container";
// import { DrizzleUserRepository } from "../../repositories/DrizzleUserRepository";
// import { UserService } from "../../services/user.service";
import { UserService } from "../../application/services/user.service";
// import { UserController } from "../../controllers/user.controller";
// import { DrizzleDocumentRepository } from "../../repositories/DrizzleDocumentRepository";
// import { DocumentService } from "../../services/document.service";
import { DocumentService } from "../../application/services/document.service";
// import { DocumentController } from "../../controllers/document.controller";
import {
    AUTHORIZE_DOCUMENT_ACCESS_SERVICE,
    DATABASE,
    DOCUMENT_MAPPER,
    // DOCUMENT_CONTROLLER,
    DOCUMENT_REPOSITORY,
    DOCUMENT_SERVICE,
    FILE_HANDLER,
    // JWT_CONTROLLER,
    JWT_SERVICE,
    LOGGER,
    LOGIN_USER_SERVICE,
    REGISTER_USER_SERVICE,
    SLACK_NOTIFICATION_SERVICE,
    TAG_MAPPER,
    USER_MAPPER,
    // USER_CONTROLLER,
    USER_REPOSITORY,
    USER_SERVICE,
} from "./di.tokens";
import { DrizzleClientWrapper } from "../../infrastructure/database";
import { JWTService } from "../../application/services/jwt.service";
import { BunyanLogger } from "../logging/BunyanLogger";
import { UserMapper } from "../../infrastructure/mappers/user.mapper";
import { DocumentMapper } from "../../infrastructure/mappers/document.mapper";
import { TagMapper } from "../../infrastructure/mappers/tag.mapper";
import { UserRepository } from "../../infrastructure/repositories/user.repository";
import { DocumentRepository } from "../../infrastructure/repositories/document.repository";
import { FileHandlerService } from "../../infrastructure/services/file-handler.service";
import { RegisterUserService } from "../../domain/services/register-user.service";
import { LoginUserService } from "../../domain/services/login-user.service";
import { AuthorizeDocumentAccessService } from "../../domain/services/authorize-document-access.service";
import { SlackNotificationService } from "../../infrastructure/services/slack-notifications.service";
import { CloudFileHandler } from "../../infrastructure/services/cloud-file-handler.service";
// import { JWTController } from "../../controllers/jwt.controller";
Container.register(LOGGER, BunyanLogger);

Container.register(DATABASE, DrizzleClientWrapper);

// Container.register(USER_REPOSITORY, DrizzleUserRepository);
Container.register(USER_REPOSITORY, UserRepository);
Container.register(USER_SERVICE, UserService);
// Container.register(USER_CONTROLLER, UserController);
Container.register(USER_MAPPER, UserMapper);

Container.register(REGISTER_USER_SERVICE, RegisterUserService);
Container.register(LOGIN_USER_SERVICE, LoginUserService);

// Container.register(DOCUMENT_REPOSITORY, DrizzleDocumentRepository);
Container.register(DOCUMENT_REPOSITORY, DocumentRepository);
Container.register(DOCUMENT_SERVICE, DocumentService);
// Container.register(DOCUMENT_CONTROLLER, DocumentController);
Container.register(DOCUMENT_MAPPER, DocumentMapper);
Container.register(TAG_MAPPER, TagMapper);

Container.register(
    AUTHORIZE_DOCUMENT_ACCESS_SERVICE,
    AuthorizeDocumentAccessService
);

// Container.register(FILE_HANDLER, FileHandlerService);
Container.register(FILE_HANDLER, CloudFileHandler);
Container.register(SLACK_NOTIFICATION_SERVICE, SlackNotificationService);

Container.register(JWT_SERVICE, JWTService);
// Container.register(JWT_CONTROLLER, JWTController)
