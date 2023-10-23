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