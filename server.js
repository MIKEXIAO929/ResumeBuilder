const express = require('express')
const sqlite3 = require('sqlite3').verbose()
const path = require('path')
const { GoogleGenAI } = require('@google/genai')

const app = express()
const HTTP_PORT = 3000

let strSavedGeminiApiKey = ''

app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

const dbPath = path.join(__dirname, 'resume_builder.db')

const dbResume = new sqlite3.Database(dbPath, function(err) {
    if(err) {
        console.log('Database connection failed')
        console.log(err.message)
    } else {
        console.log('Connected to resume_builder.db')
    }
})

dbResume.serialize(function() {
    dbResume.run(`
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT,
            email TEXT,
            phone TEXT,
            linkedin TEXT,
            github TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `)

    dbResume.run(`
        CREATE TABLE IF NOT EXISTS resumes (
            resume_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            target_job_title TEXT,
            target_company TEXT,
            target_job_description TEXT,
            professional_summary TEXT,
            education TEXT,
            skills TEXT,
            work_experience TEXT,
            projects TEXT,
            certifications TEXT,
            awards TEXT,
            generated_resume TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
    `)

    dbResume.run(`
        CREATE TABLE IF NOT EXISTS resume_suggestions (
            suggestion_id INTEGER PRIMARY KEY AUTOINCREMENT,
            resume_id INTEGER,
            suggestion_text TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (resume_id) REFERENCES resumes(resume_id)
        )
    `)

    addColumnIfMissing('resumes', 'target_company', 'TEXT')
    addColumnIfMissing('resumes', 'target_job_description', 'TEXT')
    addColumnIfMissing('resumes', 'awards', 'TEXT')

    console.log('Tables are ready')
})

function addColumnIfMissing(strTable, strColumn, strType) {
    const strQuery = `ALTER TABLE ${strTable} ADD COLUMN ${strColumn} ${strType}`

    dbResume.run(strQuery, function(err) {
        if(err) {
            if(err.message.includes('duplicate column name')) {
                return
            }
        }
    })
}

app.get('/test', function(req, res) {
    res.status(200).json({
        message: 'Server is working'
    })
})

app.post('/api/settings/api-key', function(req, res) {
    let strApiKey = ''

    if(req.body.apiKey) {
        strApiKey = req.body.apiKey.trim()
    }

    if(strApiKey == '') {
        res.status(400).json({
            outcome: 'error',
            message: 'API key is required'
        })
        return
    }

    strSavedGeminiApiKey = strApiKey

    res.status(200).json({
        outcome: 'success',
        message: 'API key saved while server is running'
    })
})

