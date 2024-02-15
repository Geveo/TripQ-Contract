const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");
import { EventTypes } from "../../Constants/EventTypes";
import { AdditionalTimeouts, AuthProviders, Common } from "../../Constants/Constants";
import { SessionService } from "./SessionService";
const settings = require("../../settings.json");
const crypto = require("crypto");
import { GraphApiService } from "../Common.Services/GraphApiService";
const azureAd = require("../../settings.json").azureAd;

export class AuthService {
	static async executeUserAuthenticationInSelectedNode(
		context,
		selectedNode,
		eventListener,
		loginData,
		uuId,
	) {
		try {
			// NPL Messaging
			if (context.readonly) {
				throw "NPL messaging works only in non-readonly context.";
			} else {
				if (!selectedNode) {
					throw "A selected node key must  be present.";
				} else {
					const hpconfig = await context.getConfig();
					// Wait only for a roundtime.
					let timeoutMs = Math.ceil(hpconfig.consensus.roundtime / 2);
					let completed = false;

					let sharedMessage = [];

					const functionResult = await new Promise(async (resolve, reject) => {
						// This part is only done bn one node.
						if (context.publicKey === selectedNode) {
							console.log(
								`Executing the function from node - ${context.publicKey}`,
							);
							let result = {};

							try {
								if (loginData.authProvider === AuthProviders.GOOGLE) {
									const oAuth2Client = new OAuth2Client(
										loginData.googleClientId,
										loginData.googleClientSecret,
										"postmessage",
									);

									// const { tokens } = await oAuth2Client.getToken(
									// 	loginData.authorizationCode,
									// );
									if (!loginData.idToken) {
										const { tokens } = await oAuth2Client.getToken(
											loginData.authorizationCode,
										);
										loginData.idToken = tokens.id_token;
									}
									const ticket = await oAuth2Client.verifyIdToken({
										idToken: loginData.idToken,
										audience: loginData.googleClientId,
									});

									result.email = ticket.payload.email;
									result.name = ticket.payload.name;
									result.image = ticket.payload.picture;
									result.isValid = 1;
								} else if (
									loginData.authProvider === AuthProviders.MICROSOFT
								) {
									const jwksClientInstance = jwksClient({
										jwksUri:
											"https://login.microsoftonline.com/common/discovery/v2.0/keys",
									});
									const jwks =
										await jwksClientInstance.getSigningKeys();
									const decodedToken = jwt.decode(loginData.idToken, {
										complete: true,
									});
									const kid = decodedToken.header.kid;
									const jwk = jwks.find(key => key.kid === kid);
									const publickey = jwk.getPublicKey();
									jwt.verify(
										loginData.idToken,
										publickey,
										{ algorithms: ["RS256"] },
										(error, verifiedPayload) => {
											if (error) {
												throw {
													customErrorMessage:
														"Token verification failed:",
													err: error,
												};
											} else {
												// Token is valid; you can access claims in the 'decoded' object.
												result.email = verifiedPayload.email;
												result.name = verifiedPayload.name;
												result.image = "";
												result.isValid = 1;
											}
										},
									);

									const graphApiService = new GraphApiService(
										azureAd.ClientId,
										azureAd.ClientSecret,
										azureAd.TenantId,
									);
									const accessKey =
										await graphApiService.getAccessToken();

									const userImage = await graphApiService.getUserImage(
										accessKey,
										result.email,
									);
									result.image = userImage ?? null;
								} else {
									throw {
										customErrorMessage:
											"Authentication type not defined.",
									};
								}

								// Send success response
								await context.unl.send(
									JSON.stringify({
										type: EventTypes.AUTH_RESULT,
										data: result,
										uuId: uuId,
									}),
								);
							} catch (error) {
								// Send fail response
								await context.unl.send(
									JSON.stringify({
										type: EventTypes.AUTH_RESULT,
										error: error,
									}),
								);
							}
						}

						let timer = setTimeout(() => {
							clearTimeout(timer);
							completed = true;
							// If we've received less than what we expect, throw an error.
							if (sharedMessage.length === 1) {
								resolve(sharedMessage[0]);
							} else {
								reject("Didn't receive any messages from any nodes");
							}
						}, timeoutMs + AdditionalTimeouts.AUTH_TOKEN_VERIFICATION_TIMEOUT);

						eventListener.on(EventTypes.AUTH_RESULT, (node, msg) => {
							const obj = JSON.parse(msg.toString());
							sharedMessage.push(obj);
							completed = true;
							clearTimeout(timer);
							resolve(obj);
						});
					});

					return await functionResult;
				}
			}
		} catch (error) {
			throw error;
		}
	}

	async authenticateUser(message) {
		try {
			const _sessionService = new SessionService(message);

			return await _sessionService.authenticateSession();
		} catch (error) {
			console.log("Error in authentication :- ", error);
			return false;
		}
	}

	verifyContractUpdateRequest(message) {
		let isVerified = false;
		try {
			const verify = crypto.createVerify("SHA256");
			verify.update(message.data.content.buffer);
			isVerified = verify.verify(
				settings.contractUpdatingPublicKey,
				message.signature,
				"hex",
			);
		} catch (error) {
			console.log(error);
			const response = {
				isVerified: false,
				reason: "verification failed with errors.",
			};
			return response;
		}

		const response = {
			isVerified: isVerified,
			reason: "Success",
		};

		console.log("Updated Contract Verification Successful.", response);
		return response;
	}
}
