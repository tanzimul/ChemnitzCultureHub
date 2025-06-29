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

	return (
		<>
			{error && <div style={{ color: "red", margin: "1em 0" }}>{error}</div>}
			<MapContainer
				center={[50.83, 12.92]}
				zoom={13}
				style={{ height: "700px", width: "100%" }}
			>
				<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
				{Array.isArray(sites) &&
					sites.map((site) =>
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
										{/* Show all properties except @id, @geometry, name, phone, website */}
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
										{/* Add to Favorites Button */}
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
