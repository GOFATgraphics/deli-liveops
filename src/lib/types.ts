export const VEHICLES = ["bike", "car", "van"] as const;
export type Vehicle = (typeof VEHICLES)[number];

export const RADIUS_OPTIONS = [5, 8, 10, 15, 20, 25, 40] as const;
export const CITYWIDE_KM = 40;

export type PartnerStatus = "active" | "paused";

export type Partner = {
  id: string;
  name: string;
  phone: string;
  notes: string;
  address: string;
  lat: number;
  lng: number;
  radiusKm: number;
  vehicles: Vehicle[];
  status: PartnerStatus;
  image: string;
  createdAt: string;
  updatedAt: string;
};

export type PartnerDraft = {
  name: string;
  phone: string;
  notes: string;
  address: string;
  lat: number | null;
  lng: number | null;
  radiusKm: number;
  vehicles: Vehicle[];
  status: PartnerStatus;
  image: string;
};

export const EMPTY_DRAFT: PartnerDraft = {
  name: "",
  phone: "",
  notes: "",
  address: "",
  lat: null,
  lng: null,
  radiusKm: 10,
  vehicles: ["bike"],
  status: "active",
  image: "",
};

export const VEHICLE_LABEL: Record<Vehicle, string> = {
  bike: "Bike",
  car: "Car",
  van: "Van",
};

export function formatRadius(km: number) {
  return km >= CITYWIDE_KM ? "Citywide" : `${km} km`;
}

export function partnerFromDraft(draft: PartnerDraft, existing?: Partner): Partner {
  const now = new Date().toISOString();
  if (draft.lat == null || draft.lng == null) {
    throw new Error("Hub pin required");
  }
  return {
    id: existing?.id ?? crypto.randomUUID(),
    name: draft.name.trim(),
    phone: draft.phone.trim(),
    notes: draft.notes.trim(),
    address: draft.address.trim(),
    lat: draft.lat,
    lng: draft.lng,
    radiusKm: draft.radiusKm,
    vehicles: draft.vehicles,
    status: draft.status,
    image: draft.image,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}

export function draftFromPartner(partner: Partner): PartnerDraft {
  return {
    name: partner.name,
    phone: partner.phone,
    notes: partner.notes,
    address: partner.address,
    lat: partner.lat,
    lng: partner.lng,
    radiusKm: partner.radiusKm,
    vehicles: [...partner.vehicles],
    status: partner.status,
    image: partner.image,
  };
}
