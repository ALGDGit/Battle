# Battle

Juego estático de navegador. **No hace falta Python ni npm en tu máquina.**

- Repositorio: [https://github.com/ALGDGit/Battle](https://github.com/ALGDGit/Battle)
- Online: [https://algdgit.github.io/Battle/](https://algdgit.github.io/Battle/)

## Probar en local

No abras `index.html` a doble clic (`file://` rompe el juego).

1. Haz doble clic en `start.bat` (o ejecuta `start.ps1` en PowerShell).
2. Se abre solo el navegador en:

```text
http://127.0.0.1:8080/
```

3. Para parar el servidor, cierra la ventana negra de PowerShell.

Eso usa solo PowerShell de Windows: sin instalar nada.

## Jugar online (GitHub Pages)

Abre:

```text
https://algdgit.github.io/Battle/
```

Si Pages aún no está activo:

1. En [Settings → Pages](https://github.com/ALGDGit/Battle/settings/pages): **Source → GitHub Actions**
2. Haz push a `main` o lanza el workflow [Deploy to GitHub Pages](https://github.com/ALGDGit/Battle/actions/workflows/pages.yml) a mano
3. Espera a que el deploy termine y abre la URL de arriba

## Compilar en GitHub (sin instalar nada local)

El workflow [`.github/workflows/pages.yml`](.github/workflows/pages.yml):

- instala dependencias **en los servidores de GitHub**
- ejecuta `npm run build` allí
- publica `index.html`, `src/` y `data/` en GitHub Pages

En local no corres `npm` ni `python`.

## Resumen del juego

Dos modos:

- **History Mode** — solo el huevo Beta → cuidar (feed/train/battle) → evolucionar → Final Challenge
- **Arena Mode** — eliges luchador y rival entre personajes ya jugados en History

### Combate y progresión

- Ataque normal siempre disponible
- Especial desde etapa `Child` (20% de los turnos): Vaccine / Data / Virus con efectos distintos
- 20% de drop de ítem tras una batalla
- Si falla la evolución tras ganar, +1% a la siguiente tirada

## Estructura

```text
.
├── index.html
├── start.bat / start.ps1   # lanzar en local sin instalar nada
├── src
│   ├── js/          # runtime del navegador (generado)
│   ├── ts/          # fuente TypeScript
│   └── styles/
├── data
│   ├── characters.json
│   ├── sprites/
│   └── ui/
└── .github/workflows/pages.yml
```

El navegador solo usa HTML, CSS, JS y los assets de `data/`.
