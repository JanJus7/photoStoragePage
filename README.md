# Projekt zaliczeniowy

Wielomodułowy system do zarządzania zdjęciami z autoryzacją opartą o OAuth2 (Keycloak), konteneryzacją Docker, i trzema klientami:

- SPA (React)
- SSR (Express + EJS)
- B2B (Node.js backend-to-backend)

---

## Wymagania

- Docker + Docker Compose
- Porty: `5173`, `3000`, `5000`, `8080`, `27017`

---

## Uruchamianie
W folderze `frontend` utworzyć plik **.env** i wstawić do niego ten tekst:
`VITE_API_URL=/api/`

Następnie:


```bash
docker-compose up --build
```

**Pierwsze uruchomienie** zaimportuje gotowy realm `carXpage` z konfiguracją Keycloak.

---

## Usługi

| Usługa               | Adres URL                  | Opis                                |
|----------------------|----------------------------|--------------------------------------|
| Frontend SPA         | http://localhost:5173      | React SPA – logowanie, zdjęcia      |
| SSR Client           | http://localhost:3000      | Aplikacja SSR z listą zdjęć         |
| Keycloak             | http://localhost:8080      | Panel logowania i admina            |
| API (backend Flask)  | http://localhost:5000      | CRUD: zdjęcia, tokeny               |
| MongoDB              | mongodb://localhost:27017  | Baza danych                          |

---

## Testowe konta użytkowników powinne zostać wgrane wraz z keycloak, rejestracja automatycznie nadaje rolę user, admina trzeba ręcznie dodać przez panel keycloak. Każde konto użytkownika ma hasło "user" a admina "admin"

---

## Keycloak – Realm `carXpage`

Keycloak startuje z predefiniowaną konfiguracją realm z pliku:

```
keycloak/realm-export.json
```

Zawiera:
- Role: `user`, `admin`
- Klienty: `carx-spa`, `carx-ssr`, `carx-b2b`
- Konfiguracje OAuth2: redirecty, typy klientów, role
- Użytkownicy testowi (z hasłami)

---

## Funkcje aplikacji

### Backend API
- `POST /photos` – upload zdjęcia
- `GET /photos` – lista (dla user/admin)
- `DELETE /photos/:filename` – tylko admin
- `PUT /photos/:filename` – edycja opisu (user/admin)
- Token JWT wymagany (OAuth2)

### SPA (React)
- Rejestracja, logowanie, wylogowanie
- Upload zdjęcia
- Przegląd i usuwanie zdjęć
- Edytowanie opisu (pełne CRUD)

### SSR (Express + EJS)
- Lista zdjęć
- Logout
- Token przez standard OAuth2 flow

### B2B Client
- Autoryzacja przez Client Credentials
- Dostęp do `/photos`
- Odczyt zdjęć przez backend-to-backend
- `docker-compose logs b2b-client` powinna pokazać logi b2b ze zdjęciami wszystkimi (b2b ma rolę admin)

---

## Czyszczenie środowiska

```bash
docker-compose down
```

---

## Struktura katalogów

```
├── backend/         # Flask API + tokeny Keycloak
├── frontend/        # React SPA (Vite)
├── ssr-client/      # Express SSR klient
├── b2b-client/      # B2B klient (Node.js)
├── keycloak/        # realm-export.json
├── docker-compose.yml
```

---

## Projekt zaliczeniowy

- Docker Compose (wielomodułowość)
- Keycloak (OAuth2 Authorization Server)
- CRUD API
- SPA + SSR + B2B klient
- Realm + role + użytkownicy w pliku eksportu

