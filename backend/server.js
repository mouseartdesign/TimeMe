require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRouter = require('./routers/userRouter');
const authRouter = require('./routers/authRouter');
const timetableRouter = require('./routers/timetableRouter');


const app = express();

app.use(cors({
  origin: "https://yourfrontend.vercel.app"
}));
app.use(express.json()); // Parses incoming JSON requests

//routers
app.use('/api/auth/', authRouter)
app.use('/api/',userRouter)
app.use('/api/timetables/', timetableRouter)

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});