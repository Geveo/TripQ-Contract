INSERT INTO ContractVersion(Version, Description, CreatedOn, LastUpdatedOn) VALUES (1.0, "Initial Contract", 1694683784879, 1694683784879);

INSERT INTO HOTELS (
    [Name], [Description], StarRatings, ContactDetails, [Location], Facilities, WalletAddress, CreatedOn, LastUpdatedOn
) VALUES 
    ('Galle Face Hotel', 'Sri Lanka’s iconic landmark, The Galle Face Hotel, is situated in the heart of Colombo, along the seafront and facing the famous Galle Face Green. One of the oldest hotels east of the Suez, The Galle Face Hotel embraces its rich history and legendary traditions, utilizing them to create engaging, immersive experiences that resonate with old and new generations of travellers alike.',
    5, '{"FullName":"Sanjeev Gardiner","Email":"Sanjeev@gfhgroup.com","PhoneNumber":"0765878789"}', 
    '{"AddressLine01":"3","AddressLine02":"2 Galle Rd","City":"Colombo","DistanceFromCity":"0.5"}', 
    '[{"Id":2,"Name":"Swimming Pool","Description":"Description"},{"Id":5,"Name":"Spa & Wellness","Description":"Description"},{"Id":8,"Name":"Disabled access","Description":"Description"},{"Id":11,"Name":"Air Port Shuttle","Description":"Description"}]',
    'rB7ZMmFAwpx31Z3UFCixBjqTJqRBdCyk1r', 1624683783279, 1669683784579),

    ('Anantara', 'Everyday life is filled with opportunities to seek the exceptional, encounter the new and widen our horizons. For our worldly guests, a stay at Anantara is just one more chapter in a lifetime of travel and exploration. And we intend to make it an extraordinary one. The Anantara experience was born in 2001 with our first luxury property in Thailand’s historic seaside retreat of Hua Hin. From that day forward, we expanded throughout the world to beaches and private islands, countryside retreats, desert sands, heritage wonders and cosmopolitan cities. Today’s portfolio spans Asia, the Indian Ocean, the Middle East, Africa and Europe. Our thoughtfully designed luxury hotels and resorts provide windows into the genuine modern character of each destination. Inside and outside each property, travellers engage with the places, people and stories that make the destination like nowhere else in the world. Guests curate a lifetime of memories through personal experiences, as Anantara opens doors and enables journeys of adventure and indulgence.',
     4, '{"FullName":"Steve Smith","Email":"Steve@ananthara.com","PhoneNumber":"0707873789"}', 
    '{"AddressLine01":"5","AddressLine02":"St. Sebastian Rd","City":"Kaluthara","DistanceFromCity":"1.2"}', 
    '[{"Id":2,"Name":"Swimming Pool","Description":"Description"},{"Id":5,"Name":"Spa & Wellness","Description":"Description"},{"Id":9,"Name":"Restaurant","Description":"Description"},{"Id":11,"Name":"Air Port Shuttle","Description":"Description"}]',
    'rB7ZMmFAwpx31Z3UFCixBjqTJqRBdCyk1r', 1624683784879, 1694683684579),

    ('Shangri-La Colombo', 'A personal tropical sanctuary that is perfect for escaping the city, Shangri-La Colombo overlooks the Indian Ocean in the heart of the business district with direct access to the most extensive international shopping mall in Sri Lanka, Shangri-La’s own One Galle Face Mall. The hotel offers the finest accommodation in Colombo, an exciting new dining and social scene and the largest and extensive hotel conference and event facilities. - 541 rooms, suites and apartments - Signature dining venues with an exciting array of seasonal events - The most extensive and versatile event spaces in City',
     5, '{"FullName":"Xi Gin Sha","Email":"Xiginsha@shangrila.com","PhoneNumber":"0705623789"}', 
      '{"AddressLine01":"2","AddressLine02":"1 Galle Rd","City":"Colombo","DistanceFromCity":"0.5"}', 
      '[{"Id":1,"Name":"Free WiFi","Description":"Description"},{"Id":5,"Name":"Spa & Wellness","Description":"Description"},{"Id":19,"Name":"Restaurant","Description":"Description"},{"Id":12,"Name":"Bar","Description":"Description"}]',
       'rB7ZMmFAwpx31Z3UFCixBjqTJqRBdCyk1r', 1624543784879, 1694683736579),

    ('Jetwing Ayurveda Pavilions', 'A dedicated Ayurvedic health resort, offering personalized Ayurvedic treatments and wellness programs. It is close to cultural attractions where guests can explore and learn about Buddhism. The Ayurvedic Center offers a range of Ayurveda treatments which are traditional, curative and preventive treatments. The property has two in-house Ayurveda therapy centres (Weda Niwasa and Weda Arana) and an ayurveda pharmacy. This hotel is 100% vegetarian and vegan. Ayurveda cooking techniques, fruits and herbal teas are also available. Day trips to Muthurajawela and Aluthapola Temple can be arranged at the tour desk at a surcharge',
     4, '{"FullName":"Xi Gin","Email":"resv.ayurveda@jetwinghotels.com","PhoneNumber":"0777577760"}', 
      '{"AddressLine01":"Porutota Road","AddressLine02":"Ethukale","City":"Negombo","DistanceFromCity":"0.15"}', 
      '[{"Id":1,"Name":"Free WiFi","Description":"Description"},{"Id":5,"Name":"Spa & Wellness","Description":"Description"},{"Id":19,"Name":"Restaurant","Description":"Description"},{"Id":12,"Name":"Bar","Description":"Description"}]',
       'rB7ZMmFAwpx31Z3UFCixBjqTJqRBdCyk1r', 1624543784879, 1694683736579),
	   
	  ('Heritance Ayurveda Maha Gedara', 'At Heritance Ayurveda - All Meals and Treatments Maha Gedara, the hotel offers a healthy, life-enhancing experience through Ayurvedic treatments. All guests will start their journey with a consultation with the most senior physician, all treatments will then proceed under his guidance. The place to rest weary limbs, gently slow yourself down and discover the art of tranquility.
The focus of the Ayurveda Resort will be to provide total relaxation to its clients, starting with the surroundings itself and attention to the total body and mind. All guests will be entitled to an all inclusive stay at the hotel, this includes individually customized Ayurveda treatments and meals. The treatments will be provided only for the specifications of the guest body type.',
     3, '{"FullName":"Xi Gin Asi","Email":"hayinfo@heritancehotels.com","PhoneNumber":"0345555000"}', 
      '{"AddressLine01":"1","AddressLine02":"Heritance Ayurveda Maha Gedara","City":"Beruwala","DistanceFromCity":"3.2"}', 
      '[{"Id":1,"Name":"Free WiFi","Description":"Description"},{"Id":5,"Name":"Spa & Wellness","Description":"Description"},{"Id":19,"Name":"Restaurant","Description":"Description"},{"Id":12,"Name":"Bar","Description":"Description"}]',
       'rB7ZMmFAwpx31Z3UFCixBjqTJqRBdCyk1r', 1624543784879, 1694683736579);

    INSERT INTO ROOMTYPES (
    HotelId, Code, Sqft, [Description], RoomsCount, Price, SingleBedCount, DoubleBedCount, TripleBedCount, TotalSleeps, Facilities, CreatedOn, LastUpdatedOn
) VALUES 
    (1, 'Regency Room', 25, 'Our Superior Queen rooms feature comfortable queen size beds in a warm space, ideal for short stays for couples.',
     2, '0.00256',1, 1, 0, 3, '[{"Id":1,"Name":"Private Bathroom","Description":"These rooms have this facility."},{"Id":4,"Name":"Flat screen TV","Description":"These rooms have this facility."},{"Id":5,"Name":"Air Conditioning","Description":"These rooms have this facility."},{"Id":7,"Name":"Refrigerator","Description":"These rooms have this facility."}]', 1624683744879, 1694683783579),
    (1, 'Heritage Room', 45, 'Ideal for a couple, our Heritage rooms are spacious and provide the comfort and amenities for short stay guests to rest and recuperate in a soft ambience.',
      10, '0.00464',0, 1, 0, 2, '[{"Id":1,"Name":"Private Bathroom","Description":"These rooms have this facility."},{"Id":2,"Name":"Private Pool","Description":"These rooms have this facility."},{"Id":6,"Name":"Terrace","Description":"These rooms have this facility."},{"Id":9,"Name":"Kitchen/Kitchenette","Description":"These rooms have this facility."}]', 1624683744879, 1694683783579),
    (1, 'Presidential Suite', 80, 'The Presidential suite is exquisite room with a light and airy sitting space with Dining room seating for 10. Access to the Long room is automatic and Butler service is available upon request.',
      1, '0.00569',2, 2, 1, 10, '[{"Id":1,"Name":"Private Bathroom","Description":"These rooms have this facility."},{"Id":2,"Name":"Private Pool","Description":"These rooms have this facility."},{"Id":4,"Name":"Flat screen TV","Description":"These rooms have this facility."},{"Id":17,"Name":"Ironing Facility","Description":"These rooms have this facility."},{"Id":20,"Name":"Wardrobe/Closet","Description":"These rooms have this facility."}]', 1624683744879, 1694683783579),


    (2, 'Delux Pool View', 25, 'Sliding doors open from bedroom and bathroom to private terrace, and then a hop away lies the inviting swimming pool. Spend sunny days with sun and sea breezes at this Kalutara beach resort, before luxuriating in your sanctuary bathroom with an aromatic soak.',
     4, '0.00198',0, 1, 0, 2, '[{"Id":1,"Name":"Private Bathroom","Description":"These rooms have this facility."},{"Id":4,"Name":"Flat screen TV","Description":"These rooms have this facility."},{"Id":5,"Name":"Air Conditioning","Description":"These rooms have this facility."},{"Id":8,"Name":"Balcony","Description":"These rooms have this facility."}]', 1624683744879, 1694683783579),
    (2, 'Premier Garden View', 37, 'A natural haven at our Kalutara hotel in Sri Lanka of soothing creams with a pop of colourful textiles. Wake up to fragrant-bloom mornings and enjoy a Nespresso on your balcony or terrace.',
      8, '0.00364',1, 0, 1, 4, '[{"Id":1,"Name":"Private Bathroom","Description":"These rooms have this facility."},{"Id":2,"Name":"Private Pool","Description":"These rooms have this facility."},{"Id":6,"Name":"Terrace","Description":"These rooms have this facility."},{"Id":9,"Name":"Kitchen/Kitchenette","Description":"These rooms have this facility."}]', 1624683744879, 1694683783579),
    (2, 'Royal Bawa Suite', 90, 'A one-of-a-kind suite experience amongst Kalutara resorts. Revel in spaces all yours – a master bedroom opening onto sun-kissed deck and private plunge pool. A cool living and dining area adorned with indigenous artwork and plush textiles. ',
      1, '0.00452',1, 1, 1, 6, '[{"Id":1,"Name":"Private Bathroom","Description":"These rooms have this facility."},{"Id":2,"Name":"Private Pool","Description":"These rooms have this facility."},{"Id":4,"Name":"Flat screen TV","Description":"These rooms have this facility."},{"Id":5,"Name":"Air Conditioning","Description":"These rooms have this facility."},{"Id":14,"Name":"Safety deposit box","Description":"These rooms have this facility."}]', 1624683744879, 1694683783579),

    (3, 'Delux Ocean View', 30, 'Deluxe Ocean View Rooms are beautifully appointed with a contemporary design and local Sri Lankan touches. All rooms look out over the Indian Ocean or Colombo cityscape.',
     10, '0.00225',0, 1, 0, 2, '[{"Id":1,"Name":"Private Bathroom","Description":"These rooms have this facility."},{"Id":4,"Name":"Flat screen TV","Description":"These rooms have this facility."},{"Id":5,"Name":"Air Conditioning","Description":"These rooms have this facility."},{"Id":8,"Name":"Balcony","Description":"These rooms have this facility."}]', 1624683744879, 1694683783579),
    (3, 'Premiere Ocean View', 40, 'Premier Ocean View Rooms offer stylish comfort with the luxury of space. The rooms feature a thoughtful contemporary design with light colours and rich fabrics. In addition, these rooms feature panoramic views of the Indian Ocean.',
      5, '0.00375',1, 1, 0, 3, '[{"Id":1,"Name":"Private Bathroom","Description":"These rooms have this facility."},{"Id":4,"Name":"Flat screen TV","Description":"These rooms have this facility."},{"Id":5,"Name":"Air Conditioning","Description":"These rooms have this facility."},{"Id":8,"Name":"Balcony","Description":"These rooms have this facility."}]', 1624683744879, 1694683783579),
    (3, 'Shangri La Suite', 105, 'The Shangri-La Suite is an exclusive suite in Colombo – a luxurious living space with superlative views over the Indian Ocean. The suite comprises one spacious guest room and a separate living room featuring plush interior and luxurious amenities. Room views and layout may differ from floor to floor.',
      2, '0.00635',0, 1, 1, 5, '[{"Id":1,"Name":"Private Bathroom","Description":"These rooms have this facility."},{"Id":2,"Name":"Private Pool","Description":"These rooms have this facility."},{"Id":5,"Name":"Air Conditioning","Description":"These rooms have this facility."},{"Id":14,"Name":"Safety deposit box","Description":"These rooms have this facility."}]', 1624683744879, 1694683783579),

    (4, 'Standard Room Non A/C with Yoga', 30, 'Deluxe Ocean View Rooms are beautifully appointed with a contemporary design and local Sri Lankan touches. All rooms look out over the Indian Ocean or Colombo cityscape.',
     10, '0.00225',0, 1, 0, 2, '[{"Id":1,"Name":"Private Bathroom","Description":"These rooms have this facility."},{"Id":4,"Name":"Flat screen TV","Description":"These rooms have this facility."},{"Id":5,"Name":"Air Conditioning","Description":"These rooms have this facility."},{"Id":8,"Name":"Balcony","Description":"These rooms have this facility."}]', 1624683744879, 1694683783579),
    (4, 'Standard Room Non A/C with treatments', 40, 'Premier Ocean View Rooms offer stylish comfort with the luxury of space. The rooms feature a thoughtful contemporary design with light colours and rich fabrics. In addition, these rooms feature panoramic views of the Indian Ocean.',
      5, '0.00375',1, 1, 0, 3, '[{"Id":1,"Name":"Private Bathroom","Description":"These rooms have this facility."},{"Id":4,"Name":"Flat screen TV","Description":"These rooms have this facility."},{"Id":5,"Name":"Air Conditioning","Description":"These rooms have this facility."},{"Id":8,"Name":"Balcony","Description":"These rooms have this facility."}]', 1624683744879, 1694683783579),
    (4, 'Deluxe Room Non A/C with Yoga', 105, 'The Shangri-La Suite is an exclusive suite in Colombo – a luxurious living space with superlative views over the Indian Ocean. The suite comprises one spacious guest room and a separate living room featuring plush interior and luxurious amenities. Room views and layout may differ from floor to floor.',
      2, '0.00635',0, 1, 1, 5, '[{"Id":1,"Name":"Private Bathroom","Description":"These rooms have this facility."},{"Id":2,"Name":"Private Pool","Description":"These rooms have this facility."},{"Id":5,"Name":"Air Conditioning","Description":"These rooms have this facility."},{"Id":14,"Name":"Safety deposit box","Description":"These rooms have this facility."}]', 1624683744879, 1694683783579),

    (5, 'Deluxe Room with All Meals and Treatments', 30, 'Deluxe Ocean View Rooms are beautifully appointed with a contemporary design and local Sri Lankan touches. All rooms look out over the Indian Ocean or Colombo cityscape.',
     10, '0.00225',0, 1, 0, 2, '[{"Id":1,"Name":"Private Bathroom","Description":"These rooms have this facility."},{"Id":4,"Name":"Flat screen TV","Description":"These rooms have this facility."},{"Id":5,"Name":"Air Conditioning","Description":"These rooms have this facility."},{"Id":8,"Name":"Balcony","Description":"These rooms have this facility."}]', 1624683744879, 1694683783579),
    (5, 'Suite with All Meals and Treatments', 40, 'Premier Ocean View Rooms offer stylish comfort with the luxury of space. The rooms feature a thoughtful contemporary design with light colours and rich fabrics. In addition, these rooms feature panoramic views of the Indian Ocean.',
      5, '0.00375',1, 1, 0, 3, '[{"Id":1,"Name":"Private Bathroom","Description":"These rooms have this facility."},{"Id":4,"Name":"Flat screen TV","Description":"These rooms have this facility."},{"Id":5,"Name":"Air Conditioning","Description":"These rooms have this facility."},{"Id":8,"Name":"Balcony","Description":"These rooms have this facility."}]', 1624683744879, 1694683783579),
    (5, 'Classic Room with Slimming Programme', 105, 'The Shangri-La Suite is an exclusive suite in Colombo – a luxurious living space with superlative views over the Indian Ocean. The suite comprises one spacious guest room and a separate living room featuring plush interior and luxurious amenities. Room views and layout may differ from floor to floor.',
      2, '0.00635',0, 1, 1, 5, '[{"Id":1,"Name":"Private Bathroom","Description":"These rooms have this facility."},{"Id":2,"Name":"Private Pool","Description":"These rooms have this facility."},{"Id":5,"Name":"Air Conditioning","Description":"These rooms have this facility."},{"Id":14,"Name":"Safety deposit box","Description":"These rooms have this facility."}]', 1624683744879, 1694683783579);



