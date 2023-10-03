import { filterAndFormatSubtitles } from './subsFormatter.js';
import { saveItemToCollection, searchSubtitles, isVideoInCollection } from './dbManager.js';
import express from 'express';
import { exec } from 'child_process';
import path from 'path';
import cors from 'cors';
import axios from 'axios';
import fs from 'fs';

const app = express();
const port = 3001;

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const ytDlpPath = path.join(__dirname, '/yt-dlp');

app.use(express.json());
app.use(cors());


app.get('/api/fetchVideoInfoAndSubs', async (req, res) => {
  var videoId = req.query.video;

  const command = `cd ${ytDlpPath.substring(1)} \
    && yt-dlp --skip-download --get-title --get-id --get-thumbnail --encoding utf-8 --extractor-args "youtube:lang=fr" https://youtube.com/watch?v=${videoId} \
    && yt-dlp --skip-download --write-auto-subs --sub-format best --convert-subs srt --sub-lang fr -o "${videoId}" https://youtube.com/watch?v=${videoId} \
    && rm -f ${ytDlpPath}/*.vtt`;

  exec(command, async (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing command: ${error}`);
      res.status(500).json({ error: 'Command execution failed' });
      return;
    }

    // Split the output into lines
    const lines = stdout.trim().split('\n');

    // Extract video title, ID, and thumbnail
    const title = lines[0].trim();
    const videoId = lines[1].trim();
    const thumbnailUrl = lines[2].trim();

    console.log('Video Title:', title);
    console.log('Video ID:', videoId);
    console.log('Thumbnail URL:', thumbnailUrl);

    const subs = await filterAndFormatSubtitles(videoId + '.fr.srt');
    console.log(subs.length, 'subtitle items.');

    await saveItemToCollection('subtitles', {
      videoId: videoId,
      videoTitle: title,
      thumbnailUrl: thumbnailUrl,
      captions: subs
    })

    // Delete the .srt file
    fs.unlink(`./yt-dlp/${videoId}.fr.srt`, (err) => {
      if (err) 
        console.error(`Error deleting file: ${err}`);
    });

    res.json(stdout)
  });
});


app.get('/api/fetchMatchingCaptions', async (req, res) => {
  var search = req.query.search;

  searchSubtitles(search)
  .then((result) => {
    console.log('Matching subtitles:', result);
    res.json(result)
  })
  .catch((error) => {
    console.error('Error:', error);
  });
});


app.get('/api/updateCaptionsDbRecords', async (req, res) => {
  try {
    const playlistId = 'PLBeZasrZ8WgFWEaZADycG4SqaVynvM4ty';
    const apiKey = 'AIzaSyDH9VUGvrOw3iXNS_N-OQgFn01EWMPz8gI';

    const response = await axios.get(`https://www.googleapis.com/youtube/v3/playlistItems`, {
      params: {
        part: 'snippet',
        maxResults: 3,
        playlistId: playlistId,
        key: apiKey,
      },
    });

    const data = response.data;
    const playlistVideos = data.items.map(item => ({
      videoId: item.snippet.resourceId.videoId,
      videoTitle: item.snippet.title,
    }));

    var addedCounter = 0;
    // Use Promise.all to wait for all fetchVideoInfoAndSubs requests to complete
    await Promise.all(playlistVideos.map(async (video) => {
      if (!(await isVideoInCollection(video.videoId, 'subtitles'))) {
        await axios.get(`http://localhost:3001/api/fetchVideoInfoAndSubs?video=${video.videoId}`);
        addedCounter++;
      }
    }));

    res.json(`Added ${addedCounter} videos to the db.`); // Send the playlist videos as a JSON response
    console.log(`Added ${addedCounter} videos to the db.`);
  } catch (error) {
    console.error('Error fetching playlist videos:', error);
    res.status(500).json({ error: 'Error fetching playlist videos' });
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});