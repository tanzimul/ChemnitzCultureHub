import { useState, useEffect, useCallback } from "react";
import api from "@/utils/api";
import SampleItem from "./SampleItem";

export default function SampleList({ userSamples = false }) {
	const [samples, setSamples] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [filters, setFilters] = useState({
		search: "",
		category: "",
		page: 1,
	});
	const [pagination, setPagination] = useState({});

	// const fetchSamples = useCallback(async () => {
	// 	try {
	// 		setLoading(true);
	// 		const endpoint = userSamples ? "/samples/my" : "/samples";
	// 		const params = userSamples
	// 			? {}
	// 			: {
	// 					search: filters.search,
	// 					category: filters.category,
	// 					page: filters.page,
	// 			  };

	// 		const response = await api.get(endpoint, { params });

	// 		if (userSamples) {
	// 			setSamples(response.data.samples);
	// 		} else {
	// 			setSamples(response.data.samples);
	// 			setPagination(response.data.pagination);
	// 		}
	// 	} catch (error) {
	// 		setError("Failed to fetch samples");
	// 	} finally {
	// 		setLoading(false);
	// 	}
	// };

	const fetchSamples = useCallback(async () => {
		try {
			setLoading(true);
			const endpoint = userSamples ? "/samples/my" : "/samples";
			const params = userSamples
				? {}
				: {
						search: filters.search,
						category: filters.category,
						page: filters.page,
				  };

			const response = await api.get(endpoint, { params });

			setSamples(response.data.samples);
			if (!userSamples) {
				setPagination(response.data.pagination);
			}
		} catch (error) {
			setError("Failed to fetch samples");
			console.error("Sample fetch failed:", error);
		} finally {
			setLoading(false);
		}
	}, [filters, userSamples]);

	// useEffect(() => {
	// 	fetchSamples();
	// }, [filters, userSamples]);

	useEffect(() => {
		fetchSamples();
	}, [fetchSamples]);

	const handleFilterChange = (e) => {
		setFilters({
			...filters,
			[e.target.name]: e.target.value,
			page: 1, // Reset to first page when filtering
		});
	};

	const handleDelete = (deletedId) => {
		setSamples(samples.filter((sample) => sample._id !== deletedId));
	};

	const categories = ["Culture", "History", "Art", "Music", "Food", "Other"];

	if (loading) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
			</div>
		);
	}

	return (
		<div className="max-w-6xl mx-auto">
			{!userSamples && (
				<div className="mb-6 bg-white p-4 rounded-lg shadow-md">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<label
								htmlFor="search"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Search
							</label>
							<input
								type="text"
								id="search"
								name="search"
								placeholder="Search samples..."
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
								value={filters.search}
								onChange={handleFilterChange}
							/>
						</div>

						<div>
							<label
								htmlFor="category"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Category
							</label>
							<select
								id="category"
								name="category"
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
								value={filters.category}
								onChange={handleFilterChange}
							>
								<option value="">All Categories</option>
								{categories.map((category) => (
									<option key={category} value={category}>
										{category}
									</option>
								))}
							</select>
						</div>

						<div className="flex items-end">
							<button
								onClick={() =>
									setFilters({ search: "", category: "", page: 1 })
								}
								className="w-full bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
							>
								Clear Filters
							</button>
						</div>
					</div>
				</div>
			)}

			{error && <div className="text-red-600 text-center mb-4">{error}</div>}

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{samples.map((sample) => (
					<SampleItem
						key={sample._id}
						sample={sample}
						onDelete={handleDelete}
						showActions={userSamples}
					/>
				))}
			</div>

			{samples.length === 0 && (
				<div className="text-center py-12">
					<p className="text-gray-500">
						{userSamples ? "No samples created yet." : "No samples found."}
					</p>
				</div>
			)}

			{!userSamples && pagination.pages > 1 && (
				<div className="flex justify-center mt-8 space-x-2">
					{Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
						(page) => (
							<button
								key={page}
								onClick={() => setFilters({ ...filters, page })}
								className={`px-3 py-2 rounded-md ${
									page === pagination.current
										? "bg-primary-600 text-white"
										: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
								}`}
							>
								{page}
							</button>
						)
					)}
				</div>
			)}
		</div>
	);
}
