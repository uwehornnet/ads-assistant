import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = `${process.env.POSTGRES_URL}`;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

let prisma;

if (process.env.NODE_ENV === "production") {
	prisma = new PrismaClient({ adapter });
} else {
	if (!global.prisma) {
		global.prisma = new PrismaClient({ adapter });
	}
	prisma = global.prisma;
}

export default prisma;
