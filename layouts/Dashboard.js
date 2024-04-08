import { useSession, signOut } from "next-auth/react";
import { Disclosure } from "@headlessui/react";
import { useRouter } from "next/router";

function classNames(...classes) {
	return classes.filter(Boolean).join(" ");
}

export default function DashboardLayout({ children }) {
	const { data: session } = useSession();
	const router = useRouter();
	console.log(router.pathname);

	return (
		<div className="min-h-full">
			{session ? (
				<Disclosure as="nav" className="bg-gray-800 sticky top-0 self-start z-50">
					{({ open }) => (
						<>
							<div className="mx-auto container px-4">
								<div className="flex h-16 items-center justify-between">
									<div className="flex items-center">
										<div className="flex-shrink-0">
											<img className="h-8 w-auto" src="/logo.png" alt="Kwooza Ads Tool" />
										</div>
										<div className="block">
											<div className="ml-10 flex items-baseline space-x-4">
												<a
													href="/queue/create"
													className={classNames(
														router.pathname == "queue/create"
															? "bg-blue-700 dark:bg-slate-700 text-white"
															: "text-gray-300 bg-gray-700/20 hover:bg-gray-700 hover:text-white",
														"rounded-md px-3 py-2 text-sm font-medium flex items-center gap-2"
													)}
													aria-current="page"
												>
													<svg
														xmlns="http://www.w3.org/2000/svg"
														fill="none"
														viewBox="0 0 24 24"
														strokeWidth={1.5}
														stroke="currentColor"
														className="w-4 h-4"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															d="M12 4.5v15m7.5-7.5h-15"
														/>
													</svg>

													<span className="hidden md:block">create Queue</span>
												</a>
											</div>
										</div>
									</div>
									<div className="block">
										<div className="ml-4 flex items-center md:ml-6">
											<button
												onClick={() => signOut()}
												type="button"
												className="flex items-center gap-3 text-gray-300 bg-gray-700/20 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium"
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													viewBox="0 0 20 20"
													fill="currentColor"
													className="w-5 h-5"
												>
													<path
														fillRule="evenodd"
														d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Z"
														clipRule="evenodd"
													/>
													<path
														fillRule="evenodd"
														d="M6 10a.75.75 0 0 1 .75-.75h9.546l-1.048-.943a.75.75 0 1 1 1.004-1.114l2.5 2.25a.75.75 0 0 1 0 1.114l-2.5 2.25a.75.75 0 1 1-1.004-1.114l1.048-.943H6.75A.75.75 0 0 1 6 10Z"
														clipRule="evenodd"
													/>
												</svg>
												<span className="hidden md:block">sing out</span>
											</button>
										</div>
									</div>
								</div>
							</div>
						</>
					)}
				</Disclosure>
			) : null}

			{children}
		</div>
	);
}
