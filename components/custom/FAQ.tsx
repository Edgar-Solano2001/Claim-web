import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function FAQ() {
  return (
    <section className="bg-white dark:bg-zinc-900 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">
          Preguntas Frecuentes
        </h2>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>¿Cómo puedo registrarme?</AccordionTrigger>
            <AccordionContent className="text-zinc-600 dark:text-zinc-400">
              Para registrarte, haz clic en el botón <strong>“Registrar”</strong> en la parte superior derecha,
              y completa el formulario con tus datos.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>¿Puedo acceder desde cualquier dispositivo?</AccordionTrigger>
            <AccordionContent className="text-zinc-600 dark:text-zinc-400">
              Sí, nuestra plataforma es completamente <strong>responsive</strong> y puedes acceder desde
              computadoras, tablets o teléfonos móviles sin ningún problema.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>¿Qué tan confiables son las compras?</AccordionTrigger>
            <AccordionContent className="text-zinc-600 dark:text-zinc-400">
              Nos encargamos de verificar a cada uno de los usuarios, y además,
              todas las compras están protegidas por la garantía <strong>CLAIM</strong>.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>¿Cómo se entrega el producto?</AccordionTrigger>
            <AccordionContent className="text-zinc-600 dark:text-zinc-400">
              Nosotros contamos con opciones de <strong>Envío Seguro</strong> que van incluidas en la compra.
              Te damos una clave de rastreo y el pedido llega en cuestión de días a tu domicilio.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  )
}
