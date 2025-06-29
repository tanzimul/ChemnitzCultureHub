import { useEffect, useState } from "react";
import {
	MapContainer,
	TileLayer,
	Marker,
	Popup,
	CircleMarker,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
//import API_BASE_URL from "@/utils/api";
import api from "@/utils/api";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl:
		"https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
	iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
	shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const userIcon = new L.Icon({
	iconUrl: "/user-location.png", // This will resolve to http://localhost:3000/user-location.png in dev
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
	shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
	shadowSize: [41, 41],
});

function getCategory(props) {
	return (
		props.category ||
		props.Category ||
		props.tourism ||
		props.amenity ||
		props.artwork_type ||
		props.museum ||
		props.gallery ||
		props.theatre ||
		"Uncategorized"
	);
}

export default function CulturalMap({
	token,
	categoryFilter,
	keyword,
	onAddFavorite,
	userLocation,
}) {
	const [sites, setSites] = useState([]);
	const [error, setError] = useState("");

	useEffect(() => {
		if (!token) {
			setError("No token provided. Please log in.");
			setSites([]);
			return;
		}
		const fetchSites = async () => {
			try {
				const res = await api.get("/cultural-sites");
				const data = res.data;
				if (Array.isArray(data)) {
					setSites(data);
					setError("");
				} else {
					setSites([]);
					setError("Unexpected response from server.");
				}
			} catch (err) {
				setSites([]);
				setError("Network error.");
			}
		};
		fetchSites();
	}, [token]);

	const filteredSites = sites.filter((site) => {
		if (!site || !site.name) return false;

		const category = getCategory(site.properties || site);
		const categoryMatch =
			!categoryFilter ||
			category.toLowerCase() === categoryFilter.toLowerCase();

		const keywordMatch =
			!keyword ||
			site.name.toLowerCase().includes(keyword.toLowerCase()) ||
			(site.properties?.address &&
				site.properties.address
					.toLowerCase()
					.includes(keyword.toLowerCase())) ||
			(site.description &&
				site.description.toLowerCase().includes(keyword.toLowerCase()));

		return categoryMatch && keywordMatch;
	});

	return (
		<>
			{error && <div style={{ color: "red", margin: "1em 0" }}>{error}</div>}
			<MapContainer
				center={[50.83, 12.92]}
				zoom={13}
				style={{ height: "700px", width: "100%" }}
			>
				<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
				{/* All cultural site markers */}
				{Array.isArray(filteredSites) &&
					filteredSites.map((site) =>
						site.location &&
						Array.isArray(site.location.coordinates) &&
						site.location.coordinates.length === 2 ? (
							<Marker
								key={site._id}
								position={site.location.coordinates.slice().reverse()}
							>
								<Popup>
									<div>
										<em>{site._id}</em>
										<br />
										<strong>{site.name}</strong>
										<br />
										<em>{site.category}</em>
										<br />
										{site.properties?.address && (
											<div>📍 {site.properties.address}</div>
										)}
										{site.properties?.website && (
											<div>
												🔗{" "}
												<a
													href={site.properties.website}
													target="_blank"
													rel="noopener noreferrer"
												>
													Website
												</a>
											</div>
										)}
										{site.properties?.phone && (
											<div>📞 {site.properties.phone}</div>
										)}
										<div>{site.description}</div>
										<div style={{ marginTop: "0.5em" }}>
											{site.properties &&
												Object.entries(site.properties)
													.filter(
														([key]) =>
															key !== "@id" &&
															key !== "@geometry" &&
															key !== "name" &&
															key !== "phone" &&
															key !== "website"
													)
													.map(([key, value]) => (
														<div key={key}>
															<strong>{key}:</strong> {String(value)}
														</div>
													))}
										</div>
										{onAddFavorite && (
											<button
												style={{
													marginTop: "1em",
													background: "#22c55e",
													color: "white",
													padding: "0.5em 1em",
													borderRadius: "4px",
													border: "none",
													cursor: "pointer",
												}}
												onClick={() => onAddFavorite(site)}
											>
												Add to Favorites
											</button>
										)}
									</div>
								</Popup>
							</Marker>
						) : null
					)}

				{/* User's current location marker (distinct color/icon) */}
				{userLocation &&
					Array.isArray(userLocation.coordinates) &&
					userLocation.coordinates.length === 2 &&
					typeof userLocation.coordinates[0] === "number" &&
					typeof userLocation.coordinates[1] === "number" && (
						<Marker
							position={[
								userLocation.coordinates[1], // latitude
								userLocation.coordinates[0], // longitude
							]}
							icon={userIcon}
						>
							<Popup>Your Saved Location</Popup>
						</Marker>
					)}
			</MapContainer>
		</>
	);
}
