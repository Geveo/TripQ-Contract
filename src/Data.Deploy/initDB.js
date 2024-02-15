// import { SharedService } from "../Services/Common.Services/SharedService";
// import { Tables } from "../Constants/Tables";

// const fs = require("fs");
// const sqlite3 = require("sqlite3").verbose();
// const path = require("path");
// const settings = require("../settings.json").settings;

// export class DBInitializer {
// 	static #db = null;

// 	static async init() {
// 		// If database does not exist. (In an initial run)
// 		if (!fs.existsSync(settings.dbPath)) {
// 			this.#db = new sqlite3.Database(settings.dbPath);

// 	// 		// Create table StepCount
// 	// 		await this.#runQuery(`CREATE TABLE IF NOT EXISTS ${Tables.CONTRACTVERSION} (
// 	// 			Id INTEGER,
// 	// 			Version FLOAT NOT NULL,
// 	// 			Description Text,
// 	// 			CreatedOn INTEGER,
// 	// 			LastUpdatedOn INTEGER,
// 	// 			PRIMARY KEY("Id" AUTOINCREMENT)
// 	// 		)`);

// 	// 		await this
// 	// 			.#runQuery(`CREATE TABLE IF NOT EXISTS ${Tables.SQLSCRIPTMIGRATIONS} (
// 	// 			Id INTEGER,
// 	// 			Sprint TEXT NOT NULL,
// 	// 			ScriptName TEXT NOT NULL,
// 	// 			ExecutedTimestamp TEXT, 
// 	// 			ConcurrencyKey TEXT
// 	// 				CHECK (ConcurrencyKey LIKE '0x%' AND length(ConcurrencyKey) = 18),
// 	// 			PRIMARY KEY("Id" AUTOINCREMENT)
// 	// 		)`);

// 	// 		// Create table StepCount
// 	// 		await this.#runQuery(`CREATE TABLE IF NOT EXISTS ${Tables.STEPCOUNT} (
// 	// 			Id INTEGER,
// 	// 			Month TEXT NOT NULL,
// 	// 			Count INTEGER DEFAULT 0,
// 	// 			ConcurrencyKey TEXT
// 	// 				CHECK (ConcurrencyKey LIKE '0x%' AND length(ConcurrencyKey) = 18),
// 	// 			PRIMARY KEY("Id" AUTOINCREMENT)
// 	// 		)`);

// 	// 		// Create table Session
// 	// 		await this.#runQuery(`CREATE TABLE IF NOT EXISTS ${Tables.SESSION} (
// 	// 			Id INTEGER,
// 	// 			UserId INTEGER,
// 	// 			SessionId TEXT,
// 	// 			StartDateTime TEXT,
// 	// 			EndDateTime TEXT,
// 	// 			IpAddress TEXT,
// 	// 			IsValid INTEGER DEFAULT 0,
// 	// 			ConcurrencyKey TEXT
// 	// 				CHECK (ConcurrencyKey LIKE '0x%' AND length(ConcurrencyKey) = 18),
// 	// 			PRIMARY KEY("Id" AUTOINCREMENT)
// 	// 		)`);

// 	// 		// Create table Challenges
// 	// 		await this.#runQuery(`CREATE TABLE IF NOT EXISTS ${Tables.CHALLENGES} (
// 	// 			Id INTEGER,
// 	// 			Name TEXT NOT NULL,
// 	// 			StartDate DATE,
// 	// 			EndDate DATE,
// 	// 			IsPublicJoining INTEGER DEFAULT 0,
// 	// 			InvitationCode TEXT DEFAULT NULL,
// 	// 			Status INTEGER DEFAULT 1,
// 	// 			CreatedOn TEXT,
// 	// 			LastUpdatedOn TEXT,
// 	// 			ConcurrencyKey TEXT
// 	// 						CHECK (ConcurrencyKey LIKE '0x%' AND length(ConcurrencyKey) = 18),
// 	// 			PRIMARY KEY("Id" AUTOINCREMENT)
// 	// 		)`);

