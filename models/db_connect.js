exports = mongoose = require('mongoose');
mongoose.connect(process.env.MONGOHQ_URL);
exports = Schema = mongoose.Schema;
