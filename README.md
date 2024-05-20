# Buda Spread API

API desarrollada para el proceso de postulación a Buda para el cargo de software engineer - entry level.

## Stack Tecnológico

- **Express**
- **TypeScript**
- **Jest** y **Supertest** para el test automatizado
- **Swagger** para la documentación
- **SQLite3** para almacenar las alertas

## Instalación y Configuración

1. Clonar el Repositorio

```bash
git clone https://
cd buda-spread-api
```

2. Instalar Dependencias
```bash
yarn install
```

3. Configuración del Entorno

Crear un archivo `.env` en la raiz del proyecto y configurar las variables de entorno necesarias.

Ejemplo de archivo `.env`:

```makefile
NODE_ENV="development"
PORT="3000"
HOST="localhost"

CORS_ORIGIN="http://localhost:*"

COMMON_RATE_LIMIT_WINDOW_MS="1000"
COMMON_RATE_LIMIT_MAX_REQUESTS="20"
```

## Instrucciones

### Correr los Tests

```sh
yarn test
```

### Correr proyecto en modo development

```sh
yarn dev
```

### Correr proyecto en modo producción

```sh
docker-compose build
docker-compose up
```

## Endpoints más importantes

* GET /docs. Muestra la documentación de todos los endpoints.

* GET /spread: Muestra todos los spreads de todos los mercados de Buda.

* GET /spread/:market: Muestra el spread del mercado con market siendo el nombre del mercado.

* POST /alerts: Crea una nueva alerta en la base de datos. El body debe ser un JSON con el siguiente formato:

```json
{
  "market": "market_name",
  "spread": 500
}
```

También existe métodos PUT, DELETE para las alertas especificados en la documentación.

* GET /alerts: Muestra todas las alertas que están en la base de datos.

* GET /alerts/:market: Muestra la alerta (si existe) del mercado con nombre market.

* GET /alerts/:market/check: Entrega success: true si se ha disparado la alerta (es decir, si el spread actual es menor que el spread de alerta). Entrega success: false en caso contrario.

## Documentación de la API

La documentación de la API se desarrolló utilizando `swagger` y `tsoa`. La documentación es posible visualizarla en:

```
https://${HOST}:${PORT}/docs
```

Muchas gracias! :smile: