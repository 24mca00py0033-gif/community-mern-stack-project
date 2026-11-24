import { useEffect, useState } from "react";
import Snowfall from "react-snowfall";

// Draws a simple five-petal flower as an image (petal color, center color)
const flowerImage = (petal, center) => {
  const petals = [0, 72, 144, 216, 288]
    .map((a) => `<ellipse cx="20" cy="9" rx="6.5" ry="9" fill="${petal}" transform="rotate(${a} 20 20)"/>`)
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">${petals}<circle cx="20" cy="20" r="5" fill="${center}"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const COLORS = [
  ["#ff8fa3", "#ffd166"],
  ["#ffb27a", "#fff3c4"],
  ["#c9b6ff", "#ffd166"],
  ["#ff6b9d", "#ffffff"],
  ["#ffd166", "#ff7a3d"],
];

// Flowers raining over the whole screen (login, sign-up and about pages).
// Uses the "react-snowfall" npm package with flower images instead of snowflakes.
export default function FlowerRain() {
  const [images, setImages] = useState([]);
  const [count, setCount] = useState(30);

  useEffect(() => {
    // respect people who turned animations off in their system settings
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    setCount(window.innerWidth < 640 ? 22 : 48); // fewer flowers on phones

    let alive = true;
    Promise.all(
      COLORS.map(
        ([petal, center]) =>
          new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
            img.src = flowerImage(petal, center);
          })
      )
    ).then((list) => alive && setImages(list.filter(Boolean)));

    return () => {
      alive = false;
    };
  }, []);

  if (images.length === 0) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-30">
      <Snowfall
        images={images}
        snowflakeCount={count}
        radius={[14, 26]}
        speed={[0.8, 2]}
        wind={[-0.5, 1.5]}
        rotationSpeed={[-1.5, 1.5]}
        style={{ position: "absolute", width: "100%", height: "100%" }}
      />
    </div>
  );
}
