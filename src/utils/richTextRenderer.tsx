import React from 'react';

interface RichTextRendererProps {
  content: string;
  fontFamily?: 'serif' | 'sans' | 'mono' | 'handwriting';
  className?: string;
}

// Converts inline markdown (bold, italic, strikethrough, links, code) within an HTML/text line
function formatInlineText(text: string): React.ReactNode[] {
  // If the line already has HTML tags like <span, <mark, <b>, <i>, <u>, etc.,
  // we can parse it with DOMParser or a safe HTML-like tokenizer to preserve React security.
  if (!text) return [];

  // Match markdown tokens: **bold**, *italic*, ~~strike~~, `code`, [link](url)
  // or handle raw HTML tags safely
  const nodes: React.ReactNode[] = [];
  
  // Safe HTML + Markdown hybrid parsing:
  // Split by common inline HTML tags and markdown syntax
  const regex = /(<span[^>]*>.*?<\/span>|<mark[^>]*>.*?<\/mark>|<font[^>]*>.*?<\/font>|<b>.*?<\/b>|<strong>.*?<\/strong>|<i>.*?<\/i>|<em>.*?<\/em>|<u>.*?<\/u>|<s>.*?<\/s>|<del>.*?<\/del>|<br\s*\/?>|\*\*.*?\*\*|\*.*?\*|~~.*?~~|`.*?`|\[.*?\]\(.*?\))/gi;
  
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyIdx = 0;

  while ((match = regex.exec(text)) !== null) {
    // Text before match
    if (match.index > lastIndex) {
      nodes.push(text.substring(lastIndex, match.index));
    }

    const token = match[0];
    
    // HTML span / mark / font
    if (token.startsWith('<span') || token.startsWith('<mark') || token.startsWith('<font') || token.startsWith('<b') || token.startsWith('<strong') || token.startsWith('<i') || token.startsWith('<em') || token.startsWith('<u') || token.startsWith('<s') || token.startsWith('<del')) {
      // Use dangerouslySetInnerHTML for custom styled spans/tags created by our editor
      nodes.push(
        <span
          key={`html-${keyIdx++}`}
          dangerouslySetInnerHTML={{ __html: token }}
        />
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      const inner = token.slice(2, -2);
      nodes.push(<strong key={`b-${keyIdx++}`} className="font-bold text-stone-900">{formatInlineText(inner)}</strong>);
    } else if (token.startsWith('*') && token.endsWith('*')) {
      const inner = token.slice(1, -1);
      nodes.push(<em key={`i-${keyIdx++}`} className="italic">{formatInlineText(inner)}</em>);
    } else if (token.startsWith('~~') && token.endsWith('~~')) {
      const inner = token.slice(2, -2);
      nodes.push(<del key={`del-${keyIdx++}`} className="line-through opacity-75">{formatInlineText(inner)}</del>);
    } else if (token.startsWith('`') && token.endsWith('`')) {
      const inner = token.slice(1, -1);
      nodes.push(<code key={`c-${keyIdx++}`} className="bg-stone-100 text-stone-800 px-1.5 py-0.5 rounded text-sm font-mono">{inner}</code>);
    } else if (token.startsWith('[') && token.includes('](') && token.endsWith(')')) {
      const textMatch = token.match(/\[(.*?)\]\((.*?)\)/);
      if (textMatch) {
        nodes.push(
          <a
            key={`a-${keyIdx++}`}
            href={textMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-900 hover:text-blue-950 underline font-medium underline-offset-2"
          >
            {textMatch[1]}
          </a>
        );
      } else {
        nodes.push(token);
      }
    } else {
      nodes.push(token);
    }

    lastIndex = match.index + token.length;
  }

  // Trailing text
  if (lastIndex < text.length) {
    nodes.push(text.substring(lastIndex));
  }

  return nodes.length > 0 ? nodes : [text];
}

export const RichTextRenderer: React.FC<RichTextRendererProps> = ({
  content,
  fontFamily = 'serif',
  className = ''
}) => {
  if (!content) return null;

  const fontClass = 
    fontFamily === 'sans' ? 'font-sans' :
    fontFamily === 'mono' ? 'font-mono' :
    fontFamily === 'handwriting' ? 'font-serif italic' :
    'font-serif';

  // Split by blocks / paragraphs (separated by double newlines or block-level markers)
  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];
  
  let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;
  let currentQuote: string[] = [];
  let blockKey = 0;

  const flushList = () => {
    if (currentList) {
      const ListTag = currentList.type;
      blocks.push(
        <ListTag
          key={`list-${blockKey++}`}
          className={`space-y-1.5 my-3 pl-6 ${currentList.type === 'ul' ? 'list-disc' : 'list-decimal'} text-stone-800`}
        >
          {currentList.items.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {formatInlineText(item)}
            </li>
          ))}
        </ListTag>
      );
      currentList = null;
    }
  };

  const flushQuote = () => {
    if (currentQuote.length > 0) {
      blocks.push(
        <blockquote
          key={`quote-${blockKey++}`}
          className="border-l-4 border-amber-600 bg-amber-50/60 pl-4 py-2 my-4 rounded-r-xl italic text-stone-800 text-base sm:text-lg"
        >
          {currentQuote.map((q, idx) => (
            <p key={idx} className="my-1">
              {formatInlineText(q)}
            </p>
          ))}
        </blockquote>
      );
      currentQuote = [];
    }
  };

  let paragraphLines: string[] = [];

  const flushParagraph = () => {
    if (paragraphLines.length > 0) {
      const joined = paragraphLines.join(' ');
      if (joined.trim()) {
        blocks.push(
          <p key={`p-${blockKey++}`} className="leading-relaxed sm:leading-loose text-stone-800 my-3">
            {formatInlineText(joined)}
          </p>
        );
      }
      paragraphLines = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Empty line separates paragraphs / flushes
    if (!trimmed) {
      flushParagraph();
      flushList();
      flushQuote();
      continue;
    }

    // Horizontal Rule
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      flushParagraph();
      flushList();
      flushQuote();
      blocks.push(
        <hr key={`hr-${blockKey++}`} className="my-6 border-t-2 border-stone-200" />
      );
      continue;
    }

    // Headings
    if (trimmed.startsWith('# ')) {
      flushParagraph();
      flushList();
      flushQuote();
      blocks.push(
        <h1 key={`h1-${blockKey++}`} className="text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 mt-8 mb-4 tracking-tight">
          {formatInlineText(trimmed.slice(2))}
        </h1>
      );
      continue;
    }

    if (trimmed.startsWith('## ')) {
      flushParagraph();
      flushList();
      flushQuote();
      blocks.push(
        <h2 key={`h2-${blockKey++}`} className="text-xl sm:text-2xl lg:text-3xl font-bold text-stone-900 mt-7 mb-3 tracking-tight">
          {formatInlineText(trimmed.slice(3))}
        </h2>
      );
      continue;
    }

    if (trimmed.startsWith('### ')) {
      flushParagraph();
      flushList();
      flushQuote();
      blocks.push(
        <h3 key={`h3-${blockKey++}`} className="text-lg sm:text-xl font-bold text-stone-900 mt-6 mb-2.5 tracking-tight">
          {formatInlineText(trimmed.slice(4))}
        </h3>
      );
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      flushParagraph();
      flushList();
      currentQuote.push(trimmed.slice(2));
      continue;
    } else if (currentQuote.length > 0) {
      flushQuote();
    }

    // Unordered List (- item or * item)
    if (trimmed.startsWith('- ') || (trimmed.startsWith('* ') && !trimmed.endsWith('*'))) {
      flushParagraph();
      flushQuote();
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(trimmed.slice(2));
      continue;
    }

    // Ordered List (1. item)
    const olMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (olMatch) {
      flushParagraph();
      flushQuote();
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(olMatch[2]);
      continue;
    }

    // If we were inside a list and hit normal text, flush the list
    if (currentList) {
      flushList();
    }

    // Regular line in paragraph
    paragraphLines.push(rawLine);
  }

  flushParagraph();
  flushList();
  flushQuote();

  return (
    <div className={`rich-text-content ${fontClass} ${className} text-stone-800 text-base sm:text-lg leading-relaxed`}>
      {blocks}
    </div>
  );
};
