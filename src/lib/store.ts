import { create } from "zustand";
import { listFleets, removeFleet, setFleetStatus, upsertFleet } from "@/lib/ops-data";
import { SEED_PARTNERS } from "./seed";
import type { Partner, PartnerStatus } from "./types";

type PartnerStore = {
  partners: Partner[];
  ready: boolean;
  hydrate: () => Promise<void>;
  upsert: (partner: Partner) => Promise<void>;
  setStatus: (id: string, status: PartnerStatus) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

export const usePartners = create<PartnerStore>((set, get) => ({
  partners: SEED_PARTNERS,
  ready: false,
  hydrate: async () => {
    try {
      const partners = await listFleets();
      set({ partners, ready: true });
    } catch (error) {
      console.error("[deli] fleets", error);
      set({ ready: true });
    }
  },
  upsert: async (partner) => {
    const saved = await upsertFleet({
      data: {
        id: partner.id,
        name: partner.name,
        phone: partner.phone,
        notes: partner.notes,
        address: partner.address,
        lat: partner.lat,
        lng: partner.lng,
        radiusKm: partner.radiusKm,
        vehicles: partner.vehicles,
        status: partner.status,
        image: partner.image,
      },
    });
    const current = get().partners;
    const index = current.findIndex((p) => p.id === saved.id);
    const next =
      index === -1 ? [saved, ...current] : current.map((p) => (p.id === saved.id ? saved : p));
    set({ partners: next });
  },
  setStatus: async (id, status) => {
    await setFleetStatus({ data: { id, status } });
    set({
      partners: get().partners.map((p) =>
        p.id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p,
      ),
    });
  },
  remove: async (id) => {
    await removeFleet({ data: { id } });
    set({ partners: get().partners.filter((p) => p.id !== id) });
  },
}));
