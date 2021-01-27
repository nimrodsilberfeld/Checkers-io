//const url = "http://localhost:3000"
const url = "https://nim-checkers-io.herokuapp.com"
let loginButton = document.getElementById("login_button")
let login_email_input = document.getElementById('login_email_input')
let login_password_input = document.getElementById('login_password_input')
let signUp_button = document.getElementById('signUp_button')
let login_form_button = document.getElementById('login_form_button')
let signMeUp_button = document.getElementById("signMeUp_button")
let error_message = document.querySelector('.error_message')

async function LoginUser(url = '', data = {}) {

    const response = await fetch(url, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    return response.json()
}


async function postUser(url = '', data = {}) {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    return response.json()
}

loginButton.addEventListener('click', (e) => {
    e.preventDefault()
    let userData = {
        email: login_email_input.value,
        password: login_password_input.value
    }
    console.log(userData)
    LoginUser(url + "/users/login", userData)
        .then(data => {
            console.log(data)
            console.log(data.token)
            console.log(data.user.name)
            sessionStorage.setItem("token", data.token)
            sessionStorage.setItem("name", data.user.name)
            sessionStorage.setItem("id", data.user._id)
            location.href = `./lobby.html?username=${data.user.name}&id=${data.user._id}`
        }).catch((err) => {
            error_message.style.display = "block"
        })
})

signMeUp_button.addEventListener('click', (e) => {
    e.preventDefault()
    let userData = {
        name: document.getElementById('sign_name_input').value,
        email: document.getElementById('sign_email_input').value,
        password: document.getElementById('sign_password_input').value
    }
    console.log(userData)
    postUser(url + "/users", userData)
        .then(data => {
            console.log(data)
            console.log(data.token)
            console.log(data.user.name)
            sessionStorage.setItem("token", data.token)
            sessionStorage.setItem("name", data.user.name)
            sessionStorage.setItem("id", data.user._id)
            location.href = `./lobby.html?username=${data.user.name}&id=${data.user._id}`
        }).catch((err) => {
            error_message.style.display = "block"
        })
})

signUp_button.addEventListener('click', (e) => {
    e.preventDefault()
    // error_message.style.display = "none"
    document.getElementById('login_email_input').value = ""
    document.getElementById('login_password_input').value = ""
    document.getElementById('id01').style.display = 'none'
    document.getElementById('id02').style.display = 'block'

})

login_form_button.addEventListener('click', (e) => {
    e.preventDefault()
    document.getElementById('id02').style.display = 'none'
    document.getElementById('id01').style.display = 'block'
})