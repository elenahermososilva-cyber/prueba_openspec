# Spec Delta

## Purpose

Define el combate de supervivencia infinita de Última órbita: enemigos y disparos diferenciados, dificultad y mejoras ligadas al tiempo, bosses periódicos y feedback claro para las acciones y los impactos.

## ADDED Requirements

### Requirement: Inicio y controles de la partida
El juego MUST mostrar una pantalla inicial con selector de dificultad y MUST permitir mover la nave horizontalmente y disparar mientras la partida esté activa.

#### Scenario: Iniciar con una dificultad elegida
- **WHEN** el jugador elige Fácil, Normal o Difícil y pulsa Enter
- **THEN** comienza una partida nueva con el modo seleccionado y tres vidas

#### Scenario: Mover y disparar
- **WHEN** la partida está activa y el jugador usa flechas o A/D y la barra espaciadora
- **THEN** la nave se mueve horizontalmente dentro del área de juego y dispara hacia arriba

### Requirement: Puntuación y destrucción
El juego MUST añadir exactamente 10 puntos cuando un proyectil del jugador destruye un enemigo y MUST retirar de la partida al enemigo destruido.

#### Scenario: Destruir un enemigo
- **WHEN** el daño recibido por un enemigo agota su vida
- **THEN** el enemigo se destruye, desaparece y la puntuación aumenta exactamente 10 puntos

### Requirement: Vidas y fin de partida
El juego MUST quitar una vida por impacto no bloqueado y MUST detener la simulación cuando las vidas llegan a cero, mostrando Game Over y la puntuación final.

#### Scenario: Un impacto no bloqueado
- **WHEN** un enemigo o proyectil enemigo alcanza al jugador sin escudo
- **THEN** las vidas disminuyen exactamente en uno

#### Scenario: Se agotan las vidas
- **WHEN** las vidas llegan a cero
- **THEN** la simulación se detiene y se muestra Game Over junto con la puntuación final

### Requirement: Selección de dificultad y presión temporal
El juego MUST ofrecer Fácil, Normal y Difícil al comenzar. Los modos MUST compartir una curva de amenaza creciente por tiempo efectivo, con offsets iniciales de 0, 150 y 300 segundos, respectivamente.

#### Scenario: Seleccionar un modo de dificultad
- **WHEN** el jugador llega a la pantalla inicial
- **THEN** puede elegir Fácil, Normal o Difícil antes de iniciar la partida

#### Scenario: Igualar la presión al avanzar el tiempo
- **WHEN** una partida Fácil llega a cinco minutos y una partida Difícil acaba de comenzar
- **THEN** ambas tienen el mismo nivel efectivo de amenaza y desde ese punto escalan con la misma curva

### Requirement: Barra de dificultad en el HUD
El juego MUST mostrar una barra vertical de dificultad a la derecha del HUD, con el nivel efectivo creciente sin límite y una etiqueta de estado determinada por el tiempo efectivo de amenaza.

#### Scenario: Mostrar los estados de dificultad por tiempo efectivo
- **WHEN** cambia el tiempo efectivo de amenaza
- **THEN** la barra muestra Fácil antes de 2 minutos, Normal entre 2 y 5 minutos, Difícil entre 5 y 10 minutos, Muy difícil entre 10 y 15 minutos, Imposible entre 15 y 20 minutos y «¡JA, JA, JA…!» desde los 20 minutos

#### Scenario: Mostrar progreso y nivel de amenaza
- **WHEN** avanza el tiempo dentro de un nivel de amenaza de un minuto
- **THEN** el relleno de la barra muestra el progreso hasta el siguiente nivel, aumenta el número de nivel al completar el minuto y conserva el estado más alto mientras el nivel numérico continúa creciendo

#### Scenario: Reflejar el modo elegido y el tiempo jugado
- **WHEN** el jugador selecciona un modo y empieza la partida
- **THEN** la barra usa el offset temporal del modo seleccionado para mostrar el estado efectivo, de modo que Fácil a los cinco minutos coincida con Difícil al inicio

### Requirement: Enemigos con identidades y armas distintas
El juego MUST presentar tres tipos visualmente diferenciados de enemigos, cada uno con velocidad y resistencia propias y con el patrón de disparo asociado a su tipo.

