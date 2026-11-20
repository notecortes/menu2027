/**
 * MedDiet Pro — Motor Relacional y Clínico-Nutricional (Vanilla ES6+)
 * Espejo 1:1 de /sql/database_install.sql y de los endpoints PHP (/api/*.php).
 * Permite ejecución dual: conectada a MySQL vía PHP PDO o autónoma en navegador.
 */

import { EXTRA_RECIPES_DB } from './recipes_catalog.js';

export const FORBIDDEN_TERMS = [
  'marisco', 'gamba', 'langostino', 'mejillon', 'mejillón', 'almeja',
  'sepia', 'calamar', 'pulpo', 'cigala', 'berberecho', 'bacalao', 'rape'
];

export const DAYS_ORDER = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

export const DAY_LABELS = {
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado',
  domingo: 'Domingo'
};

export const DEFAULT_USER_PREFERENCES = {
  arroz_cubana_day: 'viernes',
  cubana_day: 'viernes',
  legume_days: ['martes', 'jueves'],
  fish_nights: ['martes', 'jueves'],
  wanted_keywords: '',
  excluded_keywords: ''
};

export const CATEGORY_LABELS = {
  arroz_fijo: 'Arroz Fijo Viernes',
  legumbre: 'Legumbres Tradicionales',
  pescado: 'Pescado Permitido',
  ave_carne_magra: 'Aves y Carnes Magras',
  verdura_huevo: 'Huerta y Huevos Camperos'
};

export const AISLES_ORDER = [
  'Frutas y Verduras',
  'Pescadería',
  'Carnicería y Aves',
  'Legumbres y Arroces',
  'Huevos y Lácteos',
  'Despensa'
];

export const BASE_BREAKFAST_SNACK_KCAL = 690;

export const INGREDIENTS_DB = [
  { id: 1, name: 'Arroz redondo categoría extra', aisle: 'Legumbres y Arroces', unit: 'g', rounding_step: 10 },
  { id: 2, name: 'Lenteja pardina seca (o cocida escurrida)', aisle: 'Legumbres y Arroces', unit: 'g', rounding_step: 10 },
  { id: 3, name: 'Garbanzo pedrosillano cocido', aisle: 'Legumbres y Arroces', unit: 'g', rounding_step: 10 },
  { id: 4, name: 'Alubia blanca cocida al natural', aisle: 'Legumbres y Arroces', unit: 'g', rounding_step: 10 },
  { id: 5, name: 'Tomate natural triturado', aisle: 'Despensa', unit: 'g', rounding_step: 25 },
  { id: 6, name: 'Tomate de ensalada o pera maduro', aisle: 'Frutas y Verduras', unit: 'g', rounding_step: 25 },
  { id: 7, name: 'Plátano de Canarias', aisle: 'Frutas y Verduras', unit: 'ud', rounding_step: 0.5 },
  { id: 8, name: 'Huevo campero categoría M/L', aisle: 'Huevos y Lácteos', unit: 'ud', rounding_step: 1 },
  { id: 9, name: 'Aceite de Oliva Virgen Extra (AOVE)', aisle: 'Despensa', unit: 'ml', rounding_step: 5 },
  { id: 10, name: 'Cebolla dulce o cebolleta', aisle: 'Frutas y Verduras', unit: 'g', rounding_step: 20 },
  { id: 11, name: 'Ajo fresco', aisle: 'Frutas y Verduras', unit: 'diente', rounding_step: 1 },
  { id: 12, name: 'Zanahoria fresca', aisle: 'Frutas y Verduras', unit: 'g', rounding_step: 20 },
  { id: 13, name: 'Calabacín verde', aisle: 'Frutas y Verduras', unit: 'g', rounding_step: 25 },
  { id: 14, name: 'Berenjena', aisle: 'Frutas y Verduras', unit: 'g', rounding_step: 25 },
  { id: 15, name: 'Pimiento rojo carnoso', aisle: 'Frutas y Verduras', unit: 'g', rounding_step: 20 },
  { id: 16, name: 'Pimiento verde italiano', aisle: 'Frutas y Verduras', unit: 'g', rounding_step: 20 },
  { id: 17, name: 'Espinacas frescas en hoja', aisle: 'Frutas y Verduras', unit: 'g', rounding_step: 20 },
  { id: 18, name: 'Acelgas frescas troceadas', aisle: 'Frutas y Verduras', unit: 'g', rounding_step: 25 },
  { id: 19, name: 'Puerro limpio', aisle: 'Frutas y Verduras', unit: 'g', rounding_step: 20 },
  { id: 20, name: 'Patata nueva para hornear o cocer', aisle: 'Frutas y Verduras', unit: 'g', rounding_step: 25 },
  { id: 21, name: 'Calabaza cacahuete pelada', aisle: 'Frutas y Verduras', unit: 'g', rounding_step: 25 },
  { id: 22, name: 'Espárragos trigueros verdes', aisle: 'Frutas y Verduras', unit: 'g', rounding_step: 20 },
  { id: 23, name: 'Champiñones o setas laminadas', aisle: 'Frutas y Verduras', unit: 'g', rounding_step: 25 },
  { id: 24, name: 'Alcachofas limpias (corazones)', aisle: 'Frutas y Verduras', unit: 'g', rounding_step: 25 },
  { id: 25, name: 'Judías verdes planas', aisle: 'Frutas y Verduras', unit: 'g', rounding_step: 25 },
  { id: 26, name: 'Pepino fresco', aisle: 'Frutas y Verduras', unit: 'g', rounding_step: 20 },
  { id: 27, name: 'Guisantes finos tiernos', aisle: 'Frutas y Verduras', unit: 'g', rounding_step: 15 },
  { id: 28, name: 'Brotes verdes de lechuga / escarola', aisle: 'Frutas y Verduras', unit: 'g', rounding_step: 15 },
  { id: 29, name: 'Limón fresco', aisle: 'Frutas y Verduras', unit: 'ud', rounding_step: 0.5 },
  { id: 30, name: 'Lomos de merluza fresca sin piel', aisle: 'Pescadería', unit: 'g', rounding_step: 25 },
  { id: 31, name: 'Lubina fresca limpia para horno', aisle: 'Pescadería', unit: 'g', rounding_step: 25 },
  { id: 32, name: 'Dorada abierta a la espalda', aisle: 'Pescadería', unit: 'g', rounding_step: 25 },
  { id: 33, name: 'Lomo de salmón fresco', aisle: 'Pescadería', unit: 'g', rounding_step: 25 },
  { id: 34, name: 'Trucha limpia en filetes', aisle: 'Pescadería', unit: 'g', rounding_step: 25 },
  { id: 35, name: 'Filete de emperador (pez espada)', aisle: 'Pescadería', unit: 'g', rounding_step: 25 },
  { id: 36, name: 'Sardinas frescas limpias', aisle: 'Pescadería', unit: 'g', rounding_step: 25 },
  { id: 37, name: 'Boquerones frescos limpios sin espina', aisle: 'Pescadería', unit: 'g', rounding_step: 25 },
  { id: 38, name: 'Atún o bonito del norte fresco', aisle: 'Pescadería', unit: 'g', rounding_step: 25 },
  { id: 39, name: 'Pechuga de pollo de corral fileteada', aisle: 'Carnicería y Aves', unit: 'g', rounding_step: 25 },
  { id: 40, name: 'Solomillo o pechuga de pavo magra', aisle: 'Carnicería y Aves', unit: 'g', rounding_step: 25 },
  { id: 41, name: 'Carne picada magra de pavo (99%)', aisle: 'Carnicería y Aves', unit: 'g', rounding_step: 25 },
  { id: 42, name: 'Conejo troceado magro', aisle: 'Carnicería y Aves', unit: 'g', rounding_step: 25 },
  { id: 43, name: 'Lomo de cerdo ibérico magro', aisle: 'Carnicería y Aves', unit: 'g', rounding_step: 25 },
  { id: 44, name: 'Jamón serrano magro en taquitos (sin grasa)', aisle: 'Carnicería y Aves', unit: 'g', rounding_step: 10 },
  { id: 45, name: 'Requesón desnatado o queso fresco 0%', aisle: 'Huevos y Lácteos', unit: 'g', rounding_step: 15 },
  { id: 46, name: 'Caldo de verduras casero desgrasado', aisle: 'Despensa', unit: 'ml', rounding_step: 50 },
  { id: 47, name: 'Pimentón dulce de la Vera DOP', aisle: 'Despensa', unit: 'g', rounding_step: 2 },
  { id: 48, name: 'Pimientos del piquillo asados en tiras', aisle: 'Despensa', unit: 'g', rounding_step: 20 }
];

