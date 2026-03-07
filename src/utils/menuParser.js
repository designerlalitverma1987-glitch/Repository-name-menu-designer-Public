const VEG_KEYWORDS = ['paneer', 'veg', 'dal', 'mushroom', 'tofu'];
const NON_VEG_KEYWORDS = ['chicken', 'mutton', 'fish', 'egg'];

function normalizeText(value) {
  return value.toLowerCase();
}

export function detectFoodType(itemName) {
  const normalized = normalizeText(itemName);
  if (NON_VEG_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
    return 'nonveg';
  }
  if (VEG_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
    return 'veg';
  }
  return 'veg';
}

function parsePriceLine(line) {
  const match = line.match(/^(.*?)(?:\s*[\-\u2013\u2014:]\s*|\s+)(?:rs\.?\s*)?(\d+(?:\.\d{1,2})?)\s*$/i);
  if (!match) {
    return null;
  }

  return {
    name: match[1].trim(),
    price: Number(match[2])
  };
}

export function parseMenuText(menuText) {
  const lines = menuText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const categories = [];
  let currentCategory = null;
  let lastItem = null;

  for (const line of lines) {
    const categoryMatch = line.match(/^category\s*:\s*(.+)$/i);
    if (categoryMatch) {
      currentCategory = {
        name: categoryMatch[1].trim(),
        items: []
      };
      categories.push(currentCategory);
      lastItem = null;
      continue;
    }

    const priceLine = parsePriceLine(line);
    if (priceLine) {
      if (!currentCategory) {
        currentCategory = { name: 'Menu', items: [] };
        categories.push(currentCategory);
      }

      const item = {
        id: '',
        name: priceLine.name,
        price: priceLine.price,
        description: '',
        type: detectFoodType(priceLine.name)
      };
      currentCategory.items.push(item);
      lastItem = item;
      continue;
    }

    if (lastItem) {
      lastItem.description = lastItem.description
        ? `${lastItem.description} ${line}`
        : line;
    }
  }

  return {
    categories: categories
      .map((category, categoryIndex) => ({
        ...category,
        id: `c-${categoryIndex}`,
        items: category.items.map((item, itemIndex) => ({
          ...item,
          id: `c-${categoryIndex}-i-${itemIndex}`
        }))
      }))
      .filter((category) => category.items.length > 0)
  };
}

export function applyManualOverrides(menuData, manualTypeMap) {
  return {
    categories: menuData.categories.map((category) => ({
      ...category,
      items: category.items.map((item) => {
        const override = manualTypeMap[item.id];
        if (!override || override === 'auto') {
          return item;
        }
        return {
          ...item,
          type: override
        };
      })
    }))
  };
}
