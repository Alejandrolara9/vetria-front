import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Términos y Condiciones — Vetria Cloud",
  description: "Términos y condiciones de uso de la plataforma SaaS veterinaria Vetria Cloud.",
};

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-teal-700 font-bold text-lg">
            🐾 Vetria Cloud
          </Link>
          <div className="flex gap-4 text-sm text-gray-500">
            <Link href="/privacidad" className="hover:text-teal-600 transition-colors">
              Política de Privacidad
            </Link>
            <Link href="/login" className="hover:text-teal-600 transition-colors">
              Iniciar sesión
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">

          <div className="mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Términos y Condiciones de Uso</h1>
            <p className="text-sm text-gray-400">Última actualización: mayo de 2025 · Aplicable a: vetria.cloud</p>
          </div>

          <div className="prose prose-gray max-w-none text-sm leading-7 space-y-8">

            {/* 1 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Aceptación de los Términos</h2>
              <p>
                Al registrarse, acceder o utilizar la plataforma <strong>Vetria Cloud</strong> (en adelante, &ldquo;la Plataforma&rdquo;),
                disponible en <strong>vetria.cloud</strong>, usted declara haber leído, entendido y aceptado íntegramente los
                presentes Términos y Condiciones de Uso (&ldquo;Términos&rdquo;), así como la Política de Privacidad vigente.
              </p>
              <p className="mt-3">
                Si actúa en nombre de una persona jurídica (clínica veterinaria, empresa o consultorio), declara tener
                facultad suficiente para vincularla a estos Términos. Si no está de acuerdo con alguna cláusula, debe
                abstenerse de usar la Plataforma.
              </p>
              <p className="mt-3">
                El uso continuado de la Plataforma tras la publicación de modificaciones implica la aceptación de los
                nuevos términos.
              </p>
            </section>

            {/* 2 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Definiciones</h2>
              <ul className="space-y-1 list-none pl-0">
                {[
                  ["Vetria Cloud / Proveedor", "La empresa proveedora del servicio SaaS veterinario accesible en vetria.cloud."],
                  ["Usuario / Suscriptor", "La clínica veterinaria, veterinario independiente o persona autorizada que contrata y utiliza la Plataforma."],
                  ["Tenant", "La unidad organizacional (clínica o consultorio) creada bajo una suscripción activa."],
                  ["Datos del Paciente", "Información de mascotas, su historial clínico y datos de contacto de sus propietarios, ingresados por el Usuario."],
                  ["Cuenta", "Las credenciales de acceso únicas asignadas a cada Usuario o miembro del equipo."],
                  ["Servicio", "La totalidad de funcionalidades ofrecidas por la Plataforma, incluyendo gestión clínica, recordatorios, fórmulas médicas y herramientas con IA."],
                ].map(([term, def]) => (
                  <li key={term} className="flex gap-2">
                    <span className="font-medium text-gray-700 whitespace-nowrap">• {term}:</span>
                    <span className="text-gray-600">{def}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* 3 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Descripción del Servicio</h2>
              <p>
                Vetria Cloud es una plataforma de software como servicio (SaaS) diseñada para clínicas veterinarias y
                profesionales de la salud animal en Colombia y Latinoamérica. El Servicio incluye, entre otras funcionalidades:
              </p>
              <ul className="mt-3 space-y-1 list-disc list-inside text-gray-600">
                <li>Gestión de clientes, mascotas e historias clínicas.</li>
                <li>Programación de citas y agenda veterinaria.</li>
                <li>Generación de fórmulas médicas en PDF con envío por correo electrónico.</li>
                <li>Recordatorios automáticos de vacunas, desparasitantes y controles.</li>
                <li>Módulo de facturación e inventario básico.</li>
                <li>Generación de historias clínicas asistida por inteligencia artificial (IA).</li>
                <li>Portal del propietario de mascotas.</li>
                <li>Almacenamiento seguro de archivos clínicos.</li>
              </ul>
              <p className="mt-3">
                Las funcionalidades disponibles dependen del plan de suscripción contratado. Vetria Cloud se reserva el
                derecho de incorporar, modificar o discontinuar funcionalidades con previo aviso.
              </p>
            </section>

            {/* 4 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Herramienta de Apoyo — No Reemplaza el Criterio Profesional</h2>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900">
                <p className="font-semibold mb-1">⚠️ Aviso importante</p>
                <p>
                  Vetria Cloud es una herramienta tecnológica de apoyo a la gestión clínica veterinaria. Las funcionalidades
                  de inteligencia artificial, incluyendo la generación automática de historias clínicas, sugerencias
                  diagnósticas y recomendaciones, son <strong>auxiliares informativas</strong> y no constituyen diagnóstico
                  médico veterinario, prescripción ni consejo profesional.
                </p>
                <p className="mt-2">
                  El veterinario responsable es el único habilitado para emitir diagnósticos, formular medicamentos y
                  tomar decisiones clínicas. Vetria Cloud <strong>no asume ninguna responsabilidad</strong> por decisiones
                  médicas adoptadas con base en el contenido generado por la Plataforma.
                </p>
              </div>
            </section>

            {/* 5 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Registro y Cuenta de Usuario</h2>
              <p>Para acceder al Servicio, el Usuario debe:</p>
              <ul className="mt-2 space-y-1 list-disc list-inside text-gray-600">
                <li>Proporcionar información verídica, completa y actualizada durante el registro.</li>
                <li>Ser mayor de 18 años o contar con representación legal.</li>
                <li>Ser un profesional veterinario habilitado o una clínica legalmente constituida.</li>
                <li>Mantener la confidencialidad de sus credenciales de acceso.</li>
              </ul>
              <p className="mt-3">
                El Usuario es responsable de todas las actividades realizadas desde su Cuenta. Debe notificar
                inmediatamente a <strong>cloudvetria@gmail.com</strong> cualquier acceso no autorizado o brecha de
                seguridad que detecte.
              </p>
              <p className="mt-3">
                Vetria Cloud podrá rechazar el registro o suspender cuentas cuando la información proporcionada sea
                falsa, incompleta o cuando el uso sea contrario a estos Términos.
              </p>
            </section>

            {/* 6 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Protección de Credenciales y Seguridad</h2>
              <p>El Usuario se compromete a:</p>
              <ul className="mt-2 space-y-1 list-disc list-inside text-gray-600">
                <li>Utilizar contraseñas robustas y no compartirlas con terceros no autorizados.</li>
                <li>No permitir el acceso a la Plataforma a personas ajenas al equipo habilitado en su Tenant.</li>
                <li>Cerrar sesión al usar dispositivos compartidos o públicos.</li>
                <li>No intentar eludir mecanismos de autenticación o seguridad de la Plataforma.</li>
                <li>Notificar de inmediato cualquier acceso sospechoso o pérdida de credenciales.</li>
              </ul>
              <p className="mt-3">
                Vetria Cloud implementa cifrado en tránsito (TLS), control de acceso por roles y medidas de seguridad
                razonables. No obstante, ningún sistema es infalible, por lo que el Usuario asume su parte de
                responsabilidad en la protección de su cuenta.
              </p>
            </section>

            {/* 7 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Tratamiento de Datos de Mascotas y Clientes</h2>
              <p>
                El Usuario ingresa voluntariamente en la Plataforma datos personales de los propietarios de mascotas
                (nombre, teléfono, correo electrónico) y datos de las mascotas (especie, raza, historial clínico).
              </p>
              <p className="mt-3">El Usuario declara y garantiza que:</p>
              <ul className="mt-2 space-y-1 list-disc list-inside text-gray-600">
                <li>Cuenta con el consentimiento de los propietarios de mascotas para el tratamiento de sus datos.</li>
                <li>El uso de dichos datos cumple con la Ley 1581 de 2012 (Habeas Data) y normativa colombiana aplicable.</li>
                <li>No ingresará datos sensibles más allá de los necesarios para la gestión veterinaria.</li>
                <li>Informará a sus clientes sobre el uso de herramientas digitales en la gestión de su información.</li>
              </ul>
              <p className="mt-3">
                Vetria Cloud actúa como <strong>encargado del tratamiento</strong> de estos datos, procesándolos
                únicamente según las instrucciones del Usuario (responsable del tratamiento) y para la prestación
                del Servicio contratado. Los datos no serán comercializados, cedidos ni utilizados con fines distintos.
              </p>
            </section>

            {/* 8 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Pagos, Suscripciones y Facturación</h2>
              <p>
                El acceso a funcionalidades avanzadas de Vetria Cloud requiere una suscripción activa de pago. Los
                planes, precios y condiciones vigentes se publican en la Plataforma y pueden modificarse con previo aviso.
              </p>
              <h3 className="font-medium text-gray-800 mt-4 mb-2">8.1 Procesamiento de pagos</h3>
              <p>
                Los pagos se procesan a través de pasarelas de pago de terceros, actualmente <strong>Mercado Pago</strong>,
                y eventualmente otras plataformas autorizadas. Vetria Cloud no almacena datos de tarjetas de crédito ni
                información financiera sensible directamente en sus servidores.
              </p>
              <h3 className="font-medium text-gray-800 mt-4 mb-2">8.2 Créditos de IA</h3>
              <p>
                La generación de historias clínicas con IA consume créditos de la cuenta. Los créditos adquiridos no son
                reembolsables, no tienen fecha de vencimiento dentro de la vigencia del plan activo y no son transferibles
                a otras cuentas.
              </p>
              <h3 className="font-medium text-gray-800 mt-4 mb-2">8.3 Morosidad</h3>
              <p>
                La falta de pago de la suscripción podrá derivar en la suspensión del acceso a funcionalidades de pago.
                Los datos del Usuario se conservarán durante un período razonable para facilitar la reactivación.
              </p>
            </section>

            {/* 9 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Cancelaciones y Reembolsos</h2>
              <p>
                El Usuario puede cancelar su suscripción en cualquier momento desde la configuración de su cuenta o
                contactando a <strong>cloudvetria@gmail.com</strong>. La cancelación tendrá efecto al finalizar el
                período de facturación en curso.
              </p>
              <p className="mt-3">
                <strong>No se realizan reembolsos parciales</strong> por períodos no utilizados, salvo en casos de
                fallo grave del Servicio atribuible exclusivamente a Vetria Cloud, a juicio razonado del Proveedor.
                Los créditos de IA no son reembolsables.
              </p>
              <p className="mt-3">
                Tras la cancelación, el Usuario tendrá acceso de solo lectura a sus datos durante 30 días calendario
                para facilitar la exportación de información. Transcurrido ese período, los datos podrán ser eliminados.
              </p>
            </section>

            {/* 10 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Suspensión y Terminación de Cuentas</h2>
              <p>
                Vetria Cloud se reserva el derecho de suspender, restringir o terminar definitivamente una cuenta,
                con o sin previo aviso, en los siguientes supuestos:
              </p>
              <ul className="mt-3 space-y-1 list-disc list-inside text-gray-600">
                <li>Incumplimiento de estos Términos o la Política de Privacidad.</li>
                <li>Falta de pago de la suscripción vigente.</li>
                <li>Uso fraudulento, suplantación de identidad o registro con información falsa.</li>
                <li>Actividades ilícitas, incluyendo uso del Servicio para fines ilegales bajo la legislación colombiana.</li>
                <li>Intentos de acceso no autorizado, ingeniería inversa, scraping o vulneración de la infraestructura.</li>
                <li>Conductas que perjudiquen a otros usuarios, a terceros o a la reputación de Vetria Cloud.</li>
                <li>Uso abusivo de recursos que afecte la disponibilidad del Servicio para otros usuarios.</li>
                <li>Solicitud de un organismo competente o autoridad judicial.</li>
              </ul>
              <p className="mt-3">
                En casos de fraude comprobado o actividades ilegales, la terminación será inmediata y sin derecho a
                reembolso. Para incumplimientos subsanables, se intentará notificar al Usuario con anticipación
                razonable.
              </p>
            </section>

            {/* 11 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">11. Responsabilidades del Usuario</h2>
              <p>El Usuario se compromete a usar la Plataforma exclusivamente para fines lícitos y se obliga a:</p>
              <ul className="mt-2 space-y-1 list-disc list-inside text-gray-600">
                <li>No reproducir, copiar, vender ni explotar comercialmente el Servicio sin autorización escrita.</li>
                <li>No realizar pruebas de intrusión ni análisis de vulnerabilidades sin consentimiento expreso.</li>
                <li>No introducir virus, malware u otro código malicioso en la Plataforma.</li>
                <li>No interferir con el funcionamiento del Servicio ni con el de otros usuarios.</li>
                <li>Mantener actualizada la información de facturación y contacto.</li>
                <li>Respetar los derechos de propiedad intelectual de Vetria Cloud y de terceros.</li>
                <li>Cumplir con las obligaciones legales propias del ejercicio de la medicina veterinaria.</li>
              </ul>
            </section>

            {/* 12 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">12. Propiedad Intelectual</h2>
              <p>
                Todo el software, código fuente, diseño, marca, logotipos, textos, interfaces y documentación de
                Vetria Cloud son propiedad exclusiva del Proveedor y están protegidos por las leyes de propiedad
                intelectual colombianas e internacionales aplicables.
              </p>
              <p className="mt-3">
                El Usuario recibe una licencia de uso <strong>limitada, no exclusiva, no transferible y revocable</strong>
                para acceder y utilizar el Servicio durante la vigencia de su suscripción activa.
              </p>
              <p className="mt-3">
                El contenido ingresado por el Usuario (datos clínicos, archivos, registros) es de su propiedad.
                Al ingresarlo, otorga a Vetria Cloud una licencia para procesarlo con el único fin de prestar el
                Servicio contratado.
              </p>
            </section>

            {/* 13 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">13. Disponibilidad del Servicio, Backups y Mantenimiento</h2>
              <h3 className="font-medium text-gray-800 mt-3 mb-2">13.1 Disponibilidad</h3>
              <p>
                Vetria Cloud se esfuerza por mantener el Servicio disponible de forma continua. No obstante, no garantiza
                una disponibilidad del 100 %. Podrán ocurrir interrupciones por mantenimiento programado, actualizaciones,
                fallos de terceros proveedores (AWS, proveedores de nube) o causas de fuerza mayor.
              </p>
              <p className="mt-2">
                Los mantenimientos programados se anunciarán con antelación razonable. Las interrupciones no programadas
                serán atendidas con la mayor celeridad posible.
              </p>
              <h3 className="font-medium text-gray-800 mt-3 mb-2">13.2 Copias de seguridad</h3>
              <p>
                Vetria Cloud realiza copias de seguridad periódicas de la base de datos como medida de protección
                operativa interna. Sin embargo, el Usuario es responsable de exportar y conservar sus propios respaldos
                críticos. Vetria Cloud no garantiza la recuperación de datos en todos los escenarios de falla.
              </p>
              <h3 className="font-medium text-gray-800 mt-3 mb-2">13.3 Cambios en la plataforma</h3>
              <p>
                Vetria Cloud puede modificar, actualizar, agregar o remover funcionalidades del Servicio. Los cambios
                significativos serán comunicados con al menos 15 días de anticipación por correo electrónico o notificación
                en la Plataforma. El uso continuado tras los cambios implica su aceptación.
              </p>
            </section>

            {/* 14 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">14. Limitación de Responsabilidad</h2>
              <p>
                En la máxima medida permitida por la ley colombiana, Vetria Cloud no será responsable por:
              </p>
              <ul className="mt-2 space-y-1 list-disc list-inside text-gray-600">
                <li>Pérdida de datos causada por acciones del Usuario, uso indebido o fuerza mayor.</li>
                <li>Daños indirectos, lucro cesante, pérdida de oportunidad o daños emergentes.</li>
                <li>Decisiones clínicas, diagnósticos o tratamientos basados en sugerencias generadas por IA.</li>
                <li>Interrupciones del Servicio atribuibles a terceros (operadores de red, proveedores de nube, fuerza mayor).</li>
                <li>Accesos no autorizados derivados de negligencia del Usuario en la custodia de sus credenciales.</li>
                <li>Contenido ingresado por el Usuario o comunicaciones enviadas a sus clientes.</li>
              </ul>
              <p className="mt-3">
                La responsabilidad máxima acumulada de Vetria Cloud frente al Usuario, por cualquier concepto, no
                excederá el valor total pagado por el Usuario en los 3 meses inmediatamente anteriores al evento
                que originó el daño.
              </p>
            </section>

            {/* 15 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">15. Notificaciones y Comunicaciones</h2>
              <p>
                Las notificaciones legales dirigidas a Vetria Cloud deben enviarse a{" "}
                <a href="mailto:cloudvetria@gmail.com" className="text-teal-600 hover:underline">
                  cloudvetria@gmail.com
                </a>.
                Las comunicaciones al Usuario se realizarán al correo electrónico registrado en la Cuenta o mediante
                notificaciones en la Plataforma.
              </p>
            </section>

            {/* 16 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">16. Ley Aplicable y Resolución de Controversias</h2>
              <p>
                Estos Términos se rigen por las leyes de la República de Colombia, incluyendo la Ley 1480 de 2011
                (Estatuto del Consumidor), la Ley 1581 de 2012 (Protección de Datos Personales) y demás normativa
                aplicable a servicios tecnológicos y comercio electrónico.
              </p>
              <p className="mt-3">
                Ante cualquier controversia derivada de la interpretación o ejecución de estos Términos, las partes
                procurarán una solución amigable. De no lograrse, se someterán a los jueces y tribunales competentes
                de la República de Colombia, renunciando a cualquier otro fuero que pudiera corresponderles.
              </p>
            </section>

            {/* 17 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">17. Contacto y Soporte</h2>
              <p>Para consultas, soporte técnico o reportes de seguridad, puede contactarnos a través de:</p>
              <ul className="mt-2 space-y-1 list-none text-gray-600">
                <li>📧 <strong>Correo:</strong>{" "}
                  <a href="mailto:cloudvetria@gmail.com" className="text-teal-600 hover:underline">
                    cloudvetria@gmail.com
                  </a>
                </li>
                <li>🌐 <strong>Plataforma:</strong>{" "}
                  <a href="https://vetria.cloud" className="text-teal-600 hover:underline" target="_blank" rel="noopener noreferrer">
                    vetria.cloud
                  </a>
                </li>
              </ul>
            </section>

          </div>

          {/* Footer nav */}
          <div className="mt-12 pt-6 border-t border-gray-100 flex flex-wrap gap-4 text-sm text-gray-400">
            <Link href="/privacidad" className="hover:text-teal-600 transition-colors">
              Política de Privacidad →
            </Link>
            <Link href="/login" className="hover:text-teal-600 transition-colors">
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
