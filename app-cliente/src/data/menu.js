/* ============================================================
   Cardápio Summer Drinks
   Estrutura de cada categoria: { name, color, items }
   Cada item cru é [nome, preço, volume, descrição].
   ============================================================ */

const RAW = [
  {
    name: 'Especiais',
    color: '#f5a623',
    items: [
      ['Whisky Energético', 48, 'Copão 770ml', '02 doses de whisky + energético + gelo sabores (coco, maracujá, morango, melancia, maçã verde). Coco Leve.'],
      ['Ice Gin Sabores', 25, 'Copão 770ml', 'Ice de limão, Gin Theros, xarope de frutas (maracujá, melancia ou maçã verde) e gelo sabor. Coco Leve.'],
      ['Big Apple', 30, 'Copão 770ml', 'Bacardi Big Apple, vodka, refrigerante Citrus e gelo de maçã verde. Coco Leve.'],
      ['Rabo Quente', 35, 'Copão 770ml', 'Borda de sal e limão, tequila, vodka, maracujá, laranja, limão, pimenta, xarope simples e gelo.'],
      ['Tetê de ET', 28, 'Mamadeira 330ml', 'Leite extraterrestre à base de vodka, leite condensado e Yakult.'],
      ['Apple Martini', 32, 'Copão 770ml', 'Borda de sal e limão, Bacardi Big Apple, vodka, licor de laranja, xarope e gelo de maçã verde. Coco Leve.'],
      ['Salsa Twist', 30, 'Copão 770ml', 'Borda de sal e limão, Bacardi Big Apple, vodka, xarope de maçã verde, salsinha e gelo. Coco Leve.'],
    ],
  },
  {
    name: 'Balada',
    color: '#ff5da2',
    items: [
      ['Fuscão Rosa', 25, 'Copão 770ml', 'Corote de melancia, suco em pó de melancia, leite condensado, gelo de coco morango e picolé. Coco Leve.'],
      ['Ferrari', 25, 'Copão 770ml', 'Corote de morango, suco em pó de morango, leite condensado, picolé e gelo de coco morango. Coco Leve.'],
      ['Brasília Amarela', 25, 'Copão 770ml', 'Corote de maracujá, suco em pó de maracujá, leite condensado, Fanta Laranja, picolé e gelo de coco. Coco Leve.'],
      ['Chevette', 25, 'Copão 770ml', 'Corote de baunilha, suco em pó de baunilha c/ limão, leite condensado, picolé e gelo de coco. Coco Leve.'],
      ['Kombi Furiosa', 25, 'Copão 770ml', 'Corote de açaí c/ catuaba, suco em pó de uva, leite condensado, Fanta Uva, picolé e gelo de coco. Coco Leve.'],
      ['Opala Azul', 25, 'Copão 770ml', 'Corote de blueberry, suco em pó de baunilha c/ limão, leite condensado, Fanta Uva, picolé e gelo de coco. Coco Leve.'],
    ],
  },
  {
    name: 'Aperol',
    color: '#ff7a2f',
    items: [
      ['Aperol Spritz', 58, 'Copão 770ml', 'Aperol, Espumante Prosseco, Acqua Mix Soda, laranja e gelo.'],
      ['Aperol Ice Gin', 52, 'Copão 770ml', 'Aperol, Gin Apogee, Ice Ultra Spritz, laranja e gelo.'],
      ['Spaghetti', 45, 'Copão 770ml', 'Aperol, vodka, cerveja, suco de limão, laranja, copo encrustado com sal, limão e gelo.'],
    ],
  },
  {
    name: 'Campari',
    color: '#e23b3b',
    items: [
      ['Boulevardier', 42, 'Copão 550ml', 'Campari, whisky, Vermute Rosso, Bitter Angostura e gelo.'],
      ['Negroni', 35, 'Copão 550ml', 'Campari, Gin Apogee, Vermute Rosso, Bitter Angostura e gelo.'],
      ['Garibaldi', 32, 'Copo 550ml', 'Campari e suco de laranja.'],
    ],
  },
  {
    name: 'Batidinhas',
    color: '#b07be0',
    items: [
      ['Limonada das Neves', 28, 'Copão 770ml', 'Leite de coco, suco de limão, champanhe, vodka, leite condensado e gelo.'],
      ['Espanhola', 25, 'Copão 770ml', 'Vinho tinto, vodka, morango ou abacaxi ou maracujá, leite condensado e gelo.'],
      ['Frutas', 23, 'Copão 770ml', 'Champanhe, vodka, coco, morango ou maracujá, leite condensado e gelo.'],
      ['Abacaxi c/ Maçã Verde', 25, 'Copão 770ml', 'Rum, abacaxi, xarope de maçã verde, leite condensado e gelo.'],
      ['Abacaxi c/ Hortelã', 25, 'Copão 770ml', 'Champanhe, vodka, abacaxi, hortelã, leite condensado e gelo.'],
      ['Paçoquita', 30, 'Copão 770ml', 'Champanhe, vodka, leite condensado, doce de leite, paçoquinha e gelo.'],
    ],
  },
  {
    name: 'Caipirinhas',
    color: '#b6e84c',
    items: [
      ['Caipiroska', 25, 'Copão 550ml', 'Vodka, abacaxi, limão, morango ou maracujá.'],
      ['Caipirinha', 23, 'Copão 550ml', 'Cachaça, abacaxi, limão, morango ou maracujá.'],
      ['Caipirinha Gelo Água de Coco', 30, 'Copão 550ml', 'Vodka, limão, morango ou maracujá, xarope simples e gelo água de coco.'],
      ['Caipirinha Maracujá c/ Manjericão', 28, 'Copão 550ml', 'Vodka ou cachaça, maracujá, limão, manjericão, açúcar e gelo.'],
      ['CaipiCerva', 25, 'Copão 770ml', 'Caipirinha de cerveja c/ Vodka Orloff, limão, açúcar e gelo.'],
      ['CaipiRíssima Abacaxi c/ Hortelã', 28, 'Copão 550ml', 'Vodka, abacaxi, limão, açúcar, hortelã e gelo.'],
      ['Caipiroska Morango c/ Maracujá', 28, 'Copão 550ml', 'Vodka, morango, maracujá, limão, açúcar e gelo.'],
    ],
  },
  {
    name: 'Doses',
    color: '#4ccfd6',
    items: [
      ['Whisky', 25, 'Dose 100ml', ''],
      ['Tequila José Cuervo', 18, 'Dose', ''],
      ['Tequila Tequiloka', 8, 'Dose', ''],
      ['Campari', 20, 'Dose 100ml', ''],
      ['Conhaque', 15, 'Dose 100ml', ''],
      ['Licor de Morango', 20, 'Dose 100ml', ''],
      ['Licor Doce de Leite', 20, 'Dose 100ml', ''],
      ['Cachaça VB Gold', 7, 'Dose', ''],
      ['Chicletes Trident', 4.5, 'Unidade', ''],
      ['Corotes Sabores', 12, 'Unidade', ''],
      ['Gelo Coco Leve', 10, 'Unidade', ''],
      ['Red Bull', 20, 'Lata 250ml', ''],
      ['Monster', 16, 'Lata 250ml', ''],
    ],
  },
  {
    name: 'Potes',
    color: '#f0c14b',
    items: [
      ['Pote Whisky Premium', 148, 'Pote 1,8L', '06 doses de whisky Red Label, White Horse ou Ballantines + energético Power Bull, com 02 gelos sabores. Coco Leve.'],
      ['Pote Whisky Passaport', 129, 'Pote 1,8L', '06 doses de whisky Passaport ou Natu Nóbilis + energético Power Bull, com 02 gelos sabores. Coco Leve.'],
      ['Pote Gin ou Vodka', 123, 'Pote 1,8L', '06 doses de gin ou vodka + energético sabores (maçã verde, mango loko, melancia ou citrus) com 02 gelos. Coco Leve.'],
      ['Pote Corotes', 98, 'Pote 1,8L', '02 drinks Corotes: Chevette, Opala, Brasília, Ferrari, Fusca ou Kombi, com 02 gelos. Coco Leve.'],
    ],
  },
  {
    name: 'Baldes',
    color: '#6aa6ff',
    items: [
      ['Balde Whisky Premium', 178, 'Balde 2,2L', '10 doses Red Label, White Horse ou Ballantines + Power Bull, 04 copão 550ml + 04 gelos. Reutilize o balde e ganhe 10% na próxima compra.'],
      ['Balde Whisky Passaport', 156, 'Balde 2,2L', '10 doses Passaport ou Natu Nóbilis + Power Bull, 04 copão 550ml + 04 gelos. Reutilize e ganhe 10% na próxima compra.'],
      ['Balde Gin ou Vodka', 148, 'Balde 2,2L', '10 doses de gin ou vodka + energético sabores + 04 copão 550ml + 04 gelos. Reutilize e ganhe 10% na próxima compra.'],
      ['Balde Corotes', 115, 'Balde 2,2L', '04 drinks Corotes + 04 copão 550ml + 04 gelos. Reutilize o balde e ganhe 10% na próxima compra.'],
    ],
  },
];

/** Cardápio normalizado: cada item vira um objeto com id estável. */
export const MENU = RAW.map((cat, ci) => ({
  name: cat.name,
  color: cat.color,
  items: cat.items.map((it, ii) => ({
    id: ci + '-' + ii,
    n: it[0],
    p: it[1],
    v: it[2],
    d: it[3] || '',
    color: cat.color,
    cat: cat.name,
  })),
}));

/** Lista plana de todos os itens do cardápio. */
export const ALL_ITEMS = MENU.flatMap((c) => c.items);

const FEATURED_NAMES = [
  'Whisky Energético',
  'Aperol Spritz',
  'Rabo Quente',
  'Fuscão Rosa',
  'Caipirinha',
  'Tetê de ET',
];

/** Itens "Mais pedidas" (destaques do topo do cardápio). */
export const FEATURED = FEATURED_NAMES.map((name) =>
  ALL_ITEMS.find((i) => i.n === name),
).filter(Boolean);
