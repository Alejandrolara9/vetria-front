import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidad — Vetria Cloud",
  description: "Política de privacidad y tratamiento de datos personales de la plataforma SaaS veterinaria Vetria Cloud.",
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-teal-700 font-bold text-lg">
            🐾 Vetria Cloud
          </Link>
          <div className="flex gap-4 text-sm text-gray-500">
            <Link href="/terminos" className="hover:text-teal-600 transition-colors">
              Términos y Condiciones
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Política de Privacidad y Tratamiento de Datos</h1>
            <p className="text-sm text-gray-400">Última actualización: mayo de 2025 · Aplicable a: vetria.cloud</p>
          </div>

          <div className="prose prose-gray max-w-none text-sm leading-7 space-y-8">

            {/* 1 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Responsable del Tratamiento</h2>
              <p>
                <strong>Vetria Cloud</strong> (en adelante, &ldquo;el Responsable&rdquo; o &ldquo;la Plataforma&rdquo;), accesible en{" "}
                <strong>vetria.cloud</strong>, es responsable del tratamiento de los datos personales que usted
                nos suministra directamente al registrarse y usar el Servicio.
              </p>
              <p className="mt-3">
                Para ejercer sus derechos o plantear cualquier consulta relacionada con el tratamiento de sus datos,
                puede contactarnos en:{" "}
                <a href="mailto:cloudvetria@gmail.com" className="text-teal-600 hover:underline">
                  cloudvetria@gmail.com
                </a>
              </p>
            </section>

            {/* 2 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Marco Legal Aplicable</h2>
              <p>
                Esta Política se rige por la normativa colombiana vigente en materia de protección de datos personales,
                en particular:
              </p>
              <ul className="mt-2 space-y-1 list-disc list-inside text-gray-600">
                <li><strong>Ley 1581 de 2012</strong> — Disposiciones generales para la protección de datos personales (Habeas Data).</li>
                <li><strong>Decreto 1377 de 2013</strong> — Reglamenta parcialmente la Ley 1581 de 2012.</li>
                <li><strong>Decreto 1074 de 2015</strong> — Decreto Único Reglamentario del Sector Comercio, Industria y Turismo.</li>
                <li><strong>Circular 002 de 2015 de la SIC</strong> — Instrucciones sobre medidas de seguridad de la información.</li>
                <li><strong>Ley 1480 de 2011</strong> — Estatuto del Consumidor.</li>
              </ul>
            </section>

            {/* 3 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">3. Datos que Recopilamos</h2>

              <h3 className="font-medium text-gray-800 mt-3 mb-2">3.1 Datos del suscriptor (Usuario / Clínica)</h3>
              <ul className="space-y-1 list-disc list-inside text-gray-600">
                <li>Nombre completo o razón social.</li>
                <li>Correo electrónico y número de teléfono.</li>
                <li>Información de facturación (procesada por pasarelas de pago de terceros).</li>
                <li>Datos de acceso: correo y contraseña cifrada.</li>
                <li>Datos de uso: funcionalidades utilizadas, frecuencia de acceso, logs técnicos.</li>
              </ul>

              <h3 className="font-medium text-gray-800 mt-4 mb-2">3.2 Datos ingresados por el Usuario (Propietarios de mascotas)</h3>
              <p className="text-gray-600">
                El Usuario ingresa voluntariamente en la Plataforma datos de terceros (propietarios de mascotas) para
                la gestión veterinaria. Estos datos incluyen:
              </p>
              <ul className="mt-2 space-y-1 list-disc list-inside text-gray-600">
                <li>Nombre, teléfono y correo electrónico del propietario.</li>
                <li>Datos de la mascota: nombre, especie, raza, edad, sexo, peso.</li>
                <li>Historial clínico: consultas, diagnósticos, tratamientos, vacunas, archivos adjuntos.</li>
                <li>Recordatorios y notificaciones programadas.</li>
              </ul>
              <p className="mt-3 text-gray-600">
                El Usuario asume el rol de <strong>responsable del tratamiento</strong> de estos datos frente a los
                propietarios de mascotas. Vetria Cloud actúa como <strong>encargado del tratamiento</strong>, procesando
                la información únicamente para prestar el Servicio contratado.
              </p>

              <h3 className="font-medium text-gray-800 mt-4 mb-2">3.3 Datos técnicos y de navegación</h3>
              <ul className="space-y-1 list-disc list-inside text-gray-600">
                <li>Dirección IP y datos del dispositivo (navegador, sistema operativo).</li>
                <li>Registros de actividad (logs) para seguridad y diagnóstico técnico.</li>
                <li>Cookies de sesión y preferencias (ver sección 9).</li>
              </ul>
            </section>

            {/* 4 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Finalidades del Tratamiento</h2>
              <p>Tratamos sus datos personales para las siguientes finalidades:</p>
              <ul className="mt-2 space-y-2 list-none pl-0 text-gray-600">
                {[
                  ["Prestación del Servicio", "Crear y gestionar su cuenta, Tenant y acceso a las funcionalidades contratadas."],
                  ["Facturación y pagos", "Procesar suscripciones, renovaciones y gestión de pagos a través de pasarelas autorizadas."],
                  ["Comunicaciones transaccionales", "Enviar confirmaciones de registro, recordatorios de renovación, alertas de seguridad y notificaciones del Servicio."],
                  ["Soporte técnico", "Responder consultas, resolver incidencias y mejorar la experiencia de uso."],
                  ["Seguridad e integridad", "Detectar, prevenir y responder ante fraudes, abusos o accesos no autorizados."],
                  ["Mejora del Servicio", "Analizar patrones de uso de forma agregada y anonimizada para mejorar funcionalidades."],
                  ["Cumplimiento legal", "Atender requerimientos de autoridades competentes según la ley colombiana."],
                ].map(([title, desc]) => (
                  <li key={title} className="flex gap-2">
                    <span className="font-medium text-gray-700 whitespace-nowrap">• {title}:</span>
                    <span>{desc}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* 5 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Base Legal del Tratamiento</h2>
              <p>El tratamiento de sus datos personales se realiza con base en:</p>
              <ul className="mt-2 space-y-1 list-disc list-inside text-gray-600">
                <li><strong>Ejecución contractual:</strong> necesario para prestar el Servicio contratado.</li>
                <li><strong>Consentimiento:</strong> otorgado al aceptar esta Política durante el registro.</li>
                <li><strong>Interés legítimo:</strong> seguridad de la Plataforma, prevención de fraudes y mejora del Servicio.</li>
                <li><strong>Obligación legal:</strong> cuando la ley colombiana así lo exija.</li>
              </ul>
            </section>

            {/* 6 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Derechos de los Titulares</h2>
              <p>
                De conformidad con la Ley 1581 de 2012, usted tiene los siguientes derechos sobre sus datos personales:
              </p>
              <ul className="mt-3 space-y-2 list-none pl-0 text-gray-600">
                {[
                  ["Conocer", "Acceder a los datos personales que tenemos sobre usted y conocer su uso."],
                  ["Actualizar", "Solicitar la corrección de datos inexactos, incompletos o desactualizados."],
                  ["Rectificar", "Exigir la rectificación de información incorrecta o errónea."],
                  ["Suprimir", "Solicitar la eliminación de sus datos cuando no sean necesarios para las finalidades autorizadas (salvo obligación legal de conservación)."],
                  ["Revocar", "Retirar el consentimiento otorgado en cualquier momento, sin efecto retroactivo."],
                  ["Quejarse", "Presentar queja ante la Superintendencia de Industria y Comercio (SIC) si considera que se han vulnerado sus derechos."],
                ].map(([right, desc]) => (
                  <li key={right} className="flex gap-2">
                    <span className="font-medium text-gray-700 whitespace-nowrap">• {right}:</span>
                    <span>{desc}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3">
                Para ejercer cualquiera de estos derechos, envíe su solicitud a{" "}
                <a href="mailto:cloudvetria@gmail.com" className="text-teal-600 hover:underline">
                  cloudvetria@gmail.com
                </a>{" "}
                indicando su nombre, correo registrado y el derecho que desea ejercer. Responderemos en un plazo máximo
                de <strong>15 días hábiles</strong> conforme a la ley.
              </p>
            </section>

            {/* 7 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Compartición de Datos con Terceros</h2>
              <p>
                Vetria Cloud <strong>no vende, arrienda ni comercializa</strong> sus datos personales. Podemos
                compartirlos únicamente en los siguientes casos:
              </p>
              <ul className="mt-3 space-y-2 list-none pl-0 text-gray-600">
                {[
                  ["Procesadores de pago", "Mercado Pago u otras pasarelas autorizadas, para gestionar suscripciones y transacciones."],
                  ["Proveedores de infraestructura", "Amazon Web Services (AWS) u otros proveedores de nube, para el alojamiento seguro de datos."],
                  ["Servicios de correo electrónico", "Proveedores de envío de correos (transaccionales y notificaciones) vinculados contractualmente."],
                  ["Inteligencia Artificial", "Anthropic (Claude AI) para la generación de historias clínicas. Los datos enviados se utilizan únicamente para procesar la solicitud y no se usan para entrenar modelos."],
                  ["Autoridades", "Organismos gubernamentales o judiciales competentes cuando la ley colombiana así lo requiera."],
                ].map(([party, desc]) => (
                  <li key={party} className="flex gap-2">
                    <span className="font-medium text-gray-700 whitespace-nowrap">• {party}:</span>
                    <span>{desc}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3">
                Todos los subencargados están sujetos a obligaciones contractuales de confidencialidad y seguridad
                equivalentes a las establecidas en esta Política.
              </p>
            </section>

            {/* 8 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Transferencias Internacionales de Datos</h2>
              <p>
                El uso de servicios de infraestructura en la nube (AWS) y de inteligencia artificial (Anthropic) puede
                implicar la transferencia de datos a servidores ubicados fuera de Colombia, principalmente en
                Estados Unidos.
              </p>
              <p className="mt-3">
                Vetria Cloud garantiza que dichas transferencias se realizan con proveedores que ofrecen niveles
                adecuados de protección, conforme al artículo 26 de la Ley 1581 de 2012, mediante cláusulas
                contractuales estándar o marcos de privacidad equivalentes.
              </p>
            </section>

            {/* 9 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">9. Cookies y Tecnologías de Seguimiento</h2>
              <p>
                Vetria Cloud utiliza cookies y tecnologías similares para garantizar el funcionamiento correcto
                de la Plataforma:
              </p>
              <ul className="mt-3 space-y-2 list-none pl-0 text-gray-600">
                {[
                  ["Cookies de sesión", "Esenciales para mantener su sesión autenticada. No almacenan datos sensibles. Se eliminan al cerrar el navegador."],
                  ["Cookies de preferencias", "Guardan configuraciones de la interfaz (idioma, tema). Persisten entre sesiones."],
                  ["Cookies de seguridad", "Detectan intentos de acceso fraudulento y protegen la integridad de la sesión."],
                ].map(([type, desc]) => (
                  <li key={type} className="flex gap-2">
                    <span className="font-medium text-gray-700 whitespace-nowrap">• {type}:</span>
                    <span>{desc}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3">
                Vetria Cloud <strong>no utiliza cookies de seguimiento publicitario</strong> ni comparte datos de
                comportamiento con redes de publicidad. Puede configurar su navegador para bloquear cookies, aunque
                esto puede afectar el funcionamiento de la Plataforma.
              </p>
            </section>

            {/* 10 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">10. Datos de Mascotas y Clientes — Obligaciones del Usuario</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-blue-900">
                <p className="font-semibold mb-2">Importante para clínicas y veterinarios</p>
                <p>
                  Al ingresar datos de propietarios de mascotas en Vetria Cloud, usted actúa como{" "}
                  <strong>responsable del tratamiento</strong> de esa información. Esto implica que usted debe:
                </p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Obtener el consentimiento informado de sus clientes para el tratamiento digital de sus datos.</li>
                  <li>Informarles sobre las herramientas tecnológicas utilizadas en la gestión de su información.</li>
                  <li>Atender directamente las solicitudes de acceso, rectificación o supresión de sus clientes.</li>
                  <li>Cumplir con la Ley 1581 de 2012 en su calidad de responsable del tratamiento.</li>
                </ul>
              </div>
            </section>

            {/* 11 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">11. Seguridad de la Información</h2>
              <p>
                Implementamos medidas técnicas y organizativas razonables para proteger sus datos personales, incluyendo:
              </p>
              <ul className="mt-2 space-y-1 list-disc list-inside text-gray-600">
                <li>Cifrado en tránsito mediante TLS (HTTPS) en todas las comunicaciones.</li>
                <li>Contraseñas almacenadas con hash criptográfico (bcrypt).</li>
                <li>Control de acceso basado en roles (RBAC) dentro de cada Tenant.</li>
                <li>Aislamiento de datos entre Tenants (multi-tenancy seguro).</li>
                <li>Copias de seguridad periódicas de la base de datos.</li>
                <li>Monitoreo de accesos y alertas de seguridad.</li>
                <li>Rate limiting y protecciones contra ataques de fuerza bruta.</li>
              </ul>
              <p className="mt-3">
                A pesar de estas medidas, ningún sistema de seguridad es infalible. En caso de una brecha de seguridad
                que afecte sus datos, le notificaremos conforme a los plazos y procedimientos establecidos por la SIC.
              </p>
            </section>

            {/* 12 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">12. Retención y Eliminación de Datos</h2>
              <p>Conservamos sus datos personales durante los siguientes períodos:</p>
              <ul className="mt-3 space-y-2 list-none pl-0 text-gray-600">
                {[
                  ["Datos de cuenta activa", "Mientras la suscripción esté activa y hasta la solicitud de eliminación."],
                  ["Datos tras cancelación", "30 días calendario de acceso de solo lectura para exportación, tras lo cual pueden eliminarse."],
                  ["Registros de facturación", "Mínimo 5 años conforme a obligaciones contables y tributarias colombianas."],
                  ["Logs de seguridad", "Hasta 12 meses para investigación de incidentes de seguridad."],
                  ["Solicitudes de eliminación", "Atendidas en máximo 15 días hábiles, salvo obligación legal de conservación."],
                ].map(([period, desc]) => (
                  <li key={period} className="flex gap-2">
                    <span className="font-medium text-gray-700 whitespace-nowrap">• {period}:</span>
                    <span>{desc}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* 13 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">13. Inteligencia Artificial y Privacidad</h2>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900">
                <p className="font-semibold mb-1">⚠️ Datos enviados a servicios de IA</p>
                <p>
                  La funcionalidad de generación de historias clínicas utiliza la API de{" "}
                  <strong>Anthropic (Claude AI)</strong>. Al usar esta función, fragmentos del historial clínico de la
                  mascota son enviados a los servidores de Anthropic para generar el texto.
                </p>
                <p className="mt-2">
                  Anthropic procesa estos datos únicamente para responder la solicitud y{" "}
                  <strong>no los utiliza para entrenar sus modelos</strong> en virtud de los acuerdos de uso de API.
                  No obstante, le recomendamos no incluir datos personales identificables innecesarios al usar
                  esta funcionalidad.
                </p>
              </div>
            </section>

            {/* 14 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">14. Menores de Edad</h2>
              <p>
                Vetria Cloud no está dirigida a menores de 18 años como usuarios del Servicio. No recopilamos
                intencionalmente datos personales de menores de edad. Si un menor de edad es propietario de una mascota,
                el tratamiento de sus datos deberá realizarse con el consentimiento de su representante legal, siendo
                el veterinario Usuario el responsable de obtenerlo.
              </p>
            </section>

            {/* 15 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">15. Cambios a esta Política</h2>
              <p>
                Vetria Cloud puede actualizar esta Política de Privacidad periódicamente. Las modificaciones
                significativas serán notificadas al correo registrado o mediante aviso destacado en la Plataforma
                con al menos <strong>15 días de anticipación</strong>.
              </p>
              <p className="mt-3">
                El uso continuado del Servicio tras la publicación de cambios implica la aceptación de la nueva
                Política. Le recomendamos revisar esta página periódicamente.
              </p>
            </section>

            {/* 16 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">16. Autoridad de Control</h2>
              <p>
                La entidad competente para supervisar el cumplimiento de la normativa de protección de datos en
                Colombia es la{" "}
                <strong>Superintendencia de Industria y Comercio (SIC)</strong>, Delegatura para la Protección
                de Datos Personales. Puede presentar reclamaciones ante la SIC si considera que sus derechos han
                sido vulnerados, una vez agotada la vía directa con Vetria Cloud.
              </p>
              <p className="mt-3">
                Sitio web de la SIC:{" "}
                <a
                  href="https://www.sic.gov.co"
                  className="text-teal-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  www.sic.gov.co
                </a>
              </p>
            </section>

            {/* 17 */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">17. Contacto — Delegado de Protección de Datos</h2>
              <p>
                Para ejercer sus derechos, formular consultas o presentar peticiones relacionadas con el tratamiento
                de sus datos personales, contáctenos:
              </p>
              <ul className="mt-3 space-y-1 list-none text-gray-600">
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
              <p className="mt-3 text-gray-500">
                Tiempo de respuesta: máximo <strong>15 días hábiles</strong> conforme a la Ley 1581 de 2012.
              </p>
            </section>

          </div>

          {/* Footer nav */}
          <div className="mt-12 pt-6 border-t border-gray-100 flex flex-wrap gap-4 text-sm text-gray-400">
            <Link href="/terminos" className="hover:text-teal-600 transition-colors">
              Términos y Condiciones →
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
