import { useState } from "react";
import api from "@/utils/api";

export default function SampleItem({ sample, onDelete, showActions = false }) {
	const [loading, setLoading] = useState(false);

	const handleDelete = async () => {
		if (!confirm("Are you sure you want to delete this sample?")) return;

		try {
			setLoading(true);
			await api.delete(`/samples/${sample._id}`);
			onDelete(sample._id);
		} catch (error) {
			alert("Failed to delete sample");
			console.error("Delete sample error:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="bg-white rounded-lg shadow-md p-6">
			<div className="flex justify-between items-start mb-3">
				<div>
					<h3 className="text-lg font-semibold text-gray-900 mb-1">
						{sample.title}
					</h3>
					<span className="inline-block bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
						{sample.category}
					</span>
				</div>

				{showActions && (
					<div className="flex space-x-2">
						<button
							onClick={handleDelete}
							disabled={loading}
							className="text-red-500 hover:text-red-700 text-sm disabled:opacity-50"
						>
							{loading ? "Deleting..." : "Delete"}
						</button>
					</div>
				)}
			</div>

			<p className="text-gray-600 mb-3 line-clamp-3">{sample.description}</p>

			{sample.location && (
				<p className="text-sm text-gray-500 mb-3">📍 {sample.location}</p>
			)}

			<div className="flex justify-between items-center text-sm text-gray-500">
				<div>{sample.createdBy && <span>By {sample.createdBy.name}</span>}</div>
				<div>{new Date(sample.createdAt).toLocaleDateString()}</div>
			</div>

			<div className="mt-3 flex justify-between items-center">
				<span
					className={`text-xs px-2 py-1 rounded-full ${
						sample.isPublic
							? "bg-green-100 text-green-800"
							: "bg-yellow-100 text-yellow-800"
					}`}
				>
					{sample.isPublic ? "Public" : "Private"}
				</span>
			</div>
		</div>
	);
}
