const FSSAI_VEG_COLOR = '#2e7d32';
const FSSAI_NON_VEG_COLOR = '#8B0000';

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function estimateTextWidth(text, fontSize, letterSpacing = 0) {
  return text.length * (fontSize * 0.54 + letterSpacing * 0.45);
}

function breakLongWord(word, maxWidth, fontSize, letterSpacing) {
  const parts = [];
  let current = '';

  for (const char of word) {
    const next = current + char;
    if (estimateTextWidth(next, fontSize, letterSpacing) <= maxWidth || current.length === 0) {
      current = next;
      continue;
    }

    parts.push(current);
    current = char;
  }

  if (current) {
    parts.push(current);
  }

  return parts;
}

function wrapText(text, maxWidth, fontSize, letterSpacing = 0) {
  if (!text) {
    return [];
  }

  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';

  for (const word of words) {
    if (estimateTextWidth(word, fontSize, letterSpacing) > maxWidth) {
      const parts = breakLongWord(word, maxWidth, fontSize, letterSpacing);
      for (const part of parts) {
        if (line) {
          lines.push(line);
          line = '';
        }
        lines.push(part);
      }
      continue;
    }

    const candidate = line ? `${line} ${word}` : word;
    if (estimateTextWidth(candidate, fontSize, letterSpacing) <= maxWidth) {
      line = candidate;
    } else {
      if (line) {
        lines.push(line);
      }
      line = word;
    }
  }

  if (line) {
    lines.push(line);
  }

  return lines;
}

function scaleTypography(typography, scale) {
  return {
    title: typography.title * scale,
    category: typography.category * scale,
    item: typography.item * scale,
    description: typography.description * scale,
    price: typography.price * scale,
    lineHeight: Math.max(1.05, typography.lineHeight * (1 - (1 - scale) * 0.2)),
    letterSpacing: typography.letterSpacing * (0.7 + scale * 0.3)
  };
}

function scaleSpacing(spacing, scale) {
  return {
    margin: spacing.margin,
    padding: spacing.padding * scale,
    categoryGap: spacing.categoryGap * scale,
    itemGap: spacing.itemGap * scale,
    columnGap: spacing.columnGap * scale,
    descriptionGap: spacing.descriptionGap * scale
  };
}

function toPriceText(value) {
  return `₹${Number(value)}`;
}

function measureMenuItem(item, columnWidth, typography, spacing) {
  const iconSize = 14;
  const xIcon = 2;
  const xName = 20;
  const xPrice = columnWidth - 10;
  const priceText = toPriceText(item.price);

  const priceWidth = estimateTextWidth(priceText, typography.price, typography.letterSpacing);
  const nameMaxWidth = Math.max(56, xPrice - xName - priceWidth - 18);
  const descMaxWidth = Math.max(80, columnWidth - xName - 10);

  const itemLineHeight = typography.item * typography.lineHeight;
  const descriptionLineHeight = typography.description * typography.lineHeight;

  const nameLines = wrapText(item.name, nameMaxWidth, typography.item, typography.letterSpacing);
  const descriptionLines = wrapText(
    item.description,
    descMaxWidth,
    typography.description,
    typography.letterSpacing
  );

  const nameHeight = Math.max(itemLineHeight, nameLines.length * itemLineHeight, iconSize);
  const descriptionHeight = descriptionLines.length * descriptionLineHeight;

  const leaderStart =
    xName + estimateTextWidth(nameLines[0] || '', typography.item, typography.letterSpacing) + 8;
  const leaderEnd = xPrice - priceWidth - 8;

  const blockHeight =
    nameHeight +
    (descriptionLines.length > 0 ? spacing.descriptionGap + descriptionHeight : 0) +
    spacing.itemGap;

  return {
    ...item,
    xIcon,
    iconSize,
    xName,
    xPrice,
    priceText,
    nameLines,
    descriptionLines,
    descMaxWidth,
    nameHeight,
    descriptionHeight,
    leaderStart,
    leaderEnd,
    descriptionGap: spacing.descriptionGap,
    blockHeight
  };
}

function renderMenuItem(item, localY, columnWidth, typography, spacing) {
  const measured = measureMenuItem(item, columnWidth, typography, spacing);
  return {
    ...measured,
    y: localY,
    nextY: localY + measured.blockHeight
  };
}

function renderCategory(category, columnWidth, typography, spacing) {
  const titleLines = wrapText(category.name, columnWidth, typography.category, typography.letterSpacing);
  const titleLineHeight = typography.category * typography.lineHeight;
  const itemsStartGap = Math.max(8, spacing.itemGap * 0.6);

  let localY = 0;
  localY += titleLines.length * titleLineHeight + itemsStartGap;

  const items = category.items.map((item) => {
    const rendered = renderMenuItem(item, localY, columnWidth, typography, spacing);
    localY = rendered.nextY;
    return rendered;
  });

  localY += spacing.categoryGap;

  return {
    id: category.id,
    name: category.name,
    titleLines,
    items,
    height: localY
  };
}

