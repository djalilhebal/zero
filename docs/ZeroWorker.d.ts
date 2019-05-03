// Objects that are returned from ZeroWorker are of these forms:

interface ZeroResponse {
  // These are added by the ZeroWorker.onOrder()/addMetadata() methods.
  _pageLink?: string // Used to get chats' `id`s or 'send_success' status, and threads' `pageNum`
  _pageDate?: number // important for keeping ZeroMessenger's data up-to-date
}

interface ZeroError extends ZeroResponse {
  error: any
}

interface ZeroMessage extends ZeroResponse {
  text: string
  senderName: string
  senderLink: string
  deleteLink: string
  footer: string
}

interface ChatChunk extends ZeroResponse {
  name: string
  messages: Array<ZeroMessage>
  statusText: string
  hasGreenDot: boolean
  hasComposer: boolean
  hasSelector: boolean
  groupInfoLink: string
  olderLink: string
  newerLink: string
  deleteLink?: string // Link to delete the whole conversation
}

interface ZeroThread extends ZeroResponse {
  name: string
  link: string
  snippet: string
  footer: string
  hasGreenDot: boolean
  isUnread: boolean
  unreadCount: string
  index: number
}

interface ThreadsChunk extends ZeroResponse {
  threads: Array<ZeroThread>
  linkToOlder: string
  linkToNewer: string
}
 
interface ZeroBuddylist extends ZeroResponse {
  contacts: Array<{
      name: string
      threadLink: string
      hasGreenDot: boolean
    }>
  seeMoreLink?: string // @todo
}

interface ZeroProfile extends ZeroResponse {
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
  activityLogLink?: string // @todo Use this instead of myId
}
