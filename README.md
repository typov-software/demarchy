# ![DEMARCHY](./static/DEMARCHY.png)

> WARNING: Demarchy is in active development and highly unstable. Use at your own risk.

Demarchy is a democratic document editor for organizations and communities.

At launch, you'll be able to join the official instance at [demarchy.app](https://demarchy.app/).

## Motivation

### North Stars

- hypothesis: high democratic participation depends on good ux
- hypothesis: decisions reached through consensus prevent and heal group division

### Values to promote

- Consensus is better than super and simple majorities
- Transparency, accountability, and participation in group decisions
- Prioritize protection of individual rights
- Empower democratic process and representation

## Development

Demarchy is built with [Firebase](https://firebase.google.com/) to provide a stable experience for as many as possible.
Because of this dependency, you'll need a valid [Firebase project](https://firebase.google.com/docs/web/setup#create-project) and [registered app](https://firebase.google.com/docs/web/setup#register-app) to develop or host Demarchy.
[Firebase offers a generous free-tier](https://firebase.google.com/pricing) that suffices for local development, but you'll need to upgrade to the Blaze Plan in order to host your own instance.

### Environment

Use the variables defined in `.env-template.env` to create a `.env` with your Firebase config and secrets.

`FB_PRIVATE_KEY` must be a base64 encoded string. For example:

```js
Buffer.from('-----BEGIN PRIVATE KEY-----\ ... \n-----END PRIVATE KEY-----\n').toString('base64');
```

### Local development

Fork or clone this repo:

```bash
git clone https://github.com/typov-software/demarchy.git
cd demarchy
```

Run [`nvm use`](https://github.com/nvm-sh/nvm) or ensure you're working with Node `18.x`.

Install dependencies:

```
npm install
npm install -g firebase-tools # if deploying
```

Start local application with emulators:

```
npm start
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

## Deployment

Navigate to Github action secrets at: `https://github.com/{username}/demarchy/settings/secrets/actions`.
Here you'll need to create a "Repository Secret" for each environment variable in `.env`. 

Ensure your Firebase instance has the experimental `webframeworks` feature enabled: `firebase experiments:enable webframeworks`.

If you've not already, run the Firebase hosting init command to add a service account secret to your Github repo: `firebase init hosting:github`. See more in the [Firebase docs](https://firebase.google.com/docs/hosting/github-integration).

You may also need to update IAM permissions for your service accounts: `https://console.cloud.google.com/iam-admin/iam?project={FB_PROJECT_ID}`. Specifically, you'll need to add the "Service Account User" role to your "Default compute service account" principal user. 

At this point, Github actions should be properly configured to deploy Demarchy via updates to the `main` branch.