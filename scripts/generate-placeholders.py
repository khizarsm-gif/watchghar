#!/usr/bin/env python3
"""
Dev script that generates the local SVG artwork shipped in /public/images:
logo.svg, hero.svg, about.svg and one demo image per demo product.
Re-run after editing the PRODUCTS list below, then keep `image` paths in
supabase/migrations/20261007000000_base_schema.sql in sync.

All artwork is original. The brand names are fictional on purpose.
"""
import math
import os

ROOT = os.path.join(os.path.dirname(__file__), "..", "public", "images")
PROD = os.path.join(ROOT, "products")
GOLD, GOLD_LT, GOLD_DK = "#d4a64a", "#f0d58a", "#8a6a22"
BG, BG2 = "#0e0b08", "#1a1511"

# slug, label, kind, case colour, dial colour, strap colour
PRODUCTS = [
    ("aurelian-classic-40", "Aurelian Classic 40", "round", "gold", "#f3ead2", "#3b2a1c"),
    ("aurelian-heritage-mesh", "Aurelian Heritage", "round", "steel", "#101820", "mesh"),
    ("kronos-chrono-sport", "Kronos Chrono Sport", "chrono", "steel", "#14213d", "#1c1c1c"),
    ("kronos-diver-200", "Kronos Diver 200", "diver", "steel", "#0b3d2e", "#1c1c1c"),
    ("vanta-onyx-automatic", "Vanta Onyx", "round", "black", "#0a0a0a", "#0a0a0a"),
    ("vanta-skeleton", "Vanta Skeleton", "skeleton", "gold", "#16110b", "#3b2a1c"),
    ("nilo-petite-rose", "Nilo Petite Rose", "round", "rose", "#fbeee9", "#e7c9c0"),
    ("nilo-bangle-pearl", "Nilo Bangle Pearl", "round", "gold", "#f6f1e6", "bangle"),
    ("nilo-square-deco", "Nilo Square Deco", "square", "gold", "#1a1a2e", "#2a2a3e"),
    ("pulse-smart-s2", "Pulse Smart S2", "smart", "black", "#06121f", "#161616"),
    ("pulse-smart-fit", "Pulse Smart Fit", "smart", "steel", "#04140f", "#2e4a40"),
    ("strap-leather-brown", "Leather Strap, Brown", "strap", "gold", "#000", "#5a3a22"),
]


def strap(color, top=True):
    if color == "mesh":
        pat = "".join(f'<line x1="{x}" y1="0" x2="{x}" y2="140" stroke="#9aa3ad" stroke-width="1"/>' for x in range(228, 372, 6))
        return f'<g clip-path="url(#sc)">{pat}</g>'
    return ""


