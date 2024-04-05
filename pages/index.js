"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

import DefaultLayout from "../layouts/Default";

export default function Home() {
	const router = useRouter();
	const { data: session } = useSession();

	return (
		<DefaultLayout>
			<main className="container mx-auto">
				<div className="flex flex-col items-center justify-center h-screen">
					<div className="max-w-sm w-full space-y-8">
						<div>
							<img className="mx-auto h-16 w-auto" src="/logo.png" alt="Kwooza Ads Tool" />
							<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
								Sign in to your account
							</h2>
						</div>
						<div>
							{session ? (
								<button
									onClick={() => router.push("/dashboard")}
									className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
								>
									Go to Dashboard
								</button>
							) : (
								<button
									onClick={() => router.push("/auth/login")}
									className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
								>
									<span className="absolute left-0 inset-y-0 flex items-center pl-3"></span>
									Sign in
								</button>
							)}
						</div>
					</div>
				</div>
			</main>
		</DefaultLayout>
	);
}
