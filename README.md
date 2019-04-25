# ZeroMessenger
An app that improves Facebook Zero's messaging functionality. (0.facebook.com/messages) \[WIP\]

I believe I've overcome the main difficulties (mostly technicalities). Still, it is messy and incomplete... I may finish this thing some time in the unforeseeable future.

With a few edits, it should work fine with any headless browser (something like *Puppeteer* or *PhantomJS*) in order to use it in different environments (desktop, mobile, or whatever).

## Things I Hate About Facebook Zero
*These are the things I tried to solve.*

- [x] **Refreshing**: You need to manually refresh the page to get new content: new messages, new threads, active contacts, etc.
- [x] **Status**: if you stop refreshing the page, your status becomes `inactive`.
- [x] **Emoji** and emoticons are replaces by text: for example `:p` becomes `tongue emoticon`.
- [x] **Resend**: On poor connections, messages get lost when errors occur.
- [x] **Multimedia**: No images, videos, audios, no nothing! *\[incomplete\]*
- [ ] **Messages requests** are not indicated, you need to manually click on `View Message Requests` to check whether any exists.
- [ ] **RTL**: doesn't handle right-to-left scripts (like Arabic) and "mixed directions".
- Other stuff: 'stickers' suffer like 'emoji' but that's fine, nobody really uses them anymore.
- ~~**Emoticons** cannot be sent from desktop.~~ Chrome now supports them.

## Screenshot
Instead of something like this:
![A screenshot of two tabs showing Facebook Zero](docs/screenshots/screenshot_Messenger.png)

How about this:
![A screenshot of the app](docs/screenshots/screenshot_2018-10-10_pixelated.png)
(*Screenshot: 2018-10-10, Google Chrome v69, Windows 10 Pro x64*)

## Installation
Google Chrome doesn't allow extensions off its store. You'll have to do this:

- Download this repo (as zip or `git clone` it)
- Go to `chrome://extensions`
- Activate "developer mode"
- Drag and drop the downloaded folder to install it

Each time you reopen Google Chrome, it will ask you to disable the extension, just reject that message.

## How Does It Works?
[Check this drafty post](docs/blog-post.md)

Basically, it consists of three `Promise`-based parts: Messenger, Master and Worker (and "Broker"):

- **Messenger** (`/app`): A typical instant messaging interface. It interacts directly with the user,
and updates its datastore when the user does something or **Master** receives new data.

- **Master** (`/src`'s classes): Creates new `Worker`s (hidden `iframe`) and sends them orders... and finally kills them when they lose their *raison d'être*.

- **Worker** (`/src/ZeroWorker`): Once loaded it listens for Master's orders and obeys them (and may send Master a response).

- **Broker** (`/src/ZeroBroker` *WIP*): My original idea. A bot that turns binary into text (base64), sends them to *Moi*, where they get turned back into binary: images and stuff... Currently, Zerofy is used to do it "manually".

### Assumptions
- User doesn't change the active account (important for not mixing conversations and stuff)
- User doesn't delete messages manually (important for fetching and ordering messages)
- Usernames won't change while using the App (important for caching)
- The language used by the active user is English (important for parsing information)
- User doesn't send the same messages more than once (important for error recovery -- "auto-resend")
- Not important: "0" won't be sent or received.

## TODO
Check `docs/ideas.js` and `.txt`.

## License
CC0
