# Analyse timecodée de la vidéo de référence

Source analysée : `lemlist_1080p.mp4` fourni en pièce jointe (non versionné, voir
`reference/README.md`). Toutes les mesures ont été faites sur les 3 099 images
natives extraites avec `scripts/extract-reference.sh` (`reference/frames/fNNNNN.jpg`,
index 0 = 0,000 s). **Notation : `f123` = image 123 = 123/60 s = 2,050 s.**

## 0. Caractéristiques techniques de la source

| Élément | Valeur mesurée (ffprobe) |
|---|---|
| Conteneur | MP4 (`mp42`), encodé par Vimeo (« Vimeo Artax ») |
| Vidéo | H.264 High, 1920×1080 (16:9), yuv420p, BT.709 limited range, progressive |
| Cadence | 60 fps constants (`r_frame_rate = avg_frame_rate = 60/1`), 3 099 images |
| Durée vidéo | 51,650 s (3 099 / 60) |
| Audio | AAC-LC stéréo 48 kHz, ~189 kb/s, durée 51,712 s (dépasse la vidéo de 62 ms) |
| Loudness | intégré −16,3 LUFS, LRA 5,1 LU, true peak −4,4 dBFS |
| Particularités | 47 images quasi identiques à la précédente (tenues), une seule coupe au noir (f1717–f1747, RVB 0 strict). Les « speed lines » de S08 sont animées à 30 i/s (une image sur deux) alors que la carte bouge à 60 i/s. |

La reconstruction conserve 1920×1080, 60 fps, 3 099 images et la piste audio
d'origine copiée bit à bit (51,712 s).

## 1. Méthode

1. Extraction de toutes les images (`scripts/extract-reference.sh`).
2. Index : planches 1 image/s puis planches par scène toutes les 2 à 8 images
   (`tools/` + scratch), puis images isolées à pleine résolution.
3. Détection des coupes : différence absolue moyenne entre images successives
   (480×270) — pics > 12 = coupes franches (f52, f155, f546, f1510, f1717, f1748,
   f2160, f2695, f2915…).
4. Mesures géométriques par segmentation couleur (bleu lemlist `B−R>120`, blanc,
   rouge, navy…), composantes connexes et ajustements d'ellipses / boîtes
   englobantes, image par image sur les mouvements rapides.
5. Typographie : les tailles ont été résolues à partir des largeurs d'encre
   mesurées (`scripts/measure-text.mjs "texte" graisse 100 --target-width L`).
6. Couleurs : échantillonnage de pixels sur zones planes, fonds ajustés par
   un modèle de gradient radial elliptique (`erreur < 1 niveau`).

Les valeurs marquées *(est.)* sont estimées (flou de mouvement, rendu 3D,
éléments trop petits) ; les autres sont mesurées.

## 2. Système visuel commun

