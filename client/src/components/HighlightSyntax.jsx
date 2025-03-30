import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export const HighlightSyntax = ({ language, value, onChange }) => (
  <div className="relative group">
    <SyntaxHighlighter
      language={language}
      style={vscDarkPlus}
      className="rounded-lg p-4 !bg-stellar border border-nebula/30"
    >
      {value}
    </SyntaxHighlighter>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="absolute inset-0 w-full h-full p-4 bg-transparent text-transparent caret-stardust resize-none"
      spellCheck="false"
    />
  </div>
);