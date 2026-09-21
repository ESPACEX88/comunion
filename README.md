# Comunión

App cristiana para leer la Biblia **en dúo**: racha personal, racha compartida, check-in espiritual, oración mutua, versículos del corazón y una pregunta diaria de a dos. Un día cuenta **solo cuando se termina la lectura de ese día**, no con un visto suelto.

MVP local (iOS + Android con Expo). Los datos viven en el teléfono. La UI está en español latinoamericano, con vos (estilo es-GT). El tono es de pareja de lectura íntima —vos y una amiga especial (Ana, en el mock)— no de un grupo grande de iglesia.

## Cómo correrla

Hace falta Node 18 o más reciente.

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
```

No hay claves de API ni `.env` secretos. No hace falta cuenta de Expo para el mock local.

## Mapa de pantallas

| Ruta | Qué es |
| --- | --- |
| `/onboarding` | Primer arranque: nombre → crear o unirse a un grupo → elegir plan |
| `/(tabs)` **Hoy** | Racha (con gracia si hace falta), plan de a dos, lectura, check-in, pregunta diaria, atajo a Nosotros |
| `/lectura` | Pasaje del día; al completar se abre el sheet de Fase 1 y, si el plan es de a dos, la pregunta del día |
| `/(tabs)` **Grupo** | **Nosotros** (vos y Ana): check-ins, pregunta de a dos, oración mutua, mural; la mesa queda abajo |
| `/(tabs)` **Planes** | Plan activo (marcado **de a dos** cuando aplica), plan personal |
| `/(tabs)` **Yo** | Perfil, historial (leído / gracia / hueco), demo de día saltado, borrar datos |

Flujo fresco: instalar → onboarding de tres pasos → pestañas. Completar la lectura de hoy suma la racha personal, abre el check-in y la pregunta de a dos, y si Ana, Mateo, Lucía y vos ya terminaron, también suma la racha compartida.

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

## Mock de ahora vs backend después

| Ahora | Después (Supabase u otro) |
| --- | --- |
| Perfil, onboarding, rachas y hilo en AsyncStorage | Auth + tablas `profiles`, `groups`, `memberships`, `reading_logs`, `messages` |
| Amigos fijos: Ana, Mateo, Lucía | Miembros reales e invitaciones |
| Código de invitación copiable, sin servidor | Código único, join real |
| Notificaciones: solo un interruptor | Push con permiso del sistema |
| Check-ins, oraciones y mural en el mismo JSON | Tablas `check_ins`, `prayer_requests`, `heart_verses` |
| Preguntas de a dos y gracia en el mismo JSON | Tablas `duo_answers`, `grace_days` |
| Ana como amiga especial mock | Vínculo real de dos personas |

La frontera está en `lib/data-source.ts`: mismas firmas (`load` / `save` / `clear`). Las pantallas no hablan con AsyncStorage directo. Cuando exista backend, se cambia la implementación ahí.

## Carpetas

```
app/           rutas de Expo Router (tabs, onboarding, lectura)
components/    UI, racha, grupo, lectura, dúo
features/      estado de la app, planes, dúo (ánimos y semillas), miembros mock
lib/           tipos, fechas, rachas, persistencia, data-source
theme/         color, tipo, espacio
```

Tipografía: **Fraunces** (titulares y UI) y **Literata** (pasajes). Paleta: crema, carbón y acento ámbar, con oliva para el grupo.

## Notas

- Expo SDK 57, React Native 0.86, TypeScript, Expo Router.
- El filesystem de un host efímero (p. ej. Render) no aplica a esta app móvil; aquí la persistencia es AsyncStorage en el dispositivo.
- Los extractos bíblicos son de demostración, de dominio público / parafraseados para el MVP. Más adelante conviene enlazar una traducción con licencia clara.
