import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from './helpers.js';

console.log('Let\'s go!');

// registration and login
let signin_container = document.getElementById('signin__container');
let signup_container = document.getElementById('signup__container');
let info_container = document.getElementById('info__container');
signin_container.style.display = 'block';
signup_container.style.display = 'none';
info_container.style.display = 'none';

let signinForm = document.forms.signinForm;
let signupForm = document.forms.signupForm;

Array.from(signinForm).forEach(element => {
    // save the value of the input element to local storage
    // get the value of the input element from local storage when the page is loaded
    if(element.type != 'submit'){
        element.addEventListener('change', (event) => {
            localStorage.setItem(element.id, element.value);
        });
        element.value = localStorage.getItem(element.id);
    } 
});
Array.from(signupForm).forEach(element => {
    // save the value of the input element to local storage
    // get the value of the input element from local storage when the page is loaded
    if(element.type != 'submit'){
        element.addEventListener('change', (event) => {
            localStorage.setItem(element.id, element.value);
        });
        element.value = localStorage.getItem(element.id);
    } 
});


signinForm.addEventListener('submit', (event) => {
    event.preventDefault();
    // if the Email or password is empty, an appropriate error should appear on the screen
    const email = signinForm.elements.email_signin.value;
    const password = signinForm.elements.password_signin.value;

    // regex email
    const regex = /\S+@\S+\.\S+/;
    if (!regex.test(email)) {
        alert('Email is not valid');
        return;
    }
    if (email == '' || password == '') {
        alert('Email or password is empty');
        return;
    }

    // send email and password to server ${BACKEND_PORT}/auth/login
    // backend/swagger.json shows the format of the request and response
    const url = `http://localhost:${BACKEND_PORT}/auth/login`;
    const data = { email, password };
    console.log(url);
    console.log(data);
    fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*'
        }
    }).then(response => {
        if (response.status == 200) {
            document.getElementById('signin__container').style.display = 'none';
            document.getElementById('info__container').style.display = 'block';
            return response.json();
        } else {
            throw new Error('Something went wrong on api server!');
        }
    }).then((data) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('email', email);
    }).catch(error => {
        console.error(error);
        alert('Email or password is incorrect');
    });
});

let signupButton = document.getElementById('signupButton');
let signinButton = document.getElementById('signinButton');
signupButton.addEventListener('click', (event) => {
    // disable the signin div and enable the signup div
    document.getElementById('signin__container').style.display = 'none';
    document.getElementById('signup__container').style.display = 'block';
});
signinButton.addEventListener('click', (event) => {
    // disable the signup div and enable the signin div
    document.getElementById('signin__container').style.display = 'block';
    document.getElementById('signup__container').style.display = 'none';
});


