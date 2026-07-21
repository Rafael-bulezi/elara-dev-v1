import { Product } from '../types';

/* ─────────────────────────────────────────
   Category map
   - strip: shown in the top pill strip and mobile menu
   - extra: available in search / filters but not in the strip
───────────────────────────────────────── */
export const categories = [
  { id: '1', name: 'Tecnologia',     icon: 'Cpu' },      // Smartphones + Computadores + Eletrónicos
  { id: '2', name: 'Moda',           icon: 'Shirt' },
  { id: '3', name: 'Beleza',         icon: 'Sparkles' },
  { id: '4', name: 'Casa',           icon: 'Home' },     // Casa & Eletrodomésticos
  { id: '5', name: 'Esportes',       icon: 'Dumbbell' },
  { id: '6', name: 'Veículos',       icon: 'Car' },
  { id: '7', name: 'Jóias & Acessórios', icon: 'Gem' },
];

export const extraCategories = [
  { id: '8',  name: 'Brinquedos & Crianças', icon: 'ToyBrick' },
  { id: '9',  name: 'Saúde & Bem-estar',    icon: 'HeartPulse' },
  { id: '10', name: 'Livros & Papelaria',    icon: 'BookOpen' },
  { id: '11', name: 'Pet & Animais',         icon: 'Dog' },
  { id: '12', name: 'Alimentos & Bebidas',   icon: 'Coffee' },
  { id: '13', name: 'Agricultura & Jardim',  icon: 'Leaf' },
  { id: '14', name: 'Ferramentas & Construção', icon: 'Wrench' },
];

export const allCategories = [...categories, ...extraCategories];

const MOCK_IMAGES: Record<string, string[]> = {
  Tecnologia:        ['/mock-products/smartphone-sleek.jpeg', '/mock-products/smartphone-black.jpeg', '/mock-products/smartphone-foldable.jpeg', '/mock-products/camera-dslr-1.jpeg', '/mock-products/camera-dslr-2.jpeg', '/mock-products/headphones-2.jpeg', '/mock-products/art-books.jpeg'],
  Moda:              ['/mock-products/jacket-winter-1.jpeg', '/mock-products/jacket-winter-2.jpeg', '/mock-products/outfit-summer.jpeg', '/mock-products/dress-cocktail.jpeg', '/mock-products/trench-coat.jpeg', '/mock-products/heels-red.jpeg', '/mock-products/boots-black.jpeg', '/mock-products/sneakers-white.jpeg', '/mock-products/running-orange.jpeg'],
  Beleza:            ['/mock-products/cream-face.jpeg', '/mock-products/lotion-body.jpeg', '/mock-products/makeup-lipsticks.jpeg', '/mock-products/serum-bottle.jpeg', '/mock-products/skincare-set.jpeg', '/mock-products/watch-gold.jpeg', '/mock-products/watch-silver.jpeg', '/mock-products/watch-luxury-1.jpeg', '/mock-products/watch-luxury-2.jpeg'],
  Casa:              ['/mock-products/house-luxury-1.jpeg', '/mock-products/house-luxury-2.jpeg', '/mock-products/espresso-chrome.jpeg', '/mock-products/espresso-machine-2.jpeg', '/mock-products/coffee-pourover.jpeg', '/mock-products/cutlery-set.jpeg', '/mock-products/pans-copper.jpeg', '/mock-products/pans-steel.jpeg', '/mock-products/fridge-black.jpeg', '/mock-products/fridge-cream.jpeg'],
  Esportes:          ['/mock-products/camping-tent-1.jpeg', '/mock-products/camping-tent-2.jpeg', '/mock-products/running-orange.jpeg', '/mock-products/sneakers-white.jpeg', '/mock-products/boots-black.jpeg'],
  Veículos:          ['/mock-products/sports-car-blue.jpeg', '/mock-products/sports-car-grey.jpeg', '/mock-products/suv-black.jpeg', '/mock-products/car-silver.jpeg', '/mock-products/sedan-white.jpeg'],
  'Jóias & Acessórios': ['/mock-products/necklace-gold.jpeg', '/mock-products/watch-gold.jpeg', '/mock-products/watch-silver.jpeg', '/mock-products/watch-luxury-1.jpeg', '/mock-products/watch-luxury-2.jpeg', '/mock-products/heels-red.jpeg'],
  'Brinquedos & Crianças': ['/mock-products/product-box.jpeg', '/mock-products/art-books.jpeg'],
  'Saúde & Bem-estar':  ['/mock-products/skincare-set.jpeg'],
  'Livros & Papelaria': ['/mock-products/art-books.jpeg'],
  'Pet & Animais':      ['/mock-products/art-books.jpeg'],
  'Alimentos & Bebidas': ['/mock-products/coffee-pourover.jpeg', '/mock-products/espresso-chrome.jpeg'],
  'Agricultura & Jardim': ['/mock-products/art-books.jpeg'],
  'Ferramentas & Construção': ['/mock-products/pans-steel.jpeg'],
};

const CONDITIONS = ['Novo', 'Novo', 'Semi-novo', 'Usado'] as const;

