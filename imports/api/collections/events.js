import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

// Create a collection where users can only modify documents that
// they own. Ownership is tracked by an 'owner' field on each
// document. All documents must be owned by the user that created
// them and ownership can't be changed. Only a document's owner
// is allowed to delete it, and the 'locked' attribute can be
// set on a document to prevent its accidental deletion.
Events = new Mongo.Collection("Events");
Events.allow({
  insert: function (userId, doc) {
    // the user must be logged in, and the document must be owned by the user
    return (userId && doc.owner === userId);
  },
  update: function (userId, doc, fields, modifier) {
    // can only change your own documents
    return doc.owner === userId;
  },
  remove: function (userId, doc) {
    // can only remove your own documents
    return doc.owner === userId;
  },
  fetch: ['owner']
});
Events.deny({
  update: function (userId, doc, fields, modifier) {
    // can't change owners
    return _.contains(fields, 'owner');
  },
  remove: function (userId, doc) {
    // can't remove locked documents
    return doc.locked;
  },
  fetch: ['locked'] // no need to fetch 'owner'
});
