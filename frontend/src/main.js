import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from './helpers.js';

console.log('Let\'s go!');

// registration and login
let signinForm = document.forms.signinForm;

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

signinForm.addEventListener('submit', (event) => {
    event.preventDefault();

    // if the Email or password is empty, an appropriate error should appear on the screen
    const email = signinForm.elements.email_signin.value;
    const password = signinForm.elements.password_signin.value;

    // regex allow all keyboard symbols
    if (email == '' || password == '') {
        alert('Email or password is empty');
        return;
    }

    // send email and password to server ${BACKEND_PORT}/auth/login
    const url = `http://localhost:${BACKEND_PORT}/auth/login`;
    console.log(url);
    const data = { email, password };
    fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
        }
    }).then(response => response.json()).then(data => {
        console.log(data);
        // if username and password are correct,
        // the user should be redirected to the main page of the application
        if (data.status == 'ok') {
            window.location.href = 'index.html';
            // disable the signin div and enable the container div 
            // document.getElementById('signin').style.display = 'none';
            // document.getElementById('container').style.display = 'block';

        } else {
            alert('Username or password is incorrect');
        }
    })
    
});

