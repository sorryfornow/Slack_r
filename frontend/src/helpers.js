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

export const apiCallPost = (path, data, callFn) => {
    fetch (`http://localhost:${BACKEND_PORT}/${path}`, {
        method : 'POST',
        body : JSON.stringify(body),
        headers : {
            'Content-Type' : 'application/json'
        },
    }).then((response) => response.json())
    .then((data) => {
        callFn(data);
    }
    ).catch((error) => {
        console.log(error);
    });
}

export const apiCallGet = (path, token, queryString, callFn) => {
    fetch (`http://localhost:${BACKEND_PORT}/${path}?${queryString}`, {
        method : 'GET',
        headers : {
            'Content-Type' : 'application/json',
            'Authorization' : `Bearer ${token}`
        },
    }).then((response) => response.json())
    .then((data) => {
        callFn(data);
        return data;
    }
    ).catch((error) => {
        console.log(error);
    });
}