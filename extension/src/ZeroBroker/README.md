# ZeroBroker
A Facebook chat bot. This may be a Heroku app.

## Commands
### ZeroBroker::info
Returns ZeroBroker's info: version and maybe Heroku stats: remaining bandwidth for example.

### ZeroBroker::fetch::url
- `fetch`s data from the given URL and `base64`fies it (result = *ZeroFile*).
- Sends the *ZeroFile* to my inbox as individual text messages ("ZeroMedia ...").

Check `Zerofy.html`

### ZeroBroker::send::threadId ZeroFile...
- Collect the ZeroFile parts (save them in mediaDB)
- Convert the ZeroFile to a real file (*Stream/Buffer*) then it as attachment to `threadId`.
- Send a text to my inbox of the form: `ZeroBroker::associate::ZeroFile.id=sentMessage.id`
- Delete the zeroFile from the db.
