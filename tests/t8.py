from playwright.sync_api import sync_playwright
S="/tmp/enso-shots/"
fails=[]
def ok(c,m):
    print(("OK  " if c else "FAIL"),m)
    if not c: fails.append(m)
with sync_playwright() as p:
    b=p.chromium.launch()
    ctx=b.new_context(viewport={"width":390,"height":844},has_touch=True,is_mobile=True,locale="pt-BR")
    ctx.add_init_script("""const AC=window.AudioContext;window.__ac=[];window.AudioContext=function(...a){const c=new AC(...a);window.__ac.push(c);return c};window.AudioContext.prototype=AC.prototype;""")
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

    pg.get_by_role("button",name="Som ambiente").click(); pg.wait_for_timeout(700)
    pg.get_by_role("button",name="Tocar som ambiente").click(); pg.wait_for_timeout(2500)
    st=lambda: pg.evaluate("window.__ac.map(c=>c.state)")
    print("estado:",st()); ok(st()==["running"],"áudio rodando")
    pg.evaluate("window.__ac[0].suspend()"); pg.wait_for_timeout(500); print("após suspender:",st())
    pg.wait_for_timeout(5500); print("5s depois:",st()); ok(st()==["running"],"vigia retomou o áudio sozinho")
    pg.get_by_role("button",name="Pausar som ambiente").click(); pg.wait_for_timeout(2500)
    ok(st()==["suspended"],"pausa manual suspende")
    b.close(); print(errs, fails)