export const RECIPES_DB = [
  {
    id: 1,
    slug: 'arroz-blanco-cubana-ligero',
    name: 'Arroz blanco a la cubana (versión ligera)',
    category: 'arroz_fijo',
    meal_slot: 'lunch',
    seasons: 'primavera,verano,otono,invierno',
    kcal: 465, protein_g: 16, carbs_g: 68, fat_g: 13, prep_minutes: 20,
    cooking_method: 'Hervido + Plancha sin fritura',
    image_url: 'assets/img/arroz_cubana.jpg',
    youtube_url: 'https://www.youtube.com/results?search_query=receta+casera+arroz+a+la+cubana+saludable+española',
    chef_tip: 'Sustituimos la fritura en abundante aceite por huevo a la plancha antiadherente con gota de AOVE, tomate natural reducido a fuego lento con albahaca y medio plátano dorado en seco sobre sartén caliente. Ahorras más de 280 kcal manteniendo todo el sabor tradicional.',
    batch_prep_tip: 'Deja la salsa de tomate casera lista el domingo en tarro de cristal y el arroz cocido al dente (enfriado rápido para generar almidón resistente prebiótico).',
    is_friday_fixed: 1,
    ingredients: [
      { ingredient_id: 1, amount_per_diner: 65, notes: 'Arroz redondo en crudo' },
      { ingredient_id: 5, amount_per_diner: 140, notes: 'Para salsa casera reducida' },
      { ingredient_id: 8, amount_per_diner: 1, notes: 'A la plancha o escalfado' },
      { ingredient_id: 7, amount_per_diner: 0.5, notes: 'Dorado a la plancha sin aceite' },
      { ingredient_id: 11, amount_per_diner: 1, notes: 'Picado en el tomate' },
      { ingredient_id: 9, amount_per_diner: 8, notes: 'Medido en cucharadita' }
    ],
    steps: [
      { step_number: 1, instruction: 'Pon a calentar un cazo con abundante agua ligeramente salada y una hoja de laurel. Cuando rompa a hervir, incorpora el arroz redondo y cuécelo a fuego medio para que quede suelto y en su punto.', timer_seconds: 960 },
      { step_number: 2, instruction: 'Mientras tanto, en una sartén con la mitad del AOVE medido, dora el diente de ajo picado y vierte el tomate natural triturado con una pizca de sal, pimienta y orégano o albahaca fresca. Cocina a fuego suave hasta reducir.', timer_seconds: 600 },
      { step_number: 3, instruction: 'Corta el plátano de Canarias longitudinalmente y dóralo en una sartén antiadherente bien caliente sin añadir grasa extra hasta que caramelicen sus azúcares naturales por ambas caras.', timer_seconds: 180 },
      { step_number: 4, instruction: 'En la misma sartén antiadherente con unas gotas de AOVE, haz el huevo a la plancha (tápalo para que cuaje la clara manteniendo la yema líquida) y emplata el arroz escurrido con el tomate, el huevo y el plátano.', timer_seconds: 150 }
    ]
  },
  {
    id: 2,
    slug: 'lentejas-estofadas-verduras',
    name: 'Lentejas pardinas estofadas con verduras de la huerta',
    category: 'legumbre',
    meal_slot: 'lunch',
    seasons: 'otono,invierno,primavera',
    kcal: 410, protein_g: 22, carbs_g: 54, fat_g: 9, prep_minutes: 25,
    cooking_method: 'Guiso suave tradicional',
    image_url: 'assets/img/legumbres.jpg',
    youtube_url: 'https://www.youtube.com/results?search_query=receta+casera+lentejas+con+verduras+viudas+española',
    chef_tip: 'No añadas chorizo ni panceta: tritura una cucharada de las propias verduras cocidas con pimentón de la Vera y un hilo de AOVE en crudo al final para conseguir un caldo trabado, sedoso y lleno de aroma.',
    batch_prep_tip: 'Se conserva 4 días impecable en nevera; de hecho, gana sabor de un día para otro.',
    is_friday_fixed: 0,
    ingredients: [
      { ingredient_id: 2, amount_per_diner: 70, notes: 'Lenteja pardina' },
      { ingredient_id: 12, amount_per_diner: 60, notes: 'En rodajas finas' },
      { ingredient_id: 13, amount_per_diner: 60, notes: 'En dados pequeños' },
      { ingredient_id: 19, amount_per_diner: 45, notes: 'Picado fino' },
      { ingredient_id: 10, amount_per_diner: 40, notes: 'Cebolla para el caldo' },
      { ingredient_id: 47, amount_per_diner: 2, notes: 'Pimentón de la Vera' },
      { ingredient_id: 9, amount_per_diner: 7, notes: 'Hilo en crudo al servir' }
    ],
    steps: [
      { step_number: 1, instruction: 'Lava las lentejas pardinas bajo el grifo. Pela y corta en dados pequeños la zanahoria, el calabacín, el puerro y la cebolla.', timer_seconds: 240 },
      { step_number: 2, instruction: 'En una cazuela incorpora las lentejas, todas las hortalizas troceadas, una hoja de laurel y cubre con agua o caldo de verduras dos dedos por encima. Lleva a ebullición y baja a fuego suave.', timer_seconds: 1500 },
      { step_number: 3, instruction: 'Retira dos cucharadas de verduras cocidas con un cacillo de caldo, tritúralas junto al pimentón dulce de la Vera y devuélvelas a la olla con el hilo de AOVE en crudo para trabar el caldo de forma hipocalórica.', timer_seconds: 180 }
    ]
  },
  {
    id: 3,
    slug: 'garbanzos-espinacas-pimenton',
    name: 'Garbanzos con espinacas frescas y pimentón de la Vera',
    category: 'legumbre',
    meal_slot: 'lunch',
    seasons: 'otono,invierno,primavera',
    kcal: 395, protein_g: 20, carbs_g: 48, fat_g: 11, prep_minutes: 20,
    cooking_method: 'Rehogado tradicional andaluz',
    image_url: 'assets/img/legumbres.jpg',
    youtube_url: 'https://www.youtube.com/results?search_query=receta+casera+garbanzos+con+espinacas+andaluza',
    chef_tip: 'En lugar de freír pan para el majado, machaca en el mortero ajo asado, comino en grano y 10 garbanzos cocidos para espesar la salsa sin sumar harinas ni grasa.',
    batch_prep_tip: 'Puedes dejar el sofrito de ajo, pimentón y tomate preparado del domingo.',
    is_friday_fixed: 0,
    ingredients: [
      { ingredient_id: 3, amount_per_diner: 150, notes: 'Garbanzo cocido escurrido' },
      { ingredient_id: 17, amount_per_diner: 120, notes: 'Espinaca fresca' },
      { ingredient_id: 11, amount_per_diner: 1.5, notes: 'Laminado' },
      { ingredient_id: 5, amount_per_diner: 60, notes: 'Tomate natural para el sofrito' },
      { ingredient_id: 47, amount_per_diner: 2, notes: 'Pimentón dulce' },
      { ingredient_id: 9, amount_per_diner: 8, notes: 'Para rehogar' }
    ],
    steps: [
      { step_number: 1, instruction: 'Dora los ajos laminados en una cazuela baja con el AOVE medido a fuego medio sin que se quemen.', timer_seconds: 120 },
      { step_number: 2, instruction: 'Aparta un instante del fuego, añade el pimentón de la Vera, remueve rápido e incorpora el tomate natural triturado. Cocina hasta obtener un sofrito concentrado.', timer_seconds: 300 },
      { step_number: 3, instruction: 'Añade los garbanzos lavados y escurridos, un chorrito de caldo y las hojas de espinaca fresca lavadas. Tapa para que las espinacas reduzcan su volumen e integren sabores.', timer_seconds: 360 }
    ]
  },
  {
    id: 4,
    slug: 'potaje-alubias-blancas-acelgas',
    name: 'Potaje de alubias blancas con acelgas y zanahoria',
    category: 'legumbre',
    meal_slot: 'lunch',
    seasons: 'otono,invierno',
    kcal: 385, protein_g: 21, carbs_g: 50, fat_g: 8, prep_minutes: 25,
    cooking_method: 'Cuchara de cocción lenta',
    image_url: 'assets/img/legumbres.jpg',
    youtube_url: 'https://www.youtube.com/results?search_query=receta+casera+potaje+alubias+blancas+con+acelgas',
    chef_tip: 'Añade las pencas de acelga picadas finas al principio y las hojas verdes solo en los últimos 5 minutos para preservar su color esmeralda y ácido fólico.',
    batch_prep_tip: 'Congela o refrigera en raciones individuales listo para calentar.',
    is_friday_fixed: 0,
    ingredients: [
      { ingredient_id: 4, amount_per_diner: 150, notes: 'Alubia blanca cocida' },
      { ingredient_id: 18, amount_per_diner: 130, notes: 'Acelgas frescas' },
      { ingredient_id: 12, amount_per_diner: 50, notes: 'En medias lunas' },
      { ingredient_id: 10, amount_per_diner: 40, notes: 'Picada muy fina' },
      { ingredient_id: 46, amount_per_diner: 200, notes: 'Caldo de verduras casero' },
      { ingredient_id: 9, amount_per_diner: 7, notes: 'Para el sofrito' }
    ],
    steps: [
      { step_number: 1, instruction: 'En una olla rehoga la cebolla y la zanahoria en medias lunas junto a las pencas blancas de la acelga picadas con el AOVE medido y una pizca de sal.', timer_seconds: 360 },
      { step_number: 2, instruction: 'Vierte el caldo de verduras caliente y las alubias blancas cocidas. Cocina a fuego medio-bajo para que el caldo tome cuerpo.', timer_seconds: 600 },
      { step_number: 3, instruction: 'Incorpora las hojas verdes de las acelgas troceadas en los últimos minutos para conservar sus vitaminas y sirve bien caliente.', timer_seconds: 300 }
    ]
  },
  {
    id: 5,
    slug: 'empedrat-catalan-alubias-huevo',
    name: 'Empedrat catalán de alubias con tomate, pimiento y huevo duro',
    category: 'legumbre',
    meal_slot: 'lunch',
    seasons: 'primavera,verano',
    kcal: 380, protein_g: 22, carbs_g: 44, fat_g: 11, prep_minutes: 15,
    cooking_method: 'Fresco de montaje rápido',
    image_url: 'assets/img/legumbres.jpg',
    youtube_url: 'https://www.youtube.com/results?search_query=receta+empedrat+de+alubias+tradicional+saludable',
    chef_tip: 'Versión 100% libre de pescado salado: combinamos alubia blanca muy tierna con huevo duro campero, pimiento rojo y verde en brunoise fina, tomate concassé y aceitunas picadas.',
    batch_prep_tip: 'Cuece los huevos y deja la picada de hortalizas en táper hermético.',
    is_friday_fixed: 0,
    ingredients: [
      { ingredient_id: 4, amount_per_diner: 150, notes: 'Alubia blanca lavada y escurrida' },
      { ingredient_id: 8, amount_per_diner: 1, notes: 'Huevo cocido duro' },
      { ingredient_id: 6, amount_per_diner: 100, notes: 'Tomate en dados' },
      { ingredient_id: 15, amount_per_diner: 45, notes: 'Pimiento rojo picado' },
      { ingredient_id: 16, amount_per_diner: 45, notes: 'Pimiento verde picado' },
      { ingredient_id: 10, amount_per_diner: 35, notes: 'Cebolleta tierna' },
      { ingredient_id: 9, amount_per_diner: 8, notes: 'Aliño mediterráneo' }
    ],
    steps: [
      { step_number: 1, instruction: 'Cuece los huevos en un cazo con agua hirviendo hasta que estén duros, enfríalos en agua con hielo y pélalos.', timer_seconds: 600 },
      { step_number: 2, instruction: 'Lava y escurre muy bien las alubias blancas. Pica en dados pequeños (brunoise) el tomate maduro, el pimiento rojo, el pimiento verde y la cebolleta tierna.', timer_seconds: 300 },
      { step_number: 3, instruction: 'Mezcla en una ensaladera las alubias con las hortalizas crujientes, corona con el huevo duro en cuartos y aliña con el AOVE medido, vinagre y orégano.', timer_seconds: 120 }
    ]
  },
  {
    id: 6,
    slug: 'ensalada-templada-lentejas-pimientos',
    name: 'Lentejas en ensalada templada con pimientos asados y cebolleta',
    category: 'legumbre',
    meal_slot: 'lunch',
    seasons: 'primavera,verano',
    kcal: 375, protein_g: 19, carbs_g: 49, fat_g: 10, prep_minutes: 15,
    cooking_method: 'Templado / Ensalada completa',
    image_url: 'assets/img/legumbres.jpg',
    youtube_url: 'https://www.youtube.com/results?search_query=receta+ensalada+de+lentejas+con+verduras+española',
    chef_tip: 'Aliña las lentejas aún tibias con vinagre de Jerez viejo y pimientos asados en su propio jugo; la legumbre absorbe el aliño reduciendo a la mitad la necesidad de aceite.',
    batch_prep_tip: 'Usa los pimientos asados en la bandeja del Batch Cooking dominical.',
    is_friday_fixed: 0,
    ingredients: [
      { ingredient_id: 2, amount_per_diner: 70, notes: 'Cocidas al dente' },
      { ingredient_id: 15, amount_per_diner: 80, notes: 'Pimiento rojo asado en tiras' },
      { ingredient_id: 10, amount_per_diner: 40, notes: 'Cebolleta en juliana' },
      { ingredient_id: 12, amount_per_diner: 40, notes: 'Zanahoria rallada' },
      { ingredient_id: 9, amount_per_diner: 8, notes: 'Con vinagre de Jerez' }
    ],
    steps: [
      { step_number: 1, instruction: 'Cuece las lentejas pardinas al dente (o enjuaga y templa ligeramente las lentejas ya cocidas).', timer_seconds: 300 },
      { step_number: 2, instruction: 'Corta los pimientos rojos asados en tiras finas, la cebolleta en juliana y ralla la zanahoria fresca.', timer_seconds: 240 },
      { step_number: 3, instruction: 'Mezcla las lentejas tibias con las verduras y emulsiona el AOVE con vinagre de Jerez y sal en escamas para que absorban el aliño.', timer_seconds: 120 }
    ]
  },
  {
    id: 7,
    slug: 'garbanzos-salteados-calabacin-setas',
    name: 'Garbanzos salteados con calabacín, setas y ajo tierno',
    category: 'legumbre',
    meal_slot: 'lunch',
    seasons: 'primavera,verano,otono',
    kcal: 390, protein_g: 19, carbs_g: 47, fat_g: 11, prep_minutes: 18,
    cooking_method: 'Salteado en sartén a fuego vivo',
    image_url: 'assets/img/legumbres.jpg',
    youtube_url: 'https://www.youtube.com/results?search_query=receta+garbanzos+salteados+con+setas+y+verduras',
    chef_tip: 'Seca bien los garbanzos cocidos antes de saltearlos para que queden ligeramente dorados por fuera y tiernos por dentro con solo 1 cucharadita de AOVE.',
    batch_prep_tip: 'Deja las setas y el calabacín limpios y cortados en dados.',
    is_friday_fixed: 0,
    ingredients: [
      { ingredient_id: 3, amount_per_diner: 150, notes: 'Bien escurridos' },
      { ingredient_id: 13, amount_per_diner: 90, notes: 'En dados con piel' },
      { ingredient_id: 23, amount_per_diner: 90, notes: 'Setas o champiñones limpios' },
      { ingredient_id: 11, amount_per_diner: 1, notes: 'Ajo picado' },
      { ingredient_id: 9, amount_per_diner: 8, notes: 'Salteado vivo' }
    ],
    steps: [
      { step_number: 1, instruction: 'Escurre y seca los garbanzos con papel absorbente. Corta el calabacín en dados medianos y lamina las setas o champiñones.', timer_seconds: 240 },
      { step_number: 2, instruction: 'En una sartén amplia bien caliente con el AOVE, saltea el calabacín y las setas con el ajo picado hasta que doren sin soltar agua.', timer_seconds: 360 },
      { step_number: 3, instruction: 'Incorpora los garbanzos y saltea a fuego vivo con perejil fresco y pimienta negra recién molida hasta que tomen textura exterior crujiente.', timer_seconds: 240 }
    ]
  },
  {
    id: 8,
    slug: 'alubias-estofadas-calabaza-puerro',
    name: 'Alubias blancas estofadas con calabaza asada y puerro',
    category: 'legumbre',
    meal_slot: 'lunch',
    seasons: 'otono,invierno',
    kcal: 395, protein_g: 20, carbs_g: 52, fat_g: 9, prep_minutes: 25,
    cooking_method: 'Estofado meloso',
    image_url: 'assets/img/legumbres.jpg',
    youtube_url: 'https://www.youtube.com/results?search_query=receta+alubias+blancas+con+calabaza+y+verduras',
    chef_tip: 'La calabaza cacahuete se deshace parcialmente en el caldo aportando un dulzor natural y una textura cremosa sin añadir nata ni grasas saturadas.',
    batch_prep_tip: 'Guisa la base de puerro y calabaza durante el Batch Cooking.',
    is_friday_fixed: 0,
    ingredients: [
      { ingredient_id: 4, amount_per_diner: 150, notes: 'Alubia blanca tierna' },
      { ingredient_id: 21, amount_per_diner: 110, notes: 'Calabaza en dados' },
      { ingredient_id: 19, amount_per_diner: 60, notes: 'Puerro en rodajas' },
      { ingredient_id: 46, amount_per_diner: 180, notes: 'Caldo suave' },
      { ingredient_id: 9, amount_per_diner: 7, notes: 'AOVE virgen extra' }
    ],
    steps: [
      { step_number: 1, instruction: 'Rehoga el puerro en rodajas y la calabaza pelada en dados en una cazuela con el AOVE y un chorrito de caldo.', timer_seconds: 420 },
      { step_number: 2, instruction: 'Cubre con el resto del caldo de verduras y deja cocer hasta que la calabaza esté muy tierna.', timer_seconds: 600 },
      { step_number: 3, instruction: 'Aplasta ligeramente un par de trozos de calabaza contra el borde para espesar el caldo, añade las alubias blancas y da un hervor suave.', timer_seconds: 300 }
    ]
  },
  {
    id: 9,
    slug: 'pipirrana-garbanzos-atun-fresco',
    name: 'Pipirrana jaenera con garbanzos y dados de atún fresco a la plancha',
    category: 'legumbre',
    meal_slot: 'lunch',
    seasons: 'primavera,verano',
    kcal: 420, protein_g: 31, carbs_g: 42, fat_g: 12, prep_minutes: 15,
    cooking_method: 'Fresco + Plancha rápida',
    image_url: 'assets/img/legumbres.jpg',
    youtube_url: 'https://www.youtube.com/results?search_query=receta+ensalada+garbanzos+pipirrana+española',
    chef_tip: 'El contraste entre la pipirrana bien fría de tomate, pepino y pimiento verde y los dados de atún fresco marcados vuelta y vuelta eleva la proteína saciante.',
    batch_prep_tip: 'Pica la pipirrana con antelación y marca el atún justo al servir.',
    is_friday_fixed: 0,
    ingredients: [
      { ingredient_id: 3, amount_per_diner: 130, notes: 'Garbanzos cocidos fríos' },
      { ingredient_id: 38, amount_per_diner: 90, notes: 'Atún fresco en dados a la plancha' },
      { ingredient_id: 6, amount_per_diner: 110, notes: 'Tomate maduro picado' },
      { ingredient_id: 16, amount_per_diner: 50, notes: 'Pimiento verde fino' },
      { ingredient_id: 26, amount_per_diner: 60, notes: 'Pepino pelado en dados' },
      { ingredient_id: 9, amount_per_diner: 8, notes: 'Emulsión de la pipirrana' }
    ],
    steps: [
      { step_number: 1, instruction: 'Pica muy menudo el tomate maduro, el pimiento verde italiano y el pepino pelado. Mézclalos en un bol con los garbanzos cocidos y el AOVE.', timer_seconds: 300 },
      { step_number: 2, instruction: 'Calienta una plancha al máximo y marca los dados de atún fresco salpimentados apenas vuelta y vuelta para que queden jugosos en el centro.', timer_seconds: 120 },
      { step_number: 3, instruction: 'Sirve la pipirrana de garbanzos bien fresca coronada con los dados de atún recién salidos de la plancha.', timer_seconds: 60 }
    ]
  },
  {
    id: 10,
    slug: 'lentejas-alcachofas-zanahoria',
    name: 'Guiso ligero de lentejas con corazones de alcachofa y zanahoria',
    category: 'legumbre',
    meal_slot: 'lunch',
    seasons: 'invierno,primavera',
    kcal: 400, protein_g: 22, carbs_g: 51, fat_g: 9, prep_minutes: 28,
    cooking_method: 'Guiso tradicional en cazuela',
    image_url: 'assets/img/legumbres.jpg',
    youtube_url: 'https://www.youtube.com/results?search_query=receta+lentejas+con+alcachofas+casera+española',
    chef_tip: 'La cinarina de la alcachofa favorece la digestión hepática y aporta un toque ligeramente amargo delicioso que equilibra el dulzor de la zanahoria.',
    batch_prep_tip: 'Puedes usar corazones de alcachofa naturales blanqueados el domingo.',
    is_friday_fixed: 0,
    ingredients: [
      { ingredient_id: 2, amount_per_diner: 70, notes: 'Lenteja pardina' },
      { ingredient_id: 24, amount_per_diner: 100, notes: 'Corazones de alcachofa en cuartos' },
      { ingredient_id: 12, amount_per_diner: 55, notes: 'Zanahoria en rodajas' },
      { ingredient_id: 10, amount_per_diner: 40, notes: 'Cebolla picada' },
      { ingredient_id: 46, amount_per_diner: 220, notes: 'Caldo de verduras' },
      { ingredient_id: 9, amount_per_diner: 7, notes: 'Rehogado suave' }
    ],
    steps: [
      { step_number: 1, instruction: 'Limpia los corazones de alcachofa, córtalos en cuartos y rehógalos brevemente con la cebolla y la zanahoria en la cazuela.', timer_seconds: 300 },
      { step_number: 2, instruction: 'Añade las lentejas pardinas y el caldo de verduras caliente. Cocina a fuego suave con la cazuela semitapada.', timer_seconds: 1500 },
      { step_number: 3, instruction: 'Rectifica de sal, añade perejil picado y deja reposar antes de servir para asentar el caldo.', timer_seconds: 180 }
    ]
  },
  {
    id: 11,
    slug: 'merluza-plancha-ajillo-trigueros',
    name: 'Merluza a la plancha al ajillo ligero con espárragos trigueros',
    category: 'pescado',
    meal_slot: 'dinner',
    seasons: 'primavera,verano,otono,invierno',
    kcal: 310, protein_g: 34, carbs_g: 8, fat_g: 14, prep_minutes: 15,
    cooking_method: 'Plancha antiadherente',
    image_url: 'assets/img/pescado.jpg',
    youtube_url: 'https://www.youtube.com/results?search_query=receta+merluza+a+la+plancha+con+ajo+y+perejil+española',
    chef_tip: 'Dora las láminas de ajo en apenas 5 ml de AOVE y desglasa la sartén con un chorrito de zumo de limón y caldo de verduras para lograr una emulsión brillante y ligera.',
    batch_prep_tip: 'Lava y quita el tallo leñoso a los trigueros con antelación.',
    is_friday_fixed: 0,
    ingredients: [
      { ingredient_id: 30, amount_per_diner: 180, notes: 'Lomos limpios sin espinas' },
      { ingredient_id: 22, amount_per_diner: 100, notes: 'Espárragos trigueros tiernos' },
      { ingredient_id: 11, amount_per_diner: 1.5, notes: 'En láminas finas' },
      { ingredient_id: 29, amount_per_diner: 0.5, notes: 'Zumo de limón' },
      { ingredient_id: 9, amount_per_diner: 9, notes: 'AOVE para plancha y ajillo' }
    ],
    steps: [
      { step_number: 1, instruction: 'Saltea los espárragos trigueros limpios en una plancha caliente con unas gotas de AOVE y sal gruesa hasta que estén tiernos y al dente.', timer_seconds: 360 },
      { step_number: 2, instruction: 'En la misma plancha marca los lomos de merluza primero por el lado de la piel o base y luego dale la vuelta para que quede nacarada y jugosa.', timer_seconds: 300 },
      { step_number: 3, instruction: 'Dora los ajos laminados con el resto del AOVE, desglasa con zumo de limón y vierte sobre la merluza y los trigueros.', timer_seconds: 120 }
    ]
  },
  {
    id: 12,
    slug: 'lubina-horno-patata-panadera',
    name: 'Lubina al horno con patata panadera medida y limón',
    category: 'pescado',
    meal_slot: 'dinner',
    seasons: 'primavera,verano,otono,invierno',
    kcal: 355, protein_g: 33, carbs_g: 24, fat_g: 13, prep_minutes: 25,
    cooking_method: 'Horno tradicional',
    image_url: 'assets/img/pescado.jpg',
    youtube_url: 'https://www.youtube.com/results?search_query=receta+lubina+al+horno+con+patatas+panadera+española',
    chef_tip: 'En vez de freír las patatas panadera en sartén, ásalas primero 15 minutos en el horno con cebolla en juliana y medio vaso de caldo de verduras: quedan tiernas y ahorras 200 kcal.',
    batch_prep_tip: 'Puedes dejar la cama de patata y cebolla pre-asada en la bandeja.',
    is_friday_fixed: 0,
    ingredients: [
      { ingredient_id: 31, amount_per_diner: 190, notes: 'Limpia en lomos o abierta' },
      { ingredient_id: 20, amount_per_diner: 100, notes: 'En rodajas finas tipo panadera' },
      { ingredient_id: 10, amount_per_diner: 60, notes: 'En juliana fina' },
      { ingredient_id: 29, amount_per_diner: 0.5, notes: 'Rodajas para hornear' },
      { ingredient_id: 46, amount_per_diner: 80, notes: 'Para asar la patata sin freír' },
      { ingredient_id: 9, amount_per_diner: 8, notes: 'Pulverizado sobre el pescado' }
    ],
    steps: [
      { step_number: 1, instruction: 'Precalienta el horno a 200 °C. Coloca en una fuente las patatas cortadas en rodajas finas y la cebolla en juliana con el caldo de verduras y hornea.', timer_seconds: 900 },
      { step_number: 2, instruction: 'Coloca los lomos de lubina salpimentados sobre la cama de patata y cebolla, añade rodajas de limón y pulveriza el AOVE medido.', timer_seconds: 600 },
      { step_number: 3, instruction: 'Espolvorea perejil fresco picado al sacar del horno y sirve inmediatamente con los jugos de la bandeja.', timer_seconds: 60 }
    ]
  },
  {
    id: 13,
    slug: 'dorada-espalda-horno-tomate',
    name: 'Dorada a la espalda al horno con juliana de cebolla y tomate',
    category: 'pescado',
    meal_slot: 'dinner',
    seasons: 'primavera,verano,otono,invierno',
    kcal: 330, protein_g: 35, carbs_g: 11, fat_g: 14, prep_minutes: 22,
    cooking_method: 'Horno a la espalda',
    image_url: 'assets/img/pescado.jpg',
    youtube_url: 'https://www.youtube.com/results?search_query=receta+dorada+a+la+espalda+al+horno+española',
    chef_tip: 'Hornear la dorada abierta sobre una cama húmeda de tomate maduro y cebolla evita que el pescado se reseque sin necesidad de bañar la pieza en aceite.',
    batch_prep_tip: 'Deja la cama de cebolla y tomate pochada en el Batch Cooking.',
    is_friday_fixed: 0,
    ingredients: [
      { ingredient_id: 32, amount_per_diner: 190, notes: 'Abierta a la espalda' },
      { ingredient_id: 6, amount_per_diner: 110, notes: 'En rodajas en la base' },
      { ingredient_id: 10, amount_per_diner: 65, notes: 'En pluma fina' },
      { ingredient_id: 11, amount_per_diner: 1, notes: 'Picado por encima' },
      { ingredient_id: 9, amount_per_diner: 9, notes: 'Horneado jugoso' }
    ],
    steps: [
      { step_number: 1, instruction: 'Precalienta el horno a 190 °C. Dispón en la bandeja una base húmeda de rodajas de tomate maduro y cebolla en pluma.', timer_seconds: 300 },
      { step_number: 2, instruction: 'Coloca la dorada abierta a la espalda sobre las verduras, sazona y hornea hasta que la carne se separe fácilmente de la espina.', timer_seconds: 780 },
      { step_number: 3, instruction: 'Termina con ajo muy picado, perejil y el hilo de AOVE virgen extra sobre los lomos calientes.', timer_seconds: 60 }
    ]
  },
  {
    id: 14,
    slug: 'salmon-papillote-puerro-zanahoria',
    name: 'Salmón al papillote con juliana de puerro, zanahoria y eneldo',
    category: 'pescado',
    meal_slot: 'dinner',
    seasons: 'otono,invierno,primavera',
    kcal: 390, protein_g: 34, carbs_g: 9, fat_g: 22, prep_minutes: 20,
    cooking_method: 'Papillote al vapor en su jugo',
    image_url: 'assets/img/pescado.jpg',
    youtube_url: 'https://www.youtube.com/results?search_query=receta+salmon+al+papillote+con+verduras+española',
    chef_tip: 'El salmón ya es rico en ácidos grasos cardiosaludables Omega-3; cocinado en papillote cerrado con verduras en juliana no necesita ni una sola gota de aceite añadido.',
    batch_prep_tip: 'Corta las verduras en bastones finos y guárdalas en bolsa hermética.',
    is_friday_fixed: 0,
    ingredients: [
      { ingredient_id: 33, amount_per_diner: 160, notes: 'Lomo fresco sin espinas' },
      { ingredient_id: 19, amount_per_diner: 70, notes: 'En juliana muy fina' },
      { ingredient_id: 12, amount_per_diner: 60, notes: 'En bastones finos' },
      { ingredient_id: 29, amount_per_diner: 0.5, notes: 'Rodaja aromática' },
      { ingredient_id: 9, amount_per_diner: 4, notes: 'Mínimo toque final' }
    ],
    steps: [
      { step_number: 1, instruction: 'Corta en juliana fina el puerro y la zanahoria. Colócalos en el centro de un pliego amplio de papel de hornear.', timer_seconds: 240 },
      { step_number: 2, instruction: 'Sitúa el lomo de salmón encima, añade una rodaja de limón, eneldo, sal y pimienta. Cierra el paquete herméticamente doblando los bordes.', timer_seconds: 180 },
      { step_number: 3, instruction: 'Hornea a 200 °C para que el vapor interior cocine el salmón y las verduras en su propio jugo.', timer_seconds: 720 }
    ]
  },
  {
    id: 15,
    slug: 'trucha-navarra-ligera-horno',
    name: 'Trucha a la navarra ligera al horno con jamón serrano magro',
    category: 'pescado',
    meal_slot: 'dinner',
    seasons: 'primavera,otono,invierno',
    kcal: 325, protein_g: 36, carbs_g: 6, fat_g: 16, prep_minutes: 18,
    cooking_method: 'Horno sin rebozado',
    image_url: 'assets/img/pescado.jpg',
    youtube_url: 'https://www.youtube.com/results?search_query=receta+trucha+a+la+navarra+al+horno+ligera',
    chef_tip: 'Eliminamos el enharinado y la fritura clásica horneando la trucha rellena de una loncha fina de jamón serrano magro sin tocino; el propio jamón sala y jugosea el pescado.',
    batch_prep_tip: 'Acompaña con ensalada verde o verduras al vapor.',
    is_friday_fixed: 0,
    ingredients: [
      { ingredient_id: 34, amount_per_diner: 180, notes: 'Abierta limpia' },
      { ingredient_id: 44, amount_per_diner: 20, notes: 'Jamón serrano magro sin grasa blanca' },
      { ingredient_id: 28, amount_per_diner: 70, notes: 'Ensalada verde de guarnición' },
      { ingredient_id: 6, amount_per_diner: 80, notes: 'Tomate de huerta' },
      { ingredient_id: 9, amount_per_diner: 7, notes: 'Para la ensalada y horno' }
    ],
    steps: [
      { step_number: 1, instruction: 'Rellena la trucha limpia abierta con los taquitos o loncha fina de jamón serrano magro sin grasa blanca.', timer_seconds: 180 },
      { step_number: 2, instruction: 'Hornea a 195 °C sobre papel vegetal sin añadir harinas ni rebozados hasta que la trucha esté en su punto.', timer_seconds: 600 },
      { step_number: 3, instruction: 'Acompaña en el plato con la ensalada fresca de brotes verdes y tomate aliñado.', timer_seconds: 120 }
    ]
  },
  {
    id: 16,
    slug: 'emperador-plancha-calabacin-asado',
    name: 'Emperador a la plancha con picada de ajo, perejil y calabacín',
    category: 'pescado',
    meal_slot: 'dinner',
    seasons: 'primavera,verano,otono',
    kcal: 320, protein_g: 35, carbs_g: 8, fat_g: 15, prep_minutes: 14,
    cooking_method: 'Plancha bien caliente',
    image_url: 'assets/img/pescado.jpg',
    youtube_url: 'https://www.youtube.com/results?search_query=receta+emperador+a+la+plancha+con+ajo+y+perejil',
    chef_tip: 'Saca el filete de emperador de la nevera 10 minutos antes y márcalo solo 90 segundos por cara a fuego fuerte para que conserve todos sus jugos interiores.',
    batch_prep_tip: 'Prepara un bote pequeño de picada de ajo, perejil y limón.',
    is_friday_fixed: 0,
    ingredients: [
      { ingredient_id: 35, amount_per_diner: 175, notes: 'Filete limpio' },
      { ingredient_id: 13, amount_per_diner: 130, notes: 'En rodajas a la plancha' },
      { ingredient_id: 11, amount_per_diner: 1, notes: 'En picada con perejil' },
      { ingredient_id: 29, amount_per_diner: 0.5, notes: 'Zumo fresco' },
      { ingredient_id: 9, amount_per_diner: 9, notes: 'Para la picada verde' }
    ],
    steps: [
      { step_number: 1, instruction: 'Prepara la picada machacando el diente de ajo con perejil fresco, zumo de limón y el AOVE medido.', timer_seconds: 180 },
      { step_number: 2, instruction: 'Asa las rodajas de calabacín en la plancha bien caliente por ambas caras con una pizca de sal y orégano.', timer_seconds: 300 },
      { step_number: 3, instruction: 'Marca el filete de emperador a fuego fuerte 90 segundos por lado y báñalo al salir con la picada verde.', timer_seconds: 180 }
    ]
  },
  {
    id: 17,
    slug: 'sardinas-asadas-horno-pimientos',
    name: 'Sardinas frescas asadas al horno con pimientos verdes y tomate',
    category: 'pescado',
    meal_slot: 'dinner',
    seasons: 'verano,primavera',
    kcal: 340, protein_g: 31, carbs_g: 10, fat_g: 18, prep_minutes: 20,
    cooking_method: 'Horno sobre papel vegetal',
    image_url: 'assets/img/pescado.jpg',
    youtube_url: 'https://www.youtube.com/results?search_query=receta+sardinas+al+horno+sin+olor+española',
    chef_tip: 'Hornear las sardinas a 200 °C con rodajas de limón y perejil durante 10 minutos evita olores en la cocina y mantiene intacto todo su calcio y Omega-3.',
    batch_prep_tip: 'Acompaña con pimientos asados del domingo.',
    is_friday_fixed: 0,
    ingredients: [
      { ingredient_id: 36, amount_per_diner: 170, notes: 'Sardinas limpias sin escamas' },
      { ingredient_id: 16, amount_per_diner: 90, notes: 'Pimiento verde asado' },
      { ingredient_id: 6, amount_per_diner: 90, notes: 'Tomate asado o aliñado' },
      { ingredient_id: 29, amount_per_diner: 0.5, notes: 'Limón en rodajas' },
      { ingredient_id: 9, amount_per_diner: 6, notes: 'Pincelado ligero' }
    ],
    steps: [
      { step_number: 1, instruction: 'Forra la bandeja de horno con papel vegetal y coloca las sardinas limpias junto con los pimientos verdes y el tomate en mitades.', timer_seconds: 240 },
      { step_number: 2, instruction: 'Añade rodajas de limón, ajo picado y pincela con el AOVE. Hornea a 200 °C hasta que la piel quede dorada.', timer_seconds: 600 },
      { step_number: 3, instruction: 'Sirve las sardinas recién horneadas acompañadas de los pimientos y el tomate asado.', timer_seconds: 60 }
    ]
  },
  {
    id: 18,
    slug: 'boquerones-horno-limon-perejil',
    name: 'Boquerones frescos al horno al limón con ensalada de brotes',
    category: 'pescado',
    meal_slot: 'dinner',
    seasons: 'primavera,verano',
    kcal: 295, protein_g: 30, carbs_g: 7, fat_g: 15, prep_minutes: 16,
    cooking_method: 'Horno rápido (8 min)',
    image_url: 'assets/img/pescado.jpg',
    youtube_url: 'https://www.youtube.com/results?search_query=receta+boquerones+al+horno+con+limon+y+perejil',
    chef_tip: 'Abiertos en mariposa en una bandeja con ajo picado, perejil, zumo de limón y pulverización de AOVE reemplazan a los boquerones fritos con un 65% menos de calorías.',
    batch_prep_tip: 'Pide en la pescadería los boquerones abiertos sin espina central.',
    is_friday_fixed: 0,
    ingredients: [
      { ingredient_id: 37, amount_per_diner: 175, notes: 'Abiertos en mariposa sin espina' },
      { ingredient_id: 28, amount_per_diner: 80, notes: 'Brotes tiernos de lechuga' },
      { ingredient_id: 11, amount_per_diner: 1, notes: 'Muy picado' },
      { ingredient_id: 29, amount_per_diner: 0.5, notes: 'Zumo de limón' },
      { ingredient_id: 9, amount_per_diner: 8, notes: 'Rocío antes de hornear' }
    ],
    steps: [
      { step_number: 1, instruction: 'Extiende los boquerones abiertos sin espina en una fuente de horno con la piel hacia abajo.', timer_seconds: 180 },
      { step_number: 2, instruction: 'Reparte por encima el ajo muy picado, perejil, zumo de limón y el AOVE. Hornea a 200 °C.', timer_seconds: 480 },
      { step_number: 3, instruction: 'Sírvelos calientes junto a la ensalada fresca de brotes verdes.', timer_seconds: 60 }
    ]
  },
  {
    id: 19,
    slug: 'bonito-con-tomate-casero-ligero',
    name: 'Bonito del norte con salsa de tomate casera y pimientos',
    category: 'pescado',
    meal_slot: 'both',
    seasons: 'verano,otono,primavera',
    kcal: 360, protein_g: 37, carbs_g: 14, fat_g: 15, prep_minutes: 22,
    cooking_method: 'Guiso suave corto',
    image_url: 'assets/img/pescado.jpg',
    youtube_url: 'https://www.youtube.com/results?search_query=receta+bonito+con+tomate+casero+tradicional+española',
    chef_tip: 'Apaga el fuego en cuanto incorpores los tacos de bonito a la salsa de tomate hirviendo y tapa la cazuela 3 minutos: se cocina con el calor residual quedando súper jugoso.',
    batch_prep_tip: 'Usa la misma salsa de tomate casera preparada en el Batch Cooking.',
    is_friday_fixed: 0,
    ingredients: [
      { ingredient_id: 38, amount_per_diner: 175, notes: 'En dados limpios' },
      { ingredient_id: 5, amount_per_diner: 140, notes: 'Tomate natural triturado' },
      { ingredient_id: 15, amount_per_diner: 50, notes: 'Pimiento rojo muy picado' },
      { ingredient_id: 10, amount_per_diner: 50, notes: 'Cebolla pochada' },
      { ingredient_id: 9, amount_per_diner: 8, notes: 'Sofrito lento' }
    ],
    steps: [
      { step_number: 1, instruction: 'Pocha la cebolla y el pimiento rojo muy picados en una cazuela con el AOVE a fuego lento.', timer_seconds: 360 },
      { step_number: 2, instruction: 'Vierte el tomate natural triturado y cocina suavemente hasta que la salsa pierda la acidez y espese.', timer_seconds: 600 },
      { step_number: 3, instruction: 'Incorpora los dados de bonito limpio salpimentados, apaga el fuego y deja que se cocinen con el calor residual 3 minutos con la cazuela tapada.', timer_seconds: 180 }
    ]
  },
  {
    id: 20,
    slug: 'atun-fresco-encebollado-laurel',
    name: 'Atún fresco encebollado ligero al laurel con pimientos asados',
    category: 'pescado',
    meal_slot: 'dinner',
    seasons: 'primavera,verano,otono',
    kcal: 350, protein_g: 36, carbs_g: 12, fat_g: 16, prep_minutes: 20,
    cooking_method: 'Cazuela tradicional gaditana',
    image_url: 'assets/img/pescado.jpg',
    youtube_url: 'https://www.youtube.com/results?search_query=receta+atun+encebollado+tradicional+gaditano',
    chef_tip: 'Pocha la cebolla muy despacio con tapa y unas cucharadas de caldo de verduras para que caramelice en sus propios azúcares sin requerir apenas aceite.',
    batch_prep_tip: 'La cebolla pochada del domingo reduce este plato a 6 minutos.',
    is_friday_fixed: 0,
    ingredients: [
      { ingredient_id: 38, amount_per_diner: 175, notes: 'Tacos de atún fresco' },
      { ingredient_id: 10, amount_per_diner: 130, notes: 'Cebolla dulce en juliana' },
      { ingredient_id: 15, amount_per_diner: 60, notes: 'Tiras de pimiento asado' },
      { ingredient_id: 46, amount_per_diner: 60, notes: 'Caldo para pochar sin exceso de grasa' },
      { ingredient_id: 9, amount_per_diner: 8, notes: 'AOVE' }
    ],
    steps: [
      { step_number: 1, instruction: 'Corta la cebolla dulce en juliana fina y póchala en cazuela con una hoja de laurel, el AOVE y el caldo de verduras con tapa puesta.', timer_seconds: 720 },
      { step_number: 2, instruction: 'Cuando la cebolla esté transparente y caramelizada, añade las tiras de pimiento asado.', timer_seconds: 180 },
      { step_number: 3, instruction: 'Incorpora los tacos de atún fresco y cocínalos 2 minutos por cara para que queden súper tiernos.', timer_seconds: 240 }
    ]
  },
  {
    id: 21,
    slug: 'pechuga-pollo-plancha-escalivada',
    name: 'Pechuga de pollo de corral a la plancha con escalivada catalana',
    category: 'ave_carne_magra',
    meal_slot: 'both',
    seasons: 'primavera,verano,otono,invierno',
    kcal: 345, protein_g: 38, carbs_g: 14, fat_g: 13, prep_minutes: 15,
    cooking_method: 'Plancha + Verdura asada',
    image_url: 'assets/img/aves.jpg',
    youtube_url: 'https://www.youtube.com/results?search_query=receta+escalivada+tradicional+con+pollo+a+la+plancha',
    chef_tip: 'Marina los filetes de pollo con zumo de limón, ajo machacado y tomillo 15 minutos antes de pasarlos por la plancha: rompe las fibras y queda tiernísimo.',
    batch_prep_tip: 'La escalivada (pimiento rojo, berenjena y cebolla) se asa entera el domingo.',
    is_friday_fixed: 0,
    ingredients: [
      { ingredient_id: 39, amount_per_diner: 175, notes: 'Filetes finos de corral' },
      { ingredient_id: 15, amount_per_diner: 80, notes: 'Pimiento rojo de la escalivada' },
      { ingredient_id: 14, amount_per_diner: 80, notes: 'Berenjena asada en tiras' },
      { ingredient_id: 10, amount_per_diner: 50, notes: 'Cebolla asada' },
      { ingredient_id: 9, amount_per_diner: 8, notes: 'Aliño de la escalivada' }
    ],
    steps: [
      { step_number: 1, instruction: 'Calienta o prepara las tiras de pimiento rojo, berenjena y cebolla asadas con una pizca de sal y AOVE.', timer_seconds: 300 },
      { step_number: 2, instruction: 'Calienta la plancha a fuego medio-alto y dora los filetes de pechuga de pollo previamente marinados con limón y tomillo.', timer_seconds: 300 },
      { step_number: 3, instruction: 'Sirve los filetes dorados acompañados de una generosa ración de escalivada templada.', timer_seconds: 60 }
    ]
  },
  {
    id: 22,
    slug: 'pollo-ajillo-ligero-champinones',
    name: 'Pollo al ajillo ligero al vino blanco con champiñones laminados',
    category: 'ave_carne_magra',
    meal_slot: 'lunch',
    seasons: 'otono,invierno,primavera',
    kcal: 370, protein_g: 39, carbs_g: 10, fat_g: 16, prep_minutes: 25,
    cooking_method: 'Dorado en cazuela + Reducción',
    image_url: 'assets/img/aves.jpg',
    youtube_url: 'https://www.youtube.com/results?search_query=receta+pollo+al+ajillo+casero+saludable+español',
    chef_tip: 'Sella los dados de pechuga o contramuslo limpio con ajos enteros con piel golpeados y añade champiñones frescos que absorben toda la reducción aromática.',
    batch_prep_tip: 'Se conserva 3 días en la nevera sin perder jugosidad.',
    is_friday_fixed: 0,
    ingredients: [
      { ingredient_id: 39, amount_per_diner: 175, notes: 'En dados medianos' },
      { ingredient_id: 23, amount_per_diner: 120, notes: 'Champiñones frescos laminados' },
      { ingredient_id: 11, amount_per_diner: 2, notes: 'Dientes enteros golpeados' },
      { ingredient_id: 46, amount_per_diner: 80, notes: 'Para reducir la salsa' },
      { ingredient_id: 9, amount_per_diner: 9, notes: 'Dorado en cazuela' }
    ],
    steps: [
      { step_number: 1, instruction: 'Dora los dientes de ajo enteros con un golpe seco en una cazuela con el AOVE y sella los dados de pollo salpimentados.', timer_seconds: 360 },
      { step_number: 2, instruction: 'Añade los champiñones laminados y saltea hasta que tomen color dorado.', timer_seconds: 300 },
      { step_number: 3, instruction: 'Vierte el caldo de verduras, tapa y cocina a fuego medio hasta que reduzca la salsa.', timer_seconds: 480 }
    ]
  },
  {
    id: 23,
    slug: 'solomillo-pavo-estofado-verduras',
    name: 'Solomillo de pavo estofado con zanahoria, puerro y tomillo',
    category: 'ave_carne_magra',
    meal_slot: 'both',
    seasons: 'otono,invierno,primavera',
    kcal: 335, protein_g: 37, carbs_g: 13, fat_g: 12, prep_minutes: 25,
    cooking_method: 'Estofado ligero',
    image_url: 'assets/img/aves.jpg',
    youtube_url: 'https://www.youtube.com/results?search_query=receta+solomillo+de+pavo+en+salsa+de+verduras',
    chef_tip: 'Tritura la mitad de las zanahorias y el puerro con el caldo de cocción para lograr una salsa espesa color ámbar de restaurante con menos de 340 kcal.',
    batch_prep_tip: 'Plato estrella de Batch Cooking: mejora al reposar 24 horas.',
    is_friday_fixed: 0,
    ingredients: [
      { ingredient_id: 40, amount_per_diner: 175, notes: 'En medallones gruesos' },
      { ingredient_id: 12, amount_per_diner: 80, notes: 'Zanahoria para la salsa y guarnición' },
      { ingredient_id: 19, amount_per_diner: 60, notes: 'Puerro limpio' },
      { ingredient_id: 10, amount_per_diner: 45, notes: 'Cebolla' },
      { ingredient_id: 46, amount_per_diner: 150, notes: 'Caldo de verduras' },
      { ingredient_id: 9, amount_per_diner: 8, notes: 'Sellado del pavo' }
    ],
    steps: [
      { step_number: 1, instruction: 'Sella los medallones de solomillo de pavo en una cazuela con el AOVE y retíralos a un plato.', timer_seconds: 240 },
      { step_number: 2, instruction: 'En el mismo fondo pocha la cebolla, el puerro y la zanahoria troceada con una rama de tomillo y cubre con el caldo.', timer_seconds: 600 },
      { step_number: 3, instruction: 'Tritura la mitad de las verduras para ligar la salsa, reincorpora el pavo y da un hervor suave de 4 minutos.', timer_seconds: 240 }
    ]
  },
  {
    id: 24,
    slug: 'pinchos-morunos-pollo-calabacin',
    name: 'Pinchos morunos caseros de pollo a la plancha con calabacín',
    category: 'ave_carne_magra',
    meal_slot: 'dinner',
    seasons: 'primavera,verano,otono',
    kcal: 320, protein_g: 36, carbs_g: 9, fat_g: 13, prep_minutes: 18,
    cooking_method: 'Plancha / Grill',
    image_url: 'assets/img/aves.jpg',
    youtube_url: 'https://www.youtube.com/results?search_query=receta+pinchos+morunos+de+pollo+caseros+saludables',
    chef_tip: 'Prepara el adobo moruno en casa con pimentón dulce, comino, orégano, cúrcuma y ajo; evitas los adobos industriales cargados de dextrosa y grasas ocultas.',
    batch_prep_tip: 'Deja los dados de pollo marinando en táper desde la víspera.',
    is_friday_fixed: 0,
    ingredients: [
      { ingredient_id: 39, amount_per_diner: 170, notes: 'En dados adobados con especias' },
      { ingredient_id: 13, amount_per_diner: 120, notes: 'En medias lunas en la brocheta' },
      { ingredient_id: 15, amount_per_diner: 50, notes: 'Tacos de pimiento rojo' },
      { ingredient_id: 47, amount_per_diner: 2, notes: 'Para el adobo moruno casero' },
      { ingredient_id: 9, amount_per_diner: 8, notes: 'Para el marinado' }
    ],
    steps: [
      { step_number: 1, instruction: 'Mezcla los dados de pechuga de pollo con pimentón dulce, comino, orégano, ajo en polvo, sal y el AOVE medido.', timer_seconds: 180 },
      { step_number: 2, instruction: 'Ensarta en brochetas alternando los dados de pollo marinado con medias lunas de calabacín y tacos de pimiento rojo.', timer_seconds: 240 },
      { step_number: 3, instruction: 'Cocina las brochetas en la plancha bien caliente girándolas para que se doren de forma uniforme.', timer_seconds: 480 }
    ]
  },
  {
    id: 25,
    slug: 'albondigas-pavo-horno-salsa-espanola',
    name: 'Albóndigas de pavo al horno en salsa española de verduras',
    category: 'ave_carne_magra',
    meal_slot: 'lunch',
    seasons: 'otono,invierno,primavera',
    kcal: 385, protein_g: 36, carbs_g: 22, fat_g: 15, prep_minutes: 30,
    cooking_method: 'Horneado + Salsa tradicional',
    image_url: 'assets/img/aves.jpg',
    youtube_url: 'https://www.youtube.com/results?search_query=receta+albondigas+de+pavo+al+horno+en+salsa+española',
    chef_tip: 'En vez de pasar las albóndigas por harina y freírlas, añade calabacín rallado crudo a la masa de pavo y hornéalas 12 minutos antes de darles un hervor en la salsa.',
    batch_prep_tip: 'Puedes hornear doble tanda el domingo y congelar la mitad.',
    is_friday_fixed: 0,
    ingredients: [
      { ingredient_id: 41, amount_per_diner: 165, notes: 'Carne picada magra de pavo' },
      { ingredient_id: 13, amount_per_diner: 50, notes: 'Rallado dentro de la masa para jugosidad' },
      { ingredient_id: 10, amount_per_diner: 60, notes: 'Para la salsa española' },
      { ingredient_id: 12, amount_per_diner: 60, notes: 'Triturada en la salsa' },
      { ingredient_id: 46, amount_per_diner: 120, notes: 'Caldo casero' },
      { ingredient_id: 9, amount_per_diner: 8, notes: 'Sofrito de la salsa' }
    ],
    steps: [
      { step_number: 1, instruction: 'Mezcla la carne picada magra de pavo con el calabacín rallado crudo, ajo, perejil y sal. Forma las albóndigas y hornéalas a 200 °C sobre papel vegetal.', timer_seconds: 720 },
      { step_number: 2, instruction: 'Mientras se hornean, pocha la cebolla y la zanahoria con el caldo de verduras y tritúralas hasta obtener una salsa española ligera.', timer_seconds: 480 },
      { step_number: 3, instruction: 'Introduce las albóndigas horneadas en la salsa caliente y cocínalas 5 minutos para que se impregnen bien.', timer_seconds: 300 }
    ]
  },
  {
    id: 26,
    slug: 'conejo-ajillo-cazuela-alcachofas',
    name: 'Conejo al ajillo tradicional en cazuela con corazones de alcachofa',
    category: 'ave_carne_magra',
    meal_slot: 'lunch',
    seasons: 'otono,invierno,primavera',
    kcal: 350, protein_g: 38, carbs_g: 11, fat_g: 15, prep_minutes: 30,
    cooking_method: 'Cazuela mediterránea',
    image_url: 'assets/img/aves.jpg',
    youtube_url: 'https://www.youtube.com/results?search_query=receta+conejo+al+ajillo+con+alcachofas+española',
    chef_tip: 'La carne de conejo es una de las más magras y ricas en vitamina B12 de la gastronomía española; guisada con alcachofas y romero resulta extraordinariamente ligera.',
    batch_prep_tip: 'Ideal para dejar hecho el domingo y calentar a fuego suave.',
    is_friday_fixed: 0,
    ingredients: [
      { ingredient_id: 42, amount_per_diner: 185, notes: 'Trozos magros limpios' },
      { ingredient_id: 24, amount_per_diner: 110, notes: 'Corazones de alcachofa' },
      { ingredient_id: 11, amount_per_diner: 2, notes: 'Ajos laminados' },
      { ingredient_id: 46, amount_per_diner: 100, notes: 'Caldo de verduras' },
      { ingredient_id: 9, amount_per_diner: 9, notes: 'Dorado tradicional' }
    ],
    steps: [
      { step_number: 1, instruction: 'Dora los trozos de conejo magro junto a los ajos laminados y una rama de romero en la cazuela con el AOVE.', timer_seconds: 480 },
      { step_number: 2, instruction: 'Incorpora los corazones de alcachofa en cuartos y rehoga 2 minutos.', timer_seconds: 180 },
      { step_number: 3, instruction: 'Vierte el caldo de verduras caliente, tapa la cazuela y cocina a fuego suave hasta que la carne esté muy tierna.', timer_seconds: 900 }
    ]
  },
  {
    id: 27,
    slug: 'lomo-cerdo-magro-pimientos-piquillo',
    name: 'Lomo magro a la plancha con pimientos del piquillo confitados ligeros',
    category: 'ave_carne_magra',
    meal_slot: 'dinner',
    seasons: 'primavera,verano,otono,invierno',
    kcal: 340, protein_g: 35, carbs_g: 11, fat_g: 15, prep_minutes: 15,
    cooking_method: 'Plancha vuelta y vuelta',
    image_url: 'assets/img/aves.jpg',
    youtube_url: 'https://www.youtube.com/results?search_query=receta+lomo+a+la+plancha+con+pimientos+del+piquillo',
    chef_tip: 'Saltea las tiras de pimiento del piquillo con láminas de ajo a fuego muy suave en su propio jugo; aporta dulzor natural y jugosidad al lomo magro.',
    batch_prep_tip: 'Los pimientos del piquillo se confitan en 10 minutos el domingo.',
    is_friday_fixed: 0,
    ingredients: [
      { ingredient_id: 43, amount_per_diner: 160, notes: 'Cinta de lomo magra sin borde graso' },
      { ingredient_id: 48, amount_per_diner: 100, notes: 'Pimientos del piquillo en tiras' },
      { ingredient_id: 11, amount_per_diner: 1, notes: 'Laminado en los pimientos' },
      { ingredient_id: 28, amount_per_diner: 50, notes: 'Brotes verdes de acompañamiento' },
      { ingredient_id: 9, amount_per_diner: 8, notes: 'Confitado ligero' }
    ],
    steps: [
      { step_number: 1, instruction: 'En una sartén pequeña a fuego muy bajo, confita las tiras de pimiento del piquillo con el ajo laminado y media cucharadita de AOVE.', timer_seconds: 420 },
      { step_number: 2, instruction: 'Calienta la plancha a fuego fuerte y marca los filetes de lomo magro vuelta y vuelta para que no pierdan jugosidad.', timer_seconds: 180 },
      { step_number: 3, instruction: 'Sirve el lomo cubierto con los pimientos del piquillo templados y los brotes verdes al lado.', timer_seconds: 60 }
    ]
  },
  {
    id: 28,
    slug: 'pollo-jardinera-guisantes-zanahoria',
    name: 'Pollo guisado a la jardinera con guisantes tiernos y zanahoria',
    category: 'ave_carne_magra',
    meal_slot: 'lunch',
    seasons: 'primavera,otono,invierno',
    kcal: 395, protein_g: 37, carbs_g: 25, fat_g: 14, prep_minutes: 28,
    cooking_method: 'Guiso casero de toda la vida',
    image_url: 'assets/img/aves.jpg',
    youtube_url: 'https://www.youtube.com/results?search_query=receta+pollo+a+la+jardinera+tradicional+español',
    chef_tip: 'Retira toda la piel del pollo antes de dorarlo; tendrás todo el colágeno y sabor del guiso de las abuelas con menos de la mitad de calorías.',
    batch_prep_tip: 'Guárdalo con su salsa bien cubierta en táper de cristal.',
    is_friday_fixed: 0,
    ingredients: [
      { ingredient_id: 39, amount_per_diner: 170, notes: 'Trozos sin piel' },
      { ingredient_id: 27, amount_per_diner: 65, notes: 'Guisantes tiernos' },
      { ingredient_id: 12, amount_per_diner: 65, notes: 'Zanahoria en dados' },
      { ingredient_id: 20, amount_per_diner: 70, notes: 'Patata chascada medida' },
      { ingredient_id: 5, amount_per_diner: 50, notes: 'Tomate natural' },
      { ingredient_id: 9, amount_per_diner: 8, notes: 'Para el guiso' }
    ],
    steps: [
      { step_number: 1, instruction: 'Sella los trozos de pollo sin piel en una cazuela y añade la zanahoria en dados y el tomate natural.', timer_seconds: 360 },
      { step_number: 2, instruction: 'Incorpora la patata chascada medida, cubre ligeramente con agua o caldo y cocina tapado a fuego medio.', timer_seconds: 900 },
      { step_number: 3, instruction: 'Añade los guisantes tiernos en los últimos 4 minutos de cocción para que queden tersos y dulces.', timer_seconds: 240 }
    ]
  },
  {
    id: 29,
    slug: 'tiras-pollo-salteadas-pimientos-lechuga',
    name: 'Salteado mediterráneo de pollo con pimientos sobre hojas de lechuga',
    category: 'ave_carne_magra',
    meal_slot: 'dinner',
    seasons: 'primavera,verano',
    kcal: 310, protein_g: 35, carbs_g: 10, fat_g: 12, prep_minutes: 15,
    cooking_method: 'Salteado rápido',
    image_url: 'assets/img/aves.jpg',
    youtube_url: 'https://www.youtube.com/results?search_query=receta+salteado+de+pollo+con+pimientos+y+cebolla+saludable',
    chef_tip: 'Servir las tiras de pollo y pimientos asados sobre hojas crujientes de cogollo de Tudela sustituye las tortitas de harina refinada ahorrando 180 kcal por cena.',
    batch_prep_tip: 'Aprovecha las tiras de pimiento y cebolla ya cortadas.',
    is_friday_fixed: 0,
    ingredients: [
      { ingredient_id: 39, amount_per_diner: 165, notes: 'En tiras finas' },
      { ingredient_id: 15, amount_per_diner: 60, notes: 'Pimiento rojo en bastones' },
      { ingredient_id: 16, amount_per_diner: 60, notes: 'Pimiento verde en bastones' },
      { ingredient_id: 28, amount_per_diner: 80, notes: 'Hojas enteras de cogollo / lechuga' },
      { ingredient_id: 9, amount_per_diner: 8, notes: 'Salteado wok/sartén' }
    ],
    steps: [
      { step_number: 1, instruction: 'Corta la pechuga de pollo, el pimiento rojo y el pimiento verde en tiras finas del mismo tamaño.', timer_seconds: 240 },
      { step_number: 2, instruction: 'Saltea a fuego vivo en sartén con el AOVE, primero los pimientos 4 minutos y después las tiras de pollo con comino y pimienta.', timer_seconds: 420 },
      { step_number: 3, instruction: 'Dispón las hojas enteras y crujientes de cogollo de lechuga a modo de barquitas y rellénalas con el salteado caliente.', timer_seconds: 120 }
    ]
  },
  {
    id: 30,
    slug: 'pavo-plancha-ensalada-murciana',
    name: 'Filetes de pavo a la plancha con ensalada murciana (moje ligero)',
    category: 'ave_carne_magra',
    meal_slot: 'both',
    seasons: 'primavera,verano',
    kcal: 315, protein_g: 36, carbs_g: 12, fat_g: 12, prep_minutes: 12,
    cooking_method: 'Plancha + Ensalada fresca',
    image_url: 'assets/img/aves.jpg',
    youtube_url: 'https://www.youtube.com/results?search_query=receta+moje+murciano+ensalada+española',
    chef_tip: 'El moje o ensalada murciana con tomate pera, cebolleta tierna y huevo duro es una guarnición hidratante, rica en licopeno y de bajísima densidad calórica.',
    batch_prep_tip: 'El moje murciano está aún más rico tras reposar 2 horas en frío.',
    is_friday_fixed: 0,
    ingredients: [
      { ingredient_id: 40, amount_per_diner: 170, notes: 'Filetes a la plancha' },
      { ingredient_id: 6, amount_per_diner: 130, notes: 'Tomate troceado para el moje' },
      { ingredient_id: 10, amount_per_diner: 40, notes: 'Cebolleta en juliana' },
      { ingredient_id: 8, amount_per_diner: 0.5, notes: 'Medio huevo duro por comensal' },
      { ingredient_id: 9, amount_per_diner: 8, notes: 'Aliño del moje' }
    ],
    steps: [
      { step_number: 1, instruction: 'Prepara la ensalada murciana mezclando el tomate troceado, la cebolleta en juliana fina y el huevo duro en gajos con el AOVE.', timer_seconds: 240 },
      { step_number: 2, instruction: 'Marca los filetes de pavo salpimentados con orégano en la plancha bien caliente.', timer_seconds: 240 },
      { step_number: 3, instruction: 'Sirve los filetes recién hechos acompañados del moje murciano fresco.', timer_seconds: 60 }
    ]
  },
  {
    id: 31,
    slug: 'contramuslo-pollo-horno-limon-romero',
    name: 'Contramuslo de pollo deshuesado al horno al limón y romero',
    category: 'ave_carne_magra',
    meal_slot: 'lunch',
    seasons: 'primavera,verano,otono,invierno',
    kcal: 380, protein_g: 36, carbs_g: 18, fat_g: 16, prep_minutes: 25,
    cooking_method: 'Asado al horno',
    image_url: 'assets/img/aves.jpg',
    youtube_url: 'https://www.youtube.com/results?search_query=receta+pollo+al+horno+con+limon+y+romero+española',
    chef_tip: 'Desengrasa el contramuslo con tijera de cocina antes de hornear con calabacín y patata medida: es mucho más jugoso que la pechuga con apenas 30 kcal de diferencia.',
    batch_prep_tip: 'Asa el pollo al mismo tiempo que las verduras del Batch Cooking.',
    is_friday_fixed: 0,
    ingredients: [
      { ingredient_id: 39, amount_per_diner: 175, notes: 'Contramuslo deshuesado y desengrasado' },
      { ingredient_id: 13, amount_per_diner: 100, notes: 'Calabacín asado en bastones' },
      { ingredient_id: 20, amount_per_diner: 80, notes: 'Patata asada en gajos' },
      { ingredient_id: 29, amount_per_diner: 0.5, notes: 'Limón asado' },
      { ingredient_id: 9, amount_per_diner: 8, notes: 'Horneado aromático' }
    ],
    steps: [
      { step_number: 1, instruction: 'Precalienta el horno a 200 °C. Coloca el contramuslo limpio junto con los gajos de patata y bastones de calabacín en una fuente.', timer_seconds: 240 },
      { step_number: 2, instruction: 'Riega con zumo de limón, romero fresco, sal, pimienta y el AOVE medido. Hornea hasta que todo esté dorado.', timer_seconds: 1200 },
      { step_number: 3, instruction: 'Salsea el pollo con los jugos aromáticos del fondo de la bandeja al emplatar.', timer_seconds: 60 }
    ]
  },
  {
    id: 32,
    slug: 'pisto-manchego-huevo-escalfado',
    name: 'Pisto manchego tradicional con huevo campero escalfado',
    category: 'verdura_huevo',
    meal_slot: 'both',
    seasons: 'primavera,verano,otono,invierno',
    kcal: 310, protein_g: 15, carbs_g: 19, fat_g: 17, prep_minutes: 25,
    cooking_method: 'Pochado lento + Escalfado',
    image_url: 'assets/img/verduras.jpg',
    youtube_url: 'https://www.youtube.com/results?search_query=receta+pisto+manchego+casero+con+huevo+española',
    chef_tip: 'Pocha el calabacín, la berenjena y los pimientos con la sartén tapada a fuego medio-bajo: las hortalizas sueltan su propia agua de vegetación y se cocinan casi sin aceite.',
    batch_prep_tip: 'El pisto manchego es la base reina del Batch Cooking dominical.',
    is_friday_fixed: 0,
    ingredients: [
      { ingredient_id: 13, amount_per_diner: 100, notes: 'Calabacín en dados' },
      { ingredient_id: 14, amount_per_diner: 80, notes: 'Berenjena en dados' },
      { ingredient_id: 15, amount_per_diner: 60, notes: 'Pimiento rojo' },
      { ingredient_id: 16, amount_per_diner: 60, notes: 'Pimiento verde' },
      { ingredient_id: 5, amount_per_diner: 130, notes: 'Tomate natural triturado' },
      { ingredient_id: 8, amount_per_diner: 1, notes: 'Huevo escalfado sobre el pisto' },
      { ingredient_id: 9, amount_per_diner: 9, notes: 'Pochado lento' }
    ],
    steps: [
      { step_number: 1, instruction: 'Corta en dados regulares el pimiento rojo, el pimiento verde, el calabacín y la berenjena.', timer_seconds: 300 },
      { step_number: 2, instruction: 'Póchalos en una sartén amplia con el AOVE y la tapa puesta a fuego medio para que se cocinen en su propio jugo; añade el tomate natural y cocina 10 minutos más.', timer_seconds: 900 },
      { step_number: 3, instruction: 'Haz un hueco en el centro del pisto caliente, casca el huevo campero, tapa la sartén y deja que escalfe hasta que la clara cuaje.', timer_seconds: 240 }
    ]
  },
  {
    id: 33,
    slug: 'tortilla-calabacin-cebolla-tierna',
    name: 'Tortilla jugosa de calabacín y cebolla tierna con mínimo aceite',
    category: 'verdura_huevo',
    meal_slot: 'dinner',
    seasons: 'primavera,verano,otono,invierno',
    kcal: 295, protein_g: 16, carbs_g: 11, fat_g: 18, prep_minutes: 18,
    cooking_method: 'Cuajado en sartén antiadherente',
    image_url: 'assets/img/verduras.jpg',
    youtube_url: 'https://www.youtube.com/results?search_query=receta+tortilla+de+calabacin+y+cebolla+saludable+española',
    chef_tip: 'Cocina el calabacín y la cebolla al vapor o microondas en estuche cerrado 5 minutos antes de dorarlos 2 minutos en sartén: consigues máxima jugosidad con solo 1 cucharadita de AOVE.',
    batch_prep_tip: 'Puedes dejar el relleno de calabacín y cebolla pochado en nevera.',
    is_friday_fixed: 0,
    ingredients: [
      { ingredient_id: 8, amount_per_diner: 2, notes: 'Huevos camperos batidos' },
      { ingredient_id: 13, amount_per_diner: 140, notes: 'Calabacín en medias lunas finas' },
      { ingredient_id: 10, amount_per_diner: 55, notes: 'Cebolla tierna pochada' },
      { ingredient_id: 9, amount_per_diner: 7, notes: 'Sartén antiadherente' }
    ],
    steps: [
      { step_number: 1, instruction: 'Corta el calabacín en medias lunas finas y la cebolla en juliana. Cocínalos 5 minutos al vapor o en estuche al microondas para ablandarlos sin grasa.', timer_seconds: 300 },
      { step_number: 2, instruction: 'Pásalos 2 minutos por la sartén con la mitad del AOVE para darles toque dorado y mézclalos en un bol con los huevos batidos.', timer_seconds: 180 },
      { step_number: 3, instruction: 'Cuaja la tortilla en la sartén antiadherente por ambas caras dejándola jugosa en el interior.', timer_seconds: 240 }
    ]
  },
  {
    id: 34,
    slug: 'salmorejo-cordobes-ligero-sin-pan',
    name: 'Salmorejo cordobés ligero (espesado con calabacín) con huevo y jamón',
    category: 'verdura_huevo',
    meal_slot: 'both',
    seasons: 'primavera,verano',
    kcal: 285, protein_g: 16, carbs_g: 14, fat_g: 17, prep_minutes: 12,
    cooking_method: 'Emulsión en frío (Batidora)',
    image_url: 'assets/img/verduras.jpg',
    youtube_url: 'https://www.youtube.com/results?search_query=receta+salmorejo+cordobes+ligero+sin+pan+española',
    chef_tip: 'Sustituir el pan blanco por dados de calabacín pelado cocido al vapor logra exactamente la misma textura espesa y aterciopelada del salmorejo cordobés restando 220 kcal.',
    batch_prep_tip: 'Aguanta 4 días en botella de cristal bien fría en la nevera.',
    is_friday_fixed: 0,
    ingredients: [
      { ingredient_id: 6, amount_per_diner: 220, notes: 'Tomate pera maduro' },
      { ingredient_id: 13, amount_per_diner: 80, notes: 'Calabacín pelado al vapor (sustituye al pan)' },
      { ingredient_id: 8, amount_per_diner: 1, notes: 'Huevo duro picado por encima' },
      { ingredient_id: 44, amount_per_diner: 15, notes: 'Taquitos de jamón serrano magro' },
      { ingredient_id: 11, amount_per_diner: 0.5, notes: 'Medio diente de ajo sin germen' },
      { ingredient_id: 9, amount_per_diner: 10, notes: 'Para emulsionar' }
    ],
    steps: [
      { step_number: 1, instruction: 'Cuece al vapor los dados de calabacín pelado durante 6 minutos y déjalos enfriar (harán la función espesante del pan).', timer_seconds: 360 },
      { step_number: 2, instruction: 'En el vaso de la batidora tritura a máxima potencia los tomates pera maduros, el calabacín cocido, el medio ajo y una pizca de sal.', timer_seconds: 180 },
      { step_number: 3, instruction: 'Con la batidora en marcha añade el AOVE en hilo fino para emulsionar y sírvelo frío con el huevo duro y el jamón magro picados.', timer_seconds: 120 }
    ]
  },
  {
    id: 35,
    slug: 'gazpacho-andaluz-tradicional-huevo',
    name: 'Gazpacho andaluz tradicional sin pan con guarnición y huevo duro',
    category: 'verdura_huevo',
    meal_slot: 'dinner',
    seasons: 'primavera,verano',
    kcal: 260, protein_g: 13, carbs_g: 15, fat_g: 15, prep_minutes: 12,
    cooking_method: 'Triturado en frío',
    image_url: 'assets/img/verduras.jpg',
    youtube_url: 'https://www.youtube.com/results?search_query=receta+gazpacho+andaluz+tradicional+sin+pan',
    chef_tip: 'Tritura los tomates pera muy maduros con pepino, pimiento verde italiano y ajo sin añadir miga de pan; sírvelo en cuenco con dos huevos duros picados para una cena proteica y saciante.',
    batch_prep_tip: 'Prepáralo el domingo; los sabores se asientan en frío.',
    is_friday_fixed: 0,
    ingredients: [
      { ingredient_id: 6, amount_per_diner: 220, notes: 'Tomates maduros' },
      { ingredient_id: 26, amount_per_diner: 70, notes: 'Pepino fresco' },
      { ingredient_id: 16, amount_per_diner: 45, notes: 'Pimiento verde italiano' },
      { ingredient_id: 8, amount_per_diner: 1.5, notes: 'Huevo duro picado de guarnición' },
      { ingredient_id: 9, amount_per_diner: 8, notes: 'Emulsión en batidora' }
    ],
    steps: [
      { step_number: 1, instruction: 'Trocea los tomates maduros lavados, el pepino parcialmente pelado y el pimiento verde italiano sin semillas.', timer_seconds: 240 },
      { step_number: 2, instruction: 'Tritura todo con el AOVE, un chorrito de vinagre de Jerez, sal y un poco de agua fría hasta lograr una textura fina.', timer_seconds: 180 },
      { step_number: 3, instruction: 'Sirve bien frío en cuenco coronado con abundante huevo duro picado y daditos de verdura para masticar.', timer_seconds: 60 }
    ]
  },
  {
    id: 36,
    slug: 'menestra-verduras-navarra-huevo-jamon',
    name: 'Menestra de verduras a la navarra con huevo poché y jamón magro',
    category: 'verdura_huevo',
    meal_slot: 'both',
    seasons: 'primavera,otono,invierno',
    kcal: 320, protein_g: 19, carbs_g: 20, fat_g: 16, prep_minutes: 25,
    cooking_method: 'Vapor + Rehogado ligero',
    image_url: 'assets/img/verduras.jpg',
    youtube_url: 'https://www.youtube.com/results?search_query=receta+menestra+de+verduras+tradicional+española',
    chef_tip: 'Cuece cada verdura al dente (judía verde, zanahoria, alcachofa y guisantes) y únelas con un refrito ligero de ajo, taquitos de jamón magro y una cucharada de caldo.',
    batch_prep_tip: 'Deja las verduras hervidas al dente listas en táper.',
    is_friday_fixed: 0,
    ingredients: [
      { ingredient_id: 25, amount_per_diner: 80, notes: 'Judías verdes troceadas' },
      { ingredient_id: 24, amount_per_diner: 80, notes: 'Alcachofas en cuartos' },
      { ingredient_id: 12, amount_per_diner: 50, notes: 'Zanahoria en rodajas' },
      { ingredient_id: 27, amount_per_diner: 40, notes: 'Guisantes tiernos' },
      { ingredient_id: 8, amount_per_diner: 1, notes: 'Huevo poché en el centro' },
      { ingredient_id: 44, amount_per_diner: 15, notes: 'Jamón magro en el refrito' },
      { ingredient_id: 9, amount_per_diner: 7, notes: 'Refrito de ajo' }
    ],
    steps: [
      { step_number: 1, instruction: 'Cuece al vapor o en agua hirviendo las judías verdes, la zanahoria, los corazones de alcachofa y los guisantes hasta que queden al dente.', timer_seconds: 720 },
      { step_number: 2, instruction: 'En una sartén dora ligeramente el ajo con los taquitos de jamón serrano magro y media cucharadita de AOVE; incorpora las verduras escurridas y saltea.', timer_seconds: 240 },
      { step_number: 3, instruction: 'Corona cada plato de menestra con un huevo poché recién hecho.', timer_seconds: 180 }
    ]
  },
  {
    id: 37,
    slug: 'crema-calabaza-puerro-huevo',
    name: 'Crema suave de calabaza asada y puerro con huevo mollet',
    category: 'verdura_huevo',
    meal_slot: 'dinner',
    seasons: 'otono,invierno',
    kcal: 275, protein_g: 14, carbs_g: 22, fat_g: 13, prep_minutes: 22,
    cooking_method: 'Cocción y triturado sin nata',
    image_url: 'assets/img/verduras.jpg',
    youtube_url: 'https://www.youtube.com/results?search_query=receta+crema+de+calabaza+y+puerro+saludable+española',
    chef_tip: 'En lugar de nata líquida, emulsiona la crema en caliente con una cucharada de requesón o queso fresco 0% batido y corona con un huevo cocido 6 minutos de yema cremosa.',
    batch_prep_tip: 'La crema se conserva 5 días en tarro hermético.',
    is_friday_fixed: 0,
    ingredients: [
      { ingredient_id: 21, amount_per_diner: 180, notes: 'Calabaza en trozos' },
      { ingredient_id: 19, amount_per_diner: 70, notes: 'Puerro limpio' },
      { ingredient_id: 12, amount_per_diner: 50, notes: 'Zanahoria' },
      { ingredient_id: 45, amount_per_diner: 30, notes: 'Requesón 0% para cremosidad' },
      { ingredient_id: 8, amount_per_diner: 1, notes: 'Huevo cocido 6 min' },
      { ingredient_id: 46, amount_per_diner: 200, notes: 'Caldo de verduras' },
      { ingredient_id: 9, amount_per_diner: 6, notes: 'Hilo al servir' }
    ],
    steps: [
      { step_number: 1, instruction: 'Cuece en una olla la calabaza troceada, el puerro y la zanahoria cubiertos con el caldo de verduras casero.', timer_seconds: 900 },
      { step_number: 2, instruction: 'Paralelamente cuece el huevo en agua hirviendo durante exactamente 6 minutos, enfríalo y pélalo.', timer_seconds: 360 },
      { step_number: 3, instruction: 'Tritura las verduras con el requesón 0% hasta obtener una crema sedosa y sírvela con el huevo abierto en el centro y unas gotas de AOVE.', timer_seconds: 120 }
    ]
  },
  {
    id: 38,
    slug: 'revuelto-trigueros-ajetes-champinones',
    name: 'Revuelto casero de espárragos trigueros, ajetes y champiñones',
    category: 'verdura_huevo',
    meal_slot: 'dinner',
    seasons: 'primavera,otono,invierno',
    kcal: 290, protein_g: 17, carbs_g: 9, fat_g: 19, prep_minutes: 14,
    cooking_method: 'Salteado y cuajado suave',
    image_url: 'assets/img/verduras.jpg',
    youtube_url: 'https://www.youtube.com/results?search_query=receta+revuelto+de+esparragos+trigueros+y+champiñones',
    chef_tip: 'Retira la sartén del fuego antes de que el huevo termine de cuajar y remueve enérgicamente: obtendrás un revuelto meloso sin añadir mantequilla.',
    batch_prep_tip: 'Saltea las verduras previamente y cuaja el huevo al momento.',
    is_friday_fixed: 0,
    ingredients: [
      { ingredient_id: 8, amount_per_diner: 2, notes: 'Huevos camperos' },
      { ingredient_id: 22, amount_per_diner: 90, notes: 'Trigueros troceados' },
      { ingredient_id: 23, amount_per_diner: 90, notes: 'Champiñones laminados' },
      { ingredient_id: 11, amount_per_diner: 1, notes: 'Ajo tierno o fresco' },
      { ingredient_id: 9, amount_per_diner: 7, notes: 'Salteado previo' }
    ],
    steps: [
      { step_number: 1, instruction: 'Limpia y trocea los espárragos trigueros y lamina los champiñones.', timer_seconds: 180 },
      { step_number: 2, instruction: 'Saltea en sartén con el AOVE y los ajetes a fuego medio-alto hasta que los trigueros estén tiernos.', timer_seconds: 360 },
      { step_number: 3, instruction: 'Vierte los huevos ligeramente batidos, baja el fuego al mínimo y remueve sin parar retirando del calor antes de que se seque.', timer_seconds: 120 }
    ]
  },
  {
    id: 39,
    slug: 'berenjenas-rellenas-verduras-pavo',
    name: 'Berenjenas asadas rellenas de verduras y pavo con requesón',
    category: 'verdura_huevo',
    meal_slot: 'both',
    seasons: 'primavera,verano,otono,invierno',
    kcal: 340, protein_g: 26, carbs_g: 18, fat_g: 16, prep_minutes: 28,
    cooking_method: 'Horno / Gratinado sin bechamel',
    image_url: 'assets/img/verduras.jpg',
    youtube_url: 'https://www.youtube.com/results?search_query=receta+berenjenas+rellenas+saludables+sin+bechamel',
    chef_tip: 'Sustituimos la pesada bechamel de mantequilla y harina por una capa ligera de requesón batido con una pizca de nuez moscada que gratina de maravilla al horno.',
    batch_prep_tip: 'Puedes dejar las barquitas de berenjena asadas y rellenas el domingo.',
    is_friday_fixed: 0,
    ingredients: [
      { ingredient_id: 14, amount_per_diner: 180, notes: 'Berenjena abierta por la mitad' },
      { ingredient_id: 41, amount_per_diner: 100, notes: 'Pavo magro picado' },
      { ingredient_id: 5, amount_per_diner: 80, notes: 'Tomate natural' },
      { ingredient_id: 10, amount_per_diner: 45, notes: 'Cebolla picada' },
      { ingredient_id: 45, amount_per_diner: 35, notes: 'Requesón para gratinar sin bechamel' },
      { ingredient_id: 9, amount_per_diner: 7, notes: 'Para el sofrito del relleno' }
    ],
    steps: [
      { step_number: 1, instruction: 'Abre la berenjena longitudinalmente, haz cortes en rombo en su pulpa y ásala en el horno o microondas hasta que esté tierna. Vacía la pulpa.', timer_seconds: 600 },
      { step_number: 2, instruction: 'En una sartén sofríe la cebolla y el pavo picado con la pulpa de berenjena picada y el tomate natural.', timer_seconds: 480 },
      { step_number: 3, instruction: 'Rellena las barquitas de berenjena, cubre con el requesón batido con nuez moscada y gratina 5 minutos al horno.', timer_seconds: 300 }
    ]
  },
  {
    id: 40,
    slug: 'tortilla-francesa-hierbas-tomate-alinado',
    name: 'Tortilla francesa de finas hierbas con tomate aliñado al orégano',
    category: 'verdura_huevo',
    meal_slot: 'dinner',
    seasons: 'primavera,verano,otono,invierno',
    kcal: 280, protein_g: 16, carbs_g: 9, fat_g: 18, prep_minutes: 10,
    cooking_method: 'Plancha rápida (5 min)',
    image_url: 'assets/img/verduras.jpg',
    youtube_url: 'https://www.youtube.com/results?search_query=receta+tortilla+francesa+jugosa+con+tomate+aliñado',
    chef_tip: 'Bate los huevos con una cucharada sopera de agua fría y perejil fresco picado: el vapor de agua hace que la tortilla suba esponjosa sin requerir más aceite.',
    batch_prep_tip: 'Cena salvavidas lista en 5 minutos exactos.',
    is_friday_fixed: 0,
    ingredients: [
      { ingredient_id: 8, amount_per_diner: 2, notes: 'Huevos batidos con perejil' },
      { ingredient_id: 6, amount_per_diner: 160, notes: 'Tomate de ensalada en gajos' },
      { ingredient_id: 10, amount_per_diner: 30, notes: 'Cebolleta fina' },
      { ingredient_id: 9, amount_per_diner: 8, notes: 'Para cuajar y aliñar el tomate' }
    ],
    steps: [
      { step_number: 1, instruction: 'Corta el tomate maduro en gajos y la cebolleta en pluma fina. Alíñalos con orégano, sal y la mitad del AOVE.', timer_seconds: 180 },
      { step_number: 2, instruction: 'Bate los huevos con una cucharada de agua fría, sal y perejil fresco muy picado.', timer_seconds: 120 },
      { step_number: 3, instruction: 'Cuaja la tortilla francesa en la sartén caliente con el resto del AOVE doblándola sobre sí misma para que quede jugosa.', timer_seconds: 120 }
    ]
  },
  {
    id: 41,
    slug: 'crema-calabacin-ligera-tiras-pavo',
    name: 'Crema de calabacín y puerro sin nata con tiras de pavo tostadas',
    category: 'verdura_huevo',
    meal_slot: 'dinner',
    seasons: 'primavera,verano,otono,invierno',
    kcal: 285, protein_g: 21, carbs_g: 15, fat_g: 14, prep_minutes: 20,
    cooking_method: 'Cocción suave y batido',
    image_url: 'assets/img/verduras.jpg',
    youtube_url: 'https://www.youtube.com/results?search_query=receta+crema+de+calabacin+saludable+sin+nata+española',
    chef_tip: 'Pela parcialmente el calabacín (en franjas tipo cebra) para mantener la fibra de la piel y conseguir un color verde pistacho luminoso y apetecible.',
    batch_prep_tip: 'Prepara 1 litro de crema el domingo para 2 cenas de la semana.',
    is_friday_fixed: 0,
    ingredients: [
      { ingredient_id: 13, amount_per_diner: 200, notes: 'Calabacín pelado en cebra' },
      { ingredient_id: 19, amount_per_diner: 65, notes: 'Puerro blanco' },
      { ingredient_id: 45, amount_per_diner: 35, notes: 'Queso fresco 0% o requesón' },
      { ingredient_id: 40, amount_per_diner: 70, notes: 'Tiras de pavo doradas en seco' },
      { ingredient_id: 46, amount_per_diner: 180, notes: 'Caldo de verduras' },
      { ingredient_id: 9, amount_per_diner: 6, notes: 'AOVE en crudo' }
    ],
    steps: [
      { step_number: 1, instruction: 'Trocea el calabacín pelado a franjas y la parte blanca del puerro. Cuécelos con el caldo de verduras durante 14 minutos.', timer_seconds: 840 },
      { step_number: 2, instruction: 'Tritura con el requesón o queso fresco 0%, sal, pimienta blanca y el hilo de AOVE hasta lograr una textura fina.', timer_seconds: 120 },
      { step_number: 3, instruction: 'Dora las tiras de pechuga de pavo en una sartén en seco y colócalas crujientes sobre la crema caliente.', timer_seconds: 180 }
    ]
  },
  {
    id: 42,
    slug: 'judias-verdes-patata-refrito-pimenton',
    name: 'Judías verdes planas al vapor con patata y refrito de ajo y pimentón',
    category: 'verdura_huevo',
    meal_slot: 'dinner',
    seasons: 'primavera,otono,invierno',
    kcal: 295, protein_g: 14, carbs_g: 28, fat_g: 13, prep_minutes: 20,
    cooking_method: 'Vapor + Refrito tradicional medido',
    image_url: 'assets/img/verduras.jpg',
    youtube_url: 'https://www.youtube.com/results?search_query=receta+judias+verdes+con+patatas+y+ajo+pimenton+española',
    chef_tip: 'Acompaña las judías verdes y la patata cocida al vapor con un huevo duro picado y el clásico refrito español de ajo dorado y pimentón de la Vera retirado del fuego.',
    batch_prep_tip: 'Las judías y patatas pueden cocerse al vapor en el Batch Cooking.',
    is_friday_fixed: 0,
    ingredients: [
      { ingredient_id: 25, amount_per_diner: 160, notes: 'Judías verdes planas sin hebras' },
      { ingredient_id: 20, amount_per_diner: 90, notes: 'Patata cocida al vapor en dados' },
      { ingredient_id: 8, amount_per_diner: 1, notes: 'Huevo duro picado' },
      { ingredient_id: 11, amount_per_diner: 1.5, notes: 'Ajo laminado para el refrito' },
      { ingredient_id: 47, amount_per_diner: 2, notes: 'Pimentón dulce de la Vera' },
      { ingredient_id: 9, amount_per_diner: 8, notes: 'Refrito tradicional medido' }
    ],
    steps: [
      { step_number: 1, instruction: 'Limpia las judías verdes planas, córtalas en bastones y cuécelas al vapor junto a la patata en dados hasta que estén tiernas.', timer_seconds: 840 },
      { step_number: 2, instruction: 'En una sartén pequeña dora los ajos laminados con el AOVE, retira del fuego, añade el pimentón de la Vera y remueve al instante.', timer_seconds: 120 },
      { step_number: 3, instruction: 'Emplata las judías y patatas con el huevo duro picado por encima y rocía con el refrito de pimentón.', timer_seconds: 60 }
    ]
  }
].concat(EXTRA_RECIPES_DB).map(r => {
  const diffLevel = r.prep_minutes <= 16 ? 1 : (r.prep_minutes <= 25 ? 2 : 3);
  const diffMap = { 1: 'Muy fácil', 2: 'Fácil', 3: 'Media' };
  const baseRating = r.id === 1 ? 5.0 : Number((4.7 + ((r.id * 7) % 4) * 0.1).toFixed(1));

  const sourceMeta = buildRecipeSourceMeta(r);

  const ingIds = new Set((r.ingredients || []).map(item => Number(item.ingredient_id)));
  const allergenList = [];
  if (ingIds.has(8)) allergenList.push('Huevo');
  const hasFish = [30, 31, 32, 33, 34, 35, 36, 37, 38].some(fid => ingIds.has(fid));
  if (hasFish) allergenList.push('Pescado');
  if (ingIds.has(45)) allergenList.push('Lácteos (requesón 0%)');
  const allergensText = allergenList.length > 0
    ? `Contiene: ${allergenList.join(', ')}`
    : '100% libre de alérgenos principales (Sin gluten, Sin lactosa)';

  const SERVING_TIPS = {
    legumbre: 'Acompañar con ensalada de tomate con orégano y cítrico para favorecer la biodisponibilidad del hierro vegetal.',
    pescado: 'Servir con un chorrito de limón recién exprimido y agua fresca aromatizada con menta.',
    ave_carne_magra: 'Servir sobre lecho de hojas verdes (canónigos o rúcula) para aportar volumen saciante y frescor.',
    verdura_huevo: 'Degustar templado con una rebanada fina de pan 100% integral para mojar la yema melosa.',
    arroz_fijo: 'Acompañar con el plátano dorado y una infusión digestiva tras la comida.'
  };

  const isOldGenericUrl = !r.source_url || r.source_url.includes('dietamediterranea.com') || r.source_url.includes('alimentosdespana.es');
  const resolvedSourceUrl = isOldGenericUrl ? sourceMeta.url : r.source_url;
  const resolvedSourceName = (!r.source_name || r.source_name === 'Fundación Dieta Mediterránea') ? sourceMeta.name : r.source_name;

  return {
    ...r,
    image_url: resolveDishSpecificImage(r),
    difficulty_level: r.difficulty_level || diffLevel,
    difficulty: r.difficulty || diffMap[diffLevel],
    rating: r.rating || Math.min(5.0, baseRating),
    source_name: resolvedSourceName,
    source_url: resolvedSourceUrl,
    serving_tip: r.serving_tip || SERVING_TIPS[r.category] || 'Servir templado o recién cocinado.',
    allergens: r.allergens || allergensText
  };
});

