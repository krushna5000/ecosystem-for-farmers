import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { Pencil, RotateCcw } from "lucide-react";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import * as turf from "@turf/turf";
import AppLoader from "../Loaders/AppLoader";

// Fix Leaflet default icon bug
delete L.Icon.Default.prototype._getIconUrl;

export default function AddFarmPage({ onAddFarm }) {
  const navigate = useNavigate();
  const domain = import.meta.env.VITE_DOMAIN;
  const { user } = useAuth();

  const mapRef = useRef(null);
  const polygonRef = useRef(null);
  const pincodeLayerRef = useRef(null);
  const pincodeCenterRef = useRef(null);

  const [farmName, setFarmName] = useState("");
  const [pincodes, setPincodes] = useState([]);
  const [selectedPincodeId, setSelectedPincodeId] = useState("");
  const [pincodeSearch, setPincodeSearch] = useState("");

  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [area, setArea] = useState(null);
  const [geoJson, setGeoJson] = useState(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isBoundingBoxPolygon = (geometry) => {
    if (!geometry || geometry.type !== "Polygon") return false;

    const coords = geometry.coordinates?.[0];
    if (!coords || coords.length !== 5) return false;

    const uniquePoints = new Set(coords.map((p) => p.join(",")));
    return uniquePoints.size === 4;
  };

  const handlePincodeSearch = async () => {
    if (pincodeSearch.length !== 6) {
      toast.error("Enter valid pincode");
      return;
    }

    if (!mapRef.current) return;

    try {
      const res = await axios.get(
        `${domain}/farms/pincode-boundary/${pincodeSearch}`,
        { withCredentials: true },
      );

      const result = res.data;
      console.log("FULL RESULT:", result);
      console.log("KIND:", result?.kind);
      console.log("GEOMETRY:", result?.geometry);
      console.log("COORD LENGTH:", result?.geometry?.coordinates?.[0]?.length);

      if (!result) {
        toast.error("Pincode location not available");
        return;
      }

      if (pincodeLayerRef.current) {
        mapRef.current.removeLayer(pincodeLayerRef.current);
        pincodeLayerRef.current = null;
      }

      const shouldUsePolygon =
        result.kind === "geojson" &&
        result.geometry &&
        result.geometry.type === "Polygon";

      // REAL POLYGON (supported)
      if (shouldUsePolygon) {
        const layer = L.geoJSON(result.geometry, {
          style: {
            color: "#ffffff",
            weight: 4,
            dashArray: "3, 6",
            fillColor: "#ffffff",
            fillOpacity: 0.08,
          },
        }).addTo(mapRef.current);

        pincodeLayerRef.current = layer;

        addPincodeCenter({
          type: "Feature",
          geometry: result.geometry,
        });

        mapRef.current.fitBounds(layer.getBounds(), {
          padding: [40, 40],
          maxZoom: 17,
          animate: true,
          duration: 0.5,
        });
      }

      // CIRCLE FALLBACK
      else {
        const circle = L.circle(result.center, {
          radius: 3000,
          color: "#ffffff",
          weight: 4,
          fillColor: "#ffffff",
          fillOpacity: 0.12,
          dashArray: "4,6",
        }).addTo(mapRef.current);

        pincodeLayerRef.current = circle;

        addPincodeCenter({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [result.center[1], result.center[0]],
          },
        });

        mapRef.current.setView(result.center, 14, {
          animate: true,
          duration: 1.2,
        });
      }
    } catch (err) {
      console.error("Pincode search error:", err);
      toast.error("Search failed");
    }
  };

  function addPincodeCenter(feature) {
    if (!mapRef.current || !feature) return;

    // remove old center dot
    if (pincodeCenterRef.current) {
      mapRef.current.removeLayer(pincodeCenterRef.current);
      pincodeCenterRef.current = null;
    }

    const [lng, lat] = turf.center(feature).geometry.coordinates;

    const dot = L.marker([lat, lng], {
      icon: L.divIcon({
        html: `<div class="user-location-dot"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      }),
      interactive: false,
    });

    const circle = L.circle([lat, lng], {
      radius: 200, // visual only (meters)
      color: "#82aef4",
      fillColor: "#4285F4",
      fillOpacity: 0.12,
      weight: 1,
      interactive: false,
    });

    pincodeCenterRef.current = L.layerGroup([circle, dot]).addTo(
      mapRef.current,
    );
  }

  /* INIT MAP (SAFE) */
  useEffect(() => {
    const container = document.getElementById("farm-map");
    if (!container || mapRef.current) return;

    const map = L.map(container, {
      center: [20.5937, 78.9629],
      zoom: 5,
      zoomControl: false,
    });

    mapRef.current = map;

    L.control.zoom({ position: "bottomright" }).addTo(map);

    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        maxZoom: 18,
        attribution:
          'Imagery © <a href="https://www.esri.com/" target="_blank">Esri</a>',
      },
    ).addTo(map);

    // 🔹 Labels overlay (cities, towns, boundaries)
    L.tileLayer(
      "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      {
        maxZoom: 18,
        pane: "overlayPane",
        attribution:
          'Labels © <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
      },
    ).addTo(map);

    // IMPORTANT: ensure DOM + Leaflet are ready
    requestAnimationFrame(() => {
      map.invalidateSize();
    });

    /* GPS (SAFE setView) */
    navigator.geolocation?.getCurrentPosition(
      ({ coords }) => {
        if (!mapRef.current) return;

        const { latitude, longitude, accuracy } = coords;

        // CRITICAL FIX: wait one animation frame
        requestAnimationFrame(() => {
          if (!mapRef.current) return;

          if (!selectedPincodeId) {
            mapRef.current.setView([latitude, longitude], 17);
          }

          const dot = L.marker([latitude, longitude], {
            icon: L.divIcon({
              html: `<div class="user-location-dot"></div>`,
              iconSize: [16, 16],
              iconAnchor: [8, 8],
            }),
            interactive: false,
          });

          const circle = L.circle([latitude, longitude], {
            radius: accuracy,
            color: "#4285F4",
            fillColor: "#4285F4",
            fillOpacity: 0.12,
            weight: 1,
            interactive: false,
          });

          L.layerGroup([circle, dot]).addTo(mapRef.current);
        });
      },
      () => toast.error("Location permission denied"),
    );

    /* DRAW EVENT */
    map.on("pm:create", (e) => {
      if (polygonRef.current) {
        mapRef.current.removeLayer(polygonRef.current);
        polygonRef.current = null;
        setGeoJson(null);
      }

      polygonRef.current = e.layer;
      processPolygon(e.layer);

      map.pm.disableDraw("Polygon");
      setIsDrawing(false);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  /* START DRAW */
  const startDrawing = () => {
    if (!mapRef.current) return;

    setIsDrawing(true);

    mapRef.current.pm.enableDraw("Polygon", {
      snappable: true,
      snapDistance: 20,
      allowSelfIntersection: false,

      templineStyle: {
        color: "#ffffff",
        weight: 2,
        dashArray: "5,5",
      },
      hintlineStyle: {
        color: "#ffffff",
        dashArray: "5,5",
      },
      pathOptions: {
        color: "#ffffff",
        fillColor: "#3b82f6",
        fillOpacity: 0.5,
      },
    });
  };

  /* RESET POLYGON */
  const resetPolygon = () => {
    if (polygonRef.current && mapRef.current) {
      mapRef.current.removeLayer(polygonRef.current);
      polygonRef.current = null;
      setGeoJson(null);
      setArea(null);
      setLat("");
      setLng("");
    }
  };

  /* PROCESS POLYGON */
  function processPolygon(layer) {
    if (!layer) return;

    const rawLatLngs = layer.getLatLngs();
    if (!rawLatLngs || !rawLatLngs.length) return;

    // Normalize structure (Polygon / Edit mode safe)
    const latlngs = Array.isArray(rawLatLngs[0]) ? rawLatLngs[0] : rawLatLngs;

    // 🔒 Filter invalid points (THIS FIXES THE ERROR)
    const validLatLngs = latlngs.filter(
      (p) => p && typeof p.lat === "number" && typeof p.lng === "number",
    );

    // Polygon must have at least 3 valid points
    if (validLatLngs.length < 3) return;

    const coords = validLatLngs.map((p) => [p.lng, p.lat]);
    coords.push(coords[0]); // close polygon

    const feature = {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [coords],
      },
    };

    const areaHa = turf.area(feature) / 10000;
    const [centerLng, centerLat] = turf.center(feature).geometry.coordinates;

    if (areaHa > 10) {
      toast.error("Please add farm upto 10 Ha only");
      setGeoJson(feature);

      setArea(null);
    } else {
      setGeoJson(feature);
      setArea(Number(areaHa.toFixed(2)));
      setLat(centerLat.toFixed(6));
      setLng(centerLng.toFixed(6));
    }
  }

  // Cancel
  const handleCancel = () => {
    resetPolygon();
    setFarmName("");
    setSelectedPincodeId("");
  };

  /* SUBMIT */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (!farmName || !selectedPincodeId || !geoJson) {
      toast.error("Please draw farm boundary and fill all fields");
      return;
    }

    const points = geoJson.geometry.coordinates[0];

    const cleanedPoints =
      points.length > 1 &&
      points[0][0] === points[points.length - 1][0] &&
      points[0][1] === points[points.length - 1][1]
        ? points.slice(0, -1)
        : points;

    try {
      await axios.post(
        `${domain}/farms/add-farm`,
        {
          user_id: user.id,
          farm_name: farmName,
          pincode_id: selectedPincodeId,
          area_hectares: area,
          farm_coordinates: cleanedPoints,
        },
        { withCredentials: true },
      );

      toast.success("Farm added successfully");
      handleCancel();
      onAddFarm?.();
    } catch {
      toast.error("Failed to add farm");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <AppLoader />;
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="md:p-6 px-2 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/app/dashboard")}
          className="p-2 rounded-full border cursor-pointer border-gray-200 bg-white hover:bg-gray-100 transition"
        >
          <ArrowLeft className="w-4 h-4 text-gray-700" />
        </button>
        <h2 className="text-xl font-semibold text-gray-800">Farm</h2>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* LEFT → FORM */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 space-y-4 rounded-xl border border-gray-200 shadow-sm"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Farm Name
            </label>
            <input
              value={farmName}
              onChange={(e) => setFarmName(e.target.value)}
              className="mt-1 w-full p-2 rounded-lg border border-gray-300 
              text-gray-800 focus:ring-2 focus:ring-blue-200 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Pincode
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                placeholder="Enter pincode"
                value={pincodeSearch}
                onChange={(e) => setPincodeSearch(e.target.value)}
                className="border px-3 py-2 rounded w-full text-black"
              />

              <button
                type="button"
                onClick={handlePincodeSearch}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Search
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Latitude
              </label>
              <input
                value={lat}
                readOnly
                className="mt-1 w-full p-2 rounded-lg border border-gray-300 text-gray-800 focus:ring-2 focus:ring-blue-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Longitude
              </label>
              <input
                value={lng}
                readOnly
                className="mt-1 w-full p-2 rounded-lg border border-gray-300 text-gray-800 focus:ring-2 focus:ring-blue-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Area (Ha)
              </label>
              <input
                value={area ? `${area} ha` : ""}
                readOnly
                className="mt-1 w-full p-2 rounded-lg border border-gray-300 text-gray-800 focus:ring-2 focus:ring-blue-200 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="py-2.5 rounded-lg text-sm font-semibold cursor-pointer bg-green-500 hover:bg-green-600 text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0c1515] transition">
              Save Farm
            </button>
            <button
              onClick={handleCancel}
              className="py-2.5 rounded-lg text-sm cursor-pointer font-medium bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition"
            >
              Cancel
            </button>
          </div>
          <div
            className="text-xs 
             bg-black/70 text-white 
             px-3 py-2 rounded-lg shadow-lg"
            style={{ zIndex: 9999 }}
          >
            <p className="font-semibold mb-1">📍 How to draw your farm</p>
            <div className="grid grid-cols-2 gap-4">
              <ul className="list-disc list-inside space-y-0.5 text-white/90">
                <li>Click on the map to add boundary points</li>
                <li>Cover only your actual farm area</li>
              </ul>
              <ul className="list-disc list-inside space-y-0.5 text-white/90">
                <li>Join last point to first to finish</li>
                <li>Use Reset if you make a mistake</li>
              </ul>
            </div>
          </div>
        </form>

        {/* RIGHT → MAP */}
        <div className="relative rounded-xl h-[420px]">
          {/* Floating Map Controls */}
          <div
            className="absolute top-4 right-4 flex flex-col gap-2"
            style={{ zIndex: 9999 }}
          >
            <button
              type="button"
              onClick={startDrawing}
              disabled={isDrawing}
              className=" w-11 h-11 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed"
              title="Draw Boundary"
            >
              <Pencil className="w-5 h-5" />
            </button>

            {geoJson && (
              <button
                type="button"
                onClick={resetPolygon}
                className="w-11 h-11 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-300 hover:bg-red-50 shadow-sm flex items-center justify-center transition"
                title="Reset Boundary"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Map */}
          <div id="farm-map" className="w-full h-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
