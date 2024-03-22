const axios = require("axios");

export class GraphApiService {
	constructor(clientId, clientSecret, tenantId) {
		this.clientId = clientId;
		this.clientSecret = clientSecret;
		this.tenantId = tenantId;
	}

	async getAccessToken() {
		const tokenEndpoint = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;
		const headers = {
			"Content-Type": "application/x-www-form-urlencoded",
		};

		const body = new URLSearchParams({
			client_id: this.clientId,
			client_secret: this.clientSecret,
			scope: "https://graph.microsoft.com/.default",
			grant_type: "client_credentials",
		});

		try {
			const response = await axios.post(tokenEndpoint, body, { headers });
			return response.data.access_token;
		} catch (error) {
			console.error(error);
			throw new Error("Failed to obtain access token");
		}
	}

	/**
	 * @returns {Promise<*>} Return a list of group objects. A group object contains these properties as in https://learn.microsoft.com/en-us/graph/api/resources/group?view=graph-rest-1.0#properties
	 * Reference: https://learn.microsoft.com/en-us/graph/api/group-list?view=graph-rest-1.0&tabs=javascript
	 */
	async getGroups(accessToken) {
		try {
			const response = await axios.get("https://graph.microsoft.com/v1.0/groups", {
				headers: { Authorization: `Bearer ${accessToken}` },
			});

			return response.data.value;
		} catch (error) {
			console.error(error);
			throw new Error("Failed to get groups");
		}
	}

	/**
	 * Reference: https://learn.microsoft.com/en-us/graph/api/group-list-members?view=graph-rest-beta&tabs=javascript
	 *
	 * @param userGroupId
	 * @returns {Promise<*>} [{}, {}]
	 */
	async getUsersInGroup(accessToken, userGroupId) {
		let allMembers = [];
		try {
			let nextPageLink = `https://graph.microsoft.com/beta/groups/${userGroupId}/members?$select=id,mail,displayName,userPrincipalName`;
			do {
				const response = await axios.get(nextPageLink, {
					headers: { Authorization: `Bearer ${accessToken}` },
				});
				const members = response.data.value || [];
				allMembers = allMembers.concat(members);
				nextPageLink = response.data["@odata.nextLink"];
			} while (nextPageLink);

			return allMembers;
		} catch (error) {
			console.error(error);
			throw new Error("Failed to get users in group");
		}
	}

	async getUserDetails(accessToken, userId) {
		try {
			const response = await axios.get(
				`https://graph.microsoft.com/v1.0/users/${userId}`,
				{
					headers: { Authorization: `Bearer ${accessToken}` },
				},
			);

			return response.data;
		} catch (error) {
			console.error(error);
			throw new Error("Failed to get user details");
		}
	}

	async getUserImage(accessToken, email) {
		try {
			const response = await axios.get(
				`https://graph.microsoft.com/v1.0/users/${email}/photos/120x120/$value`,
				{
					headers: { Authorization: `Bearer ${accessToken}` },
					responseType: "arraybuffer",
				},
			);

			const base64String = Buffer.from(response.data, "binary").toString("base64");
			const dataURI = `data:image/jpeg;base64,${base64String}`;

			return dataURI;
		} catch (error) {
			console.error(
				"Error fetching profile image from Microsoft Graph API:",
				error,
			);
			return null;
		}
	}
}
