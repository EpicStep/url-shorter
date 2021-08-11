# URL Shorter
[![Tests](https://github.com/EpicStep/url-shorter/actions/workflows/tests.yml/badge.svg)](https://github.com/EpicStep/url-shorter/actions/workflows/tests.yml)
## Run (Locally)
Create .env file and add following values:
```dotenv
PORT=3000
DB_URL=mongodb://mongodb:27017/shorter
URL=http://localhost:3000
```

After you can run app in docker:
```bash
docker compose up -d
```