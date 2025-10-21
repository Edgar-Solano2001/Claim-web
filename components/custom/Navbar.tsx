"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

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
            <Image
              src="/Claim_Logo.svg"
              alt="Claim logo"
              width={500}
              height={500}
              className="w-8 h-8"
              priority
            />
            <span className="mx-2 font-semibold text-lg">CLAIM</span>
          </Link>

          {/* Contenedor derecho: Enlaces + Botones */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-6">
              <Link
                href="/"
                className="text-sm font-medium text-purple-700 dark:text-purple-200 transition transform hover:-translate-y-1 hover:text-purple-600 dark:hover:text-purple-100 hover:underline hover:underline-offset-4 focus:outline-none focus:ring-2 focus:ring-purple-300 rounded"
              >
                Inicio
              </Link>

              <Link
                href="/subastas"
                className="text-sm font-medium text-purple-700 dark:text-purple-200 transition transform hover:-translate-y-1 hover:text-purple-600 dark:hover:text-purple-100 hover:underline hover:underline-offset-4 focus:outline-none focus:ring-2 focus:ring-purple-300 rounded"
              >
                Mis Pujas
              </Link>

              <Link
                href="/categorias"
                className="text-sm font-medium text-purple-700 dark:text-purple-200 transition transform hover:-translate-y-1 hover:text-purple-600 dark:hover:text-purple-100 hover:underline hover:underline-offset-4 focus:outline-none focus:ring-2 focus:ring-purple-300 rounded"
              >
                Categorías
              </Link>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="default"
                className="text-sm bg-purple-900 text-white hover:bg-purple-700 focus:ring-2 focus:ring-purple-300"
              >
                Iniciar Sesión
              </Button>
              <Button
                variant="secondary"
                className="text-sm bg-purple-200 text-purple-900 hover:bg-purple-300 focus:ring-2 focus:ring-purple-300"
              >
                Registrar
              </Button>
            </div>
          </div>

          {/* Menú móvil */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
              className="text-purple-700 dark:text-purple-200 p-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-300"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Contenido móvil */}
      {isOpen && (
        <div className="md:hidden bg-purple-50 dark:bg-purple-900 border-t border-purple-200 dark:border-purple-800">
          <div className="px-4 py-4 space-y-3">
            <Link
              href="/"
              className="block text-sm font-medium text-purple-700 dark:text-purple-200 hover:text-purple-600 dark:hover:text-purple-100 transition"
            >
              Inicio
            </Link>
            <Link
              href="/subastas"
              className="block text-sm font-medium text-purple-700 dark:text-purple-200 hover:text-purple-600 dark:hover:text-purple-100 transition"
            >
              Mis Pujas
            </Link>
            <Link
              href="/categorias"
              className="block text-sm font-medium text-purple-700 dark:text-purple-200 hover:text-purple-600 dark:hover:text-purple-100 transition"
            >
              Categorías
            </Link>

            <div className="pt-2 border-t border-purple-100 dark:border-purple-800">
              <Button variant="default" className="w-full mb-2 text-sm bg-purple-900 text-white hover:bg-purple-700">
                Iniciar Sesión
              </Button>
              <Button variant="secondary" className="w-full text-sm bg-purple-200 text-purple-900 hover:bg-purple-300">
                Registrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
