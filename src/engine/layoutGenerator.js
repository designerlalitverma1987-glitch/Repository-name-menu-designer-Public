const FSSAI_VEG_COLOR = '#2e7d32';
const FSSAI_NON_VEG_COLOR = '#c62828';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

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

function applyDensityMode(spacing, densityMode, totalItems, columns, contentHeight, typography, template) {
  const densityMultiplier =
    densityMode === 'compact' ? 0.82 : densityMode === 'relaxed' ? 1.2 : 1;

  let itemFactor = densityMultiplier;
  let sectionFactor = densityMultiplier;
  let descriptionFactor = densityMultiplier;

  if (densityMode === 'auto') {
    const avgPerColumn = totalItems > 0 ? totalItems / columns : 0;

    let scarcityBoost = 1;
    if (avgPerColumn <= 4) scarcityBoost = 1.9;
    else if (avgPerColumn <= 7) scarcityBoost = 1.6;
    else if (avgPerColumn <= 10) scarcityBoost = 1.35;
    else if (avgPerColumn <= 14) scarcityBoost = 1.15;

    const estimatedBlockHeight =
      typography.item * typography.lineHeight +
      typography.description * typography.lineHeight +
      spacing.descriptionGap +
      spacing.itemGap;
    const estimatedColumnHeight = Math.max(estimatedBlockHeight, 1) * avgPerColumn;
    const fillRatio = contentHeight / Math.max(estimatedColumnHeight, 1);
    const fillBoost = clamp(fillRatio, 1, 1.75);

    itemFactor = scarcityBoost * fillBoost;
    sectionFactor = clamp(itemFactor * 0.9, 1, 2.2);
    descriptionFactor = clamp(1 + (itemFactor - 1) * 0.6, 1, 1.8);
  }

  const templateFactor = template?.spacingMultiplier || 1;

  return {
    margin: spacing.margin,
    padding: spacing.padding,
    itemGap: spacing.itemGap * itemFactor * templateFactor,
    categoryGap: spacing.categoryGap * sectionFactor * templateFactor,
    descriptionGap: spacing.descriptionGap * descriptionFactor,
    columnGap: spacing.columnGap * templateFactor
  };
}

