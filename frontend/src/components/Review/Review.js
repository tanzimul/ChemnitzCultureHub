import { useState } from "react";
import toast from "react-hot-toast";
import api from "@/utils/api";

export default function ReviewForm({ site, onReviewSubmitted }) {
	const [rating, setRating] = useState(5);
	const [comment, setComment] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			await api.post("/reviews", { site: site._id, rating, comment });
			toast.success("Review submitted!");
			setComment("");
			setRating(5);
			onReviewSubmitted && onReviewSubmitted();
		} catch (err) {
			toast.error(err.response?.data?.message || "Failed to submit review");
		} finally {
			setLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-2">
			<div>
				<label className="block text-sm font-medium mb-1">Rating</label>
				<select
					className="w-full border rounded px-2 py-1 text-sm"
					value={rating}
					onChange={(e) => setRating(Number(e.target.value))}
					required
				>
					{[5, 4, 3, 2, 1].map((n) => (
						<option key={n} value={n}>
							{n} Star{n > 1 ? "s" : ""}
						</option>
					))}
				</select>
			</div>
			<div>
				<label className="block text-sm font-medium mb-1">Comment</label>
				<textarea
					className="w-full border rounded px-2 py-1 text-sm"
					value={comment}
					onChange={(e) => setComment(e.target.value)}
					required
					rows={2}
				/>
			</div>
			<div className="flex justify-end">
				<button
					type="submit"
					className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm"
					disabled={loading}
				>
					{loading ? "Submitting..." : "Submit"}
				</button>
			</div>
		</form>
	);
}
