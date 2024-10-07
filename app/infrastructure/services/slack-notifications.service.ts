import { WebClient } from "@slack/web-api";
import { ISlackNotificationService } from "../../domain/ports/slack-notifications.port";
import { InjectionTarget } from "../../lib/di/InjectionTarget";
import { Inject } from "../../lib/di/Inject";
import { LOGGER } from "../../lib/di/di.tokens";
import { ILogger } from "../../lib/logging/ILogger";
import { AppError, AppResult } from "@carbonteq/hexapp";
import { retry } from "../../lib/resilience/policies";

const options = {};
const web = new WebClient(process.env.SLACK_TOKEN, options);

@InjectionTarget()
export class SlackNotificationService implements ISlackNotificationService {
    constructor(@Inject(LOGGER) private logger: ILogger) {}
    async sendMessage(message: string): Promise<AppResult<boolean>> {
        if (message) {
            return await retry({ attempts: 3 }, async () => {
                const channelId = process.env.SLACK_CHANNEL_ID!;
                await web.conversations.join({
                    channel: channelId,
                });
                try {
                    const resp = await web.chat.postMessage({
                        channel: channelId,
                        text: message,
                    });
                    return AppResult.Ok(resp.ok);
                } catch (error) {
                    this.logger.error(error);
                    return AppResult.Err(error);
                }
            });
        }
        return AppResult.Err(AppError.InvalidOperation("Message required"));
    }
}
