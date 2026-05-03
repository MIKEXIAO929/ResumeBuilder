# Resume Builder

## Project Description

Resume Builder is a single page web application that helps users create a resume for a target job. The user can enter personal information, education, work experience, skills, certifications, awards, and target job details. The application then creates a resume preview and uses the Google Gemini API to provide an improved resume draft and resume suggestions.

The goal of this project is to help students focus more on the content of their resume while the application helps with formatting and feedback.

## Technologies Used

- HTML
- Bootstrap
- JavaScript
- Node.js
- Express
- SQLite
- Google Gemini API

## Main Features

- Single page application using one `index.html` file
- Show and hide sections of the page without using React or another frontend framework
- User can enter resume information
- User can enter target job information
- User can enter their own Gemini API key
- Backend saves resume data into a SQLite database
- Gemini API reviews the resume information and gives feedback
- Resume preview is displayed in the browser
- User can save the resume as a PDF using the browser print window

## Project Folder Structure

```text
ResumeBuilder/
│
├── server.js
├── resume_builder.db
├── package.json
├── package-lock.json
│
└── public/
    ├── index.html
    ├── css/
    │   └── bootstrap.min.css
    └── js/
        └── bootstrap.bundle.min.js
