const express = require("express");
const app = express();
const port = process.env.PORT || 3001;

app.get("/", (req, res) => res.type('html').send(html));

const server = app.listen(port, () => console.log(`App listening on port ${port}!`));

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;

const html = `
<!DOCTYPE html>
<html>
  <head>
    <title>Hello from Render!</title>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js"></script>
    <script>
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          disableForReducedMotion: true
        });
      }, 500);
    </script>
    <style>
      @import url("https://p.typekit.net/p.css?s=1&k=vnd5zic&ht=tk&f=39475.39476.39477.39478.39479.39480.39481.39482&a=18673890&app=typekit&e=css");
      @font-face {
        font-family: "neo-sans";
        src: url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff2"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("opentype");
        font-style: normal;
        font-weight: 700;
      }
      html {
        font-family: neo-sans;
        font-weight: 700;
        font-size: calc(62rem / 16);
      }
      body {
        background: white;
      }
      section {
        border-radius: 1em;
        padding: 1em;
        position: absolute;
        top: 50%;
        left: 50%;
        margin-right: -50%;
        transform: translate(-50%, -50%);
      }
    </style>
  </head>
  <body>
    <section>
      Hello from Render!
    </section>
  </body>
</html>
`


import { filterAndFormatSubtitles } from './subsFormatter.js';
import { saveItemToCollection, searchSubtitles, isVideoInCollection } from './dbManager.js';
import express from 'express';
import { exec } from 'child_process';
import path from 'path';
import cors from 'cors';
import axios from 'axios';
import fs from 'fs';

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const ytDlpPath = path.join(__dirname, '/yt-dlp');

function hello() {
  console.log('Hello');
}

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

    const lines = stdout.trim().split('\n');

    const title = lines[0].trim();
    const videoId = lines[1].trim();
    const thumbnailUrl = lines[2].trim();

    console.log(`Fetching data for episode '${title}'...`);

    const subs = await filterAndFormatSubtitles(videoId + '.fr.srt');
    console.log(`Found ${subs.length} subtitle items.`);

    await saveItemToCollection('subtitles', {
      videoId: videoId,
      videoTitle: title,
      thumbnailUrl: thumbnailUrl,
      captions: subs
    })

    console.log(`Added '${title}' to the database.`);

    // Delete the .srt file
    fs.unlink(`./yt-dlp/${videoId}.fr.srt`, (err) => {
      if (err) 
        console.error(`Error deleting file: ${err}`);
    });

    console.log(`Finished fetching episode data.`);
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
  console.log('Updating database records...');
  try {
    const playlistId = 'PLBeZasrZ8WgFWEaZADycG4SqaVynvM4ty';
    const apiKey = process.env.YOUTUBE_API_KEY;
    let nextPageToken = '';

    setTimeout(() => {}, 1000);

    do {
      const response = await axios.get(`https://www.googleapis.com/youtube/v3/playlistItems`, {
        params: {
          part: 'snippet',
          maxResults: 100,
          playlistId: playlistId,
          key: apiKey,
          pageToken: nextPageToken
        },
      });

      const data = response.data;
      const playlistVideos = data.items.map(item => ({
        videoId: item.snippet.resourceId.videoId,
        videoTitle: item.snippet.title,
      }));

      await Promise.all(playlistVideos.map(async (video) => {
        if (!(await isVideoInCollection(video.videoId, 'subtitles'))) {
          await axios.get(`http://localhost:3001/api/fetchVideoInfoAndSubs?video=${video.videoId}`);
        }
      }));

      // Set the nextPageToken for the next iteration
      nextPageToken = data.nextPageToken;
    } while (nextPageToken);

    res.json(`Added videos to the db.`);
    console.log(`Added videos to the db.`);
  } catch (error) {
    console.error('Error fetching playlist videos:', error);
    res.status(500).json({ error: 'Error fetching playlist videos' });
  }
});


app.get('/api/check', async (req, res) => {
  res.json(`It's a new day`)
});



app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});

export { hello }