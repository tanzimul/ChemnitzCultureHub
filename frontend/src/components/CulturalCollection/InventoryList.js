import { useEffect, useState } from "react";
import api from "@/utils/api";

export default function InventoryList({ onLoaded }) {
	const [inventory, setInventory] = useState([]);

	useEffect(() => {
		api.get("/users/me").then((res) => {
			const inv = res.data.inventory || [];
			console.log("User inventory:", inv);
			setInventory(inv);
			if (onLoaded) onLoaded(inv);
		});
	}, [onLoaded]);

	return (
		<div>
			<h2 className="text-xl font-semibold mt-6 mb-4">My Inventory</h2>
			<div
				className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
				style={{ maxHeight: "350px", overflowY: "auto" }}
			>
				{inventory.map((item, idx) => (
					<div
						key={
							item.site._id ? `${item.site._id}-${item.caughtAt || idx}` : idx
						}
						className="bg-white rounded-xl shadow-md border border-gray-100 p-4 flex flex-col gap-2 hover:shadow-lg transition"
					>
						<div className="font-bold text-lg text-primary-700">
							{item.site.name}
						</div>
						<div className="text-sm text-gray-600">
							Category:{" "}
							<span className="font-medium">{item.site.category}</span>
						</div>
						<div className="text-sm">
							Count: <span className="font-semibold">{item.count}</span>
						</div>
						<div className="text-xs text-gray-400">
							Caught: {new Date(item.caughtAt).toLocaleDateString()}
						</div>
						<div className="text-xs text-gray-500">
							Traded:{" "}
							<span className="font-semibold">
								{item.tradeHistory?.length || 0}
							</span>{" "}
							times
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
