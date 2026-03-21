/**
 * Simple HTML → pdfmake content converter.
 * Handles the subset of HTML produced by the DocumentEditor (contentEditable + execCommand).
 */

type PdfNode = Record<string, any>;

interface HtmlToken {
  type: 'open' | 'close' | 'self' | 'text';
  tag?: string;
  attrs?: Record<string, string>;
  text?: string;
}

interface DomNode {
  tag: string | null; // null = text node
  text?: string;
  attrs: Record<string, string>;
  children: DomNode[];
}

const SELF_CLOSING = new Set(['br', 'hr', 'img', 'input', 'meta', 'link']);
const BLOCK_TAGS = new Set(['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'table', 'tbody', 'thead', 'tfoot', 'tr', 'blockquote', 'pre']);
const INLINE_TAGS = new Set(['b', 'strong', 'i', 'em', 'u', 's', 'strike', 'span', 'a', 'sup', 'sub']);

// ─── Tokenizer ───────────────────────────────────────────────────────────────

function parseAttrs(attrStr: string): Record<string, string> {
  const result: Record<string, string> = {};
  const regex = /([a-zA-Z\-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]*))/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(attrStr)) !== null) {
    result[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? '';
  }
  return result;
}

function tokenize(html: string): HtmlToken[] {
  const tokens: HtmlToken[] = [];
  const len = html.length;
  let i = 0;

  while (i < len) {
    if (html[i] !== '<') {
      // Text node
      const end = html.indexOf('<', i);
      const text = html.slice(i, end === -1 ? len : end);
      if (text) tokens.push({ type: 'text', text });
      i = end === -1 ? len : end;
      continue;
    }

    // Skip comments
    if (html.startsWith('<!--', i)) {
      const end = html.indexOf('-->', i);
      i = end === -1 ? len : end + 3;
      continue;
    }

    const end = html.indexOf('>', i);
    if (end === -1) { i = len; break; }

    const inner = html.slice(i + 1, end).trim();

    if (inner.startsWith('/')) {
      // Close tag
      const tag = inner.slice(1).trim().toLowerCase().split(/\s/)[0];
      tokens.push({ type: 'close', tag });
    } else {
      // Open or self-close
      const selfClose = inner.endsWith('/');
      const body = selfClose ? inner.slice(0, -1).trim() : inner;
      const spaceIdx = body.search(/\s/);
      const tagName = (spaceIdx === -1 ? body : body.slice(0, spaceIdx)).toLowerCase();
      const attrStr = spaceIdx === -1 ? '' : body.slice(spaceIdx);
      const attrs = parseAttrs(attrStr);
      const isSelf = selfClose || SELF_CLOSING.has(tagName);
      tokens.push({ type: isSelf ? 'self' : 'open', tag: tagName, attrs });
    }

    i = end + 1;
  }
  return tokens;
}

// ─── Tree builder ─────────────────────────────────────────────────────────────

function buildTree(tokens: HtmlToken[]): DomNode[] {
  const root: DomNode = { tag: 'root', attrs: {}, children: [] };
  const stack: DomNode[] = [root];

  for (const token of tokens) {
    const parent = stack[stack.length - 1];

    if (token.type === 'text') {
      parent.children.push({ tag: null, text: token.text, attrs: {}, children: [] });
    } else if (token.type === 'self') {
      parent.children.push({ tag: token.tag!, attrs: token.attrs ?? {}, children: [] });
    } else if (token.type === 'open') {
      const node: DomNode = { tag: token.tag!, attrs: token.attrs ?? {}, children: [] };
      parent.children.push(node);
      stack.push(node);
    } else if (token.type === 'close') {
      // Pop until matching open tag
      for (let k = stack.length - 1; k >= 1; k--) {
        if (stack[k].tag === token.tag) {
          stack.splice(k);
          break;
        }
      }
    }
  }

  return root.children;
}

// ─── Style helpers ────────────────────────────────────────────────────────────

interface TextStyle {
  bold?: boolean;
  italics?: boolean;
  decoration?: string;
  color?: string;
  fontSize?: number;
  alignment?: string;
}

function getStyleFromNode(node: DomNode, inherited: TextStyle): TextStyle {
  const style = { ...inherited };
  const tag = node.tag;

  if (tag === 'b' || tag === 'strong') style.bold = true;
  if (tag === 'i' || tag === 'em') style.italics = true;
  if (tag === 'u') style.decoration = 'underline';
  if (tag === 's' || tag === 'strike') style.decoration = 'lineThrough';

  const inlineStyle = node.attrs?.style ?? '';
  if (inlineStyle.includes('bold')) style.bold = true;
  if (inlineStyle.includes('italic')) style.italics = true;

  const colorMatch = inlineStyle.match(/color:\s*([^;]+)/);
  if (colorMatch) style.color = colorMatch[1].trim();

  const fontSizeMatch = inlineStyle.match(/font-size:\s*(\d+)/);
  if (fontSizeMatch) style.fontSize = parseInt(fontSizeMatch[1]);

  return style;
}

function getAlignment(node: DomNode): string | undefined {
  const s = node.attrs?.style ?? '';
  const match = s.match(/text-align:\s*(\w+)/);
  if (!match && node.attrs?.align) return node.attrs.align;
  return match?.[1];
}

function getFontSizeForHeading(tag: string): number {
  const sizes: Record<string, number> = { h1: 22, h2: 18, h3: 16, h4: 14, h5: 12, h6: 11 };
  return sizes[tag] ?? 12;
}

// ─── Core converter ───────────────────────────────────────────────────────────

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

/**
 * Converts inline child nodes to pdfmake inline text array.
 */
