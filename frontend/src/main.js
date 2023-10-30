import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl, globalChannelID, screenErr, apiCall, getAllChannels, displayChannels, processMessages, getUserInfoByEmail} from './helpers.js';

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

if (globalToken && globalUserId) {
    document.querySelector('.signinContainer').classList.add('hidden');
    document.querySelector('.infoContainer').classList.remove('hidden');
    getAllChannels(globalToken).then((data) => {
        displayChannels(data, globalUserId, globalToken);
    });
}


if (globalChannelID == null) {
    const messageInputContainer = document.getElementById('messagePhotoUploadContainer');
    messagePhotoUploadContainer.classList.add('hidden');
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
            displayChannels(channelList, globalUserId, globalToken);
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


signupForm.addEventListener('submit', (event) => {
    event.preventDefault();
    // if the Email or password is empty, an appropriate error should appear on the screen
    const email = signupForm.elements["emailSignup"].value.trim();
    const name = signupForm.elements["nameSignup"].value.trim();
    const password = signupForm.elements["passwordSignup"].value;
    const password2 = signupForm.elements["passwordConfirm"].value;

    // regex email
    const regex = /\S+@\S+\.\S+/;
    if (!regex.test(email)) {
        screenErr('Email is not valid');
        return;
    }
    // regex password that cannot contain space
    const regex2 = /\s/;
    if (regex2.test(password)) {
        screenErr('Password cannot contain space');
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
        element.style.color = 'green';
        signupContainer.appendChild(element);
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId);
        globalToken = localStorage.getItem('token');
        globalUserId = localStorage.getItem('userId');
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
            // display channels
            getAllChannels(globalToken)
            .then((channelList) => {
                // Once channels are fetched, display them
                getAllChannels(globalToken).then((channelList) => {
                    displayChannels(channelList, globalUserId, globalToken);
                });
            })
            .catch((error) => {
                // Handle errors here
                screenErr(error);
            });
        })
        .catch((error) => {
            // Handle the error response here
            screenErr(error);
        });

        // disable the modal
        modal.hide();
    });

});





// Event listener for join Channel button
document.getElementById('joinChannelBtn').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent default form submission
    const curModal = document.getElementById('joinModal');
    let channelId = globalChannelID;
    const url = `channel/${channelId}/join`;
    apiCall(url, null, globalToken, 'POST')
    .then((data) => {
        console.log('joinChannel success');
        // disable the join button and show a success message in div
        document.getElementById('joinChannelBtn').disabled = true;
        document.getElementById('joinChannelBtn').textContent = 'Joined';
        // remove the former message div
        const joinTextExist = curModal.querySelector('#joinSuccessText');
        if (joinTextExist) {
            joinTextExist.remove();
        }
        // new a message div
        const joinText = document.createElement('div');
        joinText.classList.add('text-success');
        joinText.id = 'joinSuccessText';
        joinText.textContent = 'You have joined this channel';
        // append message
        const infoJoinText = document.getElementById('joinText');
        infoJoinText.appendChild(joinText);
        // get all channels again
        getAllChannels(globalToken).then((data) => {
            displayChannels(data, globalUserId, globalToken);
        });
    }).catch((error) => {
        screenErr(error);
    });
}); // end of catch



// enable buttons of channel info events
// edit
document.getElementById('editChannelBtn').addEventListener('click', function() {
    // Get current channel information
    const currentName = document.getElementById('channelInfoName').textContent;
    const currentDescription = document.getElementById('channelDescription').textContent;

    // Set the values in the edit modal
    document.getElementById('editChannelName').value = currentName;
    // editChannelDescription is textarea
    document.getElementById('editChannelDescription').value = currentDescription;

    // Show the edit channel modal
    const editChannelModal = new bootstrap.Modal(document.getElementById('editChannelModal'));
    // shutdown current modal
    const channelInfoModal = bootstrap.Modal.getInstance(document.getElementById('channelInfoModal'));
    channelInfoModal.hide();
    editChannelModal.show();
});

document.getElementById('editChannelForm').addEventListener('submit', function(event) {
    event.preventDefault();
    // Get the updated values
    const updatedName = document.getElementById('editChannelName').value;
    const updatedDescription = document.getElementById('editChannelDescription').value;

    let channelId = globalChannelID;
    const url = `channel/${channelId}`;
    const data = { name: updatedName, description: updatedDescription };
    apiCall(url, data, globalToken, 'PUT')
    .then((data) => {
        // Handle the success response here
        console.log('updateChannel', data);
        // display channels
        getAllChannels(globalToken)
        .then((channelList) => {
            // Once channels are fetched, display them
            displayChannels(channelList, globalUserId, globalToken);
        })
        .catch((error) => {
            // Handle errors here
            screenErr(error);
        });
    }).catch((error) => {
        // Handle the error response here
        screenErr(error);
    });

    // Close the modal after updating
    const editChannelModal = bootstrap.Modal.getInstance(document.getElementById('editChannelModal'));
    editChannelModal.hide();
    getAllChannels(globalToken).then((data) => {
        displayChannels(data, globalUserId, globalToken);
    });
});

