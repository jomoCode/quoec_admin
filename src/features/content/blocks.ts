/** Content blocks of a journal post, as stored by the backend and rendered by The Citadel website. */
export type ContentImage = { src: string; alt: string };

export type BlogBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "heading"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "quote"; text: string; cite?: string }
  | { kind: "image"; image: ContentImage; caption?: string };
