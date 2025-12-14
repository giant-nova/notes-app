# AI Notes App

A modern, full-stack note-taking application powered by AI. This app goes beyond simple text storage by using Natural Language Processing (NLP) to understand the *meaning* of your notes, allowing for semantic search (e.g., searching for "breakfast" finds notes about "eggs and milk").

## Features

* **Smart AI Search:** Search your notes using natural language. The app uses Hugging Face embeddings to find relevant notes based on meaning, not just keyword matching.
* **Modern UI/UX:** A clean, responsive interface built with React, featuring smooth animations, glass-morphism effects, and intuitive interactions.
* **Secure Authentication:** User registration and login functionality to keep data private.
* **Rich Note Management:** Create, read, update, and delete (CRUD) notes with a distraction-free editor.
* **Instant Feedback:** Real-time toast notifications and beautiful confirmation modals (SweetAlert2) for actions like deletion.

## Tech Stack

**Frontend:**
* React.js (Vite)
* CSS3 (Custom Animations & Variables)
* Axios (API Communication)
* React Router DOM (Navigation)
* SweetAlert2 & React Hot Toast (UI Feedback)

**Backend:**
* Java 21
* Spring Boot 3.4.0
* Spring Data JPA (PostgreSQL)
* Spring Security
* Spring WebFlux (For AI API integration)

**AI & Database:**
* **Database:** PostgreSQL
* **AI Model:** Hugging Face Inference API (`sentence-transformers/all-MiniLM-L6-v2`)

---

## Getting Started

Follow these instructions to run the project locally.

### Prerequisites

Ensure you have the following installed:
* **Java 21** (JDK)
* **Node.js** (v16 or higher)
* **PostgreSQL**
* **Git**

---

### 1. Database Setup

1.  Open your PostgreSQL tool (pgAdmin or terminal).
2.  Create a new database named `notes_db` (or whatever you prefer, just match it in `application.properties`).

```sql
CREATE DATABASE notes_db;
```

### 2. Backend Setup (Spring Boot)
1. Navigate to the backend folder:

    ```sh
      cd backend 
   ```

2. Configure Environment Variables: Create a file named .env in the backend/ root directory (same level as pom.xml). Add your Hugging Face API Token (Get one for free at huggingface.co/settings/tokens):

    ***Properties***
    ```
    backend/.env
    HUGGINGFACE_API_KEY=hf_YourActualTokenHere
    ```
3. Update Database Config (Optional): If your database password isn't standard, check src/main/resources/application.properties and ensure the database credentials match your local PostgreSQL setup.

4. Run the Application: You can run it using your IDE (IntelliJ/Eclipse) or the terminal:
    
    ```sh
      ./mvnw spring-boot:run
   ```
    
    The backend should start on http://localhost:8080. On the first run, it might take a moment to "initialize the AI brain" and generate embeddings for existing notes.

### Frontend Setup (React)
1. Open a new terminal and navigate to the frontend folder:

    ```sh
      cd frontend
   ```
2. Install Dependencies:

    ```sh
      npm install
   ```

3. Run the Development Server:

    ```sh
      npm run dev
   ```
4. Access the App: Open your browser and go to the URL shown in the terminal (usually http://localhost:5173).

### How to Use AI Search
1. Create Notes: Add a few notes with distinct topics (e.g., one about "Grocery list: Milk, Bread", another about "Project ideas: React app"). 
2. Search: Use the search bar in the dashboard.
3. Test Semantic Capabilities:
   * Search for "Breakfast food" -> It should find the "Grocery list" note (even if the word 'breakfast' isn't there!). 
   * Search for "Coding tasks" -> It should find the "Project ideas" note.

### Project Structure
```
├── backend/               # Spring Boot Application
│  │   └── src/main/       # Java Source Code
│  │     ├── java/
│  │     │     └── com/notes/web/app/
│  │     │         ├── config/
│  │     │         ├── controller/
│  │     │         ├── dto/
│  │     │         ├── entity/
│  │     │         ├── exception/
│  │     │         ├── repository/
│  │     │         ├── service/
│  │     └── resources/    # Config files (application.properties) 
│  │
│  ├── .env                # API Keys (Not committed to Git)
│  ├── Dockerfile
│  └── pom.xml            
│
├── frontend/              # React Application
│   ├── src/
│   │    ├── api/          # axios configuration
│   │    ├── components/   # Reusable UI components (AuthModal, etc.)
│   │    ├── pages/        # Main pages (Dashboard, Landing)
│   │    ├── App.css       # Global styles and animations
│   │    ├── App.jsx       # Router
│   │    └── main.jsx      # Entry point
│   │
│   ├── .env
│   ├── Dockerfile
│   ├── index.html
│   ├── vite.config.js
│   └── package.json       # Frontend dependencies
│
├── README.md
└── docker-compose.yml
```

### Troubleshooting
* **"Brain not ready" / Search fails:** Ensure your backend terminal shows "AI Initialization Complete". If you restarted the backend, give it a few seconds to re-process the notes.

* **401/403 Errors on AI**: Check your .env file in the backend. Ensure the key starts with hf_ and has no quotes or extra spaces.

* **Database Connection Refused**: Make sure your PostgreSQL service is running and the credentials in application.properties are correct.