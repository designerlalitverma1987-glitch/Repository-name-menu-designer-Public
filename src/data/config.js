export const DEFAULT_MENU_TEXT = `Category: Starters
Paneer Tikka - 180
Grilled cottage cheese cubes marinated in spices.
Veg Manchurian - 150
Chicken Wings - 220

Category: Main Course
Butter Chicken - 320
Dal Makhani - 240
Veg Biryani - 260

Category: Drinks
Mango Shake - 120
Masala Soda - 60`;

export const PAGE_DIMENSIONS = {
  A5: { width: 559, height: 794 },
  A4: { width: 794, height: 1123 },
  A3: { width: 1123, height: 1587 }
};

export const TYPOGRAPHY_PRESETS = {
  A5: { title: 26, category: 20, item: 15, description: 12, price: 14, lineHeight: 1.35, letterSpacing: 0.15 },
  A4: { title: 32, category: 24, item: 17, description: 13, price: 16, lineHeight: 1.35, letterSpacing: 0.15 },
  A3: { title: 40, category: 28, item: 20, description: 14, price: 18, lineHeight: 1.34, letterSpacing: 0.15 }
};

export const DEFAULT_FONT_STYLES = {
  fontFamily: '"DM Sans", sans-serif',
  titleFont: '',
  itemFont: '',
  descriptionFont: '',
  priceFont: ''
};

const BASE_SPACING = {
  A5: { margin: 24, padding: 20, categoryGap: 16, itemGap: 14, columnGap: 16, descriptionGap: 4 },
  A4: { margin: 36, padding: 26, categoryGap: 18, itemGap: 16, columnGap: 24, descriptionGap: 4 },
  A3: { margin: 44, padding: 32, categoryGap: 22, itemGap: 18, columnGap: 30, descriptionGap: 4 }
};

export const STYLE_PRESETS = {
  minimal: {
    key: 'minimal',
    label: 'Minimal',
    titleFont: '"Playfair Display", serif',
    bodyFont: '"DM Sans", sans-serif',
    defaultTheme: 'minimalBlack',
    decoration: 'minimal'
  },
  cafe: {
    key: 'cafe',
    label: 'Cafe Style',
    titleFont: '"Lora", serif',
    bodyFont: '"Raleway", sans-serif',
    defaultTheme: 'cafeBrown',
    decoration: 'cafe'
  },
  fineDining: {
    key: 'fineDining',
    label: 'Fine Dining',
    titleFont: '"Cormorant Garamond", serif',
    bodyFont: '"Libre Baskerville", serif',
    defaultTheme: 'elegantGold',
    decoration: 'fineDining'
  },
  modern: {
    key: 'modern',
    label: 'Modern Restaurant',
    titleFont: '"Bebas Neue", sans-serif',
    bodyFont: '"DM Sans", sans-serif',
    defaultTheme: 'darkTheme',
    decoration: 'modern'
  },
  street: {
    key: 'street',
    label: 'Street Food',
    titleFont: '"Oswald", sans-serif',
    bodyFont: '"DM Sans", sans-serif',
    defaultTheme: 'freshGreen',
    decoration: 'street'
  },
  vintage: {
    key: 'vintage',
    label: 'Vintage',
    titleFont: '"Playfair Display", serif',
    bodyFont: '"Lora", serif',
    defaultTheme: 'cafeBrown',
    decoration: 'vintage'
  }
};

export const THEME_PRESETS = {
  darkTheme: {
    background: '#18181B',
    surface: '#27272A',
    text: '#F4F4F5',
    subtext: '#D4D4D8',
    accent: '#FB923C',
    border: '#3F3F46',
    price: '#FDBA74'
  },
  elegantGold: {
    background: '#18130C',
    surface: '#241D12',
    text: '#FDF3D8',
    subtext: '#F5E5C2',
    accent: '#C49A33',
    border: '#9F7C2B',
    price: '#EAC66E'
  },
  cafeBrown: {
    background: '#F4E8D8',
    surface: '#FFF8EE',
    text: '#3C2A1E',
    subtext: '#6A4E37',
    accent: '#A55D31',
    border: '#D7B48E',
    price: '#7B3F00'
  },
  freshGreen: {
    background: '#F1FAF2',
    surface: '#FFFFFF',
    text: '#143D2A',
    subtext: '#2F6547',
    accent: '#3FA46A',
    border: '#A8D5B8',
    price: '#2B7D4E'
  },
  minimalBlack: {
    background: '#FAFAFA',
    surface: '#FFFFFF',
    text: '#141414',
    subtext: '#3A3A3A',
    accent: '#222222',
    border: '#D9D9D9',
    price: '#111111'
  }
};

export function getTypographyDefaults(pageSize) {
  return { ...TYPOGRAPHY_PRESETS[pageSize] };
}

export function getSpacingDefaults(pageSize, columns) {
  const base = BASE_SPACING[pageSize];
  const columnFactor = columns === 1 ? 1 : columns === 2 ? 0.92 : 0.84;
  return {
    margin: Math.round(base.margin),
    padding: Math.round(base.padding * columnFactor),
    categoryGap: Number((base.categoryGap * columnFactor).toFixed(1)),
    itemGap: Number((base.itemGap * columnFactor).toFixed(1)),
    columnGap: Number((base.columnGap * columnFactor).toFixed(1)),
    descriptionGap: Number((base.descriptionGap).toFixed(1))
  };
}

export function getPageDimensions(pageSize, orientation) {
  const page = PAGE_DIMENSIONS[pageSize];
  if (orientation === 'landscape') {
    return { width: page.height, height: page.width };
  }
  return page;
}