// leave
document.getElementById('leaveChannelBtn').addEventListener('click', (event) => {
    event.preventDefault();
    // leave channel
    let channelId = globalChannelID;
    const url = `channel/${channelId}/leave`;
    apiCall(url, null, globalToken, 'POST')
    .then((data) => {
        console.log('leave channel');
        // disable the button
        document.getElementById('leaveChannelBtn').disabled = true;
        document.getElementById('inviteChannelBtn').disabled = true;
        document.getElementById('editChannelBtn').disabled = true;
        document.getElementById('leaveChannelBtn').textContent = 'Left';
        getAllChannels(globalToken).then((data) => {
            displayChannels(data, globalUserId, globalToken);
        });
        
    }).catch((error) => {
        // Handle the error response here
        screenErr(error);
    });
    console.log('leave channel');
});

document.getElementById('channelSearchForm').addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent default form submission
    // Get the current channel ID from the input
    const currentChannelID = document.getElementById('channelSearchInput').value;
    // globalChannelID = currentChannelID; // cannot assign const var
    let channelId = currentChannelID;
    const url = `channel/${channelId}/join`;
    apiCall(url, null, globalToken, 'POST')
    .then(() => {
        console.log('joinChannel success');
        // get all channels again
        getAllChannels(globalToken).then((data) => {
            displayChannels(data, globalUserId, globalToken);
        });
    }).catch((error) => {
        screenErr(error);
    });
});

// invite friend
document.getElementById('inviteChannelBtn').addEventListener('click', (event) => {
    event.preventDefault(); // Prevent default form submission
    // Get the current channel ID from the input
    let channelId = globalChannelID;
    // const url = `channel/${channelId}/invite`;
    // raise a Modal
    const inviteModal = new bootstrap.Modal(document.getElementById('inviteModal'));
    const inviteResults = document.getElementById('inviteResults');
    while (inviteResults.firstChild) {
        inviteResults.removeChild(inviteResults.firstChild);
    }
    if (inviteModal._isShown) {
        inviteModal.hide();
    }
    inviteModal.show();
    // search user
    const userSearchBtn = document.getElementById('userSearchBtn');

    // get all users selected
    const selectedUsers = document.getElementById('selectedUsers');
    while (selectedUsers.firstChild) {
        selectedUsers.removeChild(selectedUsers.firstChild);
    }

    userSearchBtn.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent default form submission
        
        let userSearchInput = document.getElementById('userSearchInput').value.trim();
        if (userSearchInput == '') {
            screenErr('Please select a user');
            return;
        }
        console.log('Search:', userSearchInput);
        getUserInfoByEmail(userSearchInput, globalToken).then((usr) => {
            // add user to invite list
            // create a new div
            const { id: userId, email: userEmail } = usr;
            // TODO: BUG: userEmail undefined 
            console.log('userEmail:', userEmail);

            // console.log('userInfo to div', data);
            const selectedUsers = document.getElementById('selectedUsers');
            const userDiv = document.createElement('div');
            userDiv.classList.add('userInviteDiv');
            // add email to div 
            userDiv.textContent = userEmail;
            console.log('userDiv', userDiv);
            userDiv.id = 'invite'+userId;
            selectedUsers.appendChild(userDiv);
        }).catch((error) => {
            screenErr(error);
        });
        
    });
});

// add selected users
document.getElementById('addUsersBtn').addEventListener('click', (event) => {
    // addUsersBtn
    const inviteResults = document.getElementById('inviteResults');
    while (inviteResults.firstChild) {
        inviteResults.removeChild(inviteResults.firstChild);
    }

    let channelId = globalChannelID;
    let userEmailArray = [];
    // get all users selected
    const selectedUsers = document.getElementById('selectedUsers');
    const userDivs = selectedUsers.querySelectorAll('.userInviteDiv');
    userDivs.forEach((div) => {
        const userEmail = div.textContent;
        console.log('userDivs', userEmail);
        userEmailArray.push(userEmail);
    });
    console.log(userEmailArray);
    // for each user email, send invite
    userEmailArray.forEach((email) => {
        // TODO find user id by email
        getUserInfoByEmail(email, globalToken).then((usr) => {
            console.log('userInfo:', usr);
            if (usr == null) {
                screenErr('User not found');
                return;
            }
            
            const { id: userId, email: userEmail } = usr;
            const dataInput = { userId };
            const url = `channel/${channelId}/invite`;
            apiCall(url, dataInput, globalToken, 'POST')
            .then(() => {
                console.log('invite success');
                // get all channels again
                // create success message
                const successInviteDiv = document.createElement('div');
                successInviteDiv.classList.add('text-success');
                successInviteDiv.textContent = 'Invite success: '+userEmail+' has joined this channel';
                const inviteResults = document.getElementById('inviteResults');
                inviteResults.appendChild(successInviteDiv);
                // TODO new joined post in channel page
            }).catch((error) => {
                screenErr(error);
            });
        }).catch((error) => {
            screenErr(error);
        });
    });
});

