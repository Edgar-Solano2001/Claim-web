"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="w-full bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/Claim_Logo.svg"
              alt="Subasta 1"
              width={500}
              height={500}
              className="w-8 h-8"
              priority
            />
            <span className="mx-2 font-semibold text-lg">CLAIM</span>
          </Link>

          {/* Enlaces */}
          <div className="hidden md:flex space-x-6">
            <Link href="/" className="text-sm font-medium hover:text-primary">
              Inicio
            </Link>
            <Link
              href="/subastas"
              className="text-sm font-medium hover:text-primary"
            >
              Mis Pujas
            </Link>
            <Link
              href="/categorias"
              className="text-sm font-medium hover:text-primary"
            >
              Categorías
            </Link>
          </div>

          {/* Botón */}
          <div className="hidden md:flex space-x-2">
            <Button variant="default" className="text-sm">
              Iniciar Sesión
            </Button>
            <Button variant="secondary">Registrar</Button>
          </div>
          

          {/* Menú móvil */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-zinc-700 dark:text-zinc-300"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Contenido móvil */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
          <div className="px-4 py-3 space-y-3">
            <Link
              href="/"
              className="block text-sm font-medium hover:text-primary"
            >
              Inicio
            </Link>
            <Link
              href="/subastas"
              className="block text-sm font-medium hover:text-primary"
            >
              Mis Pujas
            </Link>
            <Link
              href="/categorias"
              className="block text-sm font-medium hover:text-primary"
            >
              Categorías
            </Link>
            <Button variant="default" className="w-full text-sm">
              Iniciar Sesion
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}

