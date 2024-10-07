import { AppResult } from "@carbonteq/hexapp";

export interface ISlackNotificationService {
    sendMessage(message: string): Promise<AppResult<boolean>>;
}