function assignCategoriesToColumns(categories, columnCount) {
  const columns = Array.from({ length: columnCount }, () => ({ height: 0, categories: [] }));

  for (const category of categories) {
    let target = 0;
    for (let index = 1; index < columns.length; index += 1) {
      if (columns[index].height < columns[target].height) {
        target = index;
      }
    }

    columns[target].categories.push({
      ...category,
      y: columns[target].height
    });
    columns[target].height += category.height;
  }

  return columns;
}

export function computeMenuLayout({ menu, page, columns, typography, spacing, radius }) {
  const safeColumns = Math.max(1, Math.min(3, columns));

  const outer = {
    x: spacing.margin,
    y: spacing.margin,
    width: page.width - spacing.margin * 2,
    height: page.height - spacing.margin * 2,
    radius
  };

  let scale = 1;
  let layout = null;

  for (let attempt = 0; attempt < 24; attempt += 1) {
    const scaledTypography = scaleTypography(typography, scale);
    const scaledSpacing = scaleSpacing(spacing, scale);

    const contentWidth = outer.width - scaledSpacing.padding * 2;
    const contentHeight = outer.height - scaledSpacing.padding * 2 - scaledTypography.title * 1.45;
    const columnWidth = (contentWidth - scaledSpacing.columnGap * (safeColumns - 1)) / safeColumns;

    const categories = menu.categories.map((category) =>
      renderCategory(category, columnWidth, scaledTypography, scaledSpacing)
    );

    const columnsLayout = assignCategoriesToColumns(categories, safeColumns);
    const maxHeight = Math.max(...columnsLayout.map((column) => column.height), 0);

    layout = {
      scale,
      overflow: maxHeight > contentHeight,
      outer,
      contentTop: outer.y + scaledSpacing.padding + scaledTypography.title * 1.45,
      titleY: outer.y + scaledSpacing.padding + scaledTypography.title,
      typography: scaledTypography,
      spacing: scaledSpacing,
      columns: columnsLayout.map((column, index) => {
        const x = outer.x + scaledSpacing.padding + index * (columnWidth + scaledSpacing.columnGap);
        return {
          x,
          width: columnWidth,
          endX: x + columnWidth,
          categories: column.categories,
          height: column.height
        };
      })
    };

    if (!layout.overflow || scale <= 0.58) {
      break;
    }

    scale *= 0.94;
  }

  return layout;
}

function buildFssaiIcon(type, x, y, size) {
  if (type === 'nonveg') {
    return `
      <g class="fssai-icon non-veg" transform="translate(${x} ${y})">
        <rect x="1" y="1" width="${size - 2}" height="${size - 2}" fill="none" stroke="${FSSAI_NON_VEG_COLOR}" stroke-width="2" />
        <polygon points="${size / 2},3 ${size - 3},${size - 3} 3,${size - 3}" fill="${FSSAI_NON_VEG_COLOR}" />
      </g>
    `;
  }

  return `
    <g class="fssai-icon veg" transform="translate(${x} ${y})">
      <rect x="1" y="1" width="${size - 2}" height="${size - 2}" fill="none" stroke="${FSSAI_VEG_COLOR}" stroke-width="2" />
      <circle cx="${size / 2}" cy="${size / 2}" r="3" fill="${FSSAI_VEG_COLOR}" />
    </g>
  `;
}

function getFonts(fontStyles, stylePreset) {
  const bodyFallback = fontStyles.fontFamily || stylePreset.bodyFont || 'sans-serif';

  return {
    title: fontStyles.titleFont || stylePreset.titleFont || bodyFallback,
    item: fontStyles.itemFont || bodyFallback,
    description: fontStyles.descriptionFont || bodyFallback,
    price: fontStyles.priceFont || bodyFallback
  };
}

function renderDecorations(styleKey, outer, theme) {
  if (styleKey === 'fineDining') {
    return `<rect x="${outer.x + 10}" y="${outer.y + 10}" width="${outer.width - 20}" height="${
      outer.height - 20
    }" fill="none" stroke="${theme.accent}" stroke-width="1.2" />`;
  }

  if (styleKey === 'cafe') {
    return `
      <g opacity="0.18" stroke="${theme.accent}">
        <line x1="${outer.x + 20}" y1="${outer.y + 60}" x2="${outer.x + outer.width - 20}" y2="${
      outer.y + 60
    }" stroke-width="1" />
        <line x1="${outer.x + 20}" y1="${outer.y + outer.height - 60}" x2="${
      outer.x + outer.width - 20
    }" y2="${outer.y + outer.height - 60}" stroke-width="1" />
      </g>
    `;
  }

  if (styleKey === 'modern') {
    return `<rect x="${outer.x}" y="${outer.y}" width="${outer.width}" height="16" fill="${
      theme.accent
    }" opacity="0.85" />`;
  }

  if (styleKey === 'street') {
    return `
      <rect x="${outer.x}" y="${outer.y}" width="9" height="${outer.height}" fill="${
      theme.accent
    }" opacity="0.8" />
      <rect x="${outer.x + outer.width - 9}" y="${outer.y}" width="9" height="${outer.height}" fill="${
      theme.accent
    }" opacity="0.8" />
    `;
  }

  if (styleKey === 'vintage') {
    return `<rect x="${outer.x + 6}" y="${outer.y + 6}" width="${outer.width - 12}" height="${
      outer.height - 12
    }" fill="none" stroke="${theme.border}" stroke-width="1.2" stroke-dasharray="4 4" />`;
  }

  return '';
}

