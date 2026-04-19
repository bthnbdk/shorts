import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { exec, spawn } from "child_process";
import fs from "fs/promises";
import { existsSync } from "fs";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory store for tracking simulated generation jobs
  const runningJobs = new Map();

  // Python backend status endpoints
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Check dependencies
  app.get("/api/check-dependencies", async (req, res) => {
    // Simulated dependency check
    // In a real scenario, this would execute `python check_deps.py` or similar
    const deps = {
      python: true,
      ffmpeg: true,
      ollama: true,
      diffusers: true,
      kokoro: true,
      whisper: true,
      librosa: true,
      ipadapter: true,
      film: true
    };
    // Let's pretend checking takes a second
    setTimeout(() => {
      res.json({ ready: true, dependencies: deps });
    }, 1000);
  });

  // Start a job
  app.post("/api/jobs", (req, res) => {
    const { id, concept, style, voice, isBatch } = req.body;
    
    // Instead of actually spawning python (which would crash our container or take hours),
    // we bridge this to our mock running job behavior (or optionally we could run a real script if the container had python).
    // For demonstration of "triggering local terminal commands", we'll simulate the script execution with sub-process
    
    // Example of how we'd actually spawn python:
    // const pythonProcess = spawn('python', ['-u', 'pipeline.py', '--concept', concept, '--style', style, '--voice', voice]);
    // pythonProcess.stdout.on('data', (data) => console.log(data.toString()));
    
    const jobId = id || `#LS-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    
    runningJobs.set(jobId, {
      id: jobId,
      status: "queued",
      progress: 0,
      elapsedMs: 0,
      logs: [],
    });

    res.json({ jobId });
  });

  app.get("/api/jobs/:id", (req, res) => {
    const job = runningJobs.get(req.params.id);
    if (!job) return res.status(404).json({ error: "Not found" });
    res.json(job);
  });
  
  app.delete("/api/jobs/:id", (req, res) => {
    // Terminate process logic would go here
    runningJobs.delete(req.params.id);
    res.json({ success: true });
  });

  // Retry/Resume logic
  app.post("/api/jobs/:id/retry", (req, res) => {
    const { stage } = req.body;
    const job = runningJobs.get(req.params.id);
    if (!job) return res.status(404).json({ error: "Not found" });
    
    job.status = stage || "generating_script";
    job.error = undefined;
    
    // In actual implementation: python pipeline.py --resume-from $stage --job-id $id
    // spawn('python', ['pipeline.py', '--resume-from', stage, '--job-id', job.id]);

    res.json({ success: true, job });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Dist mapping for production
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
