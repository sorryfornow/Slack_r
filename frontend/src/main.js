import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl, screenErr, apiCall, getAllChannels, displayChannels} from './helpers.js';


console.log('Let\'s go!');

let signinForm = document.forms.signinForm;
let signupForm = document.forms.signupForm;
let signupButton = document.getElementById('signupButton');
let signinButton = document.getElementById('signinButton');
let signoutButton = document.getElementById('signoutButton');


// registration and login
// if the user is not logged in, the login form should be displayed
// if the user is logged in, after refresh the page, the user should be redirected to the infoContainer

// document.querySelector('.signupContainer').classList.add('hidden');
// document.querySelector('.infoContainer').classList.add('hidden');

let globalUserId = localStorage.getItem('userId');
let globalToken = localStorage.getItem('token');
if (globalToken) {
    document.querySelector('.signinContainer').classList.add('hidden');
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
    // if global token is null do nothing
    if (!globalToken) return;
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

            document.querySelector('.infoContainer').classList.add('hidden');
            document.querySelector('.signinContainer').classList.remove('hidden');

            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            globalToken = null;
            globalUserId = null;
        }
    }).catch((error) => {
        if (error) {
            // console.log(error);
            // alert('Invaild token');
            screenErr(error.message);
        }
    });
});

signinForm.addEventListener('submit', (event) => {
    event.preventDefault();

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

    const url = `auth/login`;
    const data = { email, password };
    apiCall(url, data)
    .then((data) => {
        // Handle the success response here
        document.querySelector('.signinContainer').classList.add('hidden');
        document.querySelector('.infoContainer').classList.remove('hidden');

        const { token, userId } = data;
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId);
        globalToken = localStorage.getItem('token');
        globalUserId = localStorage.getItem('userId');

        console.log(globalToken);

        // show all channels
        getAllChannels(globalToken)
        .then((channelList) => {
            // Once channels are fetched, display them
            displayChannels(channelList, globalUserId);
        })
        .catch((error) => {
            // Handle errors here
            screenErr(error);
        });
        
    })
    .catch((error) => {
        // Handle the error response here
        screenErr(error.message);
    });


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
        screenErr('Email is not valid');
        return;
    }
    if (email == '' || password == '' || password2 == '' || name == '') {
        screenErr('Email or password is empty');
        return;
    }
    if (password !== password2) {
        screenErr('Password lines are not matching');
        return;
    }

    
    // send email and password to server ${BACKEND_PORT}/auth/register
    // backend/swagger.json line 363 shows the format of the request and response

    const url = `auth/register`;
    const data = { email, password, name };
    apiCall(url, data)
    .then((data) => {
        // Handle the success response here
        const signupContainer = document.querySelector('.signupContainer');
        const element = document.createElement('div');
        element.textContent = 'Signup success, please login to your account';
        // element.innerText = 'Signup success, please login to your account';
        element.style.color = 'green';
        signupContainer.appendChild(element);
    })
    .catch((error) => {
        // Handle the error response here
        screenErr(error);
    });

    
});


// channel
document.addEventListener("DOMContentLoaded", () => {
    // Get references to form elements
    const createChannelButton = document.querySelector(".sidebarAddChannel");
    const modal = new bootstrap.Modal(document.getElementById("createChannelModal"));

    const createChannelForm = document.getElementById("createChannelForm");
    const channelNameInput = document.getElementById("channelName");
    const channelDescriptionInput = document.getElementById("channelDescription");
    const channelTypeSelect = document.getElementById("channelType");



    createChannelButton.addEventListener("click", (event) => {
        event.preventDefault();
        modal.show();
    });

    createChannelForm.addEventListener("submit", (event) => {
        event.preventDefault();

        // Get values from form inputs
        const channelName = channelNameInput.value;
        const channelDescription = channelDescriptionInput.value;
        const channelType = channelTypeSelect.value;
  
        // You can perform further actions here, e.g., send data to a server
        // For now, let's just log the values to the console

        const ifPrivate = channelType == 'private' ? true : false;
        const url = `channel`;
        const data = { name: channelName, private: ifPrivate, description: channelDescription };
        console.log(url, data);

        apiCall(url, data, globalToken, 'POST')
        .then((data) => {
            // Handle the success response here
            console.log('createChanel', data);
            // addChannel2List(channelName, ifPrivate);
            // TODO
            
        })
        .catch((error) => {
            // Handle the error response here
            screenErr(error);
        });

        // Close the modal
        modal.hide();
    });


});
