import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
	if (!req.query.id) {
		return res.status(400).json({ status: "error", message: "id is required" });
	}

	try {
		/**
		 * Make prisma call to delete jobs by queueId
		 */
		const deleteJobs = prisma.job.deleteMany({
			where: {
				queueId: req.query.id,
			},
		});

		/**
		 * Make prisma call to fetch jobs by queueId
		 *
		 */
		const deleteQueue = prisma.queue.delete({
			where: {
				uid: req.query.id,
			},
		});

		const transaction = await prisma.$transaction([deleteJobs, deleteQueue]);
		/**
		 * return response
		 */
		return res.status(200).json({
			status: "success",
			message: { transaction },
		});
	} catch (error) {
		return res.status(500).json({ status: "error", message: error.message });
	}
}
