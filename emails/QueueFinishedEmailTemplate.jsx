import { Html } from "@react-email/html";
import { Text } from "@react-email/text";
import { Img } from "@react-email/img";
import { Section } from "@react-email/section";
import { Container } from "@react-email/container";
import { Button } from "@react-email/button";

export default function QueueFinishedEmail({ id = null }) {
	return (
		<Html>
			<Section style={styles.main}>
				<Container style={styles.container}>
					<Section style={styles.header}>
						<Img
							src="https://main.d3v2hlimzxc6vd.amplifyapp.com/logo.png"
							alt="Kwooza"
							width="320"
							style={styles.image}
						/>
					</Section>

					<Section style={styles.body}>
						<Text style={styles.heading}>Hi there, </Text>
						<Text style={styles.paragraph}>Unlock Your Potential with Kwooza!</Text>
						<Text style={styles.paragraph}>
							{`Your Queue ${
								id ? `with the ID #${id}` : ""
							} has been processed. Checkout the dashboard to view all changes
							or export the data.`}
						</Text>
						<Button style={styles.button} href="https://main.d3v2hlimzxc6vd.amplifyapp.com/dashboard">
							go to dashboard
						</Button>
					</Section>
				</Container>
				<Text style={styles.footer}>Reach new heights with Kwooza's rocket-powered journey to the moon!</Text>
			</Section>
		</Html>
	);
}

const styles = {
	main: {
		backgroundColor: "white",
	},
	container: {
		margin: "0 auto",
		padding: "0px",
		width: "580px",
		backgroundColor: "white",
		fontFamily: '"Helvetica Neue", sans-serif',
		border: "1px solid whitesmoke",
	},
	header: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "whitesmoke",
		padding: 24,
	},
	body: {
		padding: 24,
	},
	image: { margin: "0px auto" },
	heading: {
		fontSize: "32px",
		lineHeight: "1.3",
		fontWeight: "700",
		color: "#484848",
	},
	paragraph: {
		fontSize: "18px",
		lineHeight: "1.4",
		color: "#484848",
	},
	button: {
		padding: "12px 24px",
		backgroundColor: "blue",
		color: "white",
		cursor: "pointer",
	},
	footer: {
		fontSize: "10px",
		color: "gray",
		textAlign: "center",
		fontFamily: '"Helvetica Neue", sans-serif',
	},
};
