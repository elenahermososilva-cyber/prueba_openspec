# Tasks

## 1. Aplicación y pantalla de juego

- [x] 1.1 Crear la página estática, estilos y área HTML5 Canvas sin dependencias externas; verificar que se abre localmente en un navegador y muestra la pantalla inicial.
- [x] 1.2 Implementar los estados inicial, partida y fin de partida, la interfaz DOM para puntuación/vidas y el bucle de actualización/renderizado; verificar que Enter inicia la partida y el marcador permanece visible.

## 2. Nave y combate

- [x] 2.1 Implementar el movimiento horizontal con flechas o A/D y limitar la nave al área visible; verificar ambos sentidos y los dos límites de pantalla.
- [x] 2.2 Implementar el disparo con espacio, el movimiento de proyectiles y las colisiones láser-enemigo; verificar que ambos desaparecen y cada impacto suma exactamente 10 puntos.

## 3. Enemigos, vidas y oleadas

- [x] 3.1 Implementar enemigos con posición, velocidad, vida y patrones de descenso/persecución; espaciar su aparición desde la parte superior y los laterales, y mantener la progresión de cinco enemigos a 40 píxeles por segundo, sumando un enemigo y 10 píxeles por segundo por oleada; verificar que las oleadas segunda y tercera tienen respectivamente 6/7 enemigos y 50/60 píxeles por segundo.
- [x] 3.2 Implementar colisión enemigo-nave y retirada del enemigo impactado; verificar que cada impacto resta exactamente una vida y no se cuenta de nuevo en cuadros posteriores.
- [x] 3.3 Avanzar de oleada cuando se resuelva su último enemigo y la partida siga activa; verificar el avance tanto al eliminar enemigos como al recibir impactos, y que no se genere otra oleada al perder la última vida.

## 4. Integración y aceptación

- [x] 4.1 Conectar el fin de partida al contador de vidas; verificar que al llegar a cero la simulación se detiene y aparece Game Over con la puntuación final.
- [x] 4.2 Recorrer en navegador los criterios CA-01 a CA-06 del PRD, incluidos los límites al redimensionar la ventana; corregir los problemas de integración y confirmar que las instrucciones de controles se muestran antes de jugar.
