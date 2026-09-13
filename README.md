# UrbanNest

UrbanNest is a full-stack real-estate listing platform built with React, Spring Boot, and PostgreSQL. Public visitors can browse and filter approved listings, inspect property details, images, and maps, and register or log in. Authenticated users can favorite properties, publish and manage their own listings, upload a listing image, and select coordinates on an interactive map. Administrators can moderate properties and manage user accounts.

Public property APIs expose only approved listings. Owners retain access to their own pending or rejected listings, while administrators can access listings requiring moderation.

## System Overview

```text
React / Vite frontend
        |  HTTP/JSON and multipart uploads (Axios)
        v
Spring Boot REST API
        |  Spring Security and JWT bearer authentication
        v
Controller -> Service -> Repository / JPA
                              |
                              v
                         PostgreSQL
```

React is responsible for the UI, client-side state, routing, and filtering of the loaded approved property collection. Axios sends JSON and multipart requests to the backend and attaches the stored JWT to protected requests. Spring Boot exposes the REST API; Spring Security and a JWT filter authenticate requests and enforce role-based access. Services contain application rules, and Spring Data JPA/Hibernate map persistent entities to PostgreSQL. Flyway owns schema creation and evolution.

Property image files are stored on the backend filesystem; PostgreSQL stores only their URL paths. Leaflet and OpenStreetMap provide the frontend maps.

## User Roles and Capabilities

| Role | Capabilities |
| --- | --- |
| Public / unauthenticated | Register, log in, browse and filter approved properties, open approved property details, and view available images and maps. |
| `USER` | All public capabilities plus create listings, upload an image, choose map coordinates, view/edit/delete owned listings, access owned pending or rejected listings, maintain per-user favorites, and edit profile details or password. New listings enter the approval workflow as pending. |
| `ADMIN` | Access admin-only routes; list, approve, reject, edit, or delete properties; list users; change user roles; and delete users. |

Public registration always creates a `USER`. It cannot be used to request the `ADMIN` role.

## Key Features

- JWT-based registration, login, and stateless authenticated sessions
- Owner-scoped property creation, editing, and deletion
- Pending, approved, and rejected property moderation workflow
- Structured property data: listing status, property type, price, rooms, area, parking, year built, ownership, address fields, grant/permit flags, features, and coordinates
- Client-side keyword, listing-status, township, property-type, and price filtering
- Structured township matching with legacy-location fallback
- Per-user favorites persisted in browser `localStorage`
- Validated local JPEG, PNG, and WebP image uploads
- Leaflet/OpenStreetMap coordinate selection and property maps
- Admin property moderation and user management
- Property ownership verification with NRC and legal document uploads (private, admin-only access)
- English-only user interface
- Opt-in bundled sample-data import
- Versioned PostgreSQL schema management with Flyway

## Architecture

### Frontend

The frontend uses React, TypeScript, Vite, React Router, Axios, Leaflet, and React-Leaflet. It does not use an external global state-management library; React contexts manage authentication, properties, and favorites.

| Area | Responsibility |
| --- | --- |
| `src/pages/` | Route-level screens including Home, property details, Add/Edit Property, dashboard, authentication, and admin views. |
| `src/components/` | Reusable UI, navigation, notifications, admin controls, and the shared property map. |
| `src/contexts/` | Authentication/session state, loaded property state, and user-specific favorites. |
| `src/utils/api.ts` | Axios client, bearer-token interceptor, and typed API operations. |
| `src/utils/` and `src/data/` | Image URL handling, property filtering, township resolution, and township map data. |
| `src/types/` | Shared frontend data shapes for API requests and responses. |

The development client runs at `http://localhost:5173`. Its Axios client and image URL helper target the backend at `http://localhost:8080`; Vite also proxies relative `/api` requests during development.

### Backend

The backend uses Java 21, Spring Boot, Spring Web MVC, Spring Security, JWT, Spring Data JPA, Hibernate, Flyway, PostgreSQL, and Apache POI for the opt-in sample workbook import.

