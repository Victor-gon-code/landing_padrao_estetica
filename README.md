# Estética Avançada Débora Bedin — proposta interativa

Branch de demonstração criada especificamente para a **Estética Avançada Débora Bedin**, em São Gabriel/RS.

## Direção
A proposta abandona a sequência tradicional de cards de clínica e trabalha como uma peça editorial em movimento: tipografia grande, mudanças de atmosfera ao rolar a página, fotografia em recortes orgânicos, objeto 3D reativo, cursor contextual e microinterações.

A base técnica veio do experimento `landing_padrao_estetica`, mas a composição, narrativa, paleta, ritmo, cenas e comportamento foram redesenhados para esta apresentação.

## Stack
- HTML semântico;
- CSS responsivo dividido por responsabilidade;
- JavaScript sem framework;
- Three.js / WebGL;
- GSAP + ScrollTrigger.

## Arquivos
- `index.html` — conteúdo e narrativa;
- `debora-core.css` — fundação visual, navegação, hero e observação;
- `debora-scenes.css` — tratamentos, experiência, galeria, espaço, FAQ e contato;
- `debora-responsive.css` — tablet, mobile e reduced motion;
- `script.js` — interações, scroll e objeto 3D;
- `DEBORA_PUBLIC_SOURCES.md` — dados públicos conferidos e limites da demonstração.

## Rodar localmente

```bash
python -m http.server 8000
```

Abra `http://localhost:8000`.

Os recursos de Three.js, GSAP, Google Fonts e as imagens editoriais são carregados da internet.

## Antes de publicar
A demonstração está com `noindex,nofollow`. As fotografias são editoriais e devem ser substituídas por material autorizado da profissional, do espaço e dos atendimentos. O perfil oficial do Instagram não foi confirmado nas buscas públicas, portanto nenhum @ ou conteúdo social foi inventado.
