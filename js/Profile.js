/*
Profile {
  id: number
  username: string
  fullname: string
  _pageDate: number
  _type: string 'profile'
}
*/
class Profile {
  constructor(obj) {
    obj && obj._type === 'profile' && Object.assign(this, obj);
  }
  
  update(obj) { // `obj` can come from `profile` or `chat` or `threads`
    if (obj._pageDate > this._pageDate) {
      this._pageDate = obj._pageDate;
      this.isOnline = obj.isOnline;
      if (obj.username) this.username = obj.username;
      // TODO update other props maybe?
    }
  }
  
}
