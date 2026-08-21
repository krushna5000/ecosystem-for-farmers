import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free";
import * as turf from "@turf/turf";
import apiService from "../../services/api.service";

export default function FarmMap() {
  const mapRef = useRef(null);
  const polygonRef = useRef(null);

  const [farmStats, setFarmStats] = useState({
    coordinates: [],
    area: 0,
    syncing: false,
  });

  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map("map");
    mapRef.current = map;

    map.setView([20.5937, 78.9629], 5);

    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 20 }
    ).addTo(map);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          map.setView(
            [pos.coords.latitude, pos.coords.longitude],
            18
          );
        },
        () => {}
      );
    }

    map.pm.addControls({
      position: "topleft",
      drawPolygon: true,
      drawMarker: false,
      drawCircle: false,
      drawCircleMarker: false,
      drawPolyline: false,
      drawRectangle: false,
      drawText: false,
      editMode: true,
      dragMode: true,
      cutPolygon: false,
      removalMode: true,
    });

    async function processPolygon(layer) {
      const latlngs = layer.getLatLngs()[0];

      const coordinates = latlngs.map((p) => ({
        lat: p.lat,
        lon: p.lng,
      }));

      const geoJsonCoords = latlngs.map((p) => [p.lng, p.lat]);
      geoJsonCoords.push(geoJsonCoords[0]);

      const polygon = turf.polygon([geoJsonCoords]);
      const areaSqMeters = turf.area(polygon);
      const areaHectares = Number(
        (areaSqMeters / 10000).toFixed(3)
      );

      setFarmStats({
        coordinates,
        area: areaHectares,
        syncing: true,
      });

      try {
        await apiService.submitFarmBoundary({
          coordinates,
          area_hectares: areaHectares,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setFarmStats((prev) => ({ ...prev, syncing: false }));
      }
    }

    map.on("pm:create", (e) => {
      if (polygonRef.current) {
        map.removeLayer(polygonRef.current);
      }

      polygonRef.current = e.layer;
      processPolygon(e.layer);

      e.layer.on("pm:edit", () => {
        processPolygon(e.layer);
      });
    });

    map.on("pm:remove", () => {
      polygonRef.current = null;
      setFarmStats({ coordinates: [], area: 0, syncing: false });
    });

    return () => map.remove();
  }, []);

  return (
    <div className="relative h-full w-full">
      {/* MAP */}
      <div id="map" className="h-full w-full" />

      {/* CLEAN FLOATING CARD */}
      {farmStats.coordinates.length > 0 && (
        <div className="absolute top-5 right-5 z-[1000] w-[340px] bg-white rounded-2xl shadow-xl border border-gray-200 p-5 max-h-[80vh] overflow-y-auto">
          
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Farm Boundary Details
          </h2>

          {/* Area */}
          <div className="mb-4">
            <p className="text-sm text-gray-500">Total Area</p>
            <p className="text-2xl font-bold text-green-600">
              {farmStats.area} ha
            </p>
          </div>

          {/* Coordinates */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Boundary Coordinates
            </p>

            <ul className="text-xs font-mono text-gray-600 space-y-1">
              {farmStats.coordinates.map((p, i) => (
                <li
                  key={i}
                  className="bg-gray-50 border border-gray-200 px-2 py-1 rounded"
                >
                  <span className="font-semibold">Latitude:</span>{" "}
                  {p.lat.toFixed(5)}{" "}
                  <span className="ml-2 font-semibold">
                    Longitude:
                  </span>{" "}
                  {p.lon.toFixed(5)}
                </li>
              ))}
            </ul>
          </div>

          {farmStats.syncing && (
            <p className="mt-3 text-sm text-blue-600">
              Syncing with server…
            </p>
          )}
        </div>
      )}
    </div>
  );
}
