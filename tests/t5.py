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
    pg.get_by_role("button",name="Novo",exact=False).first.click(); pg.wait_for_timeout(600)
    pg.get_by_text("Criar o meu").click(); pg.wait_for_timeout(600)
    dlg().get_by_placeholder("Ex.: Caminhar").fill("Corrida leve")
    dlg().get_by_text("Acumular").click(); pg.wait_for_timeout(400)
    meta=dlg().locator("input[inputmode=decimal]")
    print("campos decimais:",meta.count())
    t=meta.nth(1)
    t.click(); t.fill(""); ok(t.input_value()=="","campo meta pode ficar vazio (sem 0 preso)")
    t.type("2,5"); ok(t.input_value()=="2,5","vírgula aceita: "+t.input_value())
    pg.screenshot(path=S+"b1.png")
    # dias fixos
    dlg().get_by_role("button",name="Dias fixos").click(); pg.wait_for_timeout(400)
    pg.screenshot(path=S+"b2.png")
    print(dlg().inner_text()[-900:])
    dlg().get_by_role("button",name="Criar hábito").click(); pg.wait_for_timeout(900)
    ok("Corrida leve" in pg.inner_text("body"),"hábito de dias fixos criado")
    # segundo hábito: contar
    pg.get_by_role("button",name="Novo",exact=False).first.click(); pg.wait_for_timeout(600)
    pg.locator("[role=dialog]").get_by_text("Corpo").click(); pg.wait_for_timeout(500)
    pg.screenshot(path=S+"b3.png")
    pg.locator("[role=dialog]").get_by_text("Treino",exact=False).first.click(); pg.wait_for_timeout(600)
    dlg().get_by_role("button",name="Criar hábito").click(); pg.wait_for_timeout(900)
    names=pg.locator("h3").all_inner_texts(); print("h3:",names)
    pg.screenshot(path=S+"b4.png")
    # reordenar
    pg.get_by_role("button",name="Ordenar").first.click(); pg.wait_for_timeout(700)
    pg.screenshot(path=S+"b5.png")
    h=pg.get_by_role("button",name="Arrastar Treino"); bx=h.bounding_box()
    pg.mouse.move(bx["x"]+20,bx["y"]+20); pg.mouse.down(); pg.mouse.move(bx["x"]+20,bx["y"]-130,steps=14); pg.mouse.up(); pg.wait_for_timeout(600)
    rows=pg.locator("[role=dialog] li").all_inner_texts(); print("rows:",rows)
    ok(rows and "Treino" in rows[0],"Treino foi para o topo")
    pg.screenshot(path=S+"b6.png")
    pg.get_by_role("button",name="Fechar").last.click(); pg.wait_for_timeout(700)
    ok(pg.locator("[role=dialog]").count()==0,"fechar fecha")
    ok(pg.evaluate("getComputedStyle(document.body).position")!="fixed","scroll destravado após fechar")
    b.close(); print(errs, fails)
