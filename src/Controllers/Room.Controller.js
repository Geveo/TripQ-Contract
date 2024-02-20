import { RoomService } from "../Services/Domain.Services/RoomService";
import { ActivityLogService } from "../Services/Common.Services/ActivityLog.Service";

export class RoomController {
	#message = null;
	#service = null;
	#activityLogger = null;

	constructor(message) {
		this.#message = message;
		this.#service = new RoomService(message);
	}

	async handleRequest() {
		try {
			switch (this.#message.Action) {
				case "createUpdateRoomType":
					return await this.#service.createUpdateRoomType();
					break;
				case "DeleteRoomType":
					return await this.#service.deleteRoomType();
					break;
				case "getRoomTypes":
					return await this.#service.getRoomTypes();
					break;
				default:
					break;
			}
		} catch (error) {
			return { error: error };
		}
	}
}
