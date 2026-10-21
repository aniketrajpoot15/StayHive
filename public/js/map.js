mapboxgl.accessToken = mapToken;

const coordinates = listing.geometry && listing.geometry.coordinates
    ? listing.geometry.coordinates
    : [78.9629, 20.5937]; // Default to India center if no coordinates

const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v12",
    center: coordinates,
    zoom: 9,
});

// Add zoom & rotation controls
map.addControl(new mapboxgl.NavigationControl());

// Custom marker
const marker = new mapboxgl.Marker({ color: "#fe424d" })
    .setLngLat(coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<h5>${listing.title}</h5><p>Exact location provided after booking</p>`
        )
    )
    .addTo(map);
