// Inicia/cierra sesión de admin también en Supabase (mismo email y contraseña que en Firebase),
// para que quien es admin en una página lo sea también en "Anónimos".
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm";
const sb = createClient('https://stedlptzaukqewtkzotg.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0ZWRscHR6YXVrcWV3dGt6b3RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI3MzY3NzQsImV4cCI6MjEwODMxMjc3NH0.XArszBzP49sWHka1xIXJVTQQiC-QEHczafQ8G3mF7qc');
export async function supaSignIn(email, pass){ const { error } = await sb.auth.signInWithPassword({ email, password: pass }); return !error; }
export async function supaSignOut(){ await sb.auth.signOut(); }