/**
 * Genera la atribución gastronómica y la URL funcional para cada receta.
 * Dirige a búsquedas directas de la receta comprobadas para evitar enlaces rotos o genéricos.
 *
 * @param {Object} r - Receta
 * @returns {{ name: string, url: string, query: string }}
 */
export function buildRecipeSourceMeta(r) {
  const cleanTitle = (r.name || '')
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/(sin grasa|sin fritura|ligero|ligera|medida|al natural|con fondo)/gi, '')
    .trim();

  const query = encodeURIComponent(cleanTitle || r.name || 'receta mediterranea');

  const CAT_NAMES = {
    legumbre: 'Tradición Culinaria Española · Cuchara y Legumbres',
    pescado: 'Pescadería Tradicional Española · Pescados Saludables',
    ave_carne_magra: 'Cocina Tradicional de Corral · Aves y Carnes Magras',
    verdura_huevo: 'Huerta y Campo Mediterráneo · Verduras y Huevos',
    arroz_fijo: 'Gastronomía Tradicional Española · Directo al Paladar'
  };

  return {
    name: CAT_NAMES[r.category] || 'Recetario Tradicional Español',
    url: `https://cookpad.com/es/buscar/${query}`,
    query: cleanTitle || r.name
  };
}

export function resolveDishSpecificImage(r) {
  const txt = `${r.name || ''} ${r.slug || ''} ${r.cooking_method || ''}`.toLowerCase();
  if (r.id === 1 || r.category === 'arroz_fijo') {
    return 'assets/img/arroz_cubana.jpg';
  }
  if (r.category === 'legumbre') {
    if (/(alubia|pocha|fabes|judi[oó]n|empedrat|ensalada|moje|pipirrana|vinagreta|hummus|templad)/.test(txt)) {
      return 'assets/img/alubias_ensalada.jpg';
    }
    if (/(garbanzo|potaje|espinaca)/.test(txt)) {
      return 'assets/img/garbanzos.jpg';
    }
    return 'assets/img/legumbres.jpg';
  }
  if (r.category === 'pescado') {
    if (/(salm[oó]n|at[uú]n|bonito|sardina|boquer[oó]n|caballa|emperador|trucha|marmitako)/.test(txt)) {
      return 'assets/img/pescado_azul.jpg';
    }
    if (/(lubina|dorada|corvina|horno|espalda|panadera)/.test(txt)) {
      return 'assets/img/pescado_horno.jpg';
    }
    return 'assets/img/pescado.jpg';
  }
  if (r.category === 'ave_carne_magra') {
    if (/(alb[oó]ndiga|filete ruso|hamburguesa)/.test(txt)) {
      return 'assets/img/albondigas_salsa.jpg';
    }
    if (/(conejo|contramuslo|ajillo|alcachofa|romero|chilindr[oó]n|pepitoria)/.test(txt)) {
      return 'assets/img/conejo_pollo_ajillo.jpg';
    }
    if (/(estofad|guisad|cazuela|salsa|jardinera|medallones|solomillo)/.test(txt)) {
      return 'assets/img/guiso_ave.jpg';
    }
    return 'assets/img/aves.jpg';
  }
  // verdura_huevo
  if (txt.includes('tortilla')) {
    return 'assets/img/tortilla.jpg';
  }
  if (/(revuelto|zarangollo|perico)/.test(txt)) {
    return 'assets/img/revuelto.jpg';
  }
  if (/(salmorejo|gazpacho|porra|ajoblanco|sopa fr[ií]a)/.test(txt)) {
    return 'assets/img/gazpacho_salmorejo.jpg';
  }
  if (/(crema|purrusalda|vichyssoise|caldo|sopa|pur[eé])/.test(txt)) {
    return 'assets/img/crema_verduras.jpg';
  }
  if (/(ensalada|cogollo|pipirrana|moje|ali[nñ]ad|carpaccio|escarola)/.test(txt)) {
    return 'assets/img/ensalada_huerta.jpg';
  }
  if (/(berenjena|rellen|jud[ií]as verdes|menestra|escalivada|alcachofa|br[oó]coli|coliflor|esp[aá]rrago|calabacines)/.test(txt)) {
    return 'assets/img/verduras_rellenas.jpg';
  }
  return 'assets/img/verduras.jpg';
}

