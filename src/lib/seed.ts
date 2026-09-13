import type { Partner } from "./types";

/** Kano city — start here. The desk is locked to Kano State. */
export const MAP_ORIGIN = { lat: 12.0022, lng: 8.5317, zoom: 12 };

export const KANO_BOUNDS = {
  south: 10.38,
  west: 7.66,
  north: 12.68,
  east: 9.24,
};

export function inKanoState(lat: number, lng: number) {
  return (
    lat >= KANO_BOUNDS.south &&
    lat <= KANO_BOUNDS.north &&
    lng >= KANO_BOUNDS.west &&
    lng <= KANO_BOUNDS.east
  );
}

export const SEED_PARTNERS: Partner[] = [
  {
    id: "p-swiftwheel",
    name: "SwiftWheel Couriers",
    phone: "+234 803 441 2290",
    notes: "WhatsApp first. Quotes within 10 minutes. Night cutoff 9pm.",
    address: "18 France Road, Sabon Gari, Kano",
    lat: 12.0126,
    lng: 8.5378,
    radiusKm: 8,
    vehicles: ["bike"],
    status: "active",
    image: "/partners/swiftwheel.jpg",
    createdAt: "2026-08-02T09:00:00.000Z",
    updatedAt: "2026-09-10T11:20:00.000Z",
  },
  {
    id: "p-northline",
    name: "Northline Logistics",
    phone: "+234 809 220 1184",
    notes: "Call the ops desk. Vans need 45 minutes notice.",
    address: "7 Club Road, Bompai, Kano",
    lat: 12.0185,
    lng: 8.551,
    radiusKm: 15,
    vehicles: ["car", "van"],
    status: "active",
    image: "/partners/northline.jpg",
    createdAt: "2026-07-18T08:30:00.000Z",
    updatedAt: "2026-09-08T16:04:00.000Z",
  },
  {
    id: "p-kekerun",
    name: "KekeRun",
    phone: "+234 701 554 8831",
    notes: "Bikes only. Best for envelopes and small bags. Amina dispatches.",
    address: "42 Murtala Mohammed Way, Fagge, Kano",
    lat: 12.0078,
    lng: 8.5312,
    radiusKm: 6,
    vehicles: ["bike"],
    status: "active",
    image: "/partners/kekerun.jpg",
    createdAt: "2026-08-21T12:10:00.000Z",
    updatedAt: "2026-09-11T09:40:00.000Z",
  },
  {
    id: "p-harbor",
    name: "Harbor Van Co",
    phone: "+234 802 667 0912",
    notes: "Paused — insurance renewal. Recheck 20 Sep.",
    address: "Sharada Industrial Estate, Kano",
    lat: 11.968,
    lng: 8.4985,
    radiusKm: 20,
    vehicles: ["van"],
    status: "paused",
    image: "/partners/harbor.jpg",
    createdAt: "2026-06-04T10:00:00.000Z",
    updatedAt: "2026-09-05T14:12:00.000Z",
  },
  {
    id: "p-cityhop",
    name: "CityHop Express",
    phone: "+234 815 330 7742",
    notes: "Prefer them for Tarauni and Zoo Road. Fast on small bags.",
    address: "Zoo Road, Tarauni, Kano",
    lat: 11.9735,
    lng: 8.5488,
    radiusKm: 10,
    vehicles: ["bike", "car"],
    status: "active",
    image: "/partners/cityhop.jpg",
    createdAt: "2026-07-29T15:45:00.000Z",
    updatedAt: "2026-09-12T08:18:00.000Z",
  },
];
