import { mkdir, unlink } from "node:fs/promises";
import { join } from "node:path";
import { randomBytes } from "node:crypto";

const UPLOADS_DIR = "./uploads";
const API_KEY = process.env.API_KEY;
const MAX_FILE_SIZE = 30 * 1024 * 1024;

const ALLOWED_EXTENSIONS = new Set([
  ".pdf", ".docx", ".txt",
  ".png", ".jpg", ".jpeg", ".gif",
  ".mp4", ".mp3"
]);

if (!API_KEY) {
  console.error("API_KEY environment variable is required");
  process.exit(1);
}

await mkdir(UPLOADS_DIR, { recursive: true });

function getExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  return lastDot === -1 ? "" : filename.slice(lastDot).toLowerCase();
}

function getBaseName(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  return lastDot === -1 ? filename : filename.slice(0, lastDot);
}

function generateUniqueFilename(originalFilename: string): string {
  const ext = getExtension(originalFilename);
  const base = getBaseName(originalFilename);
  const uniqueId = randomBytes(8).toString("hex");
  return `${base}_${uniqueId}${ext}`;
}

function isAllowedFile(filename: string): boolean {
  return ALLOWED_EXTENSIONS.has(getExtension(filename));
}

async function serveFile(filename: string): Promise<Response> {
  const filePath = join(UPLOADS_DIR, filename);
  const file = Bun.file(filePath);
  
  if (!(await file.exists())) {
    return new Response("File not found", { status: 404 });
  }
  
  return new Response(file);
}

const server = Bun.serve({
  port: process.env.PORT ?? 3000,
  
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;
    
    if (path === "/upload" && req.method === "POST") {
      const authHeader = req.headers.get("Authorization");
      const providedKey = authHeader?.replace("Bearer ", "");
      
      if (providedKey !== API_KEY) {
        return new Response("Unauthorized", { status: 401 });
      }
      
      try {
        const contentType = req.headers.get("content-type") || "";
        let originalFilename: string | null = null;
        let data: ArrayBuffer;
        
        if (contentType.includes("multipart/form-data")) {
          const formData = await req.formData();
          const file = formData.get("file");
          
          if (!(file instanceof File)) {
            return new Response("No file provided", { status: 400 });
          }
          
          originalFilename = file.name;
          data = await file.arrayBuffer();
        } else {
          originalFilename = req.headers.get("X-Filename") || url.searchParams.get("filename");
          
          if (!originalFilename) {
            return new Response("Filename required via X-Filename header or ?filename= query param", { status: 400 });
          }
          
          data = await req.arrayBuffer();
        }
        
        if (!isAllowedFile(originalFilename)) {
          return new Response(`File type not allowed. Allowed: ${[...ALLOWED_EXTENSIONS].join(", ")}`, { status: 400 });
        }
        
        if (data.byteLength > MAX_FILE_SIZE) {
          return new Response(`File too large. Maximum size is 30MB`, { status: 413 });
        }
        
        const uniqueFilename = generateUniqueFilename(originalFilename);
        const filePath = join(UPLOADS_DIR, uniqueFilename);
        await Bun.write(filePath, data);
        
        return new Response(JSON.stringify({ 
          success: true, 
          filename: uniqueFilename,
          originalFilename,
          url: `/${uniqueFilename}`
        }), {
          headers: { "Content-Type": "application/json" }
        });
      } catch (error) {
        console.error("Upload error:", error);
        return new Response("Upload failed", { status: 500 });
      }
    }
    
    if (path.startsWith("/delete/") && req.method === "DELETE") {
      const authHeader = req.headers.get("Authorization");
      const providedKey = authHeader?.replace("Bearer ", "");
      
      if (providedKey !== API_KEY) {
        return new Response("Unauthorized", { status: 401 });
      }
      
      const filename = path.slice("/delete/".length);
      
      if (!filename) {
        return new Response("Filename required", { status: 400 });
      }
      
      const filePath = join(UPLOADS_DIR, filename);
      const file = Bun.file(filePath);
      
      if (!(await file.exists())) {
        return new Response("File not found", { status: 404 });
      }
      
      try {
        await unlink(filePath);
        
        return new Response(JSON.stringify({ 
          success: true, 
          filename,
          message: "File deleted"
        }), {
          headers: { "Content-Type": "application/json" }
        });
      } catch (error) {
        console.error("Delete error:", error);
        return new Response("Delete failed", { status: 500 });
      }
    }
    
    if (path.length > 1) {
      const filename = path.slice(1);
      return serveFile(filename);
    }
    
    return new Response("Not found", { status: 404 });
  },
});

console.log(`File storage server running at http://localhost:${server.port}`);
