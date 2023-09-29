import logo from './logo.svg';
import axios from 'axios';
import './App.css';
import { useEffect, useState } from 'react';
/* global gapi */

function App() {
  const [videos, setVideos] = useState([]);
  const [captions, setCaptions] = useState({});

  const fetchCaptions = async (videoId) => {
    try {
      const response = await axios.get('https://www.googleapis.com/youtube/v3/captions', {
        params: {
          key: 'AIzaSyDH9VUGvrOw3iXNS_N-OQgFn01EWMPz8gI',
          videoId: videoId,
          part: 'snippet',
        },
      });
      
      // Store captions in the state
      setCaptions((prevCaptions) => ({
        ...prevCaptions,
        [videoId]: response.data.items,
      }));

      const transcript = response.data.items[0]?.snippet?.title || 'Transcript not available';
      console.log(transcript);
    } catch (error) {
      console.error(`Error fetching captions for video ${videoId}:`, error);
    }
  };

  const trouverDeuxPrinces = (e) => {
    e.preventDefault();
    console.log("Hello world!");

    axios
      .get('https://www.googleapis.com/youtube/v3/playlistItems', {
        params: {
          key: 'AIzaSyDH9VUGvrOw3iXNS_N-OQgFn01EWMPz8gI',
          playlistId: 'PLBeZasrZ8WgFWEaZADycG4SqaVynvM4ty',
          part: 'snippet',
          maxResults: 1000
        },
      })
      .then((response) => {
        setVideos(response.data.items);
        // Fetch captions for each video
        response.data.items.forEach((video) => {
          fetchCaptions(video.snippet.resourceId.videoId);
        });
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <form onSubmit={trouverDeuxPrinces}>
          <input type='submit' value={'Trouver touts les Deux Princes'}></input>
        </form>
        {videos.map((video) => (
          <li key={video.id.videoId}>
            <img src={video.snippet.thumbnails.maxres.url} alt={video.snippet.title} />
            <p>{video.snippet.title}</p>
            <a target="_blank" rel="noopener noreferrer" href={`https://www.youtube.com/watch?v=${video.snippet.resourceId.videoId}`}>Voir la vid</a>
          </li>
        ))}

      </header>
    </div>
  );
}

export default App;
