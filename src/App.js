import axios from 'axios';
import './App.css';
import React, { useState } from 'react';
import { Tooltip } from 'react-tooltip'


function App() {
  const [videos, setVideos] = useState([]);
  // Initialize the expanded state for each video
  const [expanded, setExpanded] = useState({});
  const [userInput, setUserInput] = useState('');
  const [highlightedQuery, setHighlightedQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchMatchingEpisodes = async (e) => {
    if (userInput === '') {
      setErrorMsg('Veuillez remplir le champs.')
      return;
    }
    setErrorMsg('')
    e.preventDefault();
    setLoading(true);
    setVideos([])

    try {
      await axios.get('https://testtest-5uol.onrender.com/api/fetchMatchingCaptions', {
        params: {
          'search': userInput,
        }
      }).then((res) => {
        if (res.data.length > 0 ) {
          setVideos(res.data);
          setHighlightedQuery(userInput);
          setLoading(false);
        } else {
          setVideos([]);
          setHighlightedQuery('');
          setLoading(false);
          setErrorMsg('Aucun épisode trouvé.')
        }
      })
    } catch (error) {
      console.error(`Error fetching captions for ${e.target.value}:`, error);
    }
  };

  return (
    <div className="App">
        <p className='pageTitle'>DEUX PRINCES</p>

        <p className='pageSubTitle'>« Te rappelles-tu quand Thomas a dit...? »</p>
        <p className='pageSubTitle2'>« C'est dans quel épisode que Phil parle de...? »</p>

        <form onSubmit={fetchMatchingEpisodes} disabled={loading}>
          <div className='formContainer'>
            <div className='box input_field'>
              <i id='icon' className="fa-solid fa-magnifying-glass"></i>
              <input required className='input_field_inner' value={userInput} onChange={(e) => setUserInput(e.target.value)} type='text' placeholder={''}></input>
            </div>

            <div className='subContainer'>
              <div className='input_box'>
                <input required className='box input_btn' type='submit' value={'Chercher'}></input>
              </div>

              <div className='infobox'>
                <p
                  data-tooltip-id="my-tooltip" 
                  data-tooltip-content="Entrez un sujet et retrouvez tous les moments de Deux Princes où il est mentionné.">
                  <i id='infoIcon' className="fa-regular fa-circle-question"></i>
                </p>
                <Tooltip className='tesst' id="my-tooltip" variant='light' />
              </div>
            </div>
          </div>
          <p className='errorMsg'>{errorMsg}</p>
        </form>

        {loading ? 
        <>
        <div className="loader"></div>
        </> : 
          <div className='videosContainer'>
            {videos.length > 0 ? videos.map((video, videoIndex) => (
              <div className='videoItemBox' key={videoIndex}>
                <a className='videoItemLink' target="_blank" rel="noopener noreferrer" href={`https://youtube.com/watch?v=${video.videoId}`}>
                  <img className='videoItemImg' src={video.thumbnailUrl} alt={video.videotitle} />
                </a>
                <h3 className='videoItemTitleLbl'>« {video.videoTitle.substring(15)} »</h3>
                
                <div className='timestampList'>
                {video.captions.slice(0, expanded[videoIndex] ? video.captions.length : 5).map((caption, index) => (
                  <a key={index} className='timestampHref' target="_blank" rel="noopener noreferrer" href={`https://youtube.com/watch?v=${video.videoId}&t=${caption.startTime.split(':').reduce((acc, time) => acc * 60 + parseInt(time), 0)}`}>
                    <div className='timestampItem'>
                      <div className="timestampTitle">
                        {caption.text.split(new RegExp(highlightedQuery, 'i')).map((part, partIndex) => (
                          <React.Fragment key={partIndex}>
                            {partIndex > 0 && (
                              <span className='timestampHighlighted'>{highlightedQuery}</span>
                            )}
                            {part}
                          </React.Fragment>
                        ))}
                      </div>
                      <div className="timestampTime">{caption.startTime.split(',')[0]}</div>
                      <i id='timestampIcon' className="fa-solid fa-arrow-up-right-from-square"></i>
                    </div>
                  </a>
                ))}

                {video.captions.length > 5 && (
                  <p className='viewMoreLessRow' onClick={() => setExpanded({ ...expanded, [videoIndex]: !expanded[videoIndex] })}>
                    {expanded[videoIndex] ? `Voir moins d'items` : `Voir ${video.captions.length - 5} autres items`}
                  </p>
                )}
                </div>
              </div>
            )) : <></>}
          </div>
        }
    </div>
  );
}

export default App;