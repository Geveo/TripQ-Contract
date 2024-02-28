INSERT INTO ContractVersion(Version, Description, CreatedOn, LastUpdatedOn) VALUES (1.0, "Initial Contract", 1694683784879, 1694683784879);


INSERT INTO HOTELS (Name, Description, StarRatings, ContactDetails, Location, Facilities, CreatedOn, LastUpdatedOn)
VALUES 
    ('Hotel A', 'Description for Hotel A', 4, 'Contact details for Hotel A', 'Location of Hotel A', 'Facilities available at Hotel A', 169468378479, 169468378879),
    ('Hotel B', 'Description for Hotel B', 4, 'Contact details for Hotel B', 'Location of Hotel B', 'Facilities available at Hotel B', 164268378479, 165468378879),
    ('Hotel C', 'Description for Hotel C', 5, 'Contact details for Hotel C', 'Location of Hotel C', 'Facilities available at Hotel C', 169468384879, 169483784879);


    INSERT INTO ROOMTYPES (HotelId, Code, Sqft, Description, RoomsCount, Price, SingleBedCount, DoubleBedCount, TripleBedCount, Facilities, CreatedOn, LastUpdatedOn)
VALUES 
    (4, 'Standard', 300, 'Standard room description', 10, 100.00, 1, 0, 0, 'Wi-Fi, TV, Air conditioning', 16946838479, 16946838879),
    (3, 'Deluxe', 400, 'Deluxe room description', 5, 150.00, 1, 1, 0, 'Wi-Fi, TV, Air conditioning, Mini bar', 16968378479, 16946378879);