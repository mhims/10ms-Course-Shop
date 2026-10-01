/**
 * Converts rich HTML from clipboard (copied from Google Docs, MS Word, Webpages, ChatGPT)
 * into clean formatted Markdown and semantic HTML headers (H1, H2, H3, bold, lists, links).
 */
export function convertHtmlToFormattedMarkdown(htmlString: string, fallbackPlain: string = ''): string {
  if (!htmlString || !htmlString.trim()) {
    return fallbackPlain;
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');

    // Remove unwanted script/style tags
    const toRemove = doc.querySelectorAll('script, style, meta, link, noscript');
    toRemove.forEach((el) => el.remove());

    function processNode(node: Node): string {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent || '';
      }

      if (node.nodeType !== Node.ELEMENT_NODE) {
        return '';
      }

      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();
      const style = el.getAttribute('style') || '';
      const className = el.getAttribute('class') || '';

      // Detection for Headings (including Google Docs & Word inline styles or classes)
      const isH1 =
        tag === 'h1' ||
        /msoheading1|heading\s*1|title/i.test(className) ||
        (/font-size:\s*(2[4-9]|[3-9]\d)p[xt]/i.test(style) && /bold|700|800|900/i.test(style));

      const isH2 =
        tag === 'h2' ||
        /msoheading2|heading\s*2|subtitle/i.test(className) ||
        (/font-size:\s*(1[8-9]|2[0-3])p[xt]/i.test(style) && /bold|700|800|900/i.test(style));

      const isH3 =
        tag === 'h3' ||
        tag === 'h4' ||
        /msoheading3|heading\s*3/i.test(className) ||
        (/font-size:\s*(1[5-7])p[xt]/i.test(style) && /bold|700|800|900/i.test(style));

      // Process all child nodes recursively
      const childrenText = Array.from(node.childNodes).map(processNode).join('');

      if (!childrenText.trim() && tag !== 'br' && tag !== 'hr') {
        return '';
      }

      // 1. Headings
      if (isH1) {
        return `\n\n# ${childrenText.trim()}\n\n`;
      }
      if (isH2) {
        return `\n\n## ${childrenText.trim()}\n\n`;
      }
      if (isH3 || tag === 'h5' || tag === 'h6') {
        return `\n\n### ${childrenText.trim()}\n\n`;
      }

      // 2. Bold
      if (
        tag === 'b' ||
        tag === 'strong' ||
        /font-weight:\s*(bold|700|800|900)/i.test(style)
      ) {
        const trimmed = childrenText.trim();
        return trimmed ? `**${trimmed}**` : '';
      }

      // 3. Italic
      if (tag === 'i' || tag === 'em' || /font-style:\s*italic/i.test(style)) {
        const trimmed = childrenText.trim();
        return trimmed ? `*${trimmed}*` : '';
      }

      // 4. Links
      if (tag === 'a') {
        const href = el.getAttribute('href') || '';
        const trimmed = childrenText.trim();
        if (href && href !== '#' && !href.startsWith('javascript:')) {
          return `[${trimmed || href}](${href})`;
        }
        return trimmed;
      }

      // 5. Unordered Lists (bullet points)
      if (tag === 'ul') {
        const listItems = Array.from(el.children)
          .filter((c) => c.tagName.toLowerCase() === 'li')
          .map((li) => {
            const liText = Array.from(li.childNodes).map(processNode).join('').trim();
            return liText ? `- ${liText}` : '';
          })
          .filter(Boolean)
          .join('\n');

        return listItems ? `\n\n${listItems}\n\n` : '';
      }

      // 6. Ordered Lists (numbers)
      if (tag === 'ol') {
        const listItems = Array.from(el.children)
          .filter((c) => c.tagName.toLowerCase() === 'li')
          .map((li, idx) => {
            const liText = Array.from(li.childNodes).map(processNode).join('').trim();
            return liText ? `${idx + 1}. ${liText}` : '';
          })
          .filter(Boolean)
          .join('\n');

        return listItems ? `\n\n${listItems}\n\n` : '';
      }

      // Single List Item if outside ul/ol
      if (tag === 'li') {
        return `- ${childrenText.trim()}\n`;
      }

      // 7. Blockquote
      if (tag === 'blockquote') {
        return `\n\n> ${childrenText.trim()}\n\n`;
      }

      // 8. Paragraphs & Divisions
      if (tag === 'p' || tag === 'div' || tag === 'section' || tag === 'article') {
        const trimmed = childrenText.trim();
        return trimmed ? `\n\n${trimmed}\n\n` : '';
      }

      // 9. Line breaks & Dividers
      if (tag === 'br') {
        return '\n';
      }
      if (tag === 'hr') {
        return '\n\n---\n\n';
      }

      return childrenText;
    }

    const converted = Array.from(doc.body.childNodes)
      .map(processNode)
      .join('')
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    // If conversion produced meaningful content with formatting, return it
    if (converted && (converted.includes('#') || converted.includes('**') || converted.includes('- ') || converted.includes('['))) {
      return converted;
    }

    // If converted is nonempty, return it; otherwise fallback to plain text
    return converted || fallbackPlain;
  } catch (err) {
    console.error('Error converting HTML to Markdown:', err);
    return fallbackPlain;
  }
}
