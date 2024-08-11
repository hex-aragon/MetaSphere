require("dotenv").config(); // .env 파일의 환경 변수 로드
const express = require("express");
const cors = require("cors");
const ethers = require("ethers");
const contractABI = require("./contractABI.json");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const images = [
  {
    fileName: "vr360-1.jpg",
    link: "https://unsplash.com/ko/%EC%82%AC%EC%A7%84/%EB%82%98%EB%AC%B4-%EC%9C%84%EC%9D%98-%EC%98%A4%EB%A1%9C%EB%9D%BC-%EB%B3%B4%EB%A0%88%EC%95%8C%EB%A6%AC%EC%8A%A4-IuyhXAia8EA",
  },
  {
    fileName: "vr360-2.jpg",
    link: "https://www.freepik.com/free-photo/shot-panoramic-composition-living-room_40572742.htm",
  },
  {
    fileName: "vr360-3.jpg",
    link: "https://www.freepik.com/free-photo/aerial-drone-panorama-view-chisinau-moldova-sunrise_14203353.htm",
  },
  {
    fileName: "vr360-4.jpg",
    link: "https://www.freepik.com/free-photo/aerial-drone-panorama-view-nature-moldova-sunset-village-wide-fields-valleys_18511785.htm",
  },
  {
    fileName: "vr360-5.jpg",
    link: "https://kr.freepik.com/free-photo/aerial-drone-panorama-view-of-a-village-located-near-a-river-and-hills-fields-godrays-clouds-in-moldova_14202887.htm",
  },
  {
    fileName: "vr360-6.jpg",
    link: "https://kr.freepik.com/free-photo/aerial-drone-panoramic-view-of-vidraru-lake-in-romania_30704924.htm",
  },
  {
    fileName: "vr360-7.jpeg",
    link: "https://pixexid.com/image/healthcare-class-ilrgunih",
  },
  {
    fileName: "vr360-8.jpeg",
    link: "https://pixexid.com/image/a-cartoon-of-a-town-mhb7k7ux",
  },
  {
    fileName: "vr360-9.jpeg",
    link: "https://pixexid.com/image/a-group-of-people-in-a-circle-with-a-circle-in-the-middle-solqzky6",
  },
  {
    fileName: "vr360-10.jpeg",
    link: "https://pixexid.com/image/a-room-with-white-doors-vdvzcwir",
  },
  {
    fileName: "vr360-11.jpeg",
    link: "https://pixexid.com/image/a-marina-with-many-boats-hkoljplj",
  },
];

function createHTMLTemplate(imageFileName, imageLink) {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <title>360View - ${imageFileName}</title>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <script src="https://aframe.io/releases/1.0.4/aframe.min.js"></script>
    </head>
    <body>
      <a-scene>
        <a-assets>
          <img id="img" src="/images/${imageFileName}" />
        </a-assets>
        <a-sky id="img-360" radius="10" src="#img"></a-sky>
      </a-scene>
      <p>Image Source: <a href="${imageLink}" target="_blank">${imageLink}</a></p>
    </body>
  </html>
  `;
}

images.forEach((image, index) => {
  const htmlContent = createHTMLTemplate(image.fileName, image.link);
  fs.writeFileSync(
    path.join(__dirname, `public/image${index + 1}.html`),
    htmlContent
  );
});

app.use("/images", express.static(path.join(__dirname, "public/images")));

app.get("/image/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (id > 0 && id <= images.length) {
    res.sendFile(path.join(__dirname, `public/image${id}.html`));
  } else {
    res.status(404).send("Image not found");
  }
});

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const OPTIMISM_RPC_URL = process.env.OPTIMISM_RPC_URL;

const provider = new ethers.providers.JsonRpcProvider(OPTIMISM_RPC_URL);
const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);

app.get("/api/nfts", async (req, res) => {
  try {
    const totalSupplyBN = await contract.totalSupply();
    const totalSupply = totalSupplyBN.toNumber();
    const [tokenIds, uris, imgUris] = await contract.getAllTokens();
    const nfts = [];

    for (let i = 0; i < totalSupply; i++) {
      nfts.push({
        id: i,
        image: imgUris[i],
        vrWebUri: uris[i],
      });
    }

    res.send(nfts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/nft/:id", async (req, res) => {
  try {
    const tokenId = req.params.id;
    const metadata = await contract.metadata(tokenId);

    res.json({ id: tokenId, metadata });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
