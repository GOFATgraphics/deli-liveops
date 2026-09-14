export type PlaceKind = "corridor" | "quarter" | "street" | "landmark" | "junction";

export type KanoPlace = {
  name: string;
  aliases: string[];
  area: string;
  lat: number;
  lng: number;
  kind: PlaceKind;
};

/** Named streets, quarters, junctions, and landmarks across Kano. */
export const KANO_PLACES: KanoPlace[] = [
  {
    "name": "Zoo Road",
    "aliases": [
      "zoo road"
    ],
    "area": "Tarauni",
    "lat": 11.9707,
    "lng": 8.5324,
    "kind": "corridor"
  },
  {
    "name": "Murtala Mohammed Way",
    "aliases": [
      "murtala mohammed way",
      "murtala way"
    ],
    "area": "Fagge",
    "lat": 12.008,
    "lng": 8.533,
    "kind": "corridor"
  },
  {
    "name": "Ibrahim Taiwo Road",
    "aliases": [
      "ibrahim taiwo",
      "taiwo road"
    ],
    "area": "Municipal",
    "lat": 11.998,
    "lng": 8.528,
    "kind": "corridor"
  },
  {
    "name": "Zaria Road",
    "aliases": [
      "zaria road"
    ],
    "area": "Tarauni",
    "lat": 11.97,
    "lng": 8.54,
    "kind": "corridor"
  },
  {
    "name": "Katsina Road",
    "aliases": [
      "katsina road"
    ],
    "area": "Dala",
    "lat": 12.03,
    "lng": 8.515,
    "kind": "corridor"
  },
  {
    "name": "Gwarzo Road",
    "aliases": [
      "gwarzo road",
      "buk road"
    ],
    "area": "Gwale",
    "lat": 11.99,
    "lng": 8.45,
    "kind": "corridor"
  },
  {
    "name": "Maiduguri Road",
    "aliases": [
      "maiduguri road"
    ],
    "area": "Nassarawa",
    "lat": 11.992,
    "lng": 8.575,
    "kind": "corridor"
  },
  {
    "name": "Hadejia Road",
    "aliases": [
      "hadejia road"
    ],
    "area": "Nassarawa",
    "lat": 12.01,
    "lng": 8.56,
    "kind": "corridor"
  },
  {
    "name": "Airport Road",
    "aliases": [
      "airport road"
    ],
    "area": "Fagge",
    "lat": 12.03,
    "lng": 8.528,
    "kind": "corridor"
  },
  {
    "name": "Aminu Kano Way",
    "aliases": [
      "aminu kano way"
    ],
    "area": "Municipal",
    "lat": 12,
    "lng": 8.525,
    "kind": "corridor"
  },
  {
    "name": "Audu Bako Way",
    "aliases": [
      "audu bako way"
    ],
    "area": "Fagge",
    "lat": 12.004,
    "lng": 8.53,
    "kind": "corridor"
  },
  {
    "name": "Sani Abacha Way",
    "aliases": [
      "sani abacha way"
    ],
    "area": "Municipal",
    "lat": 11.998,
    "lng": 8.522,
    "kind": "corridor"
  },
  {
    "name": "IBB Way",
    "aliases": [
      "ibb way"
    ],
    "area": "Nassarawa",
    "lat": 11.995,
    "lng": 8.535,
    "kind": "corridor"
  },
  {
    "name": "Obasanjo Road",
    "aliases": [
      "obasanjo road"
    ],
    "area": "Nassarawa",
    "lat": 11.99,
    "lng": 8.538,
    "kind": "corridor"
  },
  {
    "name": "Ahmadu Bello Way",
    "aliases": [
      "ahmadu bello way"
    ],
    "area": "Nassarawa GRA",
    "lat": 12,
    "lng": 8.55,
    "kind": "corridor"
  },
  {
    "name": "Lodge Road",
    "aliases": [
      "lodge road"
    ],
    "area": "Nassarawa GRA",
    "lat": 11.997,
    "lng": 8.558,
    "kind": "corridor"
  },
  {
    "name": "Bompai Road",
    "aliases": [
      "bompai road"
    ],
    "area": "Bompai",
    "lat": 12.0055,
    "lng": 8.5469,
    "kind": "corridor"
  },
  {
    "name": "Club Road",
    "aliases": [
      "club road"
    ],
    "area": "Bompai",
    "lat": 12.017,
    "lng": 8.548,
    "kind": "corridor"
  },
  {
    "name": "Yahaya Gusau Road",
    "aliases": [
      "yahaya gusau"
    ],
    "area": "Gwale",
    "lat": 11.988,
    "lng": 8.495,
    "kind": "corridor"
  },
  {
    "name": "Sharada–Panshekara Road",
    "aliases": [
      "sharada panshekara",
      "panshekara road"
    ],
    "area": "Sharada",
    "lat": 11.955,
    "lng": 8.485,
    "kind": "corridor"
  },
  {
    "name": "Hospital Road",
    "aliases": [
      "hospital road"
    ],
    "area": "Dala",
    "lat": 12.008,
    "lng": 8.512,
    "kind": "corridor"
  },
  {
    "name": "France Road",
    "aliases": [
      "france road"
    ],
    "area": "Sabon Gari",
    "lat": 12.0145,
    "lng": 8.5436,
    "kind": "corridor"
  },
  {
    "name": "Ashton Road",
    "aliases": [
      "ashton road"
    ],
    "area": "Airport belt",
    "lat": 12.028,
    "lng": 8.525,
    "kind": "corridor"
  },
  {
    "name": "Zungeru Road",
    "aliases": [
      "zungeru road"
    ],
    "area": "Municipal",
    "lat": 11.994,
    "lng": 8.528,
    "kind": "corridor"
  },
  {
    "name": "Sokoto Road",
    "aliases": [
      "sokoto road"
    ],
    "area": "Municipal",
    "lat": 11.99,
    "lng": 8.526,
    "kind": "corridor"
  },
  {
    "name": "BUK Road",
    "aliases": [
      "buk road"
    ],
    "area": "Gwale",
    "lat": 11.978,
    "lng": 8.44,
    "kind": "corridor"
  },
  {
    "name": "Gandun Albasa",
    "aliases": [
      "gandu",
      "gandu albasa",
      "gandun albasa"
    ],
    "area": "Kano Municipal",
    "lat": 11.972,
    "lng": 8.53,
    "kind": "quarter"
  },
  {
    "name": "Zoo Road Estate",
    "aliases": [
      "zoo road estate"
    ],
    "area": "Tarauni",
    "lat": 11.968,
    "lng": 8.536,
    "kind": "quarter"
  },
  {
    "name": "Ado Bayero Mall",
    "aliases": [
      "ado bayero",
      "shoprite",
      "shoprite kano"
    ],
    "area": "Gandu",
    "lat": 11.9773,
    "lng": 8.5345,
    "kind": "landmark"
  },
  {
    "name": "Sahad Stores",
    "aliases": [
      "sahad"
    ],
    "area": "Zoo Road",
    "lat": 11.975,
    "lng": 8.536,
    "kind": "landmark"
  },
  {
    "name": "Alhamsad Towers",
    "aliases": [
      "alhamsad"
    ],
    "area": "Zoo Road",
    "lat": 11.974,
    "lng": 8.535,
    "kind": "landmark"
  },
  {
    "name": "Sufi Mart",
    "aliases": [
      "sufi mart"
    ],
    "area": "Zoo Road",
    "lat": 11.973,
    "lng": 8.533,
    "kind": "landmark"
  },
  {
    "name": "Gidan Buhari",
    "aliases": [
      "gidan buhari"
    ],
    "area": "Zoo Road",
    "lat": 11.971,
    "lng": 8.531,
    "kind": "landmark"
  },
  {
    "name": "Gyadi-Gyadi",
    "aliases": [
      "gyadi",
      "gyadi gyadi"
    ],
    "area": "Tarauni",
    "lat": 11.978,
    "lng": 8.535,
    "kind": "quarter"
  },
  {
    "name": "Karkasara",
    "aliases": [
      "karkasara"
    ],
    "area": "Tarauni",
    "lat": 11.965,
    "lng": 8.528,
    "kind": "quarter"
  },
  {
    "name": "Farm Centre",
    "aliases": [
      "farm center",
      "farm centre"
    ],
    "area": "Tarauni",
    "lat": 11.985,
    "lng": 8.548,
    "kind": "quarter"
  },
  {
    "name": "Kano Zoological Garden",
    "aliases": [
      "kano zoo",
      "zoo"
    ],
    "area": "Tarauni",
    "lat": 11.9674,
    "lng": 8.5261,
    "kind": "landmark"
  },
  {
    "name": "Singer",
    "aliases": [
      "singer junction",
      "singer"
    ],
    "area": "Fagge",
    "lat": 12.006,
    "lng": 8.534,
    "kind": "junction"
  },
  {
    "name": "Kofar Nasarawa Bridge",
    "aliases": [
      "kofar nasarawa bridge",
      "kofar nassarawa"
    ],
    "area": "Municipal",
    "lat": 11.993,
    "lng": 8.53,
    "kind": "junction"
  },
  {
    "name": "Masallacin Waje",
    "aliases": [
      "masallacin waje",
      "waje roundabout"
    ],
    "area": "Fagge",
    "lat": 12.005,
    "lng": 8.532,
    "kind": "junction"
  },
  {
    "name": "Kantin Kwari",
    "aliases": [
      "kwari",
      "kantin kwari",
      "kwari market",
      "textile market"
    ],
    "area": "Fagge",
    "lat": 12.0018,
    "lng": 8.5312,
    "kind": "landmark"
  },
  {
    "name": "Sabon Gari",
    "aliases": [
      "sabon gari",
      "sabongari"
    ],
    "area": "Fagge",
    "lat": 12.0185,
    "lng": 8.5382,
    "kind": "quarter"
  },
  {
    "name": "Sabon Gari Market",
    "aliases": [
      "sabon gari market",
      "abubakar rimi market"
    ],
    "area": "Fagge",
    "lat": 12.0168,
    "lng": 8.5364,
    "kind": "landmark"
  },
  {
    "name": "Sabon Gari East",
    "aliases": [
      "sabon gari east"
    ],
    "area": "Fagge",
    "lat": 12.0185,
    "lng": 8.542,
    "kind": "quarter"
  },
  {
    "name": "Sabon Gari West",
    "aliases": [
      "sabon gari west"
    ],
    "area": "Fagge",
    "lat": 12.0225,
    "lng": 8.5307,
    "kind": "quarter"
  },
  {
    "name": "Fagge",
    "aliases": [
      "fagge"
    ],
    "area": "Fagge",
    "lat": 12.008,
    "lng": 8.535,
    "kind": "quarter"
  },
  {
    "name": "Fagge A",
    "aliases": [
      "fagge a"
    ],
    "area": "Fagge",
    "lat": 12.01,
    "lng": 8.534,
    "kind": "quarter"
  },
  {
    "name": "Fagge B",
    "aliases": [
      "fagge b"
    ],
    "area": "Fagge",
    "lat": 12.009,
    "lng": 8.536,
    "kind": "quarter"
  },
  {
    "name": "Fagge C",
    "aliases": [
      "fagge c"
    ],
    "area": "Fagge",
    "lat": 12.007,
    "lng": 8.537,
    "kind": "quarter"
  },
  {
    "name": "Fagge D",
    "aliases": [
      "fagge d"
    ],
    "area": "Fagge",
    "lat": 12.006,
    "lng": 8.533,
    "kind": "quarter"
  },
  {
    "name": "Fagge E",
    "aliases": [
      "fagge e"
    ],
    "area": "Fagge",
    "lat": 12.011,
    "lng": 8.537,
    "kind": "quarter"
  },
  {
    "name": "Fagge Takudu",
    "aliases": [
      "fagge takudu"
    ],
    "area": "Fagge",
    "lat": 12.012,
    "lng": 8.529,
    "kind": "quarter"
  },
  {
    "name": "Kwachiri",
    "aliases": [
      "kwachiri"
    ],
    "area": "Fagge",
    "lat": 12.02,
    "lng": 8.525,
    "kind": "quarter"
  },
  {
    "name": "Rijiyar Lemo",
    "aliases": [
      "rijiyar lemo"
    ],
    "area": "Fagge",
    "lat": 12.015,
    "lng": 8.528,
    "kind": "quarter"
  },
  {
    "name": "Yammata",
    "aliases": [
      "yammata"
    ],
    "area": "Fagge",
    "lat": 12.016,
    "lng": 8.522,
    "kind": "quarter"
  },
  {
    "name": "Brigade",
    "aliases": [
      "brigade"
    ],
    "area": "Fagge",
    "lat": 12.02,
    "lng": 8.545,
    "kind": "quarter"
  },
  {
    "name": "Gama",
    "aliases": [
      "gama"
    ],
    "area": "Nassarawa",
    "lat": 12.025,
    "lng": 8.55,
    "kind": "quarter"
  },
  {
    "name": "Abba Gana Street",
    "aliases": [
      "abba gana"
    ],
    "area": "Fagge",
    "lat": 12.01,
    "lng": 8.536,
    "kind": "street"
  },
  {
    "name": "Ado Bayero Road",
    "aliases": [
      "ado bayero road"
    ],
    "area": "Fagge",
    "lat": 12.007,
    "lng": 8.532,
    "kind": "street"
  },
  {
    "name": "Bank Road",
    "aliases": [
      "bank road"
    ],
    "area": "Fagge",
    "lat": 12.009,
    "lng": 8.534,
    "kind": "street"
  },
  {
    "name": "Bata Road",
    "aliases": [
      "bata"
    ],
    "area": "Fagge",
    "lat": 12.008,
    "lng": 8.531,
    "kind": "street"
  },
  {
    "name": "Beirut Road",
    "aliases": [
      "beirut"
    ],
    "area": "Sabon Gari",
    "lat": 12.016,
    "lng": 8.54,
    "kind": "street"
  },
  {
    "name": "Bello Dandago Road",
    "aliases": [
      "bello dandago"
    ],
    "area": "Fagge",
    "lat": 12.006,
    "lng": 8.529,
    "kind": "street"
  },
  {
    "name": "Civil Road",
    "aliases": [
      "civil road"
    ],
    "area": "Fagge",
    "lat": 12.01,
    "lng": 8.532,
    "kind": "street"
  },
  {
    "name": "Dandali",
    "aliases": [
      "dandali"
    ],
    "area": "Fagge",
    "lat": 12.004,
    "lng": 8.531,
    "kind": "street"
  },
  {
    "name": "Faith Road",
    "aliases": [
      "faith road"
    ],
    "area": "Sabon Gari",
    "lat": 12.015,
    "lng": 8.539,
    "kind": "street"
  },
  {
    "name": "Aba Avenue",
    "aliases": [
      "aba avenue"
    ],
    "area": "Sabon Gari",
    "lat": 12.017,
    "lng": 8.54,
    "kind": "street"
  },
  {
    "name": "Abeokuta Avenue",
    "aliases": [
      "abeokuta avenue"
    ],
    "area": "Sabon Gari",
    "lat": 12.016,
    "lng": 8.541,
    "kind": "street"
  },
  {
    "name": "Abuja Road",
    "aliases": [
      "abuja road"
    ],
    "area": "Sabon Gari",
    "lat": 12.019,
    "lng": 8.539,
    "kind": "street"
  },
  {
    "name": "Akure Street",
    "aliases": [
      "akure street"
    ],
    "area": "Sabon Gari",
    "lat": 12.015,
    "lng": 8.542,
    "kind": "street"
  },
  {
    "name": "Awolowo Avenue",
    "aliases": [
      "awolowo"
    ],
    "area": "Sabon Gari",
    "lat": 12.014,
    "lng": 8.541,
    "kind": "street"
  },
  {
    "name": "Ibo Road",
    "aliases": [
      "ibo road"
    ],
    "area": "Sabon Gari",
    "lat": 12.017,
    "lng": 8.537,
    "kind": "street"
  },
  {
    "name": "Yoruba Road",
    "aliases": [
      "yoruba road"
    ],
    "area": "Sabon Gari",
    "lat": 12.016,
    "lng": 8.536,
    "kind": "street"
  },
  {
    "name": "New Road",
    "aliases": [
      "new road"
    ],
    "area": "Sabon Gari",
    "lat": 12.018,
    "lng": 8.538,
    "kind": "street"
  },
  {
    "name": "Naibawa Motor Park",
    "aliases": [
      "naibawa park",
      "naibawa motor park"
    ],
    "area": "Kumbotso",
    "lat": 11.955,
    "lng": 8.545,
    "kind": "junction"
  },
  {
    "name": "Naibawa",
    "aliases": [
      "naibawa"
    ],
    "area": "Kumbotso",
    "lat": 11.963,
    "lng": 8.555,
    "kind": "quarter"
  },
  {
    "name": "Kumbotso",
    "aliases": [
      "kumbotso"
    ],
    "area": "Kumbotso",
    "lat": 11.89,
    "lng": 8.503,
    "kind": "quarter"
  },
  {
    "name": "Sharada Industrial Estate",
    "aliases": [
      "sharada"
    ],
    "area": "Gwale",
    "lat": 11.978,
    "lng": 8.5,
    "kind": "quarter"
  },
  {
    "name": "Challawa",
    "aliases": [
      "challawa"
    ],
    "area": "Kumbotso",
    "lat": 11.93,
    "lng": 8.49,
    "kind": "quarter"
  },
  {
    "name": "Panshekara",
    "aliases": [
      "panshekara"
    ],
    "area": "Kumbotso",
    "lat": 11.91,
    "lng": 8.47,
    "kind": "quarter"
  },
  {
    "name": "Sheka",
    "aliases": [
      "sheka"
    ],
    "area": "Kumbotso",
    "lat": 11.94,
    "lng": 8.5,
    "kind": "quarter"
  },
  {
    "name": "Yankaba",
    "aliases": [
      "yankaba"
    ],
    "area": "Nassarawa",
    "lat": 12.015,
    "lng": 8.58,
    "kind": "quarter"
  },
  {
    "name": "Badawa",
    "aliases": [
      "badawa"
    ],
    "area": "Nassarawa",
    "lat": 12,
    "lng": 8.565,
    "kind": "quarter"
  },
  {
    "name": "Bachirawa",
    "aliases": [
      "bachirawa"
    ],
    "area": "Ungogo",
    "lat": 12.055,
    "lng": 8.5,
    "kind": "quarter"
  },
  {
    "name": "Ungogo",
    "aliases": [
      "ungogo"
    ],
    "area": "Ungogo",
    "lat": 12.092,
    "lng": 8.496,
    "kind": "quarter"
  },
  {
    "name": "Jaba",
    "aliases": [
      "jaba",
      "jabba"
    ],
    "area": "Ungogo",
    "lat": 12.035,
    "lng": 8.52,
    "kind": "quarter"
  },
  {
    "name": "Mallam Aminu Kano International Airport",
    "aliases": [
      "airport",
      "aminu kano airport",
      "makia"
    ],
    "area": "Ungogo",
    "lat": 12.0469,
    "lng": 8.5213,
    "kind": "landmark"
  },
  {
    "name": "Gayawa",
    "aliases": [
      "gayawa"
    ],
    "area": "Ungogo",
    "lat": 12.08,
    "lng": 8.52,
    "kind": "quarter"
  },
  {
    "name": "Kadawa",
    "aliases": [
      "kadawa"
    ],
    "area": "Ungogo",
    "lat": 12.07,
    "lng": 8.48,
    "kind": "quarter"
  },
  {
    "name": "Karo",
    "aliases": [
      "karo"
    ],
    "area": "Ungogo",
    "lat": 12.085,
    "lng": 8.51,
    "kind": "quarter"
  },
  {
    "name": "Panisau",
    "aliases": [
      "panisau"
    ],
    "area": "Ungogo",
    "lat": 12.1,
    "lng": 8.53,
    "kind": "quarter"
  },
  {
    "name": "Rangaza",
    "aliases": [
      "rangaza"
    ],
    "area": "Ungogo",
    "lat": 12.11,
    "lng": 8.51,
    "kind": "quarter"
  },
  {
    "name": "Tudun Fulani",
    "aliases": [
      "tudun fulani"
    ],
    "area": "Ungogo",
    "lat": 12.06,
    "lng": 8.48,
    "kind": "quarter"
  },
  {
    "name": "Yadakunya",
    "aliases": [
      "yadakunya"
    ],
    "area": "Ungogo",
    "lat": 12.095,
    "lng": 8.54,
    "kind": "quarter"
  },
  {
    "name": "Zango Ungogo",
    "aliases": [
      "zango ungogo"
    ],
    "area": "Ungogo",
    "lat": 12.088,
    "lng": 8.505,
    "kind": "quarter"
  },
  {
    "name": "Kabuga",
    "aliases": [
      "kabuga"
    ],
    "area": "Gwale",
    "lat": 11.985,
    "lng": 8.45,
    "kind": "quarter"
  },
  {
    "name": "Dorayi",
    "aliases": [
      "dorayi"
    ],
    "area": "Gwale",
    "lat": 11.985,
    "lng": 8.48,
    "kind": "quarter"
  },
  {
    "name": "Rijiyar Zaki",
    "aliases": [
      "rijiyar zaki"
    ],
    "area": "Ungogo",
    "lat": 12.04,
    "lng": 8.47,
    "kind": "quarter"
  },
  {
    "name": "Bayero University Kano",
    "aliases": [
      "buk",
      "bayero",
      "bayero university"
    ],
    "area": "Gwale",
    "lat": 11.973,
    "lng": 8.427,
    "kind": "landmark"
  },
  {
    "name": "Danbare",
    "aliases": [
      "danbare"
    ],
    "area": "Gwale",
    "lat": 11.96,
    "lng": 8.41,
    "kind": "quarter"
  },
  {
    "name": "Hotoro",
    "aliases": [
      "hotoro"
    ],
    "area": "Nassarawa",
    "lat": 11.989,
    "lng": 8.568,
    "kind": "quarter"
  },
  {
    "name": "Hotoro GRA",
    "aliases": [
      "hotoro gra"
    ],
    "area": "Nassarawa",
    "lat": 11.991,
    "lng": 8.572,
    "kind": "quarter"
  },
  {
    "name": "Kwanar Dabo",
    "aliases": [
      "kwanar dabo"
    ],
    "area": "Nassarawa",
    "lat": 11.985,
    "lng": 8.59,
    "kind": "junction"
  },
  {
    "name": "Sabo Bakin Zuwo",
    "aliases": [
      "sabo bakin zuwo"
    ],
    "area": "Hotoro",
    "lat": 11.987,
    "lng": 8.57,
    "kind": "street"
  },
  {
    "name": "El-Tayeb Road",
    "aliases": [
      "el-tayeb",
      "eltayeb"
    ],
    "area": "Hotoro",
    "lat": 11.988,
    "lng": 8.566,
    "kind": "street"
  },
  {
    "name": "Sudan Road",
    "aliases": [
      "sudan road"
    ],
    "area": "Hotoro",
    "lat": 11.99,
    "lng": 8.569,
    "kind": "street"
  },
  {
    "name": "Kura Road Hotoro",
    "aliases": [
      "kura road"
    ],
    "area": "Hotoro",
    "lat": 11.986,
    "lng": 8.567,
    "kind": "street"
  },
  {
    "name": "Tukur Road",
    "aliases": [
      "tukur road"
    ],
    "area": "Hotoro",
    "lat": 11.992,
    "lng": 8.57,
    "kind": "street"
  },
  {
    "name": "Gidado Road",
    "aliases": [
      "gidado"
    ],
    "area": "Hotoro",
    "lat": 11.993,
    "lng": 8.568,
    "kind": "street"
  },
  {
    "name": "CBN Quarters",
    "aliases": [
      "cbn quarters"
    ],
    "area": "Hotoro",
    "lat": 11.995,
    "lng": 8.575,
    "kind": "landmark"
  },
  {
    "name": "Mobile Police Barracks",
    "aliases": [
      "mopol barracks"
    ],
    "area": "Hotoro",
    "lat": 11.984,
    "lng": 8.574,
    "kind": "landmark"
  },
  {
    "name": "NNPC Depot",
    "aliases": [
      "nnpc depot"
    ],
    "area": "Hotoro",
    "lat": 11.98,
    "lng": 8.585,
    "kind": "landmark"
  },
  {
    "name": "Tsamiyar Boka",
    "aliases": [
      "tsamiyar boka"
    ],
    "area": "Hotoro",
    "lat": 11.982,
    "lng": 8.58,
    "kind": "quarter"
  },
  {
    "name": "Hotoro Fulani",
    "aliases": [
      "hotoro fulani"
    ],
    "area": "Hotoro",
    "lat": 11.988,
    "lng": 8.578,
    "kind": "quarter"
  },
  {
    "name": "Limawa",
    "aliases": [
      "limawa"
    ],
    "area": "Hotoro",
    "lat": 11.994,
    "lng": 8.582,
    "kind": "quarter"
  },
  {
    "name": "Walawai",
    "aliases": [
      "walawai"
    ],
    "area": "Hotoro",
    "lat": 11.996,
    "lng": 8.586,
    "kind": "quarter"
  },
  {
    "name": "Maradi",
    "aliases": [
      "maradi"
    ],
    "area": "Hotoro",
    "lat": 11.99,
    "lng": 8.588,
    "kind": "quarter"
  },
  {
    "name": "Maraba Hotoro",
    "aliases": [
      "maraba"
    ],
    "area": "Hotoro",
    "lat": 11.987,
    "lng": 8.592,
    "kind": "quarter"
  },
  {
    "name": "Unguwar Gabas",
    "aliases": [
      "unguwar gabas"
    ],
    "area": "Hotoro",
    "lat": 11.993,
    "lng": 8.59,
    "kind": "quarter"
  },
  {
    "name": "Bompai",
    "aliases": [
      "bompai"
    ],
    "area": "Nassarawa",
    "lat": 12.008,
    "lng": 8.547,
    "kind": "quarter"
  },
  {
    "name": "Kawaji",
    "aliases": [
      "kawaji"
    ],
    "area": "Nassarawa",
    "lat": 12.005,
    "lng": 8.562,
    "kind": "quarter"
  },
  {
    "name": "Dakata",
    "aliases": [
      "dakata"
    ],
    "area": "Nassarawa",
    "lat": 12.02,
    "lng": 8.57,
    "kind": "quarter"
  },
  {
    "name": "Gwagwarwa",
    "aliases": [
      "gwagwarwa"
    ],
    "area": "Nassarawa",
    "lat": 12.022,
    "lng": 8.56,
    "kind": "quarter"
  },
  {
    "name": "Bompai Police Barracks",
    "aliases": [
      "bompai barracks"
    ],
    "area": "Bompai",
    "lat": 12.01,
    "lng": 8.55,
    "kind": "landmark"
  },
  {
    "name": "Bompai Industrial Estate",
    "aliases": [
      "bompai industrial"
    ],
    "area": "Bompai",
    "lat": 12.006,
    "lng": 8.555,
    "kind": "quarter"
  },
  {
    "name": "President Avenue",
    "aliases": [
      "president avenue"
    ],
    "area": "Bompai",
    "lat": 12.012,
    "lng": 8.549,
    "kind": "street"
  },
  {
    "name": "Mundubawa",
    "aliases": [
      "mundubawa"
    ],
    "area": "Bompai",
    "lat": 12.014,
    "lng": 8.552,
    "kind": "street"
  },
  {
    "name": "Miller Road",
    "aliases": [
      "miller"
    ],
    "area": "Bompai",
    "lat": 12.011,
    "lng": 8.548,
    "kind": "street"
  },
  {
    "name": "Independence Road",
    "aliases": [
      "independence road"
    ],
    "area": "Bompai",
    "lat": 12.019,
    "lng": 8.563,
    "kind": "street"
  },
  {
    "name": "Hausa Road",
    "aliases": [
      "hausa road"
    ],
    "area": "Bompai",
    "lat": 12.013,
    "lng": 8.546,
    "kind": "street"
  },
  {
    "name": "Kundila",
    "aliases": [
      "kundila"
    ],
    "area": "Nassarawa",
    "lat": 11.998,
    "lng": 8.548,
    "kind": "quarter"
  },
  {
    "name": "Maganda Road",
    "aliases": [
      "maganda"
    ],
    "area": "Bompai",
    "lat": 12.009,
    "lng": 8.551,
    "kind": "street"
  },
  {
    "name": "Sule Gaya Road",
    "aliases": [
      "sule gaya"
    ],
    "area": "Bompai",
    "lat": 12.01,
    "lng": 8.553,
    "kind": "street"
  },
  {
    "name": "Tafawa Balewa Road",
    "aliases": [
      "tafawa balewa"
    ],
    "area": "Bompai",
    "lat": 12.008,
    "lng": 8.549,
    "kind": "street"
  },
  {
    "name": "Umaru Babura Road",
    "aliases": [
      "umaru babura"
    ],
    "area": "Bompai",
    "lat": 12.016,
    "lng": 8.55,
    "kind": "street"
  },
  {
    "name": "Whaff Road",
    "aliases": [
      "whaff",
      "rwaff"
    ],
    "area": "Bompai",
    "lat": 12.015,
    "lng": 8.547,
    "kind": "street"
  },
  {
    "name": "Zaria Avenue",
    "aliases": [
      "zaria avenue"
    ],
    "area": "Bompai",
    "lat": 12.007,
    "lng": 8.552,
    "kind": "street"
  },
  {
    "name": "St. Thomas",
    "aliases": [
      "st thomas",
      "st. thomas"
    ],
    "area": "Bompai",
    "lat": 12.018,
    "lng": 8.554,
    "kind": "landmark"
  },
  {
    "name": "Nassarawa GRA",
    "aliases": [
      "gra",
      "nassarawa gra",
      "nassarawa"
    ],
    "area": "Nassarawa",
    "lat": 11.996,
    "lng": 8.556,
    "kind": "quarter"
  },
  {
    "name": "Magaji Rumfa Road",
    "aliases": [
      "magaji rumfa"
    ],
    "area": "Nassarawa GRA",
    "lat": 11.998,
    "lng": 8.554,
    "kind": "street"
  },
  {
    "name": "Kwairanga Road",
    "aliases": [
      "kwairanga"
    ],
    "area": "Nassarawa GRA",
    "lat": 11.996,
    "lng": 8.557,
    "kind": "street"
  },
  {
    "name": "Lamido Road",
    "aliases": [
      "lamido"
    ],
    "area": "Nassarawa GRA",
    "lat": 11.994,
    "lng": 8.556,
    "kind": "street"
  },
  {
    "name": "Damzabau Road",
    "aliases": [
      "damzabau"
    ],
    "area": "Nassarawa GRA",
    "lat": 11.995,
    "lng": 8.559,
    "kind": "street"
  },
  {
    "name": "Dawaki Road",
    "aliases": [
      "dawaki",
      "yusuf maitama sule"
    ],
    "area": "Nassarawa GRA",
    "lat": 11.993,
    "lng": 8.553,
    "kind": "street"
  },
  {
    "name": "Tamandu Road",
    "aliases": [
      "tamandu"
    ],
    "area": "Nassarawa GRA",
    "lat": 11.994,
    "lng": 8.56,
    "kind": "street"
  },
  {
    "name": "Sulaiman Crescent",
    "aliases": [
      "sulaiman crescent"
    ],
    "area": "Nassarawa GRA",
    "lat": 11.996,
    "lng": 8.554,
    "kind": "street"
  },
  {
    "name": "Lamido Crescent",
    "aliases": [
      "lamido crescent"
    ],
    "area": "Nassarawa GRA",
    "lat": 11.995,
    "lng": 8.555,
    "kind": "street"
  },
  {
    "name": "Tarauni",
    "aliases": [
      "tarauni"
    ],
    "area": "Tarauni",
    "lat": 11.978,
    "lng": 8.545,
    "kind": "quarter"
  },
  {
    "name": "Unguwa Uku",
    "aliases": [
      "unguwa uku"
    ],
    "area": "Tarauni",
    "lat": 11.97,
    "lng": 8.55,
    "kind": "quarter"
  },
  {
    "name": "Babbangiji",
    "aliases": [
      "babbangiji"
    ],
    "area": "Tarauni",
    "lat": 11.975,
    "lng": 8.542,
    "kind": "quarter"
  },
  {
    "name": "Tarauni Market Road",
    "aliases": [
      "tarauni market"
    ],
    "area": "Tarauni",
    "lat": 11.977,
    "lng": 8.547,
    "kind": "street"
  },
  {
    "name": "Massalacin Murtala",
    "aliases": [
      "massalacin murtala"
    ],
    "area": "Tarauni",
    "lat": 11.98,
    "lng": 8.543,
    "kind": "landmark"
  },
  {
    "name": "New Court Road",
    "aliases": [
      "new court road"
    ],
    "area": "Tarauni",
    "lat": 11.982,
    "lng": 8.546,
    "kind": "street"
  },
  {
    "name": "Aminu Kano Teaching Hospital",
    "aliases": [
      "akth",
      "teaching hospital"
    ],
    "area": "Tarauni",
    "lat": 11.979,
    "lng": 8.54,
    "kind": "landmark"
  },
  {
    "name": "Dala",
    "aliases": [
      "dala"
    ],
    "area": "Dala",
    "lat": 12.01,
    "lng": 8.51,
    "kind": "quarter"
  },
  {
    "name": "Dala Hill",
    "aliases": [
      "dala hill"
    ],
    "area": "Dala",
    "lat": 12.016,
    "lng": 8.508,
    "kind": "landmark"
  },
  {
    "name": "Adakawa",
    "aliases": [
      "adakawa"
    ],
    "area": "Dala",
    "lat": 12.018,
    "lng": 8.505,
    "kind": "quarter"
  },
  {
    "name": "Bakin Ruwa",
    "aliases": [
      "bakin ruwa"
    ],
    "area": "Dala",
    "lat": 12.012,
    "lng": 8.502,
    "kind": "quarter"
  },
  {
    "name": "Dogon Nama",
    "aliases": [
      "dogon nama"
    ],
    "area": "Dala",
    "lat": 12.008,
    "lng": 8.507,
    "kind": "quarter"
  },
  {
    "name": "Gobirawa",
    "aliases": [
      "gobirawa"
    ],
    "area": "Dala",
    "lat": 12.014,
    "lng": 8.5,
    "kind": "quarter"
  },
  {
    "name": "Gwammaja",
    "aliases": [
      "gwammaja"
    ],
    "area": "Dala",
    "lat": 12.02,
    "lng": 8.502,
    "kind": "quarter"
  },
  {
    "name": "Kabuwaya",
    "aliases": [
      "kabuwaya"
    ],
    "area": "Dala",
    "lat": 12.006,
    "lng": 8.504,
    "kind": "quarter"
  },
  {
    "name": "Kantudu",
    "aliases": [
      "kantudu"
    ],
    "area": "Dala",
    "lat": 12.011,
    "lng": 8.506,
    "kind": "quarter"
  },
  {
    "name": "Kofar Mazugal",
    "aliases": [
      "kofar mazugal"
    ],
    "area": "Dala",
    "lat": 12.018,
    "lng": 8.5,
    "kind": "quarter"
  },
  {
    "name": "Kofar Ruwa",
    "aliases": [
      "kofar ruwa"
    ],
    "area": "Dala",
    "lat": 12.015,
    "lng": 8.508,
    "kind": "quarter"
  },
  {
    "name": "Kofar Waika",
    "aliases": [
      "kofar waika",
      "koforwika",
      "kofor waika",
      "waika"
    ],
    "area": "Dala",
    "lat": 12.01121,
    "lng": 8.49634,
    "kind": "quarter"
  },
  {
    "name": "Yan Awaki",
    "aliases": [
      "yan awaki"
    ],
    "area": "Dala",
    "lat": 12.013,
    "lng": 8.511,
    "kind": "landmark"
  },
  {
    "name": "Mayanka",
    "aliases": [
      "mayanka"
    ],
    "area": "Dala",
    "lat": 12.009,
    "lng": 8.5,
    "kind": "landmark"
  },
  {
    "name": "Gwale",
    "aliases": [
      "gwale"
    ],
    "area": "Gwale",
    "lat": 11.991,
    "lng": 8.505,
    "kind": "quarter"
  },
  {
    "name": "Dandago",
    "aliases": [
      "dandago"
    ],
    "area": "Gwale",
    "lat": 11.994,
    "lng": 8.5,
    "kind": "quarter"
  },
  {
    "name": "Diso",
    "aliases": [
      "diso"
    ],
    "area": "Gwale",
    "lat": 11.988,
    "lng": 8.508,
    "kind": "quarter"
  },
  {
    "name": "Galadanchi",
    "aliases": [
      "galadanchi"
    ],
    "area": "Gwale",
    "lat": 11.996,
    "lng": 8.51,
    "kind": "quarter"
  },
  {
    "name": "Goron Dutse",
    "aliases": [
      "goron dutse"
    ],
    "area": "Gwale",
    "lat": 12.002,
    "lng": 8.498,
    "kind": "quarter"
  },
  {
    "name": "Gyaranya",
    "aliases": [
      "gyaranya"
    ],
    "area": "Gwale",
    "lat": 11.993,
    "lng": 8.503,
    "kind": "quarter"
  },
  {
    "name": "Mandawari",
    "aliases": [
      "mandawari"
    ],
    "area": "Gwale",
    "lat": 11.99,
    "lng": 8.512,
    "kind": "quarter"
  },
  {
    "name": "Sani Mai Magge",
    "aliases": [
      "sani mai magge"
    ],
    "area": "Gwale",
    "lat": 11.987,
    "lng": 8.502,
    "kind": "quarter"
  },
  {
    "name": "Kano Municipal",
    "aliases": [
      "kano municipal",
      "municipal",
      "kmc"
    ],
    "area": "Kano",
    "lat": 11.996,
    "lng": 8.522,
    "kind": "quarter"
  },
  {
    "name": "Chedi",
    "aliases": [
      "chedi"
    ],
    "area": "Municipal",
    "lat": 11.997,
    "lng": 8.518,
    "kind": "quarter"
  },
  {
    "name": "Dan'Agundi",
    "aliases": [
      "dan agundi",
      "dan'agundi"
    ],
    "area": "Municipal",
    "lat": 11.99,
    "lng": 8.52,
    "kind": "quarter"
  },
  {
    "name": "Jakara",
    "aliases": [
      "jakara"
    ],
    "area": "Municipal",
    "lat": 11.998,
    "lng": 8.517,
    "kind": "quarter"
  },
  {
    "name": "Kankarofi",
    "aliases": [
      "kankarofi"
    ],
    "area": "Municipal",
    "lat": 11.994,
    "lng": 8.519,
    "kind": "quarter"
  },
  {
    "name": "Shahuchi",
    "aliases": [
      "shahuchi"
    ],
    "area": "Municipal",
    "lat": 11.996,
    "lng": 8.515,
    "kind": "quarter"
  },
  {
    "name": "Sheshe",
    "aliases": [
      "sheshe"
    ],
    "area": "Municipal",
    "lat": 11.992,
    "lng": 8.517,
    "kind": "quarter"
  },
  {
    "name": "Tudun Nufawa",
    "aliases": [
      "tudun nufawa"
    ],
    "area": "Municipal",
    "lat": 11.989,
    "lng": 8.515,
    "kind": "quarter"
  },
  {
    "name": "Tudun Wazirchi",
    "aliases": [
      "tudun wazirchi"
    ],
    "area": "Municipal",
    "lat": 11.991,
    "lng": 8.513,
    "kind": "quarter"
  },
  {
    "name": "Yakasai",
    "aliases": [
      "yakasai"
    ],
    "area": "Municipal",
    "lat": 11.994,
    "lng": 8.512,
    "kind": "quarter"
  },
  {
    "name": "Zaitawa",
    "aliases": [
      "zaitawa"
    ],
    "area": "Municipal",
    "lat": 11.988,
    "lng": 8.518,
    "kind": "quarter"
  },
  {
    "name": "Zango",
    "aliases": [
      "zango"
    ],
    "area": "Municipal",
    "lat": 11.999,
    "lng": 8.523,
    "kind": "quarter"
  },
  {
    "name": "Kofar Mata",
    "aliases": [
      "kofar mata"
    ],
    "area": "Municipal",
    "lat": 11.999,
    "lng": 8.519,
    "kind": "quarter"
  },
  {
    "name": "Kurmi Market",
    "aliases": [
      "kurmi",
      "kurmi market"
    ],
    "area": "Municipal",
    "lat": 11.9954,
    "lng": 8.5168,
    "kind": "landmark"
  },
  {
    "name": "Kofar Wambai",
    "aliases": [
      "kofar wambai"
    ],
    "area": "Municipal",
    "lat": 12.002,
    "lng": 8.52,
    "kind": "quarter"
  },
  {
    "name": "Kofar Na'isa",
    "aliases": [
      "kofar naisa",
      "kofar na'isa"
    ],
    "area": "Municipal",
    "lat": 11.997,
    "lng": 8.512,
    "kind": "quarter"
  },
  {
    "name": "Veterinary",
    "aliases": [
      "veterinary"
    ],
    "area": "Municipal",
    "lat": 11.993,
    "lng": 8.521,
    "kind": "landmark"
  },
  {
    "name": "Magashi",
    "aliases": [
      "magashi"
    ],
    "area": "Municipal",
    "lat": 11.995,
    "lng": 8.52,
    "kind": "quarter"
  },
  {
    "name": "Emir's Palace",
    "aliases": [
      "emir palace",
      "gidan rumfa"
    ],
    "area": "Municipal",
    "lat": 11.9958,
    "lng": 8.5164,
    "kind": "landmark"
  },
  {
    "name": "Kano State Government House",
    "aliases": [
      "government house",
      "govt house"
    ],
    "area": "Municipal",
    "lat": 11.992,
    "lng": 8.53,
    "kind": "landmark"
  },
  {
    "name": "Sani Abacha Stadium",
    "aliases": [
      "sani abacha stadium",
      "stadium"
    ],
    "area": "Municipal",
    "lat": 12.002,
    "lng": 8.53,
    "kind": "landmark"
  },
  {
    "name": "Gidan Murtala",
    "aliases": [
      "gidan murtala"
    ],
    "area": "Municipal",
    "lat": 11.994,
    "lng": 8.525,
    "kind": "landmark"
  },
  {
    "name": "Wudil",
    "aliases": [
      "wudil"
    ],
    "area": "Wudil",
    "lat": 11.809,
    "lng": 8.844,
    "kind": "quarter"
  },
  {
    "name": "Gwarzo",
    "aliases": [
      "gwarzo"
    ],
    "area": "Gwarzo",
    "lat": 11.916,
    "lng": 7.934,
    "kind": "quarter"
  },
  {
    "name": "Rano",
    "aliases": [
      "rano"
    ],
    "area": "Rano",
    "lat": 11.557,
    "lng": 8.745,
    "kind": "quarter"
  },
  {
    "name": "Bichi",
    "aliases": [
      "bichi"
    ],
    "area": "Bichi",
    "lat": 12.234,
    "lng": 8.241,
    "kind": "quarter"
  },
  {
    "name": "Dawakin Tofa",
    "aliases": [
      "dawakin tofa"
    ],
    "area": "Dawakin Tofa",
    "lat": 12.105,
    "lng": 8.33,
    "kind": "quarter"
  },
  {
    "name": "Gezawa",
    "aliases": [
      "gezawa"
    ],
    "area": "Gezawa",
    "lat": 12.077,
    "lng": 8.749,
    "kind": "quarter"
  },
  {
    "name": "Minjibir",
    "aliases": [
      "minjibir"
    ],
    "area": "Minjibir",
    "lat": 12.178,
    "lng": 8.655,
    "kind": "quarter"
  },
  {
    "name": "Kura",
    "aliases": [
      "kura"
    ],
    "area": "Kura",
    "lat": 11.772,
    "lng": 8.43,
    "kind": "quarter"
  }
];
