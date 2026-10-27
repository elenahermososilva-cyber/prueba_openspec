# Tasks

## 1. Recursos, inicio y HUD de amenaza

- [ ] 1.1 Crear un catálogo y precarga de los SVG locales para jugador, enemigos, proyectiles, boss y orbes; verificar que cada recurso se dibuja en Canvas y que un fallo de carga no deja una pantalla vacía.
- [ ] 1.2 Añadir selector de Fácil/Normal/Difícil, reloj de amenaza con offsets 0/150/300 segundos y barra vertical en el lado derecho del HUD; verificar progreso y nivel numérico por minuto, estados Fácil (<2 min), Normal (2–<5), Difícil (5–<10), Muy difícil (10–<15), Imposible (15–<20) y «¡JA, JA, JA…!» (20+), y que Fácil a 5:00 iguala a Difícil al inicio.
- [ ] 1.3 Actualizar el README con controles, selector de dificultad, HUD y los recursos visuales usados; verificar que las instrucciones coinciden con la pantalla inicial.

## 2. Enemigos y combate de proyectiles

- [ ] 2.1 Implementar los tres tipos de enemigo con sus velocidades, resistencias, sprites y patrones de movimiento; verificar que se distinguen visualmente y que enemigo3 aguanta más daño.
- [ ] 2.2 Implementar los disparos rectos, diagonales y combinados de cada enemigo a menor velocidad que los disparos del jugador; verificar cada patrón y la colisión contra el jugador.
- [ ] 2.3 Implementar colisiones entre proyectiles aliados y enemigos; verificar que cada par desaparece sin puntuar ni dañar al enemigo emisor.
- [ ] 2.4 Mantener destrucción de enemigos, 10 puntos por baja, vidas, Game Over y feedback visual de impacto/escudo/destrucción; verificar impactos únicos, puntuación exacta y detención al llegar a cero.

## 3. Amenaza infinita y mejoras

- [ ] 3.1 Sustituir oleadas finitas por un director aleatorio con presupuesto de amenaza y límite de entidades simultáneas crecientes sin techo; verificar que cada nivel añade densidad y velocidad o presión de disparo, sin ráfagas ilimitadas por frame ni impactos inevitables al aparecer.
- [ ] 3.2 Generar un orbe aleatorio cada 30 segundos y hacerlo caer con colisión de recogida; verificar la frecuencia y que solo se concede el poder del orbe recogido.
- [ ] 3.3 Implementar escudo de un impacto, curación hasta tres vidas, ráfaga de hasta cinco disparos, velocidad temporal de 15 segundos, perforación y abanico progresivos; verificar límites, duración, niveles y actualización visual del HUD.

## 4. Bosses periódicos

- [ ] 4.1 Añadir el boss con sus recursos y escolta cada 60 segundos de tiempo real; verificar que aparece con enemigos y puede coincidir con un boss anterior aún activo.
- [ ] 4.2 Implementar la señal de carga y el rayo grueso dirigido al jugador, con reacción ajustada a la amenaza; verificar el aviso, el movimiento del proyectil, sus colisiones y que el jugador puede esquivarlo.

## 5. Integración y aceptación

- [ ] 5.1 Recorrer en navegador los escenarios de la especificación, incluidos los tres modos, progresión temporal, los seis poderes, bosses simultáneos, colisiones y Game Over; corregir problemas de integración y confirmar que no hay errores de JavaScript.
- [ ] 5.2 Probar partidas aceleradas en 5, 10, 15 y 20 minutos efectivos y redimensionar la ventana; verificar posición/legibilidad de la barra vertical, etiquetas y progreso por minuto, que la densidad y la presión crecen en cada hito, que el minuto 20 es densamente poblado y muy estresante, que los picos aleatorios aún dejan reacción/esquiva y que el HUD, las colisiones y el rendimiento siguen siendo jugables.
