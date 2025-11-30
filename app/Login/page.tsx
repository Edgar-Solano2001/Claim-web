"use client";

import React, { useState } from 'react'
import Image from "next/image";
import toast from 'react-hot-toast';
import { auth } from '@/lib/firebase-config';
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); // Estado para mostrar error visualmente

  const router = useRouter()

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('¡Bienvenido de nuevo!');
      router.push('/');
    } catch (err) {
      console.error(err);
      toast.error('No se pudo iniciar sesión con Google.');
    } finally {
      setLoading(false);
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Evita recarga de página
    setLoading(true);
    setError('');
    
    try {
      const { email, password } = formData;
      await signInWithEmailAndPassword(auth, email, password);
      
      toast.success('Inicio de sesión exitoso');
      router.push('/');
      
    } catch (error: any) {
      console.error('Error login:', error.code);
      
      // Traducimos el error para el usuario
      let msg = 'Error al iniciar sesión. Verifique sus datos.';
      
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        msg = 'Correo electrónico o contraseña incorrectos.';
      } else if (error.code === 'auth/too-many-requests') {
        msg = 'Demasiados intentos fallidos. Intente más tarde.';
      }

      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-gradient-to-br from-purple-100 via-white to-purple-50">
      <div className="hidden md:flex items-center justify-center bg-purple-200/30 p-8">
        <Image
          src="/images/banner1.jpg"
          alt="Login background"
          width={1000}
          height={900}
          className="w-full h-[85vh] object-cover rounded-3xl shadow-2xl"
          priority
        />
      </div>
      <div className="flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-xl bg-white/95 rounded-2xl shadow-xl p-8 flex flex-col gap-8">
          <div className="flex flex-col items-center gap-2 mb-4">
            <Image src="/Claim_Logo.svg" alt="Claim Logo" width={56} height={56} className="mb-1" />
            <span className="font-semibold text-lg text-purple-700">Claim</span>
          </div>
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Inicia sesión</h1>
            <p className="mt-2 text-base text-slate-500">Accede para pujar en subastas exclusivas.</p>
          </div>

          {/* MENSAJE DE ERROR VISUAL */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm text-center animate-pulse">
              {error}
            </div>
          )}

          {/* IMPORTANTE: onSubmit va en el form, no en el botón */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col text-left gap-1">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">Correo electrónico</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Ingresa tu email"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-purple-400 outline-none transition"
                autoComplete="email"
                required
                disabled={loading}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="flex flex-col text-left gap-1">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Ingresa tu contraseña"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-purple-400 outline-none transition"
                autoComplete="current-password"
                required
                disabled={loading}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 rounded-xl text-white font-semibold py-2.5 shadow-md mt-1 transition
                ${loading ? 'bg-purple-400 cursor-wait' : 'bg-purple-600 hover:bg-purple-700'}`}
            >
              {loading ? (
                <span>Cargando...</span>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="currentColor" stroke="none" viewBox="0 0 20 20">
                    <path d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm10 1V9a1 1 0 10-2 0v2a1 1 0 001 1h2a1 1 0 100-2h-1z" />
                  </svg>
                  Iniciar sesión
                </>
              )}
            </button>
            
            <div className="text-right mt-1">
              <a href="/recuperar" className="text-xs text-purple-600 hover:underline transition">¿Olvidaste tu contraseña?</a>
            </div>
          </form>

          <div className="flex items-center gap-3 my-2">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs text-slate-400">o</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition px-5 py-2.5 font-medium text-slate-800 shadow"
          >
             <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
              <g>
                <path fill="#4285F4" d="M21.35 11.1h-9.18v2.98h5.27a4.52 4.52 0 01-1.95 2.96 6.06 6.06 0 01-3.32.96 6.06 6.06 0 01-4.28-1.78 6.26 6.26 0 01-1.76-4.4 6.25 6.25 0 011.76-4.4A6.06 6.06 0 0112.17 6c1.46 0 2.78.5 3.82 1.33l2.1-2.1A9.3 9.3 0 0012.17 2a9.1 9.1 0 00-6.47 2.7A9.25 9.25 0 003 11.82a9.25 9.25 0 002.7 7.12A9.1 9.1 0 0012.17 22c2.49 0 4.57-.82 6.08-2.37 1.56-1.56 2.41-3.77 2.41-6.42 0-.68-.05-1.28-.31-2.11Z" />
              </g>
            </svg>
            Iniciar sesión con Google
          </button>
          <div className="flex justify-center gap-2 mt-2 text-sm">
            <span className="text-slate-500">¿No tienes cuenta?</span>
            <a href="/Signup" className="text-purple-600 hover:underline font-medium">Regístrate</a>
          </div>
        </div>
      </div>
    </div>
  );
}