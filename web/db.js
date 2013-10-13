var url = require('./config').mongodb.url,
  mongoose = require('mongoose');

var meetingSchema = new Schema({
  title: 'string',
  participants: [new Schema({
    type: String,
    rate: Number,
    count: Number 
  })]
});

var meetingLogSchema = new Schema({
  startTime: Date,
  stopTime: Date,
  totalTime: Number,
  cost: Number,
  tags: [String],
  participants: [new Schema({
    type: String,
    rate: Number,
    count: Number,
    totalCost: Number
  })]
});

mongoose.connect(url);
var Meetings = mongoose.model('meetings', meetingSchema);
var MeetingsLog = mongoose.model('meetingsLog', meetingLogSchema);

// create the repositories
exports = module.exports = _.extend(this, {
  meetings: Meetings,
  meetingslog: MeetingsLog
});
