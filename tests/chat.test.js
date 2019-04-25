// load stuff...
const Chat = Conversation; // just an alias

assert.test('Should handle empty conversations', async (t) => {
  // I have never messaged @zuck (fbid = 4), this is our chat obj:
  const expected = {
    isNewConversation: true,
    hasComposer: true,
    messages: []
  }
  const actual = await Chat.getConversation('4')
  t.ok(goodEnough(actual, expected))
})
