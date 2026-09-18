FROM node:24.21.0-bookworm-slim
WORKDIR /workspace
COPY package.json package-lock.json ./
RUN npm ci
COPY lab ./lab
ENV CI=1
CMD ["npm","run","lab:experiment","--","--config","lab/xr-architecture/experiment.example.json"]
