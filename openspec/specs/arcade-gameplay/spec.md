# arcade-gameplay Specification

## Purpose

Define el comportamiento jugable del MVP de Última órbita para que el jugador pueda pilotar una nave, combatir enemigos y avanzar por partidas de oleadas progresivamente más difíciles.

## Requirements

### Requirement: Nave controlable
El juego MUST permitir al jugador mover la nave horizontalmente por la zona inferior de la pantalla, sin que pueda salir de los límites visibles del área de juego.

#### Scenario: Movimiento horizontal dentro de los límites
- **WHEN** el jugador mantiene pulsada una tecla de movimiento hacia la izquierda o la derecha durante una partida
- **THEN** la nave se desplaza horizontalmente en esa dirección y permanece dentro del área de juego

#### Scenario: Mover y disparar durante la partida
- **WHEN** la partida está activa y el jugador usa las flechas o A/D y la barra espaciadora
- **THEN** la nave se mueve horizontalmente dentro del área de juego y dispara hacia arriba

### Requirement: Inicio y selección de dificultad
El juego MUST mostrar una pantalla inicial con las opciones Fácil, Normal y Difícil, y MUST iniciar una partida nueva con tres vidas cuando el jugador elige una opción y pulsa Enter. Los modos MUST compartir una curva de amenaza creciente por tiempo efectivo, con offsets iniciales de 0, 150 y 300 segundos, respectivamente.

#### Scenario: Iniciar con una dificultad elegida
- **WHEN** el jugador elige Fácil, Normal o Difícil y pulsa Enter
- **THEN** comienza una partida nueva con el modo seleccionado y tres vidas

#### Scenario: Seleccionar un modo de dificultad
- **WHEN** el jugador llega a la pantalla inicial
- **THEN** puede elegir Fácil, Normal o Difícil antes de iniciar la partida

#### Scenario: Igualar la presión al avanzar el tiempo
- **WHEN** una partida Fácil llega a cinco minutos de tiempo efectivo y una partida Difícil acaba de comenzar
- **THEN** ambas tienen el mismo nivel efectivo de amenaza y desde ese punto escalan con la misma curva

### Requirement: Disparo y destrucción de enemigos
El juego MUST permitir disparar proyectiles láser hacia la parte superior. Los impactos dañan a los enemigos y, cuando un enemigo es destruido, el proyectil desaparece y la puntuación aumenta exactamente 10 puntos.

#### Scenario: Dañar a un enemigo que sobrevive
- **WHEN** un proyectil del jugador impacta a un enemigo y no agota su vida
- **THEN** el enemigo recibe daño, el proyectil desaparece salvo que sea perforante y la puntuación no cambia

#### Scenario: Destruir un enemigo
- **WHEN** el daño recibido por un enemigo agota su vida
- **THEN** el enemigo se destruye, desaparece y la puntuación aumenta exactamente 10 puntos

### Requirement: Generación continua de enemigos y amenaza creciente
El juego MUST generar enemigos continuamente mientras la partida esté activa, sin límite de niveles. Cada nivel efectivo MUST aumentar la densidad de enemigos y al menos una presión de combate, como la velocidad de descenso o la presión de disparo. Los enemigos MUST desplazarse dentro del área visible, descendiendo o persiguiendo horizontalmente al jugador mientras descienden.

#### Scenario: Aumenta la amenaza con el tiempo
- **WHEN** transcurre un minuto de tiempo efectivo de amenaza
- **THEN** aumenta el nivel de amenaza, comienza una nueva fase de progreso y la siguiente fase presenta mayor densidad de enemigos y mayor velocidad de descenso o presión de disparo que la anterior

#### Scenario: La partida continúa entre niveles
- **WHEN** se completa una fase de la barra de amenaza
- **THEN** la barra reinicia su progreso para el siguiente nivel y la partida continúa generando enemigos

#### Scenario: La presión crece en partidas largas
- **WHEN** se comparan los niveles efectivos de amenaza 5, 10, 15 y 20
- **THEN** cada punto de control presenta más enemigos y mayor presión de combate que el anterior, y el nivel 20 produce una escena densamente poblada, con ataques solapados y una exigencia de supervivencia muy alta

