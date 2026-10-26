Propuesta de Estructura y Reparto de Tareas para el Juego Espacial
1. Módulo base y Núcleo del Juego (Pactado por los tres al inicio)
Antes de crear ramas independientes, definid el entorno base en la rama main mediante OpenSpec:

Motor / Estructura: Elegir la tecnología (por ejemplo, JavaScript/TypeScript con HTML5 Canvas, o Python con Pygame, según prefiráis).

Bucle principal (Game Loop): El gestor que actualiza los fotogramas y dibuja los elementos en pantalla.

2. Reparto de Ramas de Funcionalidad (Para desarrollar en paralelo)
Integrante A: Rama feature/jugador-y-controles

Objetivo: Implementar la nave del jugador.

Tareas en OpenSpec:

Pintar la nave espacial en pantalla.

Configurar los eventos de teclado (mover arriba, abajo, izquierda, derecha y disparar láseres).

Establecer los límites de la pantalla para que la nave no se salga de los márgenes.

Integrante B: Rama feature/enemigos-y-oleadas

Objetivo: Crear la lógica de los enemigos y su aparición (spawner).

Tareas en OpenSpec:

Diseñar la estructura de datos del enemigo (posición, velocidad, vida).

Programar un generador automático que haga aparecer naves enemigas desde la parte superior o los laterales de forma progresiva.

Definir patrones básicos de movimiento descendente o persecución.

Integrante C: Rama feature/colisiones-y-supervivencia

Objetivo: Gestionar las interacciones, las muertes y el marcador de supervivencia.

Tareas en OpenSpec:

Sistema de detección de colisiones (láser del jugador contra enemigo, y enemigo contra la nave del jugador).

Gestión de vidas del jugador y condición de Game Over cuando la salud llega a cero.

Contador de puntuación basado en enemigos destruidos y tiempo de supervivencia.