// 	// 		//Create table User
// 	// 		await this.#runQuery(`CREATE TABLE IF NOT EXISTS ${Tables.USER} (
// 	// 			Id INTEGER,
// 	// 			Email TEXT NOT NULL UNIQUE,
// 	// 			Name TEXT,
// 	// 			IsActive INTEGER,
// 	// 			AccessLevel TEXT,
// 	// 			Source TEXT DEFAULT NULL,
// 	// 			LastLogOn TEXT,
// 	// 			JoinedOn TEXT DEFAULT NULL,
// 	// 			ImageURL TEXT,
// 	// 			CreatedOn TEXT,
// 	// 			LastUpdatedOn TEXT,
// 	// 			ConcurrencyKey TEXT
// 	// 					CHECK (ConcurrencyKey LIKE '0x%' AND length(ConcurrencyKey) = 18),
// 	// 			PRIMARY KEY("Id" AUTOINCREMENT)
// 	// 		)`);

// 	// 		// Create table Teams
// 	// 		await this.#runQuery(`CREATE TABLE IF NOT EXISTS ${Tables.TEAM} (
// 	// 			Id INTEGER,
// 	// 			Name TEXT NOT NULL,
// 	// 			ChallengesId INTEGER,
// 	// 			ConcurrencyKey TEXT
// 	// 					CHECK (ConcurrencyKey LIKE '0x%' AND length(ConcurrencyKey) = 18),
// 	// 			CreatedOn TEXT,
// 	// 			LastUpdatedOn TEXT,
// 	// 			PRIMARY KEY("Id" AUTOINCREMENT),
// 	// 			FOREIGN KEY("ChallengesId") REFERENCES "${Tables.CHALLENGES}"("Id") ON DELETE CASCADE ON UPDATE CASCADE
//     //   )`);

// 	// 		// Join table   Users - Teams
// 	// 		await this.#runQuery(`CREATE TABLE IF NOT EXISTS ${Tables.TEAMUSER} (
// 	// 			Id INTEGER,
// 	// 			TeamId INTEGER NOT NULL,
// 	// 			UserId INTEGER NOT NULL,
// 	// 			ConcurrencyKey TEXT
// 	// 					CHECK (ConcurrencyKey LIKE '0x%' AND length(ConcurrencyKey) = 18),
// 	// 			CreatedOn TEXT,
// 	// 			LastUpdatedOn TEXT,
// 	// 			PRIMARY KEY("Id" AUTOINCREMENT),
// 	// 			FOREIGN KEY("TeamId") REFERENCES "${Tables.TEAM}"("Id") ON DELETE CASCADE,
// 	// 			FOREIGN KEY("UserId") REFERENCES "${Tables.USER}"("Id") ON DELETE CASCADE
// 	// 		)`);

// 	// 		//Create table Rules
// 	// 		await this.#runQuery(`CREATE TABLE IF NOT EXISTS ${Tables.RULES} (
// 	// 			Id INTEGER,
// 	// 			ChallengeId INTEGER,
// 	// 			MinStepsCount INTEGER,
// 	// 			PersonalStrikesCount INTEGER,
// 	// 			TeamStrikesCount INTEGER,
// 	// 			TimeDuration TEST,
// 	// 			ConcurrencyKey TEXT
// 	// 					CHECK (ConcurrencyKey LIKE '0x%' AND length(ConcurrencyKey) = 18),
// 	// 			CreatedOn TEXT,
// 	// 			LastUpdatedOn TEXT,
// 	// 			PRIMARY KEY("Id" AUTOINCREMENT)
// 	// 		)`);

// 	// 		//Create table ActivityLog
// 	// 		await this.#runQuery(`CREATE TABLE IF NOT EXISTS ${Tables.ACTIVITYLOG} (
// 	// 			Id INTEGER,
// 	// 			ActivityType TEXT,
// 	// 			User TEXT,
// 	// 			Service TEXT,
// 	// 			Action TEXT,
// 	// 			Message TEXT,
// 	// 			ExceptionMessage TEXT,
// 	// 			TimeStamp TEXT,
// 	// 			PRIMARY KEY("Id" AUTOINCREMENT)
// 	// 		)`);

// 	// 		//Create table User-Challenge
// 	// 		await this.#runQuery(`CREATE TABLE IF NOT EXISTS ${Tables.USERCHALLENGE} (
// 	// 			Id INTEGER,
// 	// 			UserId INTEGER,
// 	// 			ChallengeId INTEGER,
// 	// 			CreatedOn TEXT,
// 	// 			LastUpdatedOn TEXT,
// 	// 			ConcurrencyKey TEXT
//     //                 CHECK (ConcurrencyKey LIKE '0x%' AND length(ConcurrencyKey) = 18),
//     //             PRIMARY KEY("Id" AUTOINCREMENT),
//     //             FOREIGN KEY("UserId") REFERENCES "${Tables.USER}"("Id"),
//     //             FOREIGN KEY("ChallengeId") REFERENCES "${Tables.CHALLENGES}"("Id")
// 	// 		)`);

