import { forwardRef } from 'react';

const PreviewPanel = forwardRef(function PreviewPanel({ svgMarkup }, ref) {
  return (
    <div className="mx-auto w-fit rounded-xl border border-stone-300 bg-white p-4 shadow-2xl">
      <div
        ref={ref}
        className="leading-none"
        dangerouslySetInnerHTML={{ __html: svgMarkup }}
      />
    </div>
  );
});

export default PreviewPanel;