#### Scenario: Aparecen los tres tipos de enemigo
- **WHEN** progresa una partida
- **THEN** pueden aparecer enemigo1 rápido con disparo recto hacia abajo, enemigo2 de velocidad media con disparo diagonal y enemigo3 lento y resistente con disparos rectos y diagonales

#### Scenario: Los enemigos disparan proyectiles peligrosos
- **WHEN** un enemigo dispara
- **THEN** sus proyectiles se desplazan hacia la zona inferior a menor velocidad que los disparos del jugador y pueden dañar al jugador al colisionar

### Requirement: Defensa y colisión entre proyectiles
El juego MUST permitir que los proyectiles del jugador destruyan enemigos y eliminen proyectiles enemigos sin causar daño al enemigo ni otorgar puntos por esa eliminación.

#### Scenario: Un disparo del jugador alcanza un disparo enemigo
- **WHEN** ambos proyectiles colisionan
- **THEN** ambos desaparecen y no cambian la puntuación ni la vida del enemigo emisor

#### Scenario: Un disparo del jugador alcanza un enemigo
- **WHEN** un proyectil del jugador colisiona con un enemigo
- **THEN** el enemigo recibe daño, el proyectil desaparece salvo que sea perforante y la puntuación solo se concede al destruir al enemigo

### Requirement: Partida infinita con amenaza creciente
El juego MUST generar enemigos continuamente mientras la partida esté activa. Cada nivel efectivo MUST aumentar la densidad de enemigos y al menos una presión de combate (velocidad de descenso o presión de disparo); la progresión MUST continuar sin límite de niveles y mostrarse en una barra y un nivel de amenaza.

#### Scenario: Aumenta la amenaza con el tiempo
- **WHEN** transcurre un minuto de tiempo efectivo de amenaza
- **THEN** aumenta el nivel de amenaza y la siguiente fase de la barra comienza, con mayor densidad de enemigos y mayor velocidad de descenso o presión de disparo que en el nivel anterior

#### Scenario: La partida continúa entre niveles
- **WHEN** se completa una fase de la barra de amenaza
- **THEN** la barra reinicia su progreso para el siguiente nivel y la partida continúa sin un límite de oleadas

#### Scenario: La presión crece en partidas largas
- **WHEN** se compara la partida en los niveles efectivos de amenaza 5, 10, 15 y 20
- **THEN** cada punto de control presenta más enemigos y mayor presión de combate que el anterior, y el nivel 20 produce una escena densamente poblada, con ataques solapados y una exigencia de supervivencia muy alta

#### Scenario: Un pico aleatorio mantiene oportunidad de reacción
- **WHEN** el generador elige una combinación aleatoria de enemigos o ataques en cualquier nivel de amenaza
- **THEN** puede crear un pico casi imposible, pero no genera un impacto inevitable al aparecer ni elimina toda oportunidad de reaccionar o esquivar

### Requirement: Orbes y progresión del jugador
El juego MUST intentar generar un orbe aleatorio cada 30 segundos de partida entre escudo, vida, disparo adicional, velocidad, perforación y abanico. Las mejoras MUST persistir o expirar según su tipo.

#### Scenario: Obtener un orbe de escudo
- **WHEN** el jugador recoge un escudo
- **THEN** el siguiente impacto que quitaría una vida consume el escudo y no reduce las vidas

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
El juego MUST introducir un boss acompañado por enemigos cada 60 segundos de tiempo real de partida. Un boss nuevo MUST poder aparecer aunque otro siga activo. El boss MUST disparar un rayo grueso hacia la posición del jugador con aviso previo cuyo tiempo dependa de la amenaza efectiva.

#### Scenario: Aparece un boss periódico
- **WHEN** la partida alcanza un nuevo intervalo de 60 segundos
- **THEN** aparece un boss con una escolta de enemigos

#### Scenario: El boss prepara el rayo
- **WHEN** el boss va a disparar su rayo
- **THEN** el juego muestra un aviso claro durante un tiempo de reacción ajustado al nivel efectivo de amenaza antes de dirigir el rayo a la posición del jugador

#### Scenario: Aparece un boss mientras otro sigue activo
- **WHEN** llega un intervalo de aparición y un boss anterior no ha sido destruido
- **THEN** aparece también el nuevo boss

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
