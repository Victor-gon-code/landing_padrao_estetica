# MATÉRIA — landing imersiva para saúde & estética

Base conceitual para apresentar a clínicas, profissionais de estética e saúde da pele. A intenção é fugir deliberadamente do padrão de landing page de clínica: sem sequência de cards, sem bento, sem glassmorphism e sem blocos corporativos previsíveis.

## Conceito
**Pele é matéria viva.**

A interface trata textura, luz, estrutura e tempo como linguagem visual. O site funciona mais como uma experiência editorial/interativa do que como um template tradicional.

## Stack
- HTML semântico
- CSS responsivo
- JavaScript
- Three.js / WebGL
- GLSL (shader procedural da forma orgânica)
- GSAP + ScrollTrigger

## Experiências principais
- objeto 3D orgânico deformável, reagindo a ponteiro e scroll;
- paleta do 3D muda junto com a narrativa;
- lente interativa de textura em fotografia macro;
- sequência horizontal de cuidados no desktop;
- versão vertical própria no mobile;
- revelação cinematográfica do espaço;
- tipografia cinética;
- menu-mapa em tela cheia;
- loader curto e direção de movimento consistente;
- fallback automático se WebGL não estiver disponível;
- redução de efeitos para aparelhos modestos e `prefers-reduced-motion`.

## Personalização obrigatória antes de apresentar a um cliente real
1. Trocar `MATÉRIA` pelo nome/identidade do profissional ou clínica.
2. Trocar o número do WhatsApp no `index.html`.
3. Inserir apenas procedimentos que o profissional realmente oferece e está habilitado a realizar.
4. Substituir São Gabriel/endereço se necessário.
5. Preferir fotografias próprias do cliente. As imagens atuais são demonstrativas e vêm do Unsplash.
6. Revisar todo texto clínico/publicitário conforme conselho profissional e categoria do cliente.

## Imagens demonstrativas
As fotografias remotas usadas nesta demo foram selecionadas no Unsplash e devem ser substituídas por material autorizado do cliente em produção. Para um site publicado, vale baixar, converter para WebP/AVIF e servir localmente.

## Execução
Não existe build step.

Abra com Live Server no VS Code ou qualquer servidor HTTP simples:

```bash
python -m http.server 8000
```

Depois acesse `http://localhost:8000`.

> Para ver WebGL e os recursos remotos corretamente, teste com conexão à internet.


## Revisão de acabamento
A revisão atual reduziu sobreposições acidentais no hero e nos painéis de procedimentos, reorganizou o mobile para que imagem e texto tenham respiro próprio, corrigiu triggers de animação, suavizou a paleta e adicionou fallback para ausência de GSAP/WebGL.

As áreas de procedimento agora deixam claro o que é **foto demonstrativa** e onde deve entrar **fotografia real do cliente**.

### Referências de imagem demonstrativa adicionadas
- Facial treatment — Unsplash, Karelys Ruiz: https://unsplash.com/photos/woman-receiving-facial-skincare-treatment-PqyzuzFiQfY
- Facial mask application — Unsplash, Ernesto Samaniego: https://unsplash.com/photos/woman-applies-a-clear-textured-mask-to-another-womans-face-o9qR56aa9hw

Essas imagens estão apenas na demo. Em produção, substituir por fotos autorizadas do atendimento real sempre que possível.