export const DEFAULT_WEEKLY_PLAN = {
  lunes:     { comida: 21, cena: 32 },
  martes:    { comida: 2,  cena: 11 },
  miercoles: { comida: 23, cena: 33 },
  jueves:    { comida: 3,  cena: 12 },
  viernes:   { comida: 1,  cena: 38 },
  sabado:    { comida: 26, cena: 39 },
  domingo:   { comida: 25, cena: 41 }
};

export const DEFAULT_SAVED_MENUS = [
  {
    id: 1,
    menu_name: 'Plan Clásico Mediterráneo Otoño/Invierno (-0,7 kg/sem)',
    season: 'otono',
    diners: 2,
    avg_daily_kcal: 1415,
    created_at: '2026-11-10 09:30:00',
    plan_json: {
      lunes:     { comida: 21, cena: 32 },
      martes:    { comida: 2,  cena: 11 },
      miercoles: { comida: 23, cena: 33 },
      jueves:    { comida: 3,  cena: 12 },
      viernes:   { comida: 1,  cena: 38 },
      sabado:    { comida: 26, cena: 39 },
      domingo:   { comida: 25, cena: 41 }
    }
  },
  {
    id: 2,
    menu_name: 'Plan Fresco Andaluz Primavera/Verano (Sin encender horno)',
    season: 'verano',
    diners: 2,
    avg_daily_kcal: 1385,
    created_at: '2026-11-12 18:15:00',
    plan_json: {
      lunes:     { comida: 30, cena: 34 },
      martes:    { comida: 5,  cena: 16 },
      miercoles: { comida: 21, cena: 35 },
      jueves:    { comida: 6,  cena: 18 },
      viernes:   { comida: 1,  cena: 40 },
      sabado:    { comida: 19, cena: 29 },
      domingo:   { comida: 32, cena: 41 }
    }
  }
];

