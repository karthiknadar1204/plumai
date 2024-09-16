import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const PORT = 8003;
const app = express();

app.use(cors({
    origin: 'http://localhost:3000', 
}));

app.use(express.json());
app.use('/public', express.static('public'));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage }).single('file');

const encodeImage = (imagePath) => {
    const image = fs.readFileSync(imagePath);
    return Buffer.from(image).toString('base64');
};

app.post('/upload', (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(500).json({ error: 'File upload failed', details: err.message });
        }
        const filePath = path.join(__dirname, 'uploads', req.file.filename);
        console.log('Framework:', req.body.framework);
        console.log('CSS Type:', req.body.cssType);
        console.log('Additional Input:', req.body.additionalInput);
        console.log('File:', req.file);

        try {
            const base64Image = encodeImage(filePath);

            const headers = {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
            };

            const payload = {
                "model": "gpt-4o-mini",
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": `Generate code in ${req.body.framework} for the given layout along with the css using ${req.body.cssType}. Return the code in JSX format, ready to be used in a React component. Include both the JSX and CSS in your response. Make sure the generated code for the component is responsive for all the devices and screen sizes. Additional instructions: ${req.body.additionalInput}.`
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": `data:image/jpeg;base64,${base64Image}`
                                }
                            }
                        ]
                    }
                ],
                "max_tokens": 4096
            };

            const response = await axios.post("https://api.openai.com/v1/chat/completions", payload, { headers: headers });
            
            console.log(response.data.choices[0]);

            const generatedContent = response.data.choices[0].message.content;
            const jsxMatch = generatedContent.match(/```jsx\n([\s\S]*?)```/);
            const cssMatch = generatedContent.match(/```css\n([\s\S]*?)```/);

            let cleanJsx = '';
            let cleanCss = '';

            if (jsxMatch && jsxMatch[1]) {
                cleanJsx = jsxMatch[1].replace(/\+|\n/g, '');
            }

            if (cssMatch && cssMatch[1]) {
                cleanCss = cssMatch[1].replace(/\+|\n/g, '');
            }

            res.status(200).json({ 
                message: 'File uploaded successfully', 
                filePath: `/uploads/${req.file.filename}`, 
                generatedCode: {
                    jsx: cleanJsx,
                    css: cleanCss
                }
            });
        } catch (error) {
            console.error('Error processing image:', error);
            if (error.response && error.response.status === 403) {
                res.status(403).json({ error: 'Error processing image', details: 'Request failed with status code 403. Please check your API key and permissions.' });
            } else {
                res.status(500).json({ error: 'Error processing image', details: error.message });
            }
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});