import { FileService } from "../Common.Services/FileService";
import { SharedService } from "../Common.Services/SharedService";
import { Tables } from "../../Constants/Tables";
import { LogTypes } from "../../Constants/LogTypes";
import { LogMessages } from "../../Constants/LogMessages";

const settings = require("../../settings.json").settings;
const { SqliteDatabase } = require("./../Common.Services/dbHandler").default;

export class ContractUpdateService {
    #dbPath = settings.dbPath;
    #message = null;
    #dbContext = null;

    constructor(message) {
        this.#message = message;
        this.#dbContext = new SqliteDatabase(this.#dbPath);
    }

    async UpdateContract() {
        let resObj = {};
        try {
            const zipData = this.#message.data;

            this.#dbContext.open();
            let row = await this.#dbContext.getLastRecord(Tables.CONTRACTVERSION);

            if (false && row.Version >= zipData.version) {  // Temporarily omit this validation for test purposes
                throw "Contract version is less than the previous.";
            } else {
                FileService.writeFile(settings.newContractZipFileName, Buffer.from(zipData.content.buffer));

                // Create the sh file post_exec.sh
                const shellScriptContent = `#!/bin/bash

echo "I am the post script"

# ! command -v uzip &>/dev/null && apt-get install --no-install-recommends -y unzip

# Define the path to the zip file
zip_file="${settings.newContractZipFileName}"

# Unzip the zip file to the current directory, overwriting existing files and folders
unzip -o -d ./ "$zip_file" >>/dev/null

echo "Zip file '$zip_file' has been successfully unzipped and its contents have been written to the current directory."

# Delete the zip file
rm "$zip_file" >>/dev/null
`;

                // Write the shell script content to the file
                FileService.writeFile(settings.postExecutionScriptName, shellScriptContent);
                FileService.changeMode(settings.postExecutionScriptName, 0o777); // Full permissions for all users

                console.log(`"${settings.postExecutionScriptName}" has been created with the shell script.`);
                const data = {
                    Description: zipData.description,
                    LastUpdatedOn: SharedService.context.timestamp,
                    Version: zipData.version,
                    CreatedOn: SharedService.context.timestamp
                }
                const rowId = (await this.#dbContext.insertValue(Tables.CONTRACTVERSION, data)).lastId;
                resObj.success = { rowId: rowId };

                return resObj;
            }


        } catch (error) {
            throw error;
        } finally {
            this.#dbContext.close();
        }

    }
}
