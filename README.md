# LeadDashboard

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.0.1.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Authentication (Added)

- Backend now includes session-based authentication endpoints under `src/API/`:
	- `login.php` (POST: `{ email, password }`)
	- `register.php` (POST: `{ name?, email, password }`)
	- `logout.php` (POST: empty body)
	- `me.php` (GET: returns `{ authenticated, user? }`)
- All existing API endpoints (`leads.php`, `lead_columns.php`, `history.php`) require an authenticated session.
- The Angular app provides:
	- Login route: `/login`
	- Register route: `/register`
	- Guarded routes for board and lead detail.

### Database Changes

Add a `users` table. The schema has been appended to `src/leads-dashboard.sql`. Apply those changes to your MySQL database:

```sql
-- Apply only the `users` table section if you already have data
CREATE TABLE IF NOT EXISTS `users` (
	`id` int NOT NULL AUTO_INCREMENT,
	`email` varchar(255) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`name` varchar(255) DEFAULT NULL,
	`created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	UNIQUE KEY `email_unique` (`email`)
);
```

### Local Dev Setup

1. Ensure the API is reachable at `http://localhost/ICA-leaddashboard/ICA-leaddashboard/LeadDashboard/src/API/` (Laragon/Apache).
2. Start Angular dev server:

```bash
npm start
```

3. Visit the app, register a user, then login to access the board.

Notes:
- CORS is configured to allow credentials from `http://localhost:4200` and `http://localhost`.
- Angular HttpClient requests include `withCredentials: true` to send the session cookie.
