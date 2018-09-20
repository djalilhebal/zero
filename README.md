# Zero++
A Chrome extension that improves Facebook Zero's messaging functionality.

With a few edits, it should work fine with any headless browser (like *PhantomJS*), in order to use it in different environments (desktop, mobile, idk)

This shit is messy and totally incomplete: I am *Kaito the Prokrastinato~* after all... but I believe I've overcome the main difficulties (mostly technicalities). I will continue this thing some time in the future. (IT'S SCHOOL: GOTTA STOP MESSING AROUND)

## Things I Hate About Facebook Zero
- **Updating**: You need to manually refresh the page to get new content.
- **Status**: if you stop refreshing the page, your status becomes `inactive`.
- **Messages requests** are not indicated, you need to manually click on `View Message Requests` to check whether any exists.
- **Emoticons** and emoji and stickers are replaces by text: for example `:p` becomes `tongue emoticon`
- **Resend**: On poor connections, messages get lost when errors occur.
- **Media**: No images, videos, audios, no thing!
- **RTL**: doesn't handle right-to-left scripts (like Arabic) and "mixed directions"

*These are the things I tried to solve.*

## How it works
Basically, it consists of three `Promise`-based parts: Messenger, Master and Worker:

- **Messenger** Should be a typical instant messaging interface. It interacts with the user,
and updates its datastore when the user does something or Master receives new data.

- **Master** (and `ZeroAPI`) creates new `Worker`s (hidden pages -- `iframe`s actually) and gives them orders... and kills them when they lose their *raison d'être*.

- **Worker** once loaded it listens for Master's orders and obeys them (and may send Master a response).

### Assumptions
The same message is not repeated successively:

`[A B C] [C D E]` becomes `[A B C D E]`

Supposing a message C is a multi-line:

`[A, B, C1-C2-C3] [C3 D]` becomes `[A B C1-C2-C3 D]`


## ZeroAPI
These functions are implemented in the `Worker`, but only some in the `Master`:
- [x] sendText(id, text)
- [x] getChat(id)
- [x] ~~getFullChat(id)~~ getConversation(id)
- [ ] getThreads()
- [ ] getProfile(id)
- [ ] getGroupChatInfo()
- [ ] isLoggedIn()
- [ ] isError()
- [ ] and others...

## To Do/Learn
- Parametrized events + deleting event listeners (that have the same 'signature')
- Mimic Facebook's API as close as possible
- Profile.lastActiveDate + lastActiveText
- Rename stuff: chat -> conversation; ZeroChat -> chunk

## License
CC0