INSERT INTO HOTELIMAGES (HotelId, ImageURL, CreatedOn, LastUpdatedOn)
VALUES
(1, 'https://firebasestorage.googleapis.com/v0/b/voyagelankav1.appspot.com/o/hotel_images%2FThe%20Galle%20Face%20Hotel%2FGF1%20(1).jpg?alt=media&token=ae3f6bdf-b95c-47be-b50b-3136cec11d1c', 1647004800, 1647004800),
(1, 'https://firebasestorage.googleapis.com/v0/b/voyagelankav1.appspot.com/o/hotel_images%2FThe%20Galle%20Face%20Hotel%2F2022-02-10%20(2).jpg?alt=media&token=f40cbbd1-5fc0-4dec-89f3-c46fdb57e1c3', 1647004800, 1647004800),
(1, 'https://firebasestorage.googleapis.com/v0/b/voyagelankav1.appspot.com/o/hotel_images%2FThe%20Galle%20Face%20Hotel%2Frr4%20(1).jpg?alt=media&token=93b0aa97-80c8-4e25-b701-93ddb4a2ba8d', 1647004800, 1647004800),
(1, 'https://firebasestorage.googleapis.com/v0/b/voyagelankav1.appspot.com/o/hotel_images%2FShangri%20La%2FShangri-La-Colombo.jpg?alt=media&token=201b3e0e-8a84-444c-92ed-04880b0d3a92', 1647004800, 1647004800),

