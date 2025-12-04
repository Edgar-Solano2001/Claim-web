"use client";
import React, { useState } from 'react'
import Image from "next/image";
import Link from "next/link";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'; // Importaciones de Google agregadas
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase-config';
import { toast } from 'react-hot-toast';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { cloudName, uploadPreset } from '@/lib/cloudinary-config';

export default function Signup() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    phone: '',
    photo: null as File | null,
    termsAccepted: false,
    conditionsAccepted: false,
  });

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, files } = e.target;
    // Limpiamos errores al escribir
    if (error) setError('');
    
    if (type === 'file' && files) {
      setFormData(prev => ({ ...prev, photo: files[0] }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: e.target.checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // --- Lógica de Registro con Google ---
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if(!user) {
        setError('Error al iniciar sesión con Google. Intente nuevamente.');
        toast.error('Error con Google');
        setLoading(false);
        return;
      }

      //Subir datos del usuario a la base de datos
      await setDoc(doc(db, "users", user.uid), {
        id: user.uid,
        email: user.email,
        username: user.displayName,
        phone: user.phoneNumber,
        photoURL: user.photoURL,
        termsAccepted: true,
        conditionsAccepted: true,

        //Informacion del usuario
        displayName: user.displayName,

        //Metadatos
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: serverTimestamp(),
        isActive: true,
        isVerified: false,
      })
      
      setSuccess('¡Inicio de sesión con Google exitoso!');
      toast.success('Bienvenido');
      router.push('/Dashboard'); // Redirige a donde necesites
    } catch (err: unknown) {
      console.error(err);
      setError('Error al iniciar sesión con Google. Intente nuevamente.');
      toast.error('Error con Google');
    } finally {
      setLoading(false);
    }
  };


  // --- Lógica de Subida de Imagen ---
  const uploadToCloudinary = async (file: File) => {
    if (!cloudName || !uploadPreset) throw new Error('Falta configuración de Cloudinary');

    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', uploadPreset);
    data.append("folder", "claim/users");

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
      method: 'POST',
      body: data,
    })

    if (!response.ok) throw new Error("Error al subir la imagen");
    const fileData = await response.json();
    return fileData.secure_url; // Retorna la URL de la imagen subida
    
  }

  // --- Lógica de Registro con Email y Password ---
  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { email, password, confirmPassword, username, phone, photo, termsAccepted, conditionsAccepted } = formData;
      
      // Validaciones básicas
      if(!email || !password || !username || !phone || !photo || !termsAccepted || !conditionsAccepted) {
        setError('Por favor, complete todos los campos obligatorios.');
        toast.error('Faltan campos por completar');
        setLoading(false);
        return;
      }

      if(password !== confirmPassword) {
        setError('Las contraseñas no coinciden.');
        toast.error('Las contraseñas no coinciden');
        setLoading(false);
        return;
      }

      // Crear usuario en Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      //Subir la imagen
      let photoURL = "";
      if(photo){
        toast.loading('Subiendo imagen...');
        try {
          photoURL = await uploadToCloudinary(photo);
          toast.dismiss("Subiendo imagen...");
        } catch (error) {
          toast.error('Error al subir la imagen');
          console.error('Error al subir la imagen:', error);
          photoURL = "";
        }
      }

      //Subir informacion del usuario a la base de datos
      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        email: user.email,
        username: username,
        phone: phone,
        photoURL: photoURL,
        termsAccepted: termsAccepted,
        conditionsAccepted: conditionsAccepted,

        //Informacion del usuario
        displayName: username,

        //Metadatos
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: serverTimestamp(),
        isActive: true,
        isVerified: false,
      });
      
      console.log('Usuario registrado:', user);
      setSuccess('¡Usuario registrado correctamente! Redirigiendo...');
      toast.success('Usuario registrado correctamente');

      // Esperar brevemente para que el usuario lea el mensaje antes de redirigir
      setTimeout(() => {
        router.push('/Login');
      }, 2000);

    } catch (error) {
      console.error('Error al registrar', error);
      
      // Errores en Firebase
      let msg = 'Ocurrió un error al registrar el usuario.';
      if (error instanceof Error && 'code' in error) {
      const firebaseError = error as { code: string };
      if (firebaseError.code === 'auth/email-already-in-use') msg = 'El correo electrónico ya está registrado.';
      if (firebaseError.code === 'auth/weak-password') msg = 'La contraseña debe tener al menos 6 caracteres.';
      if (firebaseError.code === 'auth/invalid-email') msg = 'El formato del correo no es válido.';
      }
      
      setError(msg);
      toast.error(msg);
    } finally {
      if (!success) setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-gradient-to-br from-purple-100 via-white to-purple-50">
      <div className="hidden md:flex items-center justify-center bg-purple-200/30 p-8">
        <Image
          src="/images/banner1.jpg"
          alt="Signup background"
          width={1000}
          height={900}
          className="w-full h-[85vh] object-cover rounded-3xl shadow-2xl"
          priority
        />
      </div>
      <div className="flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-4xl bg-white/95 rounded-2xl shadow-xl p-8 flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 mb-2">
            <Image src="/Claim_Logo.svg" alt="Claim Logo" width={56} height={56} className="mb-1" />
            <span className="font-semibold text-lg text-purple-700">Claim</span>
          </div>
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">¿Eres nuevo? Regístrate</h1>
            <p className="mt-2 text-base text-slate-500">Crea tu cuenta para comenzar a pujar en subastas exclusivas.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* ... CAMPOS DEL FORMULARIO (Email, Password, etc. igual que antes) ... */}
            <div className="flex flex-col text-left gap-1">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">Correo electrónico</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Ingresa tu email" className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-purple-400 outline-none transition" autoComplete="email" required />
            </div>
            <div className="flex flex-col text-left gap-1">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">Contraseña</label>
              <input type="password" id="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Ingresa tu contraseña" className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-purple-400 outline-none transition" autoComplete="new-password" required />
            </div>
            <div className="flex flex-col text-left gap-1">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">Confirmar Contraseña</label>
              <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} placeholder="Repite tu contraseña" className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-purple-400 outline-none transition" autoComplete="new-password" required />
            </div>
            <div className="flex flex-col text-left gap-1">
              <label htmlFor="username" className="text-sm font-medium text-slate-700">Nombre de Usuario</label>
              <input type="text" id="username" name="username" value={formData.username} onChange={handleInputChange} placeholder="Ingresa tu nombre de usuario" className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-purple-400 outline-none transition" autoComplete="username" required />
            </div>
            <div className="flex flex-col text-left gap-1">
              <label htmlFor="phone" className="text-sm font-medium text-slate-700">Número de Teléfono</label>
              <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Ingresa tu número de teléfono" className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-purple-400 outline-none transition" autoComplete="tel" required />
            </div>
            
            {/* Input de Fotografía */}
            <div className="flex flex-col text-left gap-2">
              <label className="text-sm font-medium text-slate-700">Sube Tu Fotografía</label>
              <div className="relative">
                <input type="file" id="photo" name="photo" accept="image/*" onChange={handleInputChange} className="hidden" />
                <label htmlFor="photo" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-purple-300 rounded-xl bg-purple-50/50 cursor-pointer hover:bg-purple-100/50 transition">
                  {formData.photo ? (
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <span className="text-sm text-purple-600 font-medium">{formData.photo.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      <span className="text-sm text-purple-600 font-medium">Haz clic para subir</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Checkboxes de Términos */}
            <div className="flex flex-col gap-3">

              <p className="text-xs text-slate-600 text-center">Haz click en los íconos para ver y aceptar los términos y condiciones</p>
              <div className="flex gap-4 justify-center">
                <Link href="/terms" target="_blank">
                  <label className="flex flex-col items-center gap-2 cursor-pointer group">
                    <input type="checkbox" name="termsAccepted" checked={formData.termsAccepted} onChange={handleInputChange} className="hidden" />
                    <div className={`w-16 h-16 rounded-lg border-2 flex items-center justify-center transition ${formData.termsAccepted ? 'bg-purple-600 border-purple-600' : 'bg-white border-slate-300 group-hover:border-purple-400'}`}>
                      <svg className={`w-8 h-8 ${formData.termsAccepted ? 'text-white' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <span className="text-xs font-medium text-slate-700">Términos</span>
                  </label>
                </Link>
                <Link href="/terms" target="_blank">
                  <label className="flex flex-col items-center gap-2 cursor-pointer group">
                    <input type="checkbox" name="conditionsAccepted" checked={formData.conditionsAccepted} onChange={handleInputChange} className="hidden" />
                    <div className={`w-16 h-16 rounded-lg border-2 flex items-center justify-center transition relative ${formData.conditionsAccepted ? 'bg-purple-600 border-purple-600' : 'bg-white border-slate-300 group-hover:border-purple-400'}`}>
                      <svg className={`w-8 h-8 ${formData.conditionsAccepted ? 'text-white' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <span className="text-xs font-medium text-slate-700">Condiciones</span>
                  </label>
                </Link>
              </div>
            </div>

            {/* BOTÓN DE REGISTRO CON ESTADO DE CARGA */}
            <button
              type="submit"
              disabled={loading || !formData.termsAccepted || !formData.conditionsAccepted}
              className={`w-full flex items-center justify-center gap-2 rounded-xl text-white font-semibold py-2.5 shadow-md mt-1 transition
                ${loading 
                  ? 'bg-purple-400 cursor-wait' 
                  : (!formData.termsAccepted || !formData.conditionsAccepted) ? 'bg-slate-300 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
                }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="currentColor" stroke="none" viewBox="0 0 20 20">
                    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                  </svg>
                  Registrarse
                </>
              )}
            </button>

            {/* MENSAJES DE ERROR Y ÉXITO EN EL FORMULARIO */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm text-center animate-pulse">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-xl text-sm text-center">
                {success}
              </div>
            )}

          </form>
          
          <div className="flex items-center gap-3 my-2">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs text-slate-400">o regístrate con</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="flex justify-center gap-4">
            {/* Botón de GOOGLE (Nuevo) */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-12 h-12 rounded-full bg-white border border-slate-200 hover:bg-slate-50 transition flex items-center justify-center shadow"
              aria-label="Registrarse con Google"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M23.766 12.2764C23.766 11.4607 23.6999 10.6406 23.5588 9.83807H12.24V14.4591H18.7217C18.4528 15.9494 17.5885 17.2678 16.323 18.1056V21.1039H20.19C22.4608 19.0139 23.766 15.9274 23.766 12.2764Z" fill="#4285F4"/>
                <path d="M12.24 24.0008C15.4765 24.0008 18.2058 22.9382 20.1945 21.1039L16.3275 18.1055C15.2517 18.8375 13.8627 19.252 12.2445 19.252C9.11388 19.252 6.45946 17.1399 5.50705 14.3003H1.5166V17.3912C3.55371 21.4434 7.7029 24.0008 12.24 24.0008Z" fill="#34A853"/>
                <path d="M5.50253 14.3003C5.00236 12.8199 5.00236 11.1799 5.50253 9.69951V6.60861H1.5166C-0.18551 10.0056 -0.18551 13.9945 1.5166 17.3915L5.50253 14.3003Z" fill="#FBBC05"/>
                <path d="M12.24 4.74966C13.9509 4.7232 15.6044 5.36697 16.8434 6.54867L20.2695 3.12262C18.1001 1.0855 15.2208 -0.034466 12.24 0.000808666C7.7029 0.000808666 3.55371 2.55822 1.5166 6.60861L5.50253 9.69951C6.45064 6.86154 9.10947 4.74966 12.24 4.74966Z" fill="#EA4335"/>
              </svg>
            </button>

            {/* Otros botones decorativos (Twitter / Instagram) */}
            <button
              type="button"
              className="w-12 h-12 rounded-full bg-white border border-slate-200 hover:bg-slate-50 transition flex items-center justify-center shadow opacity-60"
            >
              <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                 <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
            </button>
          </div>

          <div className="flex justify-center gap-2 mt-2 text-sm">
            <span className="text-slate-500">¿Ya tienes cuenta?</span>
            <a href="/Login" className="text-purple-600 hover:underline font-medium">Inicia sesión</a>
          </div>
        </div>
      </div>
    </div>
  );
}