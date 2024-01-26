"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");

async function getEpisodes(showId) {
  try {
    const response = await axios.get(`http://api.tvmaze.com/shows/${showId}/episodes`);

    const episodes = response.data.map(episode => ({
      id: episode.id,
      name: episode.name,
      season: episode.season,
      number: episode.number,
    }));

    return episodes;
  } catch (error) {
    console.error(`Error fetching episodes for show ${showId}:`, error);
    return [];
  }
}

function populateEpisodes(episodes) {
  const $episodesList = $("#episodesList");
  $episodesList.empty();

  for (let episode of episodes) {
    const $episodeItem = $(`<li>${episode.name} (season ${episode.season}, number ${episode.number})</li>`);
    $episodesList.append($episodeItem);
  }
}

async function searchShows(term) {
  try {
    const response = await axios.get(`http://api.tvmaze.com/search/shows?q=${term}`);

    const shows = response.data.map(result => {
      const showData = result.show;
      return {
        id: showData.id,
        name: showData.name,
        summary: showData.summary,
        image: showData.image ? showData.image.medium : "https://tinyurl.com/tv-missing",
      };
    });

    return shows;
  } catch (error) {
    console.error("Error fetching shows:", error);
    return [];
  }
}

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img src="${show.image}" alt="${show.name}" class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>`
    );

    $showsList.append($show);
  }
}

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await searchShows(term);

  $episodesArea.hide();
  populateShows(shows);
}

async function showEpisodesForShow(showId) {
  const episodes = await getEpisodes(showId);
  populateEpisodes(episodes);
  $episodesArea.show();
}

// Event delegation for dynamic buttons
$showsList.on("click", ".Show-getEpisodes", function () {
  const $showCard = $(this).closest(".Show");
  const showId = $showCard.data("show-id");
  showEpisodesForShow(showId);
});

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});
