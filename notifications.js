import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import notifier from "node-notifier";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({ status: "Notification Service is running" });
});

// Handle notification requests
app.post("/send-notification", async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ status: "error", message: "Text is required" });
        }

        console.log(`📢 Attempting to send notification: ${text}`);

        // Send a system notification with a button
        notifier.notify({
            title: "your event is now bookmarked!",
            message: text,
            sound: true, // 🔊 Play a sound
            wait: true,  // ⏳ Keep window open until user interacts
            timeout: 10, // ⏲️ Keep the notification open for 10 seconds
            closeLabel: "OK", // 🆗 Button text
            actions: ["OK"], // Button actions
        });

        res.json({ status: "success", message: "Notification sent successfully" });

    } catch (error) {
        console.error("🚨 Unexpected error:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Notification microservice running on http://localhost:${PORT}`);
});