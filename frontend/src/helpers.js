/**
 * Given a js file object representing a jpg or png image, such as one taken
 * from a html file input element, return a promise which resolves to the file
 * data as a data url.
 * More info:
 *   https://developer.mozilla.org/en-US/docs/Web/API/File
 *   https://developer.mozilla.org/en-US/docs/Web/API/FileReader
 *   https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
 * 
 * Example Usage:
 *   const file = document.querySelector('input[type="file"]').files[0];
 *   console.log(fileToDataUrl(file));
 * @param {File} file The file to be read.
 * @return {Promise<string>} Promise which resolves to the file as a data url.
 */
import { BACKEND_PORT } from './config.js';

export let globalChannelID = null;
let currentStartIndex = 0;  // index for scroll

export function fileToDataUrl(file) {
    const validFileTypes = [ 'image/jpeg', 'image/png', 'image/jpg' ]
    const valid = validFileTypes.find(type => type === file.type);
    // Bad data, let's walk away.
    if (!valid) {
        throw Error('provided file is not a png, jpg or jpeg image.');
    }
    
    const reader = new FileReader();
    const dataUrlPromise = new Promise((resolve,reject) => {
        reader.onerror = reject;
        reader.onload = () => resolve(reader.result);
    });
    reader.readAsDataURL(file);
    return dataUrlPromise;
};

export const apiCall = (path, inputData = null, token = null, method = 'POST') => {
    return new Promise((resolve, reject) => {
        let headers = {'Content-type': 'application/json'};
        if (token) headers['Authorization'] = `Bearer ${token}`;
        let body = inputData ? JSON.stringify(inputData) : null;
        
        fetch(`http://localhost:${BACKEND_PORT}/` + path, {
            method: method,
            headers: headers,
            body: body
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                reject(data.error);
            } else {
                resolve(data);
            }
        });
    });
};

export function screenErr(message) {
    const errorModalContainer = document.getElementById('errorModal');
    const errorModalInstance = new bootstrap.Modal(errorModalContainer);
    // add new message
    const modalBody = errorModalContainer.querySelector('.modal-body');
    // Clear modal-body content
    if (modalBody) {
        while (modalBody.firstChild) {
            modalBody.removeChild(modalBody.firstChild);
        }
        // Add new message
        const paragraph = document.createElement('p');
        paragraph.textContent = message; // Ensure 'message' is defined and holds the error message
        modalBody.appendChild(paragraph);
        errorModalInstance.show();
    } else {
        console.error('Error modal body not found');
    }
};


export function getAllChannels(curToken) {
    const url = `channel`;
    return apiCall(url, null, curToken, 'GET')
        .then((data) => {
            // Handle the success response here
            console.log('getChannelInfo', data);
            return data;
        })
        .catch((error) => {
            // Handle the error response here
            screenErr(error);
        });
};


// messssssssaaaaaaaaaaaaaage

