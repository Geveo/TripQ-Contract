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
			await this
				.#runQuery(`CREATE TABLE IF NOT EXISTS ${Tables.SQLSCRIPTMIGRATIONS} (
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
				Name TEXT,
				Description TEXT,
                StarRatings INTEGER,
                ContactDetails TEXT,
                Location TEXT,
                Facilities TEXT,
				PaymentOptions INTEGER,
				WalletAddress TEXT,
				CreatedOn INTEGER,
				LastUpdatedOn INTEGER,
				PRIMARY KEY("Id" AUTOINCREMENT)
			)`);

			// Create table HotelImages
			await this.#runQuery(`CREATE TABLE IF NOT EXISTS ${Tables.HOTELIMAGES} (
				Id INTEGER,
				HotelId INTEGER,
				ImageURL TEXT,
				CreatedOn INTEGER,
				LastUpdatedOn INTEGER,
				PRIMARY KEY("Id" AUTOINCREMENT),
				FOREIGN KEY("HotelId") REFERENCES "${Tables.HOTELS}"("Id") ON DELETE CASCADE ON UPDATE CASCADE
			)`);

			// Create table RoomTypes
			await this.#runQuery(`CREATE TABLE IF NOT EXISTS ${Tables.ROOMTYPES} (
				Id INTEGER,
				HotelId INTEGER,
				Code TEXT,
				Sqft INTEGER,
				Description TEXT,
				RoomsCount INTEGER,
				Price TEXT,
				SingleBedCount INTEGER,
				DoubleBedCount INTEGER,
				TripleBedCount INTEGER,
				TotalSleeps INTEGER,
				Facilities TEXT,
				CreatedOn INTEGER,
				LastUpdatedOn INTEGER,
				PRIMARY KEY("Id" AUTOINCREMENT),
				FOREIGN KEY("HotelId") REFERENCES "${Tables.HOTELS}"("Id") ON DELETE CASCADE ON UPDATE CASCADE
			)`);

			// Create table RoomTypesImage
			await this.#runQuery(`CREATE TABLE IF NOT EXISTS ${Tables.ROOMTYPEIMAGES} (
				Id INTEGER,
				RoomTypeId INTEGER,
				ImageURL TEXT,
				CreatedOn INTEGER,
				LastUpdatedOn INTEGER,
				PRIMARY KEY("Id" AUTOINCREMENT),
				FOREIGN KEY("RoomTypeId") REFERENCES "${Tables.ROOMTYPES}"("Id") ON DELETE CASCADE ON UPDATE CASCADE
			)`);

			// Create table Room
			await this.#runQuery(`CREATE TABLE IF NOT EXISTS ${Tables.ROOMS} (
				Id INTEGER,
				RoomTypeId INTEGER,
				RoomCode TEXT,
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
			await this
				.#runQuery(`CREATE TABLE IF NOT EXISTS ${Tables.RESERVATIONROOMTYPES} (
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

			// Hotel owner's bank account details Table
			await this
				.#runQuery(`CREATE TABLE IF NOT EXISTS ${Tables.OWNERBANKACCOUNTDETAILS} (
					Id INTEGER,	
					HotelId INTEGER,
					AccountNumber TEXT,
					BankHolderName TEXT,
					BankName TEXT,  
					BranchName TEXT,
					CreatedOn INTEGER,
					LastUpdatedOn INTEGER,
					PRIMARY KEY("Id" AUTOINCREMENT),
					FOREIGN KEY("HotelId") REFERENCES "${Tables.HOTELS}"("Id") ON DELETE CASCADE ON UPDATE CASCADE
					)`);

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
					}
				}
			}

			this.#db.close();
		}
	}

	static #runQuery(query, params = null) {
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
