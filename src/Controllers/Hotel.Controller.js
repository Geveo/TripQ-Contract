import { HotelService } from "../Services/Domain.Services/HotelService";

export class HotelController {
	#message = null;
	#service = null;

	constructor(message) {
		this.#message = message;
		this.#service = new HotelService(message);
	}

	async handleRequest() {
		try {
			switch (this.#message.subType) {
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
