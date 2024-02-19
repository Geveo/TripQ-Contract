import { HotelService } from "../Services/Domain.Services/HotelService";
import { ActivityLogService } from "../Services/Common.Services/ActivityLog.Service";

export class HotelController {
	#message = null;
	#service = null;
	#activityLogger = null;

	constructor(message) {
		this.#message = message;
		this.#service = new HotelService(message);
	}

	async handleRequest() {
		try {
			switch (this.#message.Action) {
				case "RegisterHotel":
					return await this.#service.registerHotel();
					break;
				default:
					break;
			}
		} catch (error) {
			return { error: error };
		}
	}
}