def watch_body(kind, case, dial, band, cx=300, cy=300, r=118):
    case_fill = {"gold": GOLD, "steel": "#b8c0c8", "black": "#222", "rose": "#d9a898"}[case]
    case_dk = {"gold": GOLD_DK, "steel": "#6c747c", "black": "#000", "rose": "#8f6455"}[case]
    out = []
    # strap
    if band == "bangle":
        out.append(f'<rect x="{cx-40}" y="0" width="80" height="600" fill="{GOLD}"/>')
    elif band == "mesh":
        out.append(f'<rect x="{cx-48}" y="20" width="96" height="560" fill="#9aa3ad"/>')
        out.append("".join(f'<line x1="{cx-48}" y1="{y}" x2="{cx+48}" y2="{y+10}" stroke="#6c747c" stroke-width="1.5"/>' for y in range(20, 580, 10)))
    else:
        out.append(f'<path d="M{cx-46} 20 L{cx+46} 20 L{cx+52} 580 L{cx-52} 580 Z" fill="{band}" stroke="#ffffff" stroke-opacity="0.22" stroke-width="2"/>')
        out.append(f'<path d="M{cx-34} 40 L{cx-34} 560" stroke="#ffffff" stroke-opacity="0.08" stroke-width="2" stroke-dasharray="6 8"/>')
    if kind == "square" or kind == "smart":
        w = r * 1.7 if kind == "smart" else r * 1.55
        h = r * 2.0 if kind == "smart" else r * 1.55
        rx = 34 if kind == "smart" else 8
        out.append(f'<rect x="{cx-w/2-8}" y="{cy-h/2-8}" width="{w+16}" height="{h+16}" rx="{rx+8}" fill="{case_fill}" stroke="{case_dk}" stroke-width="3"/>')
        out.append(f'<rect x="{cx-w/2}" y="{cy-h/2}" width="{w}" height="{h}" rx="{rx}" fill="{dial}"/>')
        if kind == "smart":
            out.append(f'<text x="{cx}" y="{cy+8}" text-anchor="middle" font-family="Arial,sans-serif" font-size="58" font-weight="700" fill="{GOLD_LT}">10:09</text>')
            out.append(f'<text x="{cx}" y="{cy+44}" text-anchor="middle" font-family="Arial,sans-serif" font-size="16" fill="#9aa3ad">TUE 06</text>')
            out.append(f'<circle cx="{cx-34}" cy="{cy-58}" r="9" fill="none" stroke="{GOLD}" stroke-width="4"/>')
            out.append(f'<rect x="{cx+w/2+8}" y="{cy-14}" width="12" height="40" rx="5" fill="{case_dk}"/>')
            return "\n".join(out)
        hands(out, cx, cy, h_len=r*0.45, m_len=r*0.65, color=GOLD_LT)
        ticks(out, cx, cy, r*0.62, 12, GOLD)
        return "\n".join(out)
    # crown
    out.append(f'<rect x="{cx+r+4}" y="{cy-14}" width="22" height="28" rx="6" fill="{case_dk}"/>')
    out.append(f'<circle cx="{cx}" cy="{cy}" r="{r+16}" fill="{case_fill}" stroke="{case_dk}" stroke-width="3"/>')
    if kind == "diver":
        out.append(f'<circle cx="{cx}" cy="{cy}" r="{r+8}" fill="#111" stroke="{case_dk}" stroke-width="2"/>')
        for i in range(60):
            a = math.radians(i * 6)
            L = 8 if i % 5 == 0 else 4
            out.append(f'<line x1="{cx+(r+8)*math.sin(a):.1f}" y1="{cy-(r+8)*math.cos(a):.1f}" x2="{cx+(r+8-L)*math.sin(a):.1f}" y2="{cy-(r+8-L)*math.cos(a):.1f}" stroke="#ddd" stroke-width="1.5"/>')
        out.append(f'<circle cx="{cx}" cy="{cy}" r="{r-4}" fill="{dial}"/>')
    else:
        out.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{dial}"/>')
    if kind == "skeleton":
        out.append(f'<circle cx="{cx}" cy="{cy}" r="{r*0.55}" fill="none" stroke="{GOLD}" stroke-width="3"/>')
        for k in range(8):
            a = math.radians(k * 45)
            out.append(f'<line x1="{cx}" y1="{cy}" x2="{cx+r*0.55*math.sin(a):.1f}" y2="{cy-r*0.55*math.cos(a):.1f}" stroke="{GOLD_DK}" stroke-width="3"/>')
        out.append(f'<circle cx="{cx}" cy="{cy}" r="{r*0.18}" fill="{GOLD}"/>')
    if kind == "chrono":
        for dx, dy in ((-r*0.38, 0), (r*0.38, 0), (0, r*0.42)):
            out.append(f'<circle cx="{cx+dx:.1f}" cy="{cy+dy:.1f}" r="{r*0.2:.1f}" fill="none" stroke="#9aa3ad" stroke-width="2"/>')
    ticks(out, cx, cy, r - 8, 12, GOLD_LT if dial[1:2] in "0123456789abc" and dial not in ("#f3ead2", "#fbeee9", "#f6f1e6") else "#3b2a1c")
    dark = dial in ("#f3ead2", "#fbeee9", "#f6f1e6")
    hands(out, cx, cy, h_len=r*0.5, m_len=r*0.75, color="#3b2a1c" if dark else GOLD_LT)
    return "\n".join(out)


def ticks(out, cx, cy, rr, n, color):
    for i in range(n):
        a = math.radians(i * 360 / n)
        L = 14 if i % 3 == 0 else 7
        out.append(f'<line x1="{cx+rr*math.sin(a):.1f}" y1="{cy-rr*math.cos(a):.1f}" x2="{cx+(rr-L)*math.sin(a):.1f}" y2="{cy-(rr-L)*math.cos(a):.1f}" stroke="{color}" stroke-width="3" stroke-linecap="round"/>')


def hands(out, cx, cy, h_len, m_len, color):
    # shows 10:10, the classic display angle
    ah, am = math.radians(305), math.radians(60)
    out.append(f'<line x1="{cx}" y1="{cy}" x2="{cx+h_len*math.sin(ah):.1f}" y2="{cy-h_len*math.cos(ah):.1f}" stroke="{color}" stroke-width="7" stroke-linecap="round"/>')
    out.append(f'<line x1="{cx}" y1="{cy}" x2="{cx+m_len*math.sin(am):.1f}" y2="{cy-m_len*math.cos(am):.1f}" stroke="{color}" stroke-width="5" stroke-linecap="round"/>')
    out.append(f'<circle cx="{cx}" cy="{cy}" r="7" fill="{color}"/>')


