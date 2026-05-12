#!/usr/bin/env python3
"""
render_pdfs.py — Gera os dois PDFs da newsletter Posto em Dia (Mobile + A4)
a partir do HTML montado.

Uso:
    python render_pdfs.py <caminho_do_html> <pasta_de_saida> <numero_da_edicao>

Exemplo:
    python render_pdfs.py \\
        /home/claude/PostoEmDia_Semana16.html \\
        /mnt/user-data/outputs \\
        16

Saída:
    PostoEmDia_Semana<N>_Mobile.pdf  (120x220mm, formato celular vertical)
    PostoEmDia_Semana<N>_A4.pdf      (A4 vertical, computador / impressão)

Dependências:
    pip install playwright --break-system-packages
    playwright install chromium

Fallback:
    Se Playwright não estiver disponível, o script tenta wkhtmltopdf.
    Resultado visual é ligeiramente inferior (sem suporte completo a flexbox e emojis),
    mas funciona em ambientes restritos.
"""

import sys
import os
import shutil
import subprocess
from pathlib import Path


def gerar_com_playwright(html_path: str, mobile_pdf: str, a4_pdf: str) -> bool:
    """Renderiza os 2 PDFs usando Playwright + Chromium. Retorna True em sucesso."""
    try:
        import asyncio
        from playwright.async_api import async_playwright
    except ImportError:
        print("[!] Playwright não disponível.")
        return False

    file_url = f"file://{os.path.abspath(html_path)}"

    async def _render():
        async with async_playwright() as p:
            browser = await p.chromium.launch()

            # ---------- MOBILE PDF (formato celular vertical) ----------
            ctx_mobile = await browser.new_context(
                viewport={"width": 414, "height": 896},
                device_scale_factor=2,
            )
            page = await ctx_mobile.new_page()
            await page.goto(file_url)
            await page.wait_for_load_state("networkidle")
            await page.pdf(
                path=mobile_pdf,
                width="120mm",
                height="220mm",
                print_background=True,
                margin={"top": "0", "bottom": "0", "left": "0", "right": "0"},
            )
            await ctx_mobile.close()

            # ---------- A4 PDF (computador / impressão) ----------
            ctx_a4 = await browser.new_context(
                viewport={"width": 800, "height": 1200},
                device_scale_factor=2,
            )
            page = await ctx_a4.new_page()
            await page.goto(file_url)
            await page.wait_for_load_state("networkidle")
            await page.pdf(
                path=a4_pdf,
                format="A4",
                print_background=True,
                margin={"top": "10mm", "bottom": "10mm", "left": "10mm", "right": "10mm"},
            )
            await ctx_a4.close()
            await browser.close()

    asyncio.run(_render())
    return True


def gerar_com_wkhtmltopdf(html_path: str, mobile_pdf: str, a4_pdf: str) -> bool:
    """Fallback: renderiza com wkhtmltopdf se disponível."""
    if not shutil.which("wkhtmltopdf"):
        print("[!] wkhtmltopdf não disponível.")
        return False

    # Mobile: largura 120mm, sem altura fixa (deixa fluir)
    subprocess.run([
        "wkhtmltopdf",
        "--enable-local-file-access",
        "--page-width", "120mm",
        "--page-height", "220mm",
        "--margin-top", "0",
        "--margin-bottom", "0",
        "--margin-left", "0",
        "--margin-right", "0",
        "--encoding", "UTF-8",
        "--quiet",
        html_path,
        mobile_pdf,
    ], check=True)

    # A4
    subprocess.run([
        "wkhtmltopdf",
        "--enable-local-file-access",
        "--page-size", "A4",
        "--margin-top", "10mm",
        "--margin-bottom", "10mm",
        "--margin-left", "10mm",
        "--margin-right", "10mm",
        "--encoding", "UTF-8",
        "--quiet",
        html_path,
        a4_pdf,
    ], check=True)
    return True


def main():
    if len(sys.argv) != 4:
        print(__doc__)
        sys.exit(1)

    html_path = sys.argv[1]
    output_dir = sys.argv[2]
    edicao = sys.argv[3]

    if not os.path.exists(html_path):
        print(f"[X] HTML não encontrado: {html_path}")
        sys.exit(1)

    Path(output_dir).mkdir(parents=True, exist_ok=True)

    mobile_pdf = os.path.join(output_dir, f"PostoEmDia_Semana{edicao}_Mobile.pdf")
    a4_pdf = os.path.join(output_dir, f"PostoEmDia_Semana{edicao}_A4.pdf")

    print(f"→ HTML de entrada: {html_path}")
    print(f"→ Saída Mobile:   {mobile_pdf}")
    print(f"→ Saída A4:       {a4_pdf}")

    # Tenta Playwright primeiro (melhor renderização), depois wkhtmltopdf
    if gerar_com_playwright(html_path, mobile_pdf, a4_pdf):
        print("✓ Gerado com Playwright")
    elif gerar_com_wkhtmltopdf(html_path, mobile_pdf, a4_pdf):
        print("✓ Gerado com wkhtmltopdf (fallback)")
    else:
        print("[X] Nenhuma ferramenta de renderização disponível.")
        print("    Instale: pip install playwright && playwright install chromium")
        print("    Ou: apt install wkhtmltopdf")
        sys.exit(1)

    # Confirma criação
    for path in [mobile_pdf, a4_pdf]:
        if os.path.exists(path):
            size_kb = os.path.getsize(path) // 1024
            print(f"  ✓ {os.path.basename(path)}  ({size_kb} KB)")
        else:
            print(f"  ✗ FALHOU: {path}")
            sys.exit(1)

    print("\n✓ PDFs prontos para entrega.")


if __name__ == "__main__":
    main()
