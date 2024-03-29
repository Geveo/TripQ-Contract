const RequestTypes = {
    HOTEL: "Hotel",
    ROOM: "Room",
    CUSTOMER: "Customer",
    RESERVATION: "Reservation"
}

const RequestSubTypes = {
    REGISTER_HOTEL: "RegisterHotel",
    REQUEST_TOKEN_OFFER: "RequestTokenOffer",
    REGISTRATION_CONFIRMATION: "RegistrationConfirmation",
    GET_HOTELS: "GetHotels",
    DEREG_HOTEL: "DeregHotel",
    RATE_HOTEL: "RateHotel",
    IS_REGISTERED_HOTEL: "IsRegisteredHotel",
    SEARCH_HOTELS_WITH_ROOM: "SearchHotelsWithRoom",
    GET_SINGLE_HOTEL_WITH_ROOMS: "GetSingleHotelWithRooms",

    GET_ROOMTYPES: "GetRoomTypes",
    CREATE_ROOMTYPE: "CreateRoomType",
    EDIT_ROOMTYPE: "EditRoomType",
    DELETE_ROOMTYPE: "DeleteRoomType",

    CREATE_CUSTOMER: "CreateCustomer",
    EDIT_CUSTOMER: "EditCustomer",
    DELETE_CUSTOMER: "DeleteCustomer",
    GET_CUSTOMERS: "GetCustomers",

    CREATE_RESERVATION: "CreateReservation",
    GET_RESERVATIONS: "GetReservations",
    DELETE_RESERVATION: "DeleteReservation"

}

const FacilityStatuses = {
    AVAILABLE: "Available",
    UNAVAILABLE: "UnAvaialble",
}