// message generator
// create div for each message
function messageBoxCreator(curUserId, message, channelId, curToken) {
    // Main message box container
    console.log('messageId', message.id);
    const messageBox = document.createElement('div');
    messageBox.classList.add('card', 'mb-3', 'message-box');
    messageBox.id = `message${message.id}+${channelId}`;
    console.log('messageBoxId', messageBox.id);
    // Card body
    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');

    // User info and pin section
    const userInfoAndPin = document.createElement('div');
    userInfoAndPin.classList.add('d-flex', 'justify-content-between', 'align-items-center');
    userInfoAndPin.id = 'userInfoAndPin';

    // User Info
    const userInfo = document.createElement('div');
    userInfo.classList.add('user-info', 'd-flex', 'align-items-center');

    // User Name
    const userNameButton = document.createElement('button');
    userNameButton.classList.add('btn', 'ml-2', 'textUser');
    userNameButton.setAttribute('type', 'button');
    userNameButton.setAttribute('data-user-id', message.sender);
    // TODO: add event listener for user name button

    const senderId = message.sender;
    if (senderId == curUserId) {
        document.getElementById('editUserInfoBtn').disabled = false;
        // TODO: edit message and delete message
        // add Btn for edit and delete message
        const editMsgBtn = document.createElement('button');
        editMsgBtn.classList.add('btn', 'btn-sm', 'btn-outline-primary', 'editMsgBtn');
        editMsgBtn.setAttribute('type', 'button');
        editMsgBtn.textContent = 'Edit';
        editMsgBtn.id = 'edit'+message.id;
        // append editMsgBtn to div
        cardBody.appendChild(editMsgBtn);

        const deleteMsgBtn = document.createElement('button');
        deleteMsgBtn.classList.add('btn', 'btn-sm', 'btn-outline-danger', 'deleteMsgBtn');
        deleteMsgBtn.setAttribute('type', 'button');
        deleteMsgBtn.textContent = 'Delete';
        deleteMsgBtn.id = 'delete'+message.id;
        // append deleteMsgBtn to div
        cardBody.appendChild(deleteMsgBtn);
        // Event listener for editmessagebutton
        // edit message
        deleteMsgBtn.addEventListener('click', (event) => {
            const url_delete = `message/${channelId}/${message.id}`;
            apiCall(url_delete, null, curToken, 'DELETE')
            .then((data) => {
            }).then(() => {
                // get current channel messages again
                processMessages(curUserId, channelId, curToken);
            }).catch((error) => {
                screenErr(error);
            })
        });

        editMsgBtn.addEventListener('click', (event) => {
            event.preventDefault();
            document.getElementById('messageTextEdit').textContent = message.message;
            // if warning div exist
            const warningDivEdit = document.getElementById('warningDivEdit');
            if (warningDivEdit) {
                warningDivEdit.remove();
            }
            // show the modal
            const editMessageModal = new bootstrap.Modal(document.getElementById('editMessageModal'));
            editMessageModal.show();

            // Event listener for edit message button in editMessageModal
            const messageChangeBtn = document.getElementById('messageChangeBtn');
            messageChangeBtn.addEventListener('click', (event) => {
                event.preventDefault();
                const messageText = document.getElementById('messageTextEdit').value;
                const messageImageInput = document.getElementById('messageImageEdit');
                let imageFile = null;

                // Check if a new image was uploaded
                if (messageImageInput.files && messageImageInput.files[0]) {
                    imageFile = messageImageInput.files[0];
                }
                if (messageText == '' && imageFile == null) {
                    const newWarningDivEdit = document.createElement('div');
                    newWarningDivEdit.classList.add('alert', 'alert-warning');
                    newWarningDivEdit.textContent = 'Please enter the changed message!';
                    newWarningDivEdit.id = 'warningDivEdit';
                    document.getElementById('editMessageModal').appendChild(newWarningDivEdit);
                    return;
                }
                // send request to backend
                const url_edit = `message/${channelId}/${message.id}`;

                let messageData = { message: messageText, image: imageFile };
                if (imageFile == null) {
                    messageData = { message: messageText };
                } else if (messageText == '') {
                    messageData = { image: imageFile };
                }
                
                apiCall(url_edit, messageData, curToken, 'PUT')
                .then((data) => {
                    // Handle the success response here
                    console.log('editMessage', data);
                    // change pin icon
                    // get current channel messages again
                    processMessages(curUserId, channelId, curToken);
                }).catch((error) => {
                    screenErr(error);
                });

            });
        });
    } else {
        // disable editUserInfoBtn
        document.getElementById('editUserInfoBtn').disabled = true;
    }

    console.log('senderId', senderId);
    getUserInfo(senderId, curToken).then(usrInfo => {
        // Check if usrInfo is not null
        if (usrInfo) {
            userNameButton.textContent = usrInfo.name;
        } else {
            // Handle the case where usrInfo is null (error occurred)
            userNameButton.textContent = "Unknown User";
        }
    });

    userNameButton.addEventListener('click', (event) => {
        event.preventDefault();
        getUserInfo(senderId, curToken).then((usrInfo) => {
            document.getElementById('userModalName').textContent = usrInfo.name;
            document.getElementById('userModalEmail').textContent = usrInfo.email;
            document.getElementById('userModalBio').textContent = usrInfo.bio;
            document.getElementById('userModalImage').src = usrInfo.image;
            // show the modal
            const userModal = new bootstrap.Modal(document.getElementById('userInfoModal'));
            userModal.show();
        });
    });

    // Timestamp
    const timeStamp = document.createElement('small');
    timeStamp.classList.add('text-muted');
    timeStamp.textContent = new Date(message.sentAt).toLocaleString();

    // Append user info
    userInfo.appendChild(userNameButton);
    userInfo.appendChild(timeStamp);
    userInfoAndPin.appendChild(userInfo);

    // Pin Button
    const pinButton = document.createElement('button');
    if (message.pinned) {
        pinButton.classList.add('btn', 'btn-sm', 'btn-outline-success', 'pinBtn');
    } else {
        pinButton.classList.add('btn', 'btn-sm', 'btn-outline-secondary', 'pinBtn');
    }
    pinButton.setAttribute('type', 'button');
    const pinIcon = document.createElement('i');
    pinIcon.classList.add('bi', 'bi-pin-fill');
    pinButton.appendChild(pinIcon);
    userInfoAndPin.appendChild(pinButton);
    pinButton.id = 'pin'+message.id;


    // Event listener for pin button
    pinButton.addEventListener('click', (event) => {
        event.preventDefault();
        // get current message id
        const curMessageId = event.target.id.slice(3);
        // pin message
        if (message.pinned == false) {
            const url = `message/pin/${channelId}/${curMessageId}`;
            apiCall(url, null, curToken, 'POST')
            .then((data) => {
                // Handle the success response here
                console.log('pinMessage', data);
                // change pin icon
                pinButton.classList.remove('btn-outline-secondary');
                pinButton.classList.add('btn-outline-success');
                // get current channel messages again
                processMessages(curUserId, channelId, curToken);

            }).catch((error) => {
                screenErr(error);
            });
        } else {
            const url = `message/unpin/${channelId}/${curMessageId}`;
            apiCall(url, null, curToken, 'POST')
            .then((data) => {
                // Handle the success response here
                console.log('unpinMessage', data);
                // change pin icon
                pinButton.classList.remove('btn-outline-success');
                pinButton.classList.add('btn-outline-secondary');
                processMessages(curUserId, channelId, curToken);
            }).catch((error) => {
                screenErr(error);
            });
        }
    });

    // Message Content
    const messageDetails = document.createElement('div');
    messageDetails.id = 'messageDetails';

    if (message.image) {
        // Image message
        const image = document.createElement('img');
        image.classList.add('img-thumbnail');
        image.setAttribute('src', message.image);
        image.setAttribute('data-toggle', 'modal');
        image.setAttribute('data-target', '#imageModal');
        messageDetails.appendChild(image);
    } else {
        // Text message
        const messageContent = document.createElement('div');
        messageContent.id = `message-content-${message.id}`;
        messageContent.classList.add('message-content-area', 'mt-2');
        messageContent.setAttribute('contenteditable', 'true');
        messageContent.textContent = message.message;
        messageDetails.appendChild(messageContent);
    }

    // Reactions Container
    const reactionsDiv = document.createElement('div');
    reactionsDiv.classList.add('reactions', 'mt-2');

    // Assuming we have a predefined list of reactions
    const reactions = ['❤️', '🔥', '👍'];
    reactions.forEach(react => {
        const button = document.createElement('button');
        button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
        button.setAttribute('type', 'button');
        button.id = react+'Btn';
        button.textContent = react + ' '; // Adding reaction emoji
        // TODO: backend increment reaction count
        
        const span = document.createElement('span');
        span.classList.add('reaction-count');
        span.textContent = '0'; // Default count, should be updated based on actual data
        button.appendChild(span);

        reactionsDiv.appendChild(button);
    });
    
    // Assembling the message box
    const messageViewingArea = document.querySelector('.messageViewingArea');
    cardBody.appendChild(userInfoAndPin);
    cardBody.appendChild(messageDetails);
    cardBody.appendChild(reactionsDiv);
    messageBox.appendChild(cardBody);
    return messageBox;
};