#### Scenario: Un pico aleatorio mantiene oportunidad de reacción
- **WHEN** el generador elige una combinación aleatoria de enemigos o ataques en cualquier nivel de amenaza
- **THEN** puede crear un pico casi imposible, pero no genera un impacto inevitable al aparecer ni elimina toda oportunidad de reaccionar o esquivar

#### Scenario: Enemigos con patrones básicos
- **WHEN** se actualiza un enemigo
- **THEN** el enemigo desciende o persigue horizontalmente la posición de la nave mientras continúa descendiendo

#### Scenario: Aparición desde varios bordes
- **WHEN** aparecen enemigos durante la partida
- **THEN** pueden entrar en intervalos desde la parte superior o desde los laterales y mantienen su movimiento dentro del área visible

### Requirement: Barra de dificultad en el HUD
El juego MUST mostrar a la derecha del HUD una barra vertical de dificultad con un nivel efectivo creciente sin límite y una etiqueta de estado basada en el tiempo efectivo de amenaza.

#### Scenario: Mostrar los estados por tiempo efectivo
- **WHEN** cambia el tiempo efectivo de amenaza
- **THEN** la barra muestra Fácil antes de 2 minutos, Normal desde 2 y antes de 5 minutos, Difícil desde 5 y antes de 10 minutos, Muy difícil desde 10 y antes de 15 minutos, Imposible desde 15 y antes de 20 minutos, y «¡JA, JA, JA…!» desde los 20 minutos

#### Scenario: Mostrar progreso y nivel de amenaza
- **WHEN** avanza el tiempo dentro de un nivel de amenaza de un minuto
- **THEN** el relleno de la barra muestra el progreso hasta el siguiente nivel, aumenta el número de nivel al completar el minuto y conserva el estado más alto mientras el nivel numérico continúa creciendo

#### Scenario: Reflejar el modo elegido y el tiempo jugado
- **WHEN** el jugador selecciona un modo y empieza la partida
- **THEN** la barra usa el offset temporal del modo para mostrar el estado efectivo, de modo que Fácil a los cinco minutos coincida con Difícil al inicio

### Requirement: Enemigos con identidades y armas distintas
El juego MUST presentar tres tipos visualmente diferenciados de enemigos, cada uno con posición, velocidad, resistencia, patrón de movimiento y patrón de disparo propios.

#### Scenario: Aparecen los tres tipos de enemigo
- **WHEN** progresa una partida
- **THEN** pueden aparecer el enemigo1 rápido con disparo recto hacia abajo, el enemigo2 de velocidad media con disparo diagonal y el enemigo3 lento y resistente con disparos rectos y diagonales

#### Scenario: Los enemigos disparan proyectiles peligrosos
- **WHEN** un enemigo dispara
- **THEN** sus proyectiles se desplazan hacia la zona inferior a menor velocidad que los disparos del jugador y pueden dañar al jugador al colisionar

#### Scenario: Los proyectiles diagonales siguen su trayectoria
- **WHEN** un enemigo dispara en diagonal
- **THEN** el SVG del proyectil se gira en la dirección de su trayectoria descendente

### Requirement: Defensa y colisión entre proyectiles
Los proyectiles del jugador MUST poder eliminar proyectiles enemigos sin dañar al enemigo emisor ni otorgar puntos por esa eliminación.

#### Scenario: Un disparo del jugador alcanza un disparo enemigo
- **WHEN** ambos proyectiles colisionan
- **THEN** ambos desaparecen y no cambian la puntuación ni la vida del enemigo emisor

#### Scenario: Un disparo del jugador alcanza un enemigo
- **WHEN** un proyectil del jugador colisiona con un enemigo
- **THEN** el enemigo recibe daño, el proyectil desaparece salvo que sea perforante y la puntuación solo se concede al destruir al enemigo

### Requirement: Pérdida de vidas y escudo por impacto
El juego MUST quitar exactamente una vida por cada impacto no bloqueado de un enemigo o proyectil enemigo, y MUST permitir que un escudo activo bloquee un impacto y se consuma sin reducir las vidas.

#### Scenario: Un impacto no bloqueado
- **WHEN** un enemigo o proyectil enemigo alcanza al jugador sin escudo
- **THEN** las vidas disminuyen exactamente en uno y, si un enemigo colisionó con la nave, ese enemigo desaparece

