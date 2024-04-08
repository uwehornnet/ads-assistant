import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { createAd, sendMail } from "@/inngest/functions";

// Create an API that serves zero functions
export default serve({
	client: inngest,
	functions: [createAd, sendMail],
});
