export interface ISlackNotificationService {
    sendMessage(message: string): Promise<boolean>;
}
