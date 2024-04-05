import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import DashboardLayout from "../../layouts/Dashboard";
import ActivityIndicator from "@/components/ActivityIndicator";

export default function Job() {
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [disabled, setDisabled] = useState(false);
	const [error, setError] = useState(null);
	const [current, setCurrent] = useState(null);
	const [queue, setQueue] = useState(null);
	const [jobs, setJobs] = useState([]);
	const [search, setSearch] = useState(router.query.search || "");
	const [page, setPage] = useState(router.query.page || 1);
	const [pagination, setPagination] = useState(null);

	const fetchJobs = async () => {
		try {
			let url = `/api/jobs/get?id=${queue.uid}&page=${page}`;
			if (router.query.search && router.query.search !== "") {
				url = url + `&search=${router.query.search}`;
			}

			const res = await fetch(url);
			const data = await res.json();
			if (data.status === "error") {
				setError(data.message);
			} else {
				setJobs(data.message.data);
				setPagination(data.message.pagination);
			}
		} catch (error) {
			setError(error.message);
		}
		setLoading(false);
	};

	const updateJobs = async () => {
		if (loading) return;
		setLoading(true);
		try {
			const res = await fetch(`/api/jobs/get?id=${queue.uid}&search=${search}`);
			const data = await res.json();
			if (data.status === "error") {
				setError(data.message);
			} else {
				setJobs(data.message.data);
				setPagination(data.message.pagination);
			}
		} catch (error) {
			setError(error.message);
		}
		setLoading(false);
	};

	const fetchQueue = async () => {
		try {
			const res = await fetch(`/api/queue/get?id=${router.query.id}`);
			const data = await res.json();

			if (data.status === "error") {
				setError(data.message);
			} else {
				setQueue({
					...data.message,
					content: JSON.parse(data.message.content),
				});
			}
		} catch (error) {
			setError(error.message);
		}
	};

	const updatePage = (page) => {
		setLoading(true);
		let params = {
			pathname: `/queue/${router.query.id}`,
			query: { page },
		};

		if (router.query.search) {
			params.query.search = router.query.search;
		}

		router.push(params, undefined, { shallow: true });
		setPage(page);
	};

	const exportData = async () => {
		if (disabled) return;
		setDisabled(true);
		try {
			const req = await fetch(`/api/jobs/export?id=${queue.uid}`);
			const res = await req.json();

			if (res.status == "error") {
				setError(res.message);
				setTimeout(() => {
					setError(null);
				}, 3000);
			} else {
				window.open(res.location, "_blank");
			}
		} catch (error) {
			console.log(error);
			setError(error);
		}
		setDisabled(false);
	};

	const deleteQueue = async () => {
		if (disabled) return;
		setDisabled(true);
		try {
			const req = await fetch(`/api/queue/delete?id=${queue.uid}`);
			const res = await req.json();

			if (res.status == "error") {
				setError(res.message);
				setTimeout(() => {
					setError(null);
				}, 10000);
			} else {
				router.push("/dashboard/");
			}
		} catch (error) {
			console.log(error);
			setError(error);
		}
		setDisabled(false);
	};

	useEffect(() => {
		if (!router.query.id) return;
		fetchQueue();
	}, [router]);

	useEffect(() => {
		if (!queue) return;
		fetchJobs();
	}, [queue]);

	return (
		<DashboardLayout>
			{error && (
				<div className="fixed top-0 left-0 md:right-2 md:top-2 md:left-auto w-full md:max-w-[400px] bg-red-300 border-t-4 border-red-600 z-[999] p-2 md:p-3 md:rounded-sm shadow-lg text-sm">
					{error}
				</div>
			)}

			<main className="container mx-auto px-4">
				<ul className="flex items-center justify-start gap-2 mt-2 text-xs">
					<li className="bg-slate-200 dark:bg-slate-800 rounded-md flex items-center justify-center text-slate-400">
						<a href="/dashboard">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 20 20"
								fill="currentColor"
								className="w-5 h-5"
							>
								<path
									fillRule="evenodd"
									d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
									clipRule="evenodd"
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
						<p className="text-slate-600 dark:text-slate-300">
							ID: {queue.id} | UID: {queue.uid}
						</p>
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
									<span>
										{pagination && jobs
											? `${pagination.total} / ${queue.content.keywords.length}`
											: "-"}
									</span>
									<span className="block w-full h-1 bg-slate-300/50 dark:bg-slate-400/50 relative mt-2">
										<div
											className="absolute left-0 top-0 h-full bg-blue-600"
											style={{
												width: `${
													pagination && jobs
														? (100 / queue.content.keywords.length) * pagination.total
														: 0
												}%`,
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

							<div className="mt-4 flex items-center justify-end gap-4">
								<button disabled={disabled} onClick={() => deleteQueue()} className="p-2">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 20 20"
										fill="currentColor"
										className="w-5 h-5 text-rose-500"
									>
										<path
											fillRule="evenodd"
											d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
											clipRule="evenodd"
										/>
									</svg>
								</button>
								<button
									disabled={disabled}
									onClick={() => exportData()}
									className="bg-blue-700 text-white rounded-md py-2 px-6 disabled:hover:bg-blue-500 disabled:cursor-not-allowed"
								>
									{disabled ? <ActivityIndicator /> : "export as csv"}
								</button>
							</div>
						</div>
					</div>
				)}

				{loading ? (
					<ActivityIndicator />
				) : (
					<div>
						{jobs && jobs.length > 0 ? (
							<div className=" my-4">
								<p className="text-slate-600 dark:text-slate-300">Jobs</p>

								<div className="flex items-center gap-2 mb-4">
									<input
										type="text"
										value={search}
										onChange={(e) => {
											setSearch(e.target.value);
										}}
										placeholder="search for keyword jobs, separated by komma"
										className="bg-slate-50 dark:bg-slate-800  backdrop-blur-md md:rounded-lg p-2 ring-0 border-0 w-full focus:border-0 outline-none focus:outline-blue-600 outline-2 outline-offset-4 placeholder-slate-800 dark:placeholder-slate-400 text-slate-800 dark:text-slate-400"
									/>
									<button
										onClick={updateJobs}
										className="bg-blue-700 text-white rounded-md py-2 px-6 disabled:hover:bg-blue-500 disabled:cursor-not-allowed"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 20 20"
											fill="currentColor"
											className="w-5 h-5"
										>
											<path
												fillRule="evenodd"
												d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
												clipRule="evenodd"
											/>
										</svg>
									</button>
								</div>

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
																					<p key={i}>
																						{textline.replace('"', "")}
																					</p>
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

								<ul className="flex items-center justify-between text-white mt-4">
									<li>
										<button
											className="cursor-pointer dark:text-gray-400 w-6 aspect-square flex items-center justify-center"
											onClick={() => {
												if (page > 1) {
													updatePage(page - 1);
												}
											}}
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 20 20"
												fill="currentColor"
												className="w-5 h-5"
											>
												<path
													fillRule="evenodd"
													d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
													clipRule="evenodd"
												/>
											</svg>
										</button>
									</li>
									<li className="flex items-center justify-center gap-2 text-sm">
										<span
											className="cursor-pointer text-slate-400 dark:text-slate-600"
											onClick={() => updatePage(page + 1)}
										>
											{page + 1}
										</span>
										<span
											className="cursor-pointer text-slate-400 dark:text-slate-600"
											onClick={() => updatePage(page + 2)}
										>
											{page + 2}
										</span>
										<span
											className="cursor-pointer text-slate-400 dark:text-slate-600"
											onClick={() => updatePage(page + 3)}
										>
											{page + 3}
										</span>
										<span
											className="cursor-pointer text-slate-400 dark:text-slate-600"
											onClick={() => updatePage(page + 4)}
										>
											{page + 4}
										</span>
										<span
											className="cursor-pointer text-slate-400 dark:text-slate-600"
											onClick={() => updatePage(page + 5)}
										>
											{page + 5}
										</span>
										<span>...</span>
										<span
											className="cursor-pointer text-slate-400 dark:text-slate-600"
											onClick={() => updatePage(page + pagination?.pages - 1)}
										>
											{pagination?.pages - 1}
										</span>
									</li>
									<li>
										<button
											className="cursor-pointer dark:text-gray-400 w-6 aspect-square flex items-center justify-center"
											onClick={() => updatePage(page + 1)}
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 20 20"
												fill="currentColor"
												className="w-5 h-5"
											>
												<path
													fillRule="evenodd"
													d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
													clipRule="evenodd"
												/>
											</svg>
										</button>
									</li>
								</ul>
							</div>
						) : null}
					</div>
				)}
			</main>
		</DashboardLayout>
	);
}
