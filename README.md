# Directory / Micro-SaaS Boilerplate

Un starter de Next.js 15 (App Router) para lanzar un directorio de herramientas o
recursos con listados de pago, moderación y analítica — pensado para poner en
producción en menos de dos horas.

## Stack

- **Framework:** Next.js 15 (App Router) + React 19 + TypeScript estricto
- **UI:** Tailwind CSS v4 + shadcn/ui + Lucide Icons + Framer Motion, con modo claro/oscuro (`next-themes`)
- **Base de datos:** PostgreSQL + Prisma ORM
- **Auth:** Auth.js (NextAuth v5) — credenciales (email/contraseña) + Google, con roles `USER` / `LISTER` / `ADMIN`
- **Pagos:** Lemon Squeezy (checkout + webhooks, pago único y suscripción)
- **Subida de imágenes:** UploadThing
- **Emails:** Resend + React Email
- **SEO:** Metadata API, OpenGraph dinámico (`next/og`), `sitemap.xml` y `robots.txt` automáticos
- **Gráficas:** Recharts (analítica de clics por listado)
- **Tests:** Vitest (esquemas de validación, slug, rate limiter, env)
- **i18n:** next-intl — inglés (predeterminado) y español, con selector en el navbar

### Funcionalidades destacadas

- Búsqueda con autocompletado en tiempo real y filtros sincronizados por URL
- Galería con lightbox animado en la ficha de cada listado
- **Favoritos/bookmarks híbridos**: anónimos se guardan en `localStorage`; al iniciar sesión se fusionan automáticamente con la base de datos. Vista dedicada en `/dashboard/bookmarks`
- **Listados destacados** (`isFeatured`): borde e insignia visual distintiva, orden prioritario en el directorio y la home, toggle de 1 clic para el admin en `/admin/listings`
- Flujo de **reclamación de listados** (`Claim Listing`): un usuario solicita la propiedad de un listado importado/creado por otra cuenta y un admin la aprueba o rechaza desde `/admin/claims`
- Moderación de **listados y reseñas** desde `/admin` (aprobar/rechazar)
- Analítica por listado (vistas, clics por día, favoritos) en `/listing/[id]/analytics`
- Checkout y suscripciones de Lemon Squeezy con webhook firmado (HMAC) + enlace al **Customer Portal** desde `/dashboard` para que el usuario gestione su facturación
- **Exportación a CSV** de usuarios y listados desde `/admin`
- Rate limiting en los endpoints públicos (`/api/search`, tracking de clics)
- Datos estructurados **JSON-LD** (`SoftwareApplication` + `AggregateRating`) en cada ficha de listado, para conseguir estrellitas de valoración en los resultados de Google
- Validación de variables de entorno con Zod (`lib/env.ts`) — si falta o está mal formada una variable requerida, la app falla al arrancar con un mensaje claro en consola en vez de romperse en silencio más adelante

### Idiomas

La UI está completamente traducida a inglés (por defecto) y español. El
selector de idioma (icono de globo en el navbar) guarda la preferencia en una
cookie — no cambia la URL. Los mensajes de validación de Zod (`lib/validations.ts`)
que se lanzan dentro de las Server Actions (`lib/actions.ts`) y los toasts de
error del servidor quedan en inglés en ambos idiomas — limitación conocida:
Zod no tiene acceso al locale de next-intl dentro de una Server Action sin
pasarlo explícitamente en cada llamada (`z.string().min(1, {message: t(...)})`
requeriría resolver `t` en cada action antes de validar). Los nombres de
categorías del seed también están en español por defecto.

## 1. Requisitos

