import { useState } from 'react';
import './App.css';
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [image, setImage] = useState(null);
  const [uploadResultMessage, setUploadResultMessage] = useState('Please upload an image to authenticate');
  const [visitorName, setVisitorName] = useState('placeholder.jpeg');
  const [isAuth, setIsAuth] = useState(false);

  function sendImage(e) {
    e.preventDefault();

    // Check if an image is uploaded
    if (!image) {
      setUploadResultMessage('Please upload an image first.');
      setIsAuth(false);
      return; // Stop further execution
    }

    setVisitorName(image.name);
    const visitorImageName = uuidv4();
    fetch(`https://lk2kxxh0nb.execute-api.us-east-1.amazonaws.com/dev/visitors-images964/${visitorImageName}.jpeg`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'image/jpeg'
      },
      body: image
    }).then(async () => {
      const response = await authenticate(visitorImageName);
      if (response.Message === 'Success') {
        setIsAuth(true);
        setUploadResultMessage(`Hi ${response['firstName']} ${response['lastName']}, Welcome to work. Hope you have a productive day!`);
      } else {
        setIsAuth(false);
        setUploadResultMessage('Authentication failed. This person is not an employee.');
      }
    }).catch(error => {
      setIsAuth(false);
      setUploadResultMessage('There is an error during the authentication process. Please try again.');
      console.error(error);
    });
  }

  async function authenticate(visitorImageName) {
    const requestUrl = 'https://lk2kxxh0nb.execute-api.us-east-1.amazonaws.com/dev/employee?' + new URLSearchParams({
      objectKey: `${visitorImageName}.jpeg`
    });
    return await fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).then(response => response.json())
      .then((data) => {
        return data;
      }).catch(error => console.error(error));
  }

  return (
    <div className="App">
      <h1>Serverless Image Processing System</h1>

      <form onSubmit={sendImage}>
        <input type="file" name="image" onChange={e => setImage(e.target.files[0])} />
        <button type="submit">Authenticate</button>
      </form>
      <div className={isAuth ? 'success' : 'failure'}>{uploadResultMessage}</div>
      <img src={image ? URL.createObjectURL(image) : require(`./visitors/${visitorName}`)} alt="visitor" height={250} width={250} />
    </div>
  );
}

export default App;