from playwright.sync_api import sync_playwright
S="/tmp/enso-shots/"
fails=[]
def ok(c,m):
    print(("OK  " if c else "FAIL"),m)
    if not c: fails.append(m)
with sync_playwright() as p:
    b=p.chromium.launch()
    ctx=b.new_context(viewport={"width":390,"height":844},has_touch=True,is_mobile=True,locale="pt-BR")
    pg=ctx.new_page(); errs=[]
    pg.on("pageerror",lambda e:errs.append(str(e)))
    pg.goto("http://localhost:3111"); pg.wait_for_timeout(1200)
    ov=pg.locator("div.fixed.z-50").first
    def main(): return ov.locator("button:visible").last
    main().click(); pg.wait_for_timeout(700); main().click(); pg.wait_for_timeout(1200)
    ov.get_by_role("button",name="Estudar e ter foco").click(); main().click(); pg.wait_for_timeout(700)
    ov.locator("button",has_text="termina o que começa").click(); main().click(); pg.wait_for_timeout(700)
    ov.get_by_text("De manhã").click(); main().click(); pg.wait_for_timeout(700)
    ov.get_by_role("button",name="Ler uma página").click(); main().click(); pg.wait_for_timeout(1500)
    ok("Ler uma página" in pg.inner_text("body"),"primeiro hábito criado pelo onboarding")

    def dlg(): return pg.locator("[role=dialog]")
    # criar do zero: Acumular com decimal

    # diário: escrever, fechar, texto some; "Ver Diário" aparece
    pg.get_by_text("Escreva sobre o seu dia").click(); pg.wait_for_timeout(500)
    pg.get_by_label("Diário do dia").fill("Dia bom, caminhei bastante.")
    pg.get_by_role("button",name="Pronto").click(); pg.wait_for_timeout(700)
    body=pg.inner_text("body")
    ok("caminhei bastante" not in body,"texto do diário não aparece após fechar")
    ok("Ver Diário" in body,"botão Ver Diário presente")
    ok("Toque no rosto" not in body and "Fica só no" not in body and "(opcional)" not in body,"textos removidos")
    # dia difícil
    pg.get_by_role("button",name="Ativar dia difícil").click(); pg.wait_for_timeout(700)
    ok("Voltar ao normal" in pg.inner_text("body"),"banner dia difícil com botão reposicionado")
    pg.screenshot(path=S+"c1.png")
    pg.get_by_role("button",name="Voltar ao normal").click(); pg.wait_for_timeout(600)
    # user-select
    ok(pg.evaluate("getComputedStyle(document.querySelector('main')).userSelect")=="none","user-select none")
    # som/meditação
    pg.get_by_role("button",name="Som ambiente").click(); pg.wait_for_timeout(700)
    print(pg.locator("[role=dialog]").inner_text()[:700]); pg.screenshot(path=S+"c2.png")
    b.close(); print(errs, fails)
