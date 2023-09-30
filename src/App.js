import axios from 'axios';
import './App.css';
import { useState } from 'react';

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
          lang: 'fr'
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
          maxResults: 1
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
        <p className='pageTitle'>DEUX PRINCES</p>

        <p className='pageSubTitle'>« Te rappelles-tu quand Thomas a dit...? »</p>
        <p className='pageSubTitle2'>« C'est dans quel épisode que Phil parle de...? »</p>

        <form onSubmit={trouverDeuxPrinces}>
          <div className='formContainer'>
            <div className='box input_field'>
              <i id='icon' class="fa-solid fa-magnifying-glass"></i>
              <input className='input_field_inner' type='text' placeholder={''}></input>
            </div>

            <div className='input_box'>
              <input className='box input_btn' type='submit' value={'Chercher'}></input>
            </div>
          </div>
        </form>

        <div>
          {videos.map((video) => (
            <div>
              <h3>{video.snippet.title}</h3>
              <a target="_blank" rel="noopener noreferrer" href={`https://www.youtube.com/watch?v=${video.snippet.resourceId.videoId}`}>Voir la vid</a>
              <img src={video.snippet.thumbnails.maxres.url} alt={video.snippet.title} />
            </div>
          ))}
        </div>
      </header>
    </div>
  );
}

export default App;