- Node.js 20+
- Una base de datos PostgreSQL (local, [Supabase](https://supabase.com), [Neon](https://neon.tech) o [Railway](https://railway.app))
- Cuentas (gratuitas para empezar) en [Lemon Squeezy](https://lemonsqueezy.com), [Resend](https://resend.com) y [UploadThing](https://uploadthing.com)

## 2. Instalación rápida (recomendado)

```bash
npm install
npm run setup
```

`npm run setup` crea `.env.local` a partir de `.env.example` (si no existe),
sincroniza el schema de Prisma y siembra la base de datos con datos de
ejemplo, en un solo paso. Antes de que termine con éxito tendrás que editar
`.env.local` con al menos `DATABASE_URL` y `AUTH_SECRET` (ver sección 4) y
volver a correr `npm run setup`.

### Instalación manual (paso a paso)

```bash
npm install
cp .env.example .env.local
```

Rellena `.env.local` con tus credenciales (ver sección 4), luego:

```bash
# Sincroniza el schema de prisma/schema.prisma con tu base de datos
npm run db:push

# Genera 20 categorías, 50 listados de ejemplo y usuarios demo
npm run db:seed
```

El seed crea dos cuentas para probar la plantilla:

| Rol   | Email               | Contraseña |
| ----- | ------------------- | ---------- |
| Admin | admin@example.com   | admin1234  |
| User  | demo@example.com    | demo1234   |

Otros comandos útiles:

```bash
npm run db:studio   # explorador visual de la base de datos (Prisma Studio)
npm run db:migrate  # crea una migración versionada (recomendado para producción)
```

## 4. Variables de entorno

Copia `.env.example` a `.env.local` y completa cada bloque. `DATABASE_URL`,
`AUTH_SECRET` y `NEXT_PUBLIC_APP_URL` son obligatorias — si falta alguna o
tiene un formato inválido, `lib/env.ts` (validado con Zod) hace que la app
falle al arrancar con un mensaje claro en la consola en vez de romperse más
adelante, a mitad de una petición, de forma confusa. El resto de variables
(Google, Lemon Squeezy, Resend, UploadThing) son opcionales: sin ellas esas
integraciones simplemente no aparecen o devuelven un error controlado.

### App

- `NEXT_PUBLIC_APP_URL`: URL pública del sitio (usada en emails, OG images, sitemap).
- `NEXT_PUBLIC_DEMO_MODE`: opcional. Ponla en `"true"` solo en un despliegue de
  demostración pública — muestra un banner con las credenciales de acceso de
  prueba (`components/demo-banner.tsx`). Déjala vacía o sin definir en
  producción real.

### Base de datos

- `DATABASE_URL`: cadena de conexión Postgres, ej. `postgresql://user:password@host:5432/db`.

### Auth.js

- `AUTH_SECRET`: genera uno con `npx auth secret`.
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: opcional, desde [Google Cloud Console](https://console.cloud.google.com/apis/credentials) (tipo "Web application", redirect URI `{APP_URL}/api/auth/callback/google`).

### Lemon Squeezy (pagos)

1. Crea una tienda en [Lemon Squeezy](https://app.lemonsqueezy.com).
2. Crea dos productos/variantes: **Featured Listing** ($29/mes) y **Top Sponsor** ($99/mes), ambos como suscripción.
3. En **Settings → API**, genera una API key → `LEMONSQUEEZY_API_KEY`.
4. Copia el **Store ID** → `LEMONSQUEEZY_STORE_ID`.
5. En **Settings → Webhooks**, crea un webhook apuntando a `{APP_URL}/api/webhooks/lemonsqueezy`, marca los eventos `subscription_*` y `order_created`, y copia el **Signing secret** → `LEMONSQUEEZY_WEBHOOK_SECRET`.
6. Copia el **Variant ID** de cada plan → `LEMONSQUEEZY_VARIANT_FEATURED` y `LEMONSQUEEZY_VARIANT_SPONSOR`.

El webhook (`app/api/webhooks/lemonsqueezy/route.ts`) valida la firma HMAC y
actualiza `Subscription` y `Listing.plan` automáticamente cuando cambia el estado
de una suscripción.

### Resend (emails)

- `RESEND_API_KEY`: desde [resend.com/api-keys](https://resend.com/api-keys).
- `RESEND_FROM_EMAIL`: remitente verificado (o `onboarding@resend.dev` en desarrollo).

Los templates están en `components/emails/` (bienvenida, listado aprobado, listado rechazado).

### UploadThing (imágenes)

- `UPLOADTHING_TOKEN`: desde el dashboard de [uploadthing.com](https://uploadthing.com/dashboard) → tu app → API Keys.

### Cron (Vercel Cron)

- `CRON_SECRET`: cualquier cadena aleatoria. Protege `app/api/cron/expire-listings`,
  que Vercel llama diariamente (ver `vercel.json`) para bajar a plan `BASIC`
  los listados cuya suscripción expiró sin renovarse.

## 5. Desarrollo

```bash
npm run dev
```

### Tests

```bash
npm run test        # una pasada (Vitest)
npm run test:watch  # modo watch
```

Cubre las funciones puras que más importa no romper: los esquemas de Zod
(`lib/validations.ts`), el slug/format de texto y el rate limiter.

### Rate limiting

`/api/search` y `/api/listings/[id]/click` usan un limitador en memoria
(`lib/rate-limit.ts`) — suficiente para un servidor Node único. En Vercel u
otro entorno serverless multi-instancia, sustitúyelo por
[`@upstash/ratelimit`](https://github.com/upstash/ratelimit) + Upstash Redis
para que el límite se comparta entre instancias.

Abre [http://localhost:3000](http://localhost:3000).

## 6. Estructura del proyecto

```
app/
├── (auth)/             # /login, /register
├── (dashboard)/         # /dashboard, /listing/new, /listing/[id]/edit (protegido)
├── (admin)/             # /admin, /admin/listings, /admin/users, /admin/payments (rol ADMIN)
├── api/                 # webhooks, cron, uploadthing, búsqueda, tracking de clics
├── directory/            # listado público + ficha [slug]
├── category/[categorySlug]/
├── pricing/
├── sitemap.ts / robots.ts
└── page.tsx              # landing

components/
├── ui/                  # shadcn/ui
├── directory/            # buscador, filtros, tarjetas, reseñas
├── forms/                # formulario multi-step de listados
├── admin/ dashboard/      # moderación y gestión de listados
└── layout/                # navbar, footer

lib/
├── prisma.ts, data.ts, actions.ts   # cliente Prisma, queries, server actions
├── auth.ts / auth.config.ts          # NextAuth v5
├── lemonsqueezy.ts, resend.ts, uploadthing.ts
└── validations.ts                     # esquemas Zod

prisma/
├── schema.prisma
└── seed.ts
```

## 7. Roles y permisos

- **USER**: puede publicar y gestionar sus propios listados, dejar reseñas y favoritos.
- **LISTER**: mismo alcance que `USER` (pensado para diferenciarlo en planes futuros).
- **ADMIN**: accede a `/admin` — modera listados, reseñas y solicitudes de reclamación (aprobar/rechazar), gestiona usuarios y ve pagos.

El primer usuario admin se crea vía `npm run db:seed`, o subiendo el rol de un
usuario existente directamente en la base de datos (`role = 'ADMIN'`).

## 8. Despliegue (Vercel)

1. Crea una base de datos Postgres gestionada — [Neon](https://neon.tech),
   [Supabase](https://supabase.com) o [Vercel Postgres](https://vercel.com/storage/postgres)
   tienen plan gratuito y funcionan sin cambios en `prisma/schema.prisma`.
2. Sube el repo a GitHub y conéctalo en [vercel.com/new](https://vercel.com/new)
   (framework preset "Next.js", se detecta solo).
3. Añade todas las variables de `.env.example` en **Project Settings →
   Environment Variables** (mínimo: `DATABASE_URL`, `AUTH_SECRET`,
   `NEXT_PUBLIC_APP_URL` con la URL final de Vercel).
4. Sincroniza el schema contra la base de producción **antes o durante el
   primer deploy**, apuntando `DATABASE_URL` a esa misma base de datos:
   ```bash
   DATABASE_URL="postgresql://..." npx prisma db push
   DATABASE_URL="postgresql://..." npx prisma db seed
   ```
   (`postinstall` ya corre `prisma generate` en cada `npm install`, así que
   Vercel genera el cliente de Prisma automáticamente en cada build — no hace
   falta ningún paso extra para eso.)
5. Actualiza la URL del webhook de Lemon Squeezy a tu dominio de producción
   (`Settings → Webhooks` en Lemon Squeezy → `https://tu-dominio.vercel.app/api/webhooks/lemonsqueezy`).
6. El cron de `vercel.json` se activa automáticamente en Vercel (plan Pro para
   más de un cron/día en el plan Hobby).

### Desplegar una demo pública

Para publicar una instancia de demostración (por ejemplo, para enseñarla en la
ficha del marketplace) sobre el mismo despliegue de Vercel:

1. Sigue los pasos 1-6 de arriba con una base de datos dedicada a la demo.
2. Siembra también los listados de muestra con copy real (usados en las
   capturas de marketing):
   ```bash
   DATABASE_URL="postgresql://..." npx tsx scripts/seed-showcase.ts
   ```
3. Añade la variable de entorno `NEXT_PUBLIC_DEMO_MODE=true` en Vercel y
   vuelve a desplegar. Aparecerá un banner superior con las credenciales de
   acceso (`admin@example.com` / `admin1234` y `demo@example.com` /
   `demo1234`) para que cualquiera pueda probar la plantilla sin registrarse.
4. Opcional: desactiva el registro de cuentas nuevas o pon el cron de
   `expire-listings` en modo lectura si no quieres que la demo pública
   modifique datos de forma permanente entre sesiones.

## 9. Licencia

Ver [LICENSE.md](./LICENSE.md) para el alcance exacto de la licencia de uso
(un producto final por licencia, sin reventa del código fuente).
