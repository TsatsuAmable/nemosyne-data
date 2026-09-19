FROM node:24-bookworm-slim
WORKDIR /lab
COPY package.json package-lock.json* ./
RUN npm ci
COPY lab ./lab
ENTRYPOINT ["npm"]
CMD ["run","lab:typecheck"]
