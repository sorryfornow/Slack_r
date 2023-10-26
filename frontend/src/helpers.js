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
    // clear modal-body
    while (errorModalContainer.firstChild) {
        errorModalContainer.removeChild(errorModalContainer.firstChild);
    }
    // add new message
    const modalMsg = errorModalContainer.querySelector('.modal-body');
    const paragraph = document.createElement('p');
    paragraph.textContent = message;
    modalMsg.appendChild(paragraph);

    errorModalInstance.show();
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

        // Apply different styles for private and public channels
        if (channel.private) {
            channelButton.classList.add('btn-outline-warning');
            privateChannelsDiv.appendChild(channelDiv);
        } else {
            channelButton.classList.add('btn-outline-secondary');
            publicChannelsDiv.appendChild(channelDiv);
        }

        const infoButton = document.createElement('button');
        infoButton.classList.add('btn', 'btn-outline-info', 'btn-sm', 'ms-2', 'channelInfoBtn');
        infoButton.textContent = '...';
        infoButton.id = channel.id;
        const currentButton = document.getElementById(channel.id);

        currentButton.addEventListener('click', (event) => {
            event.preventDefault();
            // get current channel id
            const channelId = event.target.id;
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
                // enable buttons of channel info events
                // edit
                document.getElementById('editChannelBtn').addEventListener('click', function() {
                    // Get current channel information
                    // if button is in the currentButton = document.getElementById(channel.id);
                    
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

                // Event listener for join Channel button
                document.getElementById('joinChannelBtn').addEventListener('click', function(event) {
                    event.preventDefault(); // Prevent default form submission
                    const url = `channel/${channelId}/join`;
                    apiCall(url, null, globalToken, 'POST')
                    .then((data) => {
                        console.log('joinChannel success');
                        // disable the join button and show a success message in div
                        document.getElementById('joinChannelBtn').disabled = true;
                        document.getElementById('joinChannelBtn').textContent = 'Joined';
                        // new a message div
                        const joinText = document.createElement('div');
                        joinText.classList.add('text-success');
                        joinText.textContent = 'You have joined this channel';
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
        });
};