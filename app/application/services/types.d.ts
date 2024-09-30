import { SlackNotificationService } from "../../infrastructure/services/slack-notifications.service";
import {
    DOCUMENT_SERVICE,
    JWT_SERVICE,
    SLACK_NOTIFICATION_SERVICE,
    USER_SERVICE,
} from "../../lib/di/di.tokens";
import { DocumentService } from "./document.service";
import { JWTService } from "./jwt.service";
import { UserService } from "./user.service";

export type Services = {
    [DOCUMENT_SERVICE]: DocumentService;
    [USER_SERVICE]: UserService;
    [JWT_SERVICE]: JWTService;
    [SLACK_NOTIFICATION_SERVICE]: SlackNotificationService;
};
