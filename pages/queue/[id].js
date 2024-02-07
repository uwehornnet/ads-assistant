import { useEffect, useState, useRef } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/router";

import DefaultLayout from "../../layouts/Default";

import prisma from "../../lib/prisma";

export async function getStaticPaths(props) {
	const queue = await prisma.queue.findFirst({
		where: {
			id: props.id,
		},
	});

	return {
		paths: [
			{
				params: { id: queue.id },
			},
		],
		fallback: true,
	};
}

export async function getStaticProps({ params }) {
	const queue = await prisma.queue.findFirst({
		where: {
			id: params.id,
		},
	});
	const jobs = await prisma.job.findMany({
		where: {
			queueId: queue.uid,
		},
	});

	return {
		props: {
			queue: {
				id: queue.id,
				uid: queue.uid,
				done: queue.done,
				content: JSON.parse(queue.content),
				createdAt: new Date(queue.createdAt).toString(),
			},
			jobs: jobs.map((job) => {
				return {
					id: job.id,
					content: JSON.parse(job.content),
					createdAt: new Date(job.createdAt).toString(),
				};
			}),
		},
	};
}

export default function Job({ queue, jobs }) {
	const [error, setError] = useState(null);
	const [current, setCurrent] = useState(null);
	const router = useRouter();
	const { data: session } = useSession();
	console.log(queue?.content);
	return (
		<DefaultLayout>
			{error && (
				<div className="fixed top-0 left-0 md:right-2 md:top-2 md:left-auto w-full md:max-w-[400px] bg-red-300 border-t-4 border-red-600 z-[999] p-2 md:p-3 md:rounded-sm shadow-lg text-sm">
					{error}
				</div>
			)}

			<main className="container mx-auto ">
				<ul className="flex items-center justify-start gap-2 mt-2 text-xs">
					<li className="bg-slate-200 dark:bg-slate-800 rounded-md flex items-center justify-center text-slate-400">
						<a href="/">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 20 20"
								fill="currentColor"
								class="w-5 h-5"
							>
								<path
									fill-rule="evenodd"
									d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
									clip-rule="evenodd"
								/>
							</svg>
						</a>
					</li>

					<li className="relative text-slate-400">
						<a href="/">Dashboard</a>
					</li>

					{queue && (
						<>
							<li className="relative text-slate-400">/</li>
							<li className="relative text-slate-400">
								<span>{queue.id}</span>
							</li>
						</>
					)}
				</ul>
				{queue && (
					<div className=" mt-4">
						<p className="text-slate-600 dark:text-slate-300">Queue: {queue.id}</p>
						<div className="rounded-md bg-slate-200 dark:bg-slate-800 p-2 mt-2">
							<div className=" grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-400">
								<div className="col-span-1">
									<small className="block text-xs uppercase font-bold text-slate-500">
										created ad
									</small>
									<span>{queue.createdAt}</span>
								</div>
								<div className="col-span-1">
									<small className="block text-xs uppercase font-bold text-slate-500">
										Jobs done
									</small>
									<span>{jobs ? `${jobs.length} / ${queue.content.keywords.length}` : "-"}</span>
									<span className="block w-full h-1 bg-slate-300/50 dark:bg-slate-400/50 relative mt-2">
										<div
											className="absolute left-0 top-0 h-full bg-blue-600"
											style={{
												width: `${(100 / queue.content.keywords.length) * jobs.length}%`,
											}}
										></div>
									</span>
								</div>
								<div className="col-span-1">
									<small className="block text-xs uppercase font-bold text-slate-500">Status</small>
									<span>{queue.done ? "done" : "pending"}</span>
								</div>
							</div>

							<div className="mt-4 text-slate-400">
								<small className="block text-xs uppercase font-bold text-slate-500">Keywords</small>
								<div className="max-h-[110px] overflow-x-auto">
									<p>{queue.content?.keywords.join(",")}</p>
								</div>
							</div>
						</div>
					</div>
				)}

				{jobs && jobs.length > 0 ? (
					<div className=" my-4">
						<p className="text-slate-600 dark:text-slate-300">Jobs</p>
						<ul className="flex flex-col gap-2 mt-2">
							{jobs.map((job) => (
								<li
									key={job.id}
									className="rounded-md bg-slate-200 dark:bg-slate-800 p-2 text-slate-400"
								>
									<div className="grid grid-cols-4 gap-4">
										<div>
											<small className="block text-xs uppercase font-bold text-slate-500">
												created ad
											</small>
											<span>{job.createdAt}</span>
										</div>
										<div>
											<small className="block text-xs uppercase font-bold text-slate-500">
												id
											</small>
											<span
												className="cursor-pointer"
												onClick={() => {
													if (current == job.id) {
														setCurrent(null);
													} else {
														setCurrent(job.id);
													}
												}}
											>
												{job.id}
											</span>
										</div>
										<div>
											<small className="block text-xs uppercase font-bold text-slate-500">
												Keyword
											</small>
											<span>{job.content?.keywords[0].keyword}</span>
										</div>
										<div>
											<small className="block text-xs uppercase font-bold text-slate-500">
												Token used
											</small>
											<span>{job.content.token}</span>
										</div>
									</div>

									{job.content?.keywords && current == job.id ? (
										<div className="mt-3">
											<table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
												<thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
													<tr>
														<th
															scope="col"
															className="py-3 px-6 whitespace-pre"
															colSpan={1}
														>
															headlines
														</th>
														<th
															scope="col"
															className="py-3 px-6 whitespace-pre"
															colSpan={1}
														>
															textlines
														</th>
													</tr>
												</thead>
												<tbody>
													{job.content?.keywords.map((item, idx) => (
														<tr
															key={idx}
															className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
														>
															<td className="py-4 px-6 whitespace-pre">
																{item.headlines.length
																	? item.headlines.map((headline, i) => (
																			<p key={i}>{headline}</p>
																	  ))
																	: "-"}
															</td>
															<td className="py-4 px-6 whitespace-pre">
																{item.descriptions.length
																	? item.descriptions.map((textline, i) => (
																			<p key={i}>{textline.replace('"', "")}</p>
																	  ))
																	: "-"}
															</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									) : null}
								</li>
							))}
						</ul>
					</div>
				) : null}
			</main>
		</DefaultLayout>
	);
}
