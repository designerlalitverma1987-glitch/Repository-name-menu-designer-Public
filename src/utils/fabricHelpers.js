import { fabric } from 'fabric';

const VEG_COLOR = '#2e7d32';
const NON_VEG_COLOR = '#8B0000';

function createMeasureContext(fontFamily = 'DM Sans', fontSize = 16, fontWeight = 400) {
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d');
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  return ctx;
}

function measureWidth(ctx, text) {
  return ctx.measureText(text || '').width;
}

function wrapTextWithMeasure(text, maxWidth, style) {
  if (!text) {
    return [];
  }

  const ctx = createMeasureContext(style.fontFamily, style.fontSize, style.fontWeight);
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (measureWidth(ctx, next) <= maxWidth || !line) {
      line = next;
      continue;
    }

    lines.push(line);
    line = word;
  }

  if (line) {
    lines.push(line);
  }

  return lines;
}

export function iconToSvgString(icon, color = '#111827') {
  const nodes = icon.nodes
    .map((node) => {
      const [tag, attrs] = node;
      const text = Object.entries(attrs)
        .map(([key, value]) => `${key}="${String(value)}"`)
        .join(' ');
      return `<${tag} ${text} />`;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${icon.viewBox}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${nodes}</svg>`;
}

export function addSvgStringAsObject(canvas, svgText, options = {}) {
  return new Promise((resolve) => {
    fabric.loadSVGFromString(svgText, (objects, objectOptions) => {
      const grouped = fabric.util.groupSVGElements(objects, objectOptions);
      grouped.set({
        left: options.left ?? 80,
        top: options.top ?? 80,
        angle: options.angle ?? 0,
        opacity: options.opacity ?? 1,
        data: options.data || {}
      });

      if (options.width) {
        grouped.scaleToWidth(options.width);
      }
      if (options.height) {
        grouped.scaleToHeight(options.height);
      }

      canvas.add(grouped);
      canvas.setActiveObject(grouped);
      canvas.requestRenderAll();
      resolve(grouped);
    });
  });
}

export function addImageToCanvas(canvas, source, options = {}) {
  return new Promise((resolve, reject) => {
    fabric.Image.fromURL(
      source,
      (image) => {
        if (!image) {
          reject(new Error('Image could not be loaded'));
          return;
        }

        image.set({
          left: options.left ?? 80,
          top: options.top ?? 80,
          angle: options.angle ?? 0,
          opacity: options.opacity ?? 1,
          data: options.data || {}
        });

        if (options.width) {
          image.scaleToWidth(options.width);
        }
        if (options.height) {
          image.scaleToHeight(options.height);
        }

        canvas.add(image);
        canvas.setActiveObject(image);
        canvas.requestRenderAll();
        resolve(image);
      },
      { crossOrigin: 'anonymous' }
    );
  });
}

export function createShapeObject(shape, options = {}) {
  const baseData = {
    label: options.data?.label || shape,
    shapeType: shape,
    cornerRadii: options.data?.cornerRadii || { tl: 0, tr: 0, br: 0, bl: 0 },
    ...(options.data || {})
  };

  const common = {
    left: options.left ?? 100,
    top: options.top ?? 100,
    fill: options.fill ?? 'transparent',
    stroke: options.stroke ?? '#334155',
    strokeWidth: options.strokeWidth ?? 2,
    opacity: options.opacity ?? 1,
    angle: options.angle ?? 0,
    data: baseData
  };

  if (shape === 'rectangle') {
    return new fabric.Rect({
      ...common,
      width: options.width ?? 140,
      height: options.height ?? 80,
      rx: options.rx ?? 8,
      ry: options.ry ?? 8
    });
  }

  if (shape === 'circle') {
    const diameter = Math.max(20, options.diameter ?? options.width ?? options.height ?? 110);
    return new fabric.Circle({
      ...common,
      radius: diameter / 2,
      fill: options.fill ?? 'transparent'
    });
  }

  if (shape === 'line') {
    return new fabric.Line([0, 0, options.width ?? 160, 0], {
      ...common,
      fill: 'transparent',
      stroke: options.stroke ?? '#334155'
    });
  }

  if (shape === 'divider') {
    return new fabric.Line([0, 0, options.width ?? 180, 0], {
      ...common,
      strokeDashArray: [3, 5],
      fill: 'transparent'
    });
  }

  if (shape === 'banner') {
    return new fabric.Rect({
      ...common,
      width: options.width ?? 190,
      height: options.height ?? 56,
      rx: 4,
      ry: 4,
      fill: options.fill ?? '#FDE68A',
      stroke: options.stroke ?? '#B45309'
    });
  }

  if (shape === 'badge') {
    return new fabric.Circle({
      ...common,
      radius: options.radius ?? 40,
      fill: options.fill ?? '#FEE2E2',
      stroke: options.stroke ?? '#B91C1C'
    });
  }

  return new fabric.Rect({
    ...common,
    width: options.width ?? 180,
    height: options.height ?? 120,
    rx: 3,
    ry: 3,
    fill: 'transparent'
  });
}

function createFssaiIcon(type, left, top, size = 12, data = {}) {
  const stroke = type === 'nonveg' ? NON_VEG_COLOR : VEG_COLOR;
  const rect = new fabric.Rect({ left: 0, top: 0, width: size, height: size, fill: 'transparent', stroke, strokeWidth: 2, selectable: false, evented: false });

  const symbol =
    type === 'nonveg'
      ? new fabric.Polygon(
          [
            { x: size / 2, y: 2 },
            { x: size - 2, y: size - 2 },
            { x: 2, y: size - 2 }
          ],
          { fill: stroke, selectable: false, evented: false }
        )
      : new fabric.Circle({ left: size / 2 - 3, top: size / 2 - 3, radius: 3, fill: stroke, selectable: false, evented: false });

  return new fabric.Group([rect, symbol], {
    left,
    top,
    selectable: false,
    evented: false,
    data
  });
}

function dottedLine(left, top, width) {
  return new fabric.Line([left, top, left + Math.max(width, 0), top], {
    stroke: '#8b8b8b',
    strokeWidth: 1,
    strokeDashArray: [2, 4],
    selectable: false,
    evented: false,
    data: { role: 'menu' }
  });
}

export function clearMenuObjects(canvas) {
  const removable = canvas
    .getObjects()
    .filter((object) => object.data?.role === 'menu' || object.data?.role === 'menu-logo');

  removable.forEach((object) => canvas.remove(object));
}

export function inferColumns(layoutMode, totalItems) {
  if (layoutMode === 'single') return 1;
  if (layoutMode === 'two') return 2;
  if (layoutMode === 'three') return 3;
  if (layoutMode === 'grid') return 2;

  if (totalItems <= 12) return 1;
  if (totalItems <= 28) return 2;
  return 3;
}

function estimateCategoryHeight(category, columnWidth, typo, spacing) {
  let height = typo.sectionSize + spacing.sectionGap;
  for (const item of category.items) {
    const itemLines = wrapTextWithMeasure(item.name, columnWidth - 120, {
      fontFamily: typo.itemFont,
      fontSize: typo.itemSize,
      fontWeight: typo.itemWeight
    });
    const descLines = wrapTextWithMeasure(item.description, columnWidth - 30, {
      fontFamily: typo.descriptionFont,
      fontSize: typo.descriptionSize,
      fontWeight: typo.descriptionWeight
    });

    height += Math.max(1, itemLines.length) * (typo.itemSize + 3);
    if (descLines.length > 0) {
      height += spacing.descriptionGap + descLines.length * (typo.descriptionSize + 3);
    }
    height += spacing.itemGap;
  }

  return height;
}

function assignCategories(categories, columns, categoryColumns, autoBalance) {
  const buckets = Array.from({ length: columns }, () => []);
  const heights = Array.from({ length: columns }, () => 0);

  categories.forEach((category) => {
    let col = 0;
    const mapped = categoryColumns?.[category.id];
    if (typeof mapped === 'number' && mapped >= 0 && mapped < columns) {
      col = mapped;
    } else if (autoBalance) {
      col = heights.indexOf(Math.min(...heights));
    }

    buckets[col].push(category);
    heights[col] += category.estimatedHeight;
  });

  return buckets;
}

export function autoArrangeMenuOnCanvas({
  canvas,
  menuTitle,
  menu,
  page,
  layoutMode,
  categoryColumns,
  typography,
  logoObject,
  keepExisting = true
}) {
  if (!canvas) {
    return;
  }

  if (!keepExisting) {
    canvas.clear();
  }

  clearMenuObjects(canvas);

  const totalItems = menu.categories.reduce((sum, category) => sum + category.items.length, 0);
  const columns = inferColumns(layoutMode, totalItems);
  const padding = 42;
  const titleTop = 48;
  const logoSpace = logoObject ? 90 : 0;
  const topStart = titleTop + typography.titleSize + 28 + logoSpace;
  const columnGap = columns === 1 ? 0 : 26;
  const columnWidth = (page.width - padding * 2 - columnGap * (columns - 1)) / columns;

  const baseSpacing = {
    sectionGap: 10,
    itemGap: 16,
    descriptionGap: 4
  };

  const categoriesWithHeight = menu.categories.map((category) => ({
    ...category,
    estimatedHeight: estimateCategoryHeight(category, columnWidth, typography, baseSpacing)
  }));

  const buckets = assignCategories(categoriesWithHeight, columns, categoryColumns, layoutMode === 'auto');
  const maxColumnHeight = Math.max(
    ...buckets.map((bucket) => bucket.reduce((sum, category) => sum + category.estimatedHeight, 0)),
    1
  );
  const availableHeight = page.height - topStart - padding;
  const fillFactor = Math.max(1, availableHeight / maxColumnHeight);

  const spacing = {
    sectionGap: baseSpacing.sectionGap * Math.min(1.6, fillFactor),
    itemGap: baseSpacing.itemGap * Math.min(1.8, fillFactor),
    descriptionGap: baseSpacing.descriptionGap * Math.min(1.4, fillFactor)
  };

  const title = new fabric.Text(menuTitle || 'Restaurant Menu', {
    left: page.width / 2,
    top: titleTop,
    originX: 'center',
    fontFamily: typography.titleFont,
    fontWeight: typography.titleWeight,
    fontSize: typography.titleSize,
    fill: typography.titleColor,
    charSpacing: typography.letterSpacing * 60,
    data: { role: 'menu' }
  });
  canvas.add(title);

  if (logoObject) {
    logoObject.set({
      left: page.width / 2,
      top: titleTop + typography.titleSize + 10,
      originX: 'center',
      originY: 'top',
      selectable: true,
      data: { ...(logoObject.data || {}), role: 'menu-logo', kind: 'logo' }
    });
    canvas.add(logoObject);
  }

  for (let col = 0; col < columns; col += 1) {
    const startX = padding + col * (columnWidth + columnGap);
    let y = topStart;

    for (const category of buckets[col]) {
      const heading = new fabric.Text(category.name.toUpperCase(), {
        left: startX,
        top: y,
        fontFamily: typography.sectionFont,
        fontWeight: typography.sectionWeight,
        fontSize: typography.sectionSize,
        fill: typography.sectionColor,
        charSpacing: typography.letterSpacing * 50,
        data: { role: 'menu', categoryId: category.id }
      });
      canvas.add(heading);
      y += typography.sectionSize + spacing.sectionGap;

      for (const item of category.items) {
        const itemTop = y;
        const icon = createFssaiIcon(item.type, startX, itemTop + 3, 12, { role: 'menu' });
        canvas.add(icon);

        const nameX = startX + 20;
        const priceX = startX + columnWidth - 8;
        const nameMaxWidth = Math.max(70, columnWidth - 130);
        const nameLines = wrapTextWithMeasure(item.name, nameMaxWidth, {
          fontFamily: typography.itemFont,
          fontSize: typography.itemSize,
          fontWeight: typography.itemWeight
        });
        const itemName = new fabric.Textbox(nameLines.join('\n') || item.name, {
          left: nameX,
          top: itemTop,
          width: nameMaxWidth,
          fontFamily: typography.itemFont,
          fontWeight: typography.itemWeight,
          fontSize: typography.itemSize,
          fill: typography.itemColor,
          lineHeight: 1.18,
          charSpacing: typography.letterSpacing * 45,
          data: { role: 'menu', itemId: item.id }
        });
        canvas.add(itemName);

        const price = new fabric.Text(`₹${item.price}`, {
          left: priceX,
          top: itemTop,
          originX: 'right',
          fontFamily: typography.priceFont,
          fontWeight: typography.priceWeight,
          fontSize: typography.priceSize,
          fill: typography.priceColor,
          data: { role: 'menu', itemId: item.id }
        });
        canvas.add(price);

        const lineStart = nameX + Math.min(itemName.getScaledWidth(), nameMaxWidth) + 8;
        const lineEnd = priceX - price.getScaledWidth() - 8;
        if (lineEnd > lineStart + 6) {
          canvas.add(dottedLine(lineStart, itemTop + typography.itemSize * 0.65, lineEnd - lineStart));
        }

        y += Math.max(typography.itemSize + 4, itemName.getScaledHeight());

        if (item.description) {
          const descLines = wrapTextWithMeasure(item.description, columnWidth - 28, {
            fontFamily: typography.descriptionFont,
            fontSize: typography.descriptionSize,
            fontWeight: typography.descriptionWeight
          });
          if (descLines.length > 0) {
            y += spacing.descriptionGap;
            const description = new fabric.Textbox(descLines.join('\n'), {
              left: nameX,
              top: y,
              width: columnWidth - 30,
              fontFamily: typography.descriptionFont,
              fontWeight: typography.descriptionWeight,
              fontSize: typography.descriptionSize,
              fill: '#666666',
              lineHeight: 1.18,
              charSpacing: typography.letterSpacing * 30,
              data: { role: 'menu', itemId: item.id }
            });
            canvas.add(description);
            y += description.getScaledHeight();
          }
        }

        y += spacing.itemGap;
      }

      y += spacing.sectionGap;
    }
  }

  canvas.requestRenderAll();
}

export function applyBackgroundStyle(canvas, style, page) {
  if (!canvas) {
    return Promise.resolve();
  }

  if (style === 'none') {
    canvas.setBackgroundColor('transparent', canvas.renderAll.bind(canvas));
    canvas.setBackgroundImage(null, canvas.renderAll.bind(canvas));
    return Promise.resolve();
  }

  const colorMap = {
    plainWhite: '#FFFFFF',
    warmBeige: '#F4E8D8',
    darkTheme: '#1C1917'
  };

  if (colorMap[style]) {
    canvas.setBackgroundImage(null, canvas.renderAll.bind(canvas));
    canvas.setBackgroundColor(colorMap[style], canvas.renderAll.bind(canvas));
    return Promise.resolve();
  }

  const textureMap = {
    paperTexture: '/assets/backgrounds/paper-texture.svg',
    marbleTexture: '/assets/backgrounds/marble-texture.svg',
    woodTexture: '/assets/backgrounds/wood-texture.svg'
  };

  const url = textureMap[style];
  if (!url) {
    canvas.setBackgroundImage(null, canvas.renderAll.bind(canvas));
    canvas.setBackgroundColor('#FFFFFF', canvas.renderAll.bind(canvas));
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    fabric.Image.fromURL(
      url,
      (image) => {
        if (!image) {
          canvas.setBackgroundColor('#FFFFFF', canvas.renderAll.bind(canvas));
          resolve();
          return;
        }

        image.set({
          originX: 'left',
          originY: 'top',
          left: 0,
          top: 0,
          selectable: false,
          evented: false
        });
        image.scaleToWidth(page.width);
        image.scaleToHeight(page.height);

        canvas.setBackgroundColor('transparent', canvas.renderAll.bind(canvas));
        canvas.setBackgroundImage(image, canvas.renderAll.bind(canvas));
        resolve();
      },
      { crossOrigin: 'anonymous' }
    );
  });
}

export function clampToCanvasBounds(obj, canvasWidth, canvasHeight) {
  const width = obj.getScaledWidth();
  const height = obj.getScaledHeight();
  const left = Math.min(Math.max(obj.left ?? 0, 0), Math.max(0, canvasWidth - width));
  const top = Math.min(Math.max(obj.top ?? 0, 0), Math.max(0, canvasHeight - height));
  obj.set({ left, top });
}

export function cloneActiveObject(canvas, activeObject) {
  return new Promise((resolve) => {
    if (!activeObject) {
      resolve(null);
      return;
    }

    activeObject.clone((cloned) => {
      cloned.set({
        left: (activeObject.left || 0) + 20,
        top: (activeObject.top || 0) + 20
      });
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.requestRenderAll();
      resolve(cloned);
    });
  });
}

