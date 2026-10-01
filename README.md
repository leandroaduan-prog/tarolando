# Tá Rolando?

Previsão de surf para os picos do litoral brasileiro: ondas, vento, maré e tempo para 8 dias, com nota fácil e o melhor horário para surfar.

O site é gerado automaticamente a cada 3 horas pelo GitHub, com a previsão real da Open-Meteo, e publicado de graça no GitHub Pages.

---

## Colocar no ar (primeira vez)

### 1. Registrar o domínio
1. Entre em [registro.br](https://registro.br) e registre **tarolandosurf.com.br** (se for .com, troque o endereço no `config.json` e neste passo a passo).
2. Deixe para configurar o DNS no passo 4.

### 2. Enviar o projeto para o GitHub (GitHub Desktop)
1. Descompacte o arquivo `tarolando.zip` numa pasta do computador.
2. No GitHub Desktop: **File › Add local repository** e escolha a pasta `tarolando`.
3. Ele vai avisar que a pasta não é um repositório: clique em **create a repository**, depois em **Create repository**.
4. Clique em **Publish repository**. Nome: `tarolando`. **Desmarque "Keep this code private"**, porque o GitHub Pages grátis exige repositório público.

### 3. Ligar o GitHub Pages
1. No site do GitHub, abra o repositório **tarolando** › **Settings** › **Pages**.
2. Em **Build and deployment › Source**, escolha **GitHub Actions**.
3. Vá na aba **Actions**, clique em **Atualizar site** › **Run workflow**.
4. Em uns 3 a 5 minutos o site aparece em `https://leandroaduan-prog.github.io/tarolando/`.

### 4. Apontar o domínio
1. Em **Settings › Pages › Custom domain**, digite `tarolandosurf.com.br` e salve.
2. No registro.br, em **DNS** do domínio, crie:
   - 4 registros **A** para `tarolandosurf.com.br` com os IPs:
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - 1 registro **CNAME** para `www` apontando para `leandroaduan-prog.github.io`
3. Espere o DNS propagar (de minutos a algumas horas). Depois marque **Enforce HTTPS** em Settings › Pages.
4. Rode o **Atualizar site** de novo, para os links e o sitemap usarem o domínio.

### 5. Google
1. Cadastre o site no [Google Search Console](https://search.google.com/search-console) (propriedade de domínio `tarolandosurf.com.br`).
2. Em **Sitemaps**, envie `sitemap.xml`.

---

## Fase 2: anúncios (AdSense)

A API grátis da Open-Meteo só pode ser usada sem anúncios. Antes de ligar o AdSense:

1. Assine um plano pago em [open-meteo.com/en/pricing](https://open-meteo.com/en/pricing) e copie a chave da API.
2. No GitHub: **Settings › Secrets and variables › Actions › New repository secret**. Nome: `OPEN_METEO_API_KEY`, valor: a sua chave.
3. Peça a aprovação do site no [AdSense](https://adsense.google.com).
4. Quando aprovado, edite `config.json`:
   ```json
   "ads": { "enabled": true, "client": "ca-pub-SEU_NUMERO", "slots": { "home": "", "lista": "", "pico": "" } }
   ```
   Os espaços de anúncio já existem na página inicial, nas listas e nas páginas de pico. O arquivo `ads.txt` é criado sozinho.

---

## Editar o site

- **Picos:** `src/picos.mjs`. Cada linha é um pico:
  `[nome, cidade, UF, latitude, longitude, praia virada para (graus), exposição, nível, marcas, dica]`
  - *Praia virada para:* direção do mar vista da areia (0 = norte, 90 = leste, 180 = sul).
  - *Exposição:* 1 = recebe o swell em cheio; menor = mais protegida; maior = amplifica (lajes).
  - *Marcas:* `S` isolado, `B` laje/ondas grandes, `T` risco de tubarão, `P` pororoca.
  - Fichas completas (fundo, melhor swell, vento e maré) ficam em `FICHA`, no mesmo arquivo.
- **E-mail de contato:** `config.json`.
- **Visual:** `assets/style.css`.
- **Nota e comentários:** `src/rating.mjs`.

Toda alteração enviada pelo GitHub Desktop (Commit + Push) publica o site de novo.

## App instalável (PWA)

O site também funciona como app:
- **Android (Chrome):** aparece o aviso "Leve o Tá Rolando no celular" com o botão **Instalar**.
- **iPhone (Safari):** botão Compartilhar › **Adicionar à Tela de Início**. O site mostra esse passo a passo quando a pessoa toca em Instalar.
- Sem internet, abre a última previsão salva da página inicial e dos picos favoritos.
- Ícones em `assets/icons/`. O funcionamento offline está em `assets/sw.js`.

## Imagem no WhatsApp

Cada página tem uma imagem de prévia (1200×630) com a previsão do dia, gerada por `scripts/og.py` a cada atualização. Ela aparece quando alguém compartilha o link no WhatsApp, Instagram, Facebook etc. Fontes em `assets/fonts` (licença OFL).

## Testar no computador (opcional)

Precisa do [Node.js 20+](https://nodejs.org).

```bash
node scripts/build.mjs --mock   # gera com dados de exemplo, sem internet
node scripts/build.mjs          # gera com a previsão real
python3 scripts/og.py           # gera as imagens de compartilhamento (precisa do Pillow)
npx serve dist                  # abre em http://localhost:3000
```

## Bom saber

- O GitHub desliga a atualização automática de repositórios públicos que ficam **60 dias sem nenhum commit**. Se aparecer esse aviso na aba Actions, é só clicar para reativar.
- A maré vem de modelo numérico com precisão limitada perto da costa. O site avisa isso aos usuários.
- Créditos obrigatórios da Open-Meteo (CC BY 4.0) já estão no rodapé.
