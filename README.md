# UP Eventos Web — versão aprimorada

## Como abrir
1. Extraia o ZIP.
2. Abra a pasta `UP-EVENTOS-WEB-PRO-2026` no VS Code.
3. Instale a extensão **Live Server**, se ainda não tiver.
4. Clique com o botão direito em `index.html` e escolha **Open with Live Server**.

## Fluxo do site
- `apresentacao.html`: site público para visitantes.
- `login.html?modo=entrar`: entrar com conta.
- `login.html?modo=criar`: criar conta.
- `pages/`: dashboard e módulos internos.
- `js/app.js`: funções comuns e interações.

## Funcionalidades
- Cadastro e login demonstrativos usando dados guardados no navegador.
- Visitante pode conhecer o site; o fluxo de orçamento encaminha para login.
- Dados de clientes, orçamentos, datas e fotos ficam no `localStorage` deste navegador.
- Câmera e galeria dependem da permissão do navegador; a câmera costuma funcionar em `localhost` pelo Live Server.
- Impressão/exportação: os botões de impressão abrem a janela do navegador, onde é possível escolher **Salvar como PDF**.
- Notificações de demonstração dentro do site.
- Calendário: a seleção visual de data é local; para disponibilidade compartilhada e sincronização real entre usuários, é necessário backend.

## Importante sobre autenticação e sincronização real
Esta é uma versão funcional para demonstração escolar, não um sistema de produção. As contas ficam apenas neste navegador e a senha não deve ser usada como solução de segurança real. Google/Apple aparecem como opções visuais, mas precisam de credenciais OAuth e configuração para autenticação verdadeira. Para sincronizar usuários, fotos, calendário e orçamentos em dispositivos diferentes, conecte um backend seguro (por exemplo, PHP + MySQL no XAMPP) e valide permissões no servidor.

## Solução de problemas
- Se aparecer `Cannot GET`, abra o `index.html` com Live Server em vez de acessar um caminho digitado manualmente.
- Se a câmera não abrir, autorize o acesso à câmera no navegador e use `localhost`/HTTPS.
- Se o PDF não baixar diretamente, escolha **Salvar como PDF** na janela de impressão.


## Correções nesta revisão
- `index.html` abre a primeira tela pública do site.
- O fluxo de orçamento agora manda para login sem tentar abrir `login.html` dentro da pasta `pages`.
- A página de datas recebeu um calendário interativo com mês anterior/próximo, seleção e salvamento da data.
- O botão Exportar CSV cria um arquivo `.csv` para download quando há dados.
- Novo Serviço abre um formulário e guarda o serviço personalizado no navegador.
- Contato público mostra WhatsApp demonstrativo `11 00000-0000`. Confirme/substitua pelo número oficial antes de publicar.
- Exportação PDF usa a impressão do navegador; escolha "Salvar como PDF".

Atenção: armazenamento local não sincroniza entre navegadores ou dispositivos. O login por Google/Apple precisa de OAuth real. Não publique senhas armazenadas no navegador como autenticação de produção.


## Ajustes finais desta entrega
- O módulo de orçamento aceita sessão reconhecida pelo login e registra o destino correto após autenticação.
- Foi adicionado o botão **Baixar CSV** na página de orçamentos; exporta os orçamentos guardados neste navegador.
- A seleção e confirmação de datas grava a data e o estado da reserva no navegador.
- **PDF:** use Imprimir / Exportar PDF e escolha “Salvar como PDF” na janela de impressão do navegador.
- O calendário e os dados continuam locais a este navegador. Para sincronização real entre pessoas/dispositivos e disponibilidade compartilhada, é necessário servidor/backend. O WhatsApp `11 00000-0000` é demonstrativo e deve ser substituído pelo número oficial.


## Revisão: calendário único e orçamentos
- A página de datas agora remove o calendário estático duplicado e mantém um calendário interativo único.
- O título do calendário usa o mês/ano selecionado, em vez de ficar fixo em junho de 2026.
- A página `pages/orcamentos.html` tem suporte para salvar dados de formulário no navegador e exportar campos preenchidos em CSV; imprimir permite salvar PDF.
- As páginas de módulos incluem títulos no navegador.
- As funcionalidades são locais ao navegador; não representam sincronização multiusuário nem armazenamento seguro de produção.
