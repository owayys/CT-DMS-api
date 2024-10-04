import { WebClient } from "@slack/web-api";
import { ISlackNotificationService } from "../../domain/ports/slack-notifications.port";
import { InjectionTarget } from "../../lib/di/InjectionTarget";
import { Inject } from "../../lib/di/Inject";
import { LOGGER } from "../../lib/di/di.tokens";
import { ILogger } from "../../lib/logging/ILogger";

const options = {};
const web = new WebClient(process.env.SLACK_TOKEN, options);
const channel: string = "C07Q2SJM49W";

@InjectionTarget()
export class SlackNotificationService implements ISlackNotificationService {
    constructor(@Inject(LOGGER) private logger: ILogger) {}
    async sendMessage(message: string): Promise<boolean> {
        if (message) {
            const channelId = channel || process.env.SLACK_CHANNEL_ID!;
            await web.conversations.join({
                channel: channel,
            });
            try {
                const resp = await web.chat.postMessage({
                    channel: channelId,
                    text: message,
                });
                return resp.ok;
            } catch (error) {
                this.logger.error(error);
                return false;
            }
        }
        return false;
    }
}
