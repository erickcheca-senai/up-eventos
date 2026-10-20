
const UP = {
  get(key, fallback = []) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  toast(message) {
    let el = document.getElementById("up-toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "up-toast";
      el.style.cssText = "position:fixed;right:24px;bottom:24px;z-index:9999;background:#2b241f;color:#fff;border:1px solid #8d7763;border-radius:12px;padding:14px 18px;box-shadow:0 10px 30px #0008;font-family:Outfit,sans-serif;transition:.25s";
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.style.opacity = "1";
    clearTimeout(window.__upToast);
    window.__upToast = setTimeout(() => el.style.opacity = "0", 2600);
  },
  go(page) { window.location.href = page; },
  saveClient(data) {
    const list = UP.get("up_eventos_clientes");
    data.id = Date.now();
    data.criadoEm = new Date().toISOString();
    list.push(data);
    UP.set("up_eventos_clientes", list);
  },
  saveBudget(data) {
    const list = UP.get("up_eventos_orcamentos");
    data.id = Date.now();
    data.criadoEm = new Date().toISOString();
    list.push(data);
    UP.set("up_eventos_orcamentos", list);
  },
  saveDate(data) {
    UP.set("up_eventos_data_evento", data);
  },
  getPhotos() { return UP.get("up_eventos_fotos"); },
  savePhoto(photo) {
    const photos = UP.get("up_eventos_fotos");
    photos.unshift({id: Date.now(), data: photo, criadoEm: new Date().toISOString()});
    // Evita estourar o armazenamento do navegador com fotos demais.
    if (photos.length > 30) photos.length = 30;
    UP.set("up_eventos_fotos", photos);
  },
  deletePhoto(id) {
    UP.set("up_eventos_fotos", UP.get("up_eventos_fotos").filter(p => p.id !== id));
  }
};

document.addEventListener("DOMContentLoaded", () => {
  // Links principais do menu continuam funcionando em qualquer tela.
  document.querySelectorAll("a[href='#']").forEach(a => {
    const text = a.textContent.toLowerCase();
    if (text.includes("trocar plataforma")) a.href = "../dashboard.html";
  });

  // Dashboard: métricas reais dos dados salvos no navegador.
  const clients = UP.get("up_eventos_clientes");
  const budgets = UP.get("up_eventos_orcamentos");
  const photos = UP.get("up_eventos_fotos");
  document.querySelectorAll("[data-up-client-count]").forEach(e => e.textContent = clients.length);
  document.querySelectorAll("[data-up-budget-count]").forEach(e => e.textContent = budgets.length);
  document.querySelectorAll("[data-up-photo-count]").forEach(e => e.textContent = photos.length);

  // Cadastro de clientes.
  const clientForm = document.getElementById("new-client-form");
  if (clientForm) {
    clientForm.addEventListener("submit", e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(clientForm).entries());
      // Alguns campos desta tela não têm name; captura os valores pelos IDs.
      document.querySelectorAll("#new-client-form input, #new-client-form select, #new-client-form textarea")
        .forEach(el => { if (el.id) data[el.id] = el.value; });
      UP.saveClient(data);
      UP.toast("Cliente salvo no sistema.");
    });
  }

  // Orçamentos: salva o conteúdo da tela ao clicar em Salvar Rascunho ou Enviar.
  const budgetSave = (button) => {
    const data = {url: location.href, itens: [], campos: {}};
    document.querySelectorAll("input, select, textarea").forEach(el => {
      if (el.id || el.value) data.campos[el.id || el.name || el.placeholder || ("campo_" + data.itens.length)] = el.value;
    });
    document.querySelectorAll("[data-selected='true']").forEach(el => {
      const t = el.querySelector(".btn-text")?.textContent?.trim() || el.textContent.trim();
      if (t) data.itens.push(t);
    });
    UP.saveBudget(data);
    UP.toast(button.textContent.includes("Enviar") ? "Proposta registrada e pronta para envio." : "Rascunho salvo.");
  };
  document.getElementById("btn-submit-proposal")?.addEventListener("click", function(){ budgetSave(this); });
  document.querySelectorAll("button").forEach(btn => {
    if (btn.textContent.toLowerCase().includes("salvar rascunho")) {
      btn.addEventListener("click", () => budgetSave(btn));
    }
  });

  // Definição de data.
  document.querySelectorAll("button").forEach(btn => {
    const t = btn.textContent.trim();
    if (/Junho 14|Junho 21|Junho 28|Julho 05/.test(t)) {
      btn.addEventListener("click", () => {
        UP.saveDate({data: t.replace(/\s+/g, " ").trim(), salvoEm: new Date().toISOString()});
        UP.toast("Data selecionada. Clique em Confirmar para salvar a reserva.");
      });
    }
  });
  const confirmDate = [...document.querySelectorAll("button")].find(b => b.textContent.includes("Confirmar Data do Evento"));
  if (confirmDate) {
    confirmDate.addEventListener("click", () => {
      const selected = UP.get("up_eventos_data_evento", {});
      selected.confirmada = true;
      selected.confirmadaEm = new Date().toISOString();
      UP.saveDate(selected);
      UP.toast("Reserva de data salva.");
    });
  }

  // Página de eventos/galeria: câmera real e seleção de arquivos.
  const cameraButton = document.getElementById("btn-camera");
  if (cameraButton) cameraButton.addEventListener("click", () => UP.go("camera.html"));
  const galleryButton = document.getElementById("btn-gallery");
  if (galleryButton) {
    const input = document.createElement("input");
    input.type = "file"; input.accept = "image/*"; input.multiple = true; input.hidden = true;
    document.body.appendChild(input);
    galleryButton.addEventListener("click", () => input.click());
    input.addEventListener("change", () => {
      [...input.files].forEach(file => {
        const reader = new FileReader();
        reader.onload = e => { UP.savePhoto(e.target.result); UP.toast("Foto adicionada à galeria."); renderPhotoCount(); };
        reader.readAsDataURL(file);
      });
    });
  }
  function renderPhotoCount() {
    document.querySelectorAll("[data-up-photo-count]").forEach(e => e.textContent = UP.getPhotos().length);
  }
  renderPhotoCount();

  // Botões que representam ações reais.
  document.querySelectorAll("button").forEach(btn => {
    const text = btn.textContent.trim().toLowerCase();
    if (text.includes("cadastrar cliente")) btn.addEventListener("click", () => UP.go("cadastro-clientes.html"));
    if (text.includes("novo orçamento")) btn.addEventListener("click", () => UP.go("orcamentos.html"));
    if (text.includes("ver galeria") || text.includes("galeria & câmera")) btn.addEventListener("click", () => UP.go("eventos-galeria.html"));
  });
});

