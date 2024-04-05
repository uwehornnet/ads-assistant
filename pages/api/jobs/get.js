import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
	try {
		/**
		 * Make prisma call to fetch jobs by queueId
		 *
		 */

		const size = 20;
		const pageNumber = req.query.page ? Number(req.query.page) : 0;
		const search = req.query.search ? req.query.search : null;

		const query = {
			where: {
				queueId: req.query.id,
			},
			skip: size * pageNumber,
			take: size,
		};

		if (search) {
			query.where.content = {
				contains: search,
			};
		}

		console.log({ query });

		const [jobs, count] = await prisma.$transaction([
			prisma.job.findMany(query),
			prisma.job.count({ where: query.where }),
		]);

		/**
		 * return response
		 */

		return res.status(200).json({
			status: "success",
			message: {
				pagination: {
					total: count,
					pages: Math.ceil(count / size),
				},
				data: jobs.map((job) => {
					return {
						id: job.id,
						content: JSON.parse(job.content),
						createdAt: new Date(job.createdAt).toString(),
					};
				}),
			},
		});
	} catch (error) {
		return res.status(500).json({ status: "error", message: error.message });
	}
}
