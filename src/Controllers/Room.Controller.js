import { RoomService } from "../Services/Domain.Services/RoomService";

export class RoomController {
	#message = null;
	#service = null;

	constructor(message) {
		this.#message = message;
		this.#service = new RoomService(message);
	}

	async handleRequest() {
		try {
			switch (this.#message.subType) {
				case "CreateRoomType":
					return await this.#service.createRoomType();
					break;
				case "DeleteRoomType":
					return await this.#service.deleteRoomType();
					break;
				case "GetRoomTypes":
					return await this.#service.getRoomTypes();
					break;
				case "GetRoomTypeById":
					return await this.#service.GetRoomTypeById();
					break;
				case "EditRoomTypes":
					return await this.#service.editRoomTypes();
					break;
				case "GetAvailableRoomCount":
					return await this.#service.getAvailableRoomCount();
					break;
				default:
					break;
			}
		} catch (error) {
			return { error: error };
		}
	}
}