(2, 'https://firebasestorage.googleapis.com/v0/b/voyagelankav1.appspot.com/o/hotel_images%2FAnantara%2F177690675%20(1).jpg?alt=media&token=d9fb6761-2c0d-4cde-ad11-8ca41d1c66cf', 1647004800, 1647004800),
(2, 'https://firebasestorage.googleapis.com/v0/b/voyagelankav1.appspot.com/o/hotel_images%2FAnantara%2F178098518%20(1).jpg?alt=media&token=06a8099e-291e-4255-bdee-61213b98ae24', 1647004800, 1647004800),
(2, 'https://firebasestorage.googleapis.com/v0/b/voyagelankav1.appspot.com/o/hotel_images%2FAnantara%2F250797625%20(1).jpg?alt=media&token=217a5e27-f92f-4d59-b42f-40394f84da8e', 1647004800, 1647004800),
(2, 'https://firebasestorage.googleapis.com/v0/b/voyagelankav1.appspot.com/o/hotel_images%2FAnantara%2F185047937%20(1).jpg?alt=media&token=a688c905-f1d7-4c29-a541-bd5174f66749', 1647004800, 1647004800),

(3, 'https://firebasestorage.googleapis.com/v0/b/voyagelankav1.appspot.com/o/hotel_images%2FShangri%20La%2Fcg-exec-room-1090-090921-06.jpeg?alt=media&token=b0b67d73-06c6-4a7b-976f-800b724614a1', 1647004800, 1647004800),
(3, 'https://firebasestorage.googleapis.com/v0/b/voyagelankav1.appspot.com/o/hotel_images%2FShangri%20La%2Fdownload%20(2).jpeg?alt=media&token=69cd39ec-3f66-467d-8b74-f8b9f09227ce', 1647004800, 1647004800),
(3, 'https://firebasestorage.googleapis.com/v0/b/voyagelankav1.appspot.com/o/hotel_images%2FShangri%20La%2Fdownload.jpeg?alt=media&token=9beb5468-bf6c-4ba0-9b4a-0cef7d26d738', 1647004800, 1647004800),
(3, 'https://firebasestorage.googleapis.com/v0/b/voyagelankav1.appspot.com/o/hotel_images%2FShangri%20La%2Fmaxresdefault.jpg?alt=media&token=811c26ae-9f99-459d-a18e-967c49e4557a', 1647004800, 1647004800),

