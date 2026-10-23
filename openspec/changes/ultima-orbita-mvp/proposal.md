# Proposal

## Why

El proyecto necesita convertir el PRD de *Última órbita* en una experiencia arcade jugable y verificable. Este cambio establece el MVP de navegador para que el jugador pueda controlar una nave, sobrevivir a enemigos y avanzar por oleadas cada vez más difíciles.

## What Changes

- Crear el juego 2D para navegador usando HTML5 Canvas, con pantalla de inicio, partida y pantalla de Game Over.
- Implementar movimiento horizontal de la nave, disparo láser, enemigos, colisiones, vidas y puntuación.
- Organizar enemigos en oleadas finitas; al completar una oleada, la siguiente incluirá más enemigos y aumentará su velocidad de descenso.
- Mantener el alcance del MVP acotado: sin multijugador, narrativa extensa, tienda de mejoras ni audio avanzado.

## Capabilities

### New Capabilities

- `arcade-gameplay`: Comportamiento jugable principal, controles, combate, oleadas progresivas, puntuación y ciclo de partida.

### Modified Capabilities

Ninguna.

## Impact

- Añade la aplicación de juego para navegador y sus recursos de interfaz y lógica en HTML5 Canvas.
- No hay código fuente, pruebas ni dependencias de juego existentes en el repositorio; la implementación deberá establecer su estructura inicial.
- No se proponen servicios externos ni cambios a APIs existentes.
