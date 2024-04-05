import OpenAI from "openai";
import prisma from "../../../lib/prisma";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY || process.env.REACT_APP_OPENAI_API_KEY,
});

const fetchAPIResponse = async ({ prompt }) => {
	const response = await openai.chat.completions.create({
		messages: [
			{
				role: "system",
				content: prompt,
			},
		],
		model: "gpt-3.5-turbo",
		temperature: 0.3,
	});

	return {
		message: response.choices[0].message,
		usage: response.usage.total_tokens,
	};
};

export default async function handler(req, res) {
	try {
		/**
		 * Make prisma call to fetch unfinished queue
		 * @return {Object} queue
		 */
		const queue = await prisma.queue.findFirst({
			where: {
				done: false,
			},
		});

		if (!queue) {
			return res.status(200).json({ status: "success", message: null });
		}

		/**
		 * if queue id is present, get keywords from job table filtered by queue id
		 */
		const jobs = await prisma.job.findMany({
			where: {
				queueId: queue.uid,
			},
		});

		const { keywords: allKeywords, headline, description, variations } = JSON.parse(queue.content);

		/**
		 * if keyword length == job length, update queue as done and return
		 */
		if (allKeywords.length === jobs.length) {
			const updatedQueue = await prisma.queue.update({
				where: {
					uid: queue.uid,
				},
				data: {
					done: true,
				},
			});
			return res.status(200).json({ status: "success", message: "All jobs are done" });
		}

		/**
		 * prepare response object
		 */

		const response = {
			token: 0,
			keywords: [],
		};

		/**
		 * prepare response object with keywords
		 */
		const keywords = [allKeywords[jobs.length]];
		for (const keyword of keywords) {
			response.keywords.push({
				keyword,
				headlines: [],
				descriptions: [],
			});
		}

		if (headline.state) {
			for (const keyword of keywords) {
				const prompt = `Act like you are an experienced Google ads professional. I want to create one Google ads for: ${keyword}. Generate 1 effective ad headline ideas with a maximum of ${headline.length} letters.`;
				const res = await fetchAPIResponse({ prompt });

				const headlineArray = res.message.content.split("\n").map((item) => {
					return item.replace(/[0-9]/g, "").replace(". ", "").replace('"', "").replace('"', "");
				});
				response.keywords.filter((item) => item.keyword == keyword)[0].headlines = [...headlineArray];
				response.token += res.usage;
			}
		}

		if (description.state) {
			for (const keyword of keywords) {
				let prompt = `Act like you are an experienced Google ads professional. I want to create a Google ad for: ${keyword}. Generate 1 effective ad copy with a maximum of ${description.length} letters.`;
				if (headline.state) {
					prompt = `Act like you are an experienced Google ads professional. I want to create a Google ad for ${keyword}. Generate max 1 effective ad text lines without linebreaks with ${
						description.length
					} letters for the following headlines – ${response.keywords
						.filter((item) => item.keyword == keyword)[0]
						.headlines.map((headline) => `"${headline}"`)
						.join(", ")}`;
				}

				const res = await fetchAPIResponse({ prompt });

				const descriptionArray = res.message.content.split("\n").map((item) => {
					return item
						.trim()
						.replace(/[0-9]/g, "")
						.replace(/(\r\n|\n|\r)/gm, "")
						.replace('"\n', "")
						.replace(". ", "")
						.replace('"', "");
				});
				response.keywords.filter((item) => item.keyword == keyword)[0].descriptions = [...descriptionArray];
				response.token += res.usage;
			}
		}

		/**
		 * update DB with queue id
		 */
		const job = await prisma.job.create({
			data: {
				queueId: queue.uid,
				content: JSON.stringify(response),
			},
		});
		console.log(job);

		/**
		 * return response
		 */
		return res.status(200).json({ status: "success", response });
	} catch (error) {
		res.status(500).json({ status: "error", message: error.message });
	}
}
