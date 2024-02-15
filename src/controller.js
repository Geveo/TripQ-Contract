import { ContractUpdateController } from "./Controllers/ContractUpdate.Controller";
import { ServiceTypes } from "./Constants/ServiceTypes";
import { AuthService } from "./Services/Common.Services/Auth.service";
import { MessageAuthenticationService } from "./Services/Common.Services/MessageAuthenticationService";

const settings = require("./settings.json").settings;

export class Controller {
	dbPath = settings.dbPath;
	#contractController = null;
	#messageAuthService = null;

	async handleRequest(user, message, isReadOnly) {
		this.#contractController = new ContractUpdateController(message);
		this.#messageAuthService = new MessageAuthenticationService();

		let _authService = new AuthService();

        let result = {};

		// request authentication
		if(!this.#messageAuthService.verify(message)){
			result = {error: "Request cannot be authenticated"};
		}else{
			const requestData = this.#messageAuthService.deserializeData(message.requestHex);
			
			if (requestData.Service == ServiceTypes.CONTRACT_UPDATE) {
				const verification = _authService.verifyContractUpdateRequest(requestData);
				if (verification.isVerified) {
					result = await this.#contractController.handleRequest();
				} else {
					result = { error: verification.reason ?? "Authentication failed." };
				}
			}

			// pass to the relevant service based on the "service" property
			// if (requestData.Service == "User") {
			// 	this.#userController = new UserController(requestData);
			// 	result = await this.#userController.handleRequest();
			//   }
		}

		if (isReadOnly) {
			await this.sendOutput(user, result);
		} else {
			await this.sendOutput(
				user,
				message.promiseId ? { promiseId: message.promiseId, ...result } : result,
			);
		}
	}

    sendOutput = async (user, response) => {
        await user.send(response);
    };
}
