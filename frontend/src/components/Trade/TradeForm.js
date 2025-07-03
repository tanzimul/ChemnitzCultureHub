import React, { useState } from "react";
import toast from "react-hot-toast";
import api from "@/utils/api";

export default function TradeForm({ inventory }) {
	const [tradeCode, setTradeCode] = useState("");
	const [siteId, setSiteId] = useState("");
	const [loading, setLoading] = useState(false);

	const handleTrade = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			const res = await api.post("/users/trade-site", {
				tradeCode,
				siteId,
			});
			toast.success(res.data.message || "Trade successful!");
			setTradeCode("");
			setSiteId("");
		} catch (err) {
			toast.error(
				err.response?.data?.message || "Trade failed. Please try again."
			);
		}
		setLoading(false);
	};

	return (
		<form onSubmit={handleTrade} className="flex flex-col gap-2 mt-4">
			<select
				value={siteId}
				onChange={(e) => setSiteId(e.target.value)}
				className="border rounded px-2 py-1"
				required
			>
				<option value="">Select a site to trade</option>
				{inventory.map((item) => (
					<option key={item.site._id} value={item.site._id}>
						{item.site.name}
					</option>
				))}
			</select>
			<input
				type="text"
				placeholder="Enter recipient's Trade Code"
				value={tradeCode}
				onChange={(e) => setTradeCode(e.target.value)}
				className="border rounded px-2 py-1"
				required
			/>
			<button
				type="submit"
				disabled={loading}
				className="bg-blue-600 text-white rounded px-4 py-2 mt-2"
			>
				{loading ? "Trading..." : "Trade"}
			</button>
		</form>
	);
}