| Layer | Responsibility |
| --- | --- |
| Controller | Defines REST routes, accepts request data, and returns response DTOs or status responses. |
| Service | Applies authentication-aware visibility, ownership, moderation, validation, upload, and account rules. |
| Repository | Provides Spring Data JPA access to users and properties. |
| Entity | Maps the domain model and relationships to PostgreSQL tables. |
| Security/config | Validates JWTs, populates the security context, defines route authorization, serves uploads, and activates local seeders. |

The normal request path is `Controller -> Service -> Repository -> Entity/PostgreSQL`. Controllers remain thin; persistence and authorization-sensitive business rules are handled below the HTTP layer.

### Database

PostgreSQL is the system of record for accounts and properties. Hibernate is configured with `ddl-auto=validate`, so it validates the schema but does not create or update it. Flyway applies the schema before Hibernate validation.

The main tables are:

- `users`: account credentials, profile data, and role
- `properties`: listing content, approval state, ownership, structured metadata, location, image URL, and coordinates
- `property_features`: the feature collection associated with each property

Current migrations:

| Migration | Purpose |
| --- | --- |
| `V1__create_initial_schema.sql` | Initial users, properties, and feature schema. |
| `V2__expand_property_model.sql` | Expanded property metadata and structured location model. |
| `V3__backfill_sample_property_locations.sql` | Structured location backfill restricted to sample-owned properties. |
| `V4__improve_sample_property_showcase_data.sql` | Enhanced sample property showcase data. |
| `V5__create_property_posting_fees.sql` | Property posting fees table and management. |
| `V6__create_contact_messages.sql` | Contact messages table for user inquiries. |
| `V7__create_notifications.sql` | Notifications system with user-scoped notifications. |
| `V8__extend_notification_types.sql` | Extended notification types for property events. |
| `V9__add_property_submitted_notification_type.sql` | Added property submitted notification type. |
| `V10__add_verification_documents.sql` | Added NRC and ownership document paths with verification flag for property ownership verification. |

## Request / Data Flow

### Creating or editing a property

1. The user completes the Add/Edit Property form.
2. If an image was selected, the frontend first sends it as multipart data to `POST /api/uploads/properties`.
3. The backend validates and stores the file locally, then returns a URL such as `/uploads/properties/<generated-name>.jpg`.
4. The frontend submits property JSON containing the metadata, image URL, and optional latitude/longitude.
5. The JWT filter validates the bearer token and establishes the authenticated user.
6. The property controller accepts the request.
7. The service applies ownership and property workflow rules.
8. The repository persists the entity through Hibernate/JPA.
9. PostgreSQL stores the property and its feature collection.
10. The frontend receives a `PropertyResponse` and refreshes its property state.

### Reading the public catalog

```text
Home -> GET /api/properties -> approved properties
     -> client-side filter utilities -> rendered property cards
```

Opening a property detail route performs a separate property API request. Non-approved data is returned only when the authenticated requester is its owner or an administrator.

## Property Visibility and Security

- Public property lists and details are restricted to approved properties.
- Owners can retrieve their own listings, including appropriate pending or rejected entries, through authenticated flows.
- Admin property moderation routes under `/api/admin/**` require the `ADMIN` role.
- User listing, role updates, and user deletion are admin-only.
- Profile and password updates under `/api/users/me` are authenticated self-service operations.
- The frontend Axios interceptor attaches `Authorization: Bearer <token>` to protected API requests.
- Spring Security uses stateless sessions; CSRF is disabled for the bearer-token API.
- Internal error dispatches are permitted so validation and upload errors retain their original HTTP status without exposing protected application routes.

Secrets, JWT signing values, local passwords, and provisioned admin credentials must remain outside version control.

## Property Images

`POST /api/uploads/properties` accepts an authenticated multipart upload using the `file` field.

- Supported formats: JPEG, PNG, and WebP
- Maximum file size: 5 MiB
- Validation checks both the declared media type and file signature
- Default storage directory: `backend/uploads/properties/` when the backend is started from `backend/`
- Returned/public URL: `/uploads/properties/<generated-name>.<extension>`
- Database storage: URL/path only, not image bytes
- Public image route: `GET /uploads/properties/**`

The upload directory is runtime-local and ignored by Git. Images therefore do not move between developer machines through clone, pull, or push. Local filesystem storage is intentional for the current development architecture; a production deployment would normally use durable object storage.

