const AWS = require("aws-sdk");

import prisma from "../../../lib/prisma";
import createCSV from "../../../utils/createCSV";

const uploadToS3 = async (csv) => {
	try {
		const filename = `${Date.now()}.csv`;
		const s3 = new AWS.S3({
			accessKeyId: process.env.NEXT_AWS_ACCESS_KEY_ID || process.env.REACT_APP_AWS_ACCESS_KEY_ID,
			secretAccessKey: process.env.NEXT_AWS_SECRET_ACCESS_KEY || process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
			region: "eu-central-1",
		});

		const params = {
			Bucket: "adsassistant",
			Key: filename,
			Body: csv,
		};

		return await s3.upload(params).promise();
	} catch (error) {
		console.log(error);
	}
};

export default async function handler(req, res) {
	try {
		/**
		 * Make prisma call to fetch jobs by queueId
		 *
		 */

		const query = {
			where: {
				queueId: req.query.id,
			},
		};
		const jobs = await prisma.job.findMany(query);
		const keywordsUsed = [];
		const filteredJobs = [];

		jobs.forEach((job) => {
			const content = JSON.parse(job.content);
			const data = content.keywords[0];
			const keyword = data.keyword;
			if (!keywordsUsed.includes(keyword)) {
				keywordsUsed.push(keyword);
				const headlines = data.headlines;
				const descriptions = data.descriptions;
				const response = {
					keyword: keyword,
				};

				for (let i = 0; i < headlines.length; i++) {
					response[`headline_${i + 1}`] = headlines[i]
						.replace(/([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g, "")
						.replace(/\s{2,}/g, " ")
						.replace(" ( letters)", "")
						.replace(",", "");
				}

				for (let i = 0; i < descriptions.length; i++) {
					const description = descriptions[i].split(".")[0];
					response[`description_${i + 1}`] = description
						.replace(/([\uE000-\uF8FF]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDDFF])/g, "")
						.replace(/\s{2,}/g, " ")
						.replace(",", "")
						.replace('"', "")
						.replace("`", "");
				}

				filteredJobs.push(response);
			}
		});

		const csv = createCSV(filteredJobs);
		console.log(csv);
		const upload = await uploadToS3(csv);

		/**
		 * return response
		 */
		return res.status(200).json({ status: "success", location: upload?.Location });
	} catch (error) {
		return res.status(500).json({ status: "error", message: error.message });
	}
}
