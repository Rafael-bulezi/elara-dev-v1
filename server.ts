import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.post("/api/notify", async (req, res) => {
    const { to, subject, data } = req.body;
    
    try {
      if (process.env.RESEND_API_KEY) {
        await resend.emails.send({
          from: 'onboarding@resend.dev', // Use your verified domain
          to: to,
          subject: subject,
          html: `<pre>${JSON.stringify(data, null, 2)}</pre>`
        });
      } else {
        console.log("RESEND_API_KEY not set, logging email to console instead");
        console.log(`To: ${to}, Subject: ${subject}, Data: ${JSON.stringify(data)}`);
      }
      
      res.json({ status: "ok" });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: "Failed to send email" });
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
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
