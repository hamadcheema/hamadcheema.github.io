// Post card component
export function createPostCard(post) {
  const div = document.createElement("div");
  div.classList.add("post-card");

  div.innerHTML = `
    <div class="post-header">
      <strong>@${post.userId}</strong>
    </div>
    <div class="post-media">
      <img src="${post.media}" alt="post" />
    </div>
    <div class="post-caption">
      <p>${post.caption}</p>
    </div>
  `;

  return div;
}

