const settings = require("../../settings.json").settings;
const { SqliteDatabase } = require("../Common.Services/dbHandler").default;
import { SharedService } from "../Common.Services/SharedService";
import { Tables } from "../../Constants/Tables";

export class ReservationService {
    #message = null;
	#dbPath = settings.dbPath;
	#dbContext = null;

	#date = SharedService.getCurrentTimestamp();

	constructor(message) {
		this.#message = message;
		this.#dbContext = new SqliteDatabase(this.#dbPath);
	}


    async getReservations() {
        let resObj = {};
		const data = this.#message.data;
        const filters = data.filters; // {HotelId, WalletAddress, Id, date<string '2024-02-29'>,    dates?: {from, to}}   dates is not implememnted yet

		try {
			this.#dbContext.open();
			let filterObj = {};
			if(filters) {
				if(filters.HotelId && filters.HotelId > 0)
					filterObj.HotelId = filters.HotelId;
				if(filters.WalletAddress && filters.WalletAddress.length > 0)
					filterObj.WalletAddress = filters.WalletAddress;
				if(filters.Id && filters.Id > 0)
					filterObj.Id = filters.Id;
			}

			let reservations = await this.#dbContext.getValues(Tables.RESERVATIONS, filterObj);
			if( reservations.length > 0) {
				
				// Fitering by date (ToDate exclusive)
				if(filters.date) {
					reservations = reservations.filter(rs => rs.FromDate <= filters.date && rs.ToDate > filters.date )
				}

				const reservationIds = reservations.map(rs => rs.Id);
				const roomDetails = await this.#dbContext.getValues(Tables.RESERVATIONROOMTYPES, {ReservationId: reservationIds}, 'IN');

				const response = [];
				for(const rs of reservations) {
					const resObj = {...rs};
					resObj.rooms = roomDetails.filter(rd => rd.ReservationId === rs.Id);
					response.push(resObj);
				}

				resObj.reservations = response;
				return resObj;
			}

			resObj.reservations = [];
			return resObj;

		} catch (error) {
			throw error;
		} finally {
			this.#dbContext.close();
		}

    }


}