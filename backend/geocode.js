const axios = require('axios');
const fs = require('fs');

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

const ALL_IEBC_CENTERS = [
  {name:"Changamwe IEBC",county:"Mombasa",constituency:"Changamwe",location:"At Changamwe firestation",landmark:"Changamwe firestation"},
  {name:"Jomvu IEBC",county:"Mombasa",constituency:"Jomvu",location:"Mikindani Police Station",landmark:"Mikindani Police Station"},
  {name:"Kisauni IEBC",county:"Mombasa",constituency:"Kisauni",location:"Bamburi Fisheries",landmark:"Supa Loaf Bakery"},
  {name:"Nyali IEBC",county:"Mombasa",constituency:"Nyali",location:"Chiefs office Kongowea",landmark:"DCC Nyali's office"},
  {name:"Likoni IEBC",county:"Mombasa",constituency:"Likoni",location:"Shika Adabu",landmark:"Shika Adabu Chiefs office"},
  {name:"Mvita IEBC",county:"Mombasa",constituency:"Mvita",location:"Kizingo, Rashid Sajad road",landmark:"Chef Royale Restaurant"},
  {name:"Msambweni IEBC",county:"Kwale",constituency:"Msambweni",location:"Msambweni Dcc's Office",landmark:"Subcounty HQ Msambweni"},
  {name:"Lungalunga IEBC",county:"Kwale",constituency:"Lungalunga",location:"Mbuyuni Area",landmark:"Mnarani Mast Lungalunga"},
  {name:"Matuga IEBC",county:"Kwale",constituency:"Matuga",location:"Kwale Town",landmark:"Baraza Park Kwale"},
  {name:"Kinango IEBC",county:"Kwale",constituency:"Kinango",location:"Bebora Plaza",landmark:"Chief's Office Kinango"},
  {name:"Kilifi North IEBC",county:"Kilifi",constituency:"Kilifi North",location:"Huduma Centre Kilifi",landmark:"Kilifi Bridge"},
  {name:"Kilifi South IEBC",county:"Kilifi",constituency:"Kilifi South",location:"Majengo Kanamai",landmark:"Matatu Terminus Kanamai"},
  {name:"Kaloleni IEBC",county:"Kilifi",constituency:"Kaloleni",location:"St.Johns Girls Sec",landmark:"ACK Church Kaloleni"},
  {name:"Rabai IEBC",county:"Kilifi",constituency:"Rabai",location:"Shikaadabu",landmark:"CDF Office Rabai"},
  {name:"Ganze IEBC",county:"Kilifi",constituency:"Ganze",location:"Ganze Town",landmark:"Police Station Ganze"},
  {name:"Malindi IEBC",county:"Kilifi",constituency:"Malindi",location:"Maweni Area",landmark:"Malindi Hospital"},
  {name:"Magarini IEBC",county:"Kilifi",constituency:"Magarini",location:"Mwembe Resort",landmark:"Mwembe Resort Magarini"},
  {name:"Garsen IEBC",county:"Tana River",constituency:"Garsen",location:"Garsen Town",landmark:"KCB Bank Garsen"},
  {name:"Galole IEBC",county:"Tana River",constituency:"Galole",location:"Hola Town",landmark:"Kenya Medical Training Hola"},
  {name:"Bura IEBC",county:"Tana River",constituency:"Bura",location:"Bura Town",landmark:"Government Offices Bura"},
  {name:"Lamu East IEBC",county:"Lamu",constituency:"Lamu East",location:"Faza",landmark:"Post Office Faza"},
  {name:"Lamu West IEBC",county:"Lamu",constituency:"Lamu West",location:"Mokowe",landmark:"Public Works Office Mokowe"},
  {name:"Taveta IEBC",county:"Taita Taveta",constituency:"Taveta",location:"Taveta Town",landmark:"Probation Office Taveta"},
  {name:"Wundanyi IEBC",county:"Taita Taveta",constituency:"Wundanyi",location:"Administration offices Wundanyi",landmark:"Forest Service office Wundanyi"},
  {name:"Mwatate IEBC",county:"Taita Taveta",constituency:"Mwatate",location:"Mwatate old market",landmark:"Tavevo water company Mwatate"},
  {name:"Voi IEBC",county:"Taita Taveta",constituency:"Voi",location:"County Public Service Board Voi",landmark:"Voi Remand prison"},
  {name:"Garissa Township IEBC",county:"Garissa",constituency:"Garissa Township",location:"Off Lamu Road Garissa",landmark:"Ministry Of Water Garissa"},
  {name:"Balambala IEBC",county:"Garissa",constituency:"Balambala",location:"Balambala Town",landmark:"DC's Office Balambala"},
  {name:"Lagdera IEBC",county:"Garissa",constituency:"Lagdera",location:"Modogashe Town",landmark:"Police Station Modogashe"},
  {name:"Dadaab IEBC",county:"Garissa",constituency:"Dadaab",location:"Dadaab Town",landmark:"UN Compound Dadaab"},
  {name:"Fafi IEBC",county:"Garissa",constituency:"Fafi",location:"Fafi Town",landmark:"DC's Office Fafi"},
  {name:"Ijara IEBC",county:"Garissa",constituency:"Ijara",location:"Masalani Town",landmark:"DC's Office Masalani"},
  {name:"Wajir North IEBC",county:"Wajir",constituency:"Wajir North",location:"Bute Town",landmark:"Police Station Bute"},
  {name:"Wajir East IEBC",county:"Wajir",constituency:"Wajir East",location:"Wajir Town",landmark:"Huduma Centre Wajir"},
  {name:"Tarbaj IEBC",county:"Wajir",constituency:"Tarbaj",location:"Tarbaj Town",landmark:"Ward Administrator Tarbaj"},
  {name:"Wajir West IEBC",county:"Wajir",constituency:"Wajir West",location:"Giriftu Town",landmark:"DCC's Office Giriftu"},
  {name:"Eldas IEBC",county:"Wajir",constituency:"Eldas",location:"Eldas Town",landmark:"DC's Residence Eldas"},
  {name:"Wajir South IEBC",county:"Wajir",constituency:"Wajir South",location:"Habaswein Town",landmark:"AP Camp Habaswein"},
  {name:"Banissa IEBC",county:"Mandera",constituency:"Banissa",location:"Banissa Town",landmark:"Malkamari Hotel Banissa"},
  {name:"Mandera West IEBC",county:"Mandera",constituency:"Mandera West",location:"Takaba Town",landmark:"Takaba Primary School"},
  {name:"Mandera North IEBC",county:"Mandera",constituency:"Mandera North",location:"DCC Compound Mandera",landmark:"DCC Compound Mandera North"},
  {name:"Mandera South IEBC",county:"Mandera",constituency:"Mandera South",location:"Elwak CBD",landmark:"Dido Petrol Station Elwak"},
  {name:"Mandera East IEBC",county:"Mandera",constituency:"Mandera East",location:"Mandera Town",landmark:"Blue Light Petrol Mandera"},
  {name:"Lafey IEBC",county:"Mandera",constituency:"Lafey",location:"Lafey Town",landmark:"Lafey Primary School"},
  {name:"Moyale IEBC",county:"Marsabit",constituency:"Moyale",location:"ACK Moyale",landmark:"St. Paul Training Center Moyale"},
  {name:"North Horr IEBC",county:"Marsabit",constituency:"North Horr",location:"North Horr Town",landmark:"AP Camp North Horr"},
  {name:"Saku IEBC",county:"Marsabit",constituency:"Saku",location:"Marsabit Town",landmark:"St. Peter Cathedral Marsabit"},
  {name:"Laisamis IEBC",county:"Marsabit",constituency:"Laisamis",location:"Laisamis Town",landmark:"DCC Compound Laisamis"},
  {name:"Isiolo North IEBC",county:"Isiolo",constituency:"Isiolo North",location:"Isiolo Town",landmark:"County Assembly Isiolo"},
  {name:"Isiolo South IEBC",county:"Isiolo",constituency:"Isiolo South",location:"Garbatulla Town",landmark:"Catholic Mission Garbatulla"},
  {name:"Buuri IEBC",county:"Meru",constituency:"Buuri",location:"Timau Town",landmark:"DCC Buuri West Timau"},
  {name:"Igembe Central IEBC",county:"Meru",constituency:"Igembe Central",location:"Kangeta Town",landmark:"DCC Office Kangeta"},
  {name:"Igembe North IEBC",county:"Meru",constituency:"Igembe North",location:"Laare Town",landmark:"Shell Petrol Station Laare"},
  {name:"Tigania West IEBC",county:"Meru",constituency:"Tigania West",location:"Kianjai Town",landmark:"National Bank Kianjai"},
  {name:"Tigania East IEBC",county:"Meru",constituency:"Tigania East",location:"Muriri Town",landmark:"DCC Office Muriri"},
  {name:"North Imenti IEBC",county:"Meru",constituency:"North Imenti",location:"Meru Town",landmark:"Huduma Center Meru"},
  {name:"Igembe South IEBC",county:"Meru",constituency:"Igembe South",location:"Maua Town",landmark:"Police Station Maua"},
  {name:"Central Imenti IEBC",county:"Meru",constituency:"Central Imenti",location:"Gatimbi Market",landmark:"Equator Signpost Meru"},
  {name:"South Imenti IEBC",county:"Meru",constituency:"South Imenti",location:"Nkubu Town",landmark:"Consolata Hospital Nkubu"},
  {name:"Maara IEBC",county:"Tharaka-Nithi",constituency:"Maara",location:"Kienganguru",landmark:"DCC Compound Maara"},
  {name:"Chuka Igambang'ombe IEBC",county:"Tharaka-Nithi",constituency:"Chuka/Igambang'ombe",location:"Chuka Town",landmark:"Trans National Bank Chuka"},
  {name:"Tharaka IEBC",county:"Tharaka-Nithi",constituency:"Tharaka",location:"Marimanti Town",landmark:"DCC Offices Marimanti"},
  {name:"Manyatta IEBC",county:"Embu",constituency:"Manyatta",location:"Embu Town",landmark:"ACK Cathedral Church Embu"},
  {name:"Runyenjes IEBC",county:"Embu",constituency:"Runyenjes",location:"Runyenjes Town",landmark:"DCC Offices Runyenjes"},
  {name:"Mbeere South IEBC",county:"Embu",constituency:"Mbeere South",location:"Kiritiri Town",landmark:"DCC Offices Kiritiri"},
  {name:"Mbeere North IEBC",county:"Embu",constituency:"Mbeere North",location:"Siakago Town",landmark:"DCC Offices Siakago"},
  {name:"Mwingi North IEBC",county:"Kitui",constituency:"Mwingi North",location:"Kyuso Town",landmark:"Equity Bank Kyuso"},
  {name:"Mwingi West IEBC",county:"Kitui",constituency:"Mwingi West",location:"Migwani Town",landmark:"Baraza Park Migwani"},
  {name:"Mwingi Central IEBC",county:"Kitui",constituency:"Mwingi Central",location:"Mwingi Town",landmark:"NCPB Depot Mwingi"},
  {name:"Kitui West IEBC",county:"Kitui",constituency:"Kitui West",location:"Matinyani Town",landmark:"DCC Offices Matinyani"},
  {name:"Kitui Rural IEBC",county:"Kitui",constituency:"Kitui Rural",location:"Kwa Vonza Town",landmark:"CDF Building Kwa Vonza"},
  {name:"Kitui Central IEBC",county:"Kitui",constituency:"Kitui Central",location:"Kitui Town",landmark:"Kafoca Hotel Kitui"},
  {name:"Kitui East IEBC",county:"Kitui",constituency:"Kitui East",location:"Zombe Town",landmark:"Police Station Zombe"},
  {name:"Kitui South IEBC",county:"Kitui",constituency:"Kitui South",location:"Ikutha Town",landmark:"Registry Office Ikutha"},
  {name:"Masinga IEBC",county:"Machakos",constituency:"Masinga",location:"Masinga Town",landmark:"MULKAS Petrol Masinga"},
  {name:"Yatta IEBC",county:"Machakos",constituency:"Yatta",location:"Kithimani Town",landmark:"NCPB Compound Kithimani"},
  {name:"Kangundo IEBC",county:"Machakos",constituency:"Kangundo",location:"Kangundo Town",landmark:"Kangundo Hospital"},
  {name:"Matungulu IEBC",county:"Machakos",constituency:"Matungulu",location:"Tala Town",landmark:"Kangundo Junior School Tala"},
  {name:"Kathiani IEBC",county:"Machakos",constituency:"Kathiani",location:"Kathiani Town",landmark:"DCC Office Kathiani"},
  {name:"Mavoko IEBC",county:"Machakos",constituency:"Mavoko",location:"Athi River Town",landmark:"DCC Office Athi River"},
  {name:"Machakos Town IEBC",county:"Machakos",constituency:"Machakos Town",location:"Machakos Town",landmark:"IEBC County Offices Machakos"},
  {name:"Mwala IEBC",county:"Machakos",constituency:"Mwala",location:"Mwala Town",landmark:"Police Patrol Base Mwala"},
  {name:"Mbooni IEBC",county:"Makueni",constituency:"Mbooni",location:"Tawa Town",landmark:"Tawa Law Courts"},
  {name:"Kilome IEBC",county:"Makueni",constituency:"Kilome",location:"Malili Town",landmark:"Konza City"},
  {name:"Kaiti IEBC",county:"Makueni",constituency:"Kaiti",location:"Mukuyuni Town",landmark:"Police Station Mukuyuni"},
  {name:"Makueni IEBC",county:"Makueni",constituency:"Makueni",location:"Wote Town",landmark:"Subcounty Hospital Wote"},
  {name:"Kibwezi West IEBC",county:"Makueni",constituency:"Kibwezi West",location:"Makindu Town",landmark:"DCC Office Makindu"},
  {name:"Kibwezi East IEBC",county:"Makueni",constituency:"Kibwezi East",location:"Kibwezi Town",landmark:"Ministry Office Kibwezi"},
  {name:"Kinangop IEBC",county:"Nyandarua",constituency:"Kinangop",location:"Njabini Town",landmark:"Subcounty HQ Kinangop"},
  {name:"Kipipiri IEBC",county:"Nyandarua",constituency:"Kipipiri",location:"Kipipiri Town",landmark:"Subcounty HQ Kipipiri"},
  {name:"Ol Kalou IEBC",county:"Nyandarua",constituency:"Ol Kalou",location:"Ol Kalou Town",landmark:"Posta Building Ol Kalou"},
  {name:"Ol Jorok IEBC",county:"Nyandarua",constituency:"Ol Jorok",location:"Mirangine Town",landmark:"Subcounty HQ Ol Jorok"},
  {name:"Ndaragwa IEBC",county:"Nyandarua",constituency:"Ndaragwa",location:"Ndaragwa Town",landmark:"Police Station Ndaragwa"},
  {name:"Tetu IEBC",county:"Nyeri",constituency:"Tetu",location:"Tetu Town",landmark:"DCC Offices Tetu"},
  {name:"Kieni IEBC",county:"Nyeri",constituency:"Kieni",location:"Mweiga Town",landmark:"Equity ATM Mweiga"},
  {name:"Mathira IEBC",county:"Nyeri",constituency:"Mathira",location:"Karatina Town",landmark:"Law Courts Karatina"},
  {name:"Othaya IEBC",county:"Nyeri",constituency:"Othaya",location:"Othaya Town",landmark:"DCC Office Othaya"},
  {name:"Mukurwe-Ini IEBC",county:"Nyeri",constituency:"Mukurwe-ini",location:"Mukurwe-ini Town",landmark:"Subcounty Hospital Mukurwe-ini"},
  {name:"Nyeri Town IEBC",county:"Nyeri",constituency:"Nyeri-Town",location:"Nyeri Town",landmark:"Huduma Center Nyeri"},
  {name:"Mwea IEBC",county:"Kirinyaga",constituency:"Mwea",location:"Wanguru Town",landmark:"Police Station Wanguru"},
  {name:"Gichugu IEBC",county:"Kirinyaga",constituency:"Gichugu",location:"Kianyaga Town",landmark:"Raimu Primary School Kianyaga"},
  {name:"Ndia IEBC",county:"Kirinyaga",constituency:"Ndia",location:"Baricho Town",landmark:"ACK St Philips Baricho"},
  {name:"Kirinyaga Central IEBC",county:"Kirinyaga",constituency:"Kirinyaga Central",location:"Kerugoya Town",landmark:"Police Station Kerugoya"},
  {name:"Kirinyaga County IEBC",county:"Kirinyaga",constituency:"County Office",location:"Kerugoya Town",landmark:"High Court Kerugoya"},
  {name:"Kangema IEBC",county:"Murang'a",constituency:"Kangema",location:"Kangema Town",landmark:"DCC Offices Kangema"},
  {name:"Mathioya IEBC",county:"Murang'a",constituency:"Mathioya",location:"Kiria-Ini Town",landmark:"DCC Offices Kiria-Ini"},
  {name:"Kiharu IEBC",county:"Murang'a",constituency:"Kiharu",location:"Murang'a Town",landmark:"Rubis Petrol Station Murang'a"},
  {name:"Kigumo IEBC",county:"Murang'a",constituency:"Kigumo",location:"Kangari Town",landmark:"Muungano Microfinance Kangari"},
  {name:"Maragwa IEBC",county:"Murang'a",constituency:"Maragwa",location:"Makuyu Town",landmark:"ACC Office Makuyu"},
  {name:"Kandara IEBC",county:"Murang'a",constituency:"Kandara",location:"Kandara Town",landmark:"Amica Sacco Kandara"},
  {name:"Gatanga IEBC",county:"Murang'a",constituency:"Gatanga",location:"Kirwara Town",landmark:"Police Station Kirwara"},
  {name:"Murang'a County IEBC",county:"Murang'a",constituency:"County Office",location:"Murang'a Town",landmark:"Rubis Petrol Station Murang'a"},
  {name:"Gatundu South IEBC",county:"Kiambu",constituency:"Gatundu South",location:"Gatundu Town",landmark:"Level 5 Hospital Gatundu"},
  {name:"Gatundu North IEBC",county:"Kiambu",constituency:"Gatundu North",location:"Kamwangi Town",landmark:"DCC Office Kamwangi"},
  {name:"Juja IEBC",county:"Kiambu",constituency:"Juja",location:"Juja Town",landmark:"Agakhan Hospital Juja"},
  {name:"Thika Town IEBC",county:"Kiambu",constituency:"Thika Town",location:"Thika Town",landmark:"Buffalo Grill Thika"},
  {name:"Ruiru IEBC",county:"Kiambu",constituency:"Ruiru",location:"Ruiru Town",landmark:"Law Courts Ruiru"},
  {name:"Githunguri IEBC",county:"Kiambu",constituency:"Githunguri",location:"Githunguri Town",landmark:"DCC Offices Githunguri"},
  {name:"Kiambu IEBC",county:"Kiambu",constituency:"Kiambu",location:"Kiambu Town",landmark:"National Bank Kiambu"},
  {name:"Kiambaa IEBC",county:"Kiambu",constituency:"Kiambaa",location:"Kiambaa Town",landmark:"DCC Building Kiambaa"},
  {name:"Kabete IEBC",county:"Kiambu",constituency:"Kabete",location:"Wangige Town",landmark:"Wangige Hospital"},
  {name:"Kikuyu IEBC",county:"Kiambu",constituency:"Kikuyu",location:"Kikuyu Town",landmark:"K-Unity Bank Kikuyu"},
  {name:"Limuru IEBC",county:"Kiambu",constituency:"Limuru",location:"Limuru Town",landmark:"Law Courts Limuru"},
  {name:"Lari IEBC",county:"Kiambu",constituency:"Lari",location:"Kimende Town",landmark:"K-Unity Sacco Kimende"},
  {name:"Turkana North IEBC",county:"Turkana",constituency:"Turkana North",location:"Lokitaung Town",landmark:"DCC Office Lokitaung"},
  {name:"Turkana West IEBC",county:"Turkana",constituency:"Turkana West",location:"Kakuma Town",landmark:"Refugees Affairs Kakuma"},
  {name:"Turkana Central IEBC",county:"Turkana",constituency:"Turkana Central",location:"Lodwar Town",landmark:"Huduma Centre Lodwar"},
  {name:"Loima IEBC",county:"Turkana",constituency:"Loima",location:"Lorgum Town",landmark:"DCC Office Lorgum"},
  {name:"Turkana South IEBC",county:"Turkana",constituency:"Turkana South",location:"Lokichar Town",landmark:"DCC Office Lokichar"},
  {name:"Turkana East IEBC",county:"Turkana",constituency:"Turkana East",location:"Lokori Town",landmark:"DCC Office Lokori"},
  {name:"Kapenguria IEBC",county:"West Pokot",constituency:"Kapenguria",location:"Kapenguria Town",landmark:"DCC Offices Kapenguria"},
  {name:"Sigor IEBC",county:"West Pokot",constituency:"Sigor",location:"Sigor Town",landmark:"KVDA Offices Sigor"},
  {name:"Kacheliba IEBC",county:"West Pokot",constituency:"Kacheliba",location:"Kacheliba Town",landmark:"Catholic Church Kacheliba"},
  {name:"Pokot South IEBC",county:"West Pokot",constituency:"Pokot South",location:"Chesongoch Town",landmark:"DCC Offices Chesongoch"},
  {name:"Samburu West IEBC",county:"Samburu",constituency:"Samburu West",location:"Maralal Town",landmark:"County Assembly Maralal"},
  {name:"Samburu North IEBC",county:"Samburu",constituency:"Samburu North",location:"Baragoi Town",landmark:"DCC Office Baragoi"},
  {name:"Samburu East IEBC",county:"Samburu",constituency:"Samburu East",location:"Wamba Town",landmark:"Wamba Parish"},
  {name:"Kwanza IEBC",county:"Trans Nzoia",constituency:"Kwanza",location:"Kitale Town",landmark:"KFA Building Kitale"},
  {name:"Endebess IEBC",county:"Trans Nzoia",constituency:"Endebess",location:"Endebess Town",landmark:"DCC Office Endebess"},
  {name:"Saboti IEBC",county:"Trans Nzoia",constituency:"Saboti",location:"Saboti Town",landmark:"Old Ambwere Plaza Saboti"},
  {name:"Kiminini IEBC",county:"Trans Nzoia",constituency:"Kiminini",location:"Kiminini Town",landmark:"Catholic Church Kiminini"},
  {name:"Cherangany IEBC",county:"Trans Nzoia",constituency:"Cherangany",location:"Cherangany Town",landmark:"DCC Office Cherangany"},
  {name:"Soy IEBC",county:"Uasin Gishu",constituency:"Soy",location:"Turbo Town",landmark:"Sirikwa Hotel Turbo"},
  {name:"Turbo IEBC",county:"Uasin Gishu",constituency:"Turbo",location:"Turbo Town",landmark:"NCCK HQ Turbo"},
  {name:"Moiben IEBC",county:"Uasin Gishu",constituency:"Moiben",location:"Moiben Town",landmark:"Ward Offices Moiben"},
  {name:"Ainabkoi IEBC",county:"Uasin Gishu",constituency:"Ainabkoi",location:"Eldoret East",landmark:"District HQ Ainabkoi"},
  {name:"Kapseret IEBC",county:"Uasin Gishu",constituency:"Kapseret",location:"Eldoret Town",landmark:"Hills School Eldoret"},
  {name:"Kesses IEBC",county:"Uasin Gishu",constituency:"Kesses",location:"Eldoret Town",landmark:"Moi University Eldoret"},
  {name:"Marakwet East IEBC",county:"Elgeyo Marakwet",constituency:"Marakwet East",location:"Chesoi Town",landmark:"DCC Office Chesoi"},
  {name:"Marakwet West IEBC",county:"Elgeyo Marakwet",constituency:"Marakwet West",location:"Kapsowar Town",landmark:"IEBC Office Kapsowar"},
  {name:"Keiyo North IEBC",county:"Elgeyo Marakwet",constituency:"Keiyo North",location:"Iten Town",landmark:"County Governor Office Iten"},
  {name:"Keiyo South IEBC",county:"Elgeyo Marakwet",constituency:"Keiyo South",location:"Chepkorio Town",landmark:"Prime Tower Sacco Chepkorio"},
  {name:"Mosop IEBC",county:"Nandi",constituency:"Mosop",location:"Kabiyet Town",landmark:"District HQ Kabiyet"},
  {name:"Nandi Hills IEBC",county:"Nandi",constituency:"Nandi Hills",location:"Nandi Hills Town",landmark:"Nandi Water Supply"},
  {name:"Emgwen IEBC",county:"Nandi",constituency:"Emgwen",location:"Kapsabet Town",landmark:"ACC Office Kapsabet"},
  {name:"Chesumei IEBC",county:"Nandi",constituency:"Chesumei",location:"Cheptarit Town",landmark:"Catholic Church Cheptarit"},
  {name:"Aldai IEBC",county:"Nandi",constituency:"Aldai",location:"Kobujoi Town",landmark:"Catholic Church Kobujoi"},
  {name:"Tindiret IEBC",county:"Nandi",constituency:"Tindiret",location:"Tindiret Town",landmark:"World Vision Offices Tindiret"},
  {name:"Tiaty IEBC",county:"Baringo",constituency:"Tiaty",location:"Chemolingot Town",landmark:"Ministry Of Education Chemolingot"},
  {name:"Baringo North IEBC",county:"Baringo",constituency:"Baringo North",location:"Nginyang Town",landmark:"Posta Building Nginyang"},
  {name:"Baringo Central IEBC",county:"Baringo",constituency:"Baringo Central",location:"Kabarnet Town",landmark:"County Commissioners Kabarnet"},
  {name:"Baringo South IEBC",county:"Baringo",constituency:"Baringo South",location:"Marigat Town",landmark:"District HQ Marigat"},
  {name:"Mogotio IEBC",county:"Baringo",constituency:"Mogotio",location:"Mogotio Town",landmark:"Boresha Sacco Mogotio"},
  {name:"Eldama Ravine IEBC",county:"Baringo",constituency:"Eldama Ravine",location:"Eldama Ravine Town",landmark:"Law Courts Eldama Ravine"},
  {name:"Laikipia West IEBC",county:"Laikipia",constituency:"Laikipia West",location:"Nyahururu Town",landmark:"Law Courts Nyahururu"},
  {name:"Laikipia East IEBC",county:"Laikipia",constituency:"Laikipia East",location:"Nanyuki Town",landmark:"Commissioners Office Nanyuki"},
  {name:"Laikipia North IEBC",county:"Laikipia",constituency:"Laikipia North",location:"Doldol Town",landmark:"Catholic Church Doldol"},
  {name:"Laikipia County IEBC",county:"Laikipia",constituency:"County Office",location:"Nanyuki Town",landmark:"Commissioners Office Nanyuki"},
  {name:"Nakuru Town East IEBC",county:"Nakuru",constituency:"Nakuru Town East",location:"Nakuru Town",landmark:"Mercy Mission Hospital Nakuru"},
  {name:"Nakuru Town West IEBC",county:"Nakuru",constituency:"Nakuru Town West",location:"Nakuru Town",landmark:"KFA Roundabout Nakuru"},
  {name:"Molo IEBC",county:"Nakuru",constituency:"Molo",location:"Molo Town",landmark:"DC's Office Molo"},
  {name:"Njoro IEBC",county:"Nakuru",constituency:"Njoro",location:"Njoro Town",landmark:"AIC Church Njoro"},
  {name:"Naivasha IEBC",county:"Nakuru",constituency:"Naivasha",location:"Naivasha Town",landmark:"Police Station Naivasha"},
  {name:"Gilgil IEBC",county:"Nakuru",constituency:"Gilgil",location:"Gilgil Town",landmark:"KPLC Gilgil"},
  {name:"Kuresoi South IEBC",county:"Nakuru",constituency:"Kuresoi South",location:"Keringet Town",landmark:"Keringet Center"},
  {name:"Kuresoi North IEBC",county:"Nakuru",constituency:"Kuresoi North",location:"Olenguruone Town",landmark:"Sub County Offices Olenguruone"},
  {name:"Subukia IEBC",county:"Nakuru",constituency:"Subukia",location:"Subukia Town",landmark:"Subukia Nakuru highway"},
  {name:"Rongai IEBC",county:"Nakuru",constituency:"Rongai",location:"Rongai Town",landmark:"Trading Center Rongai"},
  {name:"Bahati IEBC",county:"Nakuru",constituency:"Bahati",location:"Bahati Town",landmark:"DC's Office Bahati"},
  {name:"Kilgoris IEBC",county:"Narok",constituency:"Kilgoris",location:"Kilgoris Town",landmark:"Cooperative Bank Kilgoris"},
  {name:"Emurua Dikkir IEBC",county:"Narok",constituency:"Emurua Dikkir",location:"Emurua Dikkir Town",landmark:"Sub County Offices Emurua Dikkir"},
  {name:"Narok North IEBC",county:"Narok",constituency:"Narok North",location:"Narok Town",landmark:"County Commissioner Narok"},
  {name:"Narok East IEBC",county:"Narok",constituency:"Narok East",location:"Ntulele Town",landmark:"Police Station Ntulele"},
  {name:"Narok South IEBC",county:"Narok",constituency:"Narok South",location:"Ololulunga Town",landmark:"Police Station Ololulunga"},
  {name:"Narok West IEBC",county:"Narok",constituency:"Narok West",location:"Ngoswani Town",landmark:"Solar Powerpoint Ngoswani"},
  {name:"Kajiado North IEBC",county:"Kajiado",constituency:"Kajiado North",location:"Ngong Town",landmark:"DCC Office Ngong"},
  {name:"Kajiado Central IEBC",county:"Kajiado",constituency:"Kajiado Central",location:"Kajiado Town",landmark:"Total Petrol Station Kajiado"},
  {name:"Kajiado East IEBC",county:"Kajiado",constituency:"Kajiado East",location:"Isinya Town",landmark:"Moi Girls High School Isinya"},
  {name:"Kajiado West IEBC",county:"Kajiado",constituency:"Kajiado West",location:"Iloodokilani Town",landmark:"Catholic Church Iloodokilani"},
  {name:"Kajiado South IEBC",county:"Kajiado",constituency:"Kajiado South",location:"Loitokitok Town",landmark:"DCC Office Loitokitok"},
  {name:"Ainamoi IEBC",county:"Kericho",constituency:"Ainamoi",location:"Kericho Town",landmark:"Administration Police Kericho"},
  {name:"Bureti IEBC",county:"Kericho",constituency:"Bureti",location:"Litein Town",landmark:"Patnas Plaza Litein"},
  {name:"Belgut IEBC",county:"Kericho",constituency:"Belgut",location:"Kericho Town",landmark:"DCC Office Belgut"},
  {name:"Sigowet Soin IEBC",county:"Kericho",constituency:"Sigowet Soin",location:"Soin Town",landmark:"Police Post Soin"},
  {name:"Kipkelion East IEBC",county:"Kericho",constituency:"Kipkelion East",location:"Londiani Town",landmark:"Post Office Londiani"},
  {name:"Kipkelion West IEBC",county:"Kericho",constituency:"Kipkelion West",location:"Kipkelion Town",landmark:"Post Office Kipkelion"},
  {name:"Chepalungu IEBC",county:"Bomet",constituency:"Chepalungu",location:"Sigor Town Bomet",landmark:"Junction to Sigor Bomet"},
  {name:"Bomet Central IEBC",county:"Bomet",constituency:"Bomet Central",location:"Bomet Town",landmark:"NCPB Bomet"},
  {name:"Konoin IEBC",county:"Bomet",constituency:"Konoin",location:"Mogogosiek Town",landmark:"DCC Office Mogogosiek"},
  {name:"Bomet East IEBC",county:"Bomet",constituency:"Bomet East",location:"Bomet Town",landmark:"Shell Petrol Station Bomet"},
  {name:"Sotik IEBC",county:"Bomet",constituency:"Sotik",location:"Sotik Town",landmark:"CDF Office Sotik"},
  {name:"Lugari IEBC",county:"Kakamega",constituency:"Lugari",location:"Lumakanda Town",landmark:"PAG Church Lumakanda"},
  {name:"Likuyani IEBC",county:"Kakamega",constituency:"Likuyani",location:"Likuyani Town",landmark:"Subcounty Offices Likuyani"},
  {name:"Malava IEBC",county:"Kakamega",constituency:"Malava",location:"Malava Town",landmark:"Boys High School Malava"},
  {name:"Lurambi IEBC",county:"Kakamega",constituency:"Lurambi",location:"Kakamega Town",landmark:"Huduma Center Kakamega"},
  {name:"Navakholo IEBC",county:"Kakamega",constituency:"Navakholo",location:"Navakholo Town",landmark:"Filling Station Navakholo"},
  {name:"Mumias West IEBC",county:"Kakamega",constituency:"Mumias West",location:"Mumias Town",landmark:"ACK Church Complex Mumias"},
  {name:"Mumias East IEBC",county:"Kakamega",constituency:"Mumias East",location:"Mumias Town",landmark:"Catholic Church Mumias"},
  {name:"Matungu IEBC",county:"Kakamega",constituency:"Matungu",location:"Matungu Town",landmark:"Deputy Commissioner Matungu"},
  {name:"Butere IEBC",county:"Kakamega",constituency:"Butere",location:"Butere Town",landmark:"Deputy Commissioner Butere"},
  {name:"Khwisero IEBC",county:"Kakamega",constituency:"Khwisero",location:"Khwisero Town",landmark:"DCC Office Khwisero"},
  {name:"Shinyalu IEBC",county:"Kakamega",constituency:"Shinyalu",location:"Shinyalu Town",landmark:"Teachers College Shinyalu"},
  {name:"Ikolomani IEBC",county:"Kakamega",constituency:"Ikolomani",location:"Ikolomani Town",landmark:"Malinya Primary Ikolomani"},
  {name:"Vihiga IEBC",county:"Vihiga",constituency:"Vihiga",location:"Vihiga Town",landmark:"Vihiga High School"},
  {name:"Sabatia IEBC",county:"Vihiga",constituency:"Sabatia",location:"Sabatia Town",landmark:"Eye Hospital Sabatia"},
  {name:"Hamisi IEBC",county:"Vihiga",constituency:"Hamisi",location:"Hamisi Town",landmark:"Hospital Hamisi"},
  {name:"Luanda IEBC",county:"Vihiga",constituency:"Luanda",location:"Luanda Town",landmark:"Bunyore Girls High Luanda"},
  {name:"Emuhaya IEBC",county:"Vihiga",constituency:"Emuhaya",location:"Emuhaya Town",landmark:"Medical Hospital Emuhaya"},
  {name:"Mt. Elgon IEBC",county:"Bungoma",constituency:"Mt. Elgon",location:"Kapsokwony Town",landmark:"Koony House Kapsokwony"},
  {name:"Sirisia IEBC",county:"Bungoma",constituency:"Sirisia",location:"Sirisia Town",landmark:"DCC Office Sirisia"},
  {name:"Kabuchai IEBC",county:"Bungoma",constituency:"Kabuchai",location:"Chwele Town",landmark:"Chwele Road Bungoma"},
  {name:"Bumula IEBC",county:"Bungoma",constituency:"Bumula",location:"Bumula Town",landmark:"DCC Compound Bumula"},
  {name:"Kanduyi IEBC",county:"Bungoma",constituency:"Kanduyi",location:"Bungoma Town",landmark:"Silos Bungoma"},
  {name:"Webuye East IEBC",county:"Bungoma",constituency:"Webuye East",location:"Webuye Town",landmark:"DCC Compound Webuye"},
  {name:"Webuye West IEBC",county:"Bungoma",constituency:"Webuye West",location:"Webuye Town",landmark:"Highway Webuye"},
  {name:"Kimilili IEBC",county:"Bungoma",constituency:"Kimilili",location:"Kimilili Town",landmark:"Kimilili Primary"},
  {name:"Tongaren IEBC",county:"Bungoma",constituency:"Tongaren",location:"Tongaren Town",landmark:"CDF Offices Tongaren"},
  {name:"Teso North IEBC",county:"Busia",constituency:"Teso North",location:"Amagoro Town",landmark:"Law Courts Amagoro"},
  {name:"Teso South IEBC",county:"Busia",constituency:"Teso South",location:"Busia Town",landmark:"DCC Building Busia"},
  {name:"Nambale IEBC",county:"Busia",constituency:"Nambale",location:"Nambale Town",landmark:"DCC Building Nambale"},
  {name:"Matayos IEBC",county:"Busia",constituency:"Matayos",location:"Matayos Town",landmark:"Assistant Commissioner Matayos"},
  {name:"Butula IEBC",county:"Busia",constituency:"Butula",location:"Butula Town",landmark:"Police Station Butula"},
  {name:"Funyula IEBC",county:"Busia",constituency:"Funyula",location:"Funyula Town",landmark:"Moody Awori Primary Funyula"},
  {name:"Budalangi IEBC",county:"Busia",constituency:"Budalangi",location:"Budalangi Town",landmark:"Primary School Budalangi"},
  {name:"Ugenya IEBC",county:"Siaya",constituency:"Ugenya",location:"Ukwala Town",landmark:"Posta Ukwala"},
  {name:"Ugunja IEBC",county:"Siaya",constituency:"Ugunja",location:"Ugunja Town",landmark:"Savana Hotel Ugunja"},
  {name:"Alego Usonga IEBC",county:"Siaya",constituency:"Alego Usonga",location:"Siaya Town",landmark:"Commissioner Office Siaya"},
  {name:"Gem IEBC",county:"Siaya",constituency:"Gem",location:"Yala Town",landmark:"Sawagongo High School Yala"},
  {name:"Bondo IEBC",county:"Siaya",constituency:"Bondo",location:"Bondo Town",landmark:"Law Courts Bondo"},
  {name:"Rarieda IEBC",county:"Siaya",constituency:"Rarieda",location:"Kalandini Town",landmark:"Kalandini Market"},
  {name:"Nyando IEBC",county:"Kisumu",constituency:"Nyando",location:"Awasi Town",landmark:"DCC Compound Awasi"},
  {name:"Muhoroni IEBC",county:"Kisumu",constituency:"Muhoroni",location:"Muhoroni Town",landmark:"Pawtenge Primary Muhoroni"},
  {name:"Nyakach IEBC",county:"Kisumu",constituency:"Nyakach",location:"Pap Onditi Town",landmark:"DCC Compound Pap Onditi"},
  {name:"Seme IEBC",county:"Kisumu",constituency:"Seme",location:"Kombewa Town",landmark:"DCC Compound Kombewa"},
  {name:"Kisumu West IEBC",county:"Kisumu",constituency:"Kisumu West",location:"Kisumu Town",landmark:"Huduma Centre Kisumu"},
  {name:"Kisumu East IEBC",county:"Kisumu",constituency:"Kisumu East",location:"Kisumu Town",landmark:"Mamboleo Show Ground Kisumu"},
  {name:"Kisumu Central IEBC",county:"Kisumu",constituency:"Kisumu Central",location:"Kisumu Town",landmark:"Huduma Centre Kisumu Central"},
  {name:"Kasipul IEBC",county:"Homa Bay",constituency:"Kasipul",location:"Kosele Town",landmark:"DCC Compound Kosele"},
  {name:"Kabondo Kasipul IEBC",county:"Homa Bay",constituency:"Kabondo Kasipul",location:"Kadongo Town",landmark:"Kisii Road Kadongo"},
  {name:"Karachuonyo IEBC",county:"Homa Bay",constituency:"Karachuonyo",location:"Kendu Bay Town",landmark:"DCC Complex Kendu Bay"},
  {name:"Rangwe IEBC",county:"Homa Bay",constituency:"Rangwe",location:"Rangwe Town",landmark:"DCC Complex Rangwe"},
  {name:"Homa Bay Town IEBC",county:"Homa Bay",constituency:"Homa Bay Town",location:"Homa Bay Town",landmark:"CC Complex Homa Bay"},
  {name:"Ndhiwa IEBC",county:"Homa Bay",constituency:"Ndhiwa",location:"Ndhiwa Town",landmark:"DCC Complex Ndhiwa"},
  {name:"Suba North IEBC",county:"Homa Bay",constituency:"Suba North",location:"Mbita Town",landmark:"Subcounty Compound Mbita"},
  {name:"Suba South IEBC",county:"Homa Bay",constituency:"Suba South",location:"Magunga Town",landmark:"Trading Centre Magunga"},
  {name:"Rongo IEBC",county:"Migori",constituency:"Rongo",location:"Rongo Town",landmark:"DCC Office Rongo"},
  {name:"Awendo IEBC",county:"Migori",constituency:"Awendo",location:"Awendo Town",landmark:"NCPB Awendo"},
  {name:"Suna East IEBC",county:"Migori",constituency:"Suna East",location:"Migori Town",landmark:"County IEBC Office Migori"},
  {name:"Suna West IEBC",county:"Migori",constituency:"Suna West",location:"Migori Town",landmark:"NCPB Migori"},
  {name:"Uriri IEBC",county:"Migori",constituency:"Uriri",location:"Uriri Town",landmark:"DCC Office Uriri"},
  {name:"Nyatike IEBC",county:"Migori",constituency:"Nyatike",location:"Macalder Town",landmark:"County Government Macalder"},
  {name:"Kuria West IEBC",county:"Migori",constituency:"Kuria West",location:"Kehancha Town",landmark:"Law Courts Kehancha"},
  {name:"Kuria East IEBC",county:"Migori",constituency:"Kuria East",location:"Kegonga Town",landmark:"DCC Office Kegonga"},
  {name:"Bonchari IEBC",county:"Kisii",constituency:"Bonchari",location:"Suneka Town",landmark:"Itierio Boys High Suneka"},
  {name:"South Mugirango IEBC",county:"Kisii",constituency:"South Mugirango",location:"Nyamarambe Town",landmark:"DCC Office Nyamarambe"},
  {name:"Bomachoge Borabu IEBC",county:"Kisii",constituency:"Bomachoge Borabu",location:"Kenyanya Town",landmark:"DCC Office Kenyanya"},
  {name:"Bobasi IEBC",county:"Kisii",constituency:"Bobasi",location:"Itumbe Town",landmark:"DCC Office Itumbe"},
  {name:"Bomachoge Chache IEBC",county:"Kisii",constituency:"Bomachoge Chache",location:"Ogembo Town",landmark:"DCC Office Ogembo"},
  {name:"Nyaribari Masaba IEBC",county:"Kisii",constituency:"Nyaribari Masaba",location:"Masimba Town",landmark:"DCC Office Masimba"},
  {name:"Nyaribari Chache IEBC",county:"Kisii",constituency:"Nyaribari Chache",location:"Kisii Town",landmark:"Commissioner Office Kisii"},
  {name:"Kitutu Chache North IEBC",county:"Kisii",constituency:"Kitutu Chache North",location:"Marani Town",landmark:"Subcounty Office Marani"},
  {name:"Kitutu Chache South IEBC",county:"Kisii",constituency:"Kitutu Chache South",location:"Kisii Town",landmark:"Commissioner Office Kisii South"},
  {name:"Kitutu Masaba IEBC",county:"Nyamira",constituency:"Kitutu Masaba",location:"Manga Town",landmark:"Manga Cliff"},
  {name:"West Mugirango IEBC",county:"Nyamira",constituency:"West Mugirango",location:"Nyamira Town",landmark:"Law Courts Nyamira"},
  {name:"North Mugirango IEBC",county:"Nyamira",constituency:"North Mugirango",location:"Ekerenyo Town",landmark:"Bus Stage Ekerenyo"},
  {name:"Borabu IEBC",county:"Nyamira",constituency:"Borabu",location:"Borabu Town",landmark:"DCC Office Borabu"},
  {name:"Westlands IEBC",county:"Nairobi",constituency:"Westlands",location:"Westlands Nairobi",landmark:"Safaricom Centre Westlands"},
  {name:"Dagoretti North IEBC",county:"Nairobi",constituency:"Dagoretti North",location:"Dagoretti North Nairobi",landmark:"Nakumatt Junction Dagoretti"},
  {name:"Dagoretti South IEBC",county:"Nairobi",constituency:"Dagoretti South",location:"Dagoretti South Nairobi",landmark:"DCC Office Dagoretti South"},
  {name:"Langata IEBC",county:"Nairobi",constituency:"Langata",location:"Langata Nairobi",landmark:"Langata Subcounty HQ"},
  {name:"Kibra IEBC",county:"Nairobi",constituency:"Kibra",location:"Kibra Nairobi",landmark:"Huduma Centre Kibra"},
  {name:"Roysambu IEBC",county:"Nairobi",constituency:"Roysambu",location:"Kahawa West Nairobi",landmark:"ACC Office Kahawa West"},
  {name:"Kasarani IEBC",county:"Nairobi",constituency:"Kasarani",location:"Kasarani Nairobi",landmark:"Chiefs Office Kasarani"},
  {name:"Ruaraka IEBC",county:"Nairobi",constituency:"Ruaraka",location:"Ruaraka Nairobi",landmark:"Lexx Place Hotel Ruaraka"},
  {name:"Embakasi South IEBC",county:"Nairobi",constituency:"Embakasi South",location:"Embakasi South Nairobi",landmark:"Equity Afya Hospital Embakasi"},
  {name:"Embakasi North IEBC",county:"Nairobi",constituency:"Embakasi North",location:"Embakasi North Nairobi",landmark:"DCC Office Embakasi North"},
  {name:"Embakasi Central IEBC",county:"Nairobi",constituency:"Embakasi Central",location:"Kayole Nairobi",landmark:"DO Office Kayole"},
  {name:"Embakasi East IEBC",county:"Nairobi",constituency:"Embakasi East",location:"Embakasi East Nairobi",landmark:"EASA Aviation School Nairobi"},
  {name:"Embakasi West IEBC",county:"Nairobi",constituency:"Embakasi West",location:"Tena Nairobi",landmark:"Shell Petrol Tena"},
  {name:"Makadara IEBC",county:"Nairobi",constituency:"Makadara",location:"Makadara Nairobi",landmark:"CIPU Office Makadara"},
  {name:"Kamukunji IEBC",county:"Nairobi",constituency:"Kamukunji",location:"Kamukunji Nairobi",landmark:"DCC Office Kamukunji"},
  {name:"Starehe IEBC",county:"Nairobi",constituency:"Starehe",location:"Starehe Nairobi",landmark:"Kenya Railways Nairobi"},
  {name:"Mathare IEBC",county:"Nairobi",constituency:"Mathare",location:"Mathare Nairobi",landmark:"DCC Office Mathare"},
];

