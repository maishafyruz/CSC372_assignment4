/**
 * Name: Maisha Fyruz
 * Date: 10.16.2026
 * CSC 372-01
 * This file handles TVmaze API requests and updates the show gallery.
 */

window.addEventListener("load", setup);

/**
 * Sets up the search form and loads a default search.
 */
function setup() {
  let searchForm = document.getElementById("show-search-form");

  searchForm.addEventListener("submit", handleSearch);

  searchShows("friends");
}

/**
 * Handles a new show search submitted by the visitor.
 * @param {Event} event the form submit event
 */
function handleSearch(event) {
  event.preventDefault();

  let formData = new FormData(event.target);
  let searchText = formData.get("query");

  searchShows(searchText);
}

/**
 * Searches TVmaze for shows matching the search text.
 * @param {String} searchText the show title or keyword
 */
async function searchShows(searchText) {
  let gallery = document.getElementById("show-gallery");
  let message = document.getElementById("message");

  gallery.textContent = "";
  message.textContent = "";

  if (searchText.trim() === "") {
    message.textContent = "Please enter a show title or keyword.";
    return;
  }

  message.textContent = "Loading shows...";

  let apiUrl = new URL("https://api.tvmaze.com/search/shows");
  apiUrl.searchParams.append("q", searchText);

  try {
    let response = await fetch(apiUrl);

    if (response.status === 429) {
      throw new Error("Too many requests. Please try again shortly.");
    }

    if (!response.ok) {
      throw new Error("Unable to load show results.");
    }

    let showData = await response.json();

    if (showData.length === 0) {
      message.textContent = "No matching shows were found.";
      return;
    }

    let shows = showData.slice(0, 10);

    await displayShows(shows);
    message.textContent = "";
    } catch (error) {
        message.textContent = error.message;
        console.error("Error fetching shows:", error);
    }
}

/**
 * Displays the matching shows in the gallery.
 * @param {Array} shows the matching TV shows
 */
async function displayShows(shows) {
  let gallery = document.getElementById("show-gallery");

  for (let index = 0; index < shows.length; index++) {
    
    let show = shows[index].show;


    let card = document.createElement("article");
    card.classList.add("show-card");

    let name = document.createElement("h3");
    name.textContent = show.name;
    card.appendChild(name);

    let cast = document.createElement("p");
    let castMembers = await getCast(show.id);
    cast.textContent = "Main cast: " + castMembers;
    card.appendChild(cast);

    if (show.image) {
      let poster = document.createElement("img");
      poster.src = show.image.medium;
      poster.alt = "Poster for " + show.name;
      card.appendChild(poster);
    } else {
      let noPoster = document.createElement("p");
      noPoster.textContent = "Poster: Not available";
      card.appendChild(noPoster);
    }

    let summary = document.createElement("p");

    if (show.summary) {
        let cleanSummary = removeHtml(show.summary);

    if (cleanSummary.length > 200) {
        cleanSummary = cleanSummary.slice(0, 200) + "...";
    }

    summary.textContent = cleanSummary;
    } else {
        summary.textContent = "Summary: Not available";
    }

    card.appendChild(summary);

    let premiere = document.createElement("p");
    premiere.textContent =
      "Premiere date: " + (show.premiered ? show.premiered : "Not available");
    card.appendChild(premiere);

    let genres = document.createElement("p");

    if (show.genres.length > 0) {
      genres.textContent = "Genres: " + show.genres.join(", ");
    } else {
      genres.textContent = "Genres: Not available";
    }

    card.appendChild(genres);

    let rating = document.createElement("p");

    if (show.rating.average) {
      rating.textContent = "Average rating: " + show.rating.average;
    } else {
      rating.textContent = "Average rating: Not available";
    }

    card.appendChild(rating);

    let updated = document.createElement("p");

    if (show.updated) {
        let updatedDate = new Date(show.updated * 1000);
        updated.textContent = "Last updated: " + updatedDate.toLocaleString();
    } else {
        updated.textContent = "Last updated: Not available";
    } 
    card.appendChild(updated);
    

    let showLink = document.createElement("a");
    showLink.href = show.url;
    showLink.textContent = "View on TVmaze";
    showLink.target = "_blank";
    card.appendChild(showLink);

    gallery.appendChild(card);
  }
}

/**
 * Gets the main cast members for a TV show.
 * @param {Number} showId the TVmaze show ID
 * @returns {String} the main cast member names
 */
async function getCast(showId) {
  let castUrl = "https://api.tvmaze.com/shows/" + showId + "/cast";

  try {
    let response = await fetch(castUrl);

    if (response.status === 429) {
      return "Too many requests. Please try again shortly.";
    }

    if (!response.ok) {
      return "Not available";
    }

    let castData = await response.json();

    if (castData.length === 0) {
      return "Not available";
    }

    let castNames = "";

    for (let index = 0; index < castData.length && index < 3; index++) {
      if (index > 0) {
        castNames += ", ";
      }

      castNames += castData[index].person.name;
    }

    return castNames;
  } catch (error) {
    console.error("Error fetching cast:", error);
    return "Not available";
  }
}
/**
 * Removes HTML tags from a show summary.
 * @param {String} summary the show summary
 * @returns {String} the summary without HTML tags
 */
function removeHtml(summary) {
  return summary.replace(/<[^>]*>/g, "");
}