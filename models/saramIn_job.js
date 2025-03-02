const { model, Schema } = require('mongoose');

const saramIn_jobSchema = new Schema({
    company: {
        type: String,
        required: true,
    },
    jobTitle: {
        type: String,
        required: true,
    },
    frequentWord: [{
        type: String,
    }],
});

module.exports = model('saramIn_job', saramIn_jobSchema);