(4, 'https://firebasestorage.googleapis.com/v0/b/voyagelankav1.appspot.com/o/hotel_images%2FJetwing%20Ayurveda%20Pavilions%20-%20Full%20Board%20%26%20Treatments%2FJetwing%20Ayurveda%20Pavilions%20-%20Full%20Board%20%26%20Treatments_202466f5-2378-4e3d-90a1-a28e85ca2fce.jpg?alt=media&token=63cfb80b-6735-4052-8226-61deba67a2f9', 1647004800, 1647004800),
(4, 'https://firebasestorage.googleapis.com/v0/b/voyagelankav1.appspot.com/o/hotel_images%2FJetwing%20Ayurveda%20Pavilions%20-%20Full%20Board%20%26%20Treatments%2FJetwing%20Ayurveda%20Pavilions%20-%20Full%20Board%20%26%20Treatments_52e82fe3-25be-4136-b636-7f3850e23227.jpg?alt=media&token=c9e2ae99-0bbb-4fb2-a520-9e119824c53c', 1647004800, 1647004800),
(4, 'https://firebasestorage.googleapis.com/v0/b/voyagelankav1.appspot.com/o/hotel_images%2FJetwing%20Ayurveda%20Pavilions%20-%20Full%20Board%20%26%20Treatments%2FJetwing%20Ayurveda%20Pavilions%20-%20Full%20Board%20%26%20Treatments_5f18956b-2331-486c-8f18-4c3a2ab3bb71.jpg?alt=media&token=b06f3355-0c3c-4446-8992-e0fb3e89b21e', 1647004800, 1647004800),
(4, 'https://firebasestorage.googleapis.com/v0/b/voyagelankav1.appspot.com/o/hotel_images%2FA11%2FA11_7c606b73-5ba9-4aa5-8f75-f17bbb1c940a.jpg?alt=media&token=cba2e4cc-9bb0-42c3-82c9-f779a3b2cf0f', 1647004800, 1647004800),