| Élément | Valeur |
|---|---|
| Police | Sans-serif géométrique-humaniste très proche d'**Inter** (Bold 700 pour les titres, Medium 500 pour l'UI). *Identification non certaine* : Inter est utilisée comme équivalent visuel (largeurs d'encre reproduites à ±1 %). |
| Fond clair | gradient radial elliptique centré (960, 300), rayons 900×700 : `#f9fafe` → `#e7effc` ; grille de points au pas de **41,6 px**, points ~5 px très peu contrastés |
| Fond sombre | radial centré (960, 250), 700×600 : `#242232` → `#16141f` ; même grille, points plus sombres |
| Fond bleu | radial centré (960, 250), 700×600 : `#658afc` → `#3967f9` ; points clairs |
| Bleu lemlist (logo) | `#3866F9` (mesuré f1787) |
| Navy texte | `#1f2a44` – `#27334d` |
| Rouge « spam » | `#d8353a` (cases), `#b8344b` (mots) |
| Cadres UI | carte blanche arrondie dans un « verre dépoli » (liseré blanc translucide + ombre douce) |

## 3. Découpage en scènes

| ID | Images | Temps | Contenu | Fichier |
|---|---|---|---|---|
| S01 | 0–52 | 0,000–0,867 | « OK » dans un anneau bleu, traversée | `src/scenes/s01-ok-ring.js` |
| S02 | 52–135 | 0,867–2,250 | « 60.S » + réveils + éclats → « pour vous expliquer » | `s02-sixty-seconds.js` |
| S03 | 136–154 | 2,267–2,567 | « Pourquoi » + « ? » | `s03-pourquoi.js` |
| S04 | 155–203 | 2,583–3,383 | cube lemlist 3D | `s04-logo-cube.js` |
| S05 | 204–369 | 3,400–6,150 | pilule « lemlist » tapée + site web | `s05-pill-website.js` |
| S06 | 346–545 | 5,767–9,083 | composeur d'email « Victor » | `s06-victor-email.js` |
| S07 | 546–835 | 9,100–13,917 | boîte de réception sombre, spam | `s07-spam-inbox.js` |
| S08 | 836–939 | 13,933–15,650 | email qui tombe, pile d'emails | `s08-falling-pile.js` |
| S09 | 940–1214 | 15,667–20,233 | « Et oui… vous n'êtes plus un.e pro de la vente » → moustique | `s09-et-oui.js` |
| S10 | 1215–1509 | 20,250–25,150 | moustique seul, « bzzzz » | `s10-mosquito-bzzzz.js` |
| S11 | 1510–1716 | 25,167–28,600 | « et c'est exactement » + lance-flammes | `s11-cest-exactement.js` |
| S12 | 1717–1747 | 28,617–29,117 | noir | `s12-black.js` |
| S13 | 1748–1891 | 29,133–31,517 | pilule + « Vous contactez les bonnes personnes » | `s13-vous-contactez.js` |
| S14 | 1892–1995 | 31,533–33,250 | saisie du prompt, clic « Démarrer » | `s14-prompt-typing.js` |
| S15 | 1996–2159 | 33,267–35,983 | tableau de leads en perspective, signal | `s15-leads-table.js` |
| S16 | 2160–2384 | 36,000–39,733 | canevas bleu : signal → email IA → Gmail → séquence | `s16-blue-flow.js` |
| S17 | 2385–2434 | 39,750–40,567 | « Résultat » | `s17-resultat.js` |
| S18 | 2435–2585 | 40,583–43,083 | fil LinkedIn → éventail de réponses → « Plus de réponses » | `s18-replies.js` |
| S19 | 2586–2694 | 43,100–44,900 | calendrier, démos réservées | `s19-calendar.js` |
| S20 | 2695–2914 | 44,917–48,567 | outro : pilule + CTA + tableau de l'app | `s20-outro-cta.js` |
| S21 | 2915–3098 | 48,583–51,633 | « www.lemlist.fr » | `s21-url.js` |

La version machine (avec événements clés et fenêtres de flou de mouvement)
est `src/timeline.json`.

---

## S01 · f0–52 · « OK » et l'anneau

- **Composition** : fond clair. Anneau bleu (bande = 12 % du diamètre, gradient
  conique bleu avec 2 reflets blancs à ~1 h et ~8 h), ellipse inclinée. « OK »
  (Inter Black extrudé, face en dégradé bleu clair → bleu, flancs bleu foncé) au
  centre de l'anneau.
- **Mouvement mesuré** : largeur de l'anneau 25 px (f0) → 229 (f1) → 657 (f6) →
  925 (f12) → 1135 (f20) → 1280 (f30) → 1374 (f42) → 1496 (f48) → sort du cadre
  (f49–f52). Décélération forte (type expo-out) puis ré-accélération à la fin
  (f44–f52) : la caméra plonge dans le « O ». Ajustement d'ellipse (bords
  externes f1–f18, internes ensuite) : inclinaison 12° → 36° (f18) puis stable,
  rapport petit/grand axe 0,87 → 0,82. « OK » : 64 px (f1) → 170 (f12) → 249
  (f30) → 449 (f48), centre (960,540) → (1018,537) ; légère rotation 3D.
- **Transition** : f52 l'image est le « O » géant (passage à travers la
  contreforme) qui révèle S02 (coupe dissimulée dans le mouvement, flou de
  bougé sur f47–f52).
- **Implémentation** : `Ring` (anneau CSS masqué + conic-gradient, en 3D),
  `ExtrudedText` (empilement de calques en `preserve-3d`), échelles et centres
  tabulés image par image (`sampled`).

## S02 · f52–135 · « 60.S », réveils, « pour vous expliquer »