#### Scenario: El escudo bloquea un impacto
- **WHEN** un impacto alcanza al jugador mientras tiene un escudo activo
- **THEN** el escudo se consume y las vidas no disminuyen

### Requirement: Estado y fin de partida
El juego MUST ofrecer una pantalla de inicio, mostrar la puntuación y las vidas restantes durante la partida y detener la simulación cuando las vidas llegan a cero, mostrando Game Over y la puntuación final.

#### Scenario: Se agotan las vidas
- **WHEN** las vidas llegan a cero
- **THEN** la simulación se detiene y se muestra Game Over junto con la puntuación final

### Requirement: Orbes y progresión del jugador
El juego MUST intentar generar un orbe aleatorio cada 30 segundos de partida entre escudo, vida, disparo adicional, velocidad, perforación y abanico. Las mejoras MUST persistir o expirar según su tipo.

#### Scenario: Obtener un orbe de escudo
- **WHEN** el jugador recoge un escudo
- **THEN** el siguiente impacto que quitaría una vida consume el escudo y no reduce las vidas

#### Scenario: Identificar visualmente cada tipo de orbe
- **WHEN** aparece un orbe de cualquiera de los seis poderes
- **THEN** se muestra su icono SVG local correspondiente, sin sustituirlo por una letra genérica

#### Scenario: Obtener un orbe de vida
- **WHEN** el jugador recoge una vida con menos de tres vidas
- **THEN** recupera una vida, sin superar el máximo inicial de tres

#### Scenario: Obtener mejoras de arma
- **WHEN** el jugador recoge disparo adicional, perforación o abanico
- **THEN** el nivel correspondiente aumenta de forma persistente durante la partida y mejora el arma en hitos, sin un límite de niveles de mejora

#### Scenario: Obtener velocidad temporal
- **WHEN** el jugador recoge el orbe de velocidad
- **THEN** su velocidad de movimiento aumenta durante 15 segundos y después vuelve a su valor anterior

### Requirement: Jefes periódicos con escolta
El juego MUST introducir un jefe acompañado por enemigos cada 60 segundos de tiempo de partida. Un jefe nuevo MUST poder aparecer aunque otro siga activo. El jefe MUST disparar un rayo grueso hacia la posición del jugador con un aviso previo cuyo tiempo dependa de la amenaza efectiva.

#### Scenario: Aparece un jefe periódico
- **WHEN** la partida alcanza un nuevo intervalo de 60 segundos
- **THEN** aparece un jefe con una escolta de enemigos

#### Scenario: El jefe fija el punto de aviso
- **WHEN** el jefe va a disparar su rayo
- **THEN** el juego muestra un aviso claro hacia la posición del jugador al empezar la carga y mantiene fijo ese punto durante el tiempo de reacción ajustado al nivel efectivo de amenaza

#### Scenario: El láser recorre su trayectoria completa
- **WHEN** termina el aviso del jefe y dispara
- **THEN** el SVG del rayo avanza desde el jefe hasta el punto fijado por el aviso, aunque el jugador se mueva, dañando al jugador y destruyendo a los enemigos y jefes que atraviesa

#### Scenario: Aparece un jefe mientras otro sigue activo
- **WHEN** llega un intervalo de aparición y un jefe anterior no ha sido destruido
- **THEN** aparece también el nuevo jefe

### Requirement: Feedback visual de combate
El juego MUST comunicar visualmente cuando el jugador recibe daño, cuando el escudo bloquea un impacto y cuando un enemigo es destruido.

#### Scenario: El jugador recibe daño
- **WHEN** un enemigo o proyectil enemigo alcanza al jugador sin escudo
- **THEN** se muestra feedback visual inmediato y visible junto con la actualización de vidas

#### Scenario: El escudo bloquea un impacto
- **WHEN** un impacto consume el escudo activo
- **THEN** se muestra un feedback visual distinto al de perder una vida

#### Scenario: El jugador destruye un enemigo
- **WHEN** la vida de un enemigo llega a cero
- **THEN** el enemigo desaparece mediante una animación breve de destrucción
