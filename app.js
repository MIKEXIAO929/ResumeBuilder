const btnCreateResume = document.querySelector('#btnCreateResume')
const btnBack = document.querySelector('#btnBack')
const btnPrint = document.querySelector('#btnPrint')
const btnClear = document.querySelector('#btnClear')
const btnSaveKey = document.querySelector('#btnSaveKey')
const btnLibraries = document.querySelector('#btnLibraries')

btnLibraries.addEventListener('click', function() {
    alert('Libraries used: Bootstrap, Express, SQLite3, and Google GenAI.')
})

btnSaveKey.addEventListener('click', function() {
    let strApiKey = document.querySelector('#txtApiKey').value

    if(strApiKey.trim() == '') {
        alert('Please enter an API key.')
        return
    }

    fetch('/api/settings/api-key', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            apiKey: strApiKey
        })
    })
    .then(function(response) {
        return response.json()
    })
    .then(function(data) {
        if(data.outcome == 'success') {
            alert('API key saved. You can now create the resume.')
        } else {
            alert('API key was not saved.')
        }
    })
    .catch(function() {
        alert('Could not connect to the server.')
    })
})

btnCreateResume.addEventListener('click', function() {
    let strFullName = document.querySelector('#txtFullName').value
    let strEmail = document.querySelector('#txtEmail').value
    let strPhone = document.querySelector('#txtPhone').value
    let strLocation = document.querySelector('#txtLocation').value
    let strSummary = document.querySelector('#txtSummary').value
    let strApiKey = document.querySelector('#txtApiKey').value

    let strTargetJobTitle = document.querySelector('#txtTargetJobTitle').value
    let strTargetCompany = document.querySelector('#txtTargetCompany').value
    let strTargetDescription = document.querySelector('#txtTargetDescription').value

    let strSchool = document.querySelector('#txtSchool').value
    let strDegree = document.querySelector('#txtDegree').value
    let strGradDate = document.querySelector('#txtGradDate').value
    let strEducationDetails = document.querySelector('#txtEducationDetails').value

    let strJobTitle = document.querySelector('#txtJobTitle').value
    let strCompany = document.querySelector('#txtCompany').value
    let strJobDates = document.querySelector('#txtJobDates').value
    let strJobDetails = document.querySelector('#txtJobDetails').value

    let strSkills = document.querySelector('#txtSkills').value
    let strCertifications = document.querySelector('#txtCertifications').value
    let strAwards = document.querySelector('#txtAwards').value

    if(strFullName.trim() == '' || strEmail.trim() == '') {
        alert('Please enter at least your name and email.')
        return
    }

    let objResume = {
        fullName: strFullName,
        email: strEmail,
        phone: strPhone,
        location: strLocation,
        summary: strSummary,
        apiKey: strApiKey,

        targetJobTitle: strTargetJobTitle,
        targetCompany: strTargetCompany,
        targetJobDescription: strTargetDescription,

        schoolName: strSchool,
        degree: strDegree,
        gradDate: strGradDate,
        educationDetails: strEducationDetails,

        jobTitle: strJobTitle,
        company: strCompany,
        jobDates: strJobDates,
        jobDetails: strJobDetails,

        skills: strSkills,
        certifications: strCertifications,
        awards: strAwards
    }

    btnCreateResume.innerText = 'Creating Resume...'
    btnCreateResume.disabled = true

    fetch('/resume', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(objResume)
    })
    .then(function(response) {
        return response.json()
    })
    .then(function(data) {
        btnCreateResume.innerText = 'Create Resume Preview'
        btnCreateResume.disabled = false

        let strGeminiResult = 'No Gemini result was created.'

        if(data.resume && data.resume.generatedResume) {
            strGeminiResult = data.resume.generatedResume
        } else if(data.resume && data.resume.suggestions) {
            strGeminiResult = data.resume.suggestions
        } else if(data.message) {
            strGeminiResult = data.message
        }

        showResumePreview(
            strFullName,
            strEmail,
            strPhone,
            strLocation,
            strSummary,
            strTargetJobTitle,
            strTargetCompany,
            strTargetDescription,
            strSchool,
            strDegree,
            strGradDate,
            strEducationDetails,
            strJobTitle,
            strCompany,
            strJobDates,
            strJobDetails,
            strSkills,
            strCertifications,
            strAwards,
            strGeminiResult
        )
    })
    .catch(function() {
        btnCreateResume.innerText = 'Create Resume Preview'
        btnCreateResume.disabled = false

        showResumePreview(
            strFullName,
            strEmail,
            strPhone,
            strLocation,
            strSummary,
            strTargetJobTitle,
            strTargetCompany,
            strTargetDescription,
            strSchool,
            strDegree,
            strGradDate,
            strEducationDetails,
            strJobTitle,
            strCompany,
            strJobDates,
            strJobDetails,
            strSkills,
            strCertifications,
            strAwards,
            'Could not connect to the backend. Make sure node server.js is running.'
        )
    })
})

