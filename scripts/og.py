"""Gera as imagens de compartilhamento (WhatsApp, Facebook, etc.) de cada página.

Lê dist/og-jobs.json (criado pelo build.mjs) e salva JPGs de 1200x630 em dist/og/.
Uso: python3 scripts/og.py   (precisa do Pillow: pip install pillow)
"""
import json
import os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, "dist")
W, H = 1200, 630
INK, LIGHT, MUTED, ACCENT, SEA = "#0F2733", "#EAF1F0", "#9DB3BB", "#E35F2A", "#14B8B0"
PANEL = "#163039"
COLORS = {"s0": "#98A7AD", "s1": "#4F9FCF", "s2": "#169485", "s3": "#2E9A45", "s4": "#E35F2A", "bad": "#B23A4C"}

_fonts = {}


def font(kind, size, weight):
    key = (kind, size, weight)
    if key not in _fonts:
        path = os.path.join(ROOT, "assets", "fonts", "BigShouldersDisplay.ttf" if kind == "display" else "Figtree.ttf")
        f = ImageFont.truetype(path, size)
        try:
            f.set_variation_by_axes([weight])
        except Exception:
            pass
        _fonts[key] = f
    return _fonts[key]


def fit(draw, text, kind, weight, max_w, start, minimum):
    size = start
    while size > minimum:
        f = font(kind, size, weight)
        if draw.textlength(text, font=f) <= max_w:
            return f
        size -= 4
    return font(kind, minimum, weight)


MARK = Image.open(os.path.join(ROOT, "assets", "icons", "logo-mark.png")).convert("RGBA")


def render(job):
    img = Image.new("RGB", (W, H), INK)
    d = ImageDraw.Draw(img)

    # Marca: onda + "Tá Rolando?"
    m = MARK.resize((round(MARK.width * 78 / MARK.height), 78), Image.LANCZOS)
    img.paste(m, (56, 44), m)
    f = font("text", 40, 800)
    x = 56 + m.width + 14
    d.text((x, 62), "Tá Rolando", font=f, fill=LIGHT)
    d.text((x + d.textlength("Tá Rolando", font=f), 62), "?", font=f, fill=ACCENT)

    # Rótulo (canto direito)
    f = font("text", 24, 700)
    lab = job["label"].upper()
    d.text((W - 56 - d.textlength(lab, font=f), 72), lab, font=f, fill=MUTED)

    # Nome grande
    name = job["name"].upper()
    f = fit(d, name, "display", 900, W - 112, 150, 70)
    d.text((54, 140), name, font=f, fill=LIGHT)
    y = 140 + f.size + 4
    if job.get("sub"):
        d.text((58, y), job["sub"], font=font("text", 30, 500), fill=MUTED)
        y += 52

    # Nota + comentário
    if job.get("cond"):
        cond, color = job["cond"], COLORS.get(job.get("color", "s2"), "#169485")
        f = font("text", 34, 800)
        tw = d.textlength(cond, font=f)
        d.rounded_rectangle((56, y, 56 + tw + 48, y + 60), radius=30, fill=color)
        d.text((80, y + 9), cond, font=f, fill="#FFFFFF")
        if job.get("say"):
            f2 = font("display", 60, 900)
            say = "“" + job["say"].upper() + "”"
            d.text((56 + tw + 76, y - 4), say, font=f2, fill="#FF8D9B" if job.get("bad") else "#FFFFFF")
        y += 84

    # Linha de destaque (top moment)
    if job.get("line"):
        f = font("text", 30, 600)
        line = job["line"]
        while d.textlength(line, font=f) > 700 and len(line) > 10:
            line = line[:-2]
        if line != job["line"]:
            line = line.rstrip(" ·,") + "…"
        if job.get("badge"):
            fb = font("text", 22, 800)
            bw = d.textlength(job["badge"].upper(), font=fb)
            d.rounded_rectangle((56, y, 56 + bw + 24, y + 36), radius=8, fill=ACCENT)
            d.text((68, y + 6), job["badge"].upper(), font=fb, fill="#FFFFFF")
            y += 48
        d.text((56, y), line, font=f, fill=LIGHT)

    # Barras dos 8 dias (canto inferior direito)
    bars = job.get("bars") or []
    if bars:
        bw, gap, hmax = 30, 14, 130
        bx, by = W - 56 - len(bars) * (bw + gap) + gap, 536
        d.rounded_rectangle((bx - 20, by - hmax - 56, bx + len(bars) * (bw + gap) - gap + 20, by + 42), radius=22, fill=PANEL)
        mh = max(1.0, max(b[1] for b in bars))
        fl = font("text", 15, 700)
        for i, (s, h, lab) in enumerate(bars):
            x0 = bx + i * (bw + gap)
            bh = 10 + (hmax - 10) * (h / mh)
            d.rounded_rectangle((x0, by - bh, x0 + bw, by), radius=6, fill=COLORS.get(s, "#169485"))
            t = lab.upper()
            d.text((x0 + bw / 2 - d.textlength(t, font=fl) / 2, by + 10), t, font=fl, fill=MUTED)
        fv = font("text", 18, 700)
        t = "PRÓXIMOS 8 DIAS"
        d.text((bx, by - hmax - 42), t, font=fv, fill=MUTED)

    # Rodapé
    d.rectangle((0, H - 8, W, H), fill=ACCENT)
    f = font("text", 28, 700)
    d.text((56, H - 64), job.get("site", "tarolandosurf.com.br"), font=f, fill=SEA)
    return img


def main():
    jobs = json.load(open(os.path.join(DIST, "og-jobs.json"), encoding="utf8"))
    for job in jobs:
        out = os.path.join(DIST, job["file"].lstrip("/"))
        os.makedirs(os.path.dirname(out), exist_ok=True)
        render(job).save(out, "JPEG", quality=84, optimize=True, progressive=True)
    os.remove(os.path.join(DIST, "og-jobs.json"))
    print(f"{len(jobs)} imagens de compartilhamento geradas.")


if __name__ == "__main__":
    main()
