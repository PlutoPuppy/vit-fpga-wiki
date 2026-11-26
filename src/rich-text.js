const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

// [label](address) becomes a clickable link. Only web addresses and the wiki's own
// #/ routes (for example #/files/<card-id>) are allowed; everything else stays plain text.
const linkPattern = /\[([^\]\n]+)\]\(((?:https?:\/\/|#\/)[^\s()<>"']+)\)/g;

export function richText(text) {
  const source = String(text ?? '');
  let html = '', last = 0;
  for (const match of source.matchAll(linkPattern)) {
    const [whole, label, href] = match;
    const internal = href.startsWith('#/');
    html += esc(source.slice(last, match.index));
    html += `<a class="inline-link" href="${esc(href)}"${internal ? '' : ' target="_blank" rel="noopener noreferrer"'}>${esc(label)}</a>`;
    last = match.index + whole.length;
  }
  return html + esc(source.slice(last));
}