const TITLES: Record<string, string[]> = {
  Tecnologia:        ['Smartphone Aura X5', 'Smartphone Fold Z', 'iPhone 15 Pro', 'Galaxy Ultra', 'Laptop Ultrabook', 'Monitor 4K', 'Teclado Mecânico', 'Rato Sem Fios', 'SSD 1TB', 'Auscultadores Pro', 'Smart Speaker', 'Tablet 10"'],
  Moda:              ['Vestido de Cocktail', 'Look de Verão', 'Trench Coat', 'Saltos Altos Vermelhos', 'Botas Chelsea', 'Ténis Branco Premium', 'Sapatilhas de Corrida', 'Mala de Couro', 'Calças de Ganga', 'T-shirt Casual', 'Relógio de Pulso', 'Sapatos Formais'],
  Beleza:            ['Creme Revitalizante', 'Loção Corporal Rosé', 'Batom & Paleta', 'Sérum Facial', 'Kit Skincare', 'Perfume Importado', 'Protetor Solar', 'Máscara Capilar', 'Esmalte Premium', 'Hidratante Corporal', 'Óleo de Rosto', 'Mousse de Limpeza'],
  Casa:              ['Máquina de Café Espresso', 'Cafeteira Pour-Over', 'Panelas de Cobre', 'Panelas Antiaderentes', 'Frigorífico Preto', 'Frigorífico Vintage', 'Sofá 2 Lugares', 'Mesa de Jantar', 'Candeeiro LED', 'Tapete Persa', 'Conjunto de Copos', 'Aspirador Vertical'],
  Esportes:          ['Sapatilhas de Corrida', 'Ténis de Padel', 'Bola de Futebol', 'Halteres 10kg', 'Tapete de Yoga', 'Garrafa Térmica', 'Mochila Desportiva', 'Relógio Desportivo', 'Bicicleta Urbana', 'Luvas de Boxe'],
  Veículos:          ['SUV Preto 2024', 'Carro Eléctrico Prateado', 'Sedan Branco', 'Mota Scooter', 'Carrinha Comercial', 'Jipe 4x4', 'Híbrido Compacto', 'Camião Ligeiro'],
  'Jóias & Acessórios': ['Colar de Ouro 18k', 'Relógio Dourado', 'Relógio Crónografo', 'Pulseira Elegante', 'Brincos Minimalistas', 'Anel de Noivado', 'Óculos de Sol', 'Carteira de Couro', 'Cinto Premium', 'Lenço de Seda'],
  'Brinquedos & Crianças': ['Carrinho Telecomandado', 'Boneca Articulada', 'Jogo Educativo', 'Blocos de Construção', 'Peluche Gigante', 'Bicicleta Infantil', 'Quebra-cabeça', 'Pintura Facial'],
  'Saúde & Bem-estar':  ['Termómetro Digital', 'Balança Inteligente', 'Máscara de Dormir', 'Suplemento Vitamínico', 'Tensiómetro', 'Cadeira de Massagem', 'Difusor de Aromas', 'Protetor Solar FPS50'],
  'Livros & Papelaria': ['Livros de Arte Moderna', 'Caderno Premium', 'Caneta Esferográfica', 'Agenda 2026', 'Planner Semanal', 'Livro de Cozinha', 'Dicionário Bilíngue', 'Pasta de Arquivo'],
  'Pet & Animais':      ['Ração Premium Cão', 'Ração Premium Gato', 'Coleira Ajustável', 'Cama para Pet', 'Brinquedo Mordedor', 'Arranhador para Gato', 'Comedouro Automático', 'Shampoo Pet'],
  'Alimentos & Bebidas': ['Café Gourmet', 'Chá Verde Orgânico', 'Azeite Extra Virgem', 'Chocolate Premium', 'Vinho Tinto', 'Refrigerante Importado', 'Cerveja Artesanal', 'Snack Saudável'],
  'Agricultura & Jardim': ['Semente de Hortaliças', 'Regador de Metal', 'Tesoura de Poda', 'Vaso Cerâmico', 'Adubo Orgânico', 'Mangueira de Jardim', 'Luvas de Jardinagem', 'Cortador de Relva'],
  'Ferramentas & Construção': ['Furadeira Eléctrica', 'Chave de Fendas', 'Martelo Profissional', 'Nível a Laser', 'Serra Eléctrica', 'Parafusadora', 'Caixa de Ferramentas', 'Trena 5m'],
};

const generateProducts = (): Product[] => {
  const catNames = allCategories.map(c => c.name);
  const products: Product[] = [];

  for (let i = 1; i <= 64; i++) {
    const cat = catNames[i % catNames.length];
    const images = MOCK_IMAGES[cat] || ['/mock-products/smartphone-black.jpeg'];
    const image = images[i % images.length];
    const condition = CONDITIONS[i % CONDITIONS.length] as 'Novo' | 'Semi-novo' | 'Usado';
    const titleList = TITLES[cat] || TITLES['Tecnologia'];
    const title = titleList[i % titleList.length] || `${cat} ${i}`;
    const basePrice = Math.floor(Math.random() * 400000) + 15000;
    const originalPrice = Math.random() > 0.5 ? Math.round(basePrice * (1 + Math.random() * 0.4)) : undefined;

    products.push({
      id: `${i}`,
      title: `${title} ${Math.floor(i / titleList.length) + 1}`,
      price: basePrice,
      originalPrice,
      image,
      condition,
      sellerId: `s${(i % 4) + 1}`,
      sellerName: ['Loja Premium', 'Tech Angola', 'Moda Luanda', 'Casa & Cia'][i % 4],
      sellerAvatar: '/mock-products/art-books.jpeg',
      sellerRating: Number((Math.random() * 2 + 3).toFixed(1)),
      category: cat,
      isImport: Math.random() > 0.6,
      status: 'approved',
      emPromocao: Math.random() > 0.7,
      stock: Math.floor(Math.random() * 20) + 1,
      createdAt: Date.now() - Math.floor(Math.random() * 10000000000),
      verified: i % 3 === 0,
    });
  }
  return products;
};

export const initialProducts: Product[] = generateProducts();
