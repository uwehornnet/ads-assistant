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

		// const keywords = params.split(",");
		// const apiResponse = await Promise.all(
		// 	keywords.map(async (keyword) => {
		// 		const apiResponse = await fetchAPIResponse({ keyword, length });
		// 		const apiResponseArray = apiResponse.content.split("\n").map((item) => {
		// 			const arr = item.split('"');
		// 			return arr[1];
		// 		});

		// 		const resObject = {};

		// 		for (let i = 0; i < apiResponseArray.length; i++) {
		// 			resObject[`google_ads_${i + 1}`] = apiResponseArray[i];
		// 		}

		// 		return {
		// 			keyword,
		// 			...resObject,
		// 		};
		// 	})
		// );
		const apiResponse = [
			{
				keyword: "apple air tags",
				google_ads_1: "Find lost items",
				google_ads_2: "Track with ease",
				google_ads_3: "Never lose again",
			},
			{
				keyword: " iqos",
				google_ads_1: "IQOS: Smoke-Free Alternative",
				google_ads_2: "Discover IQOS: Better Choice",
				google_ads_3: "Switch to IQOS: Enjoy Freedom",
			},
			{
				keyword: " health insurrance",
				google_ads_1: "Save on Health Insurance!",
				google_ads_2: "Get Affordable Coverage",
				google_ads_3: "Compare Health Plans",
			},
		];


		const csv = createCSV(apiResponse);
		//const csvFile = fs.writeFileSync(file, csv);
		setTimeout(() => {
			res.status(200).json({ status: "success", results: apiResponse, filepath: `/files/${filename}` });
		}, 4000);
		
	} catch (error) {
		console.log(error);
		res.status(500).json({ status: "error", message: error.message });
	}
	
	
}
