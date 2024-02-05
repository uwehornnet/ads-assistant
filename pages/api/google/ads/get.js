import OpenAI from "openai";
import prisma from "../../../../lib/prisma";
import { createUUID } from "../../../../utils/uuid.js";

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
		const { keywords, headline, description, variations } = req.body;
		/**
		 * queue id to be fetched from DB
		 */
		const queueId = createUUID();
		const queue = await prisma.queue.create({
			data: {
				uid: queueId,
				content: JSON.stringify({ keywords, headline, description, variations }),
				done: false,
			},
		});

		console.log(queue);

		/**
		 * make DB query to insert into DB if queue id is not present
		 */

		/**
		 * prepare response object
		 */
		const response = {
			token: 0,
			keywords: [],
		};

		return res.status(200).json({ status: "success", response, queue });
	} catch (error) {
		res.status(500).json({ status: "error", message: error.message });
	}
}
