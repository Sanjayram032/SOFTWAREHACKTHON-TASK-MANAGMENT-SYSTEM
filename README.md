# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

## Google Sign-In Setup

This project includes a Google Sign-In button on the login page. To enable it you must create an OAuth 2.0 Client ID in Google Cloud Console and set the client ID in your environment.

1. Create OAuth credentials
	- Go to the [Google Cloud Console -> Credentials](https://console.cloud.google.com/apis/credentials)
	- Create an OAuth 2.0 Client ID (Application type: Web application)
	- Add an Authorized JavaScript origin for your dev site, e.g. `http://localhost:5173`
	- Copy the Client ID (looks like `xxxx.apps.googleusercontent.com`)

2. Configure environment variables
	- Copy `.env.example` to `.env` in the project root and fill the values:

```
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
```

	- `VITE_GOOGLE_CLIENT_ID` is required for the frontend to render the Google button.
	- `GOOGLE_CLIENT_ID` is optional but recommended: the backend (`server.js` / `server-resilient.js`) uses it to validate the token audience.

3. Restart servers
```
# start backend (resilient server)
npm run server

# start frontend (vite)
npm run dev

# or both
npm run dev:all
```

4. Test in browser
	- Open the app (default `http://localhost:5173`) and go to the login page.
	- The Google Sign-In button will appear if `VITE_GOOGLE_CLIENT_ID` is set.
	- Clicking it will open a popup and on success the frontend posts the id token to `/api/auth/google`.

Troubleshooting
- If the button shows "Google sign-in is not configured yet", verify `.env` is present and the dev server was restarted.
- If the backend rejects the token, set `GOOGLE_CLIENT_ID` to the same client id from Google Console.
- Share browser console logs or server output if you need further help integrating SSO.
