import { ActivityLogService } from './ActivityLog.Service';
const settings = require('../../settings.json').settings;
const { SharedService } = require('./SharedService');
const { SqliteDatabase } = require('./dbHandler').default;
import { Tables } from '../../Constants/Tables';
import { LogTypes } from '../../Constants/LogTypes';
import { LogMessages } from '../../Constants/LogMessages';

export class SessionService {
    #dbPath = settings.dbPath;
    #message = null;
    #dbContext = null;
    #activityLogger = null;
    #date = SharedService.getCurrentTimestamp()

    constructor(message) {
        this.#message = message;
        this.#dbContext = new SqliteDatabase(this.#dbPath);
        this.#activityLogger = new ActivityLogService(message);
    }

    async addSession() {
        let resObj = {};

        try {
            this.#dbContext.open();

            // Check for currently active session.
            const filter = {
                UserId: this.#message.Auth.UserId,
                IpAddress: this.#message.Auth.IpAddress,
                IsValid: 1,
            }
            const sessions = await this.#dbContext.getValues(Tables.SESSION, filter);

            // Invalidate currently active session.
            if (sessions[0]) {
                const data = {
                    isValid: '0',
                }
                const filterData = {
                    SessionId: sessions[0].SessionId,
                }
                await this.#dbContext.updateValue(Tables.SESSION, data, filterData);
                console.log('Active Session Invalidated.');
            }

            let uuidForSessionId = this.#message.Auth.SessionId;
            const currentDateTime = new Date(this.#date);

            const startDateTime = currentDateTime.toISOString().slice(0, 19).replace("T", " ");
            const endDateTime = new Date(currentDateTime.setMinutes(currentDateTime.getMinutes() + 180)).toISOString().slice(0, 19).replace("T", " ");

            const data = {
                UserId: this.#message.Auth.UserId,
                SessionId: uuidForSessionId,
                StartDateTime: startDateTime,
                EndDateTime: endDateTime,
                IpAddress: this.#message.Auth.IpAddress,
                IsValid: 1,
                ConcurrencyKey: SharedService.generateConcurrencyKey(),
            }

            // Save new session record.
            const rowId = (await this.#dbContext.insertValue(Tables.SESSION, data)).lastId;
            resObj.success = { sessionId: uuidForSessionId }
            console.log('New Session Created.', rowId);
            await this.#activityLogger.writeLog(LogTypes.INFO, LogMessages.SUCCESS.ADD_SESSION_SUCCESS);
            return resObj;
        } catch (error) {
            await this.#activityLogger.writeLog(LogTypes.ERROR, LogMessages.ERROR.ADD_SESSION_ERROR, error.message);
            throw error;
        } finally {
            this.#dbContext.close();
        }
    }

    async authenticateSession() {
        try {
            this.#dbContext.open();

            // Check for currently active session.
            const sessionFilter = {
                SessionId: this.#message.Auth.sessionId,
                IsValid: 1,
            }
            const session = await this.#dbContext.getValues(Tables.SESSION, sessionFilter);

            if (session[0]) {
                const startDateTime = new Date(session[0].StartDateTime);
                const endDateTime = new Date(session[0].EndDateTime);
                const currentDateTime = new Date();

                // Check the session validity period.
                if (currentDateTime >= startDateTime && currentDateTime <= endDateTime) {
                    console.log('Valid session found.');

                    const userFilter = {
                        Id: session[0].UserId,
                        IsActive: 1
                    }

                    let user = await this.#dbContext.getValues(Tables.USER, userFilter);

                    const userDetails = {
                        Email: user[0].Email,
                        Name: user[0].Name,
                        AccessLevel: user[0].AccessLevel
                    }

                    this.#message.User = userDetails;

                    return true;
                } else {
                    const data = {
                        isValid: '0'
                    }
                    const filter = {
                        SessionId: session[0].SessionId
                    }

                    // Invalidate expired session.
                    await this.#dbContext.updateValue(Tables.SESSION, data, filter);
                    console.log('Expired session invalidated.');
                    return false;
                }
            } else {
                console.log('Session not found.');
                await this.#activityLogger.writeLog(LogTypes.AUDIT, LogMessages.AUDIT.SESSION_NOT_FOUND, "Session not found.");
                return false;
            }
        } catch (error) {
            console.log('Error in session authentication.', error);
            await this.#activityLogger.writeLog(LogTypes.ERROR, LogMessages.ERROR.AUTHENTICATE_SESSION_ERROR, error.message);
            return false;
        } finally {
            this.#dbContext.close();
        }
    }

    async invalidateSession() {
        try {
            this.#dbContext.open();
            const data = {
                isValid: '0'
            }
            const filter = {
                SessionId: this.#message.Auth.sessionId,
            }

            // Invalidate expired session.
            await this.#dbContext.updateValue(Tables.SESSION, data, filter);
            console.log('Session invalidated.');
            return true;
        } catch (error) {
            await this.#activityLogger.writeLog(LogTypes.ERROR, LogMessages.ERROR.INVALIDATE_SESSION_ERROR, error.message);
            throw error;
        } finally {
            this.#dbContext.close();
        }
    }
}