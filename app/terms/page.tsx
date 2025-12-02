"use client";

import Link from "next/link";
import React from "react";

export default function TermsAndConditionsPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-purple-50 text-slate-900 py-12">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-sky-500/5 to-fuchsia-500/10" />
        <div className="max-w-4xl mx-auto px-4 relative">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-slate-900 mb-4">
              Términos y Condiciones
            </h1>
            <p className="text-lg text-slate-600">
              Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl border border-purple-200 p-8 shadow-lg space-y-8">
            {/* Section 1 */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Introducción</h2>
              <p className="text-slate-600 leading-relaxed">
                Bienvenido a CLAIM ("la Plataforma"). Estos Términos y Condiciones ("Términos") rigen tu uso de nuestra plataforma de subastas en línea. Al acceder, registrarte o utilizar CLAIM, aceptas estar vinculado por estos Términos. Si no estás de acuerdo con alguna parte de estos Términos, no debes usar la Plataforma.
              </p>
            </div>

            {/* Section 2 */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Uso de la Plataforma</h2>
              <div className="space-y-3">
                <p className="text-slate-600 leading-relaxed">
                  <span className="font-semibold text-slate-900">2.1 Elegibilidad:</span> Debes ser mayor de 18 años para usar CLAIM. Al registrarte, declaras que cumples con este requisito.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  <span className="font-semibold text-slate-900">2.2 Cuenta de Usuario:</span> Eres responsable de mantener la confidencialidad de tus credenciales de acceso. Cualquier actividad realizada en tu cuenta es tu responsabilidad.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  <span className="font-semibold text-slate-900">2.3 Conducta Prohibida:</span> No debes:
                </p>
                <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                  <li>Participar en conducta fraudulenta o engañosa</li>
                  <li>Usar la Plataforma para actividades ilegales</li>
                  <li>Harasser u ofender a otros usuarios</li>
                  <li>Intentar acceder sin autorización a sistemas o datos</li>
                  <li>Crear múltiples cuentas para manipular subastas</li>
                  <li>Usar bots o herramientas automatizadas no autorizadas</li>
                </ul>
              </div>
            </div>

            {/* Section 3 */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Subastas y Pujas</h2>
              <div className="space-y-3">
                <p className="text-slate-600 leading-relaxed">
                  <span className="font-semibold text-slate-900">3.1 Participación en Subastas:</span> Al realizar una puja, aceptas hacer una oferta vinculante para comprar el artículo al precio ofertado si ganas la subasta.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  <span className="font-semibold text-slate-900">3.2 Condiciones de Puja:</span> Las pujas son finales y vinculantes. No se permiten retractaciones, salvo en circunstancias excepcionales que CLAIM determine a su discreción.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  <span className="font-semibold text-slate-900">3.3 Pujas Inválidas:</span> CLAIM se reserva el derecho de invalidar pujas que considere fraudulentas, manipuladoras o que violen estos Términos.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  <span className="font-semibold text-slate-900">3.4 Pago:</span> El ganador de la subasta debe realizar el pago dentro del plazo especificado. El incumplimiento puede resultar en la cancelación de la transacción y en acciones legales.
                </p>
              </div>
            </div>

            {/* Section 4 */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Artículos y Descripciones</h2>
              <div className="space-y-3">
                <p className="text-slate-600 leading-relaxed">
                  <span className="font-semibold text-slate-900">4.1 Responsabilidad del Vendedor:</span> Los vendedores son responsables de proporcionar descripciones precisas y precisas de los artículos. CLAIM no es responsable de descripciones inexactas.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  <span className="font-semibold text-slate-900">4.2 Artículos Prohibidos:</span> No se pueden subastar artículos ilegales, falsificados, robados o que violen derechos de propiedad intelectual.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  <span className="font-semibold text-slate-900">4.3 Garantías:</span> CLAIM no ofrece garantías sobre la condición, autenticidad o idoneidad de los artículos. Las transacciones son "tal como se ven".
                </p>
              </div>
            </div>

            {/* Section 5 */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Privacidad y Datos</h2>
              <p className="text-slate-600 leading-relaxed">
                Tu uso de CLAIM está sujeto a nuestra Política de Privacidad. Al usar la Plataforma, aceptas la recopilación, uso y divulgación de tu información personal según se describe en esa política.
              </p>
            </div>

            {/* Section 6 */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Limitación de Responsabilidad</h2>
              <p className="text-slate-600 leading-relaxed">
                CLAIM se proporciona "tal como está". En la medida permitida por la ley, no somos responsables de:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4 mt-3">
                <li>Pérdidas indirectas, incidentales o consecuentes</li>
                <li>Daños por pérdida de datos o ganancias</li>
                <li>Interrupciones o errores del servicio</li>
                <li>Pérdida o daño de artículos durante el envío</li>
              </ul>
            </div>

            {/* Section 7 */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Resolución de Disputas</h2>
              <div className="space-y-3">
                <p className="text-slate-600 leading-relaxed">
                  <span className="font-semibold text-slate-900">7.1 Proceso de Disputa:</span> Cualquier disputa debe reportarse a CLAIM dentro de 30 días de la conclusión de la subasta. CLAIM investigará y tomará medidas apropiadas.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  <span className="font-semibold text-slate-900">7.2 Arbitraje:</span> Los usuarios aceptan someter disputas a arbitraje vinculante en lugar de litigio en tribunales.
                </p>
              </div>
            </div>

            {/* Section 8 */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Tarifas y Pagos</h2>
              <div className="space-y-3">
                <p className="text-slate-600 leading-relaxed">
                  <span className="font-semibold text-slate-900">8.1 Comisiones:</span> CLAIM cobra una comisión del 10% sobre el precio final de venta. Esta tarifa es no reembolsable.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  <span className="font-semibold text-slate-900">8.2 Método de Pago:</span> Solo se aceptan métodos de pago seguros. CLAIM no es responsable de fraude de tarjetas de crédito.
                </p>
              </div>
            </div>

            {/* Section 9 */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Modificación de Términos</h2>
              <p className="text-slate-600 leading-relaxed">
                CLAIM se reserva el derecho de modificar estos Términos en cualquier momento. Los cambios serán efectivos inmediatamente tras su publicación. El uso continuado de la Plataforma constituye aceptación de los Términos modificados.
              </p>
            </div>

            {/* Section 10 */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Terminación</h2>
              <p className="text-slate-600 leading-relaxed">
                CLAIM puede suspender o terminar tu cuenta en cualquier momento, con o sin causa, y sin previo aviso. La terminación no te releva de tus obligaciones financieras o legales.
              </p>
            </div>

            {/* Section 11 */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">11. Ley Aplicable</h2>
              <p className="text-slate-600 leading-relaxed">
                Estos Términos se rigen por las leyes del país donde CLAIM opera, sin consideración de sus conflictos de disposiciones legales.
              </p>
            </div>

            {/* Section 12 */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">12. Contacto</h2>
              <p className="text-slate-600 leading-relaxed">
                Si tienes preguntas sobre estos Términos, contáctanos en:
              </p>
              <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                <p className="text-slate-700">
                  <span className="font-semibold">Email:</span> support@claim.com
                </p>
                <p className="text-slate-700 mt-2">
                  <span className="font-semibold">Dirección:</span> Calle Principal 123, Ciudad, País
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-semibold px-6 py-3 transition"
            >
              Volver al Inicio
            </Link>
            <Link
              href="/Signup"
              className="inline-flex items-center rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold px-6 py-3 transition"
            >
              Aceptar y Registrarse
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-sm text-slate-400">
        © 2025 CLAIM. Todos los derechos reservados.
      </footer>
    </>
  );
}