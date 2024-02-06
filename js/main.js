// Copyright (C) 2024 twyleg

function addReposListElement(headline, link, avatar_url, content, age) {
    var reposListElement = document.getElementById("repos-list");

    var aElement = document.createElement("a");
    aElement.id = headline;
    aElement.className = "list-group-item list-group-item-action d-flex gap-3 py-3";
    aElement.setAttribute("aria-current", "true");
    aElement.setAttribute("href", link);

    var imgElement = document.createElement("img");
    imgElement.className = "rounded-circle flex-shrink-0";
    imgElement.setAttribute("src", avatar_url);
    imgElement.setAttribute("alt", "img");
    imgElement.setAttribute("width", "32");
    imgElement.setAttribute("height", "32");

    var layoutDivElement = document.createElement("div");
    layoutDivElement.className = "d-flex gap-2 w-100 justify-content-between";

    var containerDivElement = document.createElement("div");

    var h6Element = document.createElement("h6");
    h6Element.className = "mb-0";
    h6Element.innerHTML = headline;

    var pElement = document.createElement("p");
    pElement.className = "mb-0 opacity-75";
    pElement.innerHTML = content;

    var ageSmallElement = document.createElement("small");
    ageSmallElement.className = "opacity-50 text-nowrap";
    ageSmallElement.innerHTML = age;

    containerDivElement.appendChild(h6Element);
    containerDivElement.appendChild(pElement);

    layoutDivElement.appendChild(containerDivElement);
    layoutDivElement.appendChild(ageSmallElement);

    aElement.appendChild(imgElement);
    aElement.appendChild(layoutDivElement);

    reposListElement.appendChild(aElement);
}

function clearReposListElements() {
    var repoListElement = document.getElementById("repos-list");
    repoListElement.replaceChildren();
}

function removeReposListElement(id) {
    var repoListElement = document.getElementById("repos-list");
    var repoListEntryElement = repoListElement.querySelector('#'+id);
    repoListEntryElement.remove();
}


function addOrgsListElement(headline, link, avatar_url) {
    var orgsListElement = document.getElementById("orgs-list");
    
    var aElement = document.createElement("a");
    aElement.id = headline;
    aElement.className = "list-group-item list-group-item-action d-flex gap-3 py-3";
    aElement.setAttribute("aria-current", "true");
    aElement.setAttribute("href", link);
    
    var imgElement = document.createElement("img");
    imgElement.className = "rounded-circle flex-shrink-0";
    imgElement.setAttribute("src", avatar_url);
    imgElement.setAttribute("alt", "img");
    imgElement.setAttribute("width", "32");
    imgElement.setAttribute("height", "32");
    
    var layoutDivElement = document.createElement("div");
    layoutDivElement.className = "d-flex gap-2 w-100 justify-content-between";
    
    var containerDivElement = document.createElement("div");
    
    var h6Element = document.createElement("h6");
    h6Element.className = "mb-0";
    h6Element.innerHTML = headline;
    
    containerDivElement.appendChild(h6Element);
    
    layoutDivElement.appendChild(containerDivElement);
    
    aElement.appendChild(imgElement);
    aElement.appendChild(layoutDivElement);
    
    orgsListElement.appendChild(aElement);
}

function clearOrgsListElements() {
    var orgsListElement = document.getElementById("orgs-list");
    orgsListElement.replaceChildren();
}

function removeOrgsListElement(id) {
    var orgsListElement = document.getElementById("orgs-list");
    var orgsListEntryElement = orgsListElement.querySelector('#'+id);
    orgsListEntryElement.remove();
}


function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  let expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getToken() {
  let token = getCookie("token");
  if (token == "") {
    token = prompt("Please enter your GitHub token (it will be saved locally in a cookie):", "");
    if (token != "" && token != null) {
      setCookie("token", token, 365);
    }
  }
  return token;
}

async function getRepos(token, reload = false) {

    var repos = [];
    var currentPage = 1;

    do {
        const response = await fetch("https://api.github.com/user/repos?" + new URLSearchParams({
            per_page: 100,
            sort: "full_name",
            page: currentPage++
        }).toString(), {
            method: "GET", // *GET, POST, PUT, DELETE, etc.
            cache: reload ? "reload" : "force-cache", // *default, no-cache, reload, force-cache, only-if-cached
            headers: {
                "Accept": "application/vnd.github+json",
                "Authorization": "Bearer " + token,
                "X-GitHub-Api-Version": "2022-11-28",
            },
        });

        var newProjects = await response.json();
        console.log(newProjects);
        repos.push.apply(repos, newProjects);

    } while(newProjects.length);
    return repos;
}


async function getReposByOrg(token, org) {

    var repos = [];
    var currentPage = 1;

    do {
        const response = await fetch("https://api.github.com/orgs/" + org +"/repos?" + new URLSearchParams({
            per_page: 100,
            sort: "full_name",
            page: currentPage++
        }).toString(), {
            method: "GET", // *GET, POST, PUT, DELETE, etc.
            cache: "force-cache", // *default, no-cache, reload, force-cache, only-if-cached
            headers: {
                "Accept": "application/vnd.github+json",
                "Authorization": "Bearer " + token,
                "X-GitHub-Api-Version": "2022-11-28",
            },
        });

        var newRepos = await response.json();
        repos.push.apply(repos, newRepos);

    } while(newRepos.length);
    return repos;
}