async function geocode(center) {
  const query = `${center.landmark}, ${center.county}, Kenya`;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}`;

  try {
    const res = await axios.get(url);
    if (res.data.results && res.data.results.length > 0) {
      const { lat, lng } = res.data.results[0].geometry.location;
      console.log(`✅ ${center.name}: ${lat}, ${lng}`);
      return { lat, lng };
    } else {
      return await geocodeFallback(center);
    }
  } catch (err) {
    console.error(`❌ Error for ${center.name}:`, err.message);
    return null;
  }
}

async function geocodeFallback(center) {
  const query = `${center.constituency}, ${center.county}, Kenya`;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}`;

  try {
    const res = await axios.get(url);

    console.log('Google status', res.data.status, res.data.error_message || '');

    if (res.data.results && res.data.results.length > 0) {
      const { lat, lng } = res.data.results[0].geometry.location;
      console.log(`  ↳ Fallback OK for ${center.name}: ${lat}, ${lng}`);
      return { lat, lng };
    } else {
      console.warn(`  ⚠️  No result at all for ${center.name}`);
      return null;
    }
  } catch (err) {
    console.error(`  ❌ Fallback error for ${center.name}:`, err.message);
    return null;
  }
}

async function run() {
  console.log(`Starting geocoding for ${ALL_IEBC_CENTERS.length} centers...\n`);
  const results = [];
  const failed = [];

  for (let i = 0; i < ALL_IEBC_CENTERS.length; i++) {
    const center = ALL_IEBC_CENTERS[i];
    process.stdout.write(`[${i + 1}/${ALL_IEBC_CENTERS.length}] ${center.name}... `);

    const coords = await geocode(center);

    if (coords) {
      results.push({ ...center, coordinates: coords });
    } else {
      failed.push(center.name);
      results.push({ ...center, coordinates: { lat: null, lng: null } });
    }

    // Google allows faster requests than Nominatim
    await new Promise(r => setTimeout(r, 100));
  }

  // Overwrites centers_geocoded.json with fresh Google coordinates
  fs.writeFileSync('centers_geocoded.json', JSON.stringify(results, null, 2));
  console.log('\n\n✅ Done! Saved to centers_geocoded.json');
  console.log(`   Total   : ${results.length}`);
  console.log(`   Success : ${results.length - failed.length}`);
  console.log(`   Failed  : ${failed.length}`);

  if (failed.length > 0) {
    console.log('\n⚠️  These centers need manual coordinates:');
    failed.forEach(name => console.log(`   - ${name}`));
    fs.writeFileSync('failed_centers.txt', failed.join('\n'));
    console.log('   (also saved to failed_centers.txt)');
  }
}

run();