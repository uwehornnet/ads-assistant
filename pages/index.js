import { useEffect, useState } from "react";
import Image from "next/image";

import { Inter } from "next/font/google";
import DefaultLayout from "@/layouts/Default";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
	const [loading, setLoading] = useState(false);
	const [placeholder, setPalceholder] = useState("prompt");
	const [length, setLength] = useState(30);
	const [params, setParams] = useState(null);
	const [link, setLink] = useState(null);
	const [results, setResults] = useState([]);

	const fetchData = async () => {
		if (loading) return;

		setLoading(true);
		const res = await fetch(`${location.origin}/api/google/ads/get`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				length,
				params,
			}),
		});

		const data = await res.json();
		setResults(data.results);
		setLink(data.filepath);
		setLoading(false);
	};

	const placeholderLoop = () => {
		const placeholders = ["prompt", "question", "query", "keywords", "topic"];

		let i = 0;
		setInterval(() => {
			setPalceholder(placeholders[i]);
			i++;
			if (i === placeholders.length) i = 0;
		}, 2000);
	};

	useEffect(() => {
		placeholderLoop();
	}, []);

	return (
		<DefaultLayout>
			<header className="bg-white dark:bg-slate-900 shadow">
				<div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
					<div className="relative outline-none w-full">
						<textarea
							name="prompt"
							id="prompt"
							cols="30"
							rows="4"
							value={`apple air tags, iqos, health insurrance`}
							onChange={(e) => setParams(e.target.value)}
							className="bg-slate-50 dark:bg-slate-800  backdrop-blur-md md:rounded-lg p-2 ring-0 border-0 w-full focus:border-0 outline-none focus:outline-indigo-600 outline-2 outline-offset-4 placeholder-slate-800 dark:placeholder-slate-400 text-slate-800 dark:text-slate-400"
							placeholder={`Add your ${placeholder} ... `}
						></textarea>

						<div className="md:absolute w-full bottom-[1px] left-0 ">
							<div className="flex flex-col sm:flex-row gap-4 items-center justify-end p-2 ">
								<button
									disabled
									onClick={() => {}}
									className="text-indigo-400 p-2 flex items-center gap-2 disabled:text-slate-700 disabled:cursor-not-allowed bg-slate-100 rounded-md"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
										strokeWidth={2.5}
										stroke="currentColor"
										className="w-4 h-4"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
										/>
									</svg>
									<span>upload file</span>
								</button>
								<button
									onClick={() => fetchData()}
									className="bg-indigo-700 text-white rounded-md py-2 px-6 disabled:hover:bg-indigo-500 disabled:cursor-not-allowed"
								>
									{loading ? (
										<div className="flex space-x-1 justify-center items-center py-2">
											<div className="h-2 w-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
											<div className="h-2 w-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
											<div className="h-2 w-2 bg-white rounded-full animate-bounce"></div>
										</div>
									) : (
										<span>generate suggestions</span>
									)}
								</button>
							</div>
						</div>
					</div>
				</div>
			</header>
			<main className="relative">
				{results.length ? (
					<div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8 overflow-x-auto relative ">
						<div className="overflow-x-auto relative shadow-md sm:rounded-lg">
							<table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
								<thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
									<tr>
										<th scope="col" className="py-3 px-6">
											keyword
										</th>
										<th scope="col" className="py-3 px-6 whitespace-pre" colSpan={3}>
											text lines
										</th>
									</tr>
								</thead>
								<tbody>
									{results.map((result, idx) => (
										<tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
											{Object.keys(result).map((key, i) => (
												<td className="py-4 px-6 whitespace-pre">{result[key]}</td>
											))}
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				) : null}
			</main>
		</DefaultLayout>
	);
}
