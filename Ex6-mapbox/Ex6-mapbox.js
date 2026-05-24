const SEARCH_COUNTRY = "vn";

const state = {
  suggestions: [],
  activeIndex: -1,
  selectedPlace: null,
  debounceTimer: null,
  sessionToken: createSessionToken(),
  map: null,
  marker: null
};

const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const suggestionList = document.getElementById("suggestionList");
const clearSearchBtn = document.getElementById("clearSearchBtn");
const resultPanel = document.getElementById("resultPanel");
const resultList = document.getElementById("resultList");
const closeResultPanelBtn = document.getElementById("closeResultPanelBtn");

const infoCard = document.getElementById("infoCard");
const closeInfoBtn = document.getElementById("closeInfoBtn");
const placeName = document.getElementById("placeName");
const placeAddress = document.getElementById("placeAddress");
const placeCoords = document.getElementById("placeCoords");

document.addEventListener("DOMContentLoaded", initApp);

function initApp() {
  initMapboxMap();
  bindEvents();
  clearSearch(false);
}

function initMapboxMap() {
  if (!MAPBOX_TOKEN || MAPBOX_TOKEN === "YOUR_MAPBOX_PUBLIC_TOKEN") {
    throw new Error("Missing Mapbox public token.");
  }

  if (typeof mapboxgl === "undefined") {
    throw new Error("Mapbox GL JS is not loaded.");
  }

  mapboxgl.accessToken = MAPBOX_TOKEN;

  state.map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v12",
    center: [106.6297, 10.8231],
    zoom: 11
  });

  state.map.addControl(new mapboxgl.NavigationControl(), "top-right");

  state.map.on("click", async (event) => {
    try {
      const place = await fetchMapboxReversePlace(event.lngLat.lng, event.lngLat.lat);
      selectPlace(place);
    } catch (error) {
      console.error("Reverse lookup failed:", error);

      const fallbackPlace = {
        id: `dropped-pin-${Date.now()}`,
        name: "Dropped pin",
        address: "No address found for this location.",
        lng: event.lngLat.lng,
        lat: event.lngLat.lat,
        featureType: "point"
      };

      selectPlace(fallbackPlace);
    }
  });
}

function bindEvents() {
  searchInput.addEventListener("input", handleSearchInput);
  searchInput.addEventListener("keydown", handleSearchKeydown);

  searchForm.addEventListener("submit", handleSearchSubmit);
  clearSearchBtn.addEventListener("click", () => clearSearch(true));
  closeResultPanelBtn.addEventListener("click", hideResultPanel);

  closeInfoBtn.addEventListener("click", () => {
    infoCard.classList.add("hidden");
  });

  document.addEventListener("click", (event) => {
    const isInsideSearch = event.target.closest(".search-panel");
    if (!isInsideSearch) {
      hideSuggestions();
    }
  });
}

function handleSearchInput() {
  const query = searchInput.value.trim();
  state.activeIndex = -1;

  if (query.length < 3) {
    state.suggestions = [];
    hideSuggestions();
    hideResultPanel();
    return;
  }

  debounce(async () => {
    try {
      const suggestions = await fetchMapboxSuggestions(query);
      state.suggestions = suggestions;
      renderSuggestions(suggestions);
      hideResultPanel();
    } catch (error) {
      console.error(error);
      hideSuggestions();
      hideResultPanel();
    }
  }, 250);
}

function handleSearchKeydown(event) {
  if (state.suggestions.length === 0) return;

  if (event.key === "ArrowDown") {
    event.preventDefault();
    const nextIndex =
      state.activeIndex < state.suggestions.length - 1
        ? state.activeIndex + 1
        : 0;
    setActiveSuggestion(nextIndex);
    return;
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();
    const nextIndex =
      state.activeIndex > 0
        ? state.activeIndex - 1
        : state.suggestions.length - 1;
    setActiveSuggestion(nextIndex);
    return;
  }

  if (event.key === "Enter") {
    event.preventDefault();

    if (state.activeIndex >= 0) {
      selectSuggestion(state.activeIndex);
    } else {
      showResultPanel(state.suggestions);
    }

    return;
  }

  if (event.key === "Escape") {
    hideSuggestions();
  }
}

function handleSearchSubmit(event) {
  event.preventDefault();
  if (state.suggestions.length === 0) return;

  if (state.activeIndex >= 0) {
    selectSuggestion(state.activeIndex);
  } else {
    showResultPanel(state.suggestions);
  }
}

function debounce(callback, delay) {
  clearTimeout(state.debounceTimer);
  state.debounceTimer = setTimeout(callback, delay);
}