app.post('/resume', async function(req, res) {
    const objResume = req.body

    let strFullName = ''
    let strEmail = ''
    let strPhone = ''
    let strApiKey = ''
    let strSuggestions = 'Review spelling, use action verbs, and make sure your skills match the target job description.'
    let strGeneratedResume = 'Gemini did not create a generated resume draft.'

    if(objResume.fullName) {
        strFullName = objResume.fullName.trim()
    }

    if(objResume.email) {
        strEmail = objResume.email.trim()
    }

    if(objResume.phone) {
        strPhone = objResume.phone.trim()
    }

    if(objResume.apiKey) {
        strApiKey = objResume.apiKey.trim()
    }

    if(strApiKey == '' && strSavedGeminiApiKey != '') {
        strApiKey = strSavedGeminiApiKey
    }

    if(strFullName.length < 1 || strEmail.length < 1) {
        res.status(400).json({
            outcome: 'error',
            message: 'Name and email are required'
        })
        return
    }

    if(strApiKey != '') {
        try {
            const ai = new GoogleGenAI({
                apiKey: strApiKey
            })

            const strPrompt = `
You are helping a college student build a better resume for a target job.

Return your answer in this exact format:

IMPROVED RESUME DRAFT:
Write a short improved resume draft using the student's information. Include:
- Professional Summary
- Education
- Experience bullet points
- Skills

RESUME SUGGESTIONS:
Give 4 to 6 simple suggestions to improve the resume.

Student Information:
Name: ${objResume.fullName}
Email: ${objResume.email}
Phone: ${objResume.phone}
Location: ${objResume.location}

Target Job:
Job Title: ${objResume.targetJobTitle}
Company: ${objResume.targetCompany}
Job Description: ${objResume.targetJobDescription}

Current Resume:
Summary: ${objResume.summary}
School: ${objResume.schoolName}
Degree: ${objResume.degree}
Graduation Date: ${objResume.gradDate}
Education Details: ${objResume.educationDetails}
Job Title: ${objResume.jobTitle}
Company: ${objResume.company}
Dates: ${objResume.jobDates}
Responsibilities: ${objResume.jobDetails}
Skills: ${objResume.skills}
Certifications: ${objResume.certifications}
Awards: ${objResume.awards}

Keep the wording clear, professional, and realistic for a college student.
`

            const objResponse = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: strPrompt
            })

            strGeneratedResume = objResponse.text
            strSuggestions = objResponse.text

        } catch(err) {
            console.log('Gemini did not work')
            console.log(err.message)

            strGeneratedResume = 'Gemini did not work. Check that your API key is correct.'
            strSuggestions = 'Gemini did not work. Check that your API key is correct.'
        }
    } else {
        strGeneratedResume = 'No Gemini API key was provided. Enter your key in the API key box to get AI suggestions.'
        strSuggestions = 'No Gemini API key was provided. Enter your key in the API key box to get AI suggestions.'
    }

    const strUserQuery = `
        INSERT INTO users
        (full_name, email, phone, linkedin, github)
        VALUES (?, ?, ?, ?, ?)
    `

    dbResume.run(strUserQuery, [
        strFullName,
        strEmail,
        strPhone,
        '',
        ''
    ], function(err) {
        if(err) {
            res.status(500).json({
                outcome: 'error',
                message: err.message
            })
            return
        }

        let intUserID = this.lastID

        let strEducation = `${objResume.schoolName} | ${objResume.degree} | ${objResume.gradDate} | ${objResume.educationDetails}`
        let strWorkExperience = `${objResume.jobTitle} | ${objResume.company} | ${objResume.jobDates} | ${objResume.jobDetails}`

        const strResumeQuery = `
            INSERT INTO resumes
            (
                user_id,
                target_job_title,
                target_company,
                target_job_description,
                professional_summary,
                education,
                skills,
                work_experience,
                projects,
                certifications,
                awards,
                generated_resume
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `

        dbResume.run(strResumeQuery, [
            intUserID,
            objResume.targetJobTitle,
            objResume.targetCompany,
            objResume.targetJobDescription,
            objResume.summary,
            strEducation,
            objResume.skills,
            strWorkExperience,
            '',
            objResume.certifications,
            objResume.awards,
            strGeneratedResume
        ], function(err) {
            if(err) {
                res.status(500).json({
                    outcome: 'error',
                    message: err.message
                })
                return
            }

            let intResumeID = this.lastID

            const strSuggestionQuery = `
                INSERT INTO resume_suggestions
                (resume_id, suggestion_text)
                VALUES (?, ?)
            `

            dbResume.run(strSuggestionQuery, [
                intResumeID,
                strSuggestions
            ], function(err) {
                if(err) {
                    res.status(500).json({
                        outcome: 'error',
                        message: err.message
                    })
                    return
                }

                objResume.resumeID = intResumeID
                objResume.generatedResume = strGeneratedResume
                objResume.suggestions = strSuggestions

                res.status(201).json({
                    outcome: 'success',
                    message: 'Resume created',
                    resume: objResume
                })
            })
        })
    })
})

app.get('/resume', function(req, res) {
    const strQuery = `
        SELECT 
            resumes.resume_id,
            users.full_name,
            users.email,
            users.phone,
            resumes.target_job_title,
            resumes.target_company,
            resumes.target_job_description,
            resumes.professional_summary,
            resumes.education,
            resumes.skills,
            resumes.work_experience,
            resumes.certifications,
            resumes.awards,
            resumes.generated_resume,
            resumes.created_at
        FROM resumes
        JOIN users ON resumes.user_id = users.user_id
        ORDER BY resumes.created_at DESC
    `

    dbResume.all(strQuery, [], function(err, rows) {
        if(err) {
            res.status(500).json({
                outcome: 'error',
                message: err.message
            })
        } else {
            res.status(200).json({
                outcome: 'success',
                resumes: rows
            })
        }
    })
})

app.listen(HTTP_PORT, function() {
    console.log('Listening on', HTTP_PORT)
})