def frame(inner, label, note="Demo product image"):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <defs><radialGradient id="g" cx="50%" cy="42%" r="70%"><stop offset="0" stop-color="#2a2118"/><stop offset="1" stop-color="{BG}"/></radialGradient></defs>
  <rect width="600" height="600" fill="url(#g)"/>
  {inner}
  <rect x="0" y="536" width="600" height="64" fill="{BG}" opacity="0.92"/>
  <text x="300" y="566" text-anchor="middle" font-family="Georgia,serif" font-size="20" fill="{GOLD}">{label}</text>
  <text x="300" y="588" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" fill="#ffffff" opacity="0.35">{note}</text>
</svg>'''


def strap_only(color):
    return f'''<g>
  <path d="M170 150 Q300 110 430 150 L420 470 Q300 510 180 470 Z" fill="{color}"/>
  <path d="M190 170 Q300 138 410 170" stroke="#ffffff" stroke-opacity="0.18" stroke-width="3" fill="none" stroke-dasharray="8 8"/>
  <path d="M190 450 Q300 480 410 450" stroke="#ffffff" stroke-opacity="0.18" stroke-width="3" fill="none" stroke-dasharray="8 8"/>
  <rect x="270" y="296" width="60" height="36" rx="6" fill="none" stroke="{GOLD}" stroke-width="6"/>
  <rect x="296" y="302" width="8" height="24" rx="3" fill="{GOLD}"/>
  {"".join(f'<circle cx="300" cy="{y}" r="5" fill="#00000066"/>' for y in (200, 230, 360, 390, 420))}
</g>'''


def make_logo():
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="236" height="96" viewBox="0 0 236 96" role="img" aria-label="Watch Ghar">
  <rect width="236" height="96" rx="14" fill="{BG}"/>
  <circle cx="44" cy="48" r="26" fill="none" stroke="{GOLD}" stroke-width="4"/>
  <line x1="44" y1="48" x2="44" y2="32" stroke="{GOLD_LT}" stroke-width="4" stroke-linecap="round"/>
  <line x1="44" y1="48" x2="57" y2="54" stroke="{GOLD_LT}" stroke-width="3.5" stroke-linecap="round"/>
  <circle cx="44" cy="48" r="3.5" fill="{GOLD}"/>
  <text x="84" y="46" font-family="Georgia,serif" font-size="26" font-weight="700" letter-spacing="1.5" fill="{GOLD_LT}">WATCH</text>
  <text x="84" y="72" font-family="Georgia,serif" font-size="26" font-weight="700" letter-spacing="1.5" fill="{GOLD}">GHAR</text>
</svg>'''


def main():
    os.makedirs(PROD, exist_ok=True)
    for slug, label, kind, case, dial, band in PRODUCTS:
        inner = strap_only(band) if kind == "strap" else watch_body(kind, case, dial, band)
        with open(os.path.join(PROD, f"{slug}.svg"), "w") as f:
            f.write(frame(inner, label))
    with open(os.path.join(PROD, "placeholder.svg"), "w") as f:
        f.write(frame(f'<circle cx="300" cy="280" r="110" fill="none" stroke="{GOLD}" stroke-width="6" opacity="0.6"/>'
                      f'<line x1="300" y1="280" x2="300" y2="210" stroke="{GOLD}" stroke-width="6" stroke-linecap="round" opacity="0.6"/>'
                      f'<line x1="300" y1="280" x2="350" y2="305" stroke="{GOLD}" stroke-width="6" stroke-linecap="round" opacity="0.6"/>',
                      "Image coming soon", "Watch Ghar"))
    with open(os.path.join(ROOT, "logo.svg"), "w") as f:
        f.write(make_logo())
    with open(os.path.join(ROOT, "hero.svg"), "w") as f:
        f.write(frame(watch_body("round", "gold", "#16110b", "#3b2a1c", r=128), "Watch Ghar", "Premium watches"))
    with open(os.path.join(ROOT, "about.svg"), "w") as f:
        def cell(x, body):
            return f'<svg x="{x}" y="0" width="260" height="520" viewBox="170 70 260 460" overflow="hidden">{body}</svg>'
        f.write(f'''<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
<rect width="800" height="600" fill="{BG}"/>
{cell(10, watch_body("round","steel","#101820","#1c1c1c",r=112))}
{cell(270, watch_body("round","gold","#f3ead2","#3b2a1c",r=112))}
{cell(530, watch_body("smart","black","#06121f","#161616",r=112))}
<text x="400" y="575" text-anchor="middle" font-family="Georgia,serif" font-size="24" fill="{GOLD}">Watch Ghar</text></svg>''')
    print(f"Generated {len(PRODUCTS)} product SVGs plus logo, hero and about")


if __name__ == "__main__":
    main()
