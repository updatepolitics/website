Meteor.publish('hubs', function () {
  hubs = Meteor.wrapAsync(function (cb) {
    Meteor.setTimeout(function () {
      cb(null, Hubs.find({}, {
        limit: 10
      }));
    }, 1000);
  })();

  return hubs;
});

Meteor.publish('hub', function (_id) {
  check(_id, String);
  return Hubs.find({
    _id: _id
  });
});
