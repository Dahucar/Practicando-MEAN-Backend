const app = require('./app');
const { mongoose } = require('./database');

app.listen(app.get('puerto'), () => {
    console.log('>> SERVIDOR OK <<');
});