import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from './helpers.js';

console.log('Let\'s go!');

let signinForm = document.forms.signinForm;
let signupForm = document.forms.signupForm;
let signupButton = document.getElementById('signupButton');
let signinButton = document.getElementById('signinButton');
let signoutButton = document.getElementById('signoutButton');


// registration and login
// if the user is not logged in, the login form should be displayed
// if the user is logged in, after refresh the page, the user should be redirected to the infoContainer

document.querySelector('.signupContainer').classList.add('hidden');
document.querySelector('.infoContainer').classList.add('hidden');

let globalToken = null;
let localToken = localStorage.getItem('token');
if (localToken) {
    globalToken = localToken;
}
if (globalToken) {
    document.querySelector('.signinContainer').classList.add('hidden');
    document.querySelector('.signupContainer').classList.add('hidden');
    document.querySelector('.infoContainer').classList.remove('hidden');
}


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

signupButton.addEventListener('click', (event) => {
    // disable the signin div and enable the signup div
    document.querySelector('.signinContainer').classList.add('hidden');
    document.querySelector('.signupContainer').classList.remove('hidden');
    console.log('signup page');
});
signinButton.addEventListener('click', (event) => {
    // disable the signup div and enable the signin div
    document.querySelector('.signupContainer').classList.add('hidden');
    document.querySelector('.signinContainer').classList.remove('hidden');
    console.log('signin page');
});

signoutButton.addEventListener('click', (event) => {
    // disable the info div and enable the signin div
    const url = `http://localhost:${BACKEND_PORT}/auth/logout`;
    fetch(url, {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${globalToken}`
        }
    }).then((response) => {
        console.log(response);
        if (response.status == 200) {
            console.log('signout');
            console.log(globalToken)
            document.querySelector('.infoContainer').classList.add('hidden');
            document.querySelector('.signinContainer').classList.remove('hidden');
            localStorage.removeItem('token');
            globalToken = null;
        }
    }).catch((error) => {
        if (error) {
            console.log(error);
            alert('Invaild token');
        }
    });
});

signinForm.addEventListener('submit', (event) => {
    event.preventDefault();
    console.log('Signin form submitted');
    // if the Email or password is empty, an appropriate error should appear on the screen
    const email = signinForm.elements["emailSignin"].value;
    const password = signinForm.elements["passwordSignin"].value;    

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
    const data = { email: email, password: password };
    console.log(data);
    fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then((response) => {
        console.log(response);
        if (response.status == 200) {
            document.querySelector('.signinContainer').classList.add('hidden');
            document.querySelector('.infoContainer').classList.remove('hidden');
            return response.json();
        } else {
            throw new Error('Something went wrong on api server!');
        }
    }).then((data) => {
        console.log(data);
        localStorage.setItem('token', data.token);
        globalToken = localStorage.getItem('token');
        console.log(globalToken);
    }).catch((error) => {
        if (error){
            console.log(error);
            alert('Email or password is incorrect');
        }  
    });
    console.log('Signin form processing finished');
});

// TODO signup token

signupForm.addEventListener('submit', (event) => {
    event.preventDefault();
    // if the Email or password is empty, an appropriate error should appear on the screen
    const email = signupForm.elements["emailSignup"].value;
    const name = signupForm.elements["nameSignup"].value;
    const password = signupForm.elements["passwordSignup"].value;
    const password2 = signupForm.elements["passwordConfirm"].value;

    // regex email
    const regex = /\S+@\S+\.\S+/;
    if (!regex.test(email)) {
        alert('Email is not valid');
        return;
    }
    if (email == '' || password == '' || password2 == '' || name == '') {
        alert('Email or password is empty');
        return;
    }
    if (password !== password2) {
        alert('Password is not the same');
        return;
    }

    
    // send email and password to server ${BACKEND_PORT}/auth/register
    // backend/swagger.json line 363 shows the format of the request and response
    const url = `http://localhost:${BACKEND_PORT}/auth/register`;
    const data = { email, password, name};
    fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then((response) => {
        if (response.status == 200) {
            // document.querySelector('.signinContainer').style.display = 'flex';
            // document.querySelector('.signupContainer').style.display = 'none';
            // document.querySelector('.infoContainer').style.display = 'none';
            const signupContainer = document.querySelector('.signupContainer');
            // add a div to show the signup success message
            const element = document.createElement('div');
            element.innerText = 'Signup success, please login your account';
            element.style.color = 'green';
            signupContainer.appendChild(element);
            // return response.json();
        } else {
            throw new Error('Something went wrong on api server!');
        }
    }).then((data) => {
        // localStorage.setItem('token', data.token);
    }).catch((error) => {
        if (error) {
            alert('Input email may already exist');
        }
    });
    
});



let channels = document.querySelector('.sidebarChannels');
