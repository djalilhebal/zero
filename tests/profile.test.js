// import test from "path/to/zora"

/**
 * Does `obj` have all keys-values of `base`?
 * @param {Object} base
 * @param {Object} obj
 * @returns {boolean}
 */
function goodEnough(base, obj) {
  return Object.keys(base).every( key => base[key] === obj[key]);
}

test('Handling user profiles', async (assert) => {
  assert.test('Should handle my profile', async (t) => {
    const expected = {
      id: '100025327927909',
      username: '@dreamski21',
      name: 'Djalil Dreamski',
      alternativeName: 'Downshine',
      isMe: true,
      isVerified: false,
      isPage: false,
    }
    const output = await Moi.getInfo()
    t.ok(goodEnough(expected, output))
  })

  assert.test('Should handle verified male users', async (t) => {
    const expected = {
      id: '4',
      username: '@zuck',
      name: 'Mark Zuckerberg',
      gender: 'male',
      isMe: false,
      isPage: false,
      isVerified: true,
    }
    const output = await User.getInfo('4')
    t.ok(goodEnough(expected, output))
  })

  assert.test('Should handle verified female users', async (t) => {
    const expected = {
      id: '717545176',
      username: '@sheryl',
      name: 'Sheryl Sandberg',
      gender: 'female',
      isMe: false,
      isPage: false,
      isVerified: true,
    }
    const output = await User.getInfo('@sheryl')
    t.ok(goodEnough(expected, output))
  })
  
})

test('Handing pages', async (assert) => {
  assert.test('Should handle verified pages', async (t) => {
    const expected = {
      id: '104770457523',
      username: '@DreamWorksAnimation',
      name: 'DreamWorks Animation',
      isPage: true,
      isVerified: true,
    }
    const output = await Profile.getInfo('@DreamWorksAnimation')
    t.ok(goodEnough(expected, output))
  })

  assert.test('Should handle unverified pages', async (t) => {
    const expected = {
      id: '241806149201604',
      username: '@ProgrammersCreateLife',
      name: 'I am Programmer,I have no life.',
      isPage: true,
      isVerified: false,
    }
    const output = await Profile.getInfo('241806149201604')
    t.ok(goodEnough(expected, output))
  })
  
})
