# Product Requirements Document (PRD): Última órbita

## 1. Visión del Producto
Un shooter espacial arcade en 2D donde la supervivencia depende de esquivar y destruir oleadas de enemigos con controles precisos y mecánicas directas.

## 2. Alcance (Scope)

### Lo que INCLUYE el MVP:
* **Entorno y Movimiento:** Pantalla de juego 2D en navegador (HTML5 Canvas). Movimiento horizontal de la nave del jugador limitado a los bordes de la pantalla.
* **Sistema de Disparo:** La nave puede disparar proyectiles láser hacia la parte superior mediante una tecla designada (ej. barra espaciadora).
* **Enemigos y Oleadas:** Generación automática de enemigos que descienden desde la parte superior con patrones simples de movimiento. Cada oleada nueva aumenta la dificultad respecto a la anterior, incrementando la cantidad de enemigos y su velocidad de descenso.
* **Colisiones y Vidas:** 
  * Si un láser impacta a un enemigo, ambos desaparecen y se suman puntos.
  * Si un enemigo colisiona con la nave del jugador, se resta una vida.
* **Estado de Partida:** Pantalla de inicio, bucle principal de juego con marcador de puntuación/vidas en tiempo real, y pantalla de fin de partida (*Game Over*) cuando las vidas llegan a 0.

### Lo que NO incluye el MVP (Fuera de alcance inicial):
* Multijugador en línea o local.
* Historia compleja, diálogos o progresión narrativa larga.
* Tienda de mejoras (*power-ups*) o selección de múltiples tipos de naves.
* Efectos de sonido complejos o música avanzada (se prioriza el funcionamiento visual primero).

## 3. Capacidades / Historias Mínimas (MVP)
* **Como** jugador, **quiero** mover mi nave horizontalmente por la parte inferior de la pantalla **para** poder esquivar las amenazas.
* **Como** jugador, **quiero** disparar proyectiles láser **para** destruir a los enemigos que se acercan.
* **Como** jugador, **quiero** que aparezcan enemigos de forma continuada **para** mantener el reto y la tensión de supervivencia.
* **Como** jugador, **quiero** que cada oleada sea progresivamente más difícil **para** que el reto aumente a medida que sobrevivo.
* **Como** jugador, **quiero** ver en tiempo real mi puntuación y mis vidas restantes **para** conocer mi progreso en la partida.
* **Como** jugador, **quiero** que el juego termine y me muestre una pantalla de Game Over si pierdo todas mis vidas **para** saber cuándo ha concluido mi intento.

## 4. Criterios de Aceptación Verificables

| ID | Capacidad | Criterio de Aceptación Verificable |
| :--- | :--- | :--- |
| **CA-01** | Movimiento | La nave se desplaza horizontalmente y **no puede** traspasar los límites izquierdo ni derecho de la pantalla. |
| **CA-02** | Disparo | Al pulsar la tecla de disparo, se genera un proyectil que asciende verticalmente de manera continua hasta salir de la pantalla. |
| **CA-03** | Colisión de proyectil | Si las coordenadas de un láser coinciden con las de un enemigo, el enemigo es destruido y la puntuación aumenta exactamente en 10 puntos. |
| **CA-04** | Impacto al jugador | Si un enemigo colisiona con la nave, el contador de vidas disminuye en 1 y el enemigo desaparece. |
| **CA-05** | Fin de partida | Cuando el contador de vidas llega a `0`, el juego se detiene inmediatamente y se muestra en pantalla el texto "Game Over" junto con la puntuación total obtenida. |
| **CA-06** | Dificultad progresiva | Al completar una oleada, comienza la siguiente con más enemigos y una velocidad de descenso mayor que la oleada anterior. |