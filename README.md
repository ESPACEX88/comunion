# Comunión

App cristiana para leer la Biblia **en dúo**: racha personal, racha compartida, check-in espiritual, oración mutua, versículos del corazón y una pregunta diaria de a dos. Un día cuenta **solo cuando se termina la lectura de ese día**, no con un visto suelto.

MVP con Expo (iOS + Android). La UI está en español latinoamericano, con vos (estilo es-GT). El tono es de pareja de lectura íntima. Con sesión de Supabase, el dúo se sincroniza de verdad. Sin cuenta, queda un mock local en el teléfono.

## Cómo correrla

Hace falta Node 18 o más reciente.

1. Copiá `.env.example` a `.env`.
2. En el dashboard de Supabase → **Settings → API**, pegá:
   - `EXPO_PUBLIC_SUPABASE_URL` (p. ej. `https://zpjrfxbrfdapoufdvrqr.supabase.co`)
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY` (la **anon** / publishable). **Nunca** la `service_role`.
3. Reiniciá Expo para que tome las variables.

```bash
npm install
npx expo start
```

Después:

- Escaneá el QR con **Expo Go** (iOS / Android)
- `a` para Android, `i` para iOS (simulador)
- `w` para web (útil para revisar pantallas)

Otros scripts:

```bash
npm run typecheck
npm run android
npm run ios
npm run web
npm run update:preview
```

El `.env` está en `.gitignore`. El repo solo trae placeholders.

### Confirmar email

Por defecto Auth puede pedir confirmación de correo. Mientras prueban, en **Authentication → Providers → Email** desactivá **Confirm email**, o confirmá el usuario a mano en **Authentication → Users**. Si no, `signUp` crea la cuenta pero no deja sesión hasta confirmar.

## Abrir sin la PC (EAS Update + Expo Go)

Esto publica un **update hospedado** (plan gratis de Expo) y se abre en **Expo Go**. José no tiene que dejar Metro corriendo. **No es** una app nativa con ícono propio en el home: eso sigue pidiendo cuenta de Apple Developer + un build de EAS/Xcode.

El repo **no** trae `extra.eas.projectId` ni `updates.url` inventados. Esos IDs los escribe Expo la primera vez que José corre `eas init` / `eas update:configure`. Después hay que commitear lo que esos comandos agreguen a `app.json` (el `projectId` no es secreto).

### Una sola vez (cuenta + proyecto)

1. Creá una cuenta gratis en [expo.dev/signup](https://expo.dev/signup).
2. En la carpeta del repo:

```bash
npm install
npm i -g eas-cli
# si no querés instalar global: usá npx eas-cli@latest en vez de eas
eas login
eas whoami
```

3. Ligá el repo al proyecto de Expo (slug `comunion`) y dejá lista la config de updates:

```bash
eas init
eas update:configure
```

`eas init` crea el proyecto en tu org si todavía no existe. `eas update:configure` escribe en `app.json`:

- `extra.eas.projectId` (UUID real de expo.dev)
- `updates.url` → `https://u.expo.dev/<ese-projectId>`
- `runtimeVersion` (este repo ya trae `{ "policy": "appVersion" }`; hoy eso vale **`0.1.0`**, el `version` de `app.json`)

Los channels `preview` y `production` ya están en `eas.json`. No hace falta un build nativo para abrir el update en Expo Go.

4. Embebí las claves públicas de Supabase en el update. En SDK 55+ `eas update` **exige** `--environment`. Las `EXPO_PUBLIC_*` se hornean en el JS al publicar; si no están en el environment de EAS, la app abre sin nube.

