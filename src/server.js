const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());

app.post('/api/download-subtitles', (req, res) => {
  //const { videoUrl } = req.body;
  const  videoUrl  = 'https://www.youtube.com/watch?v=b1Lbhlb8290';

  // Specify the path to the yt-dlp.exe folder
  const ytDlpPath = path.join(__dirname, '/yt-dlp');

  // Define the command to change directory and run yt-dlp
  const command = `cd ${ytDlpPath} && yt-dlp --skip-download --write-auto-subs --sub-format best --convert-subs srt ${videoUrl}`;

  console.log(command);
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing command: ${error}`);
      res.status(500).json({ error: 'Command execution failed' });
      return;
    }

    console.log(`Command output:\n${stdout}`);
    console.error(`Command errors:\n${stderr}`);

    res.json({ output: stdout, error: stderr });
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
