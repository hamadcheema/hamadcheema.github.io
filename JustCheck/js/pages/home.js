import { listenToPosts } from "../database.js";
import { createPostCard } from "../components/post-card.js";

export function renderHomePage(root) {
  root.innerHTML = `<h2>Feed</h2><div id="feed"></div>`;
  const feed = root.querySelector("#feed");

  listenToPosts((id, post) => {
    const card = createPostCard(post);
    feed.prepend(card); // Newest first
  });
}