(5, 'https://firebasestorage.googleapis.com/v0/b/voyagelankav1.appspot.com/o/hotel_images%2FHeritance%20Ayurveda%2FHeritance%20Ayurveda_38ed4e26-eff9-46c0-b61a-c43b40394d9f.jpg?alt=media&token=72d0e929-cbcf-4b4f-93b5-9bf5b286fa6a', 1647004800, 1647004800),
(5, 'https://firebasestorage.googleapis.com/v0/b/voyagelankav1.appspot.com/o/hotel_images%2FHeritance%20Ayurveda%2FHeritance%20Ayurveda_5971b703-3da7-4de9-bbba-0da76530e84b.jpg?alt=media&token=f4c01ec3-d8de-4ac4-9744-e76615508a40', 1647004800, 1647004800),
(5, 'https://firebasestorage.googleapis.com/v0/b/voyagelankav1.appspot.com/o/hotel_images%2FHeritance%20Ayurveda%2FHeritance%20Ayurveda_6349bf2e-b85e-49d2-b79a-6e1b1a3acff2.jpg?alt=media&token=4efd5a9a-2887-488b-a9f0-18578c626be3', 1647004800, 1647004800),
(5, 'https://firebasestorage.googleapis.com/v0/b/voyagelankav1.appspot.com/o/hotel_images%2FH4%2FH4_6bd6ce98-15e8-4e55-a7df-f778441ef2f2.jpg?alt=media&token=a6724807-1988-4219-a5ca-97bca877adac', 1647004800, 1647004800);


INSERT INTO RESERVATIONS (
    WalletAddress, Price, FromDate, ToDate, NoOfNights, FirstName, LastName, Email, Country, Telephone, HotelId, CreatedOn, LastUpdatedOn
) VALUES (
    'Sanjeev@gfhgroup.com', 256, '2024-04-23', '2024-04-25', 2, 'John', 'Doe', 'john.doe@example.com', 'Sri Lanka', '123456789', 
    1, 1694683784879, 1694683684879
);


INSERT INTO RESERVATIONROOMTYPES (
    RoomTypeId, ReservationId, NoOfRooms, CreatedOn, LastUpdatedOn
) VALUES 
    (1, 1, 1, 1684683684879, 1694683682879),
    (2, 1, 4, 1694683684872, 1694683684871);