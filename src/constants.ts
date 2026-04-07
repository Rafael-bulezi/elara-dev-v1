import { Product } from './types';

const generateProducts = (): Product[] => {
  const categories = ['Smartphones', 'Moda', 'Eletrónicos', 'Computadores', 'Casa', 'Beleza', 'Esportes'];
  const products: Product[] = [];
  
  for (let i = 1; i <= 40; i++) {
    const cat = categories[i % categories.length];
    products.push({
      id: `${i}`,
      title: `${cat} Produto ${i}`,
      price: Math.floor(Math.random() * 500000) + 10000,
      originalPrice: Math.random() > 0.5 ? Math.floor(Math.random() * 600000) + 50000 : undefined,
      image: `https://picsum.photos/seed/${cat}${i}/400/400`,
      condition: 'Novo',
      sellerId: 's1',
      sellerName: 'Loja Exemplo',
      sellerAvatar: 'https://picsum.photos/seed/s1/100/100',
      sellerRating: (Math.random() * 2 + 3).toFixed(1) as unknown as number,
      category: cat,
      isImport: Math.random() > 0.5,
      status: 'approved',
      emPromocao: Math.random() > 0.7,
      createdAt: Date.now() - Math.floor(Math.random() * 10000000000),
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
