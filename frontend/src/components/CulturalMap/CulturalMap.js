import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import API_BASE_URL from "@/utils/api";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl:
		"https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
	iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
	shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
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
}) {
	const [sites, setSites] = useState([]);
	const [error, setError] = useState("");

	useEffect(() => {
		if (!token) {
			setError("No token provided. Please log in.");
			setSites([]);
			return;
		}
		fetch("http://localhost:9000/api/cultural-sites", {
			headers: { Authorization: `Bearer ${token}` },
		})
			.then(async (res) => {
				if (!res.ok) {
					setError("Unauthorized or failed to fetch sites.");
					setSites([]);
					return;
				}
				const data = await res.json();
				if (Array.isArray(data)) {
					setSites(data);
					setError("");
				} else {
					setSites([]);
					setError("Unexpected response from server.");
				}
			})
			.catch(() => {
				setSites([]);
				setError("Network error.");
			});
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
									{/* ...existing popup code... */}
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
			</MapContainer>
		</>
	);
}
