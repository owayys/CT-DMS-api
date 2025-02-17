import { SlackNotificationService } from "../../infrastructure/services/slack-notifications.service";
import {
    DOCUMENT_SERVICE,
    AUTH_SERVICE,
    SLACK_NOTIFICATION_SERVICE,
    USER_SERVICE,
} from "../../lib/di/di.tokens";
import { DocumentService } from "./document.service";
import { AuthService } from "./auth.service";
import { UserService } from "./user.service";

export type Services = {
    [DOCUMENT_SERVICE]: DocumentService;
    [USER_SERVICE]: UserService;
    [AUTH_SERVICE]: AuthService;
    [SLACK_NOTIFICATION_SERVICE]: SlackNotificationService;
};
