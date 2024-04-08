import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
	if (!req.query.id) {
		return res.status(400).json({ status: "error", message: "id is required" });
	}

	try {
		/**
		 * Make prisma call to fetch jobs by queueId
		 *
		 */
		const queue = await prisma.queue.findFirst({
			where: {
				id: req.query.id,
			},
		});


		/**
		 * return response
		 */
		return res.status(200).json({
			status: "success",
			message: { ...queue },
		});
	} catch (error) {
		return res.status(500).json({ status: "error", message: error.message });
	}
}