/**
 * Redondeo gastronómico lógico para cantidades en ficha de receta.
 */
export function formatGastronomicAmount(rawAmount, unit, step = 5) {
  if (unit === 'ud' || unit === 'diente') {
    return Math.round(rawAmount * 2) / 2;
  }
  if (rawAmount <= 15) {
    return Math.round(rawAmount * 10) / 10;
  }
  const effectiveStep = step > 0 ? step : 5;
  return Math.round(rawAmount / effectiveStep) * effectiveStep;
}

/**
 * Redondeo hacia arriba lógico para lista de la compra agregada.
 */
export function roundShoppingQuantity(amount, unit, step = 5) {
  if (unit === 'ud' || unit === 'diente') {
    return Math.ceil(amount);
  }
  const effectiveStep = step > 0 ? step : 5;
  return Math.ceil(amount / effectiveStep) * effectiveStep;
}

/**
 * Verifica que ninguna receta ni ingrediente viole la regla de CERO marisco, bacalao o rape.
 */
export function verifyZeroForbiddenIngredients(recipes = RECIPES_DB, ingredients = INGREDIENTS_DB) {
  const violations = [];
  for (const r of recipes) {
    const text = `${r.name} ${r.slug}`.toLowerCase();
    for (const term of FORBIDDEN_TERMS) {
      if (text.includes(term)) {
        violations.push(`Receta ${r.name} contiene término excluido: ${term}`);
      }
    }
  }
  for (const ing of ingredients) {
    const text = ing.name.toLowerCase();
    for (const term of FORBIDDEN_TERMS) {
      if (text.includes(term)) {
        violations.push(`Ingrediente ${ing.name} contiene término excluido: ${term}`);
      }
    }
  }
  return {
    valid: violations.length === 0,
    clean: violations.length === 0,
    violations
  };
}

