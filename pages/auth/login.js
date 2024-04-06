import { useState } from "react";
import DefaultLayout from "@/layouts/Default";
import { useRouter } from "next/router";
import { signIn, csrfToken } from "next-auth/react";

export default function LoginPage() {
	const [error, setError] = useState(null);
	const router = useRouter();

	const handleSubmit = async (e) => {
		e.preventDefault();

		const formData = new FormData(e.currentTarget);

		const result = await signIn("credentials", {
			redirect: false,
			username: formData.get("username"),
			password: formData.get("password"),
		});

		if (result.error) {
			setError("Username or password is incorrect");
			setTimeout(() => {
				setError(null);
			}, 3000);
		}

		if (result.ok) {
			router.push("/dashboard");
		}
	};

	return (
		<DefaultLayout>
			{error && (
				<div className="fixed top-0 left-0 md:right-2 md:top-2 md:left-auto w-full md:max-w-[400px] bg-red-300 border-t-4 border-red-600 z-[999] p-2 md:p-3 md:rounded-sm shadow-lg text-sm">
					{error}
				</div>
			)}
			<div className="flex flex-col items-center justify-center h-screen">
				<div className="max-w-md w-full space-y-8 p-4">
					<div>
						<img className="mx-auto h-16 w-auto" src="/logo.png" alt="Kwooza Ads Tool" />
						<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
							Sign in to your account
						</h2>
					</div>
					<form className="mt-8 space-y-6" method="post" onSubmit={handleSubmit}>
						<input name="csrfToken" type="hidden" defaultValue={csrfToken} />
						<div className="rounded-md shadow-sm -space-y-px">
							<label htmlFor="username" className="sr-only">
								Username
							</label>
							<input
								id="username"
								name="username"
								type="text"
								autoComplete="username"
								required
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
								placeholder="Username"
							/>
							<label htmlFor="password" className="sr-only">
								Password
							</label>
							<input
								id="password"
								name="password"
								type="password"
								autoComplete="current-password"
								required
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
								placeholder="Password"
							/>
						</div>

						<div>
							<button
								type="submit"
								className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
							>
								<span className="absolute left-0 inset-y-0 flex items-center pl-3"></span>
								Sign in
							</button>
						</div>
					</form>
				</div>
			</div>
		</DefaultLayout>
	);
}
