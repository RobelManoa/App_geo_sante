FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG EXPO_PUBLIC_API_URL=http://localhost:5000/api
ARG EXPO_PUBLIC_PRESTATAIRES_API_URL=http://localhost:5000/api/prestataires
ARG EXPO_PUBLIC_UPLOADS_URL=http://localhost:5000
ENV EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL
ENV EXPO_PUBLIC_PRESTATAIRES_API_URL=$EXPO_PUBLIC_PRESTATAIRES_API_URL
ENV EXPO_PUBLIC_UPLOADS_URL=$EXPO_PUBLIC_UPLOADS_URL

RUN npx expo export --platform web

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]