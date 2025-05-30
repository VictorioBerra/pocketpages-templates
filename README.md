<!-- Centered logo at the top -->
<p align="center">
  <img src="pb_hooks/pages/assets/images/logo.png" alt="Logo" width="200" />
</p>

# Pocketpages Template

This template creates a UI around all of Pocketbases password auth capabilities using [Pocketpages](https://pocketpages.dev/).

- ✅ Register
- ✅ Verify Email
- ✅ Login
- ✅ Change PW
- ✅ Change Email
- ✅ Logout
- ✅ Forgot PW

Additionally, this template comes with the following:

- [Tailwind CSS](http://tailwindcss.com/docs/)
- [Daisy UI](https://daisyui.com/)
- [Alpine JS](https://alpinejs.dev/)
- Docker and Docker Compose files
- [EJS linter](https://github.com/RyanZim/EJS-Lint)
- Form data validation with [Ajv](https://ajv.js.org/).

## Tests

This template comes with [Playwright](https://playwright.dev/) tests which show you how to integration test your pocketbase app E2E. Including actual email sending and retreval from [MailHog](https://github.com/mailhog/MailHog).

## Validation

This template performs 3-levels of validation, and displays the validation to the user as both a summary and field-level errors under your form inputs.

- **Client-side** validation support via [DaisyUI error display](https://daisyui.com/components/validator/).
- **Pocketpages** errors. Using [Ajv](https://ajv.js.org/), you can validate your forms and display a summary and errors under your inputs.
- **Pocketbase** validation support. Validation errors from Pocketbase SDK calls are smartly shown to the user, and on the offending field.

## Getting Started

Clone this repo, or open in a Codepsace.

- Download latest Pocketbase (https://github.com/pocketbase/pocketbase/releases)
- `npm i` and `npm run dev` 👉 http://127.0.0.1:8090

## Docker

- `docker compose up --build`

## Configuration

The following environment variables are supported:

- `POCKETPAGESJSSDK_DEBUG`
- `POCKETPAGESJS_DEBUG`

## TODO

- Deployment Doc
- CORS?
- CSRF Headers?
- Antiforgery Token?