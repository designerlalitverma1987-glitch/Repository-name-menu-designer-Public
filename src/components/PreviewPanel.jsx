import { forwardRef } from 'react';

const PreviewPanel = forwardRef(function PreviewPanel({ svgMarkup }, ref) {
  return (
    <div className="mx-auto w-full max-w-[1200px] rounded-xl border border-stone-300 bg-white/80 p-3 shadow-2xl">
      <div
        ref={ref}
        className="overflow-auto leading-none [&_svg]:mx-auto [&_svg]:block [&_svg]:h-auto [&_svg]:max-w-full"
        dangerouslySetInnerHTML={{ __html: svgMarkup }}
      />
    </div>
  );
});

export default PreviewPanel;
