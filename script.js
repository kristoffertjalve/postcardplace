const CHANNEL_SLUG = "postcard-place-the-collection";
const API_URL = `https://api.are.na/v2/channels/${CHANNEL_SLUG}?per=100`;

async function fetchAndDisplayImages() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    const blocks = data.contents;

    const imageBlocks = blocks.filter(
      (block) => block.class === "Image" && block.image?.display?.url
    );

    // Filter to landscape images only
    const landscapePromises = imageBlocks.map((block) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = block.image.display.url;
        img.onload = () => {
          if (img.naturalWidth > img.naturalHeight) {
            resolve(block);
          } else {
            resolve(null);
          }
        };
        img.onerror = () => resolve(null);
      });
    });

    const filteredImages = (await Promise.all(landscapePromises)).filter(Boolean);
    const shuffled = filteredImages.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 11); // 11 images, 1 info block = 12 total

    const grid = document.getElementById("grid");

    // ✅ Add the info block FIRST
    const info = document.createElement("div");
    info.className = "grid-item info-block";

    const defaultOverlay = document.createElement("div");
    defaultOverlay.className = "overlay overlay-default";
    defaultOverlay.innerText = "Info";

    const expandedOverlay = document.createElement("div");
    expandedOverlay.className = "overlay overlay-expanded";
    expandedOverlay.innerHTML = `
      <div style="max-width: 90%; font-size: 1rem;">
        <p>This is a <a href="https://www.are.na/kristoffer-tjalve/postcard-place-the-collection" target="_blank" style="color: white; text-decoration: underline;">collection</a> of postcards sent by <a href="https://cloudlord.management" target="_blank" style="color: white; text-decoration: underline;">Kristoffer</a> to Internet friends and strangers. Each postcard is handwritten, numbered, and sent from Kristoffer's current location. Refresh site to shuffle postcards or...</p>
        <p><a href="https://buy.stripe.com/4gMcN61FAbKxg8w6pl67S03" target="_blank" style="color: white; text-decoration: underline;">Buy a postcard</a></p>
      </div>
    `;

    info.appendChild(defaultOverlay);
    info.appendChild(expandedOverlay);

    info.addEventListener("click", (e) => {
      // Prevent click if the link is clicked
      if (e.target.tagName !== "A") {
        info.classList.toggle("clicked");
      }
    });

    grid.appendChild(info);

    // ✅ Add 11 image blocks
    selected.forEach((block) => {
      const container = document.createElement("div");
      container.className = "grid-item";
      container.style.backgroundImage = `url('${block.image.display.url}')`;

      const overlay = document.createElement("div");
      overlay.className = "overlay";
      overlay.innerText = block.title || "";

      container.addEventListener("click", () => {
        container.classList.toggle("clicked");
      });

      container.appendChild(overlay);
      grid.appendChild(container);
    });

  } catch (error) {
    console.error("Failed to load Are.na images:", error);
  }
}

fetchAndDisplayImages();