- **f52–f83** : « 60.S » (bleu extrudé) au centre de l'anneau. Quatre réveils
  bleu pastel (rendus 3D) aux coins (306,420) petit, (1410,300), (1650,905) grand
  et flou, (741,615) petit ; ils vibrent.
  - f55 : éclat (starburst) bleu `#ACBEFC` qui part du centre et couvre l'écran
    en ~6 images ; f67 : éclat blanc qui le recouvre ; une étoile claire à
    l'intérieur ; f82 : retour au fond clair. Un trait lumineux diagonal balaie
    l'écran (f55–f80).
  - Largeur du bloc « 60.S » : 339 (f53) → 368 (f71) → 320 (f83).
- **f84–f100** : recul caméra très rapide (anneau 1275 → 216 px de large), le
  bloc file vers la gauche (centre 907 → 522) : l'anneau devient le « o » de
  « pour ». Flou de mouvement fort (f84–f116).
- **f95–f135** : « pour vous expliquer » (Inter Bold 119 px, encre
  x 389–1537, centre y 544) arrive en perspective (rotateY ~24° → 0 à f117,
  léger roulis). Couleur : « pour » navy, « vous » passe en bleu clair f104–f112,
  « expliquer » devient bleu `#4066db` à f113.
- **Fin** : f117–f135 le texte se contracte légèrement (largeur 1148 → 1040 px).

## S03 · f136–154 · « Pourquoi »

- Coupe franche f136. « Pourquoi » (Inter Bold ~128 px, dégradé bleu) au centre
  devant un « ? » géant lavande défocalisé (hauteur d'encre 600 → 411 px).
- Mesures : largeur 600 → 546 (f140) → 510 (f152) ; centre y 546 → 559 (f144)
  puis chute accélérée 570 → 850 (f153). f154 = fond vide. Ease-in sur la chute.

## S04 · f155–203 · Cube lemlist

- f155 : caméra **dans** la face bleue (aplat bleu), f157–f161 recul très
  rapide (largeur projetée 3200 → 480 px), puis cube qui tourne (faces logo
  orientées différemment) en rétrécissant 480 → 220 px (f200), f202–f203
  effondrement en carré-logo (84 px) qui devient le logo de la pilule S05.
- Le cube d'origine est un rendu 3D (biseaux, reflets) : reconstruit en CSS 3D
  (6 faces arrondies, ombrage par face) — *forme approximée*.

## S05 · f204–369 · Pilule « lemlist » + site

- Pilule : cadre givré + carte blanche + logo (63 px au repos) + « lemlist »
  Inter Medium. Logo centre (947,534) f204 → (858,290) f246 → (870,300) f350.
- Saisie : « le » f205, « mli » f213, « st » f221 ; les lettres apparaissent en
  bleu clair `#93abf5` puis passent au navy en ~4 images. Traits de vitesse bleus
  à gauche du logo (f204–f214).
- Site : la page d'accueil lemlist (nav « Produit / Pour qui ? / L'outbound qui
  marche / Tarifs / On recrute ! / Connexion / Démo / Essai gratuit », titre
  « La plateforme pour faire de l'outbound avec / précision grâce à l'IA »
  43,2 px, sous-titre 18 px, CTA « Essayez gratuitement pendant 14 jours »,
  badges 4.6/5, 4.6/5, SOC 2) bascule depuis le bas (rotateX 55° → 0 de f226 à
  f238), léger dépassement d'échelle (1,067 à f254) puis lente dérive.
- f350–f368 : tout recule, se floute (0 → 10 px) et disparaît sous la carte S06.
- Reconstruction : HTML (`Website.js`), coordonnées = pixels de f300.

## S06 · f346–545 · Composeur « Victor »