// fetch all messages of current channel
function fetchChannelMessages(channelId, startIdx, globalToken) {
    console.log('fetchChannelMessages', channelId, startIdx);
    return new Promise((resolve, reject) => {
        const url = `message/${channelId}?start=${startIdx}`;
        apiCall(url, null, globalToken, 'GET')
        .then((data) => {
            // Check if messages exist
            if (data.messages && data.messages.length > 0) {
                resolve(data.messages);
            } else {
                // Resolve with an empty array if no messages are found
                resolve([]);
            }
        })
        .catch((error) => {
            reject(error);
        });
    });
};

// fetch all messages of current channel
function displayMessages(curUserID, channelId, startIndex, globalToken, clearExisting = true) {
    const messageViewingArea = document.querySelector('.messageViewingArea');
    const pinnedMessageViewingArea = document.querySelector('.pinnedMessageViewingArea');
    if (clearExisting) {
        while (messageViewingArea.firstChild) {
            messageViewingArea.removeChild(messageViewingArea.firstChild);
        }
        while (pinnedMessageViewingArea.firstChild) {
            pinnedMessageViewingArea.removeChild(pinnedMessageViewingArea.firstChild);
        }
    }
    return fetchChannelMessages(channelId, startIndex, globalToken)
        .then((messages) => {
            // messages.sort((b, a) => a.sentAt - b.sentAt);
            messages.forEach(message => {
                // create div for each message
                let currentMessage = messageBoxCreator(curUserID, message, channelId, globalToken);
                const messageViewingArea = document.querySelector('.messageViewingArea');
                const pinnedMessageViewingArea = document.querySelector('.pinnedMessageViewingArea');

                // move the pinned message to the pinnedMessageViewingArea
                if (message.pinned){
                    // if pinnedMessageViewingArea contains current message, remove it
                    if (document.getElementById(`message${message.id}+${channelId}`)) {
                        document.getElementById(`message${message.id}+${channelId}`).remove();
                    }
                    if (pinnedMessageViewingArea.firstChild) {
                        pinnedMessageViewingArea.insertBefore(currentMessage, pinnedMessageViewingArea.firstChild);
                    }
                    else {
                        pinnedMessageViewingArea.appendChild(currentMessage);
                    }
                } else {
                    if (messageViewingArea.firstChild) {
                        // If there are, insert the new message box at the beginning
                        messageViewingArea.insertBefore(currentMessage, messageViewingArea.firstChild);
                    } else {
                        // If there are no messages, append the new message box as usual
                        messageViewingArea.appendChild(currentMessage);
                    }
                }
            });
            return messages.length;
        })
        .catch((error) => {
            console.error('Error loading messages:', error);
            screenErr(error);
        });
};


