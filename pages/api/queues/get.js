import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
	try {
		/**
		 * Make prisma call to fetch jobs by queueId
		 *
		 */
		const queues = await prisma.queue.findMany();
		const response = queues.map((queue) => {
			return {
				id: queue.id,
				uid: queue.uid,
				done: queue.done,
				createdAt: new Date(queue.createdAt).toString(),
			};
		});

		/**
		 * return response
		 */
		return res.status(200).json({ status: "success", message: response });
	} catch (error) {
		return res.status(500).json({ status: "error", message: error.message });
	}
}
