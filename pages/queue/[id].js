import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import DashboardLayout from "../../layouts/Dashboard";
import ActivityIndicator from "@/components/ActivityIndicator";

export default function Job() {
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [disabled, setDisabled] = useState(false);
	const [error, setError] = useState(null);
	const [queue, setQueue] = useState(null);
	const [jobs, setJobs] = useState([]);
	const [search, setSearch] = useState(router.query.search || "");
	const [page, setPage] = useState(router.query.page || 0);
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

	useEffect(() => {
		if (!queue) return;
		if (jobs.length !== queue.content.keywords.length) {
			const interval = setInterval(() => {
				fetchQueue();
				fetchJobs();
			}, 10000);

			return () => clearInterval(interval);
		}
	}, [jobs]);

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
						<a href="/dashboard">Dashboard</a>
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
							<div className=" grid grid-cols-1 md:grid-cols-4 gap-4 text-slate-400">
								<div className="md:col-span-2">
									<small className="block text-xs uppercase font-bold text-slate-500">title</small>
									<span>{queue.content?.title}</span>
									<small className="block text-xs uppercase font-bold text-slate-500 mt-2">
										created ad
									</small>
									<span>{new Date(queue.createdAt).toLocaleString()}</span>
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
									<span className="block w-full h-1 bg-slate-300/50 dark:bg-slate-400/50 relative mt-2 overflow-hidden">
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
									<span>
										{queue.done ? (
											<span className="flex items-center gap-2">
												<svg
													xmlns="http://www.w3.org/2000/svg"
													viewBox="0 0 20 20"
													fill="currentColor"
													className="w-5 h-5 text-lime-500 dark:text-lime-300"
												>
													<path
														fillRule="evenodd"
														d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
														clipRule="evenodd"
													/>
												</svg>
												<span>done</span>
											</span>
										) : (
											<span className="flex items-center gap-2">
												<svg
													xmlns="http://www.w3.org/2000/svg"
													viewBox="0 0 20 20"
													fill="currentColor"
													className="w-5 h-5 animate-spin"
												>
													<path d="M13.024 9.25c.47 0 .827-.433.637-.863a4 4 0 0 0-4.094-2.364c-.468.05-.665.576-.43.984l1.08 1.868a.75.75 0 0 0 .649.375h2.158ZM7.84 7.758c-.236-.408-.79-.5-1.068-.12A3.982 3.982 0 0 0 6 10c0 .884.287 1.7.772 2.363.278.38.832.287 1.068-.12l1.078-1.868a.75.75 0 0 0 0-.75L7.839 7.758ZM9.138 12.993c-.235.408-.039.934.43.984a4 4 0 0 0 4.094-2.364c.19-.43-.168-.863-.638-.863h-2.158a.75.75 0 0 0-.65.375l-1.078 1.868Z" />
													<path
														fillRule="evenodd"
														d="m14.13 4.347.644-1.117a.75.75 0 0 0-1.299-.75l-.644 1.116a6.954 6.954 0 0 0-2.081-.556V1.75a.75.75 0 0 0-1.5 0v1.29a6.954 6.954 0 0 0-2.081.556L6.525 2.48a.75.75 0 1 0-1.3.75l.645 1.117A7.04 7.04 0 0 0 4.347 5.87L3.23 5.225a.75.75 0 1 0-.75 1.3l1.116.644A6.954 6.954 0 0 0 3.04 9.25H1.75a.75.75 0 0 0 0 1.5h1.29c.078.733.27 1.433.556 2.081l-1.116.645a.75.75 0 1 0 .75 1.298l1.117-.644a7.04 7.04 0 0 0 1.523 1.523l-.645 1.117a.75.75 0 1 0 1.3.75l.644-1.116a6.954 6.954 0 0 0 2.081.556v1.29a.75.75 0 0 0 1.5 0v-1.29a6.954 6.954 0 0 0 2.081-.556l.645 1.116a.75.75 0 0 0 1.299-.75l-.645-1.117a7.042 7.042 0 0 0 1.523-1.523l1.117.644a.75.75 0 0 0 .75-1.298l-1.116-.645a6.954 6.954 0 0 0 .556-2.081h1.29a.75.75 0 0 0 0-1.5h-1.29a6.954 6.954 0 0 0-.556-2.081l1.116-.644a.75.75 0 0 0-.75-1.3l-1.117.645a7.04 7.04 0 0 0-1.524-1.523ZM10 4.5a5.475 5.475 0 0 0-2.781.754A5.527 5.527 0 0 0 5.22 7.277 5.475 5.475 0 0 0 4.5 10a5.475 5.475 0 0 0 .752 2.777 5.527 5.527 0 0 0 2.028 2.004c.802.458 1.73.719 2.72.719a5.474 5.474 0 0 0 2.78-.753 5.527 5.527 0 0 0 2.001-2.027c.458-.802.719-1.73.719-2.72a5.475 5.475 0 0 0-.753-2.78 5.528 5.528 0 0 0-2.028-2.002A5.475 5.475 0 0 0 10 4.5Z"
														clipRule="evenodd"
													/>
												</svg>
												<span>pending</span>
											</span>
										)}
									</span>
								</div>
							</div>

							<div className="mt-4 text-slate-400">
								<small className="block text-xs uppercase font-bold text-slate-500">Keywords</small>
								<div className="max-h-[110px] overflow-x-auto">
									<p>{queue.content?.keywords.join(",")}</p>
								</div>
							</div>

							<div className="hidden mt-4 md:flex items-center justify-end gap-4">
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
								<p className="text-slate-600 dark:text-slate-300 mb-4">Jobs</p>

								<div className="flex items-center mb-4 ">
									<input
										type="text"
										value={search}
										onChange={(e) => {
											setSearch(e.target.value);
										}}
										placeholder="search for keyword jobs, separated by komma"
										className="bg-slate-50 dark:bg-slate-800  backdrop-blur-md rounded-tl-md rounded-bl-md p-2 ring-0 border-0 w-full focus:border-0 outline-none focus:outline-blue-600 outline-2 outline-offset-4 placeholder-slate-800 dark:placeholder-slate-400 text-slate-800 dark:text-slate-400"
									/>
									<button
										onClick={updateJobs}
										className="bg-blue-700 text-white rounded-tr-md rounded-br-md py-[10px] px-6 disabled:hover:bg-blue-500 disabled:cursor-not-allowed"
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
											className="rounded-md bg-slate-200 dark:bg-slate-800 p-2 text-slate-400 border border-slate-300 dark:border-slate-800"
										>
											<div className="grid md:grid-cols-5 gap-4">
												<div>
													<small className="block text-xs uppercase font-bold text-slate-500">
														created ad
													</small>
													<span>{new Date(job.createdAt).toLocaleString()}</span>
												</div>
												<div>
													<small className="block text-xs uppercase font-bold text-slate-500">
														Keyword
													</small>
													<span>{job.content?.keywords[0].keyword}</span>

													<small className="block text-xs uppercase font-bold text-slate-500 mt-3">
														Token used
													</small>
													<span>{job.content.token}</span>
												</div>
												<div className="md:col-span-3">
													{job.content?.keywords.map((item, idx) => (
														<div key={idx}>
															<div>
																<small className="block text-xs uppercase font-bold text-slate-500">
																	Adtitle
																</small>
																<span>
																	{item.headlines.length
																		? item.headlines.map((headline, i) => (
																				<p key={i}>{headline}</p>
																		  ))
																		: "-"}
																</span>
															</div>
															<div className="mt-4 md:mt-2">
																<small className="block text-xs uppercase font-bold text-slate-500">
																	Adcopy
																</small>
																<span>
																	{item.descriptions.length
																		? item.descriptions.map((textline, i) => (
																				<p key={i}>
																					{textline.replace('"', "")}
																				</p>
																		  ))
																		: "-"}
																</span>
															</div>
														</div>
													))}
												</div>
											</div>
										</li>
									))}
								</ul>

								{pagination && pagination.pages > 1 ? (
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
								) : null}
							</div>
						) : null}
					</div>
				)}
			</main>
		</DashboardLayout>
	);
}
