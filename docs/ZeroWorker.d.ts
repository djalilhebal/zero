// Objects that are returned from ZeroWorker are of these forms:

interface ZeroResponse {
  link: string // Used to get chats' `id`s or 'send_success' status, and threads' `pageNum`
  date: number // important for keeping ZeroMessenger's data up-to-date
}

interface ChatChunk extends ZeroResponse {
  name: string
  messages: Array<{
      text: string
      senderName: string
      senderLink: string
      deleteLink: string
      footer: string
    }>
  statusText: string
  hasGreenDot: boolean
  hasComposer: boolean
  isNewConversation: boolean
  groupInfoLink: string
  olderLink: string
  newerLink: string
  deleteLink?: string // Link to delete the whole conversation
}

interface ThreadsChunk extends ZeroResponse {
  threads: Array<{
      name: string
      link: string
      snippet: string
      footer: string
      hasGreenDot: string
      isUnread: string
      unreadCount: string
      index: number
    }>
  olderLink: string
  newerLink: string
}
 
interface Buddylist extends ZeroResponse {
  contacts: Array<{
      name: string
      threadLink: string
      hasGreenDot: boolean
    }>
}

interface Profile {
  name: string
  username: string
  messageLink: string
  isVerified: boolean
  // User
  hasGreenDot: boolean
  alternateName: string
  unfriendLink: string
  gender: string
  mobile?: string // remove it?
  // Page
  pageMoreLink: string
  fanLink: string
  // Moi
  myId: string
}
