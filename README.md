# Última órbita

Arcade espacial de supervivencia infinita para navegador, construido con JavaScript, HTML5 Canvas y recursos SVG locales. No requiere dependencias ni instalación.

## Ejecutar

Abre `index.html` en un navegador moderno.

## Controles

- **← / →** o **A / D**: mover la nave horizontalmente.
- **Espacio**: disparar (mantener para fuego continuo).
- **Enter**: iniciar o volver a empezar.
- Elige **Fácil**, **Normal** o **Difícil** antes de cada partida.

## Dificultad y HUD

La dificultad aumenta con el tiempo efectivo de amenaza. Fácil empieza en 0, Normal en 2:30 y Difícil en 5:00; por eso, Fácil al minuto cinco alcanza la misma amenaza que Difícil al comenzar. La barra vertical a la derecha muestra el nivel y su progreso al siguiente minuto:

| Amenaza efectiva | Estado |
| --- | --- |
| 0–<2 min | Fácil |
| 2–<5 min | Normal |
| 5–<10 min | Difícil |
| 10–<15 min | Muy difícil |
| 15–<20 min | Imposible |
| 20 min o más | ¡JA, JA, JA…! |

Cada nivel aumenta la aparición y la presión de los enemigos. El generador puede producir picos muy difíciles, pero evita crear impactos inevitables al aparecer enemigos encima de la nave.

## Combate y mejoras

- Los tres enemigos tienen sprites, resistencia, movimiento y patrones de disparo distintos.
- Los disparos diagonales giran para seguir su trayectoria hacia abajo. Todos tienen brillo para distinguirlos mejor; los enemigos pueden destruirse con los del jugador y ambas balas desaparecen sin otorgar puntos.
- Se intentan generar orbes aleatorios cada 30 segundos: escudo, vida, disparo adicional, velocidad temporal, perforación y abanico.
- Los orbes conservan su tamaño y destacan con un halo de color, un aro pulsante y destellos.
- El escudo bloquea un impacto; la vida no supera tres; velocidad dura 15 segundos; las mejoras de arma progresan durante la partida.
- Aparece un boss con escolta cada minuto real. El aviso fija un punto; después, el láser viaja hasta ese mismo punto y destruye a los enemigos que alcanza, aunque el jugador se mueva.

## Recursos gráficos

Los recursos SVG locales se cargan desde `assets/` con una sola extensión `.svg`: nave, enemigos, boss, proyectiles y los seis tipos de orbe (escudo, vida, disparo, aceleración, perforación y abanico). Los orbes conservan un halo Canvas tenue; los proyectiles tienen un brillo moderado para mantener su legibilidad. Si un SVG no carga, el juego dibuja un indicador de reserva.
