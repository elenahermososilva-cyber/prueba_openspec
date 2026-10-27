# Design

## Context

La aplicación es una página estática con JavaScript, Canvas y estado de juego en memoria. El cambio amplía el bucle actual a combate continuo y usa SVG locales; no hay build, framework, dependencias externas ni runner de pruebas. La motivación y el contrato de usuario están en `proposal.md` y `specs/arcade-gameplay/spec.md`.

## Goals / Non-Goals

**Goals:**
- Hacer que el tiempo efectivo sea la fuente única para el nivel de amenaza, sin separar las curvas de Fácil, Normal y Difícil.
- Mantener entidades, colisiones y presentación suficientemente separadas para incorporar armas, efectos y apariciones periódicas.
- Usar los recursos locales sin añadir servicios ni pipeline de assets.
- Mantener el juego legible y ejecutable en navegador aunque las partidas duren mucho.

**Non-Goals:**
- Añadir persistencia entre partidas, audio, multijugador, servicios, framework o sistema de construcción.
- Crear varios arquetipos de boss: los recursos actuales solo incluyen `boss1`.
- Diseñar una curva de balance definitiva; las constantes iniciales deberán poder ajustarse y validarse en juego.

## Decisions

- **Dificultad común con offsets, estados legibles y objetivos de presión.** Mantener dos relojes: tiempo real de partida para apariciones de bosses y tiempo efectivo de amenaza para la curva. Usar offsets 0/150/300 segundos para Fácil/Normal/Difícil. El nivel es `1 + floor(tiempoEfectivo / 60)` y el progreso de barra es el resto del minuto; así Fácil al minuto 5 iguala a Difícil al inicio. Situar una barra vertical en el lado derecho del HUD y derivar sus etiquetas del tiempo efectivo: Fácil antes de 2 minutos, Normal desde 2, Difícil desde 5, Muy difícil desde 10, Imposible desde 15 y «¡JA, JA, JA…!» desde 20. Mostrar el nivel numérico sin límite y mantener el último estado mientras siga aumentando; el relleno se reinicia al alcanzar cada nuevo nivel de amenaza. Cada nivel debe elevar tanto la densidad objetivo de enemigos como la velocidad de descenso o la presión de disparo. Definir y probar hitos efectivos a 5, 10, 15 y 20 minutos; el hito 20 debe sentirse densamente poblado, estresante y con ataques solapados, no limitarse a mostrar un número mayor. Se elige esta curva frente a multiplicadores fijos por modo, que nunca convergerían.
- **Director aleatorio con presupuesto creciente.** Sustituir tiradas independientes sin control por un presupuesto de amenaza por intervalo: el nivel determina el presupuesto y su límite de entidades simultáneas; ambos crecen sin techo con el tiempo. La aleatoriedad elige tipos, patrones y momentos dentro del presupuesto, y puede crear picos casi imposibles, pero no sobrepasarlo mediante una tirada ni producir impactos al aparecer el enemigo dentro de la nave o de un proyectil sobre el jugador. Escalonar los spawns y conservar telegráficos de ataques peligrosos para que exista oportunidad de reacción. Mantener un límite de trabajo por frame para proteger el rendimiento, acumulando el presupuesto restante en vez de crear una ráfaga ilimitada en un solo frame.
- **Spawners separados por propósito.** Sustituir el contador de enemigos por un spawner continuo de enemigos cuya presión depende del nivel, un temporizador de orbes cada 30 segundos y otro temporizador de bosses cada 60 segundos de tiempo real. Los bosses aparecen con escolta y el temporizador no espera a que se derrote al anterior.
- **Entidades tipadas y patrones de arma configurables.** Guardar tipo, posición, velocidad, vida y cooldown en cada enemigo; asociar enemigo1 al tiro vertical, enemigo2 al diagonal y enemigo3 al patrón recto más diagonales. Mantener listas separadas para proyectiles del jugador y enemigos, y resolver sus colisiones antes de la colisión contra el jugador. Los proyectiles enemigos se mueven más despacio que los del jugador.
- **Colisiones sin impactos repetidos.** Resolver colisiones una vez por actualización y retirar o marcar las entidades consumidas antes de procesar el resto de colisiones. A medida que aumenta la velocidad, usar comprobaciones de trayectoria o subpasos cuando el desplazamiento por frame pueda saltarse una entidad.
- **Boss con aviso y láser a punto fijado.** Reutilizar `boss1.svg` y `disparo-boss1.svg`. Mostrar un marcador/indicador de carga antes del rayo; como punto de partida ajustable, reducir el aviso desde 2,0 segundos en los niveles iniciales hasta un mínimo de 0,6 segundos. Fijar la posición del jugador al comenzar el aviso y, al completar la carga, animar el láser desde el boss hasta ese mismo punto, dañando los objetivos que atraviese. Esto preserva una oportunidad visible de esquiva incluso a alta amenaza.
- **Catálogo local de SVG con fallback visual.** Precargar los recursos SVG con una sola extensión `.svg` y mapearlos por rol: nave, tres enemigos, proyectiles del jugador/enemigos/boss, boss y los seis tipos de orbe. Los orbes de velocidad, perforación y abanico usan sus iconos dedicados (`aceleracion.svg`, `perforante.svg` y `abanico.svg`). Si falta un recurso, mantener un fallback Canvas visible.
- **Mejoras persistentes con límites de presentación y duración explícita.** Guardar nivel de cada mejora en el estado de partida. Escudo consume un impacto; vida no excede tres; velocidad aumenta movimiento durante 15 segundos; disparo adicional aumenta la ráfaga hasta cinco proyectiles; perforación y abanico progresan por hitos sin tope de nivel. Cuando la ráfaga llega a cinco, excluir disparo adicional del sorteo de orbes para no ofrecer una recogida sin efecto. Repetir un orbe temporal renueva su duración, no multiplica la velocidad. Los niveles persistentes pueden seguir creciendo por hitos aunque el número visible de proyectiles se mantenga controlado.
- **Feedback ligero en el mismo render.** Usar timers de efecto, destellos de nave/escudo, breve flash al recibir daño y partículas breves en destrucciones; no introducir audio ni un motor de partículas general. Comunicar el efecto también en el HUD cuando ayude a distinguir un escudo consumido de una vida perdida.
- **Verificación manual dirigida.** Validar selección, escala, roles de enemigos, colisiones entre disparos, cada orbe, aviso y esquiva del rayo, bosses simultáneos, feedback, límites de dificultad y ausencia de errores en navegador. No añadir un runner solo para este cambio.

