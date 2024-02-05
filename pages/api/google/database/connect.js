import { sql } from "@vercel/postgres";

export default async function handler(req, res) {
	try {
		const TABLE_NAME = "queue";
		await sql`CREATE TABLE IF NOT EXISTS Pets ( Name varchar(255), Owner varchar(255) );`;
		await sql`INSERT INTO Pets (Name, Owner) VALUES (Klaus, Uwe);`;

		// await sql`CREATE TABLE IF NOT EXISTS ${TABLE_NAME} ( uid varchar(255), data varchar(255), state varchar(255) );`;
		// await sql`INSERT INTO ${TABLE_NAME} ${sql([{ uid: uniqueId(), data: "", state: "pending" }])}`;
		const data = await sql`SELECT * FROM Pets`;
		console.log("Connected to database.", data);

		return res.status(200).json({ status: "success", data });
	} catch (error) {
		res.status(500).json({ status: "error", message: error.message });
	}
}
