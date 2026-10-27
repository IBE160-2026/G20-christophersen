#!/usr/bin/env python3
"""Deterministic PDF authoring. Reads report-source.json only, never expected.json."""
import json
from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfgen.canvas import Canvas
from reportlab.platypus import Paragraph

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "report-source.json"
OUTPUT = ROOT / "S5-B1-v1-tilstandsrapport.pdf"
WIDTH, HEIGHT = A4
LEFT, RIGHT, TOP, BOTTOM = 49, 49, 71, 61
TEXT_WIDTH = WIDTH - LEFT - RIGHT
INK = HexColor("#26323A")
MUTED = HexColor("#59646A")
ACCENT = HexColor("#246A74")
STYLES = {
    "title": ParagraphStyle("title", fontName="Helvetica-Bold", fontSize=20, leading=24, textColor=INK, alignment=TA_LEFT),
    "intro": ParagraphStyle("intro", fontName="Helvetica", fontSize=11.4, leading=16.3, textColor=INK),
    "heading": ParagraphStyle("heading", fontName="Helvetica-Bold", fontSize=11.4, leading=15, textColor=ACCENT),
    "body": ParagraphStyle("body", fontName="Helvetica", fontSize=11.4, leading=16.3, textColor=INK),
}


def draw_paragraph(canvas, text, style, y):
    paragraph = Paragraph(escape(text), STYLES[style])
    _, height = paragraph.wrap(TEXT_WIDTH, HEIGHT)
    if y - height < BOTTOM:
        raise ValueError(f"Text does not fit on physical page {canvas.getPageNumber()}: {text[:70]}")
    paragraph.drawOn(canvas, LEFT, y - height)
    return y - height


def generate():
    source = json.loads(SOURCE.read_text(encoding="utf-8"))
    pages = source["pages"]
    if len(pages) != 14:
        raise ValueError("Exactly 14 explicitly authored pages required")
    canvas = Canvas(str(OUTPUT), pagesize=A4, invariant=1, pageCompression=1)
    canvas.setTitle("S5-B1-v1 - Fiktiv tilstandsrapport - Granlia")
    canvas.setAuthor("IBE160 G20 - AI-assistert, fiktivt øvingsgrunnlag")
    canvas.setSubject("Forhåndsdefinert tekstbasert benchmarkrapport; ingen faktisk befaring eller sertifisering")
    for number, page in enumerate(pages, start=1):
        canvas.setFillColor(MUTED)
        canvas.setFont("Helvetica", 9)
        canvas.drawString(LEFT, HEIGHT - 32, "GRANLIA  |  FIKTIV TILSTANDSRAPPORT  |  S5-B1-v1")
        canvas.setStrokeColor(HexColor("#D7DEE0"))
        canvas.line(LEFT, HEIGHT - 42, WIDTH - RIGHT, HEIGHT - 42)
        y = HEIGHT - TOP
        y = draw_paragraph(canvas, page["title"], "title", y) - 17
        if page.get("intro"):
            y = draw_paragraph(canvas, page["intro"], "intro", y) - 15
        for section in page["sections"]:
            y = draw_paragraph(canvas, section["heading"], "heading", y) - 5
            for paragraph in section["paragraphs"]:
                y = draw_paragraph(canvas, paragraph, "body", y) - 9
            y -= 4
        canvas.setStrokeColor(HexColor("#D7DEE0"))
        canvas.line(LEFT, 45, WIDTH - RIGHT, 45)
        canvas.setFillColor(MUTED)
        canvas.setFont("Helvetica", 9)
        canvas.drawString(LEFT, 30, "Granlia - dokumentversjon 1 | 27. oktober 2026")
        canvas.drawRightString(WIDTH - RIGHT, 30, f"PDF-side {number} av {len(pages)}")
        canvas.showPage()
    canvas.save()
    print(OUTPUT)


if __name__ == "__main__":
    generate()
