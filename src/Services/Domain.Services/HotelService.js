const evernode = require("evernode-js-client");
const settings = require("../../settings.json").settings;
const { SqliteDatabase } = require("../Common.Services/dbHandler").default;
const { SharedService } = require("../Common.Services/SharedService");
import { Tables } from "../../Constants/Tables";
import {HotelDto} from "../../Dto/HotelDto";

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
			if (data.ImageUrls && data.ImageUrls.length > 0) {
				for (const url of data.ImageUrls) {
					const imageEntity = {
						HotelId: insertedId,
						Url: url,
					};

					if (await this.#dbContext.isTableExists(Tables.HOTELIMAGES)) {
						try {
							await this.#dbContext.insertValue(Tables.IMAGES, imageEntity);
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
        const response = {};
        if (!this.#message.filters) {
            throw ("Invalid request.");
        }
        const filters = this.#message.filters;

        const guestCount = this.#message.filters.GuestCount;

        const fromDate = new Date(filters.CheckInDate);
        const toDate = new Date(filters.CheckOutDate);

        const filteringDateRange = DateHelper.getDatesArrayInBewtween(fromDate, toDate);
        console.log("DateRange", filteringDateRange, " length: ", filteringDateRange.length);

        console.log(1);
        let query = `SELECT * FROM Hotels WHERE Location LIKE '%${filters.City}%'`;
        let hotelRows = await this.#dbContext.runSelectQuery(query);
        if (!(hotelRows && hotelRows.length > 0)) {
            response.success = null;
            return response;
        }

        let hotelIdList = hotelRows.map(hr => hr.Id);
        console.log(hotelIdList)
        query = `SELECT * FROM ROOMTYPES WHERE HotelId IN (${hotelIdList})`;
        console.log("query 2",query)

        let roomsList = await this.#dbContext.runSelectQuery(query);
        if (!roomsList || roomsList.length < 1) {
            response.success = null;
            return response;
        }

		//hotelIds having rooms
        hotelIdList = [...new Set(roomsList.map(rl => rl.HotelId))];
		//Hotels having rooms 
        hotelRows = hotelRows.filter(hr => hotelIdList.includes(hr.Id));

		// Array to store filtered hotels
		const availableHotels = [];
		
            // Iterate through each hotel
            hotelRows.forEach(async hotel => {
                // Query to retrieve available rooms for the specified dates
                const availableRoomsQuery = `
                    SELECT RT.*, 
                           (RT.TotalSleeps - COALESCE(SUM(R.RoomCount), 0)) AS availableCapacity
                    FROM ROOMTYPES RT
                    LEFT JOIN RESERVATIONS R ON RT.Id = R.RoomTypeId AND (
                        (R.FromDate <= ? AND R.ToDate >= ?)
                        OR
                        (R.FromDate >= ? AND R.ToDate <= ?)
                        OR
                        (R.FromDate <= ? AND R.ToDate >= ?)
                    )
                    WHERE RT.HotelId = ?
                    GROUP BY RT.Id`;
					
					await this.#dbContext.runSelectQuery(availableRoomsQuery, 
						[fromDate, toDate, fromDate, toDate, fromDate, toDate, hotel.Id],
						 (err, availableRooms) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    // Calculate total available sleep capacity across all rooms
                    const totalAvailableCapacity = availableRooms.reduce((totalCapacity, room) => {
                        return totalCapacity + room.availableCapacity;
                    }, 0);

                    // Check if total available capacity is sufficient for the guest count
                    if (totalAvailableCapacity >= guestCount) {
                        availableHotels.push(hotel);
                    }

                    // Resolve the promise with the filtered hotels after iterating through all hotels
                    if (hotelRows.indexOf(hotel) === hotelRows.length - 1) {
                        resolve(availableHotels);
                    }
                });
            });

			response.success = availableHotels;
			return response;


/*

        let roomIdList = roomsList.map(rl => rl.Id);
        console.log("HotelRawssSS: ", hotelRows )

        query = `SELECT * from Reservations WHERE RoomTypeId IN (${roomIdList})`;
        const reservationList = await this.#dbContext.runSelectQuery(query);
        console.log('Reservationlist: ' ,reservationList)

		// No reservation means, all the rooms are free for new reservations
        if (!reservationList || reservationList.length < 1) 
		{  roomsList = roomsList.filter(r => r.MaxRoomCount >= necessaryRoomCount);
            hotelIdList = [...new Set(roomsList.map(rl => rl.HotelId))];
            hotelRows = hotelRows.filter(hr => hotelIdList.includes(hr.Id));
            console.log(44)
            const resultList = await this.#prepareSearchResultPhase2(hotelRows, roomsList, filteringDateRange.length);
            response.success = { searchResult: resultList };
            return response;
        }
        console.log(4)
        // Filter avaialble roomList by checking the avaialble reservation dates

        // First, create an array of rooms  with their reservedDates and count as arrays.
        let availableRoomList = [];
        console.log(5);
        for (let room of roomsList) {
            let roomObj1 = { roomId: room.Id, maxRoomCount: room.MaxRoomCount, ...room, checkedDates: [], roomCounts: [] }
            const reservedDates = [];
            const reservedRoomCounts = [];
            reservationList.forEach(rv => {
                if (rv.RoomId == room.Id) {
                    reservedDates.push({ checkInDate: rv.FromDate, checkOutDate: rv.ToDate })
                    reservedRoomCounts.push(rv.RoomCount);
                }
            });
            roomObj1.checkedDates = reservedDates;
            roomObj1.roomCounts = reservedRoomCounts;
            availableRoomList.push(roomObj1);
        }

        console.log("RoomList111: ", roomsList);

        // Second, loop the room objects and their reserved dates for availability check. 
        // If 
        console.log(6);
        const removingRoomIds = [];
        for (const idx in availableRoomList) {
            const roomObj = availableRoomList[idx];
            console.log("Room obj:", idx,  roomObj);
            if (roomObj.checkedDates.length == 0) {
                continue;
            }

            for (let filterDate of filteringDateRange) {
                let reservedRoomCount = 0;
                for (const dateIdx in roomObj.checkedDates) {
                    const reservedRange = (roomObj.checkedDates)[dateIdx];
                    if (DateHelper.isDateInRange(filterDate, reservedRange.checkInDate, reservedRange.checkOutDate)) {
                        reservedRoomCount += (roomObj.roomCounts)[dateIdx];
                    }
                }

                console.log("Date: ", filterDate, "RoomId: ", roomObj.roomId, "reservedRoomCount: ", reservedRoomCount, "necessaryRoomCount: ", necessaryRoomCount, "maxRoomCount: ", roomObj.maxRoomCount );
                if ((Number(reservedRoomCount) + Number(necessaryRoomCount)) > Number(roomObj.maxRoomCount)) {
                    removingRoomIds.push(roomObj.roomId);
                }
            }
        }

        console.log("Removing Id List: ", removingRoomIds);

        console.log(7);
        availableRoomList = availableRoomList.filter(ar => !removingRoomIds.includes(ar.roomId));
        console.log("Avaialble room list: ", availableRoomList);

        hotelIdList = [...new Set(availableRoomList.map(rl => rl.HotelId))];
        hotelRows = hotelRows.filter(hr => hotelIdList.includes(hr.Id));

        const resultList = await this.#prepareSearchResultPhase2(hotelRows, availableRoomList, filteringDateRange.length);
        console.log(8);
        console.log(resultList)
        response.success = { searchResult: resultList };
        return response;*/
    }
/*
	async #prepareSearchResultPhase2(hotelList, roomList, noOfDays = 0) {
		const resultList = [];

		for (const hotel of hotelList) {
			// Get one image url if exists for the hotel
			let query = `SELECT Id, Url FROM Images WHERE HotelId = ${hotel.Id}`;
			const img = await this.#dbContext.runNativeGetFirstQuery(query);

			const hotelObj = {
				Id: hotel.Id,
				city: hotel.City,
				Name: hotel.Name,
				noOfDays: noOfDays,
				roomDetails: [],
			};
			if (img) {
				hotelObj.ImageUrl = img.Url;
			}
			roomList.forEach(r => {
				if (hotel.Id == r.HotelId) {
					hotelObj.roomDetails.push(r);
				}
			});

			resultList.push(hotelObj);
		}
		return resultList;
	}
	// async #checkIfHotelExists(walletAddress) {
	// 	const query = `SELECT * FROM HOTELS WHERE HotelWalletAddress = ?`;
	// 	try {
	// 		const res = await this.#dbContext.runNativeGetFirstQuery(query, [
	// 			walletAddress,
	// 		]);
	// 		if (res && res.length > 0) {
	// 			return res;
	// 		} else {
	// 			return null;
	// 		}
	// 	} catch (error) {
	// 		throw error;
	// 	}
	// }
*/
	// async #getAnAvailableOffer() {
	// 	try {
	// 		const createdOffers = await this.#contractAcc.getNftOffers();

	// 		let rows = await this.#db.getValues("Hotels", null);
	// 		if (rows.length > 0 && createdOffers && createdOffers.length > 0) {
	// 			let takenNfts = rows.map(r => r.HotelNftId);

	// 			const availableOffers = createdOffers.filter(
	// 				co => !takenNfts.includes(co.NFTokenID)
	// 			);
	// 			return availableOffers.length == 0 ? null : availableOffers[0];
	// 		} else if (createdOffers && createdOffers.length > 0) {
	// 			return createdOffers[0];
	// 		}

	// 		return null;
	// 	} catch (error) {
	// 		throw error;
	// 	}
	// }

	// async #confirmHotelRegistration() {
	// 	const rowId = this.#message.data.rowId;
	// 	const walletAddress = this.#message.data.hotelWalletAddress;

	// 	let response = {};

	// 	const rows = await this.#db.getValues("Hotels", { Id: rowId });
	// 	if (rows.length != 0) {
	// 		const regNftId = rows[0].HotelNftId;

	// 		// Check for reg nft existence in the account(If nft acceptance is successful)
	// 		if (!(await this.#isNftExists(walletAddress, regNftId)))
	// 			throw "Registration Nft is absent.";

	// 		await this.#db.updateValue(
	// 			"Hotels",
	// 			{ IsRegistered: 1, HotelWalletAddress: walletAddress },
	// 			{ Id: rowId }
	// 		);
	// 	} else {
	// 		throw "Error in confirming registration. Re-register please.";
	// 	}

	// 	response.success = { hotelId: rowId };
	// 	return response;
	// }

	// async #isNftExists(walletAddress, nftId) {
	// 	const acc = new evernode.XrplAccount(walletAddress, null, {
	// 		xrplApi: this.#xrplApi,
	// 	});
	// 	try {
	// 		const nfts = await acc.getNfts();
	// 		return nfts.find(t => t.NFTokenID == nftId);
	// 	} catch (error) {
	// 		throw error;
	// 	} finally {
	// 	}
	// }
	async getHotelsListByWalletAddress() {
        let resObj = {};
        let debugCode = 0;

        try {
			await this.#dbContext.open();
			console.log(this.#message);
			
			const hotels = await this.#dbContext.getValues(Tables.HOTELS, { WalletAddress: this.#message.filters.WalletAddress });
				
			debugCode++;
			
			resObj.success = hotels.length === 0 ? [] : hotels.map(hotel => {
				const hotelObj = new HotelDto();
				hotelObj.id = hotel.Id;
				hotelObj.name = hotel.Name;
				hotelObj.starRate = hotel.StarRate;
				hotelObj.contactDetails = hotel.ContactDetails;
				hotelObj.location = hotel.Location;
				hotelObj.facilities = hotel.Facilities;
				hotelObj.walletAddress = hotel.WalletAddress;
			
				return hotelObj; 
			});
			
			debugCode++;
			console.log(resObj);
			
			return resObj;
			
        } catch (error) {
           console.log("Error in listing hotels")
        } finally {
            this.#dbContext.close();
        }
    }

	// async #getHotels() {
	// 	let query = `SELECT Hotels.Id, Hotels.HotelWalletAddress, Hotels.HotelNftId, Hotels.OwnerName, Hotels.Name, Hotels.Description, Hotels.AddressLine1, Hotels.AddressLine2, Hotels.City, Hotels.DistanceFromCenter, Hotels.Email, Hotels.ContactNumber1,
	//                           Images.Id AS ImageId, Images.Url, HotelHFacilities.HFacilityId AS FacilityId
	//                    FROM Hotels
	//                    LEFT OUTER JOIN Images
	//                    ON Hotels.Id = Images.HotelId
	//                    LEFT OUTER JOIN HotelHFacilities
	//                    ON Hotels.Id = HotelHFacilities.HotelId
	//                    WHERE Hotels.IsRegistered = 1 `; // Ending space is required

	// 	let filterString = "AND ";
	// 	let filters = null;
	// 	if (this.#message.filters) {
	// 		filters = this.#message.filters;

	// 		// join to a string
	// 		for (const key in filters) {
	// 			filterString += `Hotels.${key}=${filters[key]} AND `;
	// 		}
	// 		filterString = filterString.slice(0, -5);
	// 		query = query + filterString;
	// 	}

	// 	let response = {};

	// 	const hotels = await this.#db.runNativeGetAllQuery(query);

	// 	// Creating new object array
	// 	const hotelList = [];
	// 	const hotelNames = [...new Set(hotels.map(h => h.Id))];
	// 	for (let idx in hotelNames) {
	// 		const newHotel = {};
	// 		const imgObjects = [];
	// 		const facilityIds = [];

	// 		hotels
	// 			.filter(h => h.Id == hotelNames[idx])
	// 			.forEach((h, idxx) => {
	// 				if (idxx == 0) {
	// 					newHotel.Id = h.Id;
	// 					newHotel.Name = h.Name;
	// 					newHotel.HotelWalletAddress = h.HotelWalletAddress;
	// 					newHotel.HotelNftId = h.HotelNftId;
	// 					newHotel.OwnerName = h.OwnerName;
	// 					newHotel.Description = h.Description;
	// 					newHotel.City = h.City;
	// 					newHotel.AddressLine1 = h.AddressLine1;
	// 					newHotel.AddressLine2 = h.AddressLine2;
	// 					newHotel.DistanceFromCenter = h.DistanceFromCenter;
	// 					newHotel.Email = h.Email;
	// 					newHotel.ContactNumber1 = h.ContactNumber1;
	// 					newHotel.ContactNumber2 = h.ContactNumber2 ?? null;
	// 				}

	// 				if (h.ImageId && h.Url) {
	// 					imgObjects.push({ Id: h.ImageId, Url: h.Url });
	// 				}

	// 				if (h.FacilityId) {
	// 					facilityIds.push(h.FacilityId);
	// 				}
	// 			});

	// 		newHotel.Images = [...new Map(imgObjects.map(m => [m.Id, m])).values()];
	// 		newHotel.Facilities = [...new Set(facilityIds)];

	// 		hotelList.push(newHotel);
	// 	}

	// 	response.success = { hotelList: hotelList };
	// 	return response;
	// }

	// 	async #getHotelsWithRoomSearch() {
	// 		const response = {};
	// 		if (!this.#message.filters) {
	// 			throw "Invalid request.";
	// 		}
	// 		const filters = this.#message.filters;

	// 		// Assumption : ( no of  people = no of rooms required)
	// 		const necessaryRoomCount = this.#message.filters.PeopleCount;

	// 		const fromDateFilter = new Date(filters.CheckInDate);
	// 		const toDateFilter = new Date(filters.CheckOutDate);

	// 		const filteringDateRange = DateHelper.getDatesArrayInBewtween(
	// 			fromDateFilter,
	// 			toDateFilter
	// 		);
	// 		console.log(
	// 			"DateRange",
	// 			filteringDateRange,
	// 			" length: ",
	// 			filteringDateRange.length
	// 		);

	// 		console.log(1);
	// 		let query = `SELECT * FROM Hotels WHERE City LIKE '%${filters.City}%'`;
	// 		let hotelRows = await this.#db.runNativeGetAllQuery(query);
	// 		if (!(hotelRows && hotelRows.length > 0)) {
	// 			response.success = { searchResult: null };
	// 			return response;
	// 		}
	// 		let hotelIdList = hotelRows.map(hr => hr.Id);
	// 		console.log(hotelIdList);
	// 		console.log(2);
	// 		query = `SELECT * FROM Rooms WHERE HotelId IN (${hotelIdList})`;
	// 		console.log(query);

	// 		let roomsList = await this.#db.runNativeGetAllQuery(query);
	// 		if (!roomsList || roomsList.length < 1) {
	// 			response.success = { searchResult: null };
	// 			return response;
	// 		}
	// 		hotelIdList = [...new Set(roomsList.map(rl => rl.HotelId))];
	// 		hotelRows = hotelRows.filter(hr => hotelIdList.includes(hr.Id));
	// 		let roomIdList = roomsList.map(rl => rl.Id);
	// 		console.log("HotelRawssSS: ", hotelRows);

	// 		query = `SELECT * from Reservations WHERE RoomId IN (${roomIdList})`;
	// 		const reservationList = await this.#db.runNativeGetAllQuery(query);
	// 		console.log("Reservationlist: ", reservationList);

	// 		if (!reservationList || reservationList.length < 1) {
	// 			// No reservation means, all the rooms are free for new reservations
	// 			roomsList = roomsList.filter(r => r.MaxRoomCount >= necessaryRoomCount);
	// 			hotelIdList = [...new Set(roomsList.map(rl => rl.HotelId))];
	// 			hotelRows = hotelRows.filter(hr => hotelIdList.includes(hr.Id));
	// 			console.log(44);
	// 			const resultList = await this.#prepareSearchResultPhase2(
	// 				hotelRows,
	// 				roomsList,
	// 				filteringDateRange.length
	// 			);
	// 			response.success = { searchResult: resultList };
	// 			return response;
	// 		}
	// 		console.log(4);
	// 		// Filter avaialble roomList by checking the avaialble reservation dates

	// 		// First, create an array of rooms  with their reservedDates and count as arrays.
	// 		let availableRoomList = [];
	// 		console.log(5);
	// 		for (let room of roomsList) {
	// 			let roomObj1 = {
	// 				roomId: room.Id,
	// 				maxRoomCount: room.MaxRoomCount,
	// 				...room,
	// 				checkedDates: [],
	// 				roomCounts: [],
	// 			};
	// 			const reservedDates = [];
	// 			const reservedRoomCounts = [];
	// 			reservationList.forEach(rv => {
	// 				if (rv.RoomId == room.Id) {
	// 					reservedDates.push({
	// 						checkInDate: rv.FromDate,
	// 						checkOutDate: rv.ToDate,
	// 					});
	// 					reservedRoomCounts.push(rv.RoomCount);
	// 				}
	// 			});
	// 			roomObj1.checkedDates = reservedDates;
	// 			roomObj1.roomCounts = reservedRoomCounts;
	// 			availableRoomList.push(roomObj1);
	// 		}

	// 		console.log("RoomList111: ", roomsList);

	// 		// Second, loop the room objects and their reserved dates for availability check.
	// 		// If
	// 		console.log(6);
	// 		const removingRoomIds = [];
	// 		for (const idx in availableRoomList) {
	// 			const roomObj = availableRoomList[idx];
	// 			console.log("Room obj:", idx, roomObj);
	// 			if (roomObj.checkedDates.length == 0) {
	// 				continue;
	// 			}

	// 			for (let filterDate of filteringDateRange) {
	// 				let reservedRoomCount = 0;
	// 				for (const dateIdx in roomObj.checkedDates) {
	// 					const reservedRange = roomObj.checkedDates[dateIdx];
	// 					if (
	// 						DateHelper.isDateInRange(
	// 							filterDate,
	// 							reservedRange.checkInDate,
	// 							reservedRange.checkOutDate
	// 						)
	// 					) {
	// 						reservedRoomCount += roomObj.roomCounts[dateIdx];
	// 					}
	// 				}

	// 				console.log(
	// 					"Date: ",
	// 					filterDate,
	// 					"RoomId: ",
	// 					roomObj.roomId,
	// 					"reservedRoomCount: ",
	// 					reservedRoomCount,
	// 					"necessaryRoomCount: ",
	// 					necessaryRoomCount,
	// 					"maxRoomCount: ",
	// 					roomObj.maxRoomCount
	// 				);
	// 				if (
	// 					Number(reservedRoomCount) + Number(necessaryRoomCount) >
	// 					Number(roomObj.maxRoomCount)
	// 				) {
	// 					removingRoomIds.push(roomObj.roomId);
	// 				}
	// 			}
	// 		}

	// 		console.log("Removing Id List: ", removingRoomIds);

	// 		console.log(7);
	// 		availableRoomList = availableRoomList.filter(
	// 			ar => !removingRoomIds.includes(ar.roomId)
	// 		);
	// 		console.log("Avaialble room list: ", availableRoomList);

	// 		hotelIdList = [...new Set(availableRoomList.map(rl => rl.HotelId))];
	// 		hotelRows = hotelRows.filter(hr => hotelIdList.includes(hr.Id));

	// 		const resultList = await this.#prepareSearchResultPhase2(
	// 			hotelRows,
	// 			availableRoomList,
	// 			filteringDateRange.length
	// 		);
	// 		console.log(8);
	// 		console.log(resultList);
	// 		response.success = { searchResult: resultList };
	// 		return response;
	// 	}

	// 	async #getSingleHotelWithRoomsAvaialable() {
	// 		const response = {};
	// 		if (!this.#message.filters) {
	// 			throw "Invalid request.";
	// 		}
	// 		const filters = this.#message.filters;

	// 		// Assumption : ( no of  people = no of rooms required)
	// 		const necessaryRoomCount = this.#message.filters.RoomCount;
	// 		const fromDateFilter = new Date(filters.CheckInDate);
	// 		const toDateFilter = new Date(filters.CheckOutDate);
	// 		const hotelId = filters.HotelId;

	// 		const filteringDateRange = DateHelper.getDatesArrayInBewtween(
	// 			fromDateFilter,
	// 			toDateFilter
	// 		);
	// 		console.log(
	// 			"DateRange",
	// 			filteringDateRange,
	// 			" length: ",
	// 			filteringDateRange.length
	// 		);

	// 		let query = `SELECT * FROM Hotels WHERE ID=${hotelId}`;
	// 		let hotel = await this.#db.runNativeGetFirstQuery(query);
	// 		if (!hotel) {
	// 			throw "No hotel Found";
	// 		}
	// 		query = `SELECT * FROM Rooms WHERE HotelId IN (${hotelId})`;
	// 		let roomsList = await this.#db.runNativeGetAllQuery(query);
	// 		if (!roomsList || roomsList.length < 1) {
	// 			throw "No rooms found.";
	// 		}
	// 		let roomIdList = roomsList.map(rl => rl.Id);
	// 		query = `SELECT * from Reservations WHERE RoomId IN (${roomIdList})`;
	// 		const reservationList = await this.#db.runNativeGetAllQuery(query);

	// 		if (!reservationList || reservationList.length < 1) {
	// 			// No reservation means, all the rooms are free for new reservations
	// 			roomsList = roomsList.filter(r => r.MaxRoomCount >= necessaryRoomCount);
	// 			roomsList.forEach(r => (r.avaialableRoomCount = r.MaxRoomCount));
	// 			const resultList = await this.#prepareSearchResultPhase3(
	// 				hotel,
	// 				roomsList,
	// 				filteringDateRange.length
	// 			);
	// 			response.success = { searchResult: resultList };
	// 			return response;
	// 		}

	// 		// Filter avaialble roomList by checking the avaialble reservation dates

	// 		// First, create an array of rooms  with their reservedDates and count as arrays.
	// 		let availableRoomList = [];
	// 		console.log(5);
	// 		for (let room of roomsList) {
	// 			let roomObj1 = {
	// 				roomId: room.Id,
	// 				maxRoomCount: room.MaxRoomCount,
	// 				...room,
	// 				checkedDates: [],
	// 				roomCounts: [],
	// 			};
	// 			const reservedDates = [];
	// 			const reservedRoomCounts = [];
	// 			reservationList.forEach(rv => {
	// 				if (rv.RoomId == room.Id) {
	// 					reservedDates.push({
	// 						checkInDate: rv.FromDate,
	// 						checkOutDate: rv.ToDate,
	// 					});
	// 					reservedRoomCounts.push(rv.RoomCount);
	// 				}
	// 			});
	// 			roomObj1.checkedDates = reservedDates;
	// 			roomObj1.roomCounts = reservedRoomCounts;
	// 			availableRoomList.push(roomObj1);
	// 		}

	// 		// Second, loop the room objects and their reserved dates for availability check.
	// 		// If
	// 		console.log(6);
	// 		const removingRoomIds = [];
	// 		for (const idx in availableRoomList) {
	// 			console.log(61);
	// 			const roomObj = availableRoomList[idx];
	// 			availableRoomList[idx].avaialableRoomCount = roomObj.MaxRoomCount;

	// 			if (roomObj.checkedDates.length == 0) {
	// 				console.log(62);
	// 				continue;
	// 			}

	// 			for (let filterDate of filteringDateRange) {
	// 				console.log(63);
	// 				let reservedRoomCount = 0;
	// 				for (const dateIdx in roomObj.checkedDates) {
	// 					console.log(631);
	// 					const reservedRange = roomObj.checkedDates[dateIdx];
	// 					if (
	// 						DateHelper.isDateInRange(
	// 							filterDate,
	// 							reservedRange.checkInDate,
	// 							reservedRange.checkOutDate
	// 						)
	// 					) {
	// 						console.log(632);
	// 						reservedRoomCount += roomObj.roomCounts[dateIdx];
	// 					}
	// 				}

	// 				if (
	// 					Number(reservedRoomCount) + Number(necessaryRoomCount) >
	// 					Number(roomObj.maxRoomCount)
	// 				) {
	// 					console.log(633);
	// 					removingRoomIds.push(roomObj.roomId);
	// 				}

	// 				if (availableRoomList[idx].avaialableRoomCount == 0) {
	// 					console.log(634);
	// 					availableRoomList[idx].avaialableRoomCount =
	// 						availableRoomList[idx].maxRoomCount - reservedRoomCount;
	// 				} else if (
	// 					availableRoomList[idx].avaialableRoomCount >
	// 					availableRoomList[idx].maxRoomCount - reservedRoomCount
	// 				) {
	// 					console.log(635);
	// 					availableRoomList[idx].avaialableRoomCount =
	// 						availableRoomList[idx].maxRoomCount - reservedRoomCount;
	// 				}
	// 			}
	// 		}

	// 		availableRoomList = availableRoomList.filter(
	// 			ar => !removingRoomIds.includes(ar.roomId)
	// 		);
	// 		console.log(JSON.stringify(availableRoomList));

	// 		const resultList = await this.#prepareSearchResultPhase3(
	// 			hotel,
	// 			availableRoomList,
	// 			filteringDateRange.length
	// 		);
	// 		console.log(8);
	// 		console.log(resultList);
	// 		response.success = { searchResult: resultList };
	// 		return response;
	// 	}

	// 	async #prepareSearchResultPhase3(hotel, roomList, noOfDays = 0) {
	// 		const resultList = { ...hotel };
	// 		let query = `SELECT Id, Url FROM Images WHERE HotelId = ${hotel.Id}`;
	// 		const imgs = await this.#db.runNativeGetAllQuery(query);
	// 		if (imgs) {
	// 			resultList.ImageUrls = imgs;
	// 		}

	// 		resultList.RoomDetails = [];
	// 		for (const ri of roomList) {
	// 			query = `SELECT RFacilityId FROM RoomFacilities WHERE RoomId=${ri.Id}`;
	// 			const ress = await this.#db.runNativeGetAllQuery(query);
	// 			if (ress && ress.length > 0) {
	// 				ri.facilityIds = ress;
	// 			}
	// 			resultList.RoomDetails.push(ri);
	// 		}

	// 		//Get hotelFacilities
	// 		query = `SELECT HFacilityId FROM HotelHFacilities  WHERE HotelId=${hotel.Id}`;
	// 		const ress = await this.#db.runNativeGetAllQuery(query);
	// 		if (ress && ress.length > 0) {
	// 			resultList.facilityIds = ress;
	// 		}

	// 		return resultList;
	// 	}

	

	// 	async #deregisterHotel() {
	// 		let response = {};

	// 		if (!this.#message.data.HotelNftId) throw "HotelNftId is absent in the request";

	// 		const query = `SELECT HotelNftId FROM Hotels WHERE HotelNftId = "${
	// 			this.#message.data.HotelNftId
	// 		}"`;
	// 		const row = await this.#db.runNativeGetFirstQuery(query);
	// 		if (!row) throw "The relevant Hotel token Id not found.";

	// 		// burn the record
	// 		await this.#contractAcc.burnNft(row.HotelNftId, row.HotelWalletAddress);

	// 		// Delete the record
	// 		await this.#db.deleteValues("Hotels", { HotelNftId: row.HotelNftId });

	// 		response.success = `Hotel ${row.Name} deregistered successfully.`;
	// 		return response;
	// 	}

	// 	async #rateHotel() {
	// 		let response = {};
	// 		if (
	// 			!(
	// 				this.#message.data &&
	// 				this.#message.data.HotelId &&
	// 				this.#message.data.CustomerId
	// 			)
	// 		)
	// 			throw "Invalid Request.";
	// 		const data = this.#message.data;

	// 		// Thnking the hotelId and CustomerId records exists
	// 		const rateEntity = {
	// 			RatingScore: data.RatingScore,
	// 			CustomerId: data.CustomerId,
	// 			HotelId: data.HotelId,
	// 			RatingDate: data.RatingDate,
	// 		};

	// 		let rateId;
	// 		if (await this.#db.isTableExists("Ratings")) {
	// 			rateId = (await this.#db.insertValue("Ratings", rateEntity)).lastId;
	// 		} else {
	// 			throw "Ratings table not found.";
	// 		}

	// 		response.success = { rateId: rateId };
	// 		return response;
	// 	}
}
