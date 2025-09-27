# MediChat - Your Personal AI Medical Assistant

MediChat is an intelligent, conversational AI chatbot designed to provide preliminary medical information and guidance. It allows users to ask health-related questions, describe their symptoms for a basic risk assessment, and securely keeps a history of their conversations.

## Key Features

- **Conversational AI**: Engage in a natural conversation to get information about medical topics.
- **Symptom Analysis**: Describe your symptoms and receive a preliminary, AI-generated risk assessment.
- **User Authentication**: Secure sign-up and sign-in functionality to protect user data.
- **Persistent Chat History**: All conversations are saved and linked to your account, so you can review them at any time.
- **Profile Management**: View and update your user profile details.
- **Privacy Focused**: User data and chat histories are stored securely.

**Disclaimer**: MediChat is a prototype and not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **AI/Generative**: [Genkit](https://firebase.google.com/docs/genkit)
- **Authentication**: [Firebase Authentication](https://firebase.google.com/docs/auth)
- **Database**: [SQLite](https://www.sqlite.org/index.html) (via `better-sqlite3`)

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or later recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-folder>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**

    You will need to connect the project to a Firebase project to handle authentication.

    - Create a new project in the [Firebase Console](https://console.firebase.google.com/).
    - Go to your Project settings and create a new Web App.
    - Copy the `firebaseConfig` object values.
    - Create a `.env` file in the root of the project and add the following keys with your Firebase project's credentials:

    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_web_app_id
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

    Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

## Available Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Creates a production build of the application.
- `npm run start`: Starts the production server.
- `npm run lint`: Lints the codebase for errors.

## Local Avatar Uploads

This project includes a local avatar upload endpoint (`/api/avatar`) that stores resized avatars in `public/uploads/avatars/{uid}.jpg`. This is intended for development and testing so you don't need Firebase Storage billing to allow users to upload profile images. For production, you should replace this with a proper object storage solution (Firebase Storage, S3, etc.) and secure the uploads.
