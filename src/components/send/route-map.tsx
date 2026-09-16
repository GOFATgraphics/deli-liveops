import { useEffect, useRef, useState } from "react";
import { CARTO_ATTRIBUTION, VOYAGER_TILES } from "@/lib/carto";
import { KANO_BOUNDS, MAP_ORIGIN } from "@/lib/seed";
import { cn } from "@/lib/utils";

type Pin = { lat: number; lng: number; label: string };

function cssToken(name: string, fallback: string) {
  if (typeof document === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

export function RouteMap({
  pickup,
  dropoff,
  className,
}: {
  pickup: Pin;
  dropoff: Pin;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const groupRef = useRef<import("leaflet").LayerGroup | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let cancelled = false;

    void (async () => {
      const L = await import("leaflet");
      if (cancelled || !containerRef.current) return;

      const bounds = L.latLngBounds(
        [KANO_BOUNDS.south, KANO_BOUNDS.west],
        [KANO_BOUNDS.north, KANO_BOUNDS.east],
      );
      const map = L.map(containerRef.current, {
        zoomControl: false,
        attributionControl: true,
        minZoom: 9,
        maxBounds: bounds,
        maxBoundsViscosity: 0.7,
        dragging: true,
        scrollWheelZoom: false,
      }).setView([MAP_ORIGIN.lat, MAP_ORIGIN.lng], 13);

      L.tileLayer(VOYAGER_TILES, {
        attribution: CARTO_ATTRIBUTION,
        maxZoom: 19,
        detectRetina: false,
      }).addTo(map);

      const group = L.layerGroup().addTo(map);
      groupRef.current = group;
      mapRef.current = map;
      const resize = () => map.invalidateSize();
      window.addEventListener("resize", resize);
      const ro = new ResizeObserver(resize);
      ro.observe(containerRef.current);
      requestAnimationFrame(resize);
      window.setTimeout(resize, 80);

      if (!cancelled) setReady(true);

      map.once("unload", () => {
        window.removeEventListener("resize", resize);
        ro.disconnect();
      });
    })();

    return () => {
      cancelled = true;
      setReady(false);
      mapRef.current?.remove();
      mapRef.current = null;
      groupRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const group = groupRef.current;
    if (!map || !group || !ready) return;
    let cancelled = false;
    void (async () => {
      const L = await import("leaflet");
      if (cancelled || !mapRef.current || !groupRef.current) return;
      group.clearLayers();
      const ink = cssToken("--color-fg", "#09090b");
      const pickupIcon = L.divIcon({
        className: "route-pin",
        html: `<div class="route-pin-dot">1</div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });
      const dropoffIcon = L.divIcon({
        className: "route-pin",
        html: `<div class="route-pin-dot">2</div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });
      L.marker([pickup.lat, pickup.lng], { icon: pickupIcon, title: pickup.label, keyboard: false }).addTo(group);
      L.marker([dropoff.lat, dropoff.lng], { icon: dropoffIcon, title: dropoff.label, keyboard: false }).addTo(group);
      L.polyline(
        [
          [pickup.lat, pickup.lng],
          [dropoff.lat, dropoff.lng],
        ],
        { color: ink, weight: 2, opacity: 0.45, dashArray: "5 7" },
      ).addTo(group);
      map.fitBounds(L.latLngBounds([pickup.lat, pickup.lng], [dropoff.lat, dropoff.lng]), {
        padding: [36, 36],
        maxZoom: 15,
      });
      map.invalidateSize();
    })();
    return () => {
      cancelled = true;
    };
  }, [pickup.lat, pickup.lng, pickup.label, dropoff.lat, dropoff.lng, dropoff.label, ready]);

  return (
    <div className={cn("relative overflow-hidden rounded-lg bg-map", className)}>
      <div ref={containerRef} className="absolute inset-0" />
      {!ready ? <div className="absolute inset-0 animate-pulse bg-surface" /> : null}
    </div>
  );
}