/* Sistema de notificações UP Eventos */
document.addEventListener("DOMContentLoaded", () => {
  const notices = [
    {icon:"notifications", title:"Bem-vindo ao UP Eventos", text:"Sistema carregado com sucesso."},
    {icon:"photo_camera", title:"Módulo Fotográfico", text:"Você pode abrir a câmera e registrar fotos do evento."},
    {icon:"person", title:"Clientes", text:`${UP.get("up_eventos_clientes").length} cliente(s) cadastrado(s).`},
    {icon:"request_quote", title:"Orçamentos", text:`${UP.get("up_eventos_orcamentos").length} orçamento(s) registrado(s).`}
  ];

  function showNotifications() {
    let old = document.getElementById("up-notification-panel");
    if (old) { old.remove(); return; }

    const panel = document.createElement("div");
    panel.id = "up-notification-panel";
    panel.style.cssText = "position:fixed;right:24px;top:72px;width:360px;max-width:calc(100vw - 32px);z-index:10000;background:#201f21;color:#eee;border:1px solid #50453b;border-radius:16px;box-shadow:0 18px 50px #0009;padding:18px;font-family:Outfit,sans-serif";
    panel.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
      <strong style="font-size:18px">Notificações</strong>
      <button id="up-close-notices" style="background:none;border:0;color:#aaa;font-size:20px;cursor:pointer">×</button>
    </div>
    ${notices.map(n => `<div style="display:flex;gap:12px;padding:12px 0;border-top:1px solid #ffffff12">
      <span class="material-symbols-outlined" style="color:#f2be8c">${n.icon}</span>
      <div><b style="display:block">${n.title}</b><span style="font-size:13px;color:#aaa">${n.text}</span></div>
    </div>`).join("")}`;
    document.body.appendChild(panel);
    document.getElementById("up-close-notices").onclick = () => panel.remove();
  }

  // Ícones/botões de notificação.
  document.querySelectorAll("button, a").forEach(el => {
    const text = (el.textContent || "").toLowerCase();
    const aria = (el.getAttribute("aria-label") || "").toLowerCase();
    const title = (el.getAttribute("title") || "").toLowerCase();
    if (text.includes("notifica") || aria.includes("notifica") || title.includes("notifica")) {
      el.addEventListener("click", e => { e.preventDefault(); showNotifications(); });
    }
  });

  // Fallback: qualquer link para arquivo inexistente volta ao dashboard.
  document.querySelectorAll("a[href]").forEach(a => {
    a.addEventListener("click", e => {
      const href = a.getAttribute("href");
      if (!href || href === "#") return;
      if (/^(https?:|mailto:|tel:|javascript:)/i.test(href)) return;
      // Não interfere em âncoras internas.
      if (href.startsWith("#")) return;
    });
  });
});



/* Recursos gerais da plataforma */
(function () {
  const read = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch (_) { return fallback; }
  };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));

  function toastGlobal(message) {
    let box = document.getElementById("up-toast-global");
    if (!box) {
      box = document.createElement("div");
      box.id = "up-toast-global";
      box.style.cssText = "position:fixed;right:22px;bottom:22px;z-index:10000;background:#29221e;color:#fff;border:1px solid #d9a36f;border-radius:12px;padding:13px 18px;box-shadow:0 12px 35px #0009;font:500 14px Arial,sans-serif;max-width:360px";
      document.body.appendChild(box);
    }
    box.textContent = message;
    box.hidden = false;
    clearTimeout(window.__upGlobalToastTimer);
    window.__upGlobalToastTimer = setTimeout(() => { box.hidden = true; }, 3200);
  }

  function isLoggedIn() {
    return localStorage.getItem("up_eventos_sessao") === "ativa";
  }

  function requireAccount(destination) {
    const insidePages = location.pathname.includes("/pages/");
    // Os destinos armazenados são caminhos a partir da raiz do projeto.
    // Em páginas dentro de /pages/, use apenas o nome do arquivo para não gerar /pages/pages/...
    const normalizedDestination = destination || "pages/orcamentos.html";
    const relativeDestination = insidePages
      ? normalizedDestination.replace(/^.*\//, "")
      : normalizedDestination.replace(/^\.\//, "");
    if (isLoggedIn() || localStorage.getItem("up_eventos_logado") === "1") {
      location.href = relativeDestination;
      return;
    }
    localStorage.setItem("up_eventos_destino_apos_login", normalizedDestination);
    const loginPath = insidePages ? "../login.html?modo=entrar" : "login.html?modo=entrar";
    location.href = loginPath;
  }

  document.addEventListener("click", function (event) {
    const el = event.target.closest("button, a");
    if (!el) return;
    const label = (el.innerText || el.getAttribute("aria-label") || el.title || "").trim().toLowerCase();

    if (label.includes("solicitar orçamento") || label.includes("novo orçamento") ||
        label.includes("elaboração de orçamento") || label.includes("prosseguir para elaboração")) {
      event.preventDefault();
      requireAccount("pages/orcamentos.html");
      return;
    }
    if (label.includes("imprimir") || label.includes("exportar pdf") || label.includes("baixar dossiê") || label.includes("baixar pdf")) {
      event.preventDefault();
      window.print();
      return;
    }
    if (label.includes("trocar plataforma") || label.includes("sair da conta") || label === "sair") {
      event.preventDefault();
      localStorage.removeItem("up_eventos_sessao");
      toastGlobal("Você saiu da sua conta.");
      setTimeout(() => location.href = "../apresentacao.html", 500);
      return;
    }
    if (label.includes("notifica")) {
      event.preventDefault();
      const notices = [
        "Bem-vindo ao UP Eventos.",
        "Confira suas datas e propostas pendentes.",
        "Suas alterações ficam salvas neste navegador."
      ];
      alert("NOTIFICAÇÕES\n\n" + notices.join("\n\n"));
    }
  });

  // Torna os botões de calendário selecionáveis e salva a data escolhida.
  document.addEventListener("click", function (event) {
    const el = event.target.closest("button, [data-date], .calendar-day, .calendar-date");
    if (!el) return;
    const text = (el.innerText || "").trim();
    const dateAttr = el.getAttribute("data-date");
    const dateText = dateAttr || (el.matches("[data-date], .calendar-day, .calendar-date") ? text : "");
    if (dateText && /^\d{4}-\d{2}-\d{2}$/.test(dateText)) {
      write("up_eventos_data_evento", { data: dateText, atualizadoEm: new Date().toISOString() });
      document.querySelectorAll(".calendar-day.selected, .calendar-date.selected").forEach(node => node.classList.remove("selected"));
      el.classList.add("selected");
      toastGlobal("Data selecionada: " + dateText);
    }
  });

  // Atualiza contagens visíveis quando a página tiver espaços para elas.
  document.addEventListener("DOMContentLoaded", function () {
    const clients = read("up_eventos_clientes", []);
    const budgets = read("up_eventos_orcamentos", []);
    const photos = read("up_eventos_fotos", []);
    document.querySelectorAll("[data-count='clients']").forEach(n => n.textContent = clients.length);
    document.querySelectorAll("[data-count='budgets']").forEach(n => n.textContent = budgets.length);
    document.querySelectorAll("[data-count='photos']").forEach(n => n.textContent = photos.length);
  });
})();


/* Correções de navegação, exportação e calendário */
document.addEventListener("DOMContentLoaded", () => {
  const rootPath = location.pathname.includes("/pages/") ? "../" : "";
  document.querySelectorAll("a[href='dashboard.html'],a[href='cadastro-clientes.html'],a[href='servicos.html'],a[href='orcamentos.html'],a[href='datas.html'],a[href='eventos-galeria.html'],a[href='camera.html']").forEach(a => {
    if (location.pathname.includes("/pages/")) return;
    const href = a.getAttribute("href");
    if (!href.startsWith("pages/")) a.setAttribute("href", "pages/" + href);
  });

  const downloadFile = (filename, content, type) => {
    const blob = new Blob(["\ufeff", content], {type});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const csvCell = value => '"' + String(value ?? "").replace(/"/g, '""') + '"';
  const exportCSV = () => {
    const clients = JSON.parse(localStorage.getItem("up_eventos_clientes") || "[]");
    const rows = clients.length ? clients : [...document.querySelectorAll("table tbody tr")].map(tr =>
      [...tr.querySelectorAll("th,td")].map(td => td.innerText.trim())
    );
    if (!rows.length) {
      const values = [...document.querySelectorAll("input,select,textarea")].filter(el => el.value).map(el => ({campo:el.name || el.id || el.placeholder, valor:el.value}));
      if (values.length) {
        downloadFile("up-eventos-dados.csv", ["Campo,Valor", ...values.map(v => [csvCell(v.campo),csvCell(v.valor)].join(","))].join("\r\n"), "text/csv;charset=utf-8");
        return;
      }
      alert("Ainda não há dados para exportar. Cadastre um cliente ou preencha a tabela primeiro.");
      return;
    }
    let csv;
    if (Array.isArray(rows[0]) && rows[0].length) csv = rows.map(row => row.map(csvCell).join(",")).join("\r\n");
    else {
      const keys = [...new Set(rows.flatMap(row => Object.keys(row)))];
      csv = [keys.map(csvCell).join(","), ...rows.map(row => keys.map(key => csvCell(row[key])).join(","))].join("\r\n");
    }
    downloadFile("up-eventos-clientes.csv", csv, "text/csv;charset=utf-8");
  };
  document.querySelectorAll("button,a").forEach(el => {
    const label = (el.innerText || el.title || el.getAttribute("aria-label") || "").toLowerCase();
    if (label.includes("exportar csv") || label.includes("baixar csv")) {
      el.addEventListener("click", event => { event.preventDefault(); exportCSV(); });
    }
    if (label.includes("imprimir") || label.includes("exportar pdf") || label.includes("baixar dossiê") || label.includes("baixar pdf")) {
      el.addEventListener("click", event => { event.preventDefault(); window.print(); });
    }
    if (label.includes("novo serviço")) {
      el.addEventListener("click", event => {
        event.preventDefault();
        if (document.getElementById("up-new-service-modal")) return;
        const modal = document.createElement("div");
        modal.id = "up-new-service-modal";
        modal.style.cssText = "position:fixed;inset:0;z-index:20000;background:#000b;display:grid;place-items:center;padding:18px";
        modal.innerHTML = `<form id="up-new-service-form" style="width:min(520px,100%);background:#201f21;color:#f5eee8;border:1px solid #76563d;border-radius:18px;padding:24px;display:grid;gap:12px;font-family:Arial">
          <h2 style="font:28px Georgia,serif">Cadastrar novo serviço</h2>
          <label>Nome do serviço<input name="nome" required style="display:block;width:100%;padding:12px;background:#0d0c0c;color:white;border:1px solid #54453a;border-radius:8px;margin-top:5px"></label>
          <label>Categoria<select name="categoria" style="display:block;width:100%;padding:12px;background:#0d0c0c;color:white;border:1px solid #54453a;border-radius:8px;margin-top:5px"><option>Decoração & Cenografia</option><option>Gastronomia & Buffet</option><option>Audiovisual & Iluminação</option><option>Música & Atrações</option><option>Equipe & Cerimonial</option><option>Fotografia</option></select></label>
          <label>Descrição<textarea name="descricao" required rows="3" style="display:block;width:100%;padding:12px;background:#0d0c0c;color:white;border:1px solid #54453a;border-radius:8px;margin-top:5px"></textarea></label>
          <label>Preço inicial (R$)<input name="preco" type="number" min="0" step="0.01" required style="display:block;width:100%;padding:12px;background:#0d0c0c;color:white;border:1px solid #54453a;border-radius:8px;margin-top:5px"></label>
          <div style="display:flex;gap:10px;justify-content:flex-end"><button type="button" id="up-cancel-service" style="padding:11px 15px">Cancelar</button><button type="submit" style="padding:11px 18px;background:#f2be8c;color:#2b190c;border-radius:9px;font-weight:bold">Salvar serviço</button></div></form>`;
        document.body.appendChild(modal);
        modal.querySelector("#up-cancel-service").onclick = () => modal.remove();
        modal.querySelector("form").onsubmit = e => {
          e.preventDefault();
          const data = Object.fromEntries(new FormData(e.target).entries());
          const list = JSON.parse(localStorage.getItem("up_eventos_servicos_personalizados") || "[]");
          list.push({...data, id:Date.now(), criadoEm:new Date().toISOString()});
          localStorage.setItem("up_eventos_servicos_personalizados", JSON.stringify(list));
          modal.remove();
          alert("Serviço salvo no catálogo deste navegador.");
        };
      }, {once:true});
    }
  });

  // Mantém apenas o calendário original da página datas.html para evitar duplicação.
});


/* UP Eventos — exportação CSV e navegação corrigida */
(function(){
  function csvCell(v){ if(v===null||v===undefined) return ''; if(typeof v==='object') v=JSON.stringify(v); return '"'+String(v).replace(/"/g,'""')+'"'; }
  function downloadCSV(filename, rows){
    if(!rows || !rows.length){ UP.toast('Ainda não há dados para exportar. Salve um orçamento primeiro.'); return; }
    const keys=[...new Set(rows.flatMap(r=>Object.keys(r)))];
    const csv='\ufeff'+[keys.map(csvCell).join(';'),...rows.map(r=>keys.map(k=>csvCell(r[k])).join(';'))].join('\r\n');
    const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'}); const url=URL.createObjectURL(blob);
    const a=document.createElement('a'); a.href=url; a.download=filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    UP.toast('Arquivo CSV preparado para baixar.');
  }
  document.addEventListener('DOMContentLoaded',function(){
    const csvBtn=document.getElementById('up-export-csv');
    if(csvBtn) csvBtn.addEventListener('click',function(){
      const rows=UP.get('up_eventos_orcamentos',[]).map(b=>({id:b.id||'',criadoEm:b.criadoEm||'',url:b.url||'',itens:(b.itens||[]).join(', '),campos:JSON.stringify(b.campos||{})}));
      downloadCSV('up-eventos-orcamentos.csv',rows);
    });
    // Impressão do navegador permite salvar como PDF.
    document.querySelectorAll('button').forEach(btn=>{
      const label=(btn.innerText||'').toLowerCase();
      if(label.includes('imprimir') && label.includes('pdf')) btn.addEventListener('click',function(e){e.preventDefault();window.print();});
    });
  });
})();
