import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Factory } from 'meteor/dburles:factory';

const Notifications = new Mongo.Collection('Notifications');

Notifications.allow({
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
Notifications.deny({
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

const ownerSchema = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  }
});

Notifications.schema = new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  thing: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
  },
  event: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
  },
  owner: {
    type: ownerSchema,
  },
  type: { type: String, optional: true },
  timestamp: { type: Date },
  notification: { type: String },
  read: { type: Boolean },
});

Notifications.attachSchema(Notifications.schema);

Factory.define('Notifications', Notifications, {
  etl_insert_time: new Date(),
  secureType: 'private',
});
export default Notifications;


