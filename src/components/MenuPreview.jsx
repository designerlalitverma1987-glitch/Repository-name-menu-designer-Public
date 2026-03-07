import { forwardRef } from 'react';

function VegIcon({ x, y, size }) {
  return <circle cx={x + size / 2} cy={y + size / 2} r={size * 0.35} fill="#22C55E" />;
}

function NonVegIcon({ x, y, size }) {
  const top = `${x + size / 2},${y + size * 0.1}`;
  const left = `${x + size * 0.12},${y + size * 0.88}`;
  const right = `${x + size * 0.88},${y + size * 0.88}`;
  return <polygon points={`${top} ${left} ${right}`} fill="#EF4444" />;
}

function Decorations({ styleKey, outer, theme }) {
  if (styleKey === 'fineDining') {
    return (
      <g>
        <rect
          x={outer.x + 10}
          y={outer.y + 10}
          width={outer.width - 20}
          height={outer.height - 20}
          fill="none"
          stroke={theme.accent}
          strokeWidth="1.2"
        />
      </g>
    );
  }

  if (styleKey === 'cafe') {
    return (
      <g opacity="0.18" stroke={theme.accent}>
        <line x1={outer.x + 20} y1={outer.y + 60} x2={outer.x + outer.width - 20} y2={outer.y + 60} strokeWidth="1" />
        <line x1={outer.x + 20} y1={outer.y + outer.height - 60} x2={outer.x + outer.width - 20} y2={outer.y + outer.height - 60} strokeWidth="1" />
      </g>
    );
  }

  if (styleKey === 'modern') {
    return (
      <g>
        <rect x={outer.x} y={outer.y} width={outer.width} height={16} fill={theme.accent} opacity="0.85" />
      </g>
    );
  }

  if (styleKey === 'street') {
    return (
      <g>
        <rect x={outer.x} y={outer.y} width={9} height={outer.height} fill={theme.accent} opacity="0.8" />
        <rect x={outer.x + outer.width - 9} y={outer.y} width={9} height={outer.height} fill={theme.accent} opacity="0.8" />
      </g>
    );
  }

  if (styleKey === 'vintage') {
    return (
      <rect
        x={outer.x + 6}
        y={outer.y + 6}
        width={outer.width - 12}
        height={outer.height - 12}
        fill="none"
        stroke={theme.border}
        strokeDasharray="4 4"
        strokeWidth="1.2"
      />
    );
  }

  return null;
}

const MenuPreview = forwardRef(function MenuPreview(
  { page, layout, menuTitle, stylePreset, theme },
  ref
) {
  if (!layout) {
    return null;
  }

  const { typography, columns, outer, titleY, contentTop } = layout;

  return (
    <svg
      ref={ref}
      width={page.width}
      height={page.height}
      viewBox={`0 0 ${page.width} ${page.height}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0" y="0" width={page.width} height={page.height} fill={theme.background} />

      <rect
        x={outer.x}
        y={outer.y}
        width={outer.width}
        height={outer.height}
        rx={outer.radius}
        fill={theme.surface}
        stroke={theme.border}
        strokeWidth="1.4"
      />

      <Decorations styleKey={stylePreset.key} outer={outer} theme={theme} />

      <text
        x={outer.x + outer.width / 2}
        y={titleY}
        fontFamily={stylePreset.titleFont}
        fontSize={typography.title}
        textAnchor="middle"
        fill={theme.accent}
        letterSpacing={typography.letterSpacing}
      >
        {menuTitle || 'Restaurant Menu'}
      </text>

      <line
        x1={outer.x + 24}
        x2={outer.x + outer.width - 24}
        y1={contentTop - typography.item * 0.4}
        y2={contentTop - typography.item * 0.4}
        stroke={theme.border}
        strokeWidth="1"
      />

      {columns.map((column, columnIndex) => (
        <g key={columnIndex}>
          {column.categories.map((category) => {
            const categoryY = contentTop + category.y;
            const categoryLineHeight = typography.category * typography.lineHeight;
            const itemLineHeight = typography.item * typography.lineHeight;
            const descriptionLineHeight = typography.description * typography.lineHeight;

            return (
              <g key={category.id}>
                {category.titleLines.map((line, lineIndex) => (
                  <text
                    key={`${category.id}-line-${lineIndex}`}
                    x={column.x}
                    y={categoryY + typography.category + lineIndex * categoryLineHeight}
                    fontFamily={stylePreset.titleFont}
                    fontSize={typography.category}
                    fontWeight="600"
                    fill={theme.accent}
                    letterSpacing={typography.letterSpacing}
                  >
                    {line}
                  </text>
                ))}

                {category.items.map((item) => {
                  const itemY = categoryY + item.y;
                  const iconX = column.x;
                  const iconY = itemY + typography.item * 0.08;
                  const textX = column.x + item.iconSize + 8;
                  const firstLineY = itemY + typography.item;

                  return (
                    <g key={item.id}>
                      {item.type === 'nonveg' ? (
                        <NonVegIcon x={iconX} y={iconY} size={item.iconSize} />
                      ) : (
                        <VegIcon x={iconX} y={iconY} size={item.iconSize} />
                      )}

                      {item.nameLines.map((line, lineIndex) => (
                        <text
                          key={`${item.id}-name-${lineIndex}`}
                          x={textX}
                          y={firstLineY + lineIndex * itemLineHeight}
                          fontFamily={stylePreset.bodyFont}
                          fontSize={typography.item}
                          fill={theme.text}
                          letterSpacing={typography.letterSpacing}
                        >
                          {line}
                        </text>
                      ))}

                      <text
                        x={column.x + column.width}
                        y={firstLineY}
                        textAnchor="end"
                        fontFamily={stylePreset.bodyFont}
                        fontSize={typography.price}
                        fontWeight="600"
                        fill={theme.price}
                        letterSpacing={typography.letterSpacing}
                      >
                        {item.priceText}
                      </text>

                      {item.descriptionLines.map((line, lineIndex) => (
                        <text
                          key={`${item.id}-desc-${lineIndex}`}
                          x={textX}
                          y={
                            firstLineY +
                            item.nameLines.length * itemLineHeight +
                            typography.description * 0.8 +
                            lineIndex * descriptionLineHeight
                          }
                          fontFamily={stylePreset.bodyFont}
                          fontSize={typography.description}
                          fill={theme.subtext}
                          letterSpacing={typography.letterSpacing * 0.8}
                        >
                          {line}
                        </text>
                      ))}
                    </g>
                  );
                })}
              </g>
            );
          })}
        </g>
      ))}
    </svg>
  );
});

export default MenuPreview;
