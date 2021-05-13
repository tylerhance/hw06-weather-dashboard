// Variable to store the searched city
let city = "";
// Global variable declarations
let searchCity = $("#search-city");
let searchButton = $("#search-button");
let clearButton = $("#clear-history");
let currentCity = $("#current-city");
let currentTemp = $("#temperature");
let currentHumidity = $("#humidity");
let currentWindSpeed = $("#wind-speed");
let currentUvIndex = $("#uv-index");
let cityArr = [];

// Constant for my API key
const apiKey = "e5f2367964f72502a698afe100a91b44";

// Function for checking if city exists in local storage
function find(c) {
    for (var i=0; i<cityArr.length; i++) {
        if(c.toUpperCase() === cityArr[i]){
            return -1;
        }
    } return 1;
}

// Display current/future weather after user inputs city
function displayWeather(event) {
    event.preventDefault();
    if(searchCity.val().trim() !== "") {
        city = searchCity.val().trim();
        currentWeather(city);
    }
}

// Creating AJAX call - then getting data from the server
function currentWeather(city) {
    let queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + apiKey;
    $.ajax({
        url: queryURL,
        method: "GET",
    }).then(function(response){
        console.log(response);
        var weatherIcon = response.weather[0].icon;
        var iconURL = "https://openweathermap.org/img/wn/" + weatherIcon + "@2x.png";
        // Date formatting
        var date = new Date(response.dt*1000).toLocaleDateString();
        // Parse response for name of city; concatinating the data and icons
        $(currentCity).html(response.name + "("+date+")" + "<img src = "+iconURL+">");

        //Function for parsing response to display the current temperature
        // Also, converts temp to Fahrenheit
        var tempF = (response.main.temp - 273.15) * 1.80 + 32;
        $(currentTemp).html((tempF).toFixed(2) + "&#8457");

        // Displays the Humidity
        $(currentHumidity).html(response.main.humidity + "%");

        // Displays winds speed and converts to MPH
        var windSpeed = response.wind.speed;
        var windMPH = (windSpeed * 2.237).toFixed(1);
        $(currentWindSpeed).html(windMPH + "MPH");

        // UV Index display according to geo coordinates
        UVIndex(response.coord.lon,response.coord.lat);
        forecast(response.id);
        if (response.cod == 200){
            cityArr = JSON.parse(localStorage.getItem("cityName"));
            console.log(cityArr);
            if (cityArr == null){
                cityArr = [];
                cityArr.push(city.toUpperCase());
                localStorage.setItem("cityName", JSON.stringify(cityArr));
                addToList(city);
            } else {
                if (find(city) > 0){
                    cityArr.push(city.toUpperCase());
                    localStorage.setItem("cityName", JSON.stringify(cityArr));
                    addToList(city);
                }
            }
        }
    });
}

// Function for returning the UV Index 
function UVIndex(ln,lt){
    var uvqURL = "https://api.openweathermap.org/data/2.5/uvi?appid=" + apiKey + "&lat=" + lt + "&lon=" + ln;
    $.ajax({
        url : uvqURL,
        method: "GET",
    }).then(function(response){
        $(currentUvIndex).html(response.value);
    });
}

// Displaying 5-day forecast for current city
function forecast(cityID) {
    var dayOver = false;
    var forecastURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityID + "&appid=" + apiKey;
    $.ajax({
        url: forecastURL,
        method: "GET",
    }).then(function (response){
        
        for (i = 0; i < 5; i++){
            var date = new Date((response.list[((i + 1) * 8) - 1].dt) *1000).toLocaleDateString();
            var iconCode = response.list[((i + 1) * 8) - 1].weather[0].icon;
            var iconURL = "https://openweathermap.org/img/wn/" + iconCode + ".png";
            var tempK = response.list[((i+1)*8)-1].main.temp;
            var tempF = (((tempK-273.5)*1.80)+32).toFixed(2);
            var humidity = response.list[((i+1)*8)-1].main.humidity;

            $("#fDate" + i).html(date);
            $("#fImg" + i).html("<img src=" + iconURL + ">");
            $("#fTemp" + i).html(tempF + "&#8457");
            $("#fHumidity" + i).html(humidity + "%");
        }
    });
}

// Dynamically adding the previously searched cities to "search history"
function addToList(c){
    var listEl = $("<li>" + c.toUpperCase() + "</li>");
    $(listEl).attr("class", "list-group-item");
    $(listEl).attr("data-value", c.toUpperCase());
    $(".list-group").append(listEl);
}

// Function for displaying the past search when li item is clicked
function pastSearch(event){
    var listItemEl = event.target;
    if (event.target.matches("li")){
        city = listItemEl.textContent.trim();
        currentWeather(city);
    }
}

function loadLastCity(){
    $("ul").empty();
    var cityArr = JSON.parse(localStorage.getItem("cityName"));
    if (cityArr !== null) {
        cityArr = JSON.parse(localStorage.getItem("cityName"));
        for (i = 0; i < cityArr.length; i++){
            addToList(cityArr[i]);
        }
        city = cityArr[i - 1];
        currentWeather(city);
    }
}

// Function for clearing the city search history
function clearHistory(event) {
    event.preventDefault();
    cityArr = [];
    localStorage.removeItem("cityName");
    document.location.reload();
}

// Click handlers
$("#search-button").on("click", displayWeather);
$(document).on("click", pastSearch);
$(window).on("load", loadLastCity);
$("#clear-history").on("click", clearHistory);