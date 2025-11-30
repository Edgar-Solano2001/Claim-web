"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
// 1. Importamos el hook del contexto y el nuevo componente UserNav
import { useAuth } from "@/context/AuthContext";
import { UserNav } from "@/components/custom/UserNav";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  
  // 2. Obtenemos el estado del usuario
  const { user, loading } = useAuth();

  const isSignupPage = pathname === '/Signup';
  const isLoginPage = pathname === '/Login';

  // Función auxiliar para renderizar los botones de auth (para no repetir código)
  const renderAuthButtons = () => (
    <>
       {!isLoginPage && (
        <Link href="/Login">
          <Button
            variant="default"
            className="text-sm bg-purple-900 text-white hover:bg-purple-700 focus:ring-2 focus:ring-purple-300 w-full md:w-auto"
          >
            Iniciar Sesión
          </Button>
        </Link>
      )}
      {!isSignupPage && (
        <Link href="/Signup">
          <Button
            variant="secondary"
            className="text-sm bg-purple-200 text-purple-900 hover:bg-purple-300 focus:ring-2 focus:ring-purple-300 w-full md:w-auto"
          >
            Registrar
          </Button>
        </Link>
      )}
    </>
  );


  return (
    <nav
      className="w-full left-0 right-0 bg-purple-50 dark:bg-purple-900 border-b border-purple-200 dark:border-purple-800 sticky top-0 z-50"
      aria-label="Main navigation"
    >
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 w-full">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 text-purple-800 dark:text-purple-200"
            aria-label="Ir al inicio"
          >
           {/* ... tus imágenes del logo ... */}
           <Image src="/Claim_Logotipo_Cortado.svg" alt="Claim logo" width={48} height={48} className="w-15 h-15" priority />
           <Image src="/Claim_Nombre.svg" alt="Claim logo" width={48} height={48} className="w-20 h-15" priority />
          </Link>

          {/* Contenedor derecho: Enlaces + Botones (DESKTOP) */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-6">
              <Link href="/" className="text-sm font-medium text-purple-700 dark:text-purple-200 transition transform hover:-translate-y-1 hover:text-purple-600 dark:hover:text-purple-100 hover:underline hover:underline-offset-4 focus:outline-none focus:ring-2 focus:ring-purple-300 rounded">
                Inicio
              </Link>
              <Link href="/subastas" className="text-sm font-medium text-purple-700 dark:text-purple-200 transition transform hover:-translate-y-1 hover:text-purple-600 dark:hover:text-purple-100 hover:underline hover:underline-offset-4 focus:outline-none focus:ring-2 focus:ring-purple-300 rounded">
                Mis Pujas
              </Link>
              <Link href="/categorias" className="text-sm font-medium text-purple-700 dark:text-purple-200 transition transform hover:-translate-y-1 hover:text-purple-600 dark:hover:text-purple-100 hover:underline hover:underline-offset-4 focus:outline-none focus:ring-2 focus:ring-purple-300 rounded">
                Categorías
              </Link>
            </div>

            <div className="flex items-center space-x-2 pl-4 border-l border-purple-200 dark:border-purple-700">
              {/* 3. Lógica Condicional Desktop */}
              {loading ? (
                // Opcional: Un skeleton o spinner pequeño mientras carga
                <div className="w-10 h-10 rounded-full bg-purple-200 animate-pulse"></div>
              ) : user ? (
                // Si hay usuario, mostramos el nuevo componente
                <UserNav />
              ) : (
                // Si no hay usuario, mostramos los botones antiguos
                renderAuthButtons()
              )}
            </div>
          </div>

          {/* Menú móvil Trigger */}
          <div className="md:hidden flex items-center gap-2">
             {/* En móvil también mostramos el avatar si está logueado, fuera del menú hamburguesa para acceso rápido */}
             {!loading && user && <UserNav />}
            <button
              onClick={() => setIsOpen(!isOpen)}
              // ... atributos del botón móvil ...
              className="text-purple-700 dark:text-purple-200 p-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-300"
            >
              {isOpen ? (<X className="h-6 w-6" />) : (<Menu className="h-6 w-6" />)}
            </button>
          </div>
        </div>
      </div>

      {/* Contenido móvil */}
      {isOpen && (
        <div className="md:hidden bg-purple-50 dark:bg-purple-900 border-t border-purple-200 dark:border-purple-800">
          <div className="px-4 py-4 space-y-3">
             {/* ... tus enlaces móviles ... */}
            <Link href="/" className="block text-sm font-medium text-purple-700 dark:text-purple-200 hover:text-purple-600 dark:hover:text-purple-100 transition">Inicio</Link>
            <Link href="/subastas" className="block text-sm font-medium text-purple-700 dark:text-purple-200 hover:text-purple-600 dark:hover:text-purple-100 transition">Mis Pujas</Link>
            <Link href="/categorias" className="block text-sm font-medium text-purple-700 dark:text-purple-200 hover:text-purple-600 dark:hover:text-purple-100 transition">Categorías</Link>

            <div className="pt-4 border-t border-purple-100 dark:border-purple-800 flex flex-col gap-2">
               {/* 4. Lógica Condicional Móvil */}
               {/* En móvil, si está logueado, el UserNav ya se muestra arriba, así que no mostramos nada aquí.
                   Si NO está logueado, mostramos los botones grandes. */}
               {!loading && !user && renderAuthButtons()}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
