import { TypeOfStay } from "../../Constants/Enum/Rooms";
const evernode = require("evernode-js-client");
const settings = require("../../settings.json").settings;
const constants = require("../../Constants/Constants");
const { SqliteDatabase } = require("../Common.Services/dbHandler").default;

export class RoomService {
	#message = null;
	#dbPath = settings.dbPath;
	#dbContext = null;

	//#date = SharedService.getCurrentTimestamp();

	constructor(message) {
		this.#message = message;
		this.#dbContext = new SqliteDatabase(this.#dbPath);
	}

	async createUpdateRoomType() {
		let resObj = {};
		let roomTypeId
		const rooms = {};
		this.#dbContext.open();
		let sleeps = 0;

		const data = this.#message.data;

		if(data.SingleBedCount>0){
			sleeps += SingleBedCount*1
		}
		if(data.DoubleBedCount>0){
			sleeps += DoubleBedCount*2
		}
		if(data.TripleBedCount>0){
			sleeps += TripleBedCount*3
		}
			 


		const roomType = {
			HotelId: data.HotelId,
			Code: data.Code,
			Sqft: data.Sqft,
			Description: data.Description,
			RoomsCount: data.RoomsCount,
			SingleBedCount: data.SingleBedCount,
			DoubleBedCount: data.DoubleBedCount,
			TripleBedCount: data.TripleBedCount,
			Facilities: data.Facilities,
			TotalSleeps: sleeps

		};

		// Saving to the roomType table
		try {
			roomTypeId = (await this.#dbContext.insertValue(Tables.ROOMTYPES, roomType)).lastId;
		} catch (error) {
			throw new Error("Error occured in room type saving");
		}

		if (roomTypeId != null) {
			// Saving to the roomTypemage table
			if (data.ImageUrls && data.ImageUrls.length > 0) {
				for (const url of data.ImageUrls) {
					const imageEntity = {
						RoomTypeId: roomTypeId,
						ImageURL: url,
					};

					if (await this.#dbContext.isTableExists(Tables.ROOMTYPEIMAGES)) {
						try {
							await this.#dbContext.insertValue(Tables.ROOMTYPEIMAGES, imageEntity);
						} catch (error) {
							throw new Error("Error occured in image saving");
						}
					} else {
						throw new Error(" Image table not found.");
					}
				}
			}

			// Saving pricing details
			if (data.RoomCodes && data.RoomCodes.length == data.RoomsCount) {
				for (const code of data.RoomCodes) {
					rooms = {
						RoomTypeId: roomTypeId,
						RoomCode: code,
					};
				}
				try {
					await this.#dbContext.insertValue(Tables.ROOMS, rooms);
				} catch (error) {
					throw new Error("Error occured in saving prices");
				}
			}
			else
				throw new Error("Room count and room codes count not matching");

			// Saving rooms
			try {
				const pricingRows = [
					[roomTypeId, TypeOfStay.FB, data.Prices.Fb],
					[roomTypeId, TypeOfStay.BB, data.Prices.Bb],
					[roomTypeId, TypeOfStay.HB, data.Prices.Hb],
					[roomTypeId, TypeOfStay.ROD, data.Prices.Rod],
					[roomTypeId, TypeOfStay.RON, data.Prices.Ron]
				];
				await this.#dbContext.insertRowsIntoTable(Tables.PRICES, pricingRows);

			} catch (error) {
				throw new Error("Error occured in saving prices");
			}
		}

		resObj.success = { rowId: roomTypeId };
		return resObj;
	}

	async deleteRoomType() {
		let resObj = {};
		const data = this.#message.data;

		try {
			this.#dbContext.open();
			const roomType = await this.#dbContext.findById(Tables.ROOMTYPES, data.roomTypeId);
			if (!roomType) {
				throw new Error("Room type does not exists.");}
			else {
				const result = await this.#dbContext.deleteValues(Tables.ROOMTYPES, { Id: this.#message.data.roomTypeId });
				if (result.changes > 0) {
					resObj.success = "Successfully deleted.";
					return resObj;
				} else {
					throw new Error("An error occurred in deleting room type");
				}
			}

		} catch (error) {
			throw error;
		} finally {
			this.#dbContext.close();
		}

	}

	async getRoomTypes() {

		let resObj = {};
		const data = this.#message.data;
		//if user is an hotel owner
		try {
			this.#dbContext.open();
			let rows = await this.#dbContext.getValues(Tables.ROOMTYPES, {HotelId: data.HotelId});

			resObj.success = rows;
			return resObj;
		} catch (error) {
			throw error;
		} finally {
			this.#dbContext.close();
		}
	}
}
