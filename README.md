# 📚 StudyDeck – Interactive Flashcard & Quiz Application

StudyDeck is an interactive web-based learning application designed to make studying more engaging and effective. Built using **TypeScript, HTML, CSS, and Vite**, it allows users to explore study decks, learn through flashcards, test their knowledge with timed quizzes, and track their learning progress.

The application provides a simple and responsive interface with features such as search and category filtering, study streak tracking, score management, and dark/light theme support.

## 🚀 Features

- **📖 Flashcard Learning:** Study topics using interactive flashcards with question-and-answer functionality.
- **🧠 Timed Quizzes:** Test knowledge through multiple-choice questions with a 15-second timer.
- **📊 Progress Tracking:** Track and save the best quiz score for each study deck.
- **🔥 Study Streaks:** Monitor consecutive days of learning to encourage consistency.
- **🔍 Search & Filtering:** Quickly find study decks by name or category.
- **🌙 Dark/Light Mode:** Switch between themes based on user preference.
- **💾 Local Storage:** Save scores, study streaks, theme preferences, and recently opened decks.
- **🔄 Session Recovery:** Restore unfinished quiz sessions after refreshing the page.
- **📱 Responsive Design:** Provides a user-friendly experience across different screen sizes.

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Application structure |
| CSS3 | Styling and responsive design |
| TypeScript | Application logic and type safety |
| Vite | Development server and build tool |
| JSON Server | Mock REST API for study decks |
| LocalStorage | Persistent user progress and preferences |
| SessionStorage | Temporary quiz session management |

## 📁 Project Structure

```text
studydeck/
│
├── public/               # Static assets and icons
│
├── src/
│   ├── api/              # API requests and data fetching
│   ├── state/            # Application state management
│   ├── storage/          # Browser storage operations
│   ├── ui/               # User interface components
│   ├── utils/            # Reusable helper functions
│   │
│   ├── main.ts           # Main application entry point
│   ├── types.ts          # TypeScript interfaces and types
│   └── style.css         # Application styling
│
├── db.json               # Study decks and question data
├── index.html            # HTML entry point
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md             # Project documentation
```

## ⚙️ Installation and Setup

### Prerequisites

Make sure you have installed:

- Node.js
- npm

### 1. Clone the Repository

```bash
git clone <repository-url>
cd studydeck
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Mock Backend

```bash
npm run api
```

JSON Server runs at:

`http://localhost:3001`

### 4. Start the Development Server

Open another terminal and run:

```bash
npm run dev
```

Open the local URL displayed by Vite in your browser.

## 🔄 Application Workflow

1. When the application starts, it fetches available study decks from the JSON Server API.
2. Users can browse, search, and filter decks by category.
3. After selecting a deck, users can choose between Study Mode and Quiz Mode.
4. In Study Mode, users learn by flipping flashcards to reveal answers.
5. In Quiz Mode, users answer timed multiple-choice questions.
6. After completing a quiz, the application calculates the score and updates the user's best performance.
7. Study streaks, quiz scores, and theme preferences are stored locally in the browser.
8. Users can return to the deck browser to continue learning.

## 🏗️ Project Architecture

The application follows a modular architecture to separate responsibilities and improve maintainability.

- **API Layer:** Fetches and validates deck data from JSON Server.
- **State Layer:** Manages application loading, success, and error states.
- **UI Layer:** Handles deck browsing, flashcard interactions, quizzes, and navigation.
- **Storage Layer:** Manages quiz scores, study streaks, themes, and session recovery.
- **Utility Layer:** Provides reusable functions for filtering, formatting, and date calculations.

The `main.ts` file acts as the central controller, connecting the different modules and managing the overall application workflow.

## 💡 Key Concepts Implemented

- Modular programming
- TypeScript interfaces and type safety
- Asynchronous API calls
- REST API integration
- DOM manipulation
- Event handling
- Error handling
- Browser storage management
- Application state management
- Object-oriented concepts such as inheritance and abstraction

## 🎯 Project Objective

The main objective of StudyDeck is to provide a simple and efficient digital learning platform that helps users revise topics, evaluate their understanding, and maintain consistent study habits.

The project also demonstrates practical frontend development concepts, including modular TypeScript architecture, API integration, interactive user interfaces, and persistent browser storage.

## 🔮 Future Enhancements

- User authentication and personalized accounts
- Database integration for cloud-based progress tracking
- Custom flashcard and deck creation
- Performance analytics and learning statistics
- Spaced repetition for improved memorization
- Leaderboards and achievement badges

## 📄 License

This project is intended for educational and learning purposes.
