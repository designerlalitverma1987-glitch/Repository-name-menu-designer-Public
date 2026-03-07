const CATEGORY_ORDER = ['Starters', 'Main Course', 'Drinks', 'Desserts'];

const DISHES = {
  indian: {
    Starters: ['Paneer Tikka', 'Hara Bhara Kebab', 'Chicken 65', 'Dahi Kebab', 'Tandoori Mushrooms'],
    'Main Course': ['Butter Chicken', 'Dal Makhani', 'Paneer Lababdar', 'Mutton Rogan Josh', 'Veg Biryani'],
    Drinks: ['Masala Soda', 'Mango Lassi', 'Jaljeera', 'Sweet Lime Soda', 'Rose Milk'],
    Desserts: ['Gulab Jamun', 'Rasmalai', 'Kulfi', 'Gajar Halwa', 'Kesar Phirni']
  },
  chinese: {
    Starters: ['Veg Spring Rolls', 'Chilli Paneer', 'Chicken Manchurian', 'Crispy Corn', 'Sesame Prawns'],
    'Main Course': ['Hakka Noodles', 'Schezwan Fried Rice', 'Kung Pao Chicken', 'Tofu in Black Bean', 'Veg Manchurian Gravy'],
    Drinks: ['Lemon Iced Tea', 'Peach Cooler', 'Lychee Fizz', 'Mint Mojito', 'Sparkling Ginger'],
    Desserts: ['Honey Noodles', 'Toffee Banana', 'Mango Pudding', 'Sesame Balls', 'Coconut Jelly']
  },
  continental: {
    Starters: ['Bruschetta', 'Caesar Salad', 'Stuffed Mushrooms', 'Grilled Prawns', 'Garlic Bread'],
    'Main Course': ['Herb Roast Chicken', 'Creamy Mushroom Pasta', 'Grilled Fish Fillet', 'Veg Lasagna', 'Steak with Pepper Sauce'],
    Drinks: ['Cold Brew Coffee', 'Berry Spritzer', 'Lemon Basil Cooler', 'Vanilla Milkshake', 'Orange Mint'],
    Desserts: ['Tiramisu', 'Cheesecake', 'Chocolate Mousse', 'Apple Pie', 'Panna Cotta']
  }
};

const TYPE_LABEL = {
  cafe: 'Cafe',
  restaurant: 'Restaurant',
  bistro: 'Bistro',
  bar: 'Bar'
};

function randomRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickMany(items, count) {
  const pool = [...items];
  const picked = [];
  while (picked.length < count && pool.length > 0) {
    const index = randomRange(0, pool.length - 1);
    picked.push(pool.splice(index, 1)[0]);
  }
  return picked;
}

function buildDescription(name, cuisineStyle) {
  return `${name} prepared with ${cuisineStyle} flavors and house seasoning.`;
}

function dishCountForSize(menuSize) {
  if (menuSize === 'small') return 3;
  if (menuSize === 'large') return 6;
  return 4;
}

function makePrice(base, variance) {
  return base + randomRange(0, variance) * 10;
}

export function generateAiMenu({
  restaurantType = 'restaurant',
  menuSize = 'medium',
  cuisineStyle = 'indian',
  generateDescriptions = true
}) {
  const cuisineKey = DISHES[cuisineStyle] ? cuisineStyle : 'indian';
  const cuisineData = DISHES[cuisineKey];
  const count = dishCountForSize(menuSize);

  const blocks = CATEGORY_ORDER.map((category) => {
    const dishes = pickMany(cuisineData[category], count);
    const lines = dishes.map((name, index) => {
      const basePrice = category === 'Main Course' ? 220 : category === 'Desserts' ? 140 : 120;
      const price = makePrice(basePrice, 16 + index * 2);
      if (!generateDescriptions) {
        return `${name} - ${price}`;
      }
      return `${name} - ${price}\n${buildDescription(name, cuisineKey)}`;
    });

    return `Category: ${category}\n${lines.join('\n')}`;
  });

  return {
    title: `${TYPE_LABEL[restaurantType] || 'Restaurant'} ${cuisineKey[0].toUpperCase()}${cuisineKey.slice(1)} Menu`,
    text: blocks.join('\n\n')
  };
}
