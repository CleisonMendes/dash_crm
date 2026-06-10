​Guia de Desenvolvimento e Gerenciamento
​Este documento descreve as formas de editar, desenvolver e implantar o seu projeto.
​Como editar o código
​Existem quatro formas principais de realizar alterações na sua aplicação:
​1. Através da plataforma Lovable
​A maneira mais direta é acessar o painel do seu projeto no Lovable e enviar suas sugestões ou comandos diretamente pela interface. Todas as alterações feitas por lá são sincronizadas automaticamente com o repositório.
​2. Usando sua IDE local
​Se você prefere trabalhar localmente, pode clonar o repositório e utilizar seu editor de código favorito (como VS Code). Certifique-se de ter o Node.js e o npm instalados (recomendamos o uso do nvm para gerenciar as versões).
​Passos para configuração local:
# 1. Clone o repositório
git clone <URL_DO_SEU_GIT>

# 2. Entre na pasta do projeto
cd <NOME_DO_SEU_PROJETO>

# 3. Instale as dependências
npm i

# 4. Inicie o servidor de desenvolvimento
npm run dev


3. Editando diretamente no GitHub
​Para alterações rápidas de arquivos específicos:
​Navegue até o arquivo desejado no repositório.
​Clique no ícone de lápis ("Editar") no canto superior direito.
​Faça as alterações necessárias e confirme o commit.
​4. Usando o GitHub Codespaces
​Para um ambiente de desenvolvimento na nuvem, sem precisar configurar nada localmente:
​Na página principal do repositório, clique no botão verde "Código".
​Selecione a aba "Codespaces".
​Clique em "Novo espaço de código".
​Edite, confirme e envie (push) suas alterações diretamente no navegador.
​Tecnologias utilizadas
​Este projeto foi desenvolvido com uma base moderna e eficiente:
​Vite: Ferramenta de construção e servidor de desenvolvimento ultra rápido.
​TypeScript: Garantia de tipagem estática e maior segurança no código.
​React: Biblioteca para construção de interfaces dinâmicas e reativas.
​shadcn/ui: Componentes de interface reutilizáveis e acessíveis.
​Tailwind CSS: Framework de utilitários CSS para estilização rápida e responsiva.
​Como implantar o projeto
​O processo de deploy é simplificado através da própria plataforma:
​Abra o seu projeto no Lovable.
​Vá até a opção Compartilhar.
​Clique em Publicar.
​Domínios personalizados
​É possível conectar um domínio próprio ao seu projeto para deixá-lo com uma identidade profissional.
​No Lovable, acesse Projeto > Configurações > Domínios.
​Clique em Conectar Domínio.
​Siga as instruções fornecidas na tela para configurar o DNS.
