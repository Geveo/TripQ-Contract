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
				StarRatings: (!data.StarRate ? 0 : data.StarRate),
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
				throw "Invalid request.";
			}
			const filters = this.#message.filters;
			const guestCount = this.#message.filters.GuestCount;
			const fromDate = filters.CheckInDate;
			const toDate = filters.CheckOutDate;

			let query = `SELECT DISTINCT * FROM Hotels WHERE Location LIKE '%${filters.City}%' GROUP BY Id`;

			let hotelRows = await this.#dbContext.runSelectQuery(query);

			if (!(hotelRows && hotelRows.length > 0)) {
				response.success = null;
				return response;
			}

			let hotelIdList = hotelRows.map(hr => hr.Id);
			query = `SELECT * FROM ROOMTYPES WHERE HotelId IN (${hotelIdList})`;

			let roomsList = await this.#dbContext.runSelectQuery(query);

			if (!roomsList || roomsList.length < 1) {
				response.success = null;
				return response;
			}

			//hotelIds having rooms
			hotelIdList = [...new Set(roomsList.map(rl => rl.HotelId))];
			//Hotels having rooms
			hotelRows = hotelRows.filter(hr => hotelIdList.includes(hr.Id));

			const availableHotels = [];

			// Iterate through each hotel
			for (const hotel of hotelRows) {
				// Query to retrieve available rooms for the specified dates
				const availableRoomsQuery = `SELECT 
						RT.Id AS RoomTypeId,
						RT.Code AS RoomTypeCode,
						Rt.TotalSleeps AS TotalSleepCapacity,
						RT.RoomsCount - COALESCE(SUM(CASE WHEN R.FromDate <= ? AND R.ToDate >= ? THEN RTR.NoOfRooms ELSE 0 END), 0) AS AvailableRooms
					FROM RoomTypes AS RT
					LEFT JOIN ReservationRoomTypes AS RTR ON RT.Id = RTR.RoomTypeId
					LEFT JOIN Reservations AS R ON RTR.ReservationId = R.Id
					WHERE 
						RT.HotelId = ? 
					GROUP BY 
						RT.Id;`;

				const availableRooms = await this.#dbContext.runSelectQuery(
					availableRoomsQuery,
					[ toDate, fromDate,hotel.Id]
				);
				console.log("availableRooms", availableRooms)

				// Calculate total available sleep capacity across all available rooms
				const totalAvailableCapacity = availableRooms.reduce(
					(totalCapacity, room) => {
						return (
							totalCapacity +
							room.TotalSleepCapacity * room.AvailableRooms
						);
					},
					0
				);
				// Check if total available capacity is sufficient for the guest count
				if (totalAvailableCapacity >= guestCount) {
					const hotelImages = await this.#dbContext.getValues(Tables.HOTELIMAGES, {
							HotelId: hotel.Id,
						});
					hotel.ImageURL = hotelImages;
					availableHotels.push(hotel);
				}
			}
			response.success = availableHotels;
			return response;
		} catch (error) {
			console.log("Error in getting hotels with available rooms");
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

	async getHotelsListByDestination() {
		try {
			await this.#dbContext.open();
			let resObj = {};

			if (!this.#message.filters) {
				throw "Invalid request.";
			}
			const destination = this.#message.filters.City;

			let query = `SELECT DISTINCT * FROM Hotels WHERE Location LIKE '%${destination}%' GROUP BY Id`;

			let hotelRows = await this.#dbContext.runSelectQuery(query);

			resObj.success = hotelRows;
			return resObj;
		} catch (error) {
			console.log("Error in listing hotels by destination");
		} finally {
			this.#dbContext.close();
		}
	}

	async getAvailableHotelsListByAISearchedList() {
		try {
			await this.#dbContext.open();
			let resObj = {};

			if (!this.#message.filters) {
				throw "Invalid request.";
			}
			const aiSearchedList = this.#message.filters.AISearchedList;

			let query = "SELECT DISTINCT * FROM Hotels WHERE ";

			const whereClauses = aiSearchedList.map((hotelName, index) => {
				const placeholder = `${hotelName}`;
				return `Name LIKE '%${placeholder}%'`;
			});

			query += whereClauses.join(" OR ");
			query += ` GROUP BY Id`;

			let hotelRows = await this.#dbContext.runSelectQuery(query);

			resObj.success = hotelRows;

			return resObj;
		} catch (error) {
			console.log("Error in listing hotels by AI searched list");
		} finally {
			this.#dbContext.close();
		}
	}

	async joinAndRemoveHotelDuplications(hotelList1, hotelList2) {
		try {
			const uniqueHotels = new Map();

			for (const hotel of hotelList1) {
				uniqueHotels.set(hotel.Id, hotel);
			}

			for (const hotel of hotelList2) {
				uniqueHotels.set(hotel.Id, hotel);
			}

			return Array.from(uniqueHotels.values());
		} catch (error) {
			console.log(error);
		} finally {
		}
	}

	async getHotelsListMappedWithAISearch() {
		try {
			const guestCount = this.#message.filters.GuestCount;
			const fromDate = this.#message.filters.CheckInDate;
			const toDate = this.#message.filters.CheckOutDate;

			await this.#dbContext.open();
			let response = {};

			const aiSearchedHotels = await this.getAvailableHotelsListByAISearchedList();
			const hotelsListByDestination = await this.getHotelsListByDestination();

			let uniqueList = await this.joinAndRemoveHotelDuplications(
				aiSearchedHotels.success,
				hotelsListByDestination.success
			);

			// check room availability
			let hotelIdList = uniqueList.map(hr => hr.Id);
			
			let query = `SELECT * FROM ROOMTYPES WHERE HotelId IN (${hotelIdList})`;

			let roomsList = await this.#dbContext.runSelectQuery(query);

			if (!roomsList || roomsList.length < 1) {
				response.success = null;
				return response;
			}

			hotelIdList = [...new Set(roomsList.map(rl => rl.HotelId))];
	
			uniqueList = uniqueList.filter(hr => hotelIdList.includes(hr.Id));

			let availableHotels = [];

			for (const hotel of uniqueList) {
				const availableRoomsQuery = `SELECT 
						RT.Id AS RoomTypeId,
						RT.Code AS RoomTypeCode,
						Rt.TotalSleeps AS TotalSleepCapacity,
						RT.RoomsCount - COALESCE(SUM(CASE WHEN R.FromDate <= ? AND R.ToDate >= ? THEN RTR.NoOfRooms ELSE 0 END), 0) AS AvailableRooms
					FROM RoomTypes AS RT
					LEFT JOIN ReservationRoomTypes AS RTR ON RT.Id = RTR.RoomTypeId
					LEFT JOIN Reservations AS R ON RTR.ReservationId = R.Id
					WHERE 
						RT.HotelId = ? 
					GROUP BY 
						RT.Id;`;

				let availableRooms = await this.#dbContext.runSelectQuery(
					availableRoomsQuery,
					[toDate, fromDate, hotel.Id]
				);

				// calculate total available sleep capacity across all available rooms
				const totalAvailableCapacity = availableRooms.reduce(
					(totalCapacity, room) => {
						return (
							totalCapacity + room.TotalSleepCapacity * room.AvailableRooms
						);
					},
					0
				);
				// check if total available capacity is sufficient for the guest count
				if (totalAvailableCapacity >= guestCount) {
					const hotelImages = await this.#dbContext.getValues(
						Tables.HOTELIMAGES,
						{
							HotelId: hotel.Id,
						}
					);
					hotel.ImageURL = hotelImages;
					hotel.AvailableRooms = availableRooms;
					availableHotels.push(hotel);
				}
			}
			response.success = availableHotels;
			return response;
		} catch (error) {
			console.log(error);
		} finally {
			this.#dbContext.close();
		}
	}
}