## Risks / Trade-offs

- [La velocidad y el volumen pueden crecer hasta saturar el navegador en runs extremas] → Escalar el intervalo de aparición gradualmente, limitar el trabajo por frame y comprobar colisiones con trayectorias; monitorizar fluidez en amenazas altas.
- [Una curva que crece cada minuto puede ser lenta al principio o demasiado brusca en runs largas] → Comparar sesiones aceleradas en los hitos de 5, 10, 15 y 20 minutos y ajustar los parámetros observables de densidad, velocidad y disparos.
- [La aleatoriedad puede convertir un pico estresante en una muerte inevitable] → Restringir combinaciones al presupuesto de amenaza, evitar spawns que intersecten al jugador y conservar avisos y oportunidades de evasión.
- [Las mejoras permanentes pueden trivializar o volver imposible la partida] → Equilibrar niveles y hitos contra la curva de amenaza con partidas largas y ajustar constantes sin cambiar el contrato.
- [Un rayo de boss puede resultar injusto si el aviso no se distingue] → Mantener una señal de carga claramente separada de otros proyectiles y validar sus tiempos en los tres puntos de partida.
- [Los SVG tienen nombres y dimensiones diferentes, y faltan iconos para tres poderes] → Centralizar el mapa de recursos, conservar los nombres existentes y utilizar distintivos simples para los poderes sin recurso propio.
- [Los cambios al spawner reemplazan las oleadas finitas actuales] → No hay progreso persistente que migrar; conservar la pantalla de Game Over y reiniciar temporizadores y mejoras al comenzar una partida nueva.
