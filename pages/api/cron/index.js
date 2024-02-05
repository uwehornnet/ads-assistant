import OpenAI from "openai";
import prisma from "../../../lib/prisma";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY || process.env.REACT_APP_OPENAI_API_KEY,
});

const devResponse = {
	token: 635,
	keywords: [
		{
			keyword: "airbag steering wheels",
			headlines: ["Safe Drive, Airbag Wheels", "Secure Ride, Airbag Tech", "Protective Drive, Airbags"],
			descriptions: [
				"Safe Drive, Airbag Wheels: Upgrade your vehicle's safety with our advanced airbag steering wheels.\"",
				'Secure Ride, Airbag Tech: Experience peace of mind on the road with our cutting-edge airbag steering wheels."',
				'Protective Drive, Airbags: Stay protected and confident with our reliable airbag steering wheels."',
			],
		},
		{
			keyword: " battery garden sparyer",
			headlines: ["Powerful Garden Sprayer", "Efficient Battery Sprayer", "Easy-To-Use Sprayer"],
			descriptions: [
				"Powerful Garden Sprayer: Maximize Your Yard's Potential\"",
				'Efficient Battery Sprayer: Get More Done in Less Time"',
				'Easy-To-Use Sprayer: Simplify Your Gardening Experience"',
			],
		},
		{
			keyword: " exhaust resonator pipe",
			headlines: [
				"Boost Performance: Resonator Pipe",
				"Enhance Sound: Resonator Pipe",
				"Unleash Power: Resonator Pipe",
			],
			descriptions: [
				'Boost Performance: Resonator Pipe - Experience Unmatched Power!"',
				'Enhance Sound: Resonator Pipe - Unleash the Roar of Your Engine!"',
				'Unleash Power: Resonator Pipe - Maximize Performance & Dominate the Road!"',
			],
		},
	],
};

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
		return res.status(200).json({ status: "success", queue });
		/**
		 * if queue id is present, get keywords from job table filtered by queue id
		 */
		const jobs = await prisma.job.findMany({
			where: {
				queueId: queue.uid,
			},
		});
		return res.status(200).json({ status: "success", job });
		const { keywords: allKeywords, headline, description, variations } = JSON.parse(queue.content);
		const keywords = [allKeywords[jobs.length]];

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
		for (const keyword of keywords) {
			response.keywords.push({
				keyword,
				headlines: [],
				descriptions: [],
			});
		}

		if (headline.state) {
			for (const keyword of keywords) {
				const prompt = `Act like you are an experienced Google ads professional. I want to create one Google ads for: ${keyword}. Generate ${variations} effective ad headline ideas with ${headline.length} letters.`;
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
				let prompt = `Act like you are an experienced Google ads professional. I want to create one Google ads for: ${keyword}. Generate ${variations} effective ad copies without linebreaks with max ${description.length} letters.`;
				if (headline.state) {
					prompt = `Act like you are an experienced Google ads professional. I want to create Google ads for ${keyword}. Generate max ${variations} effective ad text lines without linebreaks with ${
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