async function fetchMapboxSuggestions(query) {
  const url = new URL("https://api.mapbox.com/search/searchbox/v1/suggest");
  url.searchParams.set("q", query);
  url.searchParams.set("access_token", MAPBOX_TOKEN);
  url.searchParams.set("session_token", state.sessionToken);
  url.searchParams.set("limit", "5");
  url.searchParams.set("language", "vi");

  if (SEARCH_COUNTRY) {
    url.searchParams.set("country", SEARCH_COUNTRY);
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Cannot fetch Mapbox suggestions.");
  }

  const data = await response.json();
  return data.suggestions || [];
}

function renderSuggestions(suggestions) {
  suggestionList.innerHTML = "";

  if (suggestions.length === 0) {
    hideSuggestions();
    return;
  }

  suggestions.forEach((place, index) => {
    const item = document.createElement("li");
    item.className = "suggestion-item";
    item.setAttribute("role", "option");
    item.setAttribute("aria-selected", "false");
    item.dataset.index = String(index);

    const placeNameText = place.name || "Unknown place";
    const placeAddressText = place.address || place.address_line1 || place.full_address || "";

    item.innerHTML = `
      <span class="suggestion-name">${escapeHTML(placeNameText)}</span>
      <span class="suggestion-address">${escapeHTML(placeAddressText)}</span>
    `;

    item.addEventListener("click", () => {
      selectSuggestion(index);
    });

    suggestionList.appendChild(item);
  });

  suggestionList.classList.add("show");
}

function hideSuggestions() {
  suggestionList.innerHTML = "";
  suggestionList.classList.remove("show");
  state.activeIndex = -1;
}

function renderResultPanel(suggestions) {
  resultList.innerHTML = "";

  suggestions.forEach((place, index) => {
    const item = document.createElement("li");
    item.className = "result-item";
    item.dataset.index = String(index);

    const placeNameText = place.name || "Unknown place";
    const placeAddressText = place.address || place.address_line1 || place.full_address || "";

    item.innerHTML = `
      <span class="suggestion-name">${escapeHTML(placeNameText)}</span>
      <span class="suggestion-address">${escapeHTML(placeAddressText)}</span>
    `;

    item.addEventListener("click", () => {
      selectSuggestion(index);
    });

    resultList.appendChild(item);
  });
}

function showResultPanel(suggestions) {
  if (!suggestions || suggestions.length === 0) {
    hideResultPanel();
    return;
  }

  renderResultPanel(suggestions.slice(0, 5));
  resultPanel.classList.remove("hidden");
  hideSuggestions();
}

function hideResultPanel() {
  resultList.innerHTML = "";
  resultPanel.classList.add("hidden");
}

function setActiveSuggestion(index) {
  state.activeIndex = index;

  const items = Array.from(suggestionList.querySelectorAll(".suggestion-item"));
  items.forEach((item) => {
    item.classList.remove("active");
    item.setAttribute("aria-selected", "false");
  });

  const activeItem = items[index];
  if (activeItem) {
    activeItem.classList.add("active");
    activeItem.setAttribute("aria-selected", "true");
  }
}

function selectSuggestion(index) {
  const suggestion = state.suggestions[index];
  if (!suggestion) return;

  retrieveMapboxSuggestion(suggestion).catch((error) => {
    console.error(error);
  });
}

function selectPlace(place) {
  state.selectedPlace = place;
  searchInput.value = place.name || "";
  updateMarker(place);
  updateInfoCard(place);
  hideSuggestions();
  hideResultPanel();
}

function updateMarker(place) {
  if (!place) {
    if (state.marker) {
      state.marker.remove();
      state.marker = null;
    }

    return;
  }

  if (!state.map || typeof mapboxgl === "undefined") return;

  if (state.marker) {
    state.marker.remove();
  }

  state.marker = new mapboxgl.Marker()
    .setLngLat([place.lng, place.lat])
    .addTo(state.map);

  state.map.flyTo({
    center: [place.lng, place.lat],
    zoom: 15,
    essential: true
  });
}

