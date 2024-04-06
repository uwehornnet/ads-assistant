"use client";

import { useEffect, useState } from "react";

import DashboardLayout from "../../layouts/Dashboard";

export default function Dashboard(props) {
	const [queues, setQueues] = useState([]);
	const [error, setError] = useState(null);

	const fetchQueues = async () => {
		try {
			const res = await fetch(`/api/queues/get`);
			const data = await res.json();
			if (data.status === "error") {
				setError(data.message);
				setTimeout(() => {
					setError(null);
				}, 3000);
			} else {
				setQueues(data.message);
			}
		} catch (error) {
			setError(error.message);
			setTimeout(() => {
				setError(null);
			}, 3000);
		}
	};

	useEffect(() => {
		fetchQueues();
	}, []);

	return (
		<DashboardLayout>
			{error && (
				<div className="fixed top-0 left-0 md:right-2 md:top-2 md:left-auto w-full md:max-w-[400px] bg-red-300 border-t-4 border-red-600 z-[999] p-2 md:p-3 md:rounded-sm shadow-lg text-sm">
					{error}
				</div>
			)}

			<main className="container mx-auto px-4">
				{queues && (
					<ul className="mt-4">
						{queues.map((queue) => (
							<li
								key={queue.id}
								className="grid grid-cols-5 gap-3 bg-slate-200 dark:bg-slate-800 text-slate-400  rounded-md p-2 mb-2"
							>
								<div className="col-span-1">
									<small className="block text-xs uppercase font-bold text-slate-500">
										created ad
									</small>
									<a href={`/queue/${queue.id}`}>{new Date(queue.createdAt).toLocaleString()}</a>
								</div>
								<div className="col-span-2">
									<small className="block text-xs uppercase font-bold text-slate-500">Queue id</small>
									<a href={`/queue/${queue.id}`}>{queue.id}</a>
								</div>

								<div className="col-span-1">
									<small className="block text-xs uppercase font-bold text-slate-500">status</small>
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

								<div className="col-span-1 flex items-center justify-end pr-4">
									<a
										href={`/queue/${queue.id}`}
										className="flex items-center gap-2 text-blue-700 dark:text-blue-600"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 20 20"
											fill="currentColor"
											className="w-5 h-5 "
										>
											<path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
											<path
												fillRule="evenodd"
												d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
												clipRule="evenodd"
											/>
										</svg>
										<span>view</span>
									</a>
								</div>
							</li>
						))}
					</ul>
				)}
			</main>
		</DashboardLayout>
	);
}
