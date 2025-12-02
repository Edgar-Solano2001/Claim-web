"use client";

import Link from "next/link";
import React from "react";

export default function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-purple-50 text-slate-900 py-16">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-sky-500/5 to-fuchsia-500/10" />
        <div className="max-w-6xl mx-auto px-4 relative">
          <header className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900">Sobre Nosotros</h1>
            <p className="mt-3 text-lg text-slate-600 max-w-3xl mx-auto">
              En CLAIM ayudamos a conectar compradores y vendedores mediante subastas honestas y transparentes.
            </p>
          </header>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-slate-900">Nuestra Misión</h2>
              <p className="text-slate-600 leading-relaxed">
                Ofrecer una plataforma segura, accesible y justa donde cualquiera pueda conseguir grandes productos a precios competitivos, y donde los vendedores puedan maximizar el valor de sus artículos.
              </p>

              <h2 className="text-2xl font-semibold text-slate-900">Nuestra Visión</h2>
              <p className="text-slate-600 leading-relaxed">
                Ser la plataforma de subastas de referencia en la región, impulsando la confianza digital y facilitando transacciones rápidas y seguras.
              </p>

              <h2 className="text-2xl font-semibold text-slate-900">Nuestros Valores</h2>
              <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                <li>Transparencia en cada subasta</li>
                <li>Seguridad y privacidad del usuario</li>
                <li>Innovación continua</li>
                <li>Atención al cliente centrada en la persona</li>
              </ul>

              <div className="mt-6 flex flex-wrap gap-4">
                <Link href="/" className="inline-flex items-center rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-semibold px-5 py-3">
                  Volver al inicio
                </Link>
                <Link href="/termsandconditions" className="inline-flex items-center rounded-xl border border-purple-200 bg-white text-purple-700 font-semibold px-5 py-3">
                  Términos y Condiciones
                </Link>
              </div>
            </div>

            <div>
              <div className="bg-white rounded-2xl border border-purple-200 p-6 shadow-lg">
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Nuestro Equipo</h3>
                <p className="text-slate-600 mb-6">Un equipo pequeño y apasionado por crear experiencias de compra seguras y justas.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold">ES</div>
                    <div>
                      <div className="font-semibold text-slate-900">Edgar Solano</div>
                      <div className="text-sm text-slate-600">CEO & Cofundador</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold">BR</div>
                    <div>
                      <div className="font-semibold text-slate-900">Braul</div>
                      <div className="text-sm text-slate-600">Desarrollo Web</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold">AM</div>
                    <div>
                      <div className="font-semibold text-slate-900">Ana Márquez</div>
                      <div className="text-sm text-slate-600">Diseño UX</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t pt-4 text-sm text-slate-600">
                  <p>¿Quieres unirte al equipo? Escríbenos a <a href="mailto:careers@claim.com" className="text-purple-600 underline">careers@claim.com</a></p>
                </div>
              </div>

              <div className="mt-6 bg-white rounded-2xl border border-purple-200 p-4 shadow-sm">
                <h4 className="font-semibold text-slate-900">Contacto</h4>
                <p className="text-slate-600">support@claim.com</p>
                <p className="text-slate-600">Instituto Tecnologico de Toluca, Metepec, Estado de México</p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center text-sm text-slate-500">© {new Date().getFullYear()} CLAIM. Todos los derechos reservados.</div>
        </div>
      </section>
    </>
  );
}
     