import { jsPDF } from 'jspdf';
import { svg2pdf } from 'svg2pdf.js';
import PptxGenJS from 'pptxgenjs';

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function serializeSvg(svgElement) {
  const serializer = new XMLSerializer();
  let source = serializer.serializeToString(svgElement);
  if (!source.includes('xmlns="http://www.w3.org/2000/svg"')) {
    source = source.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  if (!source.includes('xmlns:xlink="http://www.w3.org/1999/xlink"')) {
    source = source.replace('<svg', '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
  }
  return source;
}

export function exportAsSvg(svgElement, filename = 'smart-menu.svg') {
  const source = serializeSvg(svgElement);
  const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
  downloadBlob(blob, filename);
}

export async function exportAsPdf(svgElement, page, filename = 'smart-menu.pdf') {
  const widthPt = page.width * 0.75;
  const heightPt = page.height * 0.75;
  const orientation = page.width > page.height ? 'landscape' : 'portrait';
  const pdf = new jsPDF({ orientation, unit: 'pt', format: [widthPt, heightPt] });

  await svg2pdf(svgElement, pdf, {
    x: 0,
    y: 0,
    width: widthPt,
    height: heightPt
  });

  pdf.save(filename);
}

function toBase64(value) {
  return window.btoa(unescape(encodeURIComponent(value)));
}

export async function exportAsPptx(svgElement, page, filename = 'smart-menu.pptx') {
  const source = serializeSvg(svgElement);
  const svgBase64 = toBase64(source);
  const data = `data:image/svg+xml;base64,${svgBase64}`;

  const pptx = new PptxGenJS();
  const widthIn = page.width / 96;
  const heightIn = page.height / 96;

  pptx.defineLayout({
    name: 'MENU_LAYOUT',
    width: widthIn,
    height: heightIn
  });
  pptx.layout = 'MENU_LAYOUT';

  const slide = pptx.addSlide();
  slide.addImage({ data, x: 0, y: 0, w: widthIn, h: heightIn });

  await pptx.writeFile({ fileName: filename });
}
