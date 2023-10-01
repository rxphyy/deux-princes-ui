import axios from 'axios';
import './App.css';
import { useState } from 'react';


function App() {
  const [videos, setVideos] = useState([]);
  const [captions, setCaptions] = useState({});

  const [videoUrl, setVideoUrl] = useState('https://www.youtube.com/watch?v=b1Lbhlb8290');
  const [downloadedSubtitles, setDownloadedSubtitles] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDownload = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:3001/api/download-subtitles', {
        videoUrl,
      });

      setDownloadedSubtitles(response.data.output);
      console.log(downloadedSubtitles);
    } catch (err) {
      setError('An error occurred while downloading subtitles.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

  const fetchAllEpisodes = (e) => {
    e.preventDefault();

    axios
      .get('https://www.googleapis.com/youtube/v3/playlistItems', {
        params: {
          key: 'AIzaSyDH9VUGvrOw3iXNS_N-OQgFn01EWMPz8gI',
          playlistId: 'PLBeZasrZ8WgFWEaZADycG4SqaVynvM4ty',
          part: 'snippet',
          maxResults: 3
        },
      })
      .then((response) => {
        setVideos(response.data.items);
        // Fetch captions for each video
        /*
        response.data.items.forEach((video) => {
          fetchCaptions(video.snippet.resourceId.videoId);
        });
        */
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

        <form onSubmit={fetchAllEpisodes} disabled={loading}>
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

        <div className='videosContainer'>
          {videos.map((video) => (
            <div className='videoItemBox'>
              <img className='videoItemImg' src={video.snippet.thumbnails.maxres.url} alt={video.snippet.title} />
              <h3>« {video.snippet.title.substring(15)} »</h3>
              <a className='videoItemLink' target="_blank" rel="noopener noreferrer" href={`https://www.youtube.com/watch?v=${video.snippet.resourceId.videoId}`}>
                <i class="fa-solid fa-arrow-up-right-from-square"></i>
              </a>
            </div>
          ))}
        </div>
      </header>
    </div>
  );
}

export default App;
