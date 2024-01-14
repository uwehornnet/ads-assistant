const fs = require("fs");
const path = require("path");

import OpenAI from "openai";

import createCSV from "../../../../utils/createCSV";
import { type } from "os";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
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
		if (process.env.ENV_STATE && process.env.ENV_STATE == "dev") {
			return res.status(200).json({ status: "success", response: devResponse, filePath: `/files/${filename}` });
		}

		const { keywords, headline, description, variations } = req.body;
		const response = {
			token: 0,
			keywords: [],
		};

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

		const csvResponse = [];
		for (const item of response.keywords) {
			const obj = {
				keyword: item.keyword,
			};
			for (let i = 0; i < item.headlines.length; i++) {
				obj[`headline_${i + 1}`] = item.headlines[i];
			}
			for (let i = 0; i < item.descriptions.length; i++) {
				obj[`description_${i + 1 + item.headlines.length}`] = item.descriptions[i];
			}
			csvResponse.push(obj);
		}

		const csv = createCSV(csvResponse);
		const filename = "google-ads.csv";
		const file = path.join(process.cwd(), "public/files", filename);
		const csvFile = fs.writeFileSync(file, csv);

		return res.status(200).json({ status: "success", response, filePath: `/files/${filename}` });
	} catch (error) {
		console.log(error);
		res.status(500).json({ status: "error", message: error.message });
	}
}