export function generateSvgMarkup({
  layout,
  page,
  menuTitle,
  stylePreset,
  theme,
  fontStyles
}) {
  if (!layout) {
    return '';
  }

  const { outer, columns, typography, contentTop, titleY } = layout;
  const fonts = getFonts(fontStyles, stylePreset);

  const parts = [
    `<svg width="${page.width}" height="${page.height}" viewBox="0 0 ${page.width} ${page.height}" xmlns="http://www.w3.org/2000/svg">`,
    `<rect x="0" y="0" width="${page.width}" height="${page.height}" fill="${theme.background}"/>`,
    `<rect x="${outer.x}" y="${outer.y}" width="${outer.width}" height="${outer.height}" rx="${outer.radius}" fill="${
      theme.surface
    }" stroke="${theme.border}" stroke-width="1.4"/>`,
    renderDecorations(stylePreset.key, outer, theme),
    `<text x="${outer.x + outer.width / 2}" y="${titleY}" text-anchor="middle" font-family="${escapeXml(
      fonts.title
    )}" font-size="${typography.title}" font-weight="700" letter-spacing="${typography.letterSpacing}" fill="${
      theme.accent
    }">${escapeXml(menuTitle || 'Restaurant Menu')}</text>`,
    `<line x1="${outer.x + 24}" y1="${contentTop - typography.item * 0.4}" x2="${
      outer.x + outer.width - 24
    }" y2="${contentTop - typography.item * 0.4}" stroke="${theme.border}" stroke-width="1"/>`
  ];

  columns.forEach((column) => {
    column.categories.forEach((category) => {
      const categoryY = contentTop + category.y;
      const categoryLineHeight = typography.category * typography.lineHeight;
      const itemLineHeight = typography.item * typography.lineHeight;
      const descriptionLineHeight = typography.description * typography.lineHeight;

      parts.push(`<g class="menu-category" data-category-id="${category.id}">`);

      category.titleLines.forEach((line, lineIndex) => {
        parts.push(
          `<text x="${column.x}" y="${
            categoryY + typography.category + lineIndex * categoryLineHeight
          }" font-family="${escapeXml(fonts.title)}" font-size="${
            typography.category
          }" font-weight="700" letter-spacing="${typography.letterSpacing}" fill="${theme.accent}">${escapeXml(
            line
          )}</text>`
        );
      });

      category.items.forEach((item) => {
        const itemStartY = categoryY + item.y;
        const itemNameY = itemStartY + typography.item;
        const iconX = column.x + item.xIcon;
        const iconY = itemStartY + Math.max(0, (item.nameHeight - item.iconSize) / 2);
        const nameX = column.x + item.xName;
        const priceX = column.x + item.xPrice;

        parts.push(`<g class="menu-item" data-item-id="${item.id}">`);
        parts.push(buildFssaiIcon(item.type, iconX, iconY, item.iconSize));

        item.nameLines.forEach((line, lineIndex) => {
          parts.push(
            `<text x="${nameX}" y="${itemNameY + lineIndex * itemLineHeight}" font-family="${escapeXml(
              fonts.item
            )}" font-size="${typography.item}" font-weight="700" letter-spacing="${
              typography.letterSpacing
            }" fill="${theme.text}">${escapeXml(line)}</text>`
          );
        });

        if (item.leaderEnd > item.leaderStart + 8) {
          parts.push(
            `<line x1="${column.x + item.leaderStart}" y1="${
              itemNameY - typography.item * 0.35
            }" x2="${column.x + item.leaderEnd}" y2="${itemNameY - typography.item * 0.35}" stroke="${
              theme.subtext
            }" stroke-width="1" stroke-dasharray="1 5" />`
          );
        }

        parts.push(
          `<text x="${priceX}" y="${itemNameY}" text-anchor="end" font-family="${escapeXml(
            fonts.price
          )}" font-size="${typography.price}" font-weight="700" letter-spacing="${
            typography.letterSpacing
          }" fill="${theme.price}">${escapeXml(item.priceText)}</text>`
        );

        item.descriptionLines.forEach((line, lineIndex) => {
          const y =
            itemStartY +
            item.nameHeight +
            item.descriptionGap +
            typography.description +
            lineIndex * descriptionLineHeight;
          parts.push(
            `<text x="${nameX}" y="${y}" font-family="${escapeXml(
              fonts.description
            )}" font-size="${typography.description}" font-weight="400" letter-spacing="${
              typography.letterSpacing * 0.75
            }" fill="#666">${escapeXml(line)}</text>`
          );
        });

        parts.push('</g>');
      });

      parts.push('</g>');
    });
  });

  parts.push('</svg>');

  return parts.join('');
}