function showLoadingIndicator() {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loadingIndicator';
    loadingDiv.textContent = 'Loading more messages...'; // Or add a spinner here
    document.querySelector('.messageViewingArea').appendChild(loadingDiv);
};

function hideLoadingIndicator() {
    const loadingDiv = document.getElementById('loadingIndicator');
    if (loadingDiv) {
        loadingDiv.parentNode.removeChild(loadingDiv);
    }
};

function setupInfiniteScroll(curUserID, channelId, globalToken) {
    console.log('setup Infinite Scroll', channelId);
    let isLoading = false;

    window.onscroll = () => {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
            if (!isLoading) {
                isLoading = true;
                showLoadingIndicator();
                displayMessages(curUserID, channelId, currentStartIndex, globalToken, false)
                    .then((messageCount) => {
                        currentStartIndex += messageCount;
                        isLoading = false;
                        hideLoadingIndicator();
                    });
            }
        }
    };
};

export function processMessages(curUserID, channelId, globalToken) {
    console.log('process Messages', channelId);
    currentStartIndex = 0;
    displayMessages(curUserID, channelId, currentStartIndex, globalToken)
        .then(messageCount => {
            if (messageCount > 0) {
                setupInfiniteScroll(curUserID, channelId, globalToken);
            }
        });
};

