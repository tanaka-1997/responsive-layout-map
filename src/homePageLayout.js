// The default data: a docs-style home page (top nav, floating menu, titles,
// stats, article, contents) drawn at three breakpoints. Coordinates are in
// real CSS pixels at each breakpoint's width; the component scales them down.

export const DEFAULT_BLOCK_TYPES = {
  nav: { label: "Top nav", color: "var(--rlm-ink)" },
  rail: { label: "Floating menu", color: "var(--rlm-p1)" },
  titles: { label: "Titles", color: "var(--rlm-p1)" },
  stats: { label: "Stats", color: "var(--rlm-p2)" },
  doc: { label: "Article", color: "var(--rlm-p3)", darkText: true },
  toc: { label: "Contents", color: "var(--rlm-p2)" },
};

function stack(x, y, w, gap, items) {
  return items.map(([type, h, label]) => {
    const block = { type, x, y, w, h, label };
    y += h + gap;
    return block;
  });
}

/**
 * Builds the home-page layout for one breakpoint.
 * Returns { blocks, columns, gutters, spec } in CSS pixels.
 */
export function homePageLayout(name, W) {
  const blocks = [{ type: "nav", x: 0, y: 0, w: W, h: 56, label: "Top nav" }];
  const columns = [];
  const gutters = [];
  let spec;

  if (name === "Full" || name === "Medium") {
    const wrapW = Math.min(1048, W - 48);
    const wx = (W - wrapW) / 2;
    const top = 56 + 52;
    const g1 = name === "Full" ? 96 : 56;
    const g2 = name === "Full" ? 80 : 48;
    const rail = 32;
    const mainX = wx + rail + g1;
    const mainW = wrapW - rail - g1;
    const hasToc = name === "Full";
    const cw = Math.min(640, hasToc ? mainW - g2 - 200 : mainW);
    const cx = hasToc ? mainX : mainX + (mainW - cw) / 2;

    columns.push({ x: wx, w: rail });
    gutters.push({ x: wx + rail, w: cx - (wx + rail) });
    for (let i = 0; i < 8; i++) columns.push({ x: cx + (i * cw) / 8, w: cw / 8, alt: i % 2 === 1 });

    blocks.push({ type: "rail", x: wx, y: top + 96, w: rail, h: hasToc ? 349 : 385, label: "" });
    blocks.push(...stack(cx, top, cw, 40, [["titles", 296, "Titles"], ["stats", 56, "Stats"]]));
    blocks.push(
      ...stack(cx, top + 296 + 40 + 56 + 40, cw, 24, [
        ["doc", 220, "Article"],
        ["doc", 150, "Code block"],
        ["doc", 260, "Article"],
        ["doc", 200, ""],
      ])
    );

    if (hasToc) {
      const tx = cx + cw + g2;
      gutters.push({ x: cx + cw, w: g2 });
      columns.push({ x: tx, w: 200 });
      blocks.push({ type: "toc", x: tx, y: top + 96, w: 200, h: 380, label: "Contents" });
    } else {
      blocks.push({ type: "toc", x: wx + rail + 8, y: top + 96 + 108, w: 280, h: 330, label: "Contents popover", popover: true });
    }

    spec = [`wrap ${Math.round(wrapW)}`, "rail 32", `gap ${g1}`, `content ${Math.round(cw)}`].concat(
      hasToc ? [`gap ${g2}`, "toc 200"] : []
    );
  } else {
    const wx = 16;
    const wrapW = W - 32;
    const top = 56 + 24;
    for (let i = 0; i < 8; i++) columns.push({ x: wx + (i * wrapW) / 8, w: wrapW / 8, alt: i % 2 === 1 });
    blocks.push({ type: "rail", x: wx, y: top, w: wrapW, h: 48, label: "Floating menu" });
    blocks.push(
      ...stack(wx, top + 48 + 24, wrapW, 32, [
        ["titles", 400, "Titles"],
        ["stats", 96, "Stats"],
        ["doc", 300, "Article"],
      ])
    );
    blocks.push({ type: "toc", x: wx, y: top + 56, w: Math.min(320, wrapW), h: 300, label: "Contents popover", popover: true });
    spec = [`wrap ${wrapW}`, "margin 16", "gap 24 / 32"];
  }

  return { blocks, columns, gutters, spec };
}

export const DEFAULT_BREAKPOINTS = [
  { name: "Full", width: 1280, height: 900, range: "1140px +" },
  { name: "Medium", width: 860, height: 1000, range: "720–980px" },
  { name: "Mobile", width: 390, height: 844, range: "< 720px" },
].map((bp) => ({ ...bp, layout: homePageLayout(bp.name, bp.width) }));
