import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function FAQ() {
  return (
    <section className="text-purple-800 dark:text-purple-300 mb-10">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-purple-900 dark:text-purple-200">
          Preguntas Frecuentes
        </h2>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="cursor-pointer text-purple-700 dark:text-purple-200 transition-transform duration-300 hover:scale-105">
              ¿Cómo puedo registrarme?
            </AccordionTrigger>
            <AccordionContent className="text-purple-600 dark:text-purple-300">
              Para registrarte, haz clic en el botón{" "}
              <strong>“Registrar”</strong> en la parte superior derecha, y
              completa el formulario con tus datos.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger className="cursor-pointer text-purple-700 dark:text-purple-200 transition-transform duration-300 hover:scale-105">
              ¿Puedo acceder desde cualquier dispositivo?
            </AccordionTrigger>
            <AccordionContent className="text-purple-600 dark:text-purple-300">
              Sí, nuestra plataforma es completamente{" "}
              <strong>responsive</strong> y puedes acceder desde computadoras,
              tablets o teléfonos móviles sin ningún problema.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger className="cursor-pointer text-purple-700 dark:text-purple-200 transition-transform duration-300 hover:scale-105">
              ¿Qué tan confiables son las compras?
            </AccordionTrigger>
            <AccordionContent className="text-purple-600 dark:text-purple-300">
              Nos encargamos de verificar a cada uno de los usuarios, y además,
              todas las compras están protegidas por la garantía{" "}
              <strong>CLAIM</strong>.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger className="cursor-pointer text-purple-700 dark:text-purple-200 transition-transform duration-300 hover:scale-105">
              ¿Cómo se entrega el producto?
            </AccordionTrigger>
            <AccordionContent className="text-purple-600 dark:text-purple-300">
              Nosotros contamos con opciones de <strong>Envío Seguro</strong>{" "}
              que van incluidas en la compra. Te damos una clave de rastreo y el
              pedido llega en cuestión de días a tu domicilio.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
}
