const ADJECTIVES = ['Royal', 'Smoky', 'Classic', 'Spicy', 'Creamy', 'Tandoori', 'Garden', 'Chef Special'];
const INGREDIENTS = ['Paneer', 'Mushroom', 'Chicken', 'Tofu', 'Fish', 'Dal', 'Noodles', 'Biryani', 'Tikka'];
const CATEGORY_NAMES = ['Starters', 'Main Course', 'Chef Specials', 'Desserts', 'Drinks'];

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[randomBetween(0, arr.length - 1)];
}

function buildItem() {
  const name = `${pick(ADJECTIVES)} ${pick(INGREDIENTS)}`;
  const price = randomBetween(90, 480);
  const withDescription = Math.random() > 0.55;

  if (!withDescription) {
    return `${name} - ${price}`;
  }

  const description = `A house favorite prepared with aromatic spices and fresh ingredients.`;
  return `${name} - ${price}\n${description}`;
}

export function generateDemoMenu() {
  const categories = CATEGORY_NAMES.slice(0, randomBetween(3, 5));
  const blocks = categories.map((category) => {
    const itemCount = randomBetween(3, 6);
    const items = Array.from({ length: itemCount }, buildItem).join('\n');
    return `Category: ${category}\n${items}`;
  });

  return {
    title: 'Demo Restaurant Menu',
    text: blocks.join('\n\n')
  };
}
