import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export default NextAuth({
	session: {
		strategy: "jwt",
	},
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				username: { label: "Username", type: "text", placeholder: "jsmith" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials, req) {
				const { username, password } = credentials;
				const user = { username: process.env.CREDENTIALS_EMAIL, password: process.env.CREDENTIALS_PASSWORD };
				if (user.username === username && user.password === password) {
					return user;
				} else {
					return null;
				}
			},
		}),
	],
	pages: {
		signIn: "/auth/login",
	},
});
