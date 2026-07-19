import { Product } from '../types';

const MOCK_IMAGES = {
  Moda: ['/mock-products/boots-black.jpeg', '/mock-products/sneakers-white.jpeg', '/mock-products/running-orange.jpeg'],
  Smartphones: ['/mock-products/smartphone-black.jpeg', '/mock-products/smartphone-foldable.jpeg'],
  Eletrónicos: ['/mock-products/espresso-chrome.jpeg', '/mock-products/coffee-pourover.jpeg', '/mock-products/pans-copper.jpeg', '/mock-products/pans-steel.jpeg', '/mock-products/fridge-black.jpeg', '/mock-products/fridge-cream.jpeg'],
  Computadores: ['/mock-products/art-books.jpeg'],
  Casa: ['/mock-products/pans-copper.jpeg', '/mock-products/pans-steel.jpeg', '/mock-products/fridge-black.jpeg', '/mock-products/fridge-cream.jpeg', '/mock-products/coffee-pourover.jpeg', '/mock-products/espresso-chrome.jpeg'],
  Beleza: ['/mock-products/watch-gold.jpeg', '/mock-products/watch-silver.jpeg'],
  Esportes: ['/mock-products/running-orange.jpeg', '/mock-products/sneakers-white.jpeg', '/mock-products/boots-black.jpeg'],
  Veículos: ['/mock-products/suv-black.jpeg', '/mock-products/car-silver.jpeg', '/mock-products/sedan-white.jpeg'],
};

const CONDITIONS = ['Novo', 'Novo', 'Semi-novo', 'Usado'] as const;
const TITLES: Record<string, string[]> = {
  Smartphones: ['Smartphone Aura X5', 'Smartphone Fold Z', 'Galaxy Ultra', 'iPhone 15 Pro', 'Xiaomi Redmi Note', 'Tecno Camon', 'Huawei Pura', 'Infinix Zero'],
  Moda: ['Botas Chelsea em Couro', 'Ténis Branco Premium', 'Sapatilhas de Corrida', 'Relógio de Pulso', 'Sapatos Formais', 'T-shirt Casual', 'Calças de Ganga', 'Mala de Couro'],
  Eletrónicos: ['Máquina de Café Espresso', 'Cafeteira Pour-Over', 'Panelas de Cobre', 'Panelas Antiaderentes', 'Frigorífico Preto', 'Frigorífico Vintage', 'Auscultadores Pro', 'Smart Speaker'],
  Computadores: ['Laptop Ultrabook', 'Monitor 4K', 'Teclado Mecânico', 'Rato Sem Fios', 'SSD 1TB', 'Webcam HD', 'Roteador Wi-Fi 6', 'Livros de Arte Moderna'],
  Casa: ['Conjunto de Panelas', 'Frigorífico Moderno', 'Máquina de Café', 'Cafeteira Elegante', 'Sofá 2 Lugares', 'Mesa de Jantar', 'Candeeiro LED', 'Tapete Persa'],
  Beleza: ['Relógio Dourado', 'Relógio Crónografo', 'Perfume Importado', 'Creme Hidratante', 'Serum Facial', 'Protetor Solar', 'Máscara Capilar', 'Esmalte Premium'],
  Esportes: ['Sapatilhas de Corrida', 'Ténis de Padel', 'Bola de Futebol', 'Halteres 10kg', 'Tapete de Yoga', 'Garrafa Térmica', 'Mochila Desportiva', 'Relógio Desportivo'],
  Veículos: ['SUV Preto 2024', 'Carro Eléctrico Prateado', 'Sedan Branco', 'Mota Scooter', 'Carrinha Comercial', 'Jipe 4x4', 'Híbrido Compacto', 'Camião Ligeiro'],
};

const generateProducts = (): Product[] => {
  const categories = ['Smartphones', 'Moda', 'Eletrónicos', 'Computadores', 'Casa', 'Beleza', 'Esportes'];
  const products: Product[] = [];

  for (let i = 1; i <= 48; i++) {
    const cat = categories[i % categories.length];
    const images = MOCK_IMAGES[cat as keyof typeof MOCK_IMAGES] || ['/mock-products/smartphone-black.jpeg'];
    const image = images[i % images.length];
    const condition = CONDITIONS[i % CONDITIONS.length] as 'Novo' | 'Semi-novo' | 'Usado';
    const titleList = TITLES[cat] || TITLES['Smartphones'];
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

export const categories = [
  { id: '1', name: 'Smartphones', icon: 'Smartphone' },
  { id: '2', name: 'Moda', icon: 'Shirt' },
  { id: '3', name: 'Eletrónicos', icon: 'Cpu' },
  { id: '4', name: 'Computadores', icon: 'Laptop' },
  { id: '5', name: 'Casa', icon: 'Home' },
  { id: '6', name: 'Beleza', icon: 'Sparkles' },
  { id: '7', name: 'Esportes', icon: 'Dumbbell' }
];
