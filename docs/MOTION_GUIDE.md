# Guide des mouvements — mécaniques reconstruites et réutilisation

Toutes les animations sont des **fonctions pures du temps** : une scène reçoit
`update(t)` (secondes locales) et positionne ses éléments sans état mémorisé.
C'est ce qui permet `seek(t)` arbitraire, le rendu image par image et le
parallélisme.

## 1. Moteur (`src/engine/`)

| Fichier | Rôle | API |
|---|---|---|
| `engine.js` | timeline, montage des scènes, visibilité, flou de mouvement | `createEngine({stage, timeline, scenes})` → `seek(t)`, `seekFrame(n)`, `seekSub(t, lockT)`, `motionBlurAt(t)` |
| `anim.js` | interpolation | `progress(t,t0,t1,ease)`, `tween(t,t0,t1,a,b,ease)`, `keyframes(t,[{t,v,ease}])`, `track(t,[[frame,v,ease]])`, `sampled(t,[[t,v]])`, `spring(t,{…})`, `stepTime(t,fps)`, `mixColor(a,b,p)` |
| `easing.js` | courbes | `cubicBezier(x1,y1,x2,y2)` (identique CSS/After Effects), `easeOutCubic`, `expoOut`, `aeEasyEase`, `easeOutBack(s)`… ; `resolveEase('nom' | [bezier] | fn)` |
| `random.js` | hasard reproductible | `rand(seed,i,salt)` (accès direct, sans état), `noise1(seed,x)`, `mulberry32(seed)` (pour la mise en page à la construction) |
| `text.js` | métriques | `measure(text,{weight,size})` (avance + boîte d'encre), `baseline()` |
| `homography.js` | perspective par 4 points | `homography(src,dst)`, `cssMatrix3d(H)` |
| `dom.js` | DOM | `el(tag,opts,children)`, `css(node,props)` (avec cache), `tf({x,y,…})` |

### Données mesurées vs courbes

Deux façons d'animer coexistent, à choisir selon le mouvement d'origine :

- **Échantillons mesurés** `sampled(t, [[t0,v0],[t1,v1]…])` : interpolation
  linéaire entre valeurs relevées sur les images (positions de cartes,
  largeurs d'anneau…). C'est la méthode la plus fidèle quand la courbe
  d'origine est irrégulière (caméras « fouettées », dépassements). Les tableaux
  sont en tête de chaque scène, en images de la référence.
- **Courbes paramétriques** `progress/tween/keyframes` + easing : pour les
  mouvements réguliers (apparitions de mots, pops, fondus).

Les ressorts (`spring`) et `easeOutBack` ne sont utilisés que là où un
dépassement est visible (pop du popup S07). Les pops de logo (S13, S20) ont un
dépassement **mesuré** encodé en échantillons (×1,43 puis retour).

### Flou de mouvement

Défini par scène dans `src/timeline.json` : `motionBlur: [[de, à, échantillons,
angle d'obturateur]]`. Le rendu (`scripts/lib/browser.mjs`) moyenne N
sous-images réparties sur l'obturateur, centrées sur l'instant de l'image
(comme After Effects). `seekSub(t, lockT)` garde la visibilité de l'instant
principal pour ne jamais mélanger deux plans de part et d'autre d'une coupe.

### Cadence décimée

`stepTime(t, 30)` fait avancer une animation par pas de 1/30 s sur une
timeline 60 fps (lignes de vitesse de S08, mesurées « une image sur deux »).

## 2. Composants réutilisables (`src/components/`)

| Mécanique | Composant | Paramètres | Où |
|---|---|---|---|
| Texte découpé par mot/caractère | `TextLine({text|tokens, size, weight, color, split, align})` | chaque item : `node`, `x`, `advance`, `ink`, `start` (index de caractère) | partout |
| Saisie caractère par caractère + couleur « fraîche » | `TextLine({split:'char'})` + opacité par index ; `LogoPill.set({chars, settle(i)})` ; `EmailComposer.set({typed, fresh})` ; `AiEmailCard.setTyped(n)` | nombre de caractères (fractionnaire) | S05, S06, S13, S14, S16, S20, S21 |
| Pilule lemlist | `LogoPill({L})` → `set({cx,cy,scale,chars,settle,logoScale,blur})` | `L` = taille du logo | S05, S13, S20 |
| Texte extrudé 3D | `ExtrudedText({text,size,depth,layers,faceImage,side,sideFar})` → `set({rx,ry,rz,…})` | profondeur, nb de calques | S01, S02 |
| Anneau brillant 3D | `Ring({diameter,band})` → `set({x,y,scale,rx,rz,spin})` | | S01, S02 |
| Starburst | `Starburst({spikes,inner,jitter,seed,fill})` | forme seedée | S02 |
| Fond (gradient + grille) | `Background({variant:'light'|'dark'|'blue'})` | `set({dotOffset,dotScale})` | toutes |
| Curseur | `Cursor({shape:'mac'|'plane'|'planeL'})` → `set({x,y,scale,press})` (pointe = (x,y)) | | S06, S07, S13–S15, S20 |
| Fenêtre email claire | `EmailComposer({lines,avatar,bigAvatar})` | `set({x,y,scale,rot,rx,ry,typed,button})` | S06 |
| Boîte de réception / popup sombre | `InboxWindow()`, `setRow(i,{selected,pop,visible})`, `DarkEmailPopup()` | | S07, S08 |
| Tableau en perspective | `LeadsTable(...)` + `homography(ANCH, P(t))` | 4 points écran par image clé | S15 |
| Canevas de workflow | `SignalPill`, `AiEmailCard`, `GmailNode`, `SequenceTree({nodes,links})` (pop de 6 images par nœud via `appear`) | | S16 |
| Cartes de réponse | `ReplyCard`, `LinkedInThread.set({headerOpacity, clipTop, bodyTop})` | | S18, S19 |
| Moustique | `Mosquito().set({x,y,scale,rot,t,blur})` (ailes à 14 Hz, jitter seedé) | | S09–S11 |
| Lettrage « bzzzz » | `BuzzText({text, ry}).set({x,y,width,rot})` | | S10 |
| Flamme | `Flame().set({from,to,frame,reach})` (boucle 24 images) | | S11 |
| Couronne, étincelles | `Crown`, `Sparkle` | | S09, S06 |

## 3. Mécaniques par famille

### Animation typographique
- **Mot par mot avec couleur de transition** (S09, S13, S18, S20) :
  `progress(fr, f0, f0+N)` pilote opacité + translation Y + `mixColor(clair,
  final, p)`. Les instants `f0` sont dans les tableaux `WORDS` / `A1` / `A2`.
- **Ligne qui se recentre quand elle s'allonge** (S09 « ce moustique à 3h ») :
  une `TextLine` centrée par état ; pendant 2 images l'ancien état reste à
  50 % (double image mesurée).
- **Mots qui grossissent depuis la ligne de base** (« Et oui… », « c'est ») :
  `transformOrigin` = ligne de base, échelle échantillonnée.

### Caméra et cadrage
- Caméra = transformation d'un conteneur « monde » : `translate(T) scale(s)`
  avec `s`, `T` mesurés (S07, S14, S16, S18). Pour retrouver `T` à partir d'un
  objet suivi : `T = écran − s·monde`.
- **Panoramique fouetté** (S16) : grands sauts de `T` sur 6–8 images + flou
  de mouvement 8 échantillons.
- **Perspective** : soit CSS 3D (`perspective` + `rotateX/Y`), soit
  homographie 4 points quand le plan doit coller à des ancres mesurées (S15).

### Curseur et interactions
- Trajectoires échantillonnées (`PTR`), clic = `press` (rétrécit de 12 %) +
  onde circulaire (S14, S20), réaction de l'UI décalée de 0–3 images (bouton
  bleu S06 f530→f541, sélection rouge S07 en 2 images).

### Transitions
- Coupes franches aux images mesurées (`in`/`out` de la timeline).
- Raccords dans le mouvement : anneau → « o » (S01→S02), cube → logo
  (S04→S05), recul flou sous la carte suivante (S05/S06 se chevauchent
  f346–f369 : `z` plus élevé pour S06).
- « Aspiration » d'objets vers une cible (S19) : interpolation position +
  échelle avec `easeInCubic` et décalage d'1 image par objet.

### Particules et fonds
- Éclats de l'avatar (S09) : 110 triangles, trajectoires balistiques seedées
  (`rand(91, i, k)`), pas d'état.
- Lignes de vitesse (S08) : 46 lignes seedées, boucle modulo, pas de 30 i/s.
- Fonds : `Background` ; la grille de points ne bouge pas (fixe à l'écran),
  comme dans l'original.

## 4. Réutiliser une mécanique

Exemple : réutiliser la saisie de la pilule avec un autre mot.

```js
import { LogoPill } from '../components/LogoPill.js';
import { progress } from '../engine/anim.js';
const pill = LogoPill({ L: 80, text: 'monmot' });
root.appendChild(pill.node);
// dans update(t):
const fr = t * 60;
const TYPE = [5, 5, 12, 12, 18, 18];          // image d'apparition de chaque lettre
pill.set({ cx: 960, cy: 540, chars: TYPE.filter((f) => fr >= f).length,
           settle: (i) => progress(fr, TYPE[i] + 1, TYPE[i] + 8) });
```

Ajouter une scène : créer `src/scenes/sNN-nom.js` exportant `{ mount(root,
ctx), update(t, ctx) }`, l'ajouter à `src/scenes/index.js` et à
`src/timeline.json` (`in`, `out`, `z`, `motionBlur`).
