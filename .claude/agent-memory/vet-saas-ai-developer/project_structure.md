---
name: Estructura del proyecto VetCloud
description: Ubicación de archivos clave, patrones de código y convenciones del frontend Next.js
type: project
---

## Raíz del monorepo
`/c/Users/USUARIO/Documents/vet-cloud/vet-cloud/`

- `vet-saas-backend/` — Fastify API, puerto 3333
- `vet-saas-front/` — Next.js App Router, TypeScript, Tailwind CSS

## Frontend (`vet-saas-front/src/`)

### Servicios API
- `services/api.ts` — instancia axios con baseURL `http://localhost:3333` e interceptor JWT desde localStorage
- `services/appointments.ts` — patrón de referencia para servicios
- `services/clinical-notes.ts` — creado en M2
- `services/reminders.ts` — creado en M3
- `services/invoices.ts` — creado en M4 (Invoice, InvoiceItem, InvoiceStats, CRUD + stats)
- `services/inventory.ts` — creado en M5 (Product, StockMovement, InventoryStats, CRUD + movements + stats)
- `services/reports.ts` — creado en M6 (DashboardStats, AppointmentsReport, ClientsReport, FinancialReport, InventoryReport, RemindersReport)

### Páginas (App Router, todas "use client")
- `app/dashboard/clients/page.tsx` — patrón de referencia (tabla con CRUD)
- `app/dashboard/appointments/page.tsx` — patrón avanzado (modal create + autocomplete mascota + stats)
- `app/dashboard/clinical-notes/page.tsx` — creado en M2 (cards + modal IA + polling)
- `app/dashboard/reminders/page.tsx` — creado en M3 (3 tabs + stats cards)
- `app/dashboard/invoices/page.tsx` — creado en M4 (stats, tabla filtrable, modal create con line items dinámicos, modal detalle con botones por estado)
- `app/dashboard/inventory/page.tsx` — creado en M5 (4 stats cards, banner lowStock amarillo, tabla con badge categoría + alerta stock, modal producto crear/editar, modal movimiento con preview en tiempo real, filtros búsqueda+categoría+toggle)
- `app/dashboard/reports/page.tsx` — creado en M6 (6 tabs: Dashboard KPIs, Citas, Clientes, Financiero, Inventario, Recordatorios; sin librerías gráficas, CSS puro)
- `app/dashboard/layout.tsx` — layout con Sidebar fijo

### Servicios API
- `services/catalog.ts` — creado en M7 (CatalogItem, searchCatalog(), getServices/createService/updateService/deleteService)

### Páginas (App Router, todas "use client")
- `app/dashboard/services/page.tsx` — creado en M7 (tabla CRUD catálogo de servicios, modal crear/editar)

### Componentes
- `components/Sidebar.tsx` — incluye enlaces a: appointments, clients, pets, clinical-notes, reminders, protocols, invoices, **services (Catalogo)**, inventory, reports, team

## Patrones establecidos
- Autocomplete de mascota: input libre → lista filtrada clicable → estado `selectedPetId`
- Modales: `fixed inset-0 z-50 bg-black/40` con `bg-white rounded-xl shadow-xl`
- Loading skeleton: `animate-pulse` con divs grises
- Errores: `alert()` para errores de carga, banner rojo inline para errores de formulario
- Clases CSS: `bg-card-bg`, `border-border`, `text-muted`, `bg-primary`, `bg-primary-hover`, `text-danger`

## Backend endpoints relevantes
- `POST /clinical-notes` — crear borrador
- `POST /clinical-notes/:id/generate` — disparar generación IA
- `PATCH /clinical-notes/:id/review` — aprobar/editar/rechazar (body: `{status, finalNote?, vetFeedback?}`)
- `GET /reminders/stats` — devuelve `{total, upcoming, overdue, notificationsSentToday}`
- `GET /reminders/upcoming?days=7`
- `GET /reminders/overdue`
- `POST /invoices` — crear factura con items (auto-genera número F-001...)
- `GET /invoices?status=&clientId=` — listar con filtros
- `GET /invoices/stats` — `{total, draft, issued, paid, cancelled, totalRevenue}`
- `GET /invoices/:id` — detalle completo
- `PUT /invoices/:id` — cambiar status/notas (PAID auto-setea paidAt)
- `DELETE /invoices/:id` — solo si status=DRAFT

**Why (IA):** El flow de IA es dos pasos: POST crea DRAFT, luego POST /:id/generate lo pasa a GENERATING. El frontend hace polling cada 3s hasta que status != GENERATING.

**Why (invoices stats):** La ruta /invoices/stats debe registrarse ANTES de /invoices/:id en Fastify, o "stats" será interpretado como un UUID y devolverá 404.

## Patrones Zod en backend
- NO usar `errorMap` ni `error:` como segundo argumento de `z.enum()` — la versión de Zod instalada no lo soporta. Usar `z.enum(VALUES)` sin opciones, o pasar mensaje como string simple.
- Patrón correcto: `z.enum(["A","B","C"] as const)` — sin objeto de opciones.

