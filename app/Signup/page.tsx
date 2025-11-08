"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../app/lib/firebase";


// app/sign-up/page.tsx
export default function SignUpPage() {
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if(isSuccess){
      timer = setTimeout (() => {
        setIsSuccess (false)
      }, 10000)

      return () => clearTimeout (timer);
    };
  }, [isSuccess]);

  const handleLocalError = (message: string) => {
    setErrorMessage(message);
    setHasError(true);
    setLoading(false);
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setHasError(false);
    setErrorMessage(null);

    //Validacion de contraseñas
    if (password !== confirmPassword){
      handleLocalError("Las contraseñas no coinciden");
      return;
    }

    //Validacion de terminos y condiciones
    if (!termsAccepted){
      handleLocalError("Debes de aceptar los términos y condiciones para continuar.")
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("Usuario creado", userCredential.user);
      setIsSuccess(true);

      setName("")
      setEmail("")
      setPassword("")
      setConfirmPassword("")
      setTermsAccepted(false)

    } catch (firebaseError) {
      let message = "Ocurrió un error desconocido al registrarse.";

      if (
        firebaseError &&
        typeof firebaseError === "object" &&
        "code" in firebaseError &&
        typeof (firebaseError as { code: unknown }).code === "string"
      ) {
        const errorCode = (firebaseError as { code: string }).code;

        if (errorCode === "auth/email-already-in-use") {
          message =
            "El correo electrónico ya está en uso. Intenta iniciar sesión.";
        } else if (errorCode === "auth/invalid-email") {
          message = "El formato del correo electrónico es inválido.";
        } else if (errorCode === "auth/weak-password") {
          message =
            "La contraseña es demasiado débil. Debe tener al menos 8 caracteres.";
        }
      }
      handleError(firebaseError); // Using the outer error handler
      handleLocalError(message);
    } finally {
      setLoading(false); 
    }

    console.log("On submit", {
      nombre : name,
      email: email,
      password: password,
      confirmPassword: confirmPassword,
      termsAccepted: termsAccepted
    } )
  }
  
  async function handleGoogleSignIn() {
    setLoading(true);
    setHasError(false);
    setErrorMessage(null);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("Usuario de Google", result.user);
      setIsSuccess(true);
    } catch (error: any) {
      handleError(error); // Using the outer error handler
      handleLocalError(error.message || "Error al iniciar sesión con Google.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      
      <section className="relative overflow-hidden bg-purple-50 text-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-sky-500/5 to-fuchsia-500/10" />
        <div className="max-w-7xl mx-auto px-4 py-20 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-slate-900">
                Crea tu cuenta y comienza a pujar hoy mismo
              </h1>
              <p className="mt-5 text-slate-600 text-lg">
                Registrate para acceder a todas las funcionalidades y pujar por tus productos favoritos.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/#features"
                  className="inline-flex items-center rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-900 font-semibold px-5 py-3"
                >
                  Volver al inicio
                </Link>
                <Link
                  href="/Login"
                  className="inline-flex items-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold px-5 py-3"
                >
                  ya tengo una cuenta
                </Link>
              </div>
              <div className="mt-6 text-xs text-slate-400">
                Registrate gratis. Sin cargos ocultos.
              </div>
            </div>
            <div className="w-full md:max-w-md mx-auto bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <header className="mb-6 text-center">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-purple-500/20 mb-3">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-6 h-6 text-purple-400"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-5.33 0-8 2.67-8 6v1h16v-1c0-3.33-2.67-6-8-6Z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold">Crear cuenta</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Completa los campos para registrarte.
                </p>
              </header>

              <form className="space-y-4" onSubmit={onSubmit}>
                <div>
                  <label
                    htmlFor="name"
                    className="mb-1 block text-sm font-medium text-slate-200"
                  >
                    Nombre
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                    }}
                    placeholder="Tu nombre"
                    required
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-slate-100 outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1 block text-sm font-medium text-slate-200"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                    }}
                    placeholder="tucorreo@dominio.com"
                    autoComplete="email"
                    required
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-slate-100 outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="mb-1 block text-sm font-medium text-slate-200"
                  >
                    Contraseña
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                    }}
                    placeholder="********"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-slate-100 outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="confirm"
                    className="mb-1 block text-sm font-medium text-slate-200"
                  >
                    Confirmar contraseña
                  </label>
                  <input
                    id="confirm"
                    name="confirm"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                    }}
                    placeholder="********"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-slate-100 outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="inline-flex items-center gap-2 text-slate-300">
                    <input
                      type="checkbox"
                      className="rounded border-slate-700 bg-slate-900"
                      checked={termsAccepted}
                      onChange={(e) => {
                        setTermsAccepted(e.target.checked);
                      }}
                    />
                    Acepto términos y privacidad
                  </label>
                  <Link href="/login" className="text-slate-300 hover:text-white">
                    ¿Ya tienes cuenta?
                  </Link>
                </div>

                <p
                  className={`${
                    hasError ? "block" : "hidden"
                  } rounded-xl bg-red-500/10 border border-red-500/30 p-2 text-sm text-red-300`}
                >
                  {errorMessage}
                </p>

                {isSuccess && (
                  <p className="block rounded-xl bg-purple-500/10 border border-purple-500/30 p-2 text-sm text-purple-300">
                    Cuenta creada exitosamente. Por favor, inicia sesión.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-900 font-semibold px-4 py-2 disabled:opacity-50"
                >
                  {loading ? (
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-slate-900"
                      xmlns="https://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      ></path>
                    </svg>
                  ) : (
                    "Crear cuenta"
                  )}
                </button>
              </form>

              <div className="my-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-800" />
                <span className="text-xs text-slate-400">o</span>
                <div className="h-px flex-1 bg-slate-800" />
              </div>

              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/60 px-4 py-2 font-medium text-slate-100 inline-flex items-center justify-center gap-2 disabled:opacity-50"
                aria-label="Continuar con Google"
                type="button"
              >
                {loading ? (
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="https://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V4a10 10 0 00-10 10h2z"
                    ></path>
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M21.35 11.1h-9.18v2.98h5.27a4.52 4.52 0 0 1-1.95 2.96 6.06 6.06 0 0 1-3.32.96 6.06 6.06 0 0 1-4.28-1.78 6.26 6.26 0 0 1-1.76-4.4 6.25 6.25 0 0 1 1.76-4.4 6.06 6.06 0 0 1 4.28-1.78c1.46 0 2.78.5 3.82 1.33l2.1-2.1A9.3 9.3 0 0 0 12.17 2 9.1 9.1 0 0 0 5.7 4.7 9.25 9.25 0 0 0 3 11.82a9.25 9.25 0 0 0 2.7 7.12A9.1 9.1 0 0 0 12.17 22c2.49 0 4.57-.82 6.08-2.37 1.56-1.56 2.41-3.77 2.41-6.42 0-.68-.05-1.28-.31-2.11Z" />
                  </svg>
                )}
                Continuar con Google
              </button>

              <p className="mt-6 text-center text-sm text-slate-400">
                ¿Necesitas ayuda?{" "}
                <Link
                  href="/#faq"
                  className="text-purple-400 hover:text-purple-300 font-medium"
                >
                  FAQ
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-800 py-8 text-center text-sm text-slate-400">
        Hecho con Tailwind · © 2025
      </footer>
    </>
  );
}

function handleError(message: any) {
    throw new Error("Function not implemented.");
}