// 	// 		//Create table User-Challenge-- Team
// 	// 		await this.#runQuery(`CREATE TABLE IF NOT EXISTS ${Tables.USERCHALLENGETEAM} (
// 	// 			Id INTEGER,
// 	// 			UserChallengeId INTEGER,
// 	// 			TeamId INTEGER,
// 	// 			CreatedOn TEXT,
// 	// 			LastUpdatedOn TEXT,
// 	// 			ConcurrencyKey TEXT
//     //                 CHECK (ConcurrencyKey LIKE '0x%' AND length(ConcurrencyKey) = 18),
//     //             PRIMARY KEY("Id" AUTOINCREMENT),
//     //             FOREIGN KEY("UserChallengeId") REFERENCES "${Tables.USERCHALLENGE}"("Id"),
//     //             FOREIGN KEY("TeamId") REFERENCES "${Tables.TEAM}"("Id")
// 	// 		)`);

// 	// 		//Create table Challengeadmin
// 	// 		await this.#runQuery(`CREATE TABLE IF NOT EXISTS ${Tables.CHALLENGEADMIN} (
// 	// 			Id INTEGER,
// 	// 			ChallengeId INTEGER NOT NULL,
// 	// 			UserId INTEGER NOT NULL,
// 	// 			CreatedOn TEXT,
// 	// 			LastUpdatedOn TEXT,
// 	// 			ConcurrencyKey TEXT
// 	// 				CHECK (ConcurrencyKey LIKE '0x%' AND length(ConcurrencyKey) = 18),
// 	// 			PRIMARY KEY("Id" AUTOINCREMENT),
// 	// 			FOREIGN KEY("ChallengeId") REFERENCES "${Tables.CHALLENGES}"("Id") ON DELETE CASCADE,
// 	// 			FOREIGN KEY("UserId") REFERENCES "${Tables.USER}"("Id") ON DELETE CASCADE
// 	// 		)`);

// 	// 		//Create table User-Challenge
// 	// 		await this.#runQuery(`CREATE TABLE IF NOT EXISTS ${Tables.USERCHALLENGE} (
// 	// 			Id INTEGER,
// 	// 			UserId INTEGER,
// 	// 			ChallengeId INTEGER,
// 	// 			CreatedOn TEXT,
// 	// 			LastUpdatedOn TEXT,
// 	// 			ConcurrencyKey TEXT
//     //                 CHECK (ConcurrencyKey LIKE '0x%' AND length(ConcurrencyKey) = 18),
//     //             PRIMARY KEY("Id" AUTOINCREMENT),
//     //             FOREIGN KEY("UserId") REFERENCES "${Tables.USER}"("Id"),
//     //             FOREIGN KEY("ChallengeId") REFERENCES "${Tables.CHALLENGES}"("Id")
// 	// 		)`);

// 	// 		//Create table User-Challenge-- Team
// 	// 		await this.#runQuery(`CREATE TABLE IF NOT EXISTS ${Tables.USERCHALLENGETEAM} (
// 	// 			Id INTEGER,
// 	// 			UserChallengeId INTEGER,
// 	// 			TeamId INTEGER,
// 	// 			CreatedOn TEXT,
// 	// 			LastUpdatedOn TEXT,
// 	// 			ConcurrencyKey TEXT
//     //                 CHECK (ConcurrencyKey LIKE '0x%' AND length(ConcurrencyKey) = 18),
//     //             PRIMARY KEY("Id" AUTOINCREMENT),
//     //             FOREIGN KEY("UserChallengeId") REFERENCES "${Tables.USERCHALLENGE}"("Id"),
//     //             FOREIGN KEY("TeamId") REFERENCES "${Tables.TEAM}"("Id")
// 	// 		)`);

