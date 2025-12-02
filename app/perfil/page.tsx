"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../lib/firebase";
import { getFirestore } from "firebase/firestore";
const db = getFirestore();
import { onAuthStateChanged, signOut, updateProfile, User } from "firebase/auth";
import { doc, getDoc, setDoc, getDocs, collection } from "firebase/firestore";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [userHistory, setUserHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    displayName: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setDisplayName(u?.displayName ?? "");
      
      // Load additional user profile data from Firestore
      if (u?.uid) {
        loadUserProfile(u.uid);
        loadUserHistory(u.uid);
      } else {
        setProfileLoading(false);
        setHistoryLoading(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (userProfile) {
      setEditFormData({
        displayName: userProfile.displayName ?? "",
        phone: userProfile.phone ?? "",
        address: userProfile.address ?? "",
      });
    }
  }, [userProfile]);

  async function loadUserProfile(uid: string) {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
      }
    } catch (err) {
      console.warn("Error loading user profile:", err);
      setProfileError("No se pudo cargar el perfil. Comprueba permisos de Firestore.");
    } finally {
      setProfileLoading(false);
    }
  }

  async function loadUserHistory(uid: string) {
    try {
      const historyCol = collection(db, "users", uid, "history");
      const snap = await getDocs(historyCol);
      const items: any[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      items.sort((a: any, b: any) => {
        const ta = a.viewedAt?.seconds ? a.viewedAt.seconds * 1000 : a.viewedAt ? new Date(a.viewedAt).getTime() : 0;
        const tb = b.viewedAt?.seconds ? b.viewedAt.seconds * 1000 : b.viewedAt ? new Date(b.viewedAt).getTime() : 0;
        return tb - ta;
      });
      setUserHistory(items);
    } catch (err) {
      console.warn("Error loading user history:", err);
      setHistoryError("No tienes permisos para ver el historial o ocurrió un error al leer Firestore.");
    } finally {
      setHistoryLoading(false);
    }
  }

  function formatDate(ts: any) {
    if (!ts) return "-";
    if (ts.seconds) return new Date(ts.seconds * 1000).toLocaleString();
    const d = new Date(ts);
    if (!isNaN(d.getTime())) return d.toLocaleString();
    return String(ts);
  }

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
      
      // Update display name in Firebase Auth
      await updateProfile(current, { displayName: editFormData.displayName });
      
      // Create or update profile document in Firestore (merge so missing doc is created)
      await setDoc(
        doc(db, "users", current.uid),
        {
          displayName: editFormData.displayName,
          phone: editFormData.phone,
          address: editFormData.address,
          updatedAt: new Date(),
        },
        { merge: true }
      );
      
      // Refresh local user reference from Firebase Auth
      setUser(auth.currentUser as User);
      setUserProfile((prev: any) => ({
        ...prev,
        displayName: editFormData.displayName,
        phone: editFormData.phone,
        address: editFormData.address,
      }));
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
                  <Link href="/perfil/pagos" className="w-full inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-800 px-4 py-2 font-medium mb-2">
                    Métodos de pago
                  </Link>
                  <button onClick={handleSignOut} className="w-full inline-flex items-center justify-center rounded-xl bg-purple-500 hover:bg-purple-400 text-white px-4 py-2 font-medium">
                    Cerrar sesión
                  </button>
                </div>

                {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
              </div>
            </div>

            <div className="mt-6 bg-white rounded-2xl border border-purple-200 p-4 shadow-sm">
              <h4 className="font-semibold text-slate-900">Contacto</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-slate-700">Email:</span>
                  <p className="text-slate-600">{user.email}</p>
                </div>
                {userProfile?.phone && (
                  <div>
                    <span className="font-medium text-slate-700">Teléfono:</span>
                    <p className="text-slate-600">{userProfile.phone}</p>
                  </div>
                )}
                {userProfile?.address && (
                  <div>
                    <span className="font-medium text-slate-700">Dirección:</span>
                    <p className="text-slate-600">{userProfile.address}</p>
                  </div>
                )}
                {!userProfile?.phone && !userProfile?.address && (
                  <p className="text-slate-500 italic">Completa tu información de contacto en la sección de perfil.</p>
                )}
              </div>
            </div>
            <div className="mt-6 bg-white rounded-2xl border border-purple-200 p-4 shadow-sm">
              <h4 className="font-semibold text-slate-900">Historial de subastas vistas</h4>
              {historyError && <p className="mt-2 text-sm text-red-500">{historyError}</p>}
              <div className="mt-3 space-y-3 text-sm">
                {historyLoading ? (
                  <div className="text-slate-600">Cargando historial...</div>
                ) : userHistory.length === 0 ? (
                  <div className="text-slate-500 italic">No has visto subastas todavía.</div>
                ) : (
                  userHistory.map((it) => (
                    <div key={it.id} className="flex items-center gap-3">
                      {it.imageURL ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={it.imageURL} alt={it.title ?? 'item'} className="h-12 w-12 rounded-md object-cover" />
                      ) : (
                        <div className="h-12 w-12 rounded-md bg-purple-50 flex items-center justify-center text-purple-600 font-medium">S</div>
                      )}
                      <div className="flex-1">
                        <div className="text-slate-800">{it.title ?? `Subasta ${it.itemId ?? it.id}`}</div>
                        <div className="text-xs text-slate-500">{formatDate(it.viewedAt)}</div>
                      </div>
                      {it.itemId && (
                        <Link href={`/auctions/${it.itemId}`} className="text-sm text-purple-600 hover:underline">Ver</Link>
                      )}
                    </div>
                  ))
                )}
              </div>
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
                  <form onSubmit={handleSave} className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Nombre completo</label>
                      <input 
                        type="text"
                        value={editFormData.displayName} 
                        onChange={(e) => setEditFormData({ ...editFormData, displayName: e.target.value })} 
                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900" 
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700">Número de Teléfono</label>
                      <input 
                        type="tel"
                        value={editFormData.phone} 
                        onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })} 
                        placeholder="Ej: +34 123 456 789"
                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900" 
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700">Dirección</label>
                      <input 
                        type="text"
                        value={editFormData.address} 
                        onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })} 
                        placeholder="Ej: Calle Principal 123, Ciudad"
                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-900" 
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button type="submit" disabled={saving} className="inline-flex items-center rounded-xl bg-purple-500 hover:bg-purple-400 text-white px-4 py-2 font-medium disabled:opacity-50">
                        {saving ? "Guardando..." : "Guardar cambios"}
                      </button>
                      <button type="button" onClick={() => setEditing(false)} className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2 font-medium">
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}

                {!editing && (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Teléfono</label>
                      <div className="mt-1 text-slate-900">{userProfile?.phone ?? "-"}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Dirección</label>
                      <div className="mt-1 text-slate-900">{userProfile?.address ?? "-"}</div>
                    </div>
                  </div>
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
