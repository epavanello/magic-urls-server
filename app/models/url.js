import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const UrlSchema = new Schema({
  address: {
    type: String,
    required: true,
    validate: {
      validator(url) {
        let u = require('url');
        return !!u.parse(url).hostname;
      },
      message: '{VALUE} is not a valid url.',
    },
  },
  alias: {
    type: String,
    unique: true,
  },
  // media: { type: Schema.Types.ObjectId, ref: 'Media' },
  // likes : [{ type: Schema.Types.ObjectId, ref: 'Like' }],
  // comments : [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  // flags : [{ type: Schema.Types.ObjectId, ref: 'Flag' }]
  _user: { type: Schema.Types.ObjectId, ref: 'User' },
}, {
    timestamps: true,
  });

// Strip out password field when sending user object to client
UrlSchema.set('toJSON', {
  virtuals: true,
  transform(doc, obj) {
    obj.id = obj._id;
    delete obj._id;
    delete obj.__v;
    return obj;
  },
});

const UrlModel = mongoose.model('Url', UrlSchema);

export default UrlModel;
