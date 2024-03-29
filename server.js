const express = require('express');
const { spawn } = require('child_process');
const app = express();
const port = process.env.PORT || 3001;

app.get('/get-response', (req, res) => {
    const userInput = req.query.input;
    console.log(userInput);

    if (!userInput) {
        return res.status(400).send('Input query parameter is required');
    }
    let dataToSend = '';
    const pythonProcess = spawn('python', ['model.py']);

    pythonProcess.stdin.write(userInput + "\n");
    pythonProcess.stdin.end();

    pythonProcess.stdout.on('data', (data) => {
        dataToSend += data.toString();
    });
    console.log(dataToSend);
    pythonProcess.on('close', (code) => {
        // Filter out unwanted lines
        const filteredOutput = dataToSend.split('\n').filter(line => {
            // Adjust the condition if there are other patterns you wish to exclude
            return !line.includes('[==============================]');
        }).join('\n');
        res.send(filteredOutput);
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
        res.status(500).send('Error executing model');
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
