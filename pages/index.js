"use client";

import { useEffect, useState, useRef } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/router";

import DefaultLayout from "../layouts/Default";

import prisma from "../lib/prisma";

export default function Home(props) {
	const [queues, setQueues] = useState([]);
	const [error, setError] = useState(null);

	const { data: session } = useSession();

	const fetchQueues = async () => {
		try {
			const res = await fetch(`/api/queues/get`);
			const data = await res.json();
			if (data.status === "error") {
				setError(data.message);
			} else {
				setQueues(data.message);
			}
		} catch (error) {
			setError(error.message);
		}
	};

	useEffect(() => {
		fetchQueues();
	}, []);

	return (
		<DefaultLayout>
			{error && (
				<div className="fixed top-0 left-0 md:right-2 md:top-2 md:left-auto w-full md:max-w-[400px] bg-red-300 border-t-4 border-red-600 z-[999] p-2 md:p-3 md:rounded-sm shadow-lg text-sm">
					{error}
				</div>
			)}

			<main className="container mx-auto">
				{queues && (
					<ul className="mt-4">
						{queues.map((queue) => (
							<li
								key={queue.id}
								className="grid grid-cols-4 gap-3 bg-slate-200 dark:bg-slate-800 text-slate-400  rounded-md p-2 mb-2"
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
							</li>
						))}
					</ul>
				)}
			</main>
		</DefaultLayout>
	);
}
