document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");
    const movieResults = document.getElementById("movieResults");
    const trendingMovies = document.getElementById("trendingMovies");
    const watchlistContainer = document.getElementById("watchlistContainer");
    const themeToggle = document.getElementById("theme-toggle");

    // Replace with your actual OMDB API key
    const apiKey = '2a2ccdba'; // Your API key

    // Set initial theme based on localStorage
    if (localStorage.getItem("theme") === "light") {
        document.body.classList.remove("dark-mode");
        document.body.classList.add("light-mode");
        themeToggle.textContent = "🌙 Dark Mode";
    } else {
        document.body.classList.add("dark-mode");
        themeToggle.textContent = "🌙 Light Mode";
    }

    themeToggle.addEventListener("click", () => {
        if (document.body.classList.contains("dark-mode")) {
            document.body.classList.remove("dark-mode");
            document.body.classList.add("light-mode");
            themeToggle.textContent = "🌙 Dark Mode";
            localStorage.setItem("theme", "light");
        } else {
            document.body.classList.remove("light-mode");
            document.body.classList.add("dark-mode");
            themeToggle.textContent = "🌙 Light Mode";
            localStorage.setItem("theme", "dark");
        }
    });

    searchInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            searchMovie();
        }
    });

    async function searchMovie() {
        const query = searchInput.value.trim();
        if (!query) return;

        showLoadingSpinner();
        const response = await fetch(`https://www.omdbapi.com/?s=${query}&apikey=${apiKey}`);
        const data = await response.json();
        hideLoadingSpinner();
        displayMovies(data.Search, movieResults);
    }

    async function fetchTrendingMovies() {
        showLoadingSpinner();
        const response = await fetch(`https://www.omdbapi.com/?s=action&apikey=${apiKey}`);
        const data = await response.json();
        hideLoadingSpinner();
        displayMovies(data.Search, trendingMovies);
    }

    function displayMovies(movies, container) {
        container.innerHTML = "";
        if (!movies) {
            container.innerHTML = "<p class='no-movies-found'>No movies found</p>";
            return;
        }

        movies.forEach(movie => {
            const movieCard = document.createElement("div");
            movieCard.classList.add("movie-card");
            movieCard.innerHTML = `
                <img src="${movie.Poster}" alt="${movie.Title}">
                <h3>${movie.Title}</h3>
                <button onclick="fetchMovieDetails('${movie.imdbID}')">ℹ️ View Details</button>
                <button onclick="addToWatchlist('${movie.imdbID}', '${movie.Title}', '${movie.Poster}')">➕ Add to Watchlist</button>
            `;
            container.appendChild(movieCard);
        });
    }

    async function fetchMovieDetails(movieId) {
        showLoadingSpinner();
        const response = await fetch(`https://www.omdbapi.com/?i=${movieId}&apikey=${apiKey}`);
        const movie = await response.json();
        hideLoadingSpinner();

        const movieDetails = document.getElementById("movieDetails");
        movieDetails.innerHTML = `
            <div class="movie-details-card">
                <img src="${movie.Poster}" alt="${movie.Title}">
                <div class="details">
                    <h2>${movie.Title} (${movie.Year})</h2>
                    <p><strong>Genre:</strong> ${movie.Genre}</p>
                    <p><strong>Director:</strong> ${movie.Director}</p>
                    <p><strong>Actors:</strong> ${movie.Actors}</p>
                    <p><strong>Plot:</strong> ${movie.Plot}</p>
                    <p><strong>IMDB Rating:</strong> ⭐ ${movie.imdbRating}</p>
                    <p><strong>Release Year:</strong> ${movie.Year}</p>
                    <p><strong>Budget:</strong> ${movie.BoxOffice}</p>
                    <button onclick="closeMovieDetails()">Close</button>
                </div>
            </div>
        `;
        movieDetails.style.display = "block";
        
        // Scroll to the movie details section
        movieDetails.scrollIntoView({ behavior: "smooth" });
    }

    function closeMovieDetails() {
        const movieDetails = document.getElementById("movieDetails");
        movieDetails.style.display = "none";
    }

    function addToWatchlist(id, title, poster) {
        showLoadingSpinner();
        let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
        watchlist.push({ id, title, poster });
        localStorage.setItem("watchlist", JSON.stringify(watchlist));
        displayWatchlist();
        hideLoadingSpinner();
        showNotification(`Added "${title}" to your watchlist`, "success");

        // Scroll to the watchlist section
        document.getElementById("watchlistContainer").scrollIntoView({ behavior: "smooth" });
    }

    function displayWatchlist() {
        watchlistContainer.innerHTML = "";
        let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
        watchlist.forEach(movie => {
            const movieCard = document.createElement("div");
            movieCard.classList.add("movie-card");
            movieCard.innerHTML = `
                <img src="${movie.poster}" alt="${movie.title}">
                <h3>${movie.title}</h3>
                <button onclick="removeFromWatchlist('${movie.id}')">Remove</button>
            `;
            watchlistContainer.appendChild(movieCard);
        });
    }

    function removeFromWatchlist(id) {
        showLoadingSpinner();
        let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
        const movie = watchlist.find(movie => movie.id === id);
        watchlist = watchlist.filter(movie => movie.id !== id);
        localStorage.setItem("watchlist", JSON.stringify(watchlist));
        displayWatchlist();
        hideLoadingSpinner();
        showNotification(`Removed "${movie.title}" from your watchlist`, "warning");
    }

    function showNotification(message, type = "success") {
        const notification = document.createElement("div");
        notification.classList.add("notification", type);
        notification.textContent = message;

        if (type === "success") {
            const goToWatchlistBtn = document.createElement("button");
            goToWatchlistBtn.textContent = "📌 Go to Watchlist";
            goToWatchlistBtn.classList.add("go-to-watchlist-btn");
            goToWatchlistBtn.onclick = () => {
                document.getElementById("watchlistContainer").scrollIntoView({ behavior: "smooth" });
            };
            notification.appendChild(goToWatchlistBtn);
        }

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add("show");
        }, 100);

        setTimeout(() => {
            notification.classList.remove("show");
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    function showLoadingSpinner() {
        document.getElementById("loading").style.display = "block";
    }

    function hideLoadingSpinner() {
        document.getElementById("loading").style.display = "none";
    }

    fetchTrendingMovies();
    displayWatchlist();
    window.searchMovie = searchMovie;
    window.addToWatchlist = addToWatchlist;
    window.removeFromWatchlist = removeFromWatchlist;
    window.fetchMovieDetails = fetchMovieDetails;
    window.closeMovieDetails = closeMovieDetails;

    const contactForm = document.getElementById("contactForm");
    const formSuccess = document.getElementById("formSuccess");

    if (contactForm) {
        contactForm.addEventListener("submit", (event) => {
            event.preventDefault();
            showLoadingSpinner();
            setTimeout(() => {
                formSuccess.style.display = "block";
                contactForm.reset();
                hideLoadingSpinner();
            }, 1000); // Simulate a delay for form submission
        });
    }
});
