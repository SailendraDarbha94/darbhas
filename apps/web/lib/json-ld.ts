/**
 * Serialize a JSON-LD object for embedding in a <script> block. JSON.stringify
 * leaves "<" intact, so a stored value containing "</script>" would terminate
 * the block and inject markup into the page. Escaping "<" as \u003c is valid
 * JSON, so schema.org consumers parse it identically.
 */
export function jsonLdHtml(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
