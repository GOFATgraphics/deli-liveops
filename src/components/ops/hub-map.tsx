import { useEffect, useRef, useState } from "react";
import { PlaceSearch } from "@/components/ops/place-search";
import { CARTO_ATTRIBUTION, VOYAGER_TILES } from "@/lib/carto";
import { reverseGeocode, type GeoHit } from "@/lib/geocode";
import { KANO_PLACES } from "@/lib/kano-places";
import { inKanoState, KANO_BOUNDS, MAP_ORIGIN } from "@/lib/seed";
import type { Partner, PartnerDraft } from "@/lib/types";
import { cn } from "@/lib/utils";

type HubMapProps = {
  partners: Partner[];
  selectedId: string | null;
  draft: PartnerDraft | null;
  pickMode: boolean;
  onSelect: (id: string) => void;
  onPick: (lat: number, lng: number, address?: string) => void;
  className?: string;
};

type LeafletNS = typeof import("leaflet");
type Basemap = "streets" | "satellite";

function pinHtml(image: string | undefined, kind: "active" | "paused" | "selected" | "draft" | "found") {
  if (image) {
    const cls = kind === "active" ? "hub-photo-pin" : `hub-photo-pin is-${kind}`;
    return `<div class="${cls}"><img src=${JSON.stringify(image)} alt=""></div>`;
  }
  const cls =
    kind === "draft"
      ? "hub-pin-dot is-draft"
      : kind === "selected"
        ? "hub-pin-dot is-selected"
        : kind === "paused"
          ? "hub-pin-dot is-paused"
          : kind === "found"
            ? "hub-pin-dot is-found"
            : "hub-pin-dot";
  return `<div class="${cls}"></div>`;
}

