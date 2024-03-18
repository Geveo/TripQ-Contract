const evernode = require("evernode-js-client");
const settings = require("../../settings.json").settings;
const constants = require("../../Constants/Constants");
const { SqliteDatabase } = require("../Common.Services/dbHandler").default;
import { SharedService } from "../Common.Services/SharedService";
import { Tables } from "../../Constants/Tables";

export class RoomService {
	#message = null;
	#dbPath = settings.dbPath;
	#dbContext = null;

	#date = SharedService.getCurrentTimestamp();

	constructor(message) {
		this.#message = message;
		this.#dbContext = new SqliteDatabase(this.#dbPath);
	}

	async createRoomType() {
		let resObj = {};
		let roomTypeId;
		this.#dbContext.open();

		const data = this.#message.data;

     try {

		let sleeps = 0;
		if(data.SingleBedCount>0){
		   sleeps += data.SingleBedCount*1
		}
		if(data.DoubleBedCount>0){
		   sleeps += data.DoubleBedCount*2
		}
		if(data.TripleBedCount>0){
		   sleeps += data.TripleBedCount*3
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
			Price: data.Price,
			TotalSleeps: sleeps
		};
		// Saving to the roomType table
			const rmTId = (await this.#dbContext.insertValue(Tables.ROOMTYPES, roomType));
		// If RFacilityId is present, in each array object, get that and save to m2m tble
        // Otherwise, create a facility record and add it to the m2m table.
        if (data.Facilities && data.Facilities.length > 0 && rmTId.lastId ) {
            for (const facility of data.Facilities) {
                let rFacilityId = 0;
                if (facility.RFacilityId && facility.RFacilityId > 0) {
                    rFacilityId = facility.RFacilityId;
                }
                else {
                    // Save Facility Entity
                    const rFacilityEntity = {
                        Name: facility.Name,
                        Description: facility.Description,
						CreatedOn: this.#date
                    }
					 if (await this.#dbContext.isTableExists(Tables.FACILITIES)) {
                        try {
							const rFacilityIdRes = (await this.#dbContext.insertValue(Tables.FACILITIES, rFacilityEntity));
						 } catch (error) {
                            throw (`Error occured in saving room Facility ${rFacilityEntity.Name} `);
                        }
                    } else {
                        throw (`Room Facility table not found.`);
                    }
                }

					// Save in the m2m table
					const roomFacilityEntity = {
						RoomTypeId: rmTId.lastId,
						FacilityId: rFacilityId,
						Quantity: 1,
						CreatedOn: this.#date,
					};

					if (await this.#dbContext.isTableExists(Tables.ROOMFACILITIES)) {
						try {
							const roomFacility = await this.#dbContext.insertValue(
								Tables.ROOMFACILITIES,
								roomFacilityEntity
							);
						} catch (error) {
							throw `Error occured in saving Room-Facility ${roomFacilityEntity.RFacilityId} `;
						}
					} else {
						throw `Room-Facility table not found.`;
					}
				}
			}
			resObj.success = rmTId.lastId;
			return resObj;
		} catch (error) {
			throw new Error("Error occured in room type saving");
		} finally {
			this.#dbContext.close();
		}

		/*	if (roomTypeId != null) {
			console.log("Saving to the roomTypeImage table");
			// Saving to the roomTypeImage table
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
				console.log("Saving to the Pricing table");
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
		}*/
	}

	async GetRoomTypeById() {
		let resObj = {};
		// let debugCode = 0;

		try {
			await this.#dbContext.open();
			console.log(this.#message);

			const roomTypeQuery = `
            SELECT 
                Id AS RoomTypeId, 
                Code AS RoomTypeCode, 
                Sqft AS Sqft, 
                Description AS RoomTypeDescription, 
                Price AS Price, 
				RoomsCount AS RoomsCount,
                SingleBedCount AS SingleBedCount, 
                DoubleBedCount AS DoubleBedCount, 
                TripleBedCount AS TripleBedCount
            FROM 
                ROOMTYPES
            WHERE 
                Id = ?
        `;

			const facilitiesQuery = `
            SELECT 
                f.Id AS FacilityId, 
                f.Name AS FacilityName, 
                f.Description AS FacilityDescription
            FROM 
                FACILITIES AS f
            INNER JOIN 
                ROOMFACILITIES AS rf ON f.Id = rf.FacilityId
            WHERE 
                rf.RoomTypeId = ?
        `;
			console.log("facilitiesQuery", facilitiesQuery);
			console.log("roomTypeQuery", roomTypeQuery);

			const roomTypeRows = await this.#dbContext.runSelectQuery(roomTypeQuery, [
				this.#message.data.RTypeId,
			]);
			console.log("roomTypeRows", roomTypeRows);
			if (roomTypeRows.length === 0) {
				throw new Error("No room type found with the provided ID");
			}
			const roomType = roomTypeRows[0];

			const facilitiesRows = await this.#dbContext.runSelectQuery(facilitiesQuery, [
				this.#message.data.RTypeId,
			]);
			console.log("facilitiesRows", facilitiesRows);
			const facilities = facilitiesRows.map(row => ({
				id: row.FacilityId,
				name: row.FacilityName,
				description: row.FacilityDescription,
			}));
			resObj.success = {
				roomType: {
					id: roomType.RoomTypeId,
					Code: roomType.RoomTypeCode,
					Sqft: roomType.Sqft,
					Description: roomType.RoomTypeDescription,
					Price: roomType.Price,
					RoomsCount: roomType.RoomsCount,
					SingleBedCount: roomType.SingleBedCount,
					DoubleBedCount: roomType.DoubleBedCount,
					TripleBedCount: roomType.TripleBedCount,
				},
				Facilities: facilities,
			};
			console.log("resObj", resObj);
			return resObj;
		} catch (error) {
			console.error("Error fetching room type details:", error);
			throw error;
		} finally {
			this.#dbContext.close();
		}
	}

	async editRoomType() {
		let resObj = {};
		const data = this.#message.data;

		try {
			this.#dbContext.open();
			const roomType = await this.#dbContext.findById(
				Tables.ROOMTYPES,
				data.roomTypeId
			);
			if (!roomType) {
				throw new Error("Room type does not exists.");
			} else {
				// implement editing
			}
		} catch (error) {
			throw error;
		} finally {
			this.#dbContext.close();
		}
	}

	async deleteRoomType() {
		let resObj = {};
		const data = this.#message.data;

		try {
			this.#dbContext.open();
			const roomType = await this.#dbContext.findById(
				Tables.ROOMTYPES,
				data.roomTypeId
			);
			if (!roomType) {
				throw new Error("Room type does not exists.");
			} else {
				//check the deletion of all rooms of the type
				if (roomType.RoomsCount == 0) {
					const result = await this.#dbContext.deleteValues(Tables.ROOMTYPES, {
						Id: this.#message.data.roomTypeId,
					});
					if (result.changes > 0) {
						resObj.success = "Successfully deleted.";
						return resObj;
					} else {
						throw new Error("All rooms of this type should be deleted.");
					}
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
		let rTypeObj = {};
		let rTypeList = [];
		//if user is an hotel owner
		try {
			this.#dbContext.open();
			const rows = await this.#dbContext.getValues(Tables.ROOMTYPES, {
				HotelId: data.HotelId,
			});
			console.log("resObj:", rows);
			resObj.success = rows;
			return resObj;
			/*		for (const rType of rows) {
				rTypeObj.Code = rType.Code;
				rTypeObj.RoomCount = rType.RoomCount;
				rTypeObj.Sqft = rType.Sqft;
				rTypeObj.Price = rType.Price;
				rTypeObj.SingleBedCount = rType.SingleBedCount;
				rTypeObj.DoubleBedCount = rType.DoubleBedCount;
				rTypeObj.TripleBedCount = rType.TripleBedCount;
			
				 let sleeps = 0;
				 if(rType.SingleBedCount>0){
					sleeps += SingleBedCount*1
				 }
				 if(rType.DoubleBedCount>0){
					sleeps += DoubleBedCount*2
				 }
				 if(rType.TripleBedCount>0){
					sleeps += TripleBedCount*3
				 }
				 rTypeObj.Sleeps = sleeps

				 //get Facility List
				 //let rows = await this.#dbContext.getValues(Tables.Facilities, {HotelId: data.HotelId});

				rTypeList.push(rTypeObj)

			}*/
		} catch (error) {
			throw error;
		} finally {
			this.#dbContext.close();
		}
	}

	async getAvailableRoomCount() {
		let resObj = {};
		console.log(this.#message);

		const hotelId = this.#message.filter.hotelId;
		const fromDate = this.#message.filter.fromDate;
		const toDate = this.#message.filter.toDate;

		try {
			this.#dbContext.open();
			const query = `SELECT 
			rt.Id AS RoomTypeId, 
			rt.RoomsCount,
            r.FromDate,
            r.ToDate,
            rr.NoOfRooms
			FROM ROOMTYPES rt 
			LEFT JOIN RESERVATIONROOMTYPES rr ON rt.Id = rr.RoomTypeId 
			LEFT JOIN RESERVATIONS r 
			ON rr.ReservationId = r.Id 
			WHERE rt.HotelId = ? AND r.Id IS NOT NULL AND (r.FromDate > ? OR r.ToDate < ?)`;

			console.log(query);
			const roomTypeRows = await this.#dbContext.runSelectQuery(query, [
				hotelId,
				fromDate,
				toDate,
			]);
			let roomTypeIds = [];
			let remainingRoomTypes = [];

			roomTypeRows.forEach(element => {
				if (!roomTypeIds.includes(parseInt(element.RoomTypeId, 10))) {
					roomTypeIds.push(parseInt(element.RoomTypeId, 10));
				}
			});

			roomTypeIds.forEach(element => {
				const roomTypeById = roomTypeRows.filter(
					room => room.RoomTypeId === element
				);
				let bookedRoomCount = 0;
				let totalRooms = 0;
				roomTypeById.forEach(roomType => {
					totalRooms = roomType.RoomsCount;
					bookedRoomCount += roomType.NoOfRooms;
				});

				let remainingRooms = {
					RoomTypeId: element,
					RemainingRoomCount: totalRooms - bookedRoomCount,
				};
				remainingRoomTypes.push(remainingRooms);
			});

			const roomTypes = await this.#dbContext.getValues(Tables.ROOMTYPES, {
				HotelId: hotelId,
			});
			let roomTypeDetails = [];
			roomTypes.forEach(element => {
				console.log("Element", element);
				console.log("Room type Ids", roomTypeIds);
				//console.log("eewrerereerere",roomTypeIds.includes(elementId))
				let elementId = parseInt(element.Id, 10);
				if (!roomTypeIds.includes(elementId)) {
					roomTypeDetails.push(element);
				} else {
					const roomType = remainingRoomTypes.filter(
						roomType => roomType.RoomTypeId === element.Id
					);
					console.log("roomType", roomType);
					console.log("roomType", roomType[0].RemainingRoomCount);
					let newRoomType = {
						Id: element.Id,
						HotelId: element.HotelId,
						Code: element.Code,
						Sqft: element.Sqft,
						Description: element.Description,
						RoomsCount: roomType[0].RemainingRoomCount,
						Price: element.Price,
						SingleBedCount: element.SingleBedCount,
						DoubleBedCount: element.DoubleBedCount,
						TripleBedCount: element.TripleBedCount,
						CreatedOn: element.CreatedOn,
						LastUpdatedOn: element.LastUpdatedOn,
					};
					roomTypeDetails.push(newRoomType);
				}
			});
			resObj.success = roomTypeDetails;
			return resObj;
		} catch (error) {
			throw error;
		} finally {
			this.#dbContext.close();
		}
	}
}