## Maps

- The frontend uses Leaflet and OpenStreetMap; no map API key is required.
- Add/Edit Property allows the user to set coordinates by clicking the map or dragging its marker.
- Latitude and longitude are stored with the property and restored when editing.
- Property Details renders saved coordinates on a read-only map.
- Township coordinates are approximate centering hints only; they do not replace a precise saved marker.
- No automatic address geocoding is implemented.
- OpenStreetMap tiles require an internet connection in the browser.

## Filtering and Township Handling

Home filtering is client-side over the loaded approved property collection. Filter state is synchronized with URL query parameters so it survives reloads and browser back/forward navigation. Active filters combine with AND semantics.

Available dimensions include:

- Buy / Rent
- Township
- Property type
- Minimum and maximum price
- Keyword

Township matching prefers the structured `township` field. Older rows can still resolve from the legacy `location` value. Specific aliases are checked before generic names, so Dagon, North Dagon, South Dagon, East Dagon, and Dagon Seikkan remain distinct.

## Sample Data

The repository includes `backend/sample-data/cleaned_house_data.xlsx`. Importing it is optional and occurs only when both the `local` and `seed` profiles are active.

- The importer creates or reuses the `_sample_data` owner.
- The current workbook produces 96 sample properties.
- Import is idempotent: it skips importing when that owner already has properties.
- The workbook is opened read-only and is not modified.
- Confidently resolved township, city, and state/region fields are populated during import.
- The original legacy `location` value is preserved.
- V3 performs the equivalent structured-location backfill for existing `_sample_data` properties.

After import, ordinary application reads use PostgreSQL; the workbook is not queried to serve property requests.

## Repository Structure

```text
real-estate-project/
|-- backend/
|   |-- src/main/java/com/urbannest/backend/
|   |   |-- config/
|   |   |-- controller/
|   |   |-- dto/
|   |   |-- entity/
|   |   |-- repository/
|   |   |-- security/
|   |   `-- service/
|   |-- src/main/resources/
|   |   |-- db/migration/
|   |   `-- application.properties
|   |-- src/test/
|   |-- sample-data/
|   |-- uploads/                 # runtime-local, ignored
|   |-- build.gradle.kts
|   |-- gradlew
|   `-- gradlew.bat
|-- frontend/
|   |-- src/
|   |   |-- assets/
|   |   |-- components/
|   |   |-- contexts/
|   |   |-- data/
|   |   |-- pages/
|   |   |-- types/
|   |   `-- utils/
|   |-- package.json
|   `-- vite.config.ts
`-- README.md
```

## Local Development Setup

### Prerequisites

- Git
- Java 21 JDK
- PostgreSQL
- A current Node.js LTS release and npm

The Gradle wrapper is included; a separate Gradle installation is not required.

### 1. Clone the repository

```powershell
git clone <repository-url>
cd real-estate-project
```

### 2. Create the PostgreSQL database

Create an empty local database. Tables should not be created manually.

```sql
CREATE DATABASE urbannest;
```

### 3. Create the local backend configuration

Create this file:

```text
backend/src/main/resources/application-local.properties
```

