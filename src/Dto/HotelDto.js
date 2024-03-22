export class HotelDto {
    id;
    name;
    description;
    contactDetails;
    location;
    facilities;
    walletAddress;
    starRate;
    constructor(id, name, description, contactDetails, location, facilities, walletAddress, starRate) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.contactDetails = contactDetails;
        this.location = location;
        this.facilities = facilities;
        this.walletAddress = walletAddress;
        this.starRate = starRate;
    }
}