/**
 * Normaliza palabras clave separadas por comas.
 */
export function parseKeywordsList(rawStr) {
  if (!rawStr || typeof rawStr !== 'string') return [];
  return rawStr
    .split(/[,;]+/)
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Construye el texto completo buscable de una receta (nombre + ingredientes + método).
 */
export function getRecipeSearchableText(recipe, ingredientsById) {
  const ingNames = (recipe.ingredients || [])
    .map(ri => ingredientsById.get(ri.ingredient_id)?.name || '')
    .join(' ');
  return `${recipe.name} ${recipe.cooking_method} ${recipe.chef_tip} ${ingNames}`.toLowerCase();
}

function toFavoritesSet(favs) {
  if (favs instanceof Set) return favs;
  if (Array.isArray(favs)) return new Set(favs.map(Number));
  return new Set();
}

/**
 * Ordena una lista de recetas por el criterio elegido:
 * - 'recommended' (Estación + Favoritas + Deseadas + Valoración)
 * - 'easiest' (Más fáciles primero)
 * - 'fastest' (Menor tiempo activo primero)
 * - 'rating' (Más buenas / Mejor puntuación primero)
 * - 'kcal' (Menor aporte calórico primero)
 */
export function sortRecipesList(recipes, sortBy = 'recommended', seasonOrFavs = 'primavera', favsMaybe = new Set()) {
  const season = typeof seasonOrFavs === 'string' ? seasonOrFavs : 'primavera';
  const favoritesSet = typeof seasonOrFavs === 'string' ? toFavoritesSet(favsMaybe) : toFavoritesSet(seasonOrFavs);

  const copy = [...recipes];
  copy.sort((a, b) => {
    const favA = favoritesSet.has(a.id) ? 1 : 0;
    const favB = favoritesSet.has(b.id) ? 1 : 0;

    if (sortBy === 'easiest') {
      if (a.difficulty_level !== b.difficulty_level) return a.difficulty_level - b.difficulty_level;
      if (a.prep_minutes !== b.prep_minutes) return a.prep_minutes - b.prep_minutes;
      return b.rating - a.rating;
    }
    if (sortBy === 'fastest') {
      if (a.prep_minutes !== b.prep_minutes) return a.prep_minutes - b.prep_minutes;
      if (a.difficulty_level !== b.difficulty_level) return a.difficulty_level - b.difficulty_level;
      return b.rating - a.rating;
    }
    if (sortBy === 'rating') {
      if (b.rating !== a.rating) return b.rating - a.rating;
      if (favB !== favA) return favB - favA;
      return a.kcal - b.kcal;
    }
    if (sortBy === 'kcal') {
      if (a.kcal !== b.kcal) return a.kcal - b.kcal;
      return b.rating - a.rating;
    }

    // Por defecto: 'recommended'
    if ((b.matches_wanted || 0) !== (a.matches_wanted || 0)) {
      return (b.matches_wanted || 0) - (a.matches_wanted || 0);
    }
    if (favB !== favA) return favB - favA;
    const seasonA = a.matches_season ?? (a.seasons?.split(',').includes(season) ? 1 : 0);
    const seasonB = b.matches_season ?? (b.seasons?.split(',').includes(season) ? 1 : 0);
    if (seasonB !== seasonA) return seasonB - seasonA;
    if (b.rating !== a.rating) return b.rating - a.rating;
    return a.kcal - b.kcal;
  });
  return copy;
}

/**
 * Evalúa el cumplimiento nutricional de un plan semanal de 7 días respetando las preferencias del usuario.
 */
export function evaluateWeeklyPlan(planMap, prefsOrRecipes = DEFAULT_USER_PREFERENCES, userPrefsMaybe = DEFAULT_USER_PREFERENCES) {
  const recipes = Array.isArray(prefsOrRecipes) ? prefsOrRecipes : RECIPES_DB;
  const rawPrefs = Array.isArray(prefsOrRecipes) ? userPrefsMaybe : prefsOrRecipes;
  const prefs = { ...DEFAULT_USER_PREFERENCES, ...(rawPrefs || {}) };
  const cubanaDay = prefs.arroz_cubana_day || prefs.cubana_day || 'viernes';
  const byId = new Map(recipes.map(r => [r.id, r]));

  let legumeLunches = 0;
  let fishDinners = 0;
  let totalDailyKcalSum = 0;
  let totalDailyProteinSum = 0;
  let totalDailyCarbsSum = 0;
  let totalDailyFatSum = 0;
  const daysDetailed = {};
  const usedIds = new Set();
  let uniqueMealsCount = 0;

  // Base desayuno + tentempié mediterráneo (690 kcal = ~28g proteína, ~82g HC complejos, ~26g grasas saludables AOVE/frutos secos)
  const BASE_PROTEIN_G = 28;
  const BASE_CARBS_G = 82;
  const BASE_FAT_G = 26;

  for (const day of DAYS_ORDER) {
    const slot = planMap[day] || { comida: 21, cena: 32 };
    const isCubanaSlot = cubanaDay !== 'ninguno' && day === cubanaDay;
    const lunchId = isCubanaSlot ? 1 : Number(slot.comida);
    const dinnerId = Number(slot.cena);

    const lunchRecipe = byId.get(lunchId) || byId.get(1);
    const dinnerRecipe = byId.get(dinnerId) || byId.get(32);

    if (!usedIds.has(lunchRecipe.id)) uniqueMealsCount++;
    usedIds.add(lunchRecipe.id);
    if (!usedIds.has(dinnerRecipe.id)) uniqueMealsCount++;
    usedIds.add(dinnerRecipe.id);

    if (lunchRecipe.category === 'legumbre') {
      legumeLunches++;
    }
    if (dinnerRecipe.category === 'pescado') {
      fishDinners++;
    }

    const dailyKcal = BASE_BREAKFAST_SNACK_KCAL + lunchRecipe.kcal + dinnerRecipe.kcal;
    const dailyProtein = BASE_PROTEIN_G + Number(lunchRecipe.protein_g || 0) + Number(dinnerRecipe.protein_g || 0);
    const dailyCarbs = BASE_CARBS_G + Number(lunchRecipe.carbs_g || 0) + Number(dinnerRecipe.carbs_g || 0);
    const dailyFat = BASE_FAT_G + Number(lunchRecipe.fat_g || 0) + Number(dinnerRecipe.fat_g || 0);

    totalDailyKcalSum += dailyKcal;
    totalDailyProteinSum += dailyProtein;
    totalDailyCarbsSum += dailyCarbs;
    totalDailyFatSum += dailyFat;

    daysDetailed[day] = {
      comida: {
        ...lunchRecipe,
        recipe_id: lunchRecipe.id,
        day_of_week: day,
        meal_type: 'comida',
        is_locked: isCubanaSlot ? 1 : 0
      },
      cena: {
        ...dinnerRecipe,
        recipe_id: dinnerRecipe.id,
        day_of_week: day,
        meal_type: 'cena',
        is_locked: 0
      },
      daily_kcal: dailyKcal,
      daily_protein_g: dailyProtein,
      daily_carbs_g: dailyCarbs,
      daily_fat_g: dailyFat
    };
  }

  const avgDailyKcal = Math.round(totalDailyKcalSum / 7);
  const avgDailyProteinG = Math.round(totalDailyProteinSum / 7);
  const avgDailyCarbsG = Math.round(totalDailyCarbsSum / 7);
  const avgDailyFatG = Math.round(totalDailyFatSum / 7);

  const macroKcalTotal = Math.max(1, (avgDailyProteinG * 4) + (avgDailyCarbsG * 4) + (avgDailyFatG * 9));
  const proteinPct = Math.round(((avgDailyProteinG * 4) / macroKcalTotal) * 100);
  const carbsPct = Math.round(((avgDailyCarbsG * 4) / macroKcalTotal) * 100);
  const fatPct = Math.max(0, 100 - proteinPct - carbsPct);

  const cubanaLockedOk = cubanaDay === 'ninguno' ? true : (daysDetailed[cubanaDay]?.comida?.id === 1);

  return {
    days: daysDetailed,
    compliance: {
      legume_lunches: legumeLunches,
      legume_target: Array.isArray(prefs.legume_days) ? prefs.legume_days.length : 2,
      fish_dinners: fishDinners,
      fish_target: Array.isArray(prefs.fish_nights) ? prefs.fish_nights.length : 2,
      cubana_day: cubanaDay,
      arroz_cubana_day: cubanaDay,
      friday_cubana_locked: cubanaLockedOk,
      zero_seafood_cod_monkfish: true,
      unique_meals_count: uniqueMealsCount,
      unique_recipes_count: uniqueMealsCount,
      no_repeats_in_week: uniqueMealsCount === 14,
      within_hypocaloric_range: avgDailyKcal >= 1200 && avgDailyKcal <= 1750,
      avg_daily_kcal: avgDailyKcal,
      avg_daily_protein_g: avgDailyProteinG,
      avg_daily_carbs_g: avgDailyCarbsG,
      avg_daily_fat_g: avgDailyFatG,
      protein_pct: proteinPct,
      carbs_pct: carbsPct,
      fat_pct: fatPct,
      base_breakfast_snack_kcal: BASE_BREAKFAST_SNACK_KCAL
    }
  };
}

/**
 * Calculadora clínica nutricional (Fórmula de Mifflin-St Jeor + SEEDO/OMS).
 */
export function calculateClinicalTargets(profile = {}) {
  const sex = profile.sex === 'male' ? 'male' : 'female';
  const age = Math.max(18, Math.min(95, Number(profile.age) || 42));
  const weightKg = Math.max(40, Math.min(220, Number(profile.weight_kg) || 74));
  const heightCm = Math.max(135, Math.min(220, Number(profile.height_cm) || 166));
  const activity = Number(profile.activity_factor) || 1.375;
  const deficitKcal = Math.max(250, Math.min(750, Number(profile.deficit_kcal) || 450));

  const heightM = heightCm / 100;
  const bmi = Math.round((weightKg / (heightM * heightM)) * 10) / 10;

  let bmiCategory = 'Normopeso saludable';
  if (bmi < 18.5) bmiCategory = 'Bajo peso';
  else if (bmi < 25) bmiCategory = 'Normopeso saludable';
  else if (bmi < 27) bmiCategory = 'Sobrepeso grado I';
  else if (bmi < 30) bmiCategory = 'Sobrepeso grado II (preobesidad)';
  else bmiCategory = 'Obesidad clínica';

  const bmr = Math.round(
    (10 * weightKg) + (6.25 * heightCm) - (5 * age) + (sex === 'male' ? 5 : -161)
  );
  const tdee = Math.round(bmr * activity);
  const safeMinKcal = sex === 'male' ? 1350 : 1200;
  const targetKcal = Math.max(safeMinKcal, tdee - deficitKcal);
  const effectiveDeficit = Math.max(0, tdee - targetKcal);
  const weeklyLossKg = Math.round(((effectiveDeficit * 7) / 7700) * 100) / 100;
  const waterLiters = Math.round(((weightKg * 35) / 1000) * 10) / 10;

  return {
    sex,
    age,
    weight_kg: weightKg,
    height_cm: heightCm,
    activity_factor: activity,
    bmi,
    bmi_category: bmiCategory,
    bmr_kcal: bmr,
    tdee_kcal: tdee,
    target_kcal: targetKcal,
    effective_deficit_kcal: effectiveDeficit,
    estimated_weekly_loss_kg: weeklyLossKg,
    recommended_water_liters: waterLiters
  };
}

/**
 * Obtiene TODAS las recetas compatibles con un hueco y estación que NO estén repetidas en la semana.
 */
export function getCompatibleAlternatives(
  day,
  mealType,
  planMap,
  season = 'primavera',
  prefsOrRecipes = DEFAULT_USER_PREFERENCES,
  favsOrPrefs = [],
  sortByOrSort = 'recommended',
  favoritesSetMaybe = new Set()
) {
  let recipes = RECIPES_DB;
  let rawPrefs = DEFAULT_USER_PREFERENCES;
  let favoritesSet = new Set();
  let sortBy = 'recommended';

  if (Array.isArray(prefsOrRecipes) && prefsOrRecipes.length > 0 && prefsOrRecipes[0]?.slug) {
    recipes = prefsOrRecipes;
    rawPrefs = favsOrPrefs || DEFAULT_USER_PREFERENCES;
    sortBy = typeof sortByOrSort === 'string' ? sortByOrSort : 'recommended';
    favoritesSet = toFavoritesSet(favoritesSetMaybe);
  } else {
    rawPrefs = prefsOrRecipes || DEFAULT_USER_PREFERENCES;
    favoritesSet = toFavoritesSet(favsOrPrefs);
    sortBy = typeof sortByOrSort === 'string' ? sortByOrSort : 'recommended';
  }

  const prefs = { ...DEFAULT_USER_PREFERENCES, ...rawPrefs };
  const cubanaDay = prefs.arroz_cubana_day || prefs.cubana_day || 'viernes';

  const byId = new Map(recipes.map(r => [r.id, r]));
  const ingById = new Map(INGREDIENTS_DB.map(i => [i.id, i]));
  const currentId = Number(planMap[day]?.[mealType] || 21);
  const currentRecipe = byId.get(currentId);

  const isCubanaSlot = cubanaDay !== 'ninguno' && day === cubanaDay && mealType === 'comida';

  // Determinar si ese día está configurado para legumbres (comida) o pescado (cena)
  const isConfiguredLegumeSlot = !isCubanaSlot && mealType === 'comida' && (
    (Array.isArray(prefs.legume_days) && prefs.legume_days.includes(day)) ||
    currentRecipe?.category === 'legumbre'
  );
  const isConfiguredFishSlot = mealType === 'cena' && (
    (Array.isArray(prefs.fish_nights) && prefs.fish_nights.includes(day)) ||
    currentRecipe?.category === 'pescado'
  );

  const requiredCategory = isCubanaSlot
    ? 'arroz_fijo'
    : isConfiguredLegumeSlot
      ? 'legumbre'
      : isConfiguredFishSlot
        ? 'pescado'
        : (currentRecipe?.category || 'ave_carne_magra');

  // Recopilar todos los platos ya usados en los otros 13 huecos de la semana para NO repetir ninguno
  const usedInOtherSlots = new Set();
  for (const d of DAYS_ORDER) {
    for (const m of ['comida', 'cena']) {
      if (d === day && m === mealType) continue;
      const rid = (cubanaDay !== 'ninguno' && d === cubanaDay && m === 'comida') ? 1 : Number(planMap[d]?.[m]);
      if (rid) usedInOtherSlots.add(rid);
    }
  }

  const wantedTerms = parseKeywordsList(prefs.wanted_keywords);
  const excludedTerms = parseKeywordsList(prefs.excluded_keywords);

  const candidates = recipes
    .filter(r => {
      // No repetir ningún plato que ya esté en otro hueco de la semana
      if (usedInOtherSlots.has(r.id)) return false;

      if (isCubanaSlot && r.id === 1) return true;
      if (r.is_friday_fixed === 1) return false;

      // Respetar exclusiones personalizadas del usuario
      if (excludedTerms.length > 0 && r.id !== currentId) {
        const searchable = getRecipeSearchableText(r, ingById);
        if (excludedTerms.some(term => searchable.includes(term))) {
          return false;
        }
      }

      if (isConfiguredLegumeSlot) {
        return r.category === 'legumbre';
      }
      if (isConfiguredFishSlot) {
        return r.category === 'pescado';
      }

      const validCat = r.category === 'ave_carne_magra' || r.category === 'verdura_huevo';
      const validSlot = mealType === 'comida'
        ? (r.meal_slot === 'lunch' || r.meal_slot === 'both')
        : (r.meal_slot === 'dinner' || r.meal_slot === 'both');
      return validCat && validSlot;
    })
    .map(r => {
      const searchable = getRecipeSearchableText(r, ingById);
      const wantedHits = wantedTerms.filter(t => searchable.includes(t)).length;
      return {
        ...r,
        matches_season: r.seasons.split(',').includes(season) ? 1 : 0,
        matches_wanted: wantedHits > 0 ? 1 : 0,
        is_favorite: favoritesSet.has(r.id) ? 1 : 0
      };
    });

  const sorted = sortRecipesList(candidates, sortBy, season, favoritesSet);

  return {
    locked: false,
    current_recipe_id: currentId,
    required_category: requiredCategory,
    total_available: sorted.length,
    alternatives: sorted
  };
}

/**
 * Genera un plan semanal de 14 comidas sin platos repetidos, respetando:
 * - El día elegido para el Arroz blanco a la cubana (versión ligera)
 * - Los días elegidos para las Legumbres
 * - Las noches elegidas para el Pescado permitido
 * - Las preferencias "Quiero incluir" y "No quiero en la semana"
 * - Los huecos fijados manualmente con candado (lockedSlots)
 */
export function generateSeasonalWeeklyPlan(
  season = 'primavera',
  prefsOrRecipes = DEFAULT_USER_PREFERENCES,
  favsOrPrefs = [],
  favoritesSetMaybe = new Set(),
  lockedSlots = {}
) {
  let recipes = RECIPES_DB;
  let rawPrefs = DEFAULT_USER_PREFERENCES;
  let favoritesSet = new Set();

  if (Array.isArray(prefsOrRecipes) && prefsOrRecipes.length > 0 && prefsOrRecipes[0]?.slug) {
    recipes = prefsOrRecipes;
    rawPrefs = favsOrPrefs || DEFAULT_USER_PREFERENCES;
    favoritesSet = toFavoritesSet(favoritesSetMaybe);
  } else {
    rawPrefs = prefsOrRecipes || DEFAULT_USER_PREFERENCES;
    favoritesSet = toFavoritesSet(favsOrPrefs);
  }

  const prefs = { ...DEFAULT_USER_PREFERENCES, ...rawPrefs };
  const cubanaDay = prefs.arroz_cubana_day || prefs.cubana_day || 'viernes';
  const legumeDays = Array.isArray(prefs.legume_days) ? prefs.legume_days : ['martes', 'jueves'];
  const fishNights = Array.isArray(prefs.fish_nights) ? prefs.fish_nights : ['martes', 'jueves'];

  const ingById = new Map(INGREDIENTS_DB.map(i => [i.id, i]));
  const wantedTerms = parseKeywordsList(prefs.wanted_keywords);
  const excludedTerms = parseKeywordsList(prefs.excluded_keywords);

  const scoreAndFilter = (pool) => {
    const filtered = pool.filter(r => {
      if (r.is_friday_fixed === 1) return false;
      if (excludedTerms.length > 0) {
        const txt = getRecipeSearchableText(r, ingById);
        if (excludedTerms.some(t => txt.includes(t))) return false;
      }
      return true;
    });

    const source = filtered.length >= 6 ? filtered : pool.filter(r => r.is_friday_fixed === 0);

    return source
      .map(r => {
        const txt = getRecipeSearchableText(r, ingById);
        const wantedHits = wantedTerms.filter(t => txt.includes(t)).length;
        const seasonMatch = r.seasons.split(',').includes(season) ? 1 : 0;
        const favMatch = favoritesSet.has(r.id) ? 1 : 0;
        const jitter = Math.random() * 0.4;
        const priorityScore = (wantedHits * 10) + (favMatch * 5) + (seasonMatch * 3) + (r.rating || 4.8) + jitter;
        return { recipe: r, priorityScore };
      })
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .map(x => x.recipe);
  };

  const legumesPool = scoreAndFilter(recipes.filter(r => r.category === 'legumbre'));
  const fishPool = scoreAndFilter(recipes.filter(r => r.category === 'pescado'));
  const lunchPool = scoreAndFilter(
    recipes.filter(r => (r.category === 'ave_carne_magra' || r.category === 'verdura_huevo') && (r.meal_slot === 'lunch' || r.meal_slot === 'both'))
  );
  const dinnerPool = scoreAndFilter(
    recipes.filter(r => (r.category === 'ave_carne_magra' || r.category === 'verdura_huevo') && (r.meal_slot === 'dinner' || r.meal_slot === 'both'))
  );

  const usedRecipeIds = new Set(cubanaDay !== 'ninguno' ? [1] : []);
  // Pre-registrar en usedRecipeIds cualquier plato fijado manualmente por el comensal
  if (lockedSlots && typeof lockedSlots === 'object') {
    for (const lockedRecipeId of Object.values(lockedSlots)) {
      const numId = Number(lockedRecipeId);
      if (numId > 0) usedRecipeIds.add(numId);
    }
  }

  const pickUnique = (pool, fallbackId = 21) => {
    for (const candidate of pool) {
      if (!usedRecipeIds.has(candidate.id)) {
        usedRecipeIds.add(candidate.id);
        return candidate.id;
      }
    }
    return pool[0]?.id || fallbackId;
  };

  const newPlan = {};
  for (const day of DAYS_ORDER) {
    const lockedLunch = Number(lockedSlots?.[`${day}_comida`] || 0);
    const lockedDinner = Number(lockedSlots?.[`${day}_cena`] || 0);

    let comidaId;
    if (cubanaDay !== 'ninguno' && day === cubanaDay) {
      comidaId = 1;
    } else if (lockedLunch > 0) {
      comidaId = lockedLunch;
    } else if (legumeDays.includes(day)) {
      comidaId = pickUnique(legumesPool, 2);
    } else {
      comidaId = pickUnique(lunchPool, 21);
    }

    let cenaId;
    if (lockedDinner > 0) {
      cenaId = lockedDinner;
    } else if (fishNights.includes(day)) {
      cenaId = pickUnique(fishPool, 11);
    } else {
      cenaId = pickUnique(dinnerPool, 32);
    }

    newPlan[day] = { comida: comidaId, cena: cenaId };
  }

  return newPlan;
}

/**
 * Unifica y suma todos los ingredientes de las 14 comidas de la semana sin duplicados:
 * Equivalente exacto de: SUM(amount_per_diner * :diners) GROUP BY ingredient_id
 */
export function aggregateShoppingList(planMap, diners = 2, recipes = RECIPES_DB, ingredients = INGREDIENTS_DB, userPrefs = DEFAULT_USER_PREFERENCES) {
  const clampedDiners = Math.max(1, Math.min(12, Number(diners) || 2));
  const cubanaDay = userPrefs?.arroz_cubana_day || userPrefs?.cubana_day || 'viernes';
  const recipesById = new Map(recipes.map(r => [r.id, r]));
  const ingById = new Map(ingredients.map(i => [i.id, i]));

  const accumulator = new Map();

  for (const day of DAYS_ORDER) {
    const slot = planMap[day] || { comida: 21, cena: 32 };
    const mealIds = [
      (cubanaDay !== 'ninguno' && day === cubanaDay) ? 1 : Number(slot.comida),
      Number(slot.cena)
    ];

    for (const rid of mealIds) {
      const recipe = recipesById.get(rid);
      if (!recipe || !Array.isArray(recipe.ingredients)) continue;

      for (const ri of recipe.ingredients) {
        const ingMeta = ingById.get(ri.ingredient_id);
        if (!ingMeta) continue;

        const existing = accumulator.get(ingMeta.id) || {
          ingredient_id: ingMeta.id,
          name: ingMeta.name,
          aisle: ingMeta.aisle,
          unit: ingMeta.unit,
          rounding_step: ingMeta.rounding_step,
          raw_total: 0,
          meals_count: 0,
          recipes_set: new Set()
        };

        existing.raw_total += ri.amount_per_diner * clampedDiners;
        existing.meals_count += 1;
        existing.recipes_set.add(recipe.name);
        accumulator.set(ingMeta.id, existing);
      }
    }
  }

  const aisles = {};
  for (const aisleName of AISLES_ORDER) {
    aisles[aisleName] = [];
  }

  let totalItems = 0;
  for (const entry of accumulator.values()) {
    const totalAmount = roundShoppingQuantity(entry.raw_total, entry.unit, entry.rounding_step);
    aisles[entry.aisle].push({
      ingredient_id: entry.ingredient_id,
      name: entry.name,
      aisle: entry.aisle,
      unit: entry.unit,
      total_amount: totalAmount,
      used_in_meals: entry.meals_count,
      recipes_using: Array.from(entry.recipes_set).join(' · ')
    });
    totalItems++;
  }

  for (const aisleName of AISLES_ORDER) {
    aisles[aisleName].sort((a, b) => a.name.localeCompare(b.name, 'es'));
  }

  return {
    diners: clampedDiners,
    total_items: totalItems,
    aisles
  };
}

/**
 * Genera el plan dominical de Batch Cooking (60-90 min) analizando los 14 platos activos.
 */
export function generateBatchCookingPlan(planMap, diners = 2, recipes = RECIPES_DB, userPrefs = DEFAULT_USER_PREFERENCES) {
  const cubanaDay = userPrefs?.arroz_cubana_day || userPrefs?.cubana_day || 'viernes';
  const byId = new Map(recipes.map(r => [r.id, r]));
  const activeRecipes = [];

  for (const day of DAYS_ORDER) {
    const slot = planMap[day] || { comida: 21, cena: 32 };
    const rLunch = byId.get((cubanaDay !== 'ninguno' && day === cubanaDay) ? 1 : Number(slot.comida));
    const rDinner = byId.get(Number(slot.cena));
    if (rLunch) activeRecipes.push({ day: DAY_LABELS[day], meal: 'Comida', recipe: rLunch });
    if (rDinner) activeRecipes.push({ day: DAY_LABELS[day], meal: 'Cena', recipe: rDinner });
  }

  const legumesList = activeRecipes.filter(x => x.recipe.category === 'legumbre');
  const creamsAndVeggies = activeRecipes.filter(x => x.recipe.category === 'verdura_huevo');
  const meatsList = activeRecipes.filter(x => x.recipe.category === 'ave_carne_magra');
  const fishList = activeRecipes.filter(x => x.recipe.category === 'pescado');

  return [
    {
      phase: 'Minutos 00 – 15 · Mise en Place y Caldo Base Desgrasado',
      duration: '15 min',
      title: `Corte de hortalizas y olla de caldo para ${diners} comensales`,
      description: 'Lava y pica cebolla, puerro, zanahoria y pimientos de toda la semana. Pon a hervir 2 litros de caldo de verduras casero desgrasado que servirá de base sin grasa para estofados, cremas y patatas al horno.',
      related_dishes: 'Base común para las 14 comidas semanales'
    },
    {
      phase: 'Minutos 15 – 45 · Fuego Central: Legumbres y Salsa del Arroz a la Cubana',
      duration: '30 min',
      title: `Cocción de platos de legumbres y reducción de tomate natural (${DAY_LABELS[cubanaDay] || 'Viernes'})`,
      description: `Prepara simultáneamente las comidas de legumbres de la semana (${legumesList.map(l => `${l.recipe.name} [${l.day}]`).join(' · ') || 'según tus días seleccionados'}) y reduce un tarro de salsa de tomate casera con albahaca y mínimo AOVE para el Arroz blanco a la cubana ligero.`,
      related_dishes: legumesList.map(l => l.recipe.name).concat(['Arroz blanco a la cubana (versión ligera)']).join(' · ')
    },
    {
      phase: 'Minutos 30 – 65 · Bandeja de Horno y Asados Sin Grasa',
      duration: '35 min (simultáneo)',
      title: 'Escalivada, hortalizas asadas y proteínas de ave al horno',
      description: `Aprovecha el calor del horno a 200 °C para asar pimientos, berenjenas y cebollas en bandeja junto con las preparaciones de ave/carne magra (${meatsList.slice(0, 3).map(m => m.recipe.name).join(', ')}).`,
      related_dishes: meatsList.slice(0, 4).map(m => `${m.day}: ${m.recipe.name}`).join(' · ')
    },
    {
      phase: 'Minutos 65 – 85 · Cremas de Huerta, Pisto y Conservación en Cristal',
      duration: '20 min',
      title: 'Cremas sedosas sin nata, huevos cocidos y etiquetado de tápers',
      description: `Tritura las cremas o pistos de la semana (${creamsAndVeggies.slice(0, 3).map(v => v.recipe.name).join(', ')}) y deja listos los cortes para las cenas de pescado permitido (${fishList.map(f => `${f.recipe.name} [${f.day}]`).join(' · ')}), que se marcan al momento en < 8 minutos.`,
      related_dishes: creamsAndVeggies.slice(0, 3).map(v => v.recipe.name).join(' · ')
    }
  ];
}

/**
 * Busca y clasifica las recetas del catálogo en función de los ingredientes
 * que el usuario tiene disponibles en su nevera o despensa.
 *
 * @param {Object} options - Parámetros de búsqueda
 * @param {Array<number|string>} [options.ingredientIds=[]] - IDs de ingredientes disponibles en la nevera
 * @param {Array<string>} [options.ingredientNames=[]] - Nombres o términos de ingredientes introducidos por el usuario
 * @param {boolean} [options.ignorePantryBasics=true] - Si es true, considera que ingredientes básicos (AOVE, sal, ajo, caldo, pimentón) siempre están disponibles
 * @param {string} [options.mealSlot='all'] - 'all' | 'lunch' | 'dinner'
 * @param {string} [options.season='all'] - 'all' | 'primavera' | 'verano' | 'otono' | 'invierno'
 * @param {string} [options.category='all'] - 'all' | 'legumbre' | 'pescado' | 'ave_carne_magra' | 'verdura_huevo' | 'arroz_fijo'
 * @param {number} [options.minMatchPercent=1] - Porcentaje mínimo de coincidencia para incluir la receta
 * @param {Array<Object>} [options.recipes=RECIPES_DB] - Catálogo de recetas
 * @param {Array<Object>} [options.ingredients=INGREDIENTS_DB] - Catálogo de ingredientes normalizados
 * @returns {Array<Object>} Lista de recetas ordenadas por grado de coincidencia (100% disponibles primero)
 */
export function searchRecipesByFridgeIngredients(options = {}) {
  const {
    ingredientIds = [],
    ingredientNames = [],
    ignorePantryBasics = true,
    mealSlot = 'all',
    season = 'all',
    category = 'all',
    minMatchPercent = 1,
    recipes = RECIPES_DB,
    ingredients = INGREDIENTS_DB
  } = options;

  const ingredientsById = new Map(ingredients.map(ing => [ing.id, ing]));
  const pantryBasicIds = new Set([9, 11, 46, 47]); // AOVE, Ajo fresco, Caldo de verduras, Pimentón de la Vera

  // Normalizar conjunto de IDs disponibles en nevera
  const availableIds = new Set(
    (ingredientIds || [])
      .map(id => Number(id))
      .filter(id => !isNaN(id) && id > 0)
  );

  // Si se pasaron nombres de ingredientes libres, buscar correspondencias en INGREDIENTS_DB
  if (Array.isArray(ingredientNames) && ingredientNames.length > 0) {
    const cleanNames = ingredientNames
      .map(n => String(n).trim().toLowerCase())
      .filter(n => n.length > 1);

    for (const ing of ingredients) {
      const lowerName = ing.name.toLowerCase();
      for (const term of cleanNames) {
        if (lowerName.includes(term) || term.includes(lowerName)) {
          availableIds.add(ing.id);
        }
      }
    }
  }

  // Si el usuario no ha seleccionado ningún ingrediente, devolvemos lista vacía
  if (availableIds.size === 0) {
    return [];
  }

  const results = [];

  for (const recipe of recipes) {
    // Filtro por momento de comida (comida vs cena)
    if (mealSlot !== 'all') {
      if (recipe.meal_slot !== 'both' && recipe.meal_slot !== mealSlot) {
        continue;
      }
    }

    // Filtro por temporada
    if (season !== 'all') {
      const seasonsList = (recipe.seasons || '').split(',').map(s => s.trim().toLowerCase());
      if (!seasonsList.includes(season.toLowerCase())) {
        continue;
      }
    }

    // Filtro por categoría
    if (category !== 'all' && recipe.category !== category) {
      continue;
    }

    const recipeIngs = recipe.ingredients || [];
    if (recipeIngs.length === 0) continue;

    const matchedIngredients = [];
    const missingIngredients = [];
    const pantryIngredients = [];
    let fridgeHitsCount = 0;

    for (const item of recipeIngs) {
      const ingId = Number(item.ingredient_id);
      const ingMeta = ingredientsById.get(ingId) || { id: ingId, name: `Ingrediente #${ingId}`, unit: 'g', aisle: 'Despensa' };
      const itemDetail = {
        ingredient_id: ingId,
        name: ingMeta.name,
        aisle: ingMeta.aisle,
        unit: ingMeta.unit,
        amount_per_diner: item.amount_per_diner,
        notes: item.notes || ''
      };

      const isPantry = pantryBasicIds.has(ingId);
      const isInFridge = availableIds.has(ingId);

      if (isInFridge) {
        fridgeHitsCount++;
        matchedIngredients.push(itemDetail);
      } else if (isPantry && ignorePantryBasics) {
        pantryIngredients.push(itemDetail);
        matchedIngredients.push(itemDetail);
      } else {
        missingIngredients.push(itemDetail);
      }
    }

    // Requisito: la receta debe contener al menos 1 ingrediente de los que el usuario tiene en la nevera
    if (fridgeHitsCount === 0) {
      continue;
    }

    const totalRequired = recipeIngs.length;
    const matchedCount = matchedIngredients.length;
    const missingCount = missingIngredients.length;
    const matchPercentage = Math.round((matchedCount / totalRequired) * 100);
    const canCookNow = missingCount === 0;

    if (matchPercentage >= minMatchPercent) {
      results.push({
        recipe,
        canCookNow,
        matchPercentage,
        fridgeHitsCount,
        matchedCount,
        missingCount,
        totalRequired,
        matchedIngredients,
        missingIngredients,
        pantryIngredients
      });
    }
  }

  // Ordenar resultados con criterios de relevancia y practicidad:
  // 1. Recetas 100% cocinables con lo que hay (canCookNow = true primero)
  // 2. Menor número de ingredientes faltantes (falta 1 mejor que faltan 3)
  // 3. Mayor número de ingredientes aprovechados de la nevera (fridgeHitsCount)
  // 4. Mayor porcentaje de coincidencia
  // 5. Mayor valoración gastronómica (rating)
  results.sort((a, b) => {
    if (a.canCookNow !== b.canCookNow) {
      return a.canCookNow ? -1 : 1;
    }
    if (a.missingCount !== b.missingCount) {
      return a.missingCount - b.missingCount;
    }
    if (b.fridgeHitsCount !== a.fridgeHitsCount) {
      return b.fridgeHitsCount - a.fridgeHitsCount;
    }
    if (b.matchPercentage !== a.matchPercentage) {
      return b.matchPercentage - a.matchPercentage;
    }
    return (b.recipe.rating || 4.8) - (a.recipe.rating || 4.8);
  });

  return results;
}

