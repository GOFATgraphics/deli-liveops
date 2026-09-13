import { create } from "zustand";
import { SEED_PARTNERS } from "./seed";
import type { Partner, PartnerStatus } from "./types";

const KEY = "deli.partners.v3";

function readPartners(): Partner[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return SEED_PARTNERS;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0) return SEED_PARTNERS;
    return parsed as Partner[];
  } catch {
    return SEED_PARTNERS;
  }
}

function writePartners(partners: Partner[]) {
  localStorage.setItem(KEY, JSON.stringify(partners));
}

type PartnerStore = {
  partners: Partner[];
  hydrate: () => void;
  upsert: (partner: Partner) => void;
  setStatus: (id: string, status: PartnerStatus) => void;
  remove: (id: string) => void;
};

export const usePartners = create<PartnerStore>((set, get) => ({
  partners: SEED_PARTNERS,
  hydrate: () => {
    const partners = readPartners();
    if (!localStorage.getItem(KEY)) writePartners(partners);
    set({ partners });
  },
  upsert: (partner) => {
    const current = get().partners;
    const index = current.findIndex((p) => p.id === partner.id);
    const next =
      index === -1
        ? [partner, ...current]
        : current.map((p) => (p.id === partner.id ? partner : p));
    writePartners(next);
    set({ partners: next });
  },
  setStatus: (id, status) => {
    const next = get().partners.map((p) =>
      p.id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p,
    );
    writePartners(next);
    set({ partners: next });
  },
  remove: (id) => {
    const next = get().partners.filter((p) => p.id !== id);
    writePartners(next);
    set({ partners: next });
  },
}));