// channel list generator
export function displayChannels(channelList, globalUserId, globalToken) {
    console.log(channelList);

    const privateChannelsDiv = document.querySelector('.privateChannels');
    const publicChannelsDiv = document.querySelector('.publicChannels');

    // Clear existing content
    while (privateChannelsDiv.firstChild) {
        privateChannelsDiv.removeChild(privateChannelsDiv.firstChild);
    }
    while (publicChannelsDiv.firstChild) {
        publicChannelsDiv.removeChild(publicChannelsDiv.firstChild);
    }

    channelList.channels.forEach((channel) => {
        // convert globalUserId to int
        let curUserID = parseInt(globalUserId);
        if (channel.private && !channel.members.includes(curUserID)) {
            return; // Skip this channel
        }

        const channelDiv = document.createElement('div');
        channelDiv.classList.add('channelBtn', 'd-flex', 'justify-content-between', 'align-items-center', 'mb-1');

        const channelButton = document.createElement('button');
        channelButton.classList.add('btn', 'btn-sm', 'flex-grow-1');
        channelButton.textContent = channel.name;
        channelButton.id = 'channel'+channel.id;

        // Apply different styles for private and public channels
        if (channel.private) {
            channelButton.classList.add('btn-outline-warning');
            privateChannelsDiv.appendChild(channelDiv);
        } else {
            channelButton.classList.add('btn-outline-secondary');
            publicChannelsDiv.appendChild(channelDiv);
        }

        // Event listener for channel button
        channelButton.addEventListener('click', (event) => {
            event.preventDefault();
            // get current channel id
            // show chat section
            document.querySelector('#chatBoard').classList.remove('hidden');
            
            // get current channel id
            const channelId = event.target.id.slice(7);
            globalChannelID = channelId;
            // show the message input area
            const messagePhotoUploadContainer = document.getElementById('messagePhotoUploadContainer');
            messagePhotoUploadContainer.classList.remove('hidden');
            // get messages of current channel
            console.log('start fetch msg:', channelId);
            processMessages(globalUserId, channelId, globalToken);
        });


        // get info of current channel
        const infoButton = document.createElement('button');
        infoButton.classList.add('btn', 'btn-outline-info', 'btn-sm', 'ms-2', 'channelInfoBtn');
        infoButton.textContent = '...';
        infoButton.id = 'info'+channel.id;
        // Event listener for channel info button
        // disable the former event listener
        infoButton.addEventListener('click', (event) => {
            event.preventDefault();
            // get current channel id
            const channelId = event.target.id.slice(4);
            globalChannelID = channelId;
            // get channel info
            const url = `channel/${channelId}`;
            apiCall(url, null, globalToken, 'GET')
            .then((data) => {
                // Handle the success response here
                console.log('getChannelInfo', data);
                // display channel info
                const channelInfo = data; 
                document.getElementById('channelInfoName').textContent = channelInfo.name;
                // Assuming these elements exist in your modal
                document.getElementById('channelDescriptionDetail').textContent = channelInfo.description;
                document.getElementById('channelType').textContent = channelInfo.private ? 'Private Channel' : 'Public Channel';
                
                const date = new Date(channelInfo.createdAt);
                // Format as 'YYYY-MM-DD HH:mm:ss'
                const formattedDate = date.getFullYear() + '-' +
                                    String(date.getMonth() + 1).padStart(2, '0') + '-' +
                                    String(date.getDate()).padStart(2, '0') + ' ' +
                                    String(date.getHours()).padStart(2, '0') + ':' +
                                    String(date.getMinutes()).padStart(2, '0') + ':' +
                                    String(date.getSeconds()).padStart(2, '0');
                document.getElementById('channelCreationTimestamp').textContent = 'Created on: ' + formattedDate;
                getUserInfo(channelInfo.creator, globalToken).then((usrInfo) => {
                    document.getElementById('channelCreator').textContent = 'Created by: ' +  usrInfo.name;
                });
                // enable buttons of channel info events
                document.getElementById('editChannelBtn').disabled = false;
                document.getElementById('leaveChannelBtn').disabled = false;
                document.getElementById('inviteChannelBtn').disabled = false;
                document.getElementById('leaveChannelBtn').textContent = 'Leave';   
            }).then(() => {
                // show the modal
                const channelInfoModal = new bootstrap.Modal(document.getElementById('channelInfoModal'));
                channelInfoModal.show();

            }).catch((error) => {
                // if error code is 400, show error message
                if (error.status == 400) {
                    screenErr(error.message);
                    return;
                }

                const joinModal = new bootstrap.Modal(document.getElementById('joinModal'));
                // refresh join modal
                document.getElementById('joinChannelBtn').disabled = false;
                document.getElementById('joinChannelBtn').textContent = 'Join';
                while(document.getElementById('joinText').firstChild) {
                    document.getElementById('joinText').removeChild(document.getElementById('joinText').firstChild);
                }
                joinModal.show();

                

            }); // end of Promise chain
            
        });

        channelDiv.appendChild(channelButton);
        channelDiv.appendChild(infoButton);
    });
};


export function getUserInfo(uid, curToken) {
    // convert uid to string
    const usrid = String(uid);
    const url = `user/${usrid}`;

    // Return the promise
    return apiCall(url, null, curToken, 'GET')
        .then((data) => {
            console.log('getUserInfo', data);
            return data; // Resolved value of the promise
        })
        .catch((error) => {
            screenErr(error);
            // Consider throwing an error or returning a default value
            return null;
        });
};