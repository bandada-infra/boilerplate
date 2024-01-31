<p align="center">
    <h1 align="center">
      Bandada-Semaphore Feedback App
    </h1>
</p>

| Create your unique identity, join a group and provide your feedback anonymously. |
| -------------------------------------------------------------------------------- |

This application shows [Bandada](https://github.com/privacy-scaling-explorations/bandada) usage with [Semaphore](https://github.com/semaphore-protocol/semaphore) in order to signal anonymously inside a Semaphore-compatible off-chain groups. You will be able to access one group without any restriction (_manual_) and the other only if you have a minimum required number of followers in your GitHub account. You can remove the association between your GitHub account and the Bandada application at any time, as indicated [here](https://docs.github.com/en/apps/oauth-apps/maintaining-oauth-apps/deleting-an-oauth-app).

This project was created using [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) and is based on [Next.js](https://nextjs.org/), a framework for building React applications.

To learn more about Bandada and different types of groups, please visit the [repository](https://github.com/privacy-scaling-explorations/bandada) and [documentation](https://pse-team.notion.site/Bandada-82d0d9d3c6b64b7bb2a09d4c7647c083?pvs=4). Also, you can learn more about the differences between Semaphore and Bandada [here](https://pse-team.notion.site/pse-team/Bandada-vs-Semaphore-00d4bb92c9684bc0b1340301fc594dc9).

## ⚙️ Live Demo

The Feedback Application is already deployed and configured with a manual off-chain group and a credential off-chain group.

You can begin interacting with both immediately without any additional configuration. Alternatively, you can watch a step-by-step walkthrough of how to use each application.

- Manual off-chain group ([demo](https://bandada-semaphore-demo.vercel.app/), [video](https://youtu.be/ji6E5ES8JcI))
- Credential off-chain group ([demo](https://credential-bandada-semaphore.vercel.app/), [video](https://youtu.be/K_rAzjDPYyI))

## :classical_building: Architecture

![Bandada-Semaphore Off-chain App Architecture](https://github.com/vplasencia/bandada-semaphore-demo/assets/52170174/b8d43564-01b3-4b7c-ae56-6efb1c5a8773)

## Use manual off-chain group locally

**Please make sure you are on the `main` branch.**

- [NodeJS](https://nodejs.org/en) >= v18.17.0
- A [supabase](https://supabase.com/) free tier project.
- A local copy of [Bandada](https://github.com/privacy-scaling-explorations/bandada)

Clone the Bandada repository and follow the [README](https://github.com/privacy-scaling-explorations/bandada/blob/main/README.md) to run it locally and create your first manual off-chain group:

```bash
git clone https://github.com/privacy-scaling-explorations/bandada.git
```

To get started, create a [Supabase account](https://supabase.com/dashboard/sign-up) and a free-tier project with basic configuration.

Once your project is ready, access the `Table Editor` from your project dashboard (you can use the [Supabase CLI](https://supabase.com/docs/guides/cli/local-development) if you prefer) and create the following tables with the columns as shown in the image:

- `feedback`, which will store all feedback (= signals) sent from users (= identities).
- Store all nullifier hashes in the `nullifier_hash` table to prevent double signaling. Refer to the [Semaphore documentation](https://docs.semaphore.pse.dev/glossary#nullifier) for more information.
- Store all Semaphore group roots in the `root_history` table to fix the [Merkle Tree](https://github.com/semaphore-protocol/semaphore/issues/98) (= [Semaphore groups](https://github.com/semaphore-protocol/semaphore/issues/98)) roots expiration issue. Refer to the [conversation](https://github.com/semaphore-protocol/semaphore/issues/98) on GitHub for more information.

![Tables schema](https://github.com/vplasencia/bandada-semaphore-demo/assets/20580910/e6c4362f-8f50-4ed2-87a1-a624a9b1052c)

## 🛠 Installation

Clone this repository running the following command in your terminal:

```bash
git clone https://github.com/vplasencia/bandada-semaphore-demo.git
```

and install the dependencies:

```bash
cd bandada-semaphore-demo && yarn
```

## 🔧 Configuration

Copy the environment variables for the development environment, run this command:

```bash
cp .env.development.local.example .env.development.local
```

```bash
# These can be retrieved from the Bandada dashboard (e.g., https://<dashboard_url>/groups/off-chain/<group_id>).
NEXT_PUBLIC_BANDADA_GROUP_ID=<bandada-group-id>
NEXT_PUBLIC_BANDADA_GROUP_API_KEY=<bandada-group-api-key>
# These can be retrieved in the Supabase dashboard (Settings -> API -> URL / Project API keys).
NEXT_PUBLIC_SUPABASE_API_URL=<supabase-api-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
```

## 📜 Usage

To start the applications in a development environment, run the following command:

```bash
yarn dev
```

The Feedback and other apps will be deployed at the following URLs (without any changes to the default configurations):

- Bandada API: http://localhost:3000
- Bandada Dashboard: http://localhost:3001
- Feedback App: http://localhost:3002

## 👨‍💻 Contributing

### Code quality and formatting

Run [ESLint](https://eslint.org/) to analyze the code and catch bugs:

```bash
yarn lint
```

Run [Prettier](https://prettier.io/) to check formatting rules:

```bash
yarn prettier
```

or to format the code automatically:

```bash
yarn prettier:write
```
