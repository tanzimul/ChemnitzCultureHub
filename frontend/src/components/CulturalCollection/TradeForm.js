import { useState } from "react";
import api from "@/utils/api";

export default function TradeForm({ inventory }) {
	const [toUserId, setToUserId] = useState("");
	const [siteId, setSiteId] = useState("");

	const handleTrade = async (e) => {
		e.preventDefault();
		try {
			console.log("Trading siteId:", siteId);
			await api.post("/users/trade-site", { toUserId, siteId });
			alert("Trade complete!");
		} catch (err) {
			alert(
				err.response?.data?.message ||
					"Trade failed. Please check the recipient User ID and your inventory."
			);
		}
	};

	return (
		<div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 my-6">
			<h3 className="text-lg font-semibold mb-4 text-primary-700">
				Trade a Site
			</h3>
			<form
				onSubmit={handleTrade}
				className="flex flex-col md:flex-row md:items-end gap-3"
			>
				<div className="flex-1">
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Recipient User ID
					</label>
					<input
						type="text"
						placeholder="Recipient User ID"
						value={toUserId}
						onChange={(e) => setToUserId(e.target.value)}
						className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
						required
					/>
				</div>
				<div className="flex-1">
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Select Site
					</label>
					<select
						value={siteId}
						onChange={(e) => setSiteId(e.target.value)}
						className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
						required
					>
						<option value="">Select Site</option>
						{inventory
							.filter((item) => item.count > 0)
							.map((item, idx) => (
								<option
									key={
										item.site._id
											? `${item.site._id}-${item.caughtAt || idx}`
											: idx
									}
									value={item.site._id}
								>
									{item.site.name} (x{item.count})
								</option>
							))}
					</select>
				</div>
				<button
					type="submit"
					className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition mt-2 md:mt-0"
				>
					Trade
				</button>
			</form>
		</div>
	);
}
