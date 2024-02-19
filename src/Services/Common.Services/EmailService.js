import sendgrid from "@sendgrid/mail";
import { ActivityLogService } from "../Common.Services/ActivityLog.Service";
import { SharedService } from "../Common.Services/SharedService";
import { NPLMessagingHandler } from "../Common.Services/NPLMessageHandler";
import DecisionFunctions from "../Domain.Services/DecisionFunctions";
import { EventTypes } from "../../Constants/EventTypes";
import { AdditionalTimeouts } from "../../Constants/Constants";

const settings = require("../../settings.json").sendgridMail;
export class EmailService {
	activityLogger = new ActivityLogService(message);

	static async sendEmail(sender, receiver, dynamicEmailData) {
		const nplMessenger = new NPLMessagingHandler();
        const randomNumber = SharedService.extractAndGenerateRandomNumber(SharedService.context.publicKey);
        const selectedNode = await nplMessenger.sendDecisionMessage(SharedService.context, SharedService.nplEventEmitter, { key: SharedService.context.publicKey, value: randomNumber }, DecisionFunctions.getMinValue);

		const selectedNodePublicKey = nplMessenger.selectNode(SharedService.context);

		// console.log("Selected Node: ", selectedNodePublicKey);

		let emailResponse = null;
		if (SharedService.context.readonly) {
			throw "NPL messaging works only in non-readonly context.";
		} else {
			if (!selectedNodePublicKey) {
				throw "A selected node key must  be present.";
			} else {
				const hpconfig = await SharedService.context.getConfig();
				// Wait only for half of roundtime.
				const timeoutMs = Math.ceil(hpconfig.consensus.roundtime / 1);
				let completed = false;

				let distributeMessages = [];
				emailResponse = await new Promise(async (resolve, reject) => {
					// This part is only done by one node
					if (SharedService.context.publicKey === selectedNodePublicKey) {
						console.log(`Sending email from node ${selectedNodePublicKey}`);
						sendgrid.setApiKey(settings.apiKey);
						const templateId = settings.templateId;

						const msg = {
							to: receiver,
							from: sender,
							templateId: templateId,
							dynamic_template_data: dynamicEmailData,
						};

						try {
							const res = await sendgrid.send(msg);
							console.log(`Email sent to ${receiver}`);
							await SharedService.context.unl.send(
								JSON.stringify({
									type: EventTypes.EMAIL_RESPONSE,
									data: res.data,
									status: res.status,
									statusText: res.statusText,
								}),
							);
						} catch (error) {
							await activityLogger.writeLog(
								LogTypes.ERROR,
								LogMessages.ERROR.EMAIL_CHALLENGE_ADMIN_ERROR,
								error.message,
							);
							console.error(`Error sending email to ${receiver}:`, error);
						}
					}
					let timer = setTimeout(() => {
						clearTimeout(timer);
						completed = true;
						// If we've received less than what we expect, throw an error.
						if (distributeMessages.length === 1)
							resolve(distributeMessages[0]);
						else reject("Didn't receive any messages from any nodes");
					}, timeoutMs + AdditionalTimeouts.EMAIL_SENDING_TIMEOUT);

					SharedService.nplEventEmitter.on(
						EventTypes.EMAIL_RESPONSE,
						(node, msg) => {
							try {
								const obj = JSON.parse(msg.toString());
								distributeMessages.push(obj);
								completed = true;
								clearTimeout(timer);
								resolve(obj);
							} catch (error) {
								console.log("ERROR:", error);
							}
						},
					);
				});
			}
		}
	}
}
