# Site de Apostas em Eventos Futuros

Este projeto é uma aplicação web para gerenciar e realizar apostas em eventos futuros.

O Site de Apostas em Eventos Futuros permite que os usuários 
visualizem uma lista de eventos futuros,
realizem apostas em eventos selecionados,
consultem resultados de apostas,
gerenciem suas contas e histórico de apostas.

Tecnologias Utilizadas:

Node.js: Ambiente de execução para JavaScript no lado do servidor.

TypeScript: Superset do JavaScript que adiciona tipagem estática.

Oracle: Banco de dados utilizado.

Instruções: 
- No terminal, utilize o comando "npm i" para instalar as dependencias necessárias;
- Criar o arquivo ".env" e preencher conforme o ".env.exemple" mostra;
- É necessário inicializar o banco de dados (criação das tabelas) para utilizar a aplicação. No terminal utilize o comando "npm run setup-db";
- Para criar o build, no terminal utilize o comando "npm run build";
- E por fim, para que o servidor comece a rodar deve-se escrever no terminal utilize o comando "npm run dev";
- Vá ao seu navegador e escreva na barra de endereço o URL "localhost:3000/homepage" para acessar a homepage do site;
- Moderadores devem ser adicionados manualmente pelo banco de dados;
- Moderadores não tem telas, apenas rotas.
