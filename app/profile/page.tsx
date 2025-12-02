"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../lib/firebase";
import { onAuthStateChanged, signOut, updateProfile, User } from "firebase/auth";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setDisplayName(u?.displayName ?? "");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  async function handleSignOut() {
    try {
      await signOut(auth);
      router.push("/");
    } catch (err) {
      console.error("Error signing out", err);
      setError("Error al cerrar sesión. Intenta de nuevo.");
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError(null);

    try {
      const current = auth.currentUser;
      if (!current) throw new Error("No authenticated user");
      await updateProfile(current, { displayName });
      // Refresh local user reference from Firebase Auth
      setUser(auth.currentUser as User);
      setEditing(false);
    } catch (err) {
      console.error("Error updating profile", err);
      setError("No se pudo actualizar el perfil. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  function initials(name?: string | null) {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-slate-600">Cargando perfil...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <h2 className="text-2xl font-semibold mb-2">No has iniciado sesión</h2>
        <p className="text-slate-600 mb-6">Inicia sesión para ver y editar tu perfil.</p>
        <div className="flex gap-3">
          <Link href="/Login" className="inline-flex items-center rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-semibold px-4 py-2">
            Iniciar sesión
          </Link>
          <Link href="/Signup" className="inline-flex items-center rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold px-4 py-2">
            Registrarse
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="relative overflow-hidden bg-purple-50 text-slate-900 py-12">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-sky-500/5 to-fuchsia-500/10" />
      <div className="max-w-4xl mx-auto px-4 relative">
        <div className="grid md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl border border-purple-200 p-6 shadow">
              <div className="flex flex-col items-center">
                {user.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.photoURL} alt="avatar" className="h-28 w-28 rounded-full object-cover mb-4" />
                ) : (
                  <div className="h-28 w-28 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-2xl mb-4">{initials(user.displayName ?? user.email)}</div>
                )}

                <div className="text-center">
                  <div className="font-semibold text-slate-900 text-lg">{user.displayName ?? "Usuario"}</div>
                  <div className="text-sm text-slate-600">{user.email}</div>
                </div>

                <div className="mt-6 w-full">
                  <button onClick={() => setEditing((s) => !s)} className="w-full inline-flex items-center justify-center rounded-xl border border-purple-200 bg-white text-purple-700 px-4 py-2 font-medium mb-2">
                    {editing ? "Cancelar" : "Editar perfil"}
                  </button>
                  <button onClick={handleSignOut} className="w-full inline-flex items-center justify-center rounded-xl bg-purple-500 hover:bg-purple-400 text-white px-4 py-2 font-medium">
                    Cerrar sesión
                  </button>
                </div>

                {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
              </div>
            </div>

            <div className="mt-6 bg-white rounded-2xl border border-purple-200 p-4 shadow-sm">
              <h4 className="font-semibold text-slate-900">Contacto</h4>
              <p className="text-slate-600">support@claim.com</p>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl border border-purple-200 p-8 shadow">
              <h2 className="text-2xl font-semibold mb-4">Perfil de usuario</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Nombre</label>
                  <div className="mt-1 text-slate-900">{user.displayName ?? "-"}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Email</label>
                  <div className="mt-1 text-slate-900">{user.email}</div>
                </div>

                {editing && (
                  <form onSubmit={handleSave} className="mt-4">
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-slate-700">Nuevo nombre</label>
                      <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2" />
                    </div>

                    <div className="flex gap-3">
                      <button type="submit" disabled={saving} className="inline-flex items-center rounded-xl bg-purple-500 hover:bg-purple-400 text-white px-4 py-2 font-medium disabled:opacity-50">
                        {saving ? "Guardando..." : "Guardar"}
                      </button>
                      <button type="button" onClick={() => { setEditing(false); setDisplayName(user.displayName ?? ""); }} className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2 font-medium">
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            <div className="mt-6 text-sm text-slate-600">
              <p>
                Aquí puedes revisar la información básica de tu cuenta. Para cambiar el correo o contraseña, usa la opción de configuración de cuenta o contacta con soporte.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