// show current user's info
document.getElementById('userInfoBtn').addEventListener('click', (event) => {
    event.preventDefault(); // Prevent default form submission
    // raise modal
    console.log('show user info');
    const url = `user/${globalUserId}`;
    apiCall(url, null, globalToken, 'GET')
    .then((data) => {
        // Handle the success response here
        console.log('userInfo', data);
        // display channels
        const { name, email, bio, image } = data;
        document.getElementById('userModalName').textContent = name;
        document.getElementById('userModalEmail').textContent = email;
        document.getElementById('userModalBio').textContent = bio;
        document.getElementById('editUserInfoBtn').disabled = false;
        if (image == null) {
            document.getElementById('userModalImage').alt = 'No Image';
        } else {
            document.getElementById('userModalImage').src = image;
        }
        const userInfoModal = new bootstrap.Modal(document.getElementById('userInfoModal'));
        userInfoModal.show();

        // enable edit
        document.getElementById('editUserInfoBtn').addEventListener('click', (event) => {
            event.preventDefault();
            // raise modal
            document.getElementById('userEmailEdit').value = email;
            document.getElementById('userNameEdit').value = name;
            document.getElementById('userBioEdit').value = bio;
            const editUserInfoModal = new bootstrap.Modal(document.getElementById('editProfileModal'));
            // remove previous info
            const nextModal = document.getElementById('editProfileModal');
            const warningDiv = nextModal.querySelector('#editProfileWarning');
            if (warningDiv) {
                warningDiv.remove();
            }
            userInfoModal.hide();
            editUserInfoModal.show();
        });

    }).catch((error) => {
        screenErr(error);
    });

});

// update user profile
document.getElementById('editProfileModal').addEventListener('submit', (event) => {
    event.preventDefault(); // Prevents the default form submission action

    const curModal = document.getElementById('editProfileModal');
    // Check if the div with id 'editProfileWarning' exists and delete it
    const warningDiv = document.querySelector('#editProfileWarning');
    if (warningDiv) {
        warningDiv.remove();
    }

    const newPassword = document.getElementById('userPasswordEdit').value;
    const confirmPassword = document.getElementById('userPasswordConfirmEdit').value;

    // Check if the new password and confirm password are matching
    if (newPassword !== confirmPassword) {
        const element = document.createElement('div');
        element.textContent = 'Password lines are not matching';
        element.style.color = 'red';
        element.id = 'editProfileWarning';
        curModal.querySelector('.modal-body').appendChild(element); 
        // Append the warning in modal body
        return;
    }

    // Collecting other form data
    const email = document.getElementById('userEmailEdit').value;
    const name = document.getElementById('userNameEdit').value;
    const bio = document.getElementById('userBioEdit').value;
    console.log(email, name, bio);

    const password = newPassword;
    if (email == '' || name == '' ) {
        const element = document.createElement('div');
        element.textContent = 'Email or name is empty';
        element.style.color = 'red';
        element.id = 'editProfileWarning';
        curModal.querySelector('.modal-body').appendChild(element); // Append the warning in modal body
        return;
    }
    // Handle the file input for the image if necessary
    const imageFile = document.getElementById('userImageEdit').files[0];
    const image = imageFile ? imageFile : "";

    // call api to update
    const data = {email, password, name, bio, image};
    console.log(data);
    const url = `user`;
    apiCall(url, data, globalToken, 'PUT')
    .then(() => {
        const element = document.createElement('div');
        element.textContent = 'User Profile Updated';
        element.style.color = 'Green';
        element.id = 'editProfileWarning';
        // Append the warning in modal body
        curModal.querySelector('.modal-body').appendChild(element);
    }).catch((error) => {
        screenErr(error);
    });
});


// message send
document.getElementById('messagePhotoUploadContainer').addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent default form submission
    // Get the current channel ID from the input
    const message = document.getElementById('messageInput').value;
    const image = document.getElementById('photoInput').files[0];
    // Clear the form fields after submission
    document.getElementById('messageInput').value = '';
    if (document.getElementById('photoInput').value) {
        document.getElementById('photoInput').value = '';
    }

    const channelId = globalChannelID;
    const url = `message/${channelId}`;
    const data = { message, image };
    apiCall(url, data, globalToken, 'POST')
    .then((data) => {
        // Handle the success response here
        console.log('message', data);
        // display channels
        processMessages(globalUserId, channelId, globalToken);
    }).catch((error) => {
        screenErr(error);
    });

});

// Additional Event Listeners for enabling/disabling the Send button
document.getElementById('messageInput').addEventListener('input', () => {
    const message = document.getElementById('messageInput').value;
    document.getElementById('messageSendBtn').disabled = !message.trim();
    // only space message is not allowed
});

document.getElementById('photoInput').addEventListener('change', () => {
    const hasPhoto = !!document.getElementById('photoInput').files.length;
    document.getElementById('messageSendBtn').disabled = !hasPhoto;
});