function updateInfoCard(place) {
  if (!place) {
    placeName.textContent = "Selected place";
    placeAddress.textContent = "Address will appear here.";
    placeCoords.textContent = "Coordinates will appear here.";
    infoCard.classList.add("hidden");
    return;
  }

  placeName.textContent = place.name || "Unknown place";

  const rows = [];
  if (place.address) {
    rows.push({ label: "Address", value: place.address, isCode: false });
  }
  if (place.featureType) {
    rows.push({ label: "Type", value: toTitleCase(place.featureType), isCode: false });
  }
  if (place.placeFormatted && place.placeFormatted !== place.address) {
    rows.push({ label: "Area", value: place.placeFormatted, isCode: false });
  }
  if (place.categories && place.categories.length > 0) {
    rows.push({ label: "Category", value: place.categories.slice(0, 3).join(", "), isCode: false });
  }
  if (place.accuracy) {
    rows.push({ label: "Accuracy", value: place.accuracy, isCode: false });
  }

  
  if (place.contextText) {
    rows.push({ label: "Context", value: place.contextText, isCode: false });
  }

  if (rows.length === 0) {
    placeAddress.innerHTML = '<div class="info-row"><span class="info-key">Info</span><span class="info-value">No additional details available.</span></div>';
  } else {
    placeAddress.innerHTML = rows
      .map((row) => {
        const valueClass = row.isCode ? "info-value info-code" : "info-value";
        return `
          <div class="info-row">
            <span class="info-key">${escapeHTML(row.label)}</span>
            <span class="${valueClass}">${escapeHTML(row.value)}</span>
          </div>
        `;
      })
      .join("");
  }

  if (typeof place.lng === "number" && typeof place.lat === "number") {
    placeCoords.textContent = `Lng: ${place.lng.toFixed(4)}, Lat: ${place.lat.toFixed(4)}`;
  } else {
    placeCoords.textContent = "Coordinates unavailable.";
  }

  infoCard.classList.remove("hidden");
}

function clearSearch(shouldResetCard = true) {
  searchInput.value = "";
  searchInput.setAttribute("placeholder", "Search a place...");
  state.suggestions = [];
  state.activeIndex = -1;
  hideSuggestions();
  hideResultPanel();

  if (shouldResetCard) {
    state.selectedPlace = null;
    updateMarker(null);
    updateInfoCard(null);
  }
}

async function retrieveMapboxSuggestion(suggestion) {
  const mapboxId = suggestion.mapbox_id || suggestion.id;

  const url = new URL("https://api.mapbox.com/search/searchbox/v1/retrieve/" + encodeURIComponent(mapboxId));
  url.searchParams.set("access_token", MAPBOX_TOKEN);
  url.searchParams.set("session_token", state.sessionToken);
  url.searchParams.set("language", "vi");

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Cannot retrieve Mapbox place details.");
  }

  const data = await response.json();
  const feature = data.features && data.features[0];

  if (!feature) {
    throw new Error("No feature returned from Mapbox retrieve.");
  }

  const place = mapFeatureToPlace(feature, {
    id: mapboxId,
    name: suggestion.name || "Selected place",
    address: suggestion.full_address || ""
  });

  selectPlace(place);
}

async function fetchMapboxReversePlace(lng, lat) {
  const url = new URL("https://api.mapbox.com/search/searchbox/v1/reverse");
  url.searchParams.set("access_token", MAPBOX_TOKEN);
  url.searchParams.set("longitude", String(lng));
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("language", "vi");

  if (SEARCH_COUNTRY) {
    url.searchParams.set("country", SEARCH_COUNTRY);
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Cannot reverse lookup this location.");
  }

  const data = await response.json();
  const feature = data.features && data.features[0];
  if (!feature) {
    throw new Error("No feature returned from reverse endpoint.");
  }

  return mapFeatureToPlace(feature, {
    name: "Selected location",
    address: ""
  });
}

function mapFeatureToPlace(feature, fallback = {}) {
  const props = feature.properties || {};
  const [lng, lat] = feature.geometry.coordinates;

  const categories = Array.isArray(props.poi_category)
    ? props.poi_category
    : [];

  return {
    id: props.mapbox_id || fallback.id || `place-${Date.now()}`,
    name: props.name || props.name_preferred || fallback.name || "Selected place",
    address:
      props.full_address ||
      props.address ||
      fallback.address ||
      "No address available",
    lng,
    lat,
    featureType: props.feature_type || "",
    placeFormatted: props.place_formatted || "",
    categories,
    accuracy: (props.coordinates && props.coordinates.accuracy) || "",
    contextText: formatContext(props.context)
  };
}

function formatContext(context) {
  if (!context || typeof context !== "object") return "";

  const orderedKeys = [
    "address",
    "street",
    "neighborhood",
    "locality",
    "place",
    "district",
    "region",
    "country",
    "postcode"
  ];

  const values = [];
  for (const key of orderedKeys) {
    const node = context[key];
    if (!node) continue;

    const name = node.name || node.text || "";
    if (name) values.push(name);
  }

  return values.slice(0, 4).join(", ");
}

function toTitleCase(value) {
  return String(value)
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function createSessionToken() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `session_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}