- La fenêtre arrive en haut à droite (×2, rotation −32°, flou) f346–f365 puis
  plonge au centre f366–f374 (rotation → 0, petite bascule 3D à l'atterrissage),
  poussée lente jusqu'à ×1,42 (f392), petit recul, recul rapide f424–f428
  (×1,26 → ×1,02), puis lente dérive (×0,88 à f532).
- Contenu : avatar Victor, « Victor », « Victor@gmail.com », texte saisi
  « Bonjour, je vous invite à découvrir notre solution innovante / qui pourrait
  transformer votre activité. » (19 px), soulignement noir, bouton « Envoyer »
  gris → bleu `#8b9fe8` f530–f541. Avatar de la prospecte (112 px) au-dessus.
- Saisie : 21 caractères à f374, 52 à f388, 81 à f406, 101 (fin) à f428 ; les
  2 derniers caractères en lavande.
- Anneaux concentriques blancs derrière la carte pendant la poussée.
- Étincelles à 4 branches bleues f436–f490 ; curseur noir macOS entre f499,
  clic f528–f538. Coupe franche f546.

## S07 · f546–835 · Boîte de réception (spam)

- Fenêtre sombre « Gmail » (bordure dégradée rouge, lueur rouge), compteur
  « 52 E-mails non lus », 7 lignes « Découvrez notre solution ».
- Caméra : entre à ×1,30 et se pose (f546–f598). Pointeur blanc (flèche de
  navigation) qui arrive de gauche (f550–f586).
- Sélection : ligne 1 rouge f586 ; balayage vers le bas lignes 2-4 f604–f610.
  f666 : suppression des 4 mails, la liste se re-remplit (2/4/6/7 lignes
  f666–f672). Poussée sur le coin supérieur gauche ×2 (f672–f700), ligne 1
  re-sélectionnée f706, panoramique rapide vers le bas (f720–f732), lignes 2-4.
- f774–f781 : le plan bascule en 3D, une petite fenêtre email sombre
  (« Supprimer » / « Répondre ») se pose sur la ligne 5 (f779), puis se décolle
  en tournant (f812–f835).

## S08 · f836–939 · Chute et pile

- f836–f873 : la fenêtre email (×2,1, tournée ~75°) tombe à travers des lignes
  de vitesse verticales blanches qui remontent (animées **une image sur deux**).
- f874 coupe : pile de fenêtres email identiques sur une lueur rouge, un dernier
  email tombe en tournoyant (f874–f886), deux volutes de fumée (f890–f912),
  poussée lente.

## S09 · f940–1214 · « Et oui… vous n'êtes plus un.e pro de la vente »

- « Et » grossit de 30 à 95 px (f940–f956), « oui… » s'ouvre à côté (f958–f972).
- f976 coupe : couronne au trait qui tournoie, avatar de la prospecte qui
  tourne en s'agrandissant (f977–f988). Mots ajoutés un par un en rouge puis
  blancs : vous (f979), n'êtes (f986), plus (f996), un.e (f1012), pro (f1016),
  de (f1020), la (f1024), vente (f1032). Dézoom ×1,65 → ×1,07 (f989–f1000).
- f1010 : la couronne tombe sur l'avatar → ligne 1 grise, fond de l'avatar
  rouge ; f1036–f1056 la couronne glisse et tombe.
- f1072 coupe : « vous êtes / ce moustique » ; f1122 un moustique géant flou
  entre par le bas-gauche, la ligne 2 s'allonge « … à » (f1168), « … à 3h »
  (f1176), « … à 3h du » (f1200) avec double image de recentrage ; l'avatar se
  désintègre en éclats rouges (f1184–f1215).

## S10 · f1215–1509 · Moustique, « bzzzz »

- Moustique (rendu 3D : corps navy, ailes floues blanches) en vol stationnaire.
  « bzzzz » (Inter Bold gris en perspective) au-dessus (f1313–f1358), plan
  rapproché f1360–f1404 avec grand « bzzzz » et traîne de « bzzzz » derrière
  l'abdomen, recul f1404–f1426.

## S11 · f1510–1716 · « et c'est exactement »

- Carte email sombre « Emilie Paris — Coucou c'est encore moi 👋 » qui recule
  (flou), « et » puis « c'est » (f1523) et « exactement » gris (f1535). Le
  moustique passe derrière le texte. f1568–f1580 la carte tombe, f1584–f1606 le
  texte bascule et tombe. f1596 grand « bzzzz » gris derrière le moustique.
- f1652–f1716 : jet de lance-flammes cartoon depuis le coin inférieur droit,
  boucle de **24 images** (mesurée par auto-similarité).

## S12 · f1717–1747 · Noir (31 images, RVB 0)

## S13 · f1748–1891 · Pilule + « Vous contactez les bonnes personnes »

- Pilule plus grande (logo 91 px), recul défocalisé ; logo qui naît d'un point
  avec dépassement (×1,43 à f1758). Saisie « le / mli / st » (f1749/1758/1766).
- f1790–f1812 : la pilule monte (rapide) ; la carte « Bonjour Victor, que
  voulez-vous faire ? » monte du bas ; pointeur navy en bas à gauche.
- Mots : Vous (f1812), contactez (f1818), les (f1824), bonnes (f1836),
  personnes (f1842) ; montée de 25 px + couleur claire → finale.
- f1862–f1886 : le pointeur file dans le champ en rétrécissant.

## S14 · f1892–1995 · Prompt

- Gros plan ×1,81 sur le champ : « Trouve moi des CFOs B2B tech en France pour
  vendre ma solution » tapé à ~2 car./image (f1888–f1919), curseur clignotant.
- f1946–f1957 recul rapide (flou), clic sur « Démarrer » f1974, le message
  glisse dans une bulle grise (f1964–f1970), le bouton se réduit en loader.

## S15 · f1996–2159 · Tableau de leads

- La carte part à gauche, le tableau lemlist (onglets « Entreprises
  européennes 6512 / Directeurs marketing 100K+ / Directeurs financiers 15K »,
  colonnes Nom complet / E-mail / Téléphone / Dernier signal détecté /
  Entreprise, 9 lignes) arrive de la droite **en perspective**.
- Le signal « A annoncé sa récente levée de fonds » se soulève avec une lueur
  bleue (f2064–f2072). Poussée rapide f2098–f2110 qui redresse la vue, puis lente.
- Reconstruction : tableau plat + homographie calculée sur 4 ancres mesurées
  (f2026, f2060, f2098, f2110, f2158).

## S16 · f2160–2384 · Canevas bleu

- Le signal (pilule bleue) se pose (×0,81 → ×1), panoramique fouetté
  (f2208–f2226) vers la carte email IA (badge étincelles) écrite à vitesse
  décroissante (43 car. à f2226, 145 à f2244, 225 à f2274), second
  panoramique (f2274–f2302) vers le nœud Gmail « Victor / to : Claire Dubois /
  Éviter les doubles frais USD/EUR », puis la caméra descend et recule pendant
  que la séquence pousse branche par branche (A un numéro de téléphone →
  Oui : Appeler, Envoyer un SMS / Non : Ajouter sur Linkedin, Visiter le profil
  Linkedin, Invitation acceptée dans les 2 jours → Message de chat / Email).

## S17 · f2385–2434 · « Résultat »

- Blanc sur bleu, centré ; poussée linéaire (encre 664 → 752 px).

## S18 · f2435–2585 · Réponses

- Fil LinkedIn (Victor → Claire, réponse de Claire) ; l'en-tête s'efface, la
  carte est « mangée » par le haut (f2470–f2491) jusqu'à la réponse de Claire.
- Éventail de cartes de réponse en diagonale (pas +170 / −97 px) avec dézoom
  (×0,5 à f2505) puis zoom (f2519) ; carte Chloe Bennett + badge Gmail + puce
  « New message ».
- Mots « Plus » (f2519), « de » (f2526), « réponses » (f2533).

## S19 · f2586–2694 · Calendrier

- Calendrier sombre qui monte, cartes de réponse (James Foster, Oliver Reed,
  Lucas Grant, Ethan Brooks) aspirées (f2622–f2640) et transformées en
  événements « … X Victor - Demo » ; défilement de la liste.

## S20 · f2695–2914 · Outro

- Pilule (logo 87 px) qui éclot (dépassement 100 px à f2707) + saisie, monte
  (f2731–f2752), CTA « Démarrez votre essai gratuit » (mots successifs), pointeur
  navy, tableau de l'app (version anglaise : People / Companies, European
  Companies 6512, Marketing Directors 100K+, CFOs 15K, Clara Beaumont, Matteo
  Ricciardi, Inès Valette…). Clics f2784 et f2800.

## S21 · f2915–3098 · URL

- Champ sombre 396×100 px centré (964,538), entrée en échelle 1,19 → 1
  (f2915–f2960), « www.lemlist.fr » tapé (f2918–f2937), curseur qui clignote
  (période 30 images, 15 allumées, à partir de f2961), lent flottement vertical.

---

## Références d'images utiles

| Besoin | Images |
|---|---|
| Fond clair propre | f2990, f0 (zones hors objets) |
| Fond sombre propre | f960, f1290 |
| Fond bleu propre | f2410 |
| Logo net (84 px) | f1787 |
| Avatars | f406 (Victor 74 px, prospecte 152 px), f988 (grand, gris), f1112 (fond rouge) |
| Site web au repos | f300 |
| Inbox au repos | f640 |
| Tableau de leads de face | f2110, f2158 |
| Séquence complète | f2380 |
| Outro au repos | f2865 |