async function getOrgs(token, reload = false) {

    const response = await fetch("https://api.github.com/user/orgs?" + new URLSearchParams({
        per_page: 100
    }).toString(), {
        method: "GET", // *GET, POST, PUT, DELETE, etc.
        cache: reload ? "reload" : "force-cache", // *default, no-cache, reload, force-cache, only-if-cached
        headers: {
            "Accept": "application/vnd.github+json",
            "Authorization": "Bearer " + token,
            "X-GitHub-Api-Version": "2022-11-28",
        },
    });

    let orgs = response.json();
    return orgs;

}

function getReposFilter() {
    let filterInputFieldElement = document.getElementById("repos-filter-input-field");
    return filterInputFieldElement.value;
}

function getOrgsFilter() {
    let filterInputFieldElement = document.getElementById("orgs-filter-input-field");
    return filterInputFieldElement.value;
}

function getRepoAgeInDays(repo) {
    let updatedTimestamp = Date.parse(repo.pushed_at);
    let dt = Date.now() - updatedTimestamp;
    return Math.floor(dt / (1000 * 60 * 60 * 24));
}


async function showRepos(repos) {

    let filter = getReposFilter();
    clearReposListElements();

    for (const repo of repos) {
        if (repo.full_name.includes(filter)) {
            let repoAgeInDays = getRepoAgeInDays(repo);
            addReposListElement(repo.full_name, repo.html_url, repo.owner.avatar_url, repo.description, repoAgeInDays+"d");
        }
    }
}

async function showOrgs(orgs) {

    let filter = getOrgsFilter();
    clearOrgsListElements();

    for (const org of orgs) {
        if (org.login.includes(filter)) {
            addOrgsListElement(org.login, `https://github.com/orgs/${org.login}/repositories`, org.avatar_url);
        }
    }
}

function setReposLoadingSpinnerVisibility(visible) {
    document.getElementById("repos-loading-spinner").style.display = visible ? "inherit" : "none";
}

function setOrgsLoadingSpinnerVisibility(visible) {
    document.getElementById("orgs-loading-spinner").style.display = visible ? "inherit" : "none";
}


async function main() {
    
    document.getElementById("repos-list-div").style.display = "inherit";
    document.getElementById("orgs-list-div").style.display = "none";

    let token = getToken();
    let repos = await getRepos(token, false);
    let orgs = await getOrgs(token, false);
    
    setReposLoadingSpinnerVisibility(false);
    setOrgsLoadingSpinnerVisibility(false);
    
    showRepos(repos);
    showOrgs(orgs);
    
    var reposButtonElement = document.getElementById("repos-button");
    reposButtonElement.onclick = function(){
        console.log("Repos button pressed");
        document.getElementById("repos-list-div").style.display = "inherit";
        document.getElementById("orgs-list-div").style.display = "none";
        reposButtonElement.classList.add("active")
        orgsButtonElement.classList.remove("active")
    };

    var orgsButtonElement = document.getElementById("orgs-button");
    orgsButtonElement.onclick = function(){
        console.log("Orgs button pressed");
        document.getElementById("repos-list-div").style.display = "none";
        document.getElementById("orgs-list-div").style.display = "inherit";
        reposButtonElement.classList.remove("active")
        orgsButtonElement.classList.add("active")
    };

    

    var reposReloadButtonElement = document.getElementById("repos-reload-button");
    reposReloadButtonElement.onclick = async function(){
        clearReposListElements();
        setReposLoadingSpinnerVisibility(true);
        repos = await getRepos(token, true);
        setReposLoadingSpinnerVisibility(false);
        showRepos(repos);
    };

    let reposTimeOut;
    var reposFilterInputFieldElement = document.getElementById("repos-filter-input-field");
    reposFilterInputFieldElement.oninput = function(){
        clearTimeout(reposTimeOut);
        timeOut = setTimeout(() => {
            showRepos(repos);
        }, 500)
    };
    
    
    
    var orgsReloadButtonElement = document.getElementById("orgs-reload-button");
    orgsReloadButtonElement.onclick = async function(){
        clearOrgsListElements();
        setOrgsLoadingSpinnerVisibility(true);
        orgs = await getOrgs(token, true);
        setOrgsLoadingSpinnerVisibility(false);
        showOrgs(orgs);
    };

    let orgsTimeOut;
    var orgsFilterInputFieldElement = document.getElementById("orgs-filter-input-field");
    orgsFilterInputFieldElement.oninput = function(){
        clearTimeout(orgsTimeOut);
        timeOut = setTimeout(() => {
            showOrgs(orgs);
        }, 500)
    };
}

document.addEventListener("DOMContentLoaded", function(){
    main();
});
