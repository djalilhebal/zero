/*
## Coding style
- DOM variables start with `$`

new Date(1537438470653).toISOString()
*/

class ZeroMedia {
  constructor() {
    this.id = 'chat-id+timestamp';
    this.parts = Array(partsCount).fill(null)
    this.mime = 'image/jpg'
  }
  
}

function parseGroupChatInfo() {
  const $nameInput = document.querySelector("form input[name=thread_name]")
  const groupName = $nameInput.value
  const participants = []
  const participantsCount = null // in case some of participants are deactivated
  return {groupName, participants, participantsCount}
}