// 	// 		//Create table Challengeadmin
// 	// 		await this.#runQuery(`CREATE TABLE IF NOT EXISTS ${Tables.CHALLENGEADMIN} (
// 	// 			Id INTEGER,
// 	// 			ChallengeId INTEGER NOT NULL,
// 	// 			UserId INTEGER NOT NULL,
// 	// 			CreatedOn TEXT,
// 	// 			LastUpdatedOn TEXT,
// 	// 			ConcurrencyKey TEXT
// 	// 				CHECK (ConcurrencyKey LIKE '0x%' AND length(ConcurrencyKey) = 18),
// 	// 			PRIMARY KEY("Id" AUTOINCREMENT),
// 	// 			FOREIGN KEY("ChallengeId") REFERENCES "${Tables.CHALLENGES}"("Id") ON DELETE CASCADE,
// 	// 			FOREIGN KEY("UserId") REFERENCES "${Tables.USER}"("Id") ON DELETE CASCADE
// 	// 		)`);

// 			this.#db.close();
// 		}

// 		/* =========================================
// 			Section 1: SQL Script files runner
// 		 ========================================== */

// 		// If the database file exists (in first round and all)
// 		if (fs.existsSync(settings.dbPath)) {
// 			this.#db = new sqlite3.Database(settings.dbPath);

// 			// Get the last executed sprint folder name from the database
// 			const getLastExecutedSprintQuery =
// 				"SELECT Sprint FROM SqlScriptMigrations ORDER BY Sprint DESC LIMIT 1";
// 			let rc = await this.#getRecord(getLastExecutedSprintQuery);
// 			const lastExecutedSprint = rc ? rc.Sprint : "Sprint_00";

// 			// Get a list of all script folders in the specified order
// 			const scriptFolders = fs
// 				.readdirSync(settings.dbScriptsFolderPath)
// 				.filter(
// 					folder =>
// 						folder.startsWith("Sprint_") && folder >= lastExecutedSprint,
// 				)
// 				.sort();

// 			for (const sprintFolder of scriptFolders) {
// 				const sprintFolderPath = path.join(
// 					settings.dbScriptsFolderPath,
// 					sprintFolder,
// 				);

// 				// Get a list of SQL script files in the current folder
// 				const sqlFiles = fs
// 					.readdirSync(sprintFolderPath)
// 					.filter(file => file.match(/^\d+_.+\.sql$/))
// 					.sort();

// 				for (const sqlFile of sqlFiles) {
// 					const scriptPath = path.join(sprintFolderPath, sqlFile);
// 					//const scriptName = sqlFile.replace(/^\d+_(.+)\.sql$/, '$1');

// 					// Check if the script has been executed before
// 					const query =
// 						"SELECT * FROM SqlScriptMigrations WHERE Sprint = ? AND ScriptName = ?";
// 					const rc = await this.#getRecord(query, [sprintFolder, sqlFile]);
// 					if (!rc) {
// 						// If the script not found
// 						const sqlScript = fs.readFileSync(scriptPath, "utf8");
// 						const sqlStatements = sqlScript
// 							.split(";")
// 							.filter(statement => statement.trim() !== "");
// 						for (const statement of sqlStatements) {
// 							await this.#runQuery(statement);
// 						}

// 						const insertQuery =
// 							"INSERT INTO SqlScriptMigrations (Sprint, ScriptName, ExecutedTimestamp) VALUES (?, ?, ?)";
// 						await this.#runQuery(insertQuery, [
// 							sprintFolder,
// 							sqlFile,
// 							SharedService.getCurrentTimestamp(),
// 						]);

// 						console.log(`Executed script: ${scriptPath}`);
// 					} else {
// 						// If the script found
// 						// console.log(`Skipped already executed script: ${scriptPath}`);
// 					}
// 				}
// 			}

// 			this.#db.close();
// 		}
// 	}

// 	static #runQuery(query, params = null) {
// 		return new Promise((resolve, reject) => {
// 			this.#db.run(query, params ? params : [], function (err) {
// 				if (err) {
// 					reject(err);
// 					return;
// 				}

// 				resolve({ lastId: this.lastID, changes: this.changes });
// 			});
// 		});
// 	}

// 	static #getRecord(query, filters = []) {
// 		// Execute the query and return the result
// 		return new Promise((resolve, reject) => {
// 			if (filters.length > 0) {
// 				this.#db.get(query, filters, (err, row) => {
// 					if (err) {
// 						console.error(err.message);
// 						reject(err.message);
// 					} else {
// 						resolve(row);
// 					}
// 				});
// 			} else {
// 				this.#db.get(query, (err, row) => {
// 					if (err) {
// 						console.error(err.message);
// 						reject(err.message);
// 					} else {
// 						resolve(row);
// 					}
// 				});
// 			}
// 		});
// 	}
// }
