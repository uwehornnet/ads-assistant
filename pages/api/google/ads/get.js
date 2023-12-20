const fs = require("fs");
const path = require("path");

import OpenAI from "openai";

import createCSV from "../../../../utils/createCSV";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

const fetchAPIResponse = async ({ keyword, length }) => {
	const prompt = `write 3, komma separated, google ads textlines (max ${length} letters) with high click through rates from keyword: "${keyword}"`;

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

	return response.choices[0].message;
};

export default async function handler(req, res) {
	try {
		const { params, length } = req.body;
		const filename = "google-ads.csv";
		const file = path.join(process.cwd(), "public/files", filename);

		const keywords = params.split(",");
		const apiResponse = await Promise.all(
			keywords.map(async (keyword) => {
				const apiResponse = await fetchAPIResponse({ keyword, length });
				const apiResponseArray = apiResponse.content.split("\n").map((item) => {
					const arr = item.split('"');
					return arr[1];
				});

				const resObject = {};

				for (let i = 0; i < apiResponseArray.length; i++) {
					resObject[`google_ads_${i + 1}`] = apiResponseArray[i];
				}

				return {
					keyword,
					...resObject,
				};
			})
		);

		// const apiResponse = [
		// 	{
		// 		keyword: "iqos",
		// 		google_ads_1: "Discover IQOS - The Future of Smoking",
		// 		google_ads_2: "Upgrade Your Smoking Experience with IQOS",
		// 		google_ads_3: "Experience Smoke-Free, Tobacco Heating with IQOS",
		// 	},
		// ];

		const csv = createCSV(apiResponse);
		const csvFile = fs.writeFileSync(file, csv);

		res.status(200).json({ status: "success", results: apiResponse, filepath: `/files/${filename}` });
	} catch (error) {
		console.log(error);
		res.status(500).json({ status: "error", message: error.message });
	}
	
	
}
