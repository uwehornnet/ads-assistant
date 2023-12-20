import { useEffect, useState } from "react";
import Image from "next/image";

import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
	const [placeholder, setPalceholder] = useState("prompt");
	const [length, setLength] = useState(30);
	const [params, setParams] = useState(null);
	const [link, setLink] = useState(null);
	const [results, setResults] = useState([]);

	const fetchData = async () => {
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
		<>
			<div className="absolute w-2/3 aspect-square rounded-full bg-orange-400 blur-[240px] top-1/2 left-1/2 opacity-10"></div>
			<div className="absolute w-3/4 aspect-square rounded-full bg-indigo-400 blur-[240px] -top-1/3 right-0 opacity-10"></div>
			<div className="absolute w-3/4 aspect-square rounded-full bg-indigo-400 blur-[240px] -bottom-1/2 opacity-10"></div>
			<div className="absolute w-1/2 aspect-square rounded-full bg-pink-400 blur-[240px] opacity-10"></div>
			<main
				className={`flex min-h-screen flex-col items-center md:justify-center p-4 md:p-8 ${inter.className} backdrop-blur-2xl`}
			>
				<div className="relative rounded-xl outline-none w-full max-w-[560px] shadow-lg">
					<textarea
						name="prompt"
						id="prompt"
						cols="30"
						rows="10"
						onChange={(e) => setParams(e.target.value)}
						className="bg-slate-100/80 dark:bg-slate-700/80 backdrop-blur-md rounded-lg p-2 ring-0 border-0 w-full focus:border-0 outline-none focus:outline-indigo-600 outline-2 outline-offset-4 placeholder-slate-300 dark:placeholder-slate-900"
						placeholder={`Add your ${placeholder} ... `}
					></textarea>

					<div className="absolute w-full bottom-[1px] left-0 ">
						<ul className="flex items-center justify-end p-2">
							<li className="rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 flex items-center gap-2  py-1 px-3 text-sm cursor-pointer">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 20 20"
									fill="currentColor"
									className="w-4 h-4"
								>
									<path
										fillRule="evenodd"
										d="M4.5 2A2.5 2.5 0 0 0 2 4.5v3.879a2.5 2.5 0 0 0 .732 1.767l7.5 7.5a2.5 2.5 0 0 0 3.536 0l3.878-3.878a2.5 2.5 0 0 0 0-3.536l-7.5-7.5A2.5 2.5 0 0 0 8.38 2H4.5ZM5 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
										clipRule="evenodd"
									/>
								</svg>

								<span>Label</span>
							</li>
						</ul>
						<div className="flex gap-4 items-center justify-between p-2 rounded-br-lg rounded-bl-lg bg-slate-200 dark:bg-slate-800">
							<button onClick={() => {}} className="text-slate-400 p-2 flex items-center gap-2">
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
								className="bg-indigo-700 text-white rounded-full py-2 px-6 disabled:hover:bg-indigo-500 disabled:cursor-not-allowed"
							>
								post
							</button>
						</div>
					</div>
				</div>

				<dd className="text-sm bg-slate-200 dark:bg-slate-800 text-slate-500 w-full max-w-[560px] -mt-4 pt-4 rounded-br-xl rounded-bl-xl">
					{results.map((result, idx) => (
						<ul
							key={idx}
							role="list"
							className="divide-y devide-slate-400 dark:divide-slate-700 rounded-md"
						>
							{Object.keys(result).map((key, idx) => (
								<li className="flex items-center justify-between p-2 text-sm leading-6">
									<div className="flex w-0 flex-1 items-center">
										<div className="ml-4 flex min-w-0 flex-1 gap-2">
											<span className="truncate font-medium">{key}</span>
										</div>
									</div>
									<div className="ml-4 flex-shrink-0">
										<span className="font-medium text-slate-400">{result[key]}</span>
									</div>
								</li>
							))}
						</ul>
					))}

					{link && (
						<div className="flex items-center justify-center p-4">
							<a
								href={link}
								download
								className="font-medium text-indigo-600 hover:text-indigo-500 dark:bg-slate-900 inline-block rounded-full px-6 py-3 text-center"
							>
								download csv
							</a>
						</div>
					)}
				</dd>
			</main>
		</>
	);
}
