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
}

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
}

export function screenErr(message) {
    const errorModalContainer = document.getElementById('errorModal');
    const errorModalInstance = new bootstrap.Modal(errorModalContainer);

    const modalMsg = errorModalContainer.querySelector('.modal-body');
    const paragraph = document.createElement('p');
    paragraph.innerText = message;
    modalMsg.appendChild(paragraph);

    errorModalInstance.show();
}

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
}


export function displayChannels(channelList, userId) {
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
        if (channel.private && !channel.members.includes(globalUserId)) {
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
        channelDiv.appendChild(channelButton);
        channelDiv.appendChild(infoButton);
    });
}




export function addChannel2List(channelName, isPrivate){
    const channelList = isPrivate ? document.querySelector('.privateChannels') : document.querySelector('.publicChannels');

}