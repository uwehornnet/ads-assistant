import { inngest } from "@/inngest/client";

export default async function handler(req, res) {
	const id = req.query.id;

	if (!id) {
		return res.status(400).json({ status: "error", message: "Missing id parameter" });
	}

	try {
		await inngest.send({
			name: "api/create.ad",
			data: { id },
		});
	} catch (error) {
		return res.status(500).json({ status: "error", message: error.message });
	}
}
