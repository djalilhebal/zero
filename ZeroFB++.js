/** ZeroFB++ (2018-03-20) just an idea expressed in JS. It doesn't work.. yet */

/**
Facebook post (2018-03-19)
==========================

3afsa brk ktebtha bech n3ageb lwa9t fel bus~~~
#nerd #drama #easily_applicable_nonsense

Before I say anything, lemme ask you: Can you do it, @Wanis? Can you do it? Can you? Of course you can!
Will you do it, @Wanis? Will you do it? Will you? Of course not! You rich bastard >:(

Okay, listen up, Kaito has an awesomely pathetic/poor idea for this vacation:

Project Zero: "For Better"... or "0FB" for short >.<

It's basically a ("Cloud") bot that accesses my Facebook account and monitors my
incoming messages and downloads received pictures, and then, for each downloaded picture:

1) encodes it in BASE64 (kichghl "binary to text", Wikipedia it! ._.)
2) then splits the output to parts of length X
   (X is the maximum length of texts that Facebook allows)
3) and adds to some metadata (sender's id, date, part's number, etc)

4) Finally it sends those parts to my inbox... Something like this:

[[dreamski21 :: DATE :: 1-5 :: DATA]]
...
[[dreamski21 :: DATE :: 5-5 :: DATA]]

5) On the other end, another program (a Chrome extension probably)
  reads the parts,
  combines them,
  then displays the image with the included information (metadata)...
(Notice anything? Kinda similar to the TCP protocol~~~ wikipedia it >.<)

Aaaaand that's how Zero Facebook becomes a better shit ;-;

Oh, oh, also, I remember once you told me that you wanted to make an assistant-like app.
Well, why not do this and make it act like one?

"Zero, turn off the monitor"
"Zero, send me the profile picture of [id]"
"Zero, send the image in this post [url]"
"Zero, stalk [id]"

...Wait! Why just pics? Why not audio and video?

Oh fuck, let's think out of the box, boy: Why not make it act like a proxy?
A free/halal way to browse the Web using nothing but the shit Djezzy gives us!
Yup... You've guessed it: Kaito has no internet access anymore :/

*leaves the bus*

Kiddingo. Ain't no doing that because ain't no "lifeless nerd" >.<

*/


/** ZeroFB++ senderBot... possibly turn this to a Facebook Bot */

const messenger = require('facebook-messenger').login('myMail', 'myPass');

// METADATA TEMPLATE
const METADATA = 'Zero>> sender::time::img_id#part-parts::data';
const METADATA_LEN = 100;
const MESSAGE_LEN = 2 ** 14; // 16KB - limited by Facebook or idk
const MAX_CHARACTERS = MESSAGE_LEN - METADATA_LEN;

messenger.onmessage((msg) => {
  if (msg.type !== 'image') return;

  const encoded = Base64.encode(msg.content);
  const parts_len = Math.ceil(encoded.length / MAX_CHARACTERS);
  const meta = METADATA
      .replace('sender', msg.sender)
      .replace('time', msg.time.format('YYYYMMDDhhmm'))
      .replace('img_id', msg.id)
      .replace('parts', parts_len);

  for (let i = 0; i < parts_len; i++) {
    const start = i * MAX_CHARACTERS;
    const stop = (i + 1) * MAX_CHARACTERS;
    const part_data = encoded.slice(start, stop);
    const part_number = i + 1;
    const part = meta.replace('part', part_number).replace('data', part_data);
    parts.push(part);
  }
  parts.forEach(part => messenger.send(part, 'toMe'));
});


/** ZeroFB++ receiverBot... Chrome app/ext maybe? Inspired by the MVC arch. */

// OUTPUT TEMPLATE
// Check developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
const OUTPUT = `<div id="ID" class="zero">
        <img src="data:base64,DATA" />
        <br/>
        <b>SENDER</b> - <i>TIME</i>
        </div>`;

const model = {};

function updateModel() {
  const messages = $('.e.bu.bv span').map(x => x.innerText);

  messages.forEach((message) => {
    // 'Zero>> sender::time::img_id#part-parts::data'
    // 'Zero>> dreamski21::20180320::img_666_or_idk#1-5::GRE143DHGERHTE...ZzR'
    const rPart = /^Zero>> (\w+)::(\d+)::(\w+)#(\d+)-(\d+)::(.+)$/;
    const matched = message.match(rPart);
    if (matched) {
      // 'd' stands for the partial 'data'
      const [, sender, time, img_id, part, parts, d] = matched;

      if (typeof model[img_id] === 'undefined') {
        model[img_id] = { sender, time, data: new Array(Number(parts)) };
      }

      // do nothing if we have already obtained all parts
      if (typeof model[img_id].data === 'string') return;

      // save the partial data in index (part-1) because we count from 1, not 0
      model[img_id].data[part - 1] = d;

      // if we've obtained all pieces, combined them to form a string
      if (model[img_id].data.every(x => typeof x === 'string')) {
        model[img_id].data = model[img_id].data.join('');
      }
    } // if matched
  }); // forEach
}

function updateView() {
  const ids = Object.keys(model);
  ids.forEach((id) => {
    // if the img's data is complete
    if (typeof model[id].data === 'string') {
      // and if we haven't displayed it yet
      if (!document.getElementById(id)) {
        const x = OUTPUT
          .replace('ID', id)
          .replace('DATA', model[id].data)
          .replace('SENDER', model[id].sender)
          .replace('TIME', model[id].time);
        document.getElementById('output').append(x);
      }
    }
  });
}

function controller() {
  // scroll up and down to cover the period [the oldest to the most recent timestamp]
  scrollUp(); updateModel(); updateView();
  scrollDown(); updateModel(); updateView();
}

setInterval(controller, 5000); // *try* to update every 5 seconds
