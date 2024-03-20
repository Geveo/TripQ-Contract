import { ServiceTypes } from "./Constants/ServiceTypes";
import { HotelController } from "./Controllers/Hotel.Controller";
import { RoomController } from "./Controllers/Room.Controller";
import { ReservationController } from "./Controllers/Reservation.Controller";

const settings = require("./settings.json").settings;

export class Controller {
	dbPath = settings.dbPath;
	#hotelController = null;
	#roomController = null;
	#reservationController = null;

	async handleRequest(user, message, isReadOnly) {
		this.#hotelController = new HotelController(message);
		this.#roomController = new RoomController(message);
		this.#reservationController = new ReservationController(message);

		let result = {};

		if (message.type == ServiceTypes.HOTEL) {
			result = await this.#hotelController.handleRequest();
		}
		if (message.type == ServiceTypes.ROOM) {
			result = await this.#roomController.handleRequest();
		}
		if(message.type == ServiceTypes.RESERVATION) {
			result = await this.#reservationController.handleRequest();
		}

		if (isReadOnly) {
			await this.sendOutput(user, result);
		} else {
			await this.sendOutput(
				user,
				message.promiseId ? { promiseId: message.promiseId, ...result } : result
			);
		}
	}

	sendOutput = async (user, response) => {
		await user.send(response);
	};
}
