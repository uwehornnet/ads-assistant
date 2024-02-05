"use client";

import { useEffect, useState, useRef } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/router";

import Papa from "papaparse";

import Modal from "@/components/Modal";
import { Switch } from "@headlessui/react";

import DefaultLayout from "@/layouts/Default";

export default function Home() {
	const router = useRouter();
	const { data: session } = useSession();

	const inputRef = useRef();
	const [uploading, setUploading] = useState(false);

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const [link, setLink] = useState(null);
	const [results, setResults] = useState([]);
	const [showModal, setShowModal] = useState(false);

	const [variations, setVariations] = useState(3);
	const [keywords, setKeywords] = useState("airbag steering wheels, battery garden sparyer, exhaust resonator pipe");
	const [headline, setHeadline] = useState({
		state: true,
		length: 30,
	});
	const [description, setDescription] = useState({
		state: true,
		length: 90,
	});

	const toggleModal = (state) => {
		setShowModal(state);
	};

	const fetchData = async () => {
		try {
			if (loading) return;
			setShowModal(false);
			setLoading(true);
			setResults([]);
			const req = await fetch(`${location.origin}/api/google/ads/get`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					keywords: keywords.split(","),
					headline,
					description,
					variations,
				}),
			});
			const res = await req.json();
			if (res.status == "error") {
				setError(data.message);
				setTimeout(() => {
					setError(null);
				}, 3000);
			}
			setResults((prev) => [...prev, ...res.response.keywords]);
			setLoading(false);
		} catch (error) {
			setResults([]);
			setError(error);
			setLoading(false);
		}
	};

	const handleUploadCSV = (e) => {
		try {
			setUploading(true);

			const input = inputRef?.current;
			const reader = new FileReader();
			const [file] = input.files;

			reader.onloadend = ({ target }) => {
				const csv = Papa.parse(target.result, { header: true });

				const values = Object.values(csv.data)
					.filter((item) => {
						return Object.values(item)[0] !== "-";
					})
					.map((item) => {
						return Object.values(item)[0];
					});

				setKeywords(values.join(", "));
			};

			reader.readAsText(file);
			setUploading(false);
		} catch (error) {
			setError(error);
			setUploading(false);
		}
	};

	const getCSVFile = async () => {
		try {
			const res = await fetch(`${location.origin}/api/google/ads/upload`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					data: results,
				}),
			});

			const data = await res.json();

			if (data.status == "error") {
				setError(data.message);
				setTimeout(() => {
					setError(null);
				}, 3000);
			} else {
				window.open(data.location, "_blank");
			}
		} catch (error) {
			console.log(error);
			setError(error);
		}
	};

	// useEffect(() => {
	// 	if (!session) {
	// 		router.push({
	// 			pathname: "/auth/login",
	// 		});
	// 	}
	// }, []);

	return (
		<DefaultLayout>
			{error && (
				<div className="fixed top-0 left-0 md:right-2 md:top-2 md:left-auto w-full md:max-w-[400px] bg-red-300 border-t-4 border-red-600 z-[999] p-2 md:p-3 md:rounded-sm shadow-lg text-sm">
					{error}
				</div>
			)}
			<header className="bg-white dark:bg-slate-900 shadow">
				<div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
					<div className="relative outline-none w-full">
						<textarea
							name="prompt"
							id="prompt"
							cols="30"
							rows="4"
							value={keywords}
							onChange={(e) => setKeywords(e.target.value)}
							className="bg-slate-50 dark:bg-slate-800  backdrop-blur-md md:rounded-lg p-2 ring-0 border-0 w-full focus:border-0 outline-none focus:outline-blue-600 outline-2 outline-offset-4 placeholder-slate-800 dark:placeholder-slate-400 text-slate-800 dark:text-slate-400"
							placeholder={`Add your keywords here ... `}
						></textarea>

						<div className="md:absolute w-full bottom-[1px] left-0 ">
							<div className="flex flex-col sm:flex-row gap-4 items-center justify-end p-2 ">
								<label>
									<span className="text-blue-400 p-2 flex items-center gap-2 disabled:text-slate-700 disabled:cursor-not-allowed bg-slate-100 rounded-md cursor-pointer">
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
										<span>import from csv</span>
									</span>
									<input
										ref={inputRef}
										disabled={uploading}
										className="hidden"
										id="multiple_files"
										type="file"
										multiple
										onChange={handleUploadCSV}
									/>
								</label>
								<button
									onClick={() => toggleModal(true)}
									className="bg-blue-700 text-white rounded-md py-2 px-6 disabled:hover:bg-blue-500 disabled:cursor-not-allowed"
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
			<main className="relative pb-16">
				{results.length ? (
					<div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8 overflow-x-auto relative ">
						<div className="overflow-x-auto relative shadow-md sm:rounded-lg">
							<table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
								<thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
									<tr>
										<th scope="col" className="py-3 px-6">
											keyword
										</th>
										<th scope="col" className="py-3 px-6 whitespace-pre" colSpan={1}>
											headlines
										</th>
										<th scope="col" className="py-3 px-6 whitespace-pre" colSpan={1}>
											textlines
										</th>
									</tr>
								</thead>
								<tbody>
									{results.map((item, idx) => (
										<tr
											key={idx}
											className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
										>
											<td className="py-4 px-6 whitespace-pre">{item.keyword}</td>
											<td className="py-4 px-6 whitespace-pre">
												{item.headlines.length
													? item.headlines.map((headline, i) => <p key={i}>{headline}</p>)
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
					</div>
				) : null}
			</main>
			<Modal isOpen={showModal} toggle={toggleModal}>
				<>
					<div className="flex flex-col gap-2 my-8">
						<div className="grid">
							<input
								type="text"
								value={variations}
								onChange={(e) => {
									setVariations(e.target.value);
								}}
								className="ring-0 border-0 w-full focus:border-0 outline-none focus:outline-blue-600 outline-2 outline-offset-2 block p-2 rounded-md dark:bg-slate-700 dark:text-slate-200"
							/>
						</div>
						<div className="flex items-center justify-start">
							<label className="flex items-center gap-2 dark:text-slate-200">
								<Switch
									checked={headline.state}
									onChange={() => {
										setHeadline({ ...headline, state: !headline.state });
									}}
									className={`${
										headline.state ? "bg-blue-700" : "bg-gray-400 dark:bg-slate-500"
									} relative inline-flex h-6 w-11 items-center rounded-full`}
								>
									<span
										className={`${
											headline.state ? "translate-x-6" : "translate-x-1"
										} inline-block h-4 w-4 transform rounded-full bg-white transition`}
									/>
								</Switch>
								<span>Google Ads headline</span>
							</label>
							<div className="flex-1 flex items-center justify-end">
								<input
									type="text"
									value={headline.length}
									disabled={!headline.state}
									onChange={(e) => {
										setHeadline({ ...headline, length: e.target.value });
									}}
									className="ring-0 border-0 w-full focus:border-0 outline-none focus:outline-blue-600 outline-2 outline-offset-2 block max-w-[80px]  p-2 rounded-md dark:bg-slate-700 dark:text-slate-200 text-right disabled:text-slate-500 disabled:cursor-not-allowed"
								/>
							</div>
						</div>

						<div className="flex items-center justify-start">
							<label className="flex items-center gap-2 dark:text-slate-200">
								<Switch
									checked={description.state}
									onChange={() => {
										setDescription({ ...description, state: !description.state });
									}}
									className={`${
										description.state ? "bg-blue-700" : "bg-gray-400 dark:bg-slate-500"
									} relative inline-flex h-6 w-11 items-center rounded-full`}
								>
									<span
										className={`${
											description.state ? "translate-x-6" : "translate-x-1"
										} inline-block h-4 w-4 transform rounded-full bg-white transition`}
									/>
								</Switch>
								<span>Google Ads description</span>
							</label>
							<div className="flex-1 flex items-center justify-end">
								<input
									type="text"
									value={description.length}
									disabled={!description.state}
									onChange={(e) => {
										setDescription({ ...description, length: e.target.value });
									}}
									className="ring-0 border-0 w-full focus:border-0 outline-none focus:outline-blue-600 outline-2 outline-offset-2 block max-w-[80px]  p-2 rounded-md dark:bg-slate-700 dark:text-slate-200 text-right disabled:text-slate-500 disabled:cursor-not-allowed"
								/>
							</div>
						</div>
					</div>
					<div className="mt-4 flex items-center justify-start gap-4">
						<button
							type="button"
							className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
							onClick={() => setShowModal(false)}
						>
							cancle
						</button>
						<button
							type="button"
							className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 dark:bg-blue-700 dark:text-slate-300 dark:hover:bg-blue-700 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
							onClick={() => fetchData()}
						>
							generate
						</button>
					</div>
				</>
			</Modal>

			{results.length && !loading ? (
				<div className="fixed bottom-0 left-0 w-full dark:text-slate-300 bg-white dark:bg-slate-800">
					<div className="container mx-auto flex items-center justify-center gap-4 p-2 text-sm">
						<p>We have generated your suggestions. You can download them as csv: </p>
						<span
							onClick={getCSVFile}
							className="bg-blue-700 cursor-pointer text-white rounded-md py-2 px-6 disabled:hover:bg-blue-500 disabled:cursor-not-allowed flex items-center gap-2"
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
									d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
								/>
							</svg>

							<span className="text-sm">download</span>
						</span>
					</div>
				</div>
			) : null}
		</DefaultLayout>
	);
}
