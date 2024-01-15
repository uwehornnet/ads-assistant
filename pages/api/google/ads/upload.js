const AWS = require("aws-sdk");

import createCSV from "../../../../utils/createCSV";

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
		const { data } = req.body;
		const csv = createCSV(data);
		const upload = await uploadToS3(csv);
		return res.status(200).json({ status: "success", location: upload?.Location });
	} catch (error) {
		console.log(error);
	}
}
