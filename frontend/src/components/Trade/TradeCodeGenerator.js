import React, { useState } from "react";
import api from "@/utils/api";
import toast from "react-hot-toast";

export default function TradeCodeGenerator() {
	const [code, setCode] = useState("");
	const [expiresAt, setExpiresAt] = useState("");
	const [loading, setLoading] = useState(false);

	const generateCode = async () => {
		if (loading) return;
		setLoading(true);
		try {
			const res = await api.post("/trade-codes/generate");
			setCode(res.data.code);
			setExpiresAt(res.data.expiresAt);
			navigator.clipboard.writeText(res.data.code);
			toast.success("Trade code copied to clipboard!");
		} catch {
			toast.error("Failed to generate trade code.");
		}
		setLoading(false);
	};

	return (
		<div
			onClick={generateCode}
			className={`cursor-pointer flex flex-col gap-2 p-4  transition ${
				loading ? "opacity-60 pointer-events-none" : ""
			}`}
			title="Click to generate and copy your trade code"
		>
			<div className="flex items-center gap-2">
				<svg
					className="h-7 w-7 text-green-600"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M16 18l6-6-6-6M8 6l-6 6 6 6"
					/>
				</svg>
				<div>
					<div className="font-semibold text-green-700">
						Generate Trade Code
					</div>
					<div className="text-xs text-green-500">
						{loading
							? "Generating..."
							: "Click to generate & copy your trade code"}
					</div>
				</div>
			</div>
			{code && (
				<div className="mt-2 text-sm">
					Your Trade Code: <span className="font-mono">{code}</span>
					<br />
					<small>Valid until: {new Date(expiresAt).toLocaleString()}</small>
				</div>
			)}
		</div>
	);
}