function showResumePreview(
    strFullName,
    strEmail,
    strPhone,
    strLocation,
    strSummary,
    strTargetJobTitle,
    strTargetCompany,
    strTargetDescription,
    strSchool,
    strDegree,
    strGradDate,
    strEducationDetails,
    strJobTitle,
    strCompany,
    strJobDates,
    strJobDetails,
    strSkills,
    strCertifications,
    strAwards,
    strGeminiResult
) {
    document.querySelector('#lblTargetJobTitle').innerText = strTargetJobTitle || 'Target Job Title'
    document.querySelector('#lblTargetCompany').innerText = strTargetCompany || 'Target Company'
    document.querySelector('#lblTargetDescription').innerText = strTargetDescription || 'Target job description will show here.'

    document.querySelector('#lblName').innerText = strFullName || 'Your Name'
    document.querySelector('#lblContact').innerText = strEmail + ' | ' + strPhone + ' | ' + strLocation
    document.querySelector('#lblSummary').innerText = strSummary || 'Your summary will show here.'

    document.querySelector('#lblSchool').innerText = strSchool || 'School'
    document.querySelector('#lblDegree').innerText = strDegree + ' | ' + strGradDate
    document.querySelector('#lblEducationDetails').innerText = strEducationDetails

    document.querySelector('#lblJobTitle').innerText = strJobTitle || 'Job Title'
    document.querySelector('#lblCompanyDates').innerText = strCompany + ' | ' + strJobDates

    document.querySelector('#lstJobDetails').innerHTML = ''

    let arrJobDetails = strJobDetails.split(String.fromCharCode(10))

    arrJobDetails.forEach(function(strDetail) {
        if(strDetail.trim() != '') {
            let objLi = document.createElement('li')
            objLi.innerText = strDetail
            document.querySelector('#lstJobDetails').appendChild(objLi)
        }
    })

    document.querySelector('#lblSkills').innerText = strSkills || 'Skills will show here.'
    document.querySelector('#lblCertifications').innerText = strCertifications || 'Certifications will show here.'
    document.querySelector('#lblAwards').innerText = strAwards || 'Awards will show here.'
    document.querySelector('#lblGeminiResult').innerText = strGeminiResult || 'Gemini result will show here.'

    document.querySelector('#divForm').style.display = 'none'
    document.querySelector('#divPreview').style.display = 'block'
}

btnBack.addEventListener('click', function() {
    document.querySelector('#divPreview').style.display = 'none'
    document.querySelector('#divForm').style.display = 'block'
})

btnPrint.addEventListener('click', function() {
    window.print()
})

btnClear.addEventListener('click', function() {
    document.querySelector('#txtFullName').value = ''
    document.querySelector('#txtEmail').value = ''
    document.querySelector('#txtPhone').value = ''
    document.querySelector('#txtLocation').value = ''
    document.querySelector('#txtSummary').value = ''
    document.querySelector('#txtApiKey').value = ''

    document.querySelector('#txtTargetJobTitle').value = ''
    document.querySelector('#txtTargetCompany').value = ''
    document.querySelector('#txtTargetDescription').value = ''

    document.querySelector('#txtSchool').value = ''
    document.querySelector('#txtDegree').value = ''
    document.querySelector('#txtGradDate').value = ''
    document.querySelector('#txtEducationDetails').value = ''

    document.querySelector('#txtJobTitle').value = ''
    document.querySelector('#txtCompany').value = ''
    document.querySelector('#txtJobDates').value = ''
    document.querySelector('#txtJobDetails').value = ''

    document.querySelector('#txtSkills').value = ''
    document.querySelector('#txtCertifications').value = ''
    document.querySelector('#txtAwards').value = ''
})