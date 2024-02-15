const rippleKeypairs = require("ripple-keypairs");

export class MessageAuthenticationService {

    verify(message){
        let isVerified = false;
        try {
             isVerified = rippleKeypairs.verify(message.requestHex, message.signature, message.publicKey)
        } catch (error) {
            const err= {
                error: 'AUTHENTICATION_ERROR',
                reason: "verification failed"
            };
            console.log("Authentication failed..")
            throw err;
        }

        console.log(isVerified)
        return isVerified;
    }

    deserializeData(message) {
        const dataString = Buffer.from(message,'hex').toString('utf-8');

        return JSON.parse(dataString);
    }
}