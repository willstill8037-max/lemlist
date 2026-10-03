// Every on-screen string of the video, exactly as it appears in the reference
// (line breaks preserved). Scenes import their copy from here.

export const content = {
  s01: { ok: 'OK' },
  s02: { sixty: '60.S', line: ['p', 'o', 'ur', ' ', 'vous', ' ', 'expliquer'] },
  s03: { word: 'Pourquoi', mark: '?' },
  pill: { brand: 'lemlist' },
  s06: {
    sender: 'Victor', email: 'Victor@gmail.com', button: 'Envoyer',
    body: ['Bonjour, je vous invite à découvrir notre solution innovante', 'qui pourrait transformer votre activité.'],
  },
  s07: { row: 'Découvrez notre solution', unread: '52 E-mails non lus', del: 'Supprimer', reply: 'Répondre' },
  s09: {
    etoui: ['Et', 'oui…'],
    a1: ['vous', ' ', 'n’êtes', ' ', 'plus'], a2: ['un.e', ' ', 'pro', ' ', 'de', ' ', 'la', ' ', 'vente'],
    b1: ['vous', ' ', 'êtes'], b2: ['ce', ' ', 'moustique'],
  },
  s11: { buzz: 'bzzzz' },
  s12: { exact: 'exactement', buzz: 'bzzzz', name: 'Emilie Paris', email: 'Emilie.P@gmail.com', body: 'Coucou c’est encore moi 👋' },
  s15: { line1: 'Vous contactez', line2: 'les bonnes personnes', title: 'Bonjour Victor, que voulez-vous faire ?', placeholder: 'Décrivez votre besoin...', button: 'Démarrer' },
  s16: { prompt: 'Trouve moi des CFOs B2B tech en France pour vendre ma solution', button: 'Démarrer' },
  s17: {
    tabs: [['Entreprises européennes', '6512', true], ['Directeurs marketing', '100K+', false], ['Directeurs financiers', '15K', false]],
    headers: [['Nom complet', -443], ['E-mail', -47], ['Téléphone', 312], ['Dernier signal détecté', 734], ['Entreprise', 1496]],
    rows: [
      { name: 'Claire Dubois', email: 'claire.d@acme.co', phone: '+33 6 12 34 56 78', signal: 'A annoncé sa récente levée de fonds', dot: 'indigo', company: 'Acme', logoColor: '#4b2d5c', hair: '#1c1412' },
      { name: 'Julien Moreau', email: 'Aucun e-mail trouvé', phone: '+33 6 87 65 43 21', signal: 'lemlist recrute un nouveau développeur', dot: 'purple', company: 'Pa', logoColor: '#111', hair: '#4a3022' },
      { name: 'Élodie Moreau', email: 'elodie.m@procter-g...', phone: 'TROUVER TÉLÉPHONE', signal: 'Amazon recrute des chefs de produit', dot: 'red', company: 'Procter & Gamble', logoColor: '#1d4fa8', hair: '#5a3b1f' },
      { name: 'Antoine Lefevre', email: 'TROUVER E-MAIL', phone: 'TROUVER TÉLÉPHONE', signal: 'John a laissé un commentaire négatif...', dot: 'yellow', company: 'The North Face', logoColor: '#d62b2b', hair: '#6b5446' },
      { name: 'Sophie Laurent', email: 'TROUVER E-MAIL', phone: 'Aucun téléphone trouvé', signal: 'Mickael de Meta a téléchargé un ebook', dot: 'pink', company: 'Dyson', logoColor: '#111', hair: '#3d281c' },
      { name: 'Lucas Dubois', email: 'Aucun e-mail trouvé', phone: '+33 6 98 76 54 32', signal: 'Charles a interagi avec votre publicatio...', dot: 'blue', company: 'NASA', logoColor: '#1e3b8f', hair: '#2b2420' },
      { name: 'Camille Lefevre', email: 'camille.l@huawei.fr', phone: 'TROUVER TÉLÉPHONE', signal: 'Un prospect a aimé votre publication LinkedIn', dot: 'green', company: 'Huawei', logoColor: '#d8262c', hair: '#6a3d24' },
      { name: 'Mathieu Laurent', email: 'TROUVER E-MAIL', phone: 'TROUVER TÉLÉPHONE', signal: 'Paul de Swan a été promu VP des vent...', dot: 'orange', company: 'WWF', logoColor: '#222', hair: '#3a2a22' },
      { name: 'Pierre Garnier', email: 'pierre.g@pepsi.com', phone: '+33 6 23 45 67 89', signal: 'Un employé de Scaleway a visité votre...', dot: 'indigo', company: 'Pepsi', logoColor: '#1b4fa0', hair: '#4b3a2a' },
    ],
  },
  s18: {
    signal: 'A annoncé sa récente levée de fonds',
    email: ['Bonjour Claire,', '', 'Félicitations pour votre récente levée et votre', 'expansion aux US !', '', 'Lever des fonds, c’est bien. Les perdre en frais de', 'change, moins.', '', 'Des boîtes comme Globex ont économisé +50k€/an', 'en optimisant leur gestion USD/EUR.'],
    from: 'Victor', to: 'to : Claire Dubois', subject: 'Éviter les doubles frais USD/EUR',
  },
  s19: { word: 'Résultat' },
  website: {
    headline: ['La plateforme pour faire de l’outbound avec', 'précision grâce à l’IA'],
    subtitle: [
      'Nos agents IA détectent les signaux d’achat, enrichissent vos leads et analysent vos comptes pour que vos commerciaux',
      'engagent chaque prospect avec le bon message, sur LinkedIn, par email et par téléphone.',
    ],
    cta: 'Essayez gratuitement pendant 14 jours',
    nav: ['Produit', 'Pour qui ?', 'L’outbound qui marche', 'Tarifs', 'On recrute !', 'Connexion', 'Démo', 'Essai gratuit'],
    badges: ['4.6 / 5', '4.6 / 5', 'SOC 2 Type II certified'],
  },
};
