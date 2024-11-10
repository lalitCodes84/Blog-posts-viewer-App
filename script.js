const API_URL = 'https://jsonplaceholder.typicode.com';
const POSTS_PER_PAGE = 10;

let posts = [];
let users = [];
let filteredPosts = [];
let currentPage = 1;

const postsContainer = document.getElementById('posts-container');
const searchInput = document.getElementById('search-input');
const userSelect = document.getElementById('user-select');
const sortSelect = document.getElementById('sort-select');
const prevPageButton = document.getElementById('prev-page');
const nextPageButton = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');

// Fetch posts and users from the API
async function fetchData() {
  const postsResponse = await fetch(`${API_URL}/posts`);
  posts = await postsResponse.json();
  filteredPosts = posts;

  const usersResponse = await fetch(`${API_URL}/users`);
  users = await usersResponse.json();

  populateUserDropdown();
  displayPosts();
}

// Populate user dropdown dynamically
function populateUserDropdown() {
  users.forEach(user => {
    const option = document.createElement('option');
    option.value = user.id;
    option.textContent = user.name;
    userSelect.appendChild(option);
  });
}

// Display posts with pagination
function displayPosts() {
  postsContainer.innerHTML = '';

  const paginatedPosts = paginatePosts(filteredPosts);
  paginatedPosts.forEach(post => {
    const postElement = document.createElement('div');
    postElement.className = 'post';
    postElement.innerHTML = `<h3>${post.title}</h3><p>${post.body}</p>`;
    postElement.onclick = () => openPostComments(post.id);
    postsContainer.appendChild(postElement);
  });

  updatePaginationButtons();
}

// Pagination logic
function paginatePosts(postsArray) {
  const start = (currentPage - 1) * POSTS_PER_PAGE;
  const end = start + POSTS_PER_PAGE;
  return postsArray.slice(start, end);
}

function updatePaginationButtons() {
  prevPageButton.disabled = currentPage === 1;
  nextPageButton.disabled = currentPage * POSTS_PER_PAGE >= filteredPosts.length;
  pageInfo.textContent = `Page ${currentPage}`;
}

// Open post comments in a new tab
async function openPostComments(postId) {
  const response = await fetch(`${API_URL}/comments?postId=${postId}`);
  const comments = await response.json();

  const commentsWindow = window.open('', '_blank');
  commentsWindow.document.write('<h1>Comments</h1>');

  comments.forEach(comment => {
    commentsWindow.document.write(`
      <div>
        <h3>${comment.name}</h3>
        <p>${comment.body}</p>
        <hr>
      </div>
    `);
  });
}

// Filter and sort posts
function filterAndSortPosts() {
  let searchTerm = searchInput.value.toLowerCase();
  let selectedUser = userSelect.value;
  let sortOrder = sortSelect.value;

  filteredPosts = posts.filter(post => {
    const matchesUser = selectedUser ? post.userId === parseInt(selectedUser) : true;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm);
    return matchesUser && matchesSearch;
  });

  if (sortOrder === 'desc') {
    filteredPosts.sort((a, b) => b.title.localeCompare(a.title));
  } else {
    filteredPosts.sort((a, b) => a.title.localeCompare(b.title));
  }

  currentPage = 1;
  displayPosts();
}

// Event listeners
searchInput.addEventListener('input', filterAndSortPosts);
userSelect.addEventListener('change', filterAndSortPosts);
sortSelect.addEventListener('change', filterAndSortPosts);

prevPageButton.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    displayPosts();
  }
});

nextPageButton.addEventListener('click', () => {
  if (currentPage * POSTS_PER_PAGE < filteredPosts.length) {
    currentPage++;
    displayPosts();
  }
});

// Initial data fetch
fetchData();