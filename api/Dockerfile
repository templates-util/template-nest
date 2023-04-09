# Escolha uma imagem base com Node.js, na versão que você precisa
FROM node:16

# Escolha o diretório de trabalho para seu aplicativo
WORKDIR /usr/src/app

# Copie o arquivo package.json e instale as dependências do seu aplicativo
COPY package*.json ./
RUN npm install

# Copie o restante dos arquivos do seu aplicativo
COPY . .

# Defina as variáveis de ambiente necessárias para o seu aplicativo
ENV PORT=5000

# Exponha a porta necessária para o seu aplicativo
EXPOSE ${PORT}

# Defina o comando para iniciar seu aplicativo
CMD [ "npm", "run", "start:dev" ]
