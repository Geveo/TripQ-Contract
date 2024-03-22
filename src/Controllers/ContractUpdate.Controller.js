import { ContractUpdateService } from "../Services/Domain.Services/ContractUpdate.service";
import { LogTypes } from "../Constants/LogTypes";
import { LogMessages } from "../Constants/LogMessages";

export class ContractUpdateController {
    #message = null;
    #service = null

    constructor(message) {
        this.#message = message;
        this.#service = new ContractUpdateService(message);
    }

    async handleRequest() {
        try {
            switch (this.#message.Action) {
                case 'UpdateContract':
                    return await this.#service.UpdateContract();
                    break;
                default:
                    break;
            }

        } catch (error) {
            return { error: error };
        }
    }
}