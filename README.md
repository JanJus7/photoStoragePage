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
```bash
VITE_KEYCLOAK_URL=http://localhost:8080
VITE_API_URL=http://localhost:5000/api/
```

Następnie:


```bash
docker-compose up --build
```

**Pierwsze uruchomienie** zaimportuje gotowy realm `carXpage` z konfiguracją Keycloak. Dopuki w aplikacji SPA nie doda się żadnych zdjęć do bazy danych, b2b będzie wypisywał pustą tablicę. Po dodaniu zdjęć, trzeba zrestartować kontener b2b żeby pokazał że te zdjęcia faktycznie tam są. 

## Uruchamianie SSR client

```bash
cd ssr-client
npm install
npm start
```

SSR client nie jest odpalany jak reszta w kontenerze. Było to możliwe, ale po wielu próbach okazało się, że Keycloak redirectuje po loginie na adres niedostępny dla przeglądarki. Wersja kontenerowa wymagałaby NGINX-proxy lub host.docker.internal, co nie działa stabilnie na wszystkich systemach. Aby zachować pełną zgodność z OAuth2 i działający SSR flow, uruchomiłem SSR poza Dockerem — wszystko inne jest konteneryzowane zgodnie z wymaganiami.


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

Można to sprawdzić pod http://localhost:8080.
login: admin
hasło: admin
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

lub

```bash
docker-compose down -v
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

