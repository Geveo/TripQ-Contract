import { ReservationService } from "../Services/Domain.Services/ReservationService";
import { ActivityLogService } from "../Services/Common.Services/ActivityLog.Service";

export class ReservationController {
	#message = null;
	#service = null;
	#activityLogger = null;

	constructor(message) {
		this.#message = message;
		this.#service = new ReservationService(message);
	}

	async handleRequest() {
		try {
			switch (this.#message.subType) {
				case "GetReservations":
					return await this.#service.getReservations();
					break;
				case "MakeReservations":
					return await this.#service.makeReservations();
					break;
				default:
					break;
			}
		} catch (error) {
			return { error: error };
		}
	}
}
