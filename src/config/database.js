const mongoose = require('mongoose');

const connectDB = async () => {
    await mongoose.connect(
        "mongodb+srv://vikashpalani:HVnAuvhBoDdp5TjD@namastenode.d7obd.mongodb.net/Linkr"
    );
};

module.exports = connectDB;