function cssToken(name: string, fallback: string) {
  if (typeof document === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

export function HubMap({
  partners,
  selectedId,
  draft,
  pickMode,
  onSelect,
  onPick,
  className,
}: HubMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const layersRef = useRef<import("leaflet").LayerGroup | null>(null);
  const placesRef = useRef<import("leaflet").LayerGroup | null>(null);
  const streetsRef = useRef<import("leaflet").TileLayer | null>(null);
  const satelliteRef = useRef<import("leaflet").TileLayer | null>(null);
  const leafletRef = useRef<LeafletNS | null>(null);
  const onPickRef = useRef(onPick);
  const onSelectRef = useRef(onSelect);
  const pickModeRef = useRef(pickMode);
  const partnersRef = useRef(partners);
  const didFitRef = useRef(false);
  const [mapReady, setMapReady] = useState(false);
  const [basemap, setBasemap] = useState<Basemap>("streets");
  const [found, setFound] = useState<GeoHit | null>(null);
  const [showPlaces, setShowPlaces] = useState(true);
  const [zoom, setZoom] = useState(MAP_ORIGIN.zoom);

  onPickRef.current = onPick;
  onSelectRef.current = onSelect;
  pickModeRef.current = pickMode;
  partnersRef.current = partners;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let cancelled = false;

    void (async () => {
      const L = await import("leaflet");
      if (cancelled || !containerRef.current) return;
      leafletRef.current = L;

      const bounds = L.latLngBounds(
        [KANO_BOUNDS.south, KANO_BOUNDS.west],
        [KANO_BOUNDS.north, KANO_BOUNDS.east],
      );
      const map = L.map(containerRef.current, {
        zoomControl: false,
        attributionControl: true,
        minZoom: 8,
        maxBounds: bounds,
        maxBoundsViscosity: 0.85,
      }).setView([MAP_ORIGIN.lat, MAP_ORIGIN.lng], MAP_ORIGIN.zoom);
      L.control.zoom({ position: "bottomleft" }).addTo(map);

      const streets = L.tileLayer(VOYAGER_TILES, {
        attribution: CARTO_ATTRIBUTION,
        maxZoom: 20,
        detectRetina: false,
      });
      const satellite = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "Tiles © Esri",
          maxZoom: 19,
        },
      );
      streets.addTo(map);
      streetsRef.current = streets;
      satelliteRef.current = satellite;

      const group = L.layerGroup().addTo(map);
      layersRef.current = group;
      const places = L.layerGroup().addTo(map);
      placesRef.current = places;
      mapRef.current = map;
      setZoom(map.getZoom());
      map.on("zoomend", () => setZoom(map.getZoom()));

      map.on("click", (event) => {
        if (!pickModeRef.current) return;
        if (!inKanoState(event.latlng.lat, event.latlng.lng)) return;
        const lat = event.latlng.lat;
        const lng = event.latlng.lng;
        onPickRef.current(lat, lng);
        void reverseGeocode(lat, lng).then((address) => {
          if (address) onPickRef.current(lat, lng, address);
        });
      });

      if (searchRef.current) {
        L.DomEvent.disableClickPropagation(searchRef.current);
        L.DomEvent.disableScrollPropagation(searchRef.current);
      }

      const resize = () => map.invalidateSize();
      window.addEventListener("resize", resize);
      const ro = new ResizeObserver(resize);
      ro.observe(containerRef.current);
      requestAnimationFrame(resize);
      window.setTimeout(resize, 80);
      window.setTimeout(resize, 320);

      if (!cancelled) setMapReady(true);

      map.once("unload", () => {
        window.removeEventListener("resize", resize);
        ro.disconnect();
      });
    })();

    return () => {
      cancelled = true;
      setMapReady(false);
      mapRef.current?.remove();
      mapRef.current = null;
      layersRef.current = null;
      placesRef.current = null;
      streetsRef.current = null;
      satelliteRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const streets = streetsRef.current;
    const satellite = satelliteRef.current;
    if (!map || !streets || !satellite || !mapReady) return;
    if (basemap === "satellite") {
      if (map.hasLayer(streets)) map.removeLayer(streets);
      if (!map.hasLayer(satellite)) satellite.addTo(map);
    } else {
      if (map.hasLayer(satellite)) map.removeLayer(satellite);
      if (!map.hasLayer(streets)) streets.addTo(map);
    }
  }, [basemap, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    const L = leafletRef.current;
    const group = layersRef.current;
    if (!map || !L || !group || !mapReady) return;

    const ink = cssToken("--color-fg", "#2a0800");
    const muted = cssToken("--color-muted", "#626262");
    const paused = cssToken("--color-paused", "#b4b4b4");

    group.clearLayers();
    const bounds = L.latLngBounds([]);

    for (const partner of partners) {
      const isSelected = partner.id === selectedId && !draft;
      const stroke = isSelected ? ink : partner.status === "paused" ? paused : muted;
      const kind = isSelected ? "selected" : partner.status === "paused" ? "paused" : "active";
      const icon = L.divIcon({
        className: "hub-pin",
        html: pinHtml(partner.image, kind),
        iconSize: partner.image ? [42, 42] : [18, 18],
        iconAnchor: partner.image ? [21, 21] : [9, 9],
      });
      const marker = L.marker([partner.lat, partner.lng], { icon, zIndexOffset: isSelected ? 600 : 0 });
      marker.on("click", (event) => {
        L.DomEvent.stopPropagation(event);
        if (pickModeRef.current) {
          onPickRef.current(partner.lat, partner.lng, partner.address);
          return;
        }
        onSelectRef.current(partner.id);
      });
      marker.bindTooltip(partner.name, {
        direction: "top",
        offset: [0, partner.image ? -18 : -10],
        opacity: 0.95,
      });
      if (isSelected) {
        L.circle([partner.lat, partner.lng], {
          radius: partner.radiusKm * 1000,
          color: stroke,
          weight: 1.5,
          opacity: 0.7,
          fillColor: stroke,
          fillOpacity: 0.06,
          interactive: false,
        }).addTo(group);
      }
      marker.addTo(group);
      bounds.extend([partner.lat, partner.lng]);
    }

    if (draft?.lat != null && draft.lng != null) {
      const icon = L.divIcon({
        className: "hub-pin",
        html: pinHtml(draft.image || undefined, "draft"),
        iconSize: draft.image ? [42, 42] : [18, 18],
        iconAnchor: draft.image ? [21, 21] : [9, 9],
      });
      L.marker([draft.lat, draft.lng], { icon, zIndexOffset: 800 }).addTo(group);
      L.circle([draft.lat, draft.lng], {
        radius: draft.radiusKm * 1000,
        color: ink,
        weight: 1.6,
        opacity: 0.8,
        fillColor: ink,
        fillOpacity: 0.1,
        interactive: false,
      }).addTo(group);
      bounds.extend([draft.lat, draft.lng]);
    }

    if (found) {
      const icon = L.divIcon({
        className: "hub-pin",
        html: pinHtml(undefined, "found"),
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
      L.marker([found.lat, found.lng], { icon, zIndexOffset: 900 }).addTo(group);
    }

    if (!didFitRef.current && bounds.isValid()) {
      didFitRef.current = true;
      map.fitBounds(bounds.pad(0.35), { maxZoom: 13, animate: false });
    }
  }, [partners, selectedId, draft, found, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    map.invalidateSize();
    if (draft?.lat != null && draft.lng != null) {
      map.panTo([draft.lat, draft.lng]);
      return;
    }
    const selected = partnersRef.current.find((p) => p.id === selectedId);
    if (selected) {
      map.flyTo([selected.lat, selected.lng], Math.max(map.getZoom(), 13), { duration: 0.45 });
    }
  }, [selectedId, draft?.lat, draft?.lng, pickMode, mapReady]);

  useEffect(() => {
    const map = mapRef.current;
    const L = leafletRef.current;
    const group = placesRef.current;
    if (!map || !L || !group || !mapReady) return;
    group.clearLayers();
    if (!showPlaces) return;
    const list =
      zoom >= 13
        ? KANO_PLACES
        : KANO_PLACES.filter((place) => place.kind === "corridor" || place.kind === "landmark");
    for (const place of list) {
      const icon = L.divIcon({
        className: "hub-pin",
        html: `<div class="hub-place-dot is-${place.kind}"></div>`,
        iconSize: [10, 10],
        iconAnchor: [5, 5],
      });
      const marker = L.marker([place.lat, place.lng], { icon, zIndexOffset: -200, keyboard: false });
      marker.bindTooltip(`${place.name} · ${place.area}`, {
        direction: "top",
        offset: [0, -6],
        opacity: 0.95,
      });
      marker.on("click", (event) => {
        L.DomEvent.stopPropagation(event);
        const label = `${place.name}, ${place.area}`;
        if (pickModeRef.current) {
          onPickRef.current(place.lat, place.lng, label);
          return;
        }
        map.flyTo([place.lat, place.lng], Math.max(map.getZoom(), 15), { duration: 0.4 });
      });
      marker.addTo(group);
    }
  }, [mapReady, showPlaces, zoom]);

  function locate(hit: GeoHit) {

    setFound(hit);
    const map = mapRef.current;
    map?.flyTo([hit.lat, hit.lng], Math.max(map.getZoom(), 15), { duration: 0.5 });
    onPickRef.current(hit.lat, hit.lng, hit.label);
  }

  return (
    <div className={cn("relative min-h-60 overflow-hidden bg-map", className)}>
      <div
        ref={containerRef}
        className={cn("absolute inset-0 z-0", pickMode && "cursor-crosshair")}
      />
      <div
        ref={searchRef}
        className="absolute top-3 left-3 z-20 w-[min(20rem,calc(100%-8rem))]"
      >
        <PlaceSearch onSelect={locate} />
      </div>
      <div className="absolute top-3 right-3 z-20 flex overflow-hidden rounded-md bg-raised shadow-[var(--shadow-card)]">
        <button
          type="button"
          onClick={() => setShowPlaces((v) => !v)}
          className={cn(
            "h-11 px-3 text-sm font-medium",
            showPlaces ? "bg-fg text-accent-fg" : "text-muted hover:text-fg",
          )}
        >
          Places
        </button>
        <button
          type="button"
          onClick={() => setBasemap("streets")}
          className={cn(
            "h-11 px-3 text-sm font-medium",
            basemap === "streets" ? "bg-fg text-accent-fg" : "text-muted hover:text-fg",
          )}
        >
          Streets
        </button>
        <button
          type="button"
          onClick={() => setBasemap("satellite")}
          className={cn(
            "h-11 px-3 text-sm font-medium",
            basemap === "satellite" ? "bg-fg text-accent-fg" : "text-muted hover:text-fg",
          )}
        >
          Satellite
        </button>
      </div>
      {pickMode ? (
        <div className="pointer-events-none absolute bottom-3 left-14 z-20 rounded-full bg-raised/95 px-3 py-1.5 text-xs text-muted shadow-[var(--shadow-card)]">
          Search or click the map to set the hub
        </div>
      ) : null}
    </div>
  );
}
