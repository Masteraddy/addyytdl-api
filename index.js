// server.js

const express = require('express');
const yts = require('yt-search');
const ytdl = require('ytdl-core');
// const youtubedl = require('youtube-dl');
const app = express();
const cors = require('cors');

app.use(cors());

// make all the files in 'public' available
app.use(express.static('public'));

// function playlist(id, q, res) {
//   // Optional arguments passed to youtube-dl.
//   // [`--format=${q || 'best'}`],
//   let url = `http://www.youtube.com/watch?v=${id}`;
//   const video = youtubedl(url, [`--format=${q || 'best'}`]);

//   video.on('error', function error(err) {
//     console.log('error 2:', err);
//   });

//   let size = 0;
//   video.on('info', function (info) {
//     let mbSize = Math.round(info.size / (1024 * 1024));
//     // res.header(
//     //   'Content-Disposition',
//     //   `attachment; filename="${info.title}-${mbSize}mb.mp4"`,
//     // );

//     res.header(`Content-Description: File Download`);
//     res.header(`Content-Transfer-Encoding: binary`);
//     res.header(`Content-Length: ${info.size}`);
//     res.header(`Cache-Control: must-revalidate, post-check=0, pre-check=0`);
//     res.header(`Pragma: no-cache`);
//     res.header(`Content-type: video/${info.ext}`);
//     // res.header(
//     //   `Content-disposition: attachment; filename="${info.title}-${mbSize}mb.mp4`,
//     // );
//     // console.log(info.size);
//     size = info.size;
//     // let output = path.join(__dirname + '/', size + '.mp4');
//     // video.pipe(fs.createWriteStream(output));
//   });

//   let pos = 0;
//   video.on('data', function data(chunk) {
//     pos += chunk.length;
//     // `size` should not be 0 here.
//     if (size) {
//       let percent = ((pos / size) * 100).toFixed(2);
//       process.stdout.cursorTo(0);
//       process.stdout.clearLine(1);
//       process.stdout.write(percent + '%');
//     }
//   });

//   video.pipe(res);
//   video.on('next', playlist);
// }

async function playNow(id, q, res) {
  let URL = `http://www.youtube.com/watch?v=${id}`;
  let info = await ytdl.getInfo(id);
  let format = ytdl.chooseFormat(info.formats, { quality: q || 'highest' });
  //   let mbSize = Math.round(info.size / (1024 * 1024));
  res.header(`Content-Description: File Download`);
  res.header(`Content-Transfer-Encoding: binary`);
  // res.header(`Content-Length: ${info.size}`);
  res.header(`Cache-Control: must-revalidate, post-check=0, pre-check=0`);
  res.header(`Pragma: no-cache`);
  res.header(`Content-type: video/${format.container}`);
  res.header(
    'Content-Disposition',
    `attachment; filename="${info.videoDetails.title}.${format.container}"`,
  );

  //   res.json({ info });
  ytdl(URL, { quality: q || 'highest' }).pipe(res);
}

async function formatGen(id) {
  let info = [];
  let tempReqs = [];
  info = await ytdl.getInfo(id);
  info.formats.forEach((obj) => {
    var singleObj = Object.keys(obj).reduce((object, key) => {
      if (key === 'qualityLabel' || key === 'itag' || key === 'container') {
        object[key] = obj[key];
      }
      return object;
    }, {});
    tempReqs = [...tempReqs, singleObj];
  });
  if (info.formats.length >= 12) {
    tempReqs.length = 12;
  }
  return tempReqs;
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// send the default array of dreams to the webpage
app.get('/video', (req, res) => {
  const { s, l } = req.query;
  yts(s || 'ReactJs', async (err, dt) => {
    let data = [];
    if (err) {
      res.status(500).json({ success: false });
    }
    data = await dt.videos;

    data.length = l || 12;
    res.json({ success: true, result: data });
  });
});

app.get('/getformat/:id', async (req, res) => {
  let { id } = req.params;
  //   console.log(id);
  let data = await formatGen(id);
  res.json({ success: true, result: data });
});

app.get('/download', (req, res) => {
  const { id, q } = req.query;
  if (!id) {
    res
      .status(500)
      .json({ success: false, message: 'Please provide video id' });
  }
  //   console.log(id, q);
  try {
    // playlist(id, q, res);
    playNow(id, q, res);
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Unable to download', error });
  }

  //   res.json({ success: true, message: 'Video is downloading..' });
});

// listen for requests :)
const listener = app.listen(process.env.PORT || 3030, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
