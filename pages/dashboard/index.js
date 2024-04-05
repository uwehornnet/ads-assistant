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
								<div className="col-span-2">
									<small className="block text-xs uppercase font-bold text-slate-500">
										created ad
									</small>
									<a href={`/queue/${queue.id}`}>{queue.createdAt}</a>
								</div>
								<div className="col-span-1">
									<small className="block text-xs uppercase font-bold text-slate-500">Queue id</small>
									<a href={`/queue/${queue.id}`}>{queue.id}</a>
								</div>

								<div className="col-span-1">
									<small className="block text-xs uppercase font-bold text-slate-500">status</small>
									<span>{queue.done ? "done" : "pending"}</span>
								</div>

								<div className="col-span-1 flex items-center justify-end pr-4">
									<a href={`/queue/${queue.id}`} className="flex items-center gap-2">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 20 20"
											fill="currentColor"
											className="w-5 h-5"
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
