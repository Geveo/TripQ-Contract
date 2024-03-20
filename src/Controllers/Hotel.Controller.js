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
				case "GetHotelsListByWalletAddress":
					return await this.#service.getHotelsListByWalletAddress();
					break;
				case "GetHotelImagesById":
					return await this.#service.getHotelImagesById();
					break;
				case "GetHotelById":
					return await this.#service.getHotelById();
					break;
				case "SearchHotelsWithRooms":
					return await this.#service.getHotelsWithRoomSearch();
					break;
				case "GetRecentHotels":
					return await this.#service.getRecentHotels();
					break;
				default:
					break;
			}
		} catch (error) {
			return { error: error };
		}
	}
}
