"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "../../lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  deleteDoc,
  doc,
} from "firebase/firestore";

const db = getFirestore();

export default function PaymentMethodsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<any[]>([]);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    cardholder: "",
    number: "",
    expMonth: "",
    expYear: "",
  });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u?.uid) loadCards(u.uid);
      else {
        setCards([]);
        setCardsLoading(false);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  async function loadCards(uid: string) {
    setCardsLoading(true);
    setError(null);
    try {
      const snap = await getDocs(collection(db, "users", uid, "cards"));
      const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      // newest first
      items.sort((a, b) => (a.createdAt?.seconds || 0) < (b.createdAt?.seconds || 0) ? 1 : -1);
      setCards(items);
    } catch (err) {
      console.warn("Error loading cards:", err);
      setError("No se pudieron cargar los métodos de pago. Comprueba permisos de Firestore.");
    } finally {
      setCardsLoading(false);
    }
  }

  function detectBrand(number: string) {
    const n = number.replace(/\D/g, "");
    if (n.startsWith("4")) return "Visa";
    if (/^(5[1-5])/.test(n)) return "Mastercard";
    if (/^(34|37)/.test(n)) return "Amex";
    return "Unknown";
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return router.push("/Login");
    setAdding(true);
    setError(null);
    try {
      const pn = form.number.replace(/\D/g, "");
      if (pn.length < 12) throw new Error("Número de tarjeta inválido");
      const last4 = pn.slice(-4);
      const brand = detectBrand(pn);

      // IMPORTANT: we do NOT store full PAN. We only store token/last4/brand/exp
      const token = `tok_${Math.random().toString(36).slice(2, 10)}`;

      await addDoc(collection(db, "users", user.uid, "cards"), {
        cardholder: form.cardholder || null,
        last4,
        brand,
        expMonth: form.expMonth || null,
        expYear: form.expYear || null,
        token,
        createdAt: serverTimestamp(),
      });

      setForm({ cardholder: "", number: "", expMonth: "", expYear: "" });
      await loadCards(user.uid);
    } catch (err: any) {
      console.warn("Error adding card:", err);
      setError(err?.message || "Error al agregar método de pago");
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(cardId: string) {
    if (!user) return;
    if (!confirm("¿Eliminar este método de pago?")) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "cards", cardId));
      setCards((c) => c.filter((x) => x.id !== cardId));
    } catch (err) {
      console.warn("Error deleting card:", err);
      setError("No se pudo eliminar el método de pago");
    }
  }

  if (loading) return <div className="p-8">Cargando...</div>;

  if (!user)
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-xl font-semibold mb-2">Inicia sesión</h2>
        <p className="mb-4">Necesitas iniciar sesión para ver tus métodos de pago.</p>
        <div className="flex gap-3">
          <Link href="/Login" className="px-4 py-2 bg-purple-500 text-white rounded-xl">Iniciar sesión</Link>
          <Link href="/Signup" className="px-4 py-2 bg-slate-800 text-white rounded-xl">Registrarse</Link>
        </div>
      </div>
    );

  return (
    <section className="py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Métodos de pago</h1>
          <Link href="/perfil" className="text-sm text-slate-600 hover:underline">Volver al perfil</Link>
        </div>

        <div className="bg-white rounded-2xl border p-6 mb-6">
          <h3 className="font-medium mb-3">Tus tarjetas</h3>
          {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
          {cardsLoading ? (
            <div className="text-slate-600">Cargando métodos...</div>
          ) : cards.length === 0 ? (
            <div className="text-slate-500 italic">No tienes métodos de pago guardados.</div>
          ) : (
            <ul className="space-y-3">
              {cards.map((c) => (
                <li key={c.id} className="flex items-center justify-between border rounded-md p-3">
                  <div>
                    <div className="font-medium">{c.brand ?? "Tarjeta"} •••• {c.last4}</div>
                    <div className="text-xs text-slate-500">{c.cardholder ?? "-"} • Exp: {c.expMonth ?? "--"}/{c.expYear ?? "--"}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleDelete(c.id)} className="text-sm text-red-600">Eliminar</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-2xl border p-6">
          <h3 className="font-medium mb-3">Agregar nuevo método</h3>
          <p className="text-sm text-slate-500 mb-4">Nota: por seguridad, sólo se guarda el último 4 dígitos y la marca. No se almacenan números completos.</p>
          <form onSubmit={handleAdd} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">Nombre en la tarjeta</label>
              <input value={form.cardholder} onChange={(e) => setForm({ ...form, cardholder: e.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Número de tarjeta</label>
              <input value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} placeholder="•••• •••• •••• 4242" className="mt-1 w-full rounded-xl border px-3 py-2" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700">Mes (MM)</label>
                <input value={form.expMonth} onChange={(e) => setForm({ ...form, expMonth: e.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Año (YYYY)</label>
                <input value={form.expYear} onChange={(e) => setForm({ ...form, expYear: e.target.value })} className="mt-1 w-full rounded-xl border px-3 py-2" />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button disabled={adding} type="submit" className="inline-flex items-center rounded-xl bg-purple-500 hover:bg-purple-400 text-white px-4 py-2 font-medium disabled:opacity-50">
                {adding ? "Agregando..." : "Agregar método"}
              </button>
              <button type="button" onClick={() => setForm({ cardholder: "", number: "", expMonth: "", expYear: "" })} className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-4 py-2 font-medium">
                Limpiar
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
