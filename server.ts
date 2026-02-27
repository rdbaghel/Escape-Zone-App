
import express from "express";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Auth Notification
  app.post("/api/auth/notify", async (req, res) => {
    const { name, provider, email, phone, type } = req.body;
    
    const adminEmail = process.env.ADMIN_EMAIL || "devbaghel0061@gmail.com";
    const senderEmail = process.env.SENDER_EMAIL;
    const senderPass = process.env.SENDER_PASSWORD;

    if (!senderEmail || !senderPass) {
      console.warn("Email credentials not configured. Skipping notification.");
      return res.json({ success: true, message: "Notification skipped (no credentials)" });
    }

    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: senderEmail,
          pass: senderPass,
        },
      });

      const mailOptions = {
        from: senderEmail,
        to: adminEmail,
        subject: `New Login Alert: ${name} via ${provider}`,
        text: `
          New user activity detected:
          Type: ${type} (Login/Signup)
          Name: ${name}
          Provider: ${provider}
          Email: ${email || 'N/A'}
          Phone: ${phone || 'N/A'}
          Time: ${new Date().toLocaleString()}
        `,
      };

      await transporter.sendMail(mailOptions);
      res.json({ success: true });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ success: false, error: "Failed to send notification" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
