# Design

## Context

El repositorio contiene el PRD, pero todavía no tiene aplicación, código fuente, dependencias ni infraestructura de pruebas. La propuesta define el alcance del MVP; los comportamientos exigidos están en `specs/arcade-gameplay/spec.md`.

## Goals / Non-Goals

**Goals:**
- Mantener la implementación fácil de ejecutar y modificar, sin añadir servicios ni dependencias de ejecución.
- Separar el dibujo en Canvas de la actualización del estado de la partida para que las reglas sean predecibles.
- Hacer que la progresión de oleadas y sus valores puedan verificarse y ajustarse.

**Non-Goals:**
- Añadir multijugador, persistencia de récords, tienda, narrativa, música avanzada o un sistema de construcción/bundling.
- Introducir una arquitectura de motor de juego general reutilizable fuera de este MVP.

## Decisions

- **Aplicación estática con tecnologías web nativas.** Crear una página HTML, estilos CSS y JavaScript sin frameworks ni dependencias externas. Esto satisface el destino HTML5 Canvas del PRD y evita necesitar instalación o compilación para ejecutar el juego. Se prefiere frente a un framework o motor externo porque el MVP es una pantalla y un conjunto acotado de reglas.
- **Canvas para la acción y DOM para la interfaz.** Dibujar la nave, los enemigos, los láseres y el fondo en un único Canvas; mantener instrucciones, puntuación, vidas y mensajes de inicio/fin como elementos HTML legibles. Esto evita depender de texto dibujado en Canvas para la interfaz y mantiene clara la separación entre presentación y estado.
- **Bucle explícito de actualización y renderizado.** Usar `requestAnimationFrame` para actualizar el estado y dibujar cada cuadro. Mantener entradas de teclado y entidades (nave, enemigos y proyectiles) en estado de partida; comprobar colisiones una vez por actualización y retirar entidades resueltas para que una colisión no cuente repetidamente.
- **Oleadas finitas con progresión determinista.** Empezar con cinco enemigos y avanzar solo cuando todos los enemigos de la oleada hayan sido destruidos o hayan colisionado con la nave, siempre que la partida no haya terminado. Cada oleada añade un enemigo y aumenta la velocidad base de descenso en 10 píxeles por segundo; la primera oleada empieza a 40 píxeles por segundo. Estos valores iniciales permiten medir la progresión y podrán ajustarse con pruebas de juego sin cambiar el contrato de que ambas magnitudes aumentan.
- **Vidas iniciales.** Empezar cada partida con tres vidas, un valor arcade sencillo que puede ajustarse durante el balanceo del juego.
- **Controles de teclado simples.** Usar flechas izquierda/derecha o A/D para mover y espacio para disparar, coherente con el briefing y la tecla propuesta en el PRD. Enter inicia la partida desde la pantalla inicial, para no mezclar el inicio con el disparo. Limitar los movimientos y proyectiles al área visible.
- **Verificación sin añadir infraestructura innecesaria.** Validar manualmente en un navegador los criterios de aceptación y la progresión de oleadas. El repositorio aún no tiene runner ni servidor de desarrollo; no se añade una dependencia de pruebas o de ejecución solo para esta primera versión.

## Risks / Trade-offs

- [El aumento de dificultad puede volverse demasiado rápido o demasiado lento] → Mantener los valores iniciales y los incrementos en constantes centralizadas y probar varias oleadas consecutivas.
- [El estado del juego puede avanzar después de perder la última vida] → Comprobar el estado de fin de partida antes de generar otra oleada o actualizar el juego.
- [Canvas puede perder legibilidad al cambiar el tamaño de la ventana] → Mantener una escala y límites coherentes con el tamaño visible, y verificar el juego en una ventana de navegador habitual y al redimensionarla.

## Migration Plan

No hay datos, usuarios ni aplicación previa que migrar. Añadir la página y los recursos estáticos; abrir la página en un navegador para verificarla. Para revertir, retirar los archivos nuevos de la aplicación sin afectar al PRD.
