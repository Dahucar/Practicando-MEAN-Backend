const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
mongoose.connect('mongodb://localhost/foro-mean', { useNewUrlParser: true, useUnifiedTopology: true})
.then(() => {
    console.log('>> DB CONECTADA <<');
}).catch(() => {
    console.log('>> DB ERROR <<');
});

module.exports = mongoose;