const evernode = require("evernode-js-client");
const settings = require("../../settings.json").settings;
const { SqliteDatabase } = require("../Common.Services/dbHandler").default;
const { SharedService } = require("../Common.Services/SharedService");
import { Tables } from "../../Constants/Tables";
import { HotelDto } from "../../Dto/HotelDto";

export class HotelService {
	#message = null;
	#dbPath = settings.dbPath;
	#dbContext = null;

	#date = SharedService.getCurrentTimestamp();
	constructor(message) {
		this.#message = message;
		this.#dbContext = new SqliteDatabase(this.#dbPath);
	}

	async registerHotel() {
		let resObj = {};

		try {
			this.#dbContext.open();
			const data = this.#message.data;
			const hotelEntity = {
				Name: data.Name,
				Description: data.Description,
				StarRatings: data.StarRate,
				Location: data.Location,
				ContactDetails: data.ContactDetails,
				Facilities: data.Facilities,
				WalletAddress: data.WalletAddress,
				CreatedOn: this.#date,
			};

			// Saving to the hotel table
			const rowId = await this.#dbContext.insertValue(Tables.HOTELS, hotelEntity);

			// Saving to the image table
			if (data.ImageURLs && data.ImageURLs.length > 0) {
				for (const url of data.ImageURLs) {
					const imageEntity = {
						HotelId: rowId.lastId,
						ImageURL: url,
					};

					if (await this.#dbContext.isTableExists(Tables.HOTELIMAGES)) {
						try {
							await this.#dbContext.insertValue(
								Tables.HOTELIMAGES,
								imageEntity
							);
						} catch (error) {
							throw `Error occured in image saving: ${e}`;
						}
					} else {
						throw "Image table not found.";
					}
				}
			}

			resObj.success = { rowId: rowId };
			return resObj;
		} catch (error) {
		} finally {
			this.#dbContext.close();
		}
	}


	async getHotelsWithRoomSearch() {
		try {
			await this.#dbContext.open();
			const response = {};
        if (!this.#message.filters) {
            throw ("Invalid request.");
        }
        const filters = this.#message.filters;
		console.log("filters:", filters);
        const guestCount = this.#message.filters.GuestCount;
        const fromDate = filters.CheckInDate;
        const toDate = filters.CheckOutDate;
		
        let query = `SELECT DISTINCT H.*, I.ImageURL FROM Hotels H
					left join HOTELIMAGES I on I.hotelId = H.Id
					WHERE Location LIKE '%${filters.City}%' GROUP BY H.Id`;

		
        let hotelRows = await this.#dbContext.runSelectQuery(query);

		console.log(hotelRows)

        if (!(hotelRows && hotelRows.length > 0)) {
            response.success = null;
            return response;
        }

        let hotelIdList = hotelRows.map(hr => hr.Id);
        console.log(hotelIdList)
        query = `SELECT * FROM ROOMTYPES WHERE HotelId IN (${hotelIdList})`;

        let roomsList = await this.#dbContext.runSelectQuery(query);
        if (!roomsList || roomsList.length < 1) {
            response.success = null;
            return response;
        }
		console.log("roomsList", roomsList)

		//hotelIds having rooms
        hotelIdList = [...new Set(roomsList.map(rl => rl.HotelId))];
		console.log("hotelIdList: ",hotelIdList)
		//Hotels having rooms 
        hotelRows = hotelRows.filter(hr => hotelIdList.includes(hr.Id));

		const availableHotels = [];
		
            // Iterate through each hotel
			for(const hotel of hotelRows ){
				// Query to retrieve available rooms for the specified dates
						const availableRoomsQuery = `SELECT rt.Id AS RoomTypeId,
							rt.Code AS RommType,
							CASE
								WHEN SUM(rrt.NoOfRooms) IS NULL THEN 0
								ELSE SUM(rrt.NoOfRooms)
							END TotalBookedRooms,
							CASE
								WHEN SUM(rrt.NoOfRooms) IS NULL THEN rt.RoomsCount - 0
								ELSE rt.RoomsCount - SUM(rrt.NoOfRooms)
							END AvailableRoomCount,
							rt.RoomsCount AS TotalRoom,
							rt.TotalSleeps AS TotalSleepCapacity
						FROM RoomTypes rt
							left join ReservationRoomTypes rrt on rt.Id = rrt.RoomtypeId 
							left join Reservations r on r.Id = rrt.ReservationId 
						where rt.HotelId = ? AND
							((r.Id IS NULL AND rrt.Id IS NULL) OR (r.FromDate > ? OR r.ToDate < ?))
						group by rt.Id`;

						console.log("hotel.Id :",hotel.Id)
					
					const availableRooms = await this.#dbContext.runSelectQuery(availableRoomsQuery,
						 [hotel.Id, toDate, fromDate]);

						 console.log("availableRooms :",availableRooms)
						 /*rt.Id AS RoomTypeId,
						rt.RoomsCount - COALESCE(SUM(rrt.NoOfRooms), 0) AS AvailableRoomCount,
						TotalSleeps AS TotalSleepCapacity
						AND
						(r.Id IS NULL OR (r.FromDate > '?' OR r.ToDate > '?'))

						AND ((r.Id IS NULL AND rrt.Id IS NULL) OR ((r.Id IS NOT NULL AND rrt.Id IS NOT NULL) AND r.HotelId = rt.HotelId AND r.Id = rrt.ReservationId))  
						*/

                     // Calculate total available sleep capacity across all available rooms
					 const totalAvailableCapacity = availableRooms.reduce((totalCapacity, room) => {
                        return totalCapacity + room.TotalSleepCapacity*room.AvailableRoomCount;
                    }, 0);
					console.log("totalAvailableCapacity :",totalAvailableCapacity)

                    // Check if total available capacity is sufficient for the guest count
                    if (totalAvailableCapacity >= guestCount) {
                        availableHotels.push(hotel);
                    }

                };
			console.log("availableHotels :",availableHotels)
			response.success = availableHotels;
			return response;
		}catch(error) {
			console.log("Error in getting hotels with available rooms")
		} finally {
			this.#dbContext.close();
		}
    }

	async getRecentHotels(){
		let resObj = {};

		try {
			await this.#dbContext.open();

			let query = `SELECT DISTINCT H.*, I.ImageURL FROM Hotels H
						left join HOTELIMAGES I on I.hotelId = H.Id
						GROUP BY H.Id
						LIMIT 5`;

			let hotelRows = await this.#dbContext.runSelectQuery(query);

			console.log(hotelRows)

			if (!(hotelRows && hotelRows.length > 0)) {
				response.success = null;
				return response;
			}
			resObj.success = hotelRows;
			return resObj;

		} catch (error) {
			console.log("Error in listing hotel images");
		} finally {
			this.#dbContext.close();
		}

	}

	async getHotelsListByWalletAddress() {
		let resObj = {};
		let debugCode = 0;

		try {
			await this.#dbContext.open();
			console.log(this.#message);

			const hotels = await this.#dbContext.getValues(Tables.HOTELS, {
				WalletAddress: this.#message.filters.WalletAddress,
			});

			debugCode++;

			resObj.success =
				hotels.length === 0
					? []
					: hotels.map(hotel => {
							const hotelObj = new HotelDto();
							hotelObj.id = hotel.Id;
							hotelObj.name = hotel.Name;
							hotelObj.starRate = hotel.StarRatings;
							hotelObj.contactDetails = hotel.ContactDetails;
							hotelObj.location = hotel.Location;
							hotelObj.facilities = hotel.Facilities;
							hotelObj.walletAddress = hotel.WalletAddress;
							hotelObj.description = hotel.Description;
							return hotelObj;
					  });

			debugCode++;
			console.log(resObj);

			return resObj;
		} catch (error) {
			console.log("Error in listing hotels");
		} finally {
			this.#dbContext.close();
		}
	}

	async getHotelImagesById() {
		let resObj = {};
		let debugCode = 0;

		try {
			await this.#dbContext.open();
			console.log(this.#message);

			const hotelImages = await this.#dbContext.getValues(Tables.HOTELIMAGES, {
				HotelId: this.#message.filters.Id,
			});

			debugCode++;

			resObj.success = hotelImages;

			debugCode++;

			return resObj;
		} catch (error) {
			console.log("Error in listing hotel images");
		} finally {
			this.#dbContext.close();
		}
	}

	async getHotelById() {
		let resObj = {};
		let debugCode = 0;

		console.log("Taking hotels by Id...............");
		try {
			await this.#dbContext.open();

			const hotel = await this.#dbContext.getValues(Tables.HOTELS, {
				Id: this.#message.filters.Id,
			});

			const hotelDetails = new HotelDto();
			hotelDetails.id = hotel.Id;
			hotelDetails.name = hotel.Name;
			hotelDetails.starRate = hotel.StarRatings;
			hotelDetails.contactDetails = hotel.ContactDetails;
			hotelDetails.location = hotel.Location;
			hotelDetails.facilities = hotel.Facilities;
			hotelDetails.walletAddress = hotel.WalletAddress;
			hotelDetails.description = hotel.Description;
			
			const hotelImages = await this.#dbContext.getValues(Tables.HOTELIMAGES, {
				HotelId: this.#message.filters.Id,
			});
			debugCode++;

			console.log("Hotel details", hotel);
			console.log(hotelImages);
			
			resObj.success = {
                hotelDetails: hotel,
                hotelImages: hotelImages,
            };

			console.log(resObj);
			debugCode++;

			return resObj;
		} catch (error) {
			console.log("Error in listing hotel images");
		} finally {
			this.#dbContext.close();
		}
	}
}
