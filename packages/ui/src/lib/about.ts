/** The copy of a tool's About section. One source feeds the visible section, the FAQ structured data and llms.txt, so they cannot drift. */
export interface ToolAboutContent {
  heading: string;
  /** One short paragraph: what the tool is and who it is for. */
  intro: string;
  /** Three or four short "how it works" or privacy points. */
  points: { title: string; body: string }[];
  /** Four to six questions, answered in plain text (the same text goes into the FAQPage markup). */
  faq: { q: string; a: string }[];
}
