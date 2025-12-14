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

1.  **Install PostgreSQL:** Ensure PostgreSQL is installed and running on your machine.
2.  **Create the Database Shell:** You only need to create an empty database. Spring Boot (JPA/Hibernate) will automatically create all the necessary tables and relationships for you when the application starts.
    * Open your terminal or pgAdmin.
    * Run the following SQL command:
        ```sql
        CREATE DATABASE notes_db;
        ```
3.  **Verify Configuration:**
    * Open `backend/src/main/resources/application.properties`.
    * Ensure the `spring.datasource.url` matches your local database name (`notes_db`).
    * Ensure `spring.jpa.hibernate.ddl-auto` is set to `update` (this enables the automatic table creation).

### 2. Backend Setup (Spring Boot)
1. **Navigate to the backend folder**:

    ```sh
      cd backend 
   ```

2. **Configure Environment Variables**: Create a file named .env in the backend/ root directory (same level as pom.xml). Add your Hugging Face API Token (Get one for free at huggingface.co/settings/tokens):

    ***Properties***
    ```
    backend/.env
    HUGGINGFACE_API_KEY=hf_YourActualTokenHere
    ```
3. **Update Database Config (Optional)**: If your database password isn't standard, check src/main/resources/application.properties and ensure the database credentials match your local PostgreSQL setup.

4. **Run the Application**: You can run it using your IDE (IntelliJ/Eclipse) or the terminal:
    
    ```sh
      ./mvnw spring-boot:run
   ```
    
    The backend should start on http://localhost:8080. On the first run, it might take a moment to "initialize the AI brain" and generate embeddings for existing notes.

### 3. Frontend Setup (React)
1. **Open a new terminal and navigate to the frontend folder**:

    ```sh
      cd frontend
   ```
2. **Install Dependencies**:

    ```sh
      npm install
   ```

3. **Run the Development Server**:

    ```sh
      npm run dev
   ```
4. **Access the App**: Open your browser and go to the URL shown in the terminal (usually http://localhost:5173).

## Running with Docker
   You can spin up the entire application (Frontend, Backend, and Database) with a single command using Docker Compose.

### 1. Prerequisites
* **Docker Desktop** (or Docker Engine + Compose) installed and running.

### 2. Configure Environment
Docker needs your AI API key to function. Create a `.env` file in the **root** of your project (where `docker-compose.yml` is) and add your key:

```properties
# .env (in project root)
HUGGINGFACE_API_KEY=hf_YourActualTokenHere
```
(The docker-compose.yml should be configured to pass this variable to the backend container).

### 3. Build and Run
Open your terminal in the project root and run:
```sh
   docker-compose up --build
```
This command will:
1. Pull the PostgreSQL image.
2. Build the Spring Boot Backend image.
3. Build the React Frontend image.
4. Start all services and link them together.

### 4. Access the App


Once the logs settle, access your services:

* **Frontend**: http://localhost:5173

* **Backend API**: http://localhost:8080

### 5. Stopping the App
To stop the containers and remove the created networks:
```sh
   docker-compose down
```

## How to Use AI Search
1. **Create Notes**: Add a few notes with distinct topics (e.g., one about "Grocery list: Milk, Bread", another about "Project ideas: React app"). 
2. **Search**: Use the search bar in the dashboard.
3. **Test Semantic Capabilities**:
   * Search for "Breakfast food" -> It should find the "Grocery list" note (even if the word 'breakfast' isn't there!). 
   * Search for "Coding tasks" -> It should find the "Project ideas" note.

## Project Structure
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
│  │     │         └── service/
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

## Troubleshooting
* **"Semantic Search not ready" / Search fails:** Ensure your backend terminal shows "AI Initialization Complete". If you restarted the backend, give it a few seconds to re-process the notes.

* **401/403 Errors on AI**: Check your .env file in the backend. Ensure the key starts with hf_ and has no quotes or extra spaces.

* **Database Connection Refused**: Make sure your PostgreSQL service is running and the credentials in application.properties are correct.

## Assumptions Made During Development

1. **In-Memory Vector Storage**:  Currently AI embeddings are stored in a Java HashMap (RAM) rather than a vector database. I assumed that for a prototype/personal use case, the data volume would remain small enough to fit in memory, and re-generating embeddings on server startup (via DataInitializer) is an acceptable trade-off for simplicity.

2. **Constant Internet Connectivity**: The AI features rely on the Hugging Face Inference API. I assumed the backend server has a stable internet connection. If the API is down or the server is offline, the search falls back to simple keyword matching.

3. **Single-Instance Deployment**: Since vectors are stored in local memory, the application assumes it is running as a single instance. If we scaled to multiple server instances (e.g., using Kubernetes), the semantic search "brain" would be inconsistent across them.

4. **English Language Content**: While the model (all-MiniLM-L6-v2) has some multilingual capabilities, I assumed the primary note content would be in English for optimal semantic search performance.

## Future Improvements

1. **Vector Database Integration (pgvector)**: instead of storing vectors in RAM, I would implement pgvector (PostgreSQL extension) or Pinecone. This would allow the app to scale to millions of notes without running out of memory and persist embeddings across server restarts.

2. **Local AI Inference (ONNX)**: To reduce latency and reliance on external APIs, I would switch to running the model locally using Spring AI's ONNX Runtime. This would make the semantic search faster, free, and offline-capable.

3. **Rich Text Editor**: Currently, notes are plain text. I would integrate a library like Draft.js or Quill to allow users to format text (bold, lists, code blocks) inside their notes.

4. **JWT Authentication & OAuth2**: Enhance the security system by implementing JSON Web Tokens (JWT) for stateless authentication and adding "Login with Google/GitHub" for a smoother user onboarding experience.

5. **Circuit Breaker for AI API**: Implement Resilience4j to handle Hugging Face API timeouts or rate limits gracefully, automatically switching to keyword search without throwing errors if the external service is struggling.