# Bandada Tutorial

This is an example of project using Bandada and Semaphore.

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Run Locally

### Clone the Repository

```bash
git clone https://github.com/vplasencia/bandada-semaphore-demo.git
```

### Install dependencies

```bash
yarn
```

### Add environment variables

Copy the `env.development.local.example` file content in a `.env.development.local` file:

```bash
cp env.development.local.example .env.development.local
```

and add your environment variables: group id and group api key (if the group is not a credential group).

### Run de development server

```bash
yarn dev
```

Open [http://localhost:3003](http://localhost:3000) with your browser to see the result.

### Code quality and formatting

Run [ESLint](https://eslint.org/) to analyze the code and catch bugs:

```bash
yarn lint
```

Run [Prettier](https://prettier.io/) to check formatting rules:

```bash
yarn prettier
```

Or to automatically format the code:

```bash
yarn prettier:write
```

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.
