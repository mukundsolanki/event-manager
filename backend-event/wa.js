const { Storage } = require("@google-cloud/storage");
const qr = require('qr-image');
const { Readable } = require('readable-stream')
const storage = new Storage({
    projectId: "newpro-403509",
    keyFilename: ".\\cloudBucket.json",
});

const uploadToFirebaseStorage = async (data, fileName) => {
    try {
        // Generate QR code buffer
        const qrBuffer = qr.imageSync(data, { type: 'png' });

        // Create a readable stream from the buffer
        const stream = new Readable();
        stream.push(qrBuffer);
        stream.push(null); // Indicates the end of the stream

        const gcs = storage.bucket("stellarqr");
        const storagePath = `storage_folder/${fileName}`;

        const file = gcs.file(storagePath);

        // Create a write stream to Firebase Storage
        const writeStream = file.createWriteStream({
            predefinedAcl: 'publicRead', // Set the file to be publicly readable
            metadata: {
                contentType: 'image/png', // Adjust the content type as needed
            }
        });

        // Pipe the readable stream to the write stream
        stream.pipe(writeStream);

        // Return a promise that resolves when the upload is complete
        await new Promise((resolve, reject) => {
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });
    } catch (error) {
        console.log(error);
        throw new Error(error.message);
    }
}
async function runQR(data, fileName) {
    let result = await uploadToFirebaseStorage(data, fileName);
    return result;
}
runQR("data", "name");