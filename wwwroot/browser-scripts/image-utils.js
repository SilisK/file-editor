window.compressAndConvertImageToBase64FromInput = () => {
    return new Promise(async (resolve, reject) => {
        const input = document.getElementById("file-upload");
        const file = input.files[0];
        if (!file) {
            reject("No file selected");
            return;
        }

        let blobToUse = file;

        // Check if HEIC and convert
        if (file.type === "image/heic" || file.name.endsWith(".heic")) {
            try {
                const convertedBlob = await heic2any({
                    blob: file,
                    toType: "image/jpeg",
                    quality: 0.8
                });
                blobToUse = convertedBlob;
            } catch (err) {
                reject("HEIC conversion failed: " + err);
                return;
            }
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const MAX_WIDTH = 800;
                const scaleSize = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scaleSize;

                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                let conversionType = "image/jpeg";
                if (file.type.includes("png")) conversionType = "image/png";
                const compressedDataUrl = canvas.toDataURL(conversionType, 0.9);
                resolve(compressedDataUrl);
            };
            img.onerror = (e) => reject("Image load failed");
            img.src = event.target.result;
        };

        reader.onerror = (e) => reject("File reading failed");
        reader.readAsDataURL(blobToUse);
    });
};