En [expo.dev](https://expo.dev) → el proyecto Comunión → **Environment variables**, environment **preview**, o por CLI (valores del `.env` local; **nunca** la `service_role`):

```bash
eas env:set --name EXPO_PUBLIC_SUPABASE_URL --value https://zpjrfxbrfdapoufdvrqr.supabase.co --environment preview --visibility plaintext
eas env:set --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value PEGA_LA_ANON_KEY --environment preview --visibility sensitive
```

### Publicar (cada vez que quieras compartir)

```bash
npm run update:preview
```

Equivale a:

```bash
eas update --channel preview --message "Comunión preview" --environment preview
```

Cambio el mensaje si hace falta: `eas update --channel preview --message "arreglo recordatorios" --environment preview`.

### Cómo abrir (José y Jazmín)

1. En [expo.dev](https://expo.dev) → proyecto → **Updates** → el update de `preview` → **Open in Expo Go** (o el QR).
2. O armá el QR (el `projectId` sale de `app.json` → `extra.eas.projectId` después del `eas init`):

```
https://qr.expo.dev/eas-update?slug=exp&projectId=PEGA-EL-PROJECT-ID&runtimeVersion=0.1.0&channel=preview
```

`slug=exp` apunta a Expo Go (no a un development build). Si cambiás `version` en `app.json`, cambiá `runtimeVersion` en esa URL. Para el link en texto, agregá `&format=url`.

**Jazmín:** mismo QR o link. Invitala a la org/proyecto en expo.dev, o compartile el update. En **iPhone** Expo Go casi siempre pide que esté **logueada** (misma cuenta o cuenta con acceso al proyecto). Android suele ser más permisivo.

### Qué es / qué no es

| Sí (este flujo) | No (todavía) |
| --- | --- |
| Expo Go + update hospedado, gratis | App con ícono propio en el home |
| José publica con 1 comando después del setup | Dejar la PC con Metro |
| Auth / dúo / recordatorios locales via el JS publicado | Push remoto / EAS Build nativo |

Build nativo (`eas build`) y App Store quedan para cuando haya cuenta de Apple Developer. Este PR no publica nada: hace falta el login de José.

### Si eas update falla en Windows

En Windows `eas update` puede caerse (Hermes / `hermesc`, o la máquina se queda sin memoria al exportar). **Plan B:** publicar desde GitHub Actions en Linux. El workflow se llama **`eas-update-preview`** (solo `workflow_dispatch`: no corre en cada push).

1. Si `eas init` / `eas update:configure` ya escribieron `extra.eas.projectId` y `updates.url` **solo en tu PC**, **commitealos y pusheá a `main`** antes de disparar el Action. Sin esos campos en el repo el job no sabe el `projectId` y falla a propósito.
2. Creá un access token en [expo.dev/settings/access-tokens](https://expo.dev/settings/access-tokens) y un secret del repo **`EXPO_TOKEN`**: GitHub → Settings → Secrets and variables → Actions → New repository secret.
3. GitHub → **Actions** → **eas-update-preview** → **Run workflow** (branch `main`).

Las `EXPO_PUBLIC_*` las carga `--environment preview` desde EAS (environment `preview`). **No** van en el workflow ni en el repo. El job corre `CI=1 eas update --channel preview --non-interactive` en `ubuntu-latest`.

## Mapa de pantallas

| Ruta | Qué es |
| --- | --- |
| `/onboarding` | Cuenta (registro / login). Opcional: seguir sin cuenta en este teléfono |
| `/onboarding/grupo` | Crear dúo (`create_duo`) o unirse con código (`join_duo`) |
| `/onboarding/plan` | Confirmar «Salmos de a dos» |
| `/(tabs)` **Hoy** | Racha, plan de a dos, lectura, check-in, pregunta diaria |
| `/lectura` | Pasaje del día; al completar, check-in y pregunta |
| `/(tabs)` **Grupo** | **Nosotros**: check-ins, pregunta, oración, mural, código de invitación |
| `/(tabs)` **Planes** | Plan activo de a dos (sembrado en Supabase) |
| `/(tabs)` **Yo** | Perfil, recordatorios, historial, cerrar sesión |
| `/recordatorios` | Avisos locales: Tu momento (mañana) y Juntos (si hay dúo) |

Flujo con nube: instalar → `.env` → registro de José → crear dúo → compartir código → Ana se registra y se une → check-in / oración / versículo / día del plan se ven en las dos cuentas (RLS: cada una solo ve su dúo).

## Fase 1 (dúo)

Tres piezas, todas locales, tejidas en el flujo que ya existía (no hay pestañas nuevas):

1. **Check-in espiritual** — Después de marcar el día (sheet en Lectura) o desde Hoy si el día ya está completo. Ánimo obligatorio (paz, lucha, gratitud, duda, esperanza) y una línea opcional (máx. 140). Se ve en Hoy y en Nosotros. Ana deja un check-in mock cada día.
2. **Oración mutua** — En Grupo / Nosotros. Pedidos «Ora por mí por…». Ana trae 1–2 pedidos de ejemplo. «Ya oré por ti» marca que oraste y muestra una confirmación tibia. Se persiste.
3. **Versículo del corazón** — Desde el sheet post-lectura (nota personal tipo «esto me acordó de vos») o el mural en Nosotros. No es el chat genérico: cada pieza tiene referencia, texto y nota. Ana deja uno sembrado.

El payload de AsyncStorage pasó a `version: 2`. Una instalación v1 se migra y, si no había dúo, se siembran los pedidos y el mural de Ana (`lib/storage.ts`).

## Fase 2 (plan de a dos + racha con gracia)

Dos piezas, también locales, sin pestañas nuevas:

1. **Plan de a dos** — «Salmos de a dos» (7 días) es el plan compartido por defecto. Cada día tiene el pasaje **y** una pregunta corta en español para las dos (no es un quiz: algo suave, espiritual). Se desbloquea al completar la lectura de hoy (después del check-in de Fase 1). José y Ana pueden dejar una respuesta corta (máx. 180). Las dos se ven en Hoy y en Nosotros. En Planes y Hoy el plan activo se marca **de a dos**.
2. **Racha con gracia** — **1 día de gracia por semana calendario (lunes–domingo)**. El día de gracia **puentea** un hueco: la racha no se rompe, pero ese día **no suma** al número. Sigue haciendo falta completar la lectura de un día normal para que cuente. Si ya usaste la gracia de la semana, se ofrece **«Retomar juntos»**: hoy vale 1, sin culpa y sin inflar el pasado. La UI no usa lenguaje de vergüenza. En **Yo** hay un atajo de demo («Probar un día saltado») porque un día real no se puede atrasar el calendario.

El payload pasó a `version: 3` (`duoAnswers`, `graceDates`). v1 y v2 migran en `lib/storage.ts`.

## Fase 3 (Supabase: auth + sync del dúo)

El esquema ya está en el proyecto `zpjrfxbrfdapoufdvrqr` (sa-east-1). La app no lo recrea.

- Cliente en `lib/supabase.ts` con `EXPO_PUBLIC_*`. Sesión: AsyncStorage (web) o valor cifrado + clave en SecureStore (nativo).
- RPCs `create_duo` / `join_duo` (authenticated). Al crear o unirse se siembra «Salmos de a dos» en `plans` / `plan_days` si no hay plan activo.
- Check-ins, oraciones, versículos del corazón, completados y respuestas van a las tablas reales, filtradas por el dúo (RLS).
- La racha con 1 gracia/semana sigue en el cliente; `plan_completions.used_grace` persiste el puente.
- AsyncStorage queda como caché (`version: 4`). Con sesión, Supabase es la fuente de verdad.
- Sin cuenta, el mock de las fases 1–2 sigue disponible («Seguir sin cuenta»).

Si al crear el dúo aparece `permission denied for function is_duo_member`, en el SQL Editor del proyecto:

```sql
grant execute on function public.is_duo_member(uuid) to authenticated;
```

La app, al entrar al dúo, siembra «Salmos de a dos» si todavía no hay plan activo (también lo reintenta al refrescar).

**Cómo probar entre dos personas**

1. José se registra (email + contraseña + nombre) → Crear dúo → copia el código.
2. Ana se registra en otro aparato (o perfil web) → Unirme con el código.
3. José completa la lectura, deja check-in, una respuesta y un pedido de oración.
4. Ana abre Nosotros: ve el check-in, la pregunta, el pedido; puede marcar «Ya oré por ti» y completar su día.

## Recordatorios (locales, Expo Go)

Los avisos de este MVP son **notificaciones locales programadas** (`expo-notifications`), no un servidor de push.

- **Tu momento** (7:00 por defecto): lectura o diario.
- **Juntos** (20:00): solo si hay dúo. Oración o el plan de a dos.
- Prefs en `reminder_prefs` (RLS: solo dueño). Sin sesión, quedan en AsyncStorage.
- Al cambiar hora o toggle se reprograman. Al cerrar sesión se cancelan las de este teléfono.
- `expo_push_token` se guarda si Expo Go lo entrega. **Push remoto entre dispositivos / EAS viene después.**

En iPhone: Yo → Recordatorios → Permitir. En simulador/Expo Go el permiso + el horario diario son el camino estable. «Probar aviso ahora» dispara uno a los 2 segundos.

## Lógica de rachas (cliente)

Todo está en `lib/streaks.ts` y se guarda con AsyncStorage (`lib/storage.ts`).

**Racha personal**

- Un día entra a la racha únicamente si esa fecha está en `userCompletedDates`.
- Eso ocurre cuando la persona toca **«Marcá el día como leído»** en Lectura, después de abrir el pasaje.
- No hay check suelto en Hoy.
- La racha es la cadena consecutiva que termina hoy (si ya leíste) o ayer (si hoy sigue pendiente). Los días de gracia se saltan sin sumar.

**Gracia**

- Máximo **un** día de `graceDates` por semana lunes–domingo (`GRACE_PER_WEEK`).
- Ese día no se marca como leído. Solo evita que el hueco corte la cadena.
- Si el hueco cae cuando la gracia de la semana ya se usó, no hay segundo puente: «Retomar juntos».

**Racha de grupo**

- El grupo suma un día **solo si todos los miembros actuales** tienen esa fecha completada.
- Mientras tanto se muestra «X de Y leyeron hoy».
- En el mock, Ana, Mateo y Lucía **no saltan días**: leen desde tu primer día (o los últimos cuatro) hasta hoy. Faltás vos para el día de hoy. La gracia del usuario también puentea el dúo/grupo, sin sumar el día.

Los datos sobreviven un reinicio de la app. En **Yo** se pueden borrar para volver al onboarding.

## Planes de ejemplo

1. **Salmos de a dos** (7 días) — plan dúo por defecto. Referencias reales, extractos cortos en español y una pregunta de conversación cada día (demo, no una edición oficial).
2. **El evangelio empieza** (3 días en Juan) — plan personal de muestra. También trae preguntas si se usa como plan de la mesa.

El día del plan se elige por calendario desde la fecha en que se empezó (`planDayForDate` en `features/plans/content.ts`).

## Datos: local vs Supabase

| Sin sesión (este teléfono) | Con sesión |
| --- | --- |
| AsyncStorage mock (Ana, Mateo, Lucía) | Auth + `profiles`, `duos`, `duo_members` |
| Código de ejemplo `MESA-7` | `create_duo` / `join_duo`, código real de 6 caracteres |
| Check-ins, oraciones, mural, respuestas en JSON | Tablas `check_ins`, `prayers`, `heart_verses`, `plan_answers` |
| Completados y gracia en JSON | `plan_completions` (`used_grace`) |
| Plan embebido en la app | Fila por dúo en `plans` + `plan_days`; el texto del pasaje sigue en la app |

La caché local está en `lib/storage.ts`. Las mutaciones del dúo viven en `lib/supabase-api.ts`.

## Carpetas

```
app/           rutas de Expo Router (tabs, onboarding, lectura)
components/    UI, racha, grupo, lectura, dúo
features/      estado, auth, planes, dúo, miembros mock
lib/           supabase, tipos, fechas, rachas, persistencia
theme/         color, tipo, espacio
```

Tipografía: **Fraunces** (titulares y UI) y **Literata** (pasajes). Paleta: crema, carbón y acento ámbar, con oliva para el grupo.

## Notas

- Expo SDK 57, React Native 0.86, TypeScript, Expo Router. `expo-updates` ~57 está instalado; el `projectId` de EAS lo escribe José con `eas init`.
- El filesystem de un host efímero (p. ej. Render) no aplica a esta app móvil; aquí la persistencia es AsyncStorage en el dispositivo.
- Los extractos bíblicos son de demostración, de dominio público / parafraseados para el MVP. Más adelante conviene enlazar una traducción con licencia clara.
