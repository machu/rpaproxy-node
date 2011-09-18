require('./db_connect');

/*
var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;
 */

var ProxySchema = new Schema({
  name: String,
  endpoint: { type: String, required: true },
  locales: { type: Array, required: true, index: true },
  success: { type: Number, default: 0 },
  failure: { type: Number, default: 0 },
  valid: Boolean
});

var exports = module.exports = mongoose.model('Proxy', ProxySchema);
