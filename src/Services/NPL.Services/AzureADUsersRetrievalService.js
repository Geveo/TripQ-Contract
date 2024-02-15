import {EventTypes} from "../../Constants/EventTypes";
import {GraphApiService} from "../Common.Services/GraphApiService";
import {AdditionalTimeouts} from "../../Constants/Constants";


export class AzureADUsersRetrievalService {
    static async getADUserList(context, selectedNodePublicKey, eventListener, userGroupName, AzureAdConfigs) {
        if(context.readonly) {
            throw "NPL messaging works only in non-readonly context.";
        } else {
            if(!userGroupName) {
                throw "User group is null."
            } else {
                const hpconfig = await context.getConfig();
                // Wait only for half of roundtime.
                const timeoutMs = Math.ceil(hpconfig.consensus.roundtime / 1);
                let completed = false;

                let distributeMessages = [];

                const response = await new Promise(async (resolve, reject) => {

                    if (context.publicKey === selectedNodePublicKey) {
                        console.log(`Executing the function from node - ${context.publicKey}`);
                        let result = {};
                        try{
                            // Call service endpoints to fetch Users
                            const graphApiService = new GraphApiService(AzureAdConfigs.ClientId, AzureAdConfigs.ClientSecret, AzureAdConfigs.TenantId);
                            const accessKey = await graphApiService.getAccessToken();
                            console.log("access token: ", accessKey);
                            const groups = await graphApiService.getGroups(accessKey);
                            const selectedGroupId = groups.find(g => g.displayName === userGroupName).id;
                            console.log("selectedGroupId: ", selectedGroupId)
                            const users = await graphApiService.getUsersInGroup(accessKey, selectedGroupId);

                            // Send success response
                            await context.unl.send(
                                JSON.stringify({
                                    type: EventTypes.AZURE_AD_USER_LIST_RESPONSE,
                                    data: users,
                                })
                            );
                        } catch (error) {
                            // Send fail response
                            await context.unl.send(
                                JSON.stringify({
                                    type: EventTypes.AZURE_AD_USER_LIST_RESPONSE,
                                    error: error,
                                })
                            );
                        }
                    }

                    // timer
                    let timer = setTimeout(() => {
                        clearTimeout(timer);
                        completed = true;
                        // If we've received less than what we expect, throw an error.
                        if (distributeMessages.length === 1) {
                            resolve(distributeMessages[0]);
                        }
                        else {
                            reject("Didn't receive any messages from any nodes");
                        }
                    }, timeoutMs + AdditionalTimeouts.AZURE_AD_USERS_FETCH_TIMEOUT);

                    // listener
                    eventListener.on(EventTypes.AZURE_AD_USER_LIST_RESPONSE, (node, msg) => {
                        console.log(msg)
                        const obj = JSON.parse(msg.toString());
                        distributeMessages.push(obj);
                        completed = true;
                        clearTimeout(timer);
                        resolve(obj);
                    });

                });

                return await response;

            }
        }
    }
}