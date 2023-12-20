const fs = require("fs");
const path = require("path");

import OpenAI from "openai";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

const fetchAPIResponse = async ({ keyword, length }) => {
	const response = await openai.chat.completions.create({
		messages: [
			{
				role: "system",
				content: `write 3, komma separated, google ads textlines with high click through rates and a maximum length of letters of ${length} from keyword: ${keyword}`,
			},
		],
		model: "gpt-3.5-turbo",
		temperature: 0.3,
	});
	return response.choices[0].message;
};

const createCSV = (data) => {
	const csvRows = [];
	const headers = Object.keys(data[0]);
	csvRows.push(headers.join(","));

	for (const row of data) {
		const values = headers.map((header) => {
			const escaped = ("" + row[header]).replace(/"/g, '\\"');
			return `"${escaped}"`;
		});
		csvRows.push(values.join(","));
	}

	return csvRows.join("\n");
};

export default async function handler(req, res) {
	const { params, length } = req.body;
	const filename = "google-ads.csv";
	const file = path.join(process.cwd(), "public/files", filename);

	//const keywords = params.split(",");

	// const apiResponse = await Promise.all(
	// 	keywords.map(async (keyword) => {
	// 		const apiResponse = await fetchAPIResponse({ keyword, length });
	// 		const apiResponseArray = apiResponse.content.split(/\r?\n|\r|\n/g).map((item) => {
	// 			const arr = item.split('"');
	// 			return arr[1];
	// 		});

	// 		const resObject = {};

	// 		for (let i = 0; i < apiResponse.length; i++) {
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
			keyword: "iqos",
			google_ads_1: "Discover IQOS - The Future of Smoking",
			google_ads_2: "Upgrade Your Smoking Experience with IQOS",
			google_ads_3: "Experience Smoke-Free, Tobacco Heating with IQOS",
		},
	];

	const csv = createCSV(apiResponse);
	const csvFile = fs.writeFileSync(file, csv);

	res.status(200).json({ status: "success", results: apiResponse, filepath: `/files/${filename}` });
}
