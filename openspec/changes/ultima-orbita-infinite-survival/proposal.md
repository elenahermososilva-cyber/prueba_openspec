# Proposal

## Why

El MVP actual tiene oleadas finitas, enemigos visualmente iguales y no permite responder al fuego enemigo ni progresar durante partidas largas. Este cambio convierte *Última órbita* en un arcade de supervivencia infinita, con una presión que crece hasta volver estresantes las partidas largas, más variedad táctica, feedback legible y mejoras para el jugador.

## What Changes

- Sustituir las naves enemigas dibujadas por tres tipos con los SVG existentes, velocidades, resistencia y patrones de disparo distintos; reutilizar los SVG disponibles para proyectiles, jugador, boss y orbes.
- Añadir proyectiles enemigos y un ataque de rayo para el boss, colisiones entre disparos aliados y enemigos, y feedback visual al recibir daño o destruir enemigos.
- Reemplazar las oleadas finitas por aparición continua y progresión de amenaza por tiempo, con selección inicial Fácil/Normal/Difícil, barra de amenaza y sin límite de niveles; aumentar la densidad de enemigos y la presión ofensiva hasta crear runs largas muy exigentes.
- Permitir picos aleatorios casi imposibles sin generar impactos inevitables ni quitar toda oportunidad de reacción.
- Añadir orbes periódicos de escudo, vida, disparo adicional, velocidad temporal, perforación y abanico, con progresión del jugador por hitos.
- Introducir un boss acompañado por enemigos cada 60 segundos de partida; podrá coincidir con bosses anteriores que sigan vivos.
- Mantener el resto de la experiencia en el navegador, sin dependencias externas de ejecución.

## Capabilities

### New Capabilities

- `arcade-gameplay`: Combate de supervivencia, enemigos y proyectiles, dificultad infinita, potenciadores, bosses y feedback de partida.

### Modified Capabilities

Ninguna. No hay capacidades publicadas todavía en `openspec/specs`; el nuevo contrato consolidará el comportamiento del juego como una capacidad completa.

## Impact

- Afecta a la lógica de juego, la interfaz de inicio y HUD, los estilos y el renderizado Canvas en `game.js`, `index.html` y `styles.css`.
- Integra los recursos SVG ya presentes en `assets/`; algunos poderes nuevos (velocidad, perforación y abanico) no tienen icono dedicado, por lo que su presentación deberá resolverse con recursos existentes o feedback visual sencillo.
- Amplía el contrato funcional del MVP para el bucle de partida, el balance temporal y el comportamiento de enemigos, proyectiles, orbes y bosses.
- No requiere servicios, APIs ni dependencias de ejecución externas.