function inlineNodes(nodes: DomNode[], style: TextStyle): any[] {
  const parts: any[] = [];

  for (const node of nodes) {
    if (node.tag === null) {
      // Text node
      const text = decodeEntities(node.text ?? '');
      if (!text) continue;
      const part: Record<string, any> = { text };
      if (style.bold) part.bold = true;
      if (style.italics) part.italics = true;
      if (style.decoration) part.decoration = style.decoration;
      if (style.color) part.color = style.color;
      if (style.fontSize) part.fontSize = style.fontSize;
      parts.push(part);
    } else if (node.tag === 'br') {
      parts.push({ text: '\n' });
    } else if (INLINE_TAGS.has(node.tag)) {
      const childStyle = getStyleFromNode(node, style);
      const inner = inlineNodes(node.children, childStyle);
      if (inner.length === 1) {
        parts.push(inner[0]);
      } else if (inner.length > 1) {
        parts.push({ text: inner });
      }
    } else if (BLOCK_TAGS.has(node.tag)) {
      // Nested block inside inline context — treat as text with newline
      const inner = inlineNodes(node.children, style);
      parts.push(...inner);
      parts.push({ text: '\n' });
    }
  }

  return parts;
}

/**
 * Converts a list of DOM nodes to pdfmake block content.
 */
function blockNodes(nodes: DomNode[]): PdfNode[] {
  const content: PdfNode[] = [];

  for (const node of nodes) {
    if (node.tag === null) {
      const text = decodeEntities((node.text ?? '').replace(/\n/g, ' '));
      if (text.trim()) content.push({ text: text.trim(), margin: [0, 0, 0, 4] });
      continue;
    }

    const tag = node.tag;

    // ── Headings ──
    if (/^h[1-6]$/.test(tag)) {
      const inline = inlineNodes(node.children, {});
      const alignment = getAlignment(node);
      const block: PdfNode = {
        text: inline.length === 1 ? inline[0] : inline,
        bold: true,
        fontSize: getFontSizeForHeading(tag),
        margin: [0, 8, 0, 6],
      };
      if (alignment) block.alignment = alignment;
      content.push(block);
      continue;
    }

    // ── Paragraph / div ──
    if (tag === 'p' || tag === 'div') {
      const alignment = getAlignment(node);
      // Check if children are all block elements
      const hasBlockChildren = node.children.some(c => c.tag && BLOCK_TAGS.has(c.tag));
      if (hasBlockChildren) {
        content.push(...blockNodes(node.children));
      } else {
        const inline = inlineNodes(node.children, {});
        if (inline.length === 0) {
          content.push({ text: ' ', margin: [0, 0, 0, 4] });
        } else {
          const block: PdfNode = {
            text: inline.length === 1 && typeof inline[0] === 'object' && !Array.isArray(inline[0])
              ? inline[0]
              : inline,
            margin: [0, 0, 0, 4],
          };
          if (alignment) block.alignment = alignment;
          content.push(block);
        }
      }
      continue;
    }

    // ── Line break ──
    if (tag === 'br') {
      content.push({ text: ' ', margin: [0, 0, 0, 4] });
      continue;
    }

    // ── Unordered list ──
    if (tag === 'ul') {
      const items = node.children
        .filter(c => c.tag === 'li')
        .map(li => {
          const inner = inlineNodes(li.children, {});
          return inner.length === 1 ? inner[0] : { text: inner };
        });
      if (items.length > 0) content.push({ ul: items, margin: [0, 0, 0, 6] });
      continue;
    }

    // ── Ordered list ──
    if (tag === 'ol') {
      const items = node.children
        .filter(c => c.tag === 'li')
        .map(li => {
          const inner = inlineNodes(li.children, {});
          return inner.length === 1 ? inner[0] : { text: inner };
        });
      if (items.length > 0) content.push({ ol: items, margin: [0, 0, 0, 6] });
      continue;
    }

    // ── Table ──
    if (tag === 'table') {
      const tbodyNode = node.children.find(c => c.tag === 'tbody') ?? node;
      const rows = tbodyNode.children
        .filter(c => c.tag === 'tr')
        .map(tr =>
          tr.children
            .filter(c => c.tag === 'td' || c.tag === 'th')
            .map(cell => {
              const inner = inlineNodes(cell.children, cell.tag === 'th' ? { bold: true } : {});
              return {
                text: inner.length === 0
                  ? ' '
                  : inner.length === 1
                    ? inner[0]
                    : inner,
                margin: [4, 4, 4, 4],
              };
            })
        )
        .filter(r => r.length > 0);

      if (rows.length > 0) {
        const colCount = Math.max(...rows.map(r => r.length));
        content.push({
          table: {
            widths: Array(colCount).fill('*'),
            body: rows,
          },
          layout: 'lightHorizontalLines',
          margin: [0, 4, 0, 8],
        });
      }
      continue;
    }

    // ── Horizontal rule ──
    if (tag === 'hr') {
      content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }], margin: [0, 4, 0, 4] });
      continue;
    }

    // ── Inline elements at block level (wrap in paragraph) ──
    if (INLINE_TAGS.has(tag)) {
      const childStyle = getStyleFromNode(node, {});
      const inline = inlineNodes([node], childStyle);
      if (inline.length > 0) {
        content.push({ text: inline.length === 1 ? inline[0] : inline, margin: [0, 0, 0, 4] });
      }
      continue;
    }

    // ── Generic container (span, etc.) → recurse ──
    content.push(...blockNodes(node.children));
  }

  return content;
}

/**
 * Main entry point: convert an HTML string to a pdfmake content array.
 */
export function htmlToPdfmakeContent(html: string): PdfNode[] {
  if (!html?.trim()) return [];
  const tokens = tokenize(html);
  const tree = buildTree(tokens);
  return blockNodes(tree);
}
