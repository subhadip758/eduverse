# Eduverse

Eduverse is a modern, interactive educational platform designed to enhance the learning experience. This application provides a comprehensive suite of tools for managing courses, tracking attendance, viewing results, and facilitating communication between students and educators.

## 🚀 Features

- **Dashboard**: A central hub for an overview of your educational activities.
- **Courses**: Browse, enroll, and manage active courses.
- **Chat**: Integrated communication platform for students and instructors.
- **Attendance**: Real-time attendance tracking and history.
- **Results**: Secure access to grades and academic performance.
- **AI Integration**: Powered by intelligent features to assist learning.

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Backend Services**: Firebase (Authentication & Database), Spring Boot (Java)
- **Styling**: Modern CSS/Tailwind (Project dependent)

## 💻 Getting Started

### Prerequisites

Ensure you have the following installed on your local machine:
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation & Setup

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <your-repository-url>
   cd eduverse
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```
   *or if using yarn:*
   ```bash
   yarn install
   ```

3. **Environment Setup**:
   Create a `.env.local` file in the root directory based on `.env.example`. Make sure to set any required API keys, for example:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open the App**:
   Navigate to `http://localhost:5173` (or the port specified by Vite) in your browser to see the application running.

## 📦 Building for Production

To create a production-ready build, run:

```bash
npm run build
```

This will generate a `dist` folder containing the compiled assets, ready to be deployed to your preferred hosting provider.

## 🤝 Contributing

Contributions to Eduverse are always welcome! Feel free to open issues or submit pull requests.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
