import OpenAI from "openai";
import prisma from "../lib/prisma";
import { inngest } from "./client";
import { NonRetriableError } from "inngest";

import { render } from "@react-email/render";
import { sendEmail } from "@/lib/email";
import QueueFinishedEmail from "@/emails/QueueFinishedEmailTemplate";

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

export const createAd = inngest.createFunction(
	{ id: "createAd" },
	{ event: "api/create.ad" },
	async ({ event, step }) => {
		try {
			return await step.run("openAiCall", async () => {
				/**
				 * Make prisma call to fetch queue by id
				 */
				const queue = await prisma.queue.findFirst({
					where: {
						uid: event.data.id,
					},
				});

				if (!queue) {
					return { event, body: "Error, no queue found in database" };
				}

				/**
				 * if queue id is present, get keywords from job table filtered by queue id
				 */
				const jobs = await prisma.job.findMany({
					where: {
						queueId: queue.uid,
					},
				});

				const { keywords: allKeywords, headline, description } = JSON.parse(queue.content);

				if (jobs.length == allKeywords.length) {
					return { event, body: "All keywords processed" };
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
				if (!keywords.length) {
					return { event, body: "No keywords found" };
				}

				// return { event, body: "moving on to next keyword" };
				for (const keyword of keywords) {
					response.keywords.push({
						keyword,
						headlines: [],
						descriptions: [],
					});

					if (headline.state) {
						for (const keyword of keywords) {
							const prompt = `Act like you are an experienced Google ads professional. I want to create one Google ads for: ${keyword}. Generate 1 effective ad headline ideas with a maximum of ${headline.length} letters.`;
							const res = await fetchAPIResponse({ prompt });

							// const headlineArray = res.message.content.split("\n").map((item) => {
							// 	return item.replace(/[0-9]/g, "").replace(". ", "").replace('"', "").replace('"', "");
							// });
							response.keywords.filter((item) => item.keyword == keyword)[0].headlines = [
								res.message.content.replace('"', "").replace('"', ""),
							];
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
							// const descriptionArray = res.message.content.split("\n").map((item) => {
							// 	return item
							// 		.trim()
							// 		.replace(/[0-9]/g, "")
							// 		.replace(/(\r\n|\n|\r)/gm, "")
							// 		.replace('"', "");
							// });
							response.keywords.filter((item) => item.keyword == keyword)[0].descriptions = [
								res.message.content.replace('"', "").replace('"', ""),
							];
							response.token += res.usage;
						}
					}

					/**
					 * update DB with queue id
					 */
					const job = await prisma.job.create({
						data: {
							content: JSON.stringify(response),
							status: "completed",
							queue: {
								connect: {
									uid: queue.uid,
								},
							},
						},
					});
					if (job && jobs.length + 1 == allKeywords.length) {
						const updatedQueue = await prisma.queue.update({
							where: {
								uid: event.data.id,
							},
							data: {
								done: true,
							},
						});

						inngest.send(
							{
								name: "api/send.mail",
								data: { id: event.data.id },
							},
							{
								delay: 5000,
							}
						);

						return { event, body: JSON.stringify(updatedQueue) };
					} else {
						inngest.send(
							{
								name: "api/create.ad",
								data: { id: event.data.id },
							},
							{
								delay: 5000,
							}
						);

						return { event, body: "moving on to next keyword" };
					}
				}
			});
		} catch (error) {
			throw new NonRetriableError("Store not found", { cause: error });
		}
	}
);

export const sendMail = inngest.createFunction(
	{ id: "sendMail" },
	{ event: "api/send.mail" },
	async ({ event, step }) => {
		try {
			return await step.run("sendMail", async () => {
				/**
				 * check for id in request
				 */
				const { id } = event.data;
				if (!id) return { event, body: "Error, no id found in event data" };

				/**
				 * fetch queue by id
				 */
				const queue = await prisma.queue.findFirst({
					where: {
						uid: id,
					},
				});
				if (!queue) return { event, body: "Error, no queue found in database" };

				/**
				 * check for responder in queue
				 */
				const responder = JSON.parse(queue.content).respondMail;
				if (!responder) return { event, body: "Error, no responder found in queue" };

				console.log("Mail sent to responder: ", responder);
				/**
				 * send mail to responder
				 */

				// send mail logic here
				const emailSent = await sendEmail({
					to: responder,
					subject: "Unlock Your Potential with Kwooza!",
					html: render(
						QueueFinishedEmail({
							id: queue.uid,
						})
					),
				});

				if (!emailSent) return { event, body: "Error sending mail" };

				return { event, body: `Mail sent to: ${responder}` };
			});
		} catch (error) {
			throw new NonRetriableError("Error sending Email", { cause: error });
		}
	}
);