## Schema Prisma — modelos M5
- `Product` — id, tenantId, name, description?, category(ProductCategory), unit, costPrice, salePrice, stock, minStock, maxStock?, sku?, active(soft delete). Índices: [tenantId], [tenantId,active], [tenantId,category]
- `StockMovement` — id, tenantId, productId, type(MovementType), quantity, reason?, stockBefore, stockAfter. No soft delete (auditoría permanente).
- `ProductCategory` enum: MEDICINE | VACCINE | FOOD | ACCESSORY | CONSUMABLE | EQUIPMENT | OTHER
- `MovementType` enum: IN | OUT | ADJUSTMENT
- Lógica de movimiento: IN suma, OUT resta (valida no negativo), ADJUSTMENT setea directo. Todo en `prisma.$transaction`.
- Relaciones añadidas: Tenant.products, Tenant.stockMovements

## Backend endpoints M6 (reports)
- `GET /reports/dashboard?period=week|month|year` — KPIs ejecutivos (appointmentsCount, appointmentsByStatus, newClients, newPets, revenueTotal, invoicesByStatus, remindersStats, topServices)
- `GET /reports/appointments?from=&to=` — lista citas con pet+client+vet, totales por estado
- `GET /reports/clients` — totalClients, totalPets, avgPetsPerClient, topSpecies, topClients(5), petsWithoutRecentAppointment(90 días)
- `GET /reports/financial?from=&to=` — facturas del período, totales (issued/paid/pending/cancelled), revenueByPeriod (agrupado por semana ISO)
- `GET /reports/inventory` — totalActiveProducts, lowStockCount, totalStockValue, lowStockProducts, recentMovements(30d), productsWithoutMovement(30d)
- `GET /reports/reminders?from=&to=` — byEventType, notifications (total/sent/opened/confirmed/openRate/confirmRate), overallStats con confirmationRate%

**Lección M6 — Prisma aggregate:** Los campos Boolean (delivered, opened, confirmed) NO son sumables con `_sum` en Prisma aggregate. Usar `prisma.model.count({ where: { field: true } })` separado para cada booleano.

## Schema Prisma — modelo Service (M7)
- `Service` — id, tenantId, name, description?, price(Float), category?, active(Boolean). Índices: [tenantId], [tenantId,active]
- Relación añadida: Tenant.services
- Migración: `20260421194203_add_services_catalog`

## Backend endpoints M7 (services / catalog)
- `GET /services/search-catalog?q=texto` — búsqueda unificada; retorna [{type:"service"|"product", id, name, description?, price, category?, stock?, unit?}]; máx 4 servicios + 4 productos. IMPORTANTE: registrar ANTES de /:id en Fastify.
- `POST /services` — crear servicio
- `GET /services?search=&active=true|false` — listar (default: solo activos)
- `GET /services/:id` — detalle
- `PUT /services/:id` — actualizar
- `DELETE /services/:id` — eliminar (hard delete, no hay integridad clínica)

## Patrón autocomplete con debounce (M7)
- Componente `ItemDescriptionInput` en invoices/page.tsx: usa `useRef<ReturnType<typeof setTimeout>>` para el debounceRef.
- Debounce 300ms → llama `searchCatalog()` → muestra dropdown con grupos "Servicios" (azul) y "Productos" (verde).
- `onMouseDown` en lugar de `onClick` en cada opción del dropdown para que el blur del input no cierre el dropdown antes del click.
- El usuario puede siempre escribir manualmente sin seleccionar del catálogo.
- El contenedor `<td>` debe tener `overflow-visible` (no `overflow-hidden`) para que el dropdown no quede cortado por el borde de la tabla.

## Schema backend — VaccinationProtocol (M8)
- `vaccination-protocols.schema.ts` usa: `name`, `vaccineType`, `species`, `breed?`, `minAgeDays?`, `maxAgeDays?` (dias, NO meses), `minWeightKg?`, `intervalDays?` (NO recurrenceDays), `preReminderDays` (default 7), `postReminderDays` (default 3), `customMessage?`, `active?`
- El servicio filtra con `OR: [{tenantId}, {tenantId: null}]` — protocolos globales (tenantId null) son del sistema y no pueden eliminarse ni actualizarse desde el tenant.
- Endpoints bajo `/vaccination-protocols` (GET, POST, GET /:id, PUT /:id, DELETE /:id)
- Frontend: `services/protocols.ts` + `app/dashboard/protocols/page.tsx` (commit a38ea9c)
- Página incluye: tabla con badge especie, chips de plantillas rapidas en modal, diagrama de flujo CSS PRE/POST, estado vacío con ejemplo visual, skeleton 8 columnas.

## Schema Prisma — modelos M4
- `Invoice` — id, tenantId, clientId, petId?, number (F-001), status(InvoiceStatus), subtotal, tax(%), total, notes, issuedAt, dueAt, paidAt. Unique: [tenantId, number]
- `InvoiceItem` — id, invoiceId, description, quantity, unitPrice, total. onDelete: Cascade
- `InvoiceStatus` enum: DRAFT | ISSUED | PAID | CANCELLED
- Relaciones añadidas: Tenant.invoices, Client.invoices, Pet.invoices
