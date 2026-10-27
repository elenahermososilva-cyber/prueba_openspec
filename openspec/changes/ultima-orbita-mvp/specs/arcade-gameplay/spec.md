# Spec Delta

## Purpose

Define el comportamiento jugable del MVP de Última órbita para que el jugador pueda pilotar una nave, combatir enemigos y avanzar por partidas de oleadas progresivamente más difíciles.

## ADDED Requirements

### Requirement: Nave controlable
El juego MUST permitir al jugador mover la nave horizontalmente por la zona inferior de la pantalla, sin que pueda salir de los límites visibles del área de juego.

#### Scenario: Movimiento horizontal dentro de los límites
- **WHEN** el jugador mantiene pulsada una tecla de movimiento hacia la izquierda o la derecha
- **THEN** la nave se desplaza horizontalmente en esa dirección y permanece dentro del área de juego

### Requirement: Disparo y destrucción de enemigos
El juego MUST permitir disparar proyectiles láser hacia la parte superior; al impactar a un enemigo, el proyectil y el enemigo desaparecen y la puntuación aumenta exactamente 10 puntos.

#### Scenario: Destruir enemigo con un láser
- **WHEN** un proyectil láser colisiona con un enemigo
- **THEN** ambos desaparecen y la puntuación aumenta en 10 puntos

### Requirement: Oleadas de enemigos progresivas
El juego MUST presentar enemigos en grupos finitos que aparecen progresivamente desde la parte superior o los laterales y MUST iniciar una nueva oleada al resolver todos los enemigos de la oleada actual mientras la partida siga activa; cada nueva oleada contiene más enemigos y una velocidad de descenso mayor que la anterior. Cada enemigo MUST almacenar su posición, velocidad, vida y patrón de movimiento.

#### Scenario: Avanzar a una oleada más difícil
- **WHEN** todos los enemigos de una oleada han sido eliminados o han colisionado con la nave y quedan vidas
- **THEN** comienza otra oleada con más enemigos y mayor velocidad de descenso que la oleada anterior

#### Scenario: Enemigos con patrones básicos
- **WHEN** se actualiza un enemigo de la oleada
- **THEN** el enemigo desciende o persigue horizontalmente la posición de la nave mientras continúa descendiendo

#### Scenario: Aparición progresiva desde varios bordes
- **WHEN** comienza una oleada
- **THEN** el generador introduce sus enemigos en intervalos desde la parte superior o desde los laterales, manteniendo el movimiento dentro del área visible

### Requirement: Pérdida de vidas por colisión
El juego MUST restar exactamente una vida cuando un enemigo colisiona con la nave y MUST retirar de la partida al enemigo que causó esa colisión.

#### Scenario: Enemigo impacta la nave
- **WHEN** un enemigo colisiona con la nave del jugador
- **THEN** las vidas restantes disminuyen en uno y ese enemigo desaparece

### Requirement: Estado y fin de partida
El juego MUST ofrecer una pantalla de inicio, mostrar la puntuación y las vidas restantes durante la partida y detenerla cuando las vidas llegan a cero, mostrando Game Over y la puntuación final.

#### Scenario: La partida termina al perder todas las vidas
- **WHEN** las vidas restantes llegan a cero
- **THEN** el juego deja de avanzar y muestra Game Over junto con la puntuación total obtenida
