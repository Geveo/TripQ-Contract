INSERT INTO ContractVersion(Version, Description, CreatedOn, LastUpdatedOn) VALUES (1.0, "Initial Contract", 1694683784879, 1694683784879);

INSERT INTO HOTELS (
    [Name], [Description], StarRatings, ContactDetails, [Location], Facilities, WalletAddress, CreatedOn, LastUpdatedOn
) VALUES 
    ('Hotel A', 'Luxurious hotel in the heart of the city.', 5, '123-456-7890', 'Kandy', 'Swimming Pool, Spa, Gym', 'rLwEJJ4uaVrr9qyVeuGwgGJ4JaCVfRGAt2', 1624683784879, 1694683784579),
    ('Hotel B', 'Cozy hotel with a scenic view.', 4, '456-789-0123', 'Kandy', 'Restaurant, Bar, Conference Room', 'rLwEJJ4uaVrr9qyVeuGwgGJ4JaCVfRGAt2', 1624623784879, 1694683684579),
    ('Hotel C', 'Charming hotel near the beach.', 3, '789-012-3456', 'Colombo', 'Beach Access, Tennis Court, Breakfast Buffet', 'rLwEJJ4uaVrr9qyVeuGwgGJ4JaCVfRGAt2', 1626683784879, 1694681784579);

    INSERT INTO ROOMTYPES (
    HotelId, Code, Sqft, [Description], RoomsCount, Price, SingleBedCount, DoubleBedCount, TripleBedCount, TotalSleeps, Facilities, CreatedOn, LastUpdatedOn
) VALUES 
    (5, 'RoomA1', 300, 'Deluxe Room with City View', 10, '200', 1, 1, 0, 3, 'WiFi, TV, Mini Bar', 1624683744879, 1694683783579),
    (6, 'RoomB1', 400, 'Standard Room with Mountain View', 15, '150', 1, 3, 0, 7, 'WiFi, Coffee Maker', 1624683754879, 1691683784579),
    (5, 'RoomA2', 350, 'Suite with Ocean View', 3, '300', 1, 1, 0, 3, 'WiFi, Jacuzzi, Room Service', 1624623784879, 1694689784579);

