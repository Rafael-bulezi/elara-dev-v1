import 'dotenv/config';
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

if (!resend) {
  console.warn("⚠️  RESEND_API_KEY is missing. Email notifications will be logged to the console instead of being sent.");
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  : null;

if (!supabaseAdmin) {
  console.warn("⚠️  SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_URL is missing. Server-side admin features (auto-confirm signup, admin APIs) are disabled.");
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;

  app.use(express.json());

  // API routes FIRST
  app.post("/api/notify", async (req, res) => {
    const { to, subject, data } = req.body;

    try {
      if (resend) {
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

  // Admin signup endpoint: creates a user with email confirmed,
  // bypassing the need to disable email confirmation in the dashboard.
  app.post("/api/auth/signup", async (req, res) => {
    if (!supabaseAdmin) {
      return res.status(500).json({ error: "Server-side Supabase admin is not configured." });
    }

    const { email, password, fullName, phone, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    try {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName || 'Usuário',
          phone: phone || '',
          role: role || 'buyer'
        }
      });

      if (error) throw error;
      res.json({ user: data.user });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(400).json({ error: (error as Error).message || "Failed to create account" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, allowedHosts: true },
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
