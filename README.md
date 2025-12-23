# Niyo HRMS Frontend

A modern, responsive Human Resource Management System (HRMS) frontend built to streamline employee management, leave requests, and administrative tasks.

## 🚀 Key Features

*   **Authentication**: Secure login system with access control for different user roles.
*   **Employee Management**: comprehensive dashboard to view and manage employee profiles and details.
*   **Leave Management**: Efficient system for employees to apply for leaves and for admins to approve/reject them.
*   **Real-time Updates**: Integrated with Socket.io for real-time notifications and updates.
*   **Responsive Design**: Fully responsive UI tailored for desktops, tablets, and mobile devices using Tailwind CSS.
*   **Form Validation**: Robust form handling and validation using React Hook Form and Zod.

## 🛠️ Tech Stack

This project is built using the following technologies:

*   **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) & [Zustand](https://github.com/pmndrs/zustand)
*   **Form Handling**: [React Hook Form](https://react-hook-form.com/)
*   **Validation**: [Zod](https://zod.dev/)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Utilities**: `date-fns`, `clsx`, `tailwind-merge`

## 📂 Project Structure

A brief overview of the project's structure:

```
src/
├── app/              # Next.js App Router pages and layouts
│   ├── (auth)/       # Authentication related routes
│   ├── employee/     # Employee management routes
│   └── leaves/       # Leave management routes
├── components/       # Reusable UI components
├── constants/        # App-wide constants
├── lib/              # Utility libraries and configurations
├── server/           # Server-side logic (if any)
├── store/            # Redux store slice definitions
└── types/            # TypeScript type definitions
```

## 🏁 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

Ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (Latest LTS version recommended)
*   npm, yarn, pnpm, or bun

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd niyo-hrms-frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  Set up environment variables:
    Create a `.env.local` file in the root directory and add necessary environment variables (refer to `.env.example` if available).

### Running the Development Server

Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 📜 Scripts

*   `dev`: Runs the app in development mode with Turbopack.
*   `build`: Builds the app for production.
*   `start`: Starts the production server.
*   `lint`: Runs ESLint to check for code quality issues.

## 📄 License

[MIT](LICENSE)
# niyo-hrms
