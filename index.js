import express from 'express';
import dot from 'dotenv';

dot.config();

const app = express();
const port = process.env.PORT;

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
