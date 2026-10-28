/**
 * Blog Content Formatter & Beautifier
 * Ensures blog post text is readable, clean, structured, and never cluttered or universally bolded.
 * Handles both Markdown, plain text, and HTML safely.
 */

/**
 * Clean up accidental universal bolding where an entire paragraph, div, or block is wrapped in bold.
 */
function cleanOverBolding(html: string): string {
  // If an entire <p> or <div> has <strong>...</strong> or <b>...</b> enclosing the whole content (> 100 chars), un-bold it
  html = html.replace(/<p>\s*<(?:strong|b)>([\s\S]{100,?)<\/(?:strong|b)>\s*<\/p>/gi, '<p>$1</p>');
  
  // Also strip style="font-weight: 700|bold|800|900" on <p> and <div>
  html = html.replace(/(<(?:p|div)[^>]*?)\s*style="[^"]*?font-weight:\s*(?:bold|[789]00)[^"]*?"([^>]*?>)/gi, '$1$2');

  return html;
}

/**
 * Format markdown/plain text segments into clean, semantic HTML
 */
export function formatBlogContentToHtml(raw: string): string {
  if (!raw || !raw.trim()) return '';

  let text = raw.trim();

  // If text already has full HTML structure (<p>, <h2>, <h3>, <ul>, etc.)
  const hasHtmlParagraphs = /<p\b|<h[1-6]\b|<ul\b|<ol\b|<blockquote\b/i.test(text);

  if (hasHtmlParagraphs) {
    // It's HTML: clean up over-bolding and ensure spacing
    let cleaned = cleanOverBolding(text);

    // If there are plain markdown headers inside HTML (e.g. <h2> not used, but `## ` written)
    cleaned = cleaned.replace(/^#{4,6}\s+(.+)$/gm, '<h4 class="blog-h4">$1</h4>');
    cleaned = cleaned.replace(/^#{3}\s+(.+)$/gm, '<h3 class="blog-h3">$1</h3>');
    cleaned = cleaned.replace(/^#{1,2}\s+(.+)$/gm, '<h2 class="blog-h2">$1</h2>');

    // Convert markdown bold **word** that was not converted to strong
    cleaned = cleaned.replace(/\*\*([^\*\n]{1,120})\*\*/g, '<strong class="blog-strong">$1</strong>');
    cleaned = cleaned.replace(/__([^_\n]{1,120})__/g, '<strong class="blog-strong">$1</strong>');

    // Convert markdown italic *word*
    cleaned = cleaned.replace(/(^|[^\*])\*([^\*\n]{1,80})\*([^\*]|$)/g, '$1<em class="blog-em">$2</em>$3');

    // Convert markdown links [text](url)
    cleaned = cleaned.replace(/\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="blog-link">$1</a>');

    return cleaned;
  }

  // Otherwise, it's Markdown or plain text with newlines!
  // Let's parse it block by block for perfect readability and SEO structure.

  // Normalize line endings
  text = text.replace(/\r\n/g, '\n');

  // Split into blocks separated by 2 or more newlines
  const rawBlocks = text.split(/\n{2,}/);
  const formattedBlocks: string[] = [];

  for (const block of rawBlocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    // 1. Headings
    if (/^#\s+(.+)$/.test(trimmed)) {
      const title = trimmed.replace(/^#\s+/, '').trim();
      formattedBlocks.push(`<h2 class="blog-h2">${title}</h2>`);
      continue;
    }
    if (/^##\s+(.+)$/.test(trimmed)) {
      const title = trimmed.replace(/^##\s+/, '').trim();
      formattedBlocks.push(`<h2 class="blog-h2">${title}</h2>`);
      continue;
    }
    if (/^###\s+(.+)$/.test(trimmed)) {
      const title = trimmed.replace(/^###\s+/, '').trim();
      formattedBlocks.push(`<h3 class="blog-h3">${title}</h3>`);
      continue;
    }
    if (/^####\s+(.+)$/.test(trimmed)) {
      const title = trimmed.replace(/^####\s+/, '').trim();
      formattedBlocks.push(`<h4 class="blog-h4">${title}</h4>`);
      continue;
    }

    // 2. Blockquote
    if (trimmed.startsWith('>')) {
      const quoteText = trimmed
        .split('\n')
        .map((line) => line.replace(/^>\s*/, '').trim())
        .join(' ');
      formattedBlocks.push(
        `<blockquote class="blog-blockquote"><p>${formatInlineMarkdown(quoteText)}</p></blockquote>`
      );
      continue;
    }

    // 3. Unordered list (starts with -, *, +)
    if (/^[-*+]\s+/m.test(trimmed)) {
      const lines = trimmed.split('\n');
      const items: string[] = [];
      let isList = true;

      for (const line of lines) {
        const l = line.trim();
        if (/^[-*+]\s+/.test(l)) {
          items.push(formatInlineMarkdown(l.replace(/^[-*+]\s+/, '')));
        } else if (l) {
          if (items.length > 0) {
            // Append to previous item
            items[items.length - 1] += ' ' + formatInlineMarkdown(l);
          } else {
            isList = false;
            break;
          }
        }
      }

      if (isList && items.length > 0) {
        const listHtml = `<ul class="blog-ul">\n${items
          .map((item) => `  <li class="blog-li">${item}</li>`)
          .join('\n')}\n</ul>`;
        formattedBlocks.push(listHtml);
        continue;
      }
    }

    // 4. Ordered list (starts with 1., 2., etc. or Bengali ১., ২., etc.)
    if (/^(?:\d+|[১-৯]+)\.\s+/m.test(trimmed)) {
      const lines = trimmed.split('\n');
      const items: string[] = [];
      let isList = true;

      for (const line of lines) {
        const l = line.trim();
        if (/^(?:\d+|[১-৯]+)\.\s+/.test(l)) {
          items.push(formatInlineMarkdown(l.replace(/^(?:\d+|[১-৯]+)\.\s+/, '')));
        } else if (l) {
          if (items.length > 0) {
            items[items.length - 1] += ' ' + formatInlineMarkdown(l);
          } else {
            isList = false;
            break;
          }
        }
      }

      if (isList && items.length > 0) {
        const listHtml = `<ol class="blog-ol">\n${items
          .map((item) => `  <li class="blog-li">${item}</li>`)
          .join('\n')}\n</ol>`;
        formattedBlocks.push(listHtml);
        continue;
      }
    }

    // 5. Divider
    if (/^---+$/.test(trimmed) || /^\*\*\*+$/.test(trimmed)) {
      formattedBlocks.push('<hr class="blog-hr" />');
      continue;
    }

    // 6. Regular Paragraph
    // Convert single newlines within a paragraph into <br /> or spaces for clean flow
    const inlineFormatted = formatInlineMarkdown(trimmed);
    const withBreaks = inlineFormatted.replace(/\n/g, '<br />');
    formattedBlocks.push(`<p class="blog-p">${withBreaks}</p>`);
  }

  return cleanOverBolding(formattedBlocks.join('\n\n'));
}

/**
 * Formats inline bold, italics, links, and code while preventing accidental huge bolding
 */
function formatInlineMarkdown(str: string): string {
  let s = str;

  // Inline links [text](url)
  s = s.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="blog-link">$1</a>'
  );

  // Inline bold **text** (limit to reasonable lengths <= 120 chars to avoid bolding whole paragraphs)
  s = s.replace(/\*\*([^\*\n]{1,120})\*\*/g, '<strong class="blog-strong">$1</strong>');
  s = s.replace(/__([^_\n]{1,120})__/g, '<strong class="blog-strong">$1</strong>');

  // Strip unclosed double asterisks that cause rest of article to become bold!
  s = s.replace(/\*\*/g, '');

  // Inline italics *text*
  s = s.replace(/(^|[^\*])\*([^\*\n]{1,80})\*([^\*]|$)/g, '$1<em class="blog-em">$2</em>$3');

  // Inline code / promo code `text`
  s = s.replace(
    /`([^`]+)`/g,
    '<code class="px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-md font-mono text-xs font-bold">$1</code>'
  );

  return s;
}

/**
 * Helper to beautify raw editor input before saving or when clicking "Auto Format"
 */
export function beautifyBlogEditorContent(content: string): string {
  if (!content) return '';

  let c = content.trim();

  // Normalize line breaks
  c = c.replace(/\r\n/g, '\n');

  // If text is written with only single newlines between paragraphs, separate them with double newlines
  // Except for list items (- item, 1. item) which can stay on consecutive lines
  const lines = c.split('\n');
  const resultLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const cur = lines[i].trim();
    const next = lines[i + 1]?.trim() || '';

    resultLines.push(lines[i]);

    if (cur && next) {
      const isCurList = /^[-*+]\s+|^(?:\d+|[১-৯]+)\.\s+/.test(cur);
      const isNextList = /^[-*+]\s+|^(?:\d+|[১-৯]+)\.\s+/.test(next);

      // If neither is a list or heading continuation, ensure empty line between paragraphs
      if (!isCurList && !isNextList && !cur.startsWith('#') && !cur.startsWith('<') && !next.startsWith('<')) {
        resultLines.push('');
      }
    }
  }

  return resultLines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}
