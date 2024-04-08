import nodemailer from "nodemailer";

const smtpOptions = {
	host: process.env.SMTP_HOST || "live.smtp.mailtrap.io",
	port: parseInt(process.env.SMTP_PORT || "587"),
	secure: false,
	auth: {
		user: process.env.SMTP_USER || "api",
		pass: process.env.SMTP_PASSWORD || "9b60a24cf0c6f27e6873d8e4c9bdf73f",
	},
};

export const sendEmail = async (data) => {
	const transporter = nodemailer.createTransport({
		...smtpOptions,
	});

	return await transporter.sendMail({
		from: "mailtrap@demomailtrap.com",
		...data,
	});
};