Use local values and never commit the file:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/urbannest
spring.datasource.username=postgres
spring.datasource.password=YOUR_PASSWORD
```

The file is ignored by Git so machine-specific database credentials remain outside the repository. The committed base configuration activates the `local` profile by default; `SPRING_PROFILES_ACTIVE` can explicitly select or extend it for the optional seed operations below.

### 4. Database migrations

Do not manually create the application tables. On backend startup, Flyway applies V1, V2, and V3 in order. Hibernate then validates that the resulting PostgreSQL schema matches the entity model. A migration or validation failure stops startup rather than silently changing the schema.

### 5. Optional sample-property seed

From `backend/`, activate both required profiles and start the application:

```powershell
$env:SPRING_PROFILES_ACTIVE = "local,seed"
.\gradlew.bat bootRun
```

This imports the bundled 96-property workbook once under `_sample_data`. It is optional and idempotent. Stop the backend after the import/startup check, then clear the override to return to ordinary local startup:

```powershell
Remove-Item Env:SPRING_PROFILES_ACTIVE
```

To use a different workbook, set `SAMPLE_PROPERTY_DATA_PATH` before starting with the seed profile.

### 6. Optional local admin provisioning

Set temporary environment variables and activate the explicit admin seed profile:

```powershell
$env:APP_ADMIN_USERNAME = "local-admin"
$env:APP_ADMIN_EMAIL = "local-admin@example.test"
$env:APP_ADMIN_PASSWORD = "REPLACE_WITH_A_LOCAL_PASSWORD"
$env:SPRING_PROFILES_ACTIVE = "local,admin-seed"
.\gradlew.bat bootRun
```

The seeder BCrypt-hashes the password and creates or updates the matching local account as `ADMIN`. It is idempotent and is inactive during normal startup. Public registration still creates only `USER` accounts.

After provisioning and stopping the backend, remove the temporary variables:

```powershell
Remove-Item Env:APP_ADMIN_USERNAME
Remove-Item Env:APP_ADMIN_EMAIL
Remove-Item Env:APP_ADMIN_PASSWORD
Remove-Item Env:SPRING_PROFILES_ACTIVE
```

Do not place real admin credentials in committed properties files or shell scripts.

### 7. Start the backend

```powershell
cd backend
.\gradlew.bat bootRun
```

With `application-local.properties` present, the API starts at `http://localhost:8080`.

### 8. Start the frontend

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The backend must remain available at `http://localhost:8080`.

### 9. Uploaded image storage

The backend creates `backend/uploads/properties/` automatically when started from `backend/`. The directory is ignored and its files are not shared through Git.

To use another location, set `APP_UPLOAD_DIR` before starting the backend:

```powershell
$env:APP_UPLOAD_DIR = "C:\path\to\urbannest-uploads"
.\gradlew.bat bootRun
```

The configured directory is the upload root; property images are stored in its `properties/` child directory.

## Property Ownership Verification

When a normal user submits a new property, they must provide two verification documents:

1. **NRC (National Registration Card)** - A clear image of the property owner's NRC (JPEG/PNG, max 10 MB)
2. **Proof of Ownership** - A legal document proving ownership (grant, permit, title deed, ownership certificate, or other valid document; JPEG/PNG/PDF, max 10 MB)

These documents are:
- **Private**: Stored in a separate private directory (`uploads/verification/<user-id>/`) with UUID filenames
- **Not publicly accessible**: No static resource mapping exposes them
- **Admin-only access**: Only administrators can view/download via `GET /api/admin/properties/{id}/verification/nrc` and `GET /api/admin/properties/{id}/verification/ownership`
- **Manual review only**: The platform does not perform OCR or automatic government verification; administrators manually review documents before approving a property
- **Required for approval**: Properties with `verification_required = true` cannot be approved unless both documents are present

Legacy/sample properties have `verification_required = false` and can be approved without documents.

### 10. First-run checklist

- PostgreSQL is running.
- The `urbannest` database exists.
- `application-local.properties` contains valid local datasource credentials.
- The backend starts without Flyway or Hibernate validation errors.
- The frontend starts and can reach ports 5173 and 8080.
- Run `local,seed` only if bundled sample properties are wanted.
- Run `local,admin-seed` only if a local administrator is needed.

## Development Notes / Production Considerations

- Local image storage is machine-specific and is not suitable for horizontally scaled or ephemeral production instances without shared durable storage.
- OpenStreetMap tile rendering depends on browser network access.
- Client-side filtering is appropriate for the current dataset size; it does not provide server-side pagination or large-catalog search.
- Favorites are browser-local but isolated by authenticated user ID; they are not stored in PostgreSQL.
- No payment system is implemented.
- Ownership verification is manual admin review only; the platform does not perform OCR or automatic government verification.
- Verification documents are stored privately and never exposed publicly.
- Keep datasource credentials, JWT secrets, admin seed values, and runtime uploads outside Git.

## Verification

Run the backend tests and frontend checks from their respective directories:

```powershell
cd backend
.\gradlew.bat test

cd ..\frontend
npm run build
npm run lint

cd ..
git diff --check
```
