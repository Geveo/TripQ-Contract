import { SharedService } from "../Services/Common.Services/SharedService";
import { Tables } from "../Constants/Tables";

const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const settings = require("../settings.json").settings;

export class DBInitializer {
	static #db = null;

	static async init() {
		// If database does not exist. (In an initial run)
		if (!fs.existsSync(settings.dbPath)) {
			this.#db = new sqlite3.Database(settings.dbPath);

			// Create table ContractVersion
			await this.#runQuery(`CREATE TABLE IF NOT EXISTS ${Tables.CONTRACTVERSION} (
				Id INTEGER,
				Version FLOAT NOT NULL,
				Description Text,
				CreatedOn INTEGER,
				LastUpdatedOn INTEGER,
				PRIMARY KEY("Id" AUTOINCREMENT)
			)`);

			// Create table SqlScriptMigrations
			await this.#runQuery(`CREATE TABLE IF NOT EXISTS ${Tables.SQLSCRIPTMIGRATIONS} (
			Id INTEGER,
			Sprint TEXT NOT NULL,
			ScriptName TEXT NOT NULL,
			ExecutedTimestamp TEXT, 
			ConcurrencyKey TEXT
				CHECK (ConcurrencyKey LIKE '0x%' AND length(ConcurrencyKey) = 18),
			PRIMARY KEY("Id" AUTOINCREMENT)
		)`);
            // Create table Hotels
            await this.#runQuery(`CREATE TABLE IF NOT EXISTS ${Tables.HOTELS} (
				Id INTEGER,
				Name Text,
				Description Text,
                StarRatings INTEGER,
                ContactDetails Text,
                Location Text,
                Facilities Text,
				WalletAddress Text,
				CreatedOn INTEGER,
				LastUpdatedOn INTEGER,
				PRIMARY KEY("Id" AUTOINCREMENT)
			)`);

             // Create table HotelImages
             await this.#runQuery(`CREATE TABLE IF NOT EXISTS ${Tables.HOTELIMAGES} (
				Id INTEGER,
				HotelId INTEGER,
				ImageURL Text,
				CreatedOn INTEGER,
				LastUpdatedOn INTEGER,
				PRIMARY KEY("Id" AUTOINCREMENT),
				FOREIGN KEY("HotelId") REFERENCES "${Tables.HOTELS}"("Id") ON DELETE CASCADE ON UPDATE CASCADE
			)`);

			// Create table RoomTypes
			await this.#runQuery(`CREATE TABLE IF NOT EXISTS ${Tables.ROOMTYPES} (
				Id INTEGER,
				HotelId INTEGER,
				Code Text,
				Sqft INTEGER,
				Description Text,
				RoomsCount INTEGER,
				Price Text,
				SingleBedCount INTEGER,
				DoubleBedCount INTEGER,
				TripleBedCount INTEGER,
				TotalSleeps INTEGER,
				Facilities Text,
				CreatedOn INTEGER,
				LastUpdatedOn INTEGER,
				PRIMARY KEY("Id" AUTOINCREMENT),
				FOREIGN KEY("HotelId") REFERENCES "${Tables.HOTELS}"("Id") ON DELETE CASCADE ON UPDATE CASCADE
			)`);

			// Create table RoomTypesImage
			await this.#runQuery(`CREATE TABLE IF NOT EXISTS ${Tables.ROOMTYPEIMAGES} (
				Id INTEGER,
				RoomTypeId INTEGER,
				ImageURL Text,
				CreatedOn INTEGER,
				LastUpdatedOn INTEGER,
				PRIMARY KEY("Id" AUTOINCREMENT),
				FOREIGN KEY("RoomTypeId") REFERENCES "${Tables.ROOMTYPES}"("Id") ON DELETE CASCADE ON UPDATE CASCADE
			)`);

			// Create table Room
			await this.#runQuery(`CREATE TABLE IF NOT EXISTS ${Tables.ROOMS} (
				Id INTEGER,
				RoomTypeId INTEGER,
				RoomCode Text,
				CreatedOn INTEGER,
				LastUpdatedOn INTEGER,
				PRIMARY KEY("Id" AUTOINCREMENT),
				FOREIGN KEY("RoomTypeId") REFERENCES "${Tables.ROOMTYPES}"("Id") ON DELETE CASCADE ON UPDATE CASCADE
			)`);

			 // Facilities of a room table
			 await this.#runQuery(`CREATE TABLE IF NOT EXISTS ${Tables.FACILITIES} (
                Id INTEGER,
                Name TEXT NOT NULL,
                Description TEXT,
				CreatedOn INTEGER,
				LastUpdatedOn INTEGER,
                PRIMARY KEY("Id" AUTOINCREMENT)
                )`);


            // Room-Facilities Table
            await this.#runQuery(`CREATE TABLE IF NOT EXISTS ${Tables.ROOMFACILITIES} (
                RoomTypeId INTEGER,
                FacilityId INTEGER,
                Quantity INTEGER,  
				CreatedOn INTEGER,
				LastUpdatedOn INTEGER,
                PRIMARY KEY("RoomTypeId", "FacilityId"),
				FOREIGN KEY("FacilityId") REFERENCES "${Tables.FACILITIES}"("Id"),
				FOREIGN KEY("RoomTypeId") REFERENCES "${Tables.ROOMTYPES}"("Id")
                )`);


			// Create table Pricing
			await this.#runQuery(`CREATE TABLE IF NOT EXISTS ${Tables.PRICES} (
				Id INTEGER,
				RoomTypeId INTEGER,
				TypeOfStay Text ,
				Price REAL,
				CreatedOn INTEGER,
				LastUpdatedOn INTEGER,
				PRIMARY KEY("Id" AUTOINCREMENT),
				FOREIGN KEY("RoomTypeId") REFERENCES "${Tables.ROOMTYPES}"("Id") ON DELETE CASCADE ON UPDATE CASCADE
			)`);

			// Create table Reservations
			await this.#runQuery(`CREATE TABLE IF NOT EXISTS ${Tables.RESERVATIONS} (
				Id INTEGER,
				WalletAddress TEXT,
				Price REAL,
				FromDate TEXT,
				ToDate TEXT,
				NoOfNights INTEGER,
				FirstName TEXT,
				LastName TEXT,
				Email TEXT,
				Country TEXT,
				Telephone TEXT,
				HotelId INTEGER ,
				CreatedOn INTEGER,
				LastUpdatedOn INTEGER,
				PRIMARY KEY("Id" AUTOINCREMENT),
				FOREIGN KEY("HotelId") REFERENCES "${Tables.HOTELS}"("Id") ON DELETE CASCADE ON UPDATE CASCADE
			)`);

			// Create table ReservationsRoomTypes
			await this.#runQuery(`CREATE TABLE IF NOT EXISTS ${Tables.RESERVATIONROOMTYPES} (
				Id INTEGER,
				RoomTypeId INTEGER,
				ReservationId INTEGER,
				NoOfRooms INTEGER,
				CreatedOn INTEGER,
				LastUpdatedOn INTEGER,
				PRIMARY KEY("Id" AUTOINCREMENT),
				FOREIGN KEY("RoomTypeId") REFERENCES "${Tables.ROOMTYPES}"("Id") ON DELETE CASCADE ON UPDATE CASCADE,
				FOREIGN KEY("ReservationId") REFERENCES "${Tables.RESERVATIONS}"("Id") ON DELETE CASCADE ON UPDATE CASCADE
			)`);

			await this.#insertData();

			this.#db.close();
		}

		/* =========================================
			Section 1: SQL Script files runner
		 ========================================== */

		// If the database file exists (in first round and all)
		if (fs.existsSync(settings.dbPath)) {
			this.#db = new sqlite3.Database(settings.dbPath);

			// Get the last executed sprint folder name from the database
			const getLastExecutedSprintQuery =
				"SELECT Sprint FROM SqlScriptMigrations ORDER BY Sprint DESC LIMIT 1";
			let rc = await this.#getRecord(getLastExecutedSprintQuery);
			const lastExecutedSprint = rc ? rc.Sprint : "Sprint_00";

			// Get a list of all script folders in the specified order
			const scriptFolders = fs
				.readdirSync(settings.dbScriptsFolderPath)
				.filter(
					folder => folder.startsWith("Sprint_") && folder >= lastExecutedSprint
				)
				.sort();

			for (const sprintFolder of scriptFolders) {
				const sprintFolderPath = path.join(
					settings.dbScriptsFolderPath,
					sprintFolder
				);

				// Get a list of SQL script files in the current folder
				const sqlFiles = fs
					.readdirSync(sprintFolderPath)
					.filter(file => file.match(/^\d+_.+\.sql$/))
					.sort();

				for (const sqlFile of sqlFiles) {
					const scriptPath = path.join(sprintFolderPath, sqlFile);
					//const scriptName = sqlFile.replace(/^\d+_(.+)\.sql$/, '$1');

					// Check if the script has been executed before
					const query =
						"SELECT * FROM SqlScriptMigrations WHERE Sprint = ? AND ScriptName = ?";
					const rc = await this.#getRecord(query, [sprintFolder, sqlFile]);
					if (!rc) {
						// If the script not found
						const sqlScript = fs.readFileSync(scriptPath, "utf8");
						const sqlStatements = sqlScript
							.split(";")
							.filter(statement => statement.trim() !== "");
						for (const statement of sqlStatements) {
							await this.#runQuery(statement);
						}

						const insertQuery =
							"INSERT INTO SqlScriptMigrations (Sprint, ScriptName, ExecutedTimestamp) VALUES (?, ?, ?)";
						await this.#runQuery(insertQuery, [
							sprintFolder,
							sqlFile,
							SharedService.getCurrentTimestamp(),
						]);

						console.log(`Executed script: ${scriptPath}`);
					} else {
						// If the script found
						// console.log(`Skipped already executed script: ${scriptPath}`);
					}
				}
			}

			this.#db.close();
		}
	}
	static async #insertData() {

/*
        let hFacilities = `INSERT INTO "HFacilities" ("Id","Name","Description","Status") VALUES (1,'Free WiFi','This is test description of this facility.','Available'),
        (6,'Family Room','This is test description of this facility.','Available'),
        (3,'Fitness Center','This is test description of this facility.','Available'),
        (2,'Swimming Pool','This is test description of this facility.','Available'),
        (7,'Pet friendly','This is test description of this facility.','Available'),
        (4,'Room Service','This is test description of this facility.','Available'),
        (8,'Disabled access','This is test description of this facility.','Available'),
        (10,'Parking','This is test description of this facility.','Available'),
        (9,'Restaurant','This is test description of this facility.','Available'),
        (5,'Spa & Wellness','This is test description of this facility.','Available')`;
        await this.#runQuery(hFacilities);
*/
        let rFacilities = `INSERT INTO "Facilities" ("Id", "Name", "Description") VALUES (1, "Private Bathroom", "This room has this facility."),
        (2, "Private Pool", "This room has this facility."),
        (3, "Washing Machine", "This room has this facility."),
        (4, "TV", "This room has this facility."),
        (5, "Air Conditioning", "This room has this facility."),
        (6, "Terrace", "This room has this facility."),
        (7, "Refrigerator", "This room has this facility."),
        (8, "Balcony", "This room has this facility."),
        (9, "Kitchen/Kitchenette", "This room has this facility."),
        (10, "Coffee/tea maker", "This room has this facility."),
        (11, "Clothes rack", "This room has this facility."),
        (12, "Entire unit located on ground floor", "This room has this facility."),
        (13, "Elevators availble", "This room has this facility."),
        (14, "Toilet with grab rails", "This room has this facility."),
        (15, "Adapted Bath", "This room has this facility."),
        (16, "Walk-in Shower", "This room has this facility."),
        (17, "Raised toilet", "This room has this facility."),
        (18, "Lowered sink", "This room has this facility."),
        (19, "Shower Chair", "This room has this facility.")`;

       const re =  await this.#runQuery(rFacilities);
	   console.log("insert query res: ", re)


        // // Inserting hotels
        // let hotels = `INSERT INTO Hotels(Id, HotelWalletAddress, HotelNftId, Name, Address, Email, IsRegistered) VALUES 
        //                 (1, "rpnzMDvKfN1ewJs4ddSRXFFZQF6Ubmhkqx", "000B013A95F14B0044F78A264E41713C64B5F89242540EE208C3098E00000D65", "Hotel Mandara Rosen", "Kataragama", "test1@gmail.com", 1),
        //                 (2, "rfKk9cRbspDzo62rbWniTMQX93FfCt8w5o", "000B013A95F14B0044F78A264E41713C64B5F89242540EE208C3098E00000D66", "Hotel Hilton", "Colombo 1", "hilton.lk@gmail.com", 1),
        //                 (3, "rLkLngcLBKfiYRL32Ygk4WYofBudgii3zk", "000B013A95F14B0044F78A264E41713C64B5F89242540EE208C3098E00000D67", "Hotel Galadari", "Colombo 1", "galadari@gmail.com", 1)`;

        // await this.#runQuery(hotels);

        // // Inserting Rooms
        // let rooms = `INSERT INTO Rooms(Id, HotelId, RoomNftId, Name) VALUES
        //                 (1, 1, "000B013A95F14B0044F78A264E41713C64B5F8924254055E208C3098E00000D65", "Sea-View Room"),
        //                 (2, 1, "000B013A95F14B0044F78A264E41713C64B5F89242540EE208C3098E00000D33", "Coconut-Grove Room"),
        //                 (3, 1, "000B013A95F14B0044F78A264E41713C64B5F89242540EEDD08C3098E00000D65", "Presidential Room"),
        //                 (4, 2, "000B013A95F14B0044F78A264E41713C64B5F89242540EE20866098E00000D65", "Presidential Room"),
        //                 (5, 2, "000B013A95F14B0044F78A264E41713C64B5F89242540EE208CFEWF98E00000D65", "Beach-View Room"),
        //                 (6, 2, "000B013A95F14B0044F78A264E41713C64B5F89242540EE208VDFV98E00000D65", "Ever-Green Room"),
        //                 (7, 2, "000B013A95F14B0044F78A264E41713C64B5F89242540EE208CVD098E00000D65", "Double Bed Room"),
        //                 (14, 1, "000B013A95F14B0044F78A264E41713C64B5F89242540VDFDFDFF098E00000D65", "Tripple Bed Room"),
        //                 (8, 1, "000B013A95F14B0044F78A264E41713C64B5F892425SDDSFDFDC3098E00000D65", "Single Bed Room"),
        //                 (9, 1, "000B013A95F14B0044F78A264E41713C64B5F89242SDCVDSSDVC3098E00000D65", "Single Bed Green View Room"),
        //                 (10, 1, "000B013A95F14B0044F78A264E41713C64B5F89242540EE208C3098E00000D65", "Non-AC Room"),
        //                 (11, 3, "000B013A95F14B0044F78A264E41713C64B5F89242540EEFVDV3098E00000D65", "Presidential Room"),
        //                 (12, 3, "000B013A95F14B0044F78A264E41713C64B5F892425VDFVFVDF3098E00000D65", "Single Bed Room"),
        //                 (13, 2, "000B013A95F14B0044F78A264E41713C64B5F89242540EE208D3098E00000D65", "Sea-View Blue Room")`;
        // await this.#runQuery(rooms);

        // // Inserting Bookings
        // let bookings = `INSERT INTO Bookings(Id, RoomId, PersonName, UserPubkey, FromDate, ToDate) VALUES
        //                     (1, 1, "Andrew", "000B013A95F14B0044F78A264E41713C64B5F89242540EE208", "2022-8-10", "2022-8-15"),
        //                     (2, 1, "Ravi", "000B013A95F14B0044F78A264E41713C64B5F89242540EE210", "2022-9-3", "2022-9-10"),
        //                     (3, 5, "Perera", "000B013A95F14B0044F78A264E41713C64B5F89242540EE209",  "2022-8-31", "2022-9-2")`;
        // await this.#runQuery(bookings);
    }

	static #runQuery(query, params = null) {
		console.log("inside run query")
		return new Promise((resolve, reject) => {
			this.#db.run(query, params ? params : [], function (err) {
				if (err) {
					reject(err);
					return;
				}

				resolve({ lastId: this.lastID, changes: this.changes });
			});
		});
	}

	static #getRecord(query, filters = []) {
		// Execute the query and return the result
		return new Promise((resolve, reject) => {
			if (filters.length > 0) {
				this.#db.get(query, filters, (err, row) => {
					if (err) {
						console.error(err.message);
						reject(err.message);
					} else {
						resolve(row);
					}
				});
			} else {
				this.#db.get(query, (err, row) => {
					if (err) {
						console.error(err.message);
						reject(err.message);
					} else {
						resolve(row);
					}
				});
			}
		});
	}
}