function scaleSpacing(spacing, scale, densityMode, totalItems, columns, contentHeight, typography, template) {
  const scaled = {
    margin: spacing.margin,
    padding: spacing.padding * scale,
    categoryGap: spacing.categoryGap * scale,
    itemGap: spacing.itemGap * scale,
    columnGap: spacing.columnGap * scale,
    descriptionGap: spacing.descriptionGap * scale
  };

  return applyDensityMode(
    scaled,
    densityMode,
    totalItems,
    columns,
    contentHeight,
    typography,
    template
  );
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

export function computeMenuLayout({
  menu,
  page,
  columns,
  typography,
  spacing,
  radius,
  densityMode = 'normal',
  template,
  hasLogo = false,
  logoSize = 80
}) {
  const safeColumns = Math.max(1, Math.min(3, columns));
  const totalItems = menu.categories.reduce((sum, category) => sum + category.items.length, 0);

  const outer = {
    x: spacing.margin,
    y: spacing.margin,
    width: page.width - spacing.margin * 2,
    height: page.height - spacing.margin * 2,
    radius
  };

  let scale = 1;
  let layout = null;

  for (let attempt = 0; attempt < 26; attempt += 1) {
    const scaledTypography = scaleTypography(typography, scale);

    const logoBlock = hasLogo ? logoSize + 12 : 0;
    const headerHeight = logoBlock + scaledTypography.title + 16;
    const preContentHeight = outer.height - spacing.padding * 2 - headerHeight;

    const scaledSpacing = scaleSpacing(
      spacing,
      scale,
      densityMode,
      totalItems,
      safeColumns,
      preContentHeight,
      scaledTypography,
      template
    );

    const contentWidth = outer.width - scaledSpacing.padding * 2;
    const contentHeight = outer.height - scaledSpacing.padding * 2 - headerHeight;
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
      logoY: outer.y + scaledSpacing.padding,
      logoSize,
      contentTop: outer.y + scaledSpacing.padding + headerHeight,
      titleY: outer.y + scaledSpacing.padding + logoBlock + scaledTypography.title,
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

    if (!layout.overflow || scale <= 0.55) {
      break;
    }

    scale *= 0.94;
  }

  return layout;
}

function fontFamilyWithFallback(name, fallback = 'sans-serif') {
  if (!name) {
    return fallback;
  }
  return name.includes(' ') ? `'${name}', ${fallback}` : `${name}, ${fallback}`;
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

function getTypographyStyles(fontStyles, stylePreset) {
  const bodyFallback = fontStyles.fontFamily || stylePreset.bodyFont || 'sans-serif';

  return {
    titleFont: fontFamilyWithFallback(fontStyles.titleFont || stylePreset.titleFont, bodyFallback),
    sectionFont: fontFamilyWithFallback(fontStyles.sectionFont || stylePreset.bodyFont, bodyFallback),
    itemFont: fontFamilyWithFallback(fontStyles.itemFont || stylePreset.bodyFont, bodyFallback),
    descriptionFont: fontFamilyWithFallback(
      fontStyles.descriptionFont || stylePreset.bodyFont,
      bodyFallback
    ),
    priceFont: fontFamilyWithFallback(fontStyles.priceFont || stylePreset.bodyFont, bodyFallback),
    titleWeight: fontStyles.titleWeight || 700,
    sectionWeight: fontStyles.sectionWeight || 700,
    itemWeight: fontStyles.itemWeight || 700,
    descriptionWeight: fontStyles.descriptionWeight || 400,
    priceWeight: fontStyles.priceWeight || 700
  };
}

function getBackgroundDefinition(backgroundStyle) {
  if (backgroundStyle === 'marbleTexture') {
    return {
      defs: `
        <pattern id="menu-marble" patternUnits="userSpaceOnUse" width="120" height="120">
          <rect width="120" height="120" fill="#F7F7F7" />
          <path d="M0 20 C25 5, 70 30, 120 14" stroke="#D8D8D8" stroke-width="1.2" fill="none"/>
          <path d="M0 65 C25 45, 70 80, 120 58" stroke="#DCDCDC" stroke-width="1" fill="none"/>
          <path d="M0 105 C45 88, 75 124, 120 98" stroke="#D5D5D5" stroke-width="1.1" fill="none"/>
        </pattern>
      `,
      fill: 'url(#menu-marble)'
    };
  }

  if (backgroundStyle === 'paperTexture') {
    return {
      defs: `
        <pattern id="menu-paper" patternUnits="userSpaceOnUse" width="48" height="48">
          <rect width="48" height="48" fill="#F7F1E7" />
          <circle cx="9" cy="11" r="0.8" fill="#E8DDCB" />
          <circle cx="28" cy="20" r="0.7" fill="#E3D8C5" />
          <circle cx="40" cy="37" r="0.9" fill="#E5D9C7" />
          <path d="M2 24 L46 24" stroke="#EDE2D2" stroke-width="0.5" />
        </pattern>
      `,
      fill: 'url(#menu-paper)'
    };
  }

  if (backgroundStyle === 'warmBeige') {
    return { defs: '', fill: '#F4E8D8' };
  }

  if (backgroundStyle === 'darkTheme') {
    return { defs: '', fill: '#171717' };
  }

  return { defs: '', fill: '#FFFFFF' };
}

function dividerMarkup(style, x1, x2, y, color) {
  if (style === 'none') {
    return '';
  }

  if (style === 'double') {
    return `
      <line x1="${x1}" y1="${y - 1.5}" x2="${x2}" y2="${y - 1.5}" stroke="${color}" stroke-width="0.8" />
      <line x1="${x1}" y1="${y + 1.5}" x2="${x2}" y2="${y + 1.5}" stroke="${color}" stroke-width="0.8" />
    `;
  }

  if (style === 'solid') {
    return `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${color}" stroke-width="1" />`;
  }

  return `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${color}" stroke-width="1" stroke-dasharray="1 5" />`;
}

function sectionLabelByStyle(label, sectionStyle) {
  return sectionStyle === 'caps' ? label.toUpperCase() : label;
}

function sectionDecoration(sectionStyle, x, y, width, lineHeight, color) {
  if (sectionStyle === 'boxed') {
    return `<rect x="${x - 8}" y="${y - lineHeight * 0.8}" width="${width + 16}" height="${lineHeight}" fill="none" stroke="${color}" stroke-width="1" rx="4" />`;
  }

  if (sectionStyle === 'underline') {
    return `<line x1="${x}" y1="${y + 4}" x2="${x + width}" y2="${y + 4}" stroke="${color}" stroke-width="1" />`;
  }

  return '';
}

export function generateSvgMarkup({
  layout,
  page,
  menuTitle,
  stylePreset,
  theme,
  fontStyles,
  logoDataUrl,
  backgroundStyle = 'plainWhite'
}) {
  if (!layout) {
    return '';
  }

  const { outer, columns, typography, contentTop, titleY, logoY, logoSize } = layout;
  const fonts = getTypographyStyles(fontStyles, stylePreset);
  const background = getBackgroundDefinition(backgroundStyle);

  const logoX = outer.x + outer.width / 2 - logoSize / 2;

  const parts = [
    `<svg width="${page.width}" height="${page.height}" viewBox="0 0 ${page.width} ${page.height}" xmlns="http://www.w3.org/2000/svg">`,
    background.defs ? `<defs>${background.defs}</defs>` : '',
    `<rect x="0" y="0" width="${page.width}" height="${page.height}" fill="${background.fill}"/>`,
    `<rect x="${outer.x}" y="${outer.y}" width="${outer.width}" height="${outer.height}" rx="${outer.radius}" fill="${
      theme.surface
    }" stroke="${theme.border}" stroke-width="1.4"/>`
  ];

  if (logoDataUrl) {
    parts.push(
      `<image href="${escapeXml(logoDataUrl)}" x="${logoX}" y="${logoY}" width="${logoSize}" height="${logoSize}" preserveAspectRatio="xMidYMid meet"/>`
    );
  }

  parts.push(
    `<text x="${outer.x + outer.width / 2}" y="${titleY}" text-anchor="middle" font-family="${escapeXml(
      fonts.titleFont
    )}" font-size="${typography.title}" font-weight="${fonts.titleWeight}" letter-spacing="${
      typography.letterSpacing
    }" fill="${theme.accent}">${escapeXml(menuTitle || 'Restaurant Menu')}</text>`
  );

  parts.push(
    `<line x1="${outer.x + 24}" y1="${contentTop - typography.item * 0.4}" x2="${
      outer.x + outer.width - 24
    }" y2="${contentTop - typography.item * 0.4}" stroke="${theme.border}" stroke-width="1"/>`
  );

  columns.forEach((column) => {
    column.categories.forEach((category) => {
      const categoryY = contentTop + category.y;
      const categoryLineHeight = typography.category * typography.lineHeight;
      const itemLineHeight = typography.item * typography.lineHeight;
      const descriptionLineHeight = typography.description * typography.lineHeight;

      parts.push(`<g class="menu-category" data-category-id="${category.id}">`);

      category.titleLines.forEach((line, lineIndex) => {
        const label = sectionLabelByStyle(line, stylePreset.sectionStyle);
        const y = categoryY + typography.category + lineIndex * categoryLineHeight;
        const width = estimateTextWidth(label, typography.category, typography.letterSpacing);

        parts.push(sectionDecoration(stylePreset.sectionStyle, column.x, y, width, categoryLineHeight, theme.accent));
        parts.push(
          `<text x="${column.x}" y="${y}" font-family="${escapeXml(
            fonts.sectionFont
          )}" font-size="${typography.category}" font-weight="${fonts.sectionWeight}" letter-spacing="${
            typography.letterSpacing
          }" fill="${theme.accent}">${escapeXml(label)}</text>`
        );
      });

      category.items.forEach((item) => {
        const itemStartY = categoryY + item.y;
        const itemNameY = itemStartY + typography.item;
        const iconX = column.x + item.xIcon;
        const iconY = itemNameY - item.iconSize * 0.78;
        const nameX = column.x + item.xName;
        const priceX = column.x + item.xPrice;

        parts.push(`<g class="menu-item" data-item-id="${item.id}">`);
        parts.push(buildFssaiIcon(item.type, iconX, iconY, item.iconSize));

        item.nameLines.forEach((line, lineIndex) => {
          parts.push(
            `<text x="${nameX}" y="${itemNameY + lineIndex * itemLineHeight}" font-family="${escapeXml(
              fonts.itemFont
            )}" font-size="${typography.item}" font-weight="${fonts.itemWeight}" letter-spacing="${
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
            fonts.priceFont
          )}" font-size="${typography.price}" font-weight="${fonts.priceWeight}" letter-spacing="${
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
              fonts.descriptionFont
            )}" font-size="${typography.description}" font-weight="${
              fonts.descriptionWeight
            }" letter-spacing="${typography.letterSpacing * 0.75}" fill="#666">${escapeXml(line)}</text>`
          );
        });

        parts.push('</g>');
      });

      const categoryBottom = categoryY + category.height - layout.spacing.categoryGap * 0.4;
      parts.push(
        dividerMarkup(
          stylePreset.dividerStyle,
          column.x,
          column.x + column.width,
          categoryBottom,
          theme.border
        )
      );

      parts.push('</g>');
    });
  });

  parts.push('</svg>');

  return parts.join('');
}
