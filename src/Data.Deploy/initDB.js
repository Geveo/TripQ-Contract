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
        let hotels = `INSERT INTO HOTELS (Name, Description, StarRatings, ContactDetails, Location, Facilities, WalletAddress, CreatedOn, LastUpdatedOn)
						VALUES
						('Hotel 1', 'Description A', 4, 'Contact A', 'Location A', 'Facilities A', 'WalletAddress A', 1647004800, 1647004800),
						('Hotel 2', 'Description B', 3, 'Contact B', 'Location B', 'Facilities B', 'WalletAddress B', 1647004800, 1647004800),
						('Hotel 3', 'Description C', 5, 'Contact C', 'Location C', 'Facilities C', 'WalletAddress C', 1647004800, 1647004800),
						('Hotel 4', 'Description D', 2, 'Contact D', 'Location D', 'Facilities D', 'WalletAddress D', 1647004800, 1647004800),
						('Hotel A', 'Description A', 4, 'Contact A', 'Location A', 'Facilities A', 'WalletAddress A', 1647004800, 1647004800),
						('Hotel B', 'Description B', 3, 'Contact B', 'Location B', 'Facilities B', 'WalletAddress B', 1647004800, 1647004800),
						('Hotel C', 'Description C', 5, 'Contact C', 'Location C', 'Facilities C', 'WalletAddress C', 1647004800, 1647004800),
						('Hotel D', 'Description D', 2, 'Contact D', 'Location D', 'Facilities D', 'WalletAddress D', 1647004800, 1647004800),
						('Hotel E', 'Description E', 2, '{"FullName":"Madushi Sarathchandra","Email":"mm@gmail.com","PhoneNumber":"0707878789"}', '{"AddressLine01":"Angankanda, Aluthwala","AddressLine02":"","City":"Ambalangoda","DistanceFromCity":"5"}', '[{"Id":9,"Name":"Restaurant","Description":"Description"},{"Id":6,"Name":"Family Room","Description":"Description"}]', 'rLuYy66zndMYVsxmqwAFrxMQjXHEmBwJDA', 1647004800, 1647004800)
						`;

        await this.#runQuery(hotels);

        // // Inserting RoomTypes
        let roomTypes = `INSERT INTO ROOMTYPES (HotelId, Code, Sqft, Description, RoomsCount, Price, SingleBedCount, DoubleBedCount, TripleBedCount, CreatedOn, LastUpdatedOn)
							VALUES
							(1, 'Code A', 300, 'Description A', 10, '100', 2, 3, 1, 1647004800, 1647004800),
							(1, 'Code B', 350, 'Description B', 12, '120', 3, 4, 2, 1647004800, 1647004800),
							(2, 'Code C', 400, 'Description C', 15, '150', 3, 5, 1, 1647004800, 1647004800),
							(2, 'Code D', 450, 'Description D', 18, '180', 4, 6, 2, 1647004800, 1647004800),
							(5, 'Code E', 450, 'Description E', 18, '180', 4, 6, 2, 1647004800, 1647004800),
							(5, 'Code F', 450, 'Description E', 28, '180', 4, 6, 2, 1647004800, 1647004800)
							`;
        await this.#runQuery(roomTypes);

        // // Inserting Reservations
        let reservations = `INSERT INTO RESERVATIONS (WalletAddress, Price, FromDate, ToDate, NoOfNights, FirstName, LastName, Email, Country, Telephone, HotelId, CreatedOn, LastUpdatedOn)
							VALUES
							('WalletAddress A', 200.50, '2024-03-11', '2024-03-15', 4, 'John', 'Doe', 'john.doe@example.com', 'USA', '123456789', 1, 1647004800, 1647004800),
							('WalletAddress B', 300.75, '2024-03-12', '2024-03-16', 4, 'Jane', 'Doe', 'jane.doe@example.com', 'Canada', '987654321', 2, 1647004800, 1647004800),
							('WalletAddress C', 150.25, '2024-03-13', '2024-03-17', 4, 'Alice', 'Smith', 'alice.smith@example.com', 'UK', '741852963', 1, 1647004800, 1647004800),
							('WalletAddress D', 250.90, '2024-03-14', '2024-03-18', 4, 'Bob', 'Smith', 'bob.smith@example.com', 'Australia', '369258147', 2, 1647004800, 1647004800),
							('WalletAddress E', 250.90, '2024-03-14', '2024-03-18', 4, 'Bob', 'Smith', 'bob.smith@example.com', 'Australia', '369258147', 5, 1647004800, 1647004800),
							('WalletAddress F', 250.90, '2024-03-14', '2024-03-18', 4, 'Bob', 'Smith', 'bob.smith@example.com', 'Australia', '369258147', 5, 1647004800, 1647004800);
							('WalletAddress C', 150.25, '2024-03-19', '2024-03-25', 4, 'Alice', 'Smith', 'alice.smith@example.com', 'UK', '741852963', 6, 1647004800, 1647004800),
							('WalletAddress D', 250.90, '2024-03-14', '2024-03-18', 4, 'Bob', 'Smith', 'bob.smith@example.com', 'Australia', '369258147', 2, 1647004800, 1647004800);
		`;
        await this.#runQuery(reservations);

		// // Inserting RESERVATIONROOMTYPES 
		let reservationRoomTypes = `INSERT INTO RESERVATIONROOMTYPES (RoomTypeId, ReservationId, NoOfRooms, CreatedOn, LastUpdatedOn)
									VALUES
									(2, 1, 8, 1647004800, 1647004800),
									(6, 3, 11, 1647004800, 1647004800),
									(1, 2, 2, 1647004800, 1647004800),
									(4, 4, 1, 1647004800, 1647004800);
									(1, 1, 2, 1647004800, 1647004800),
									(2, 1, 5, 1647004800, 1647004800),
									(3, 3, 2, 1647004800, 1647004800),
									(4, 4, 1, 1647004800, 1647004800),
									(5, 5, 3, 1647004800, 1647004800),
									(5, 6, 2, 1647004800, 1647004800);
		`;
		await this.#runQuery(reservationRoomTypes);


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
