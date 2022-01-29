User.findByUsername = function(username) {
    return new Promise(function(resolve, reject) {
      if (typeof(username) != "string") {
        reject()
        return
      }
      userCollection.findOne({username: username}).then(function(userDoc) {
        if (userDoc) {
          userDoc = new User(userDoc, true)
          userDoc = {
            _id: userDoc.data._id,
            username: userDoc.data.username,
            avatar: userDoc.avatar
          }
          resolve(userDoc)
        } 
        else {
          reject()
        }
      }).catch(function() {
        reject()
      })
    })
  }

