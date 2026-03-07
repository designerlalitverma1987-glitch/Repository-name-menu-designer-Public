export const ICON_LIBRARY = [
  {
    id: 'pizza',
    name: 'Pizza',
    group: 'Food',
    viewBox: '0 0 24 24',
    nodes: [
      ['path', { d: 'M2 16l20-8-8 20-3-9-9-3Z' }],
      ['circle', { cx: '10.5', cy: '12', r: '1' }],
      ['circle', { cx: '13', cy: '15.5', r: '1' }]
    ]
  },
  {
    id: 'burger',
    name: 'Burger',
    group: 'Food',
    viewBox: '0 0 24 24',
    nodes: [
      ['path', { d: 'M4 11h16' }],
      ['path', { d: 'M5 11a7 7 0 0 1 14 0' }],
      ['path', { d: 'M4 15h16' }],
      ['path', { d: 'M6 18h12' }]
    ]
  },
  {
    id: 'coffee',
    name: 'Coffee',
    group: 'Drinks',
    viewBox: '0 0 24 24',
    nodes: [
      ['path', { d: 'M3 6h13v7a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V6Z' }],
      ['path', { d: 'M16 8h2a3 3 0 0 1 0 6h-2' }],
      ['path', { d: 'M6 2v2' }],
      ['path', { d: 'M10 2v2' }],
      ['path', { d: 'M14 2v2' }]
    ]
  },
  {
    id: 'wine',
    name: 'Wine Glass',
    group: 'Drinks',
    viewBox: '0 0 24 24',
    nodes: [
      ['path', { d: 'M8 3h8l-1 6a3 3 0 0 1-6 0Z' }],
      ['path', { d: 'M12 9v8' }],
      ['path', { d: 'M9 21h6' }],
      ['path', { d: 'M8 17h8' }]
    ]
  },
  {
    id: 'cake',
    name: 'Cake',
    group: 'Desserts',
    viewBox: '0 0 24 24',
    nodes: [
      ['path', { d: 'M4 12h16v8H4Z' }],
      ['path', { d: 'M12 7v5' }],
      ['path', { d: 'M9 7h6' }],
      ['path', { d: 'M7 16h10' }]
    ]
  },
  {
    id: 'ice-cream',
    name: 'Ice Cream',
    group: 'Desserts',
    viewBox: '0 0 24 24',
    nodes: [
      ['path', { d: 'M8 8a4 4 0 1 1 8 0 5 5 0 0 1-2.3 4.2L12 21l-1.7-8.8A5 5 0 0 1 8 8Z' }]
    ]
  },
  {
    id: 'chef-hat',
    name: 'Chef Hat',
    group: 'Kitchen',
    viewBox: '0 0 24 24',
    nodes: [
      ['path', { d: 'M4 11h16v6H4Z' }],
      ['path', { d: 'M6 11a3 3 0 0 1 0-6 4 4 0 0 1 6-2 4 4 0 0 1 6 2 3 3 0 1 1 0 6' }]
    ]
  },
  {
    id: 'star',
    name: 'Star',
    group: 'Decorative',
    viewBox: '0 0 24 24',
    nodes: [
      ['polygon', { points: '12 2 15 9 22 9 16.5 13.5 18.5 21 12 16.8 5.5 21 7.5 13.5 2 9 9 9' }]
    ]
  },
  {
    id: 'leaf',
    name: 'Leaf',
    group: 'Decorative',
    viewBox: '0 0 24 24',
    nodes: [
      ['path', { d: 'M5 19c8 0 14-6 14-14-8 0-14 6-14 14Z' }],
      ['path', { d: 'M9 15c2-2 4-4 8-6' }]
    ]
  }
];

export const ELEMENT_LIBRARY = [
  { id: 'line', name: 'Line', group: 'Lines', defaultWidth: 120, defaultHeight: 6, defaultColor: '#444444', kind: 'element', elementType: 'line' },
  { id: 'divider', name: 'Divider', group: 'Dividers', defaultWidth: 140, defaultHeight: 10, defaultColor: '#555555', kind: 'element', elementType: 'divider' },
  { id: 'shape-rect', name: 'Rectangle', group: 'Shapes', defaultWidth: 90, defaultHeight: 60, defaultColor: '#C49A33', kind: 'element', elementType: 'rect' },
  { id: 'badge', name: 'Badge', group: 'Badges', defaultWidth: 70, defaultHeight: 70, defaultColor: '#A55D31', kind: 'element', elementType: 'badge' },
  { id: 'star-shape', name: 'Star', group: 'Decorative', defaultWidth: 60, defaultHeight: 60, defaultColor: '#F59E0B', kind: 'element', elementType: 'star' },
  { id: 'leaf-shape', name: 'Leaf', group: 'Decorative', defaultWidth: 66, defaultHeight: 52, defaultColor: '#2F855A', kind: 'element', elementType: 'leaf' },
  { id: 'separator', name: 'Separator', group: 'Decorative', defaultWidth: 150, defaultHeight: 20, defaultColor: '#6B7280', kind: 'element', elementType: 'separator' }
];

export const ICON_GROUPS = ['Food', 'Drinks', 'Desserts', 'Kitchen', 'Decorative'];
export const ELEMENT_GROUPS = ['Lines', 'Dividers', 'Shapes', 'Badges', 'Decorative'];

export function getIconById(id) {
  return ICON_LIBRARY.find((icon) => icon.id === id);
}

export function getElementById(id) {
  return ELEMENT_LIBRARY.find((item) => item.id === id);
}
