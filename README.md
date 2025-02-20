# Design Extensions Integration

## Overview

The **Design Extensions Integration** enhances design and layout control via Uniform UI extensions, allowing you to manage the appearance of your components seamlessly.

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js**: `>= 20`
- **npm**: `>= 10`
- **Vercel KV Storage**: Required for storing key-value data
  - [Marketplace Redis (KV) integrations](https://vercel.com/marketplace?category=storage&search=redis)
  - [Upstash](https://vercel.com/marketplace/upstash)

## Installation & Setup

To set up the project locally, follow these steps:

### 1. Clone the Repository

```sh
git clone https://github.com/your-repo/design-extensions.git
cd design-extensions
```

### 2. Install Dependencies

```sh
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory and set up the necessary environment variables based on `.env.example`:

```dotenv
KV_URL=<your_kv_url>
KV_REST_API_URL=<your_rest_api_url>
KV_REST_API_TOKEN=<your_rest_api_token>
KV_REST_API_READ_ONLY_TOKEN=<your_read_only_token>
```

These credentials are required to interact with **Vercel KV Storage**.

### 4. Start the Application

#### Development Mode:

```sh
npm run dev
```

Access the application at [`http://localhost:4030`](http://localhost:4030).

#### Production Mode:

```sh
npm run build
npm start
```

The production server will be available at [`http://localhost:4030`](http://localhost:4030).

## Available Scripts

- `npm run dev` - Starts the development server.
- `npm run build` - Builds the integration for production.
- `npm run start` - Runs the production server.
- `npm run lint` - Lints the project for code quality.
- `npm run lint:fix` - Auto-fixes lint issues.
- `npm run format` - Formats the code using **Prettier**.

## Usage

To install and use the **Design Extensions Integration** within **Uniform**, follow these steps:

### Installing the Integration

1. Navigate to [Uniform.app](https://uniform.app/) and open your **Team**.
2. Go to the **Settings** tab and select **Custom Integrations**.
3. Click **Add Integration** and provide the required **[manifest](./mesh-manifest.local.json)**.
4. Once added, the **Custom Integration** will be available for all projects under the selected team.

   ![Step 1](https://res.cloudinary.com/uniform-demos/image/upload/csk-v-next/doc/design-extensions-step-1.png)

### Deploying the Integration

1. Run the integration locally or deploy it to a hosting provider.
2. If deploying, update the integration manifest to replace `http://localhost:4030` with the **deployed domain**.

### Using the Integration

1. Open the **Canvas project** settings tab and navigate to **Integrations**.
2. Select the newly added **Custom Integration**.

   ![Step 2](https://res.cloudinary.com/uniform-demos/image/upload/csk-v-next/doc/design-extensions-step-2.png)

3. In the **Integration Settings**, configure:

   - **Color**
   - **Size/Dimension**
   - **Font**
   - **Border**

   You can also import **Design Tokens** from **Figma** for seamless configuration.

   ![Step 3](https://res.cloudinary.com/uniform-demos/image/upload/csk-v-next/doc/design-extensions-step-3.png)

4. You will now have access to **custom parameters** from the **Design Extensions Integration**.

   ![Step 4](https://res.cloudinary.com/uniform-demos/image/upload/csk-v-next/doc/design-extensions-step-4.png)

## Component Starter Kit & Additional Resources

For a quick start with a pre-configured application, use the **Component Starter Kit**, which is already set up for **Design Extensions Integration**:

- GitHub repository: [Component Starter Kit](https://github.com/uniformdev/component-starter-kit-next-approuter)
- Install via CLI:

  ```sh
  npx @uniformdev/cli@latest new
  ```

  Follow the interactive steps to set up the starter kit.

## Recommended Packages

Enhance your development workflow with these essential packages:

- **[@uniformdev/design-extensions-tools](https://www.npmjs.com/package/@uniformdev/design-extensions-tools)**
  - Utilities for importing/exporting design tokens.
- **[@uniformdev/csk-components](https://www.npmjs.com/package/@uniformdev/csk-components)**
  - Ready-to-use components compatible with custom design parameters.
  - Use the `extract` command to inspect the implementation of all **Canvas components**.

## Additional Resources

- **[Uniform Component Catalog](https://components.uniform.app/components)**
  - Explore components, get usage instructions, and experiment with examples.
- **[Uniform Documentation](https://docs.uniform.app/docs)**
  - Find comprehensive guidance on integrating and customizing your application.

## Technologies Used

This integration is built using:

- **Next.js** (Framework)
- **React** (UI Library)
- **Tailwind CSS** (Styling)
- **Vercel KV Storage** (Data Storage)
- **ESLint & Prettier** (Code Quality & Formatting)

## Conclusion

The **Design Extensions Integration** enhances design flexibility and control within **Uniform**, providing an optimized and streamlined development experience.
