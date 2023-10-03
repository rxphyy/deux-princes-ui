import axios from 'axios';
import './App.css';
//import 'react-tooltip/dist/react-tooltip.css'
import React, { useState } from 'react';
import { Tooltip } from 'react-tooltip'


function App() {
  const [videos, setVideos] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchMatchingEpisodes = async (e) => {
    e.preventDefault();
    setLoading(true);
    setVideos([])

    try {
      await axios.get('http://localhost:3001/api/fetchMatchingCaptions', {
        params: {
          'search': userInput,
        }
      }).then((res) => {
        setVideos(res.data);
        setLoading(false);
      })
    } catch (error) {
      console.error(`Error fetching captions for ${e.target.value}:`, error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <p className='pageTitle'>DEUX PRINCES</p>

        <p className='pageSubTitle'>« Te rappelles-tu quand Thomas a dit...? »</p>
        <p className='pageSubTitle2'>« C'est dans quel épisode que Phil parle de...? »</p>

        <form onSubmit={fetchMatchingEpisodes} disabled={loading}>
          <div className='formContainer'>
            <div className='box input_field'>
              <i id='icon' class="fa-solid fa-magnifying-glass"></i>
              <input className='input_field_inner' value={userInput} onChange={(e) => setUserInput(e.target.value)} type='text' placeholder={''}></input>
            </div>

            <div className='input_box'>
              <input className='box input_btn' type='submit' value={'Chercher'}></input>
            </div>


            <div className='infobox'>
              <p
                data-tooltip-id="my-tooltip" 
                data-tooltip-content="Entrez un sujet et retrouvez tous les moments de Deux Princes où il est mentionné.">
                <i id='infoIcon' class="fa-regular fa-circle-question"></i>
              </p>
              <Tooltip className='tesst' id="my-tooltip" variant='light' />
            </div>

          </div>
        </form>

        {loading ? 
        <>
        <div class="loader"></div>
        </> : 
          <div className='videosContainer'>
            {videos.length > 0 ? videos.map((video) => (
              <div className='videoItemBox'>
                <a className='videoItemLink' target="_blank" rel="noopener noreferrer" href={`https://youtube.com/watch?v=${video.videoId}`}>
                  <img className='videoItemImg' src={video.thumbnailUrl} alt={video.videotitle} />
                </a>
                <h3 className='videoItemTitleLbl'>« {video.videoTitle.substring(15)} »</h3>
                
                <div className='timestampList'>
                {video.captions.map((caption, index) => (
                  <>
                    <a className='timestampHref' target="_blank" rel="noopener noreferrer" href={`https://youtube.com/watch?v=${video.videoId}&t=${caption.startTime.split(':').reduce((acc, time) => acc * 60 + parseInt(time), 0)}`}>
                      <div key={index} className='timestampItem'>
                        <div className="timestampTitle">
                          {caption.text.split(new RegExp(userInput, 'i')).map((part, partIndex) => (
                            <React.Fragment key={partIndex}>
                              {partIndex > 0 && (
                                <span className='timestampHighlighted'>{userInput}</span>
                              )}
                              {part}
                            </React.Fragment>
                          ))}
                        </div>
                        <div className="timestampTime">{caption.startTime.split(',')[0]}</div>
                        <i id='timestampIcon' class="fa-solid fa-arrow-up-right-from-square"></i>
                      </div>
                    </a>
                  </>
                ))}
                </div>
              </div>
            )) : <></>}
          </div>
        }
        <div className='footer'>
          <a className='footerInfo' href='https://github.com/rxphyy?tab=repositories'>Fait par Raphaël Marier</a>
        </div>
      </header>
    </div>
  );
}

export default App;
