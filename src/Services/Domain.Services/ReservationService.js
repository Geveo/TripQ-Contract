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
		console.log("Get reservation Request arrived.");
        let resObj = {};
		const data = this.#message.data ?? {};
        const filters = data.filters || {}; // {HotelId, WalletAddress, Id, date<string '2024-02-29'>,    dates?: {from, to}}   dates is not implememnted yet

		try {
			this.#dbContext.open();

			let filterString = '';
			if (Object.keys(filters).length > 0) {
				filterString = ' WHERE ';
				Object.entries(filters).forEach(([key, value]) => {
					// date filter is checked later not here
					if(key !== 'date') {
						if (typeof value === 'string') {
							if(key === 'WalletAddress')
								filterString += `rs.${key} = '${value}' AND `;
						} else {
							if(key === 'id')
								filterString += `rs.${key} = ${value} AND `;
							if(key === 'HotelId')
							filterString += `rs.${key} = ${value} AND `;
						}
					}
				});
				filterString = filterString.slice(0, -5);
			}
			let reservationQuery = `SELECT rs.*, h.Name AS HotelName
									  FROM ${Tables.RESERVATIONS} rs
									  LEFT JOIN ${Tables.HOTELS} h
									  ON rs.HotelId = h.Id`;
			reservationQuery += filterString;

			let reservations = await this.#dbContext.runSelectQuery(reservationQuery);

			if( reservations.length > 0) {
				// Fitering by date (ToDate exclusive)
				if(filters.date) {
					reservations = reservations.filter(rs => rs.FromDate <= filters.date && rs.ToDate > filters.date )
				}

				const reservationIds = reservations.map(rs => rs.Id);
				let roomDetailsQuery = `SELECT rr.*, rt.Code
										FROM ${Tables.RESERVATIONROOMTYPES} rr 
										LEFT JOIN ${Tables.ROOMTYPES} rt 
										ON rr.RoomTypeId = rt.Id
										WHERE rr.ReservationId IN (${reservationIds.join(', ')})`;

				const roomDetails = await this.#dbContext.runSelectQuery(roomDetailsQuery);

				const response = [];
				for(const rs of reservations) {
					const resObj = {...rs};
					resObj.rooms = roomDetails.filter(rd => rd.ReservationId === rs.Id);
					response.push(resObj);
				}

				resObj.success = response;
				return resObj;
			}

			resObj.success = [];
			return resObj;

		} catch (error) {
			throw error;
		} finally {
			this.#dbContext.close();
		}
    }

	async makeReservations() {
		let resObj = {};

		try {
			this.#dbContext.open();
			const data = this.#message.data;
			
			const reservationEntity = {
				WalletAddress: data.WalletAddress,
				Price: data.Price,
				FromDate: data.FromDate,
				ToDate: data.ToDate,
				NoOfNights: data.NoOfNights,
				FirstName: data.FirstName,
				LastName: data.LastName,
				Email: data.Email,
				Country: data.Country,
				Telephone: data.Telephone,
				HotelId: data.HotelId,
			};

			// Saving to the reservation table
			const rowId = await this.#dbContext.insertValue(Tables.RESERVATIONS, reservationEntity);
			const roomTypes = this.#message.data.RoomTypes;
			for(const roomType of roomTypes){ 

				const roomTypeEntity = {
					RoomTypeId: roomType.roomData.Id,
					ReservationId: rowId.lastId,
					NoOfRooms: roomType.count
				}
				try {
					const res = await this.#dbContext.insertValue(Tables.RESERVATIONROOMTYPES, roomTypeEntity);
				} catch (error) {
					throw `Error occured in room types saving: ${e}`;
				}
			}
			
			resObj.success = { rowId: rowId };
			return resObj;
		} catch (error) {
		} finally {
			this.#dbContext.close();
		}
	}
}