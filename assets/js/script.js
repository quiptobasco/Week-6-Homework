function generateWeather(city) {
    //date variable using moment to format
    var date = moment().format("[(]M[/]DD[/]YYYY[)]");
    //api key for openweathermap
    var key = "da705c36bcd32c2406d3af0ef82dd5be";
    //url to make call to openweathermap api with city and apikey
    var currentWeatherURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + key;

    //ajax function to get data from openweathermap api
    $.ajax({ url: currentWeatherURL, method: "GET" }).done(function(response) {
        var searchedCities = JSON.parse(localStorage.getItem("city")) || [];
        if (searchedCities.indexOf(city) == -1) {
            searchedCities.unshift(city);
            if (searchedCities.length > 8) {
                searchedCities.pop();
        }
        localStorage.setItem("city", JSON.stringify(searchedCities));
        displayCities();
        }

        //set variables based on api call response
        var temperature = (convertToF(response.main.temp)).toFixed(2);
        var wind = response.wind.speed;
        var humidity = response.main.humidity;
        var weatherIcon = response.weather[0].icon;
        var weatherIconURL = "https://openweathermap.org/img/w/" + weatherIcon + ".png";

        var lon = response.coord.lon;
        var lat = response.coord.lat;
        //set text for current weather conditions of searched for city
        $("#city-name-date").text(city + " " + date);
        $("#weather-icon").attr({ "src": weatherIconURL});
        $("#current-temperature").text(temperature + "°F");
        $("#current-wind").text(wind + " MPH");
        $("#current-humidity").text(humidity + " %");

        //new url to get UV index & 5 day forecast
        var forecastURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=hourly&appid=" + key;

        //ajax function to call api
        $.ajax({ url: forecastURL, method: "GET"}).done(function(response) {
            //get current uv index from api response and change it's color based on result
            var uv = response.current.uvi;
            var color = "";
            if (uv <= 2) {
                color =  "#299501";
            } else if (uv <= 5) {
                color = "#f7e401";
            } else if (uv <= 7) {
                color = "#f95901";
            } else if (uv <= 10) {
                color = "#d90011";
            } else {
                color = "#6c49cb";
            }
            $("#current-uv").text(uv);
            $("#current-uv").css("background-color", color);

            //get data for 5 day forecast and update the html
            for (var i = 1; i < 6; i++) {
                var cardWeather = response.daily[i].weather[0].icon;
                var weatherIconURL = "https://openweathermap.org/img/w/" + cardWeather + ".png";
                
                $("#date-" + i).text(moment.unix(response.daily[i].dt).format("M/DD/YYYY"));
                $("#icon-" + i).attr({ "src": weatherIconURL });
                $("#temperature-" + i).text("Temp: " + (convertToF(response.daily[i].temp.max)).toFixed(2) + " °F");
                $("#wind-" + i).text("Wind: " + (response.daily[i].wind_speed).toFixed(2) + " MPH");
                $("#humidity-" + i).text("Humidity: " + response.daily[i].humidity + " %");
            }
        });
        //if no results returned, alert!
    }).fail(function(jqXHR) {
        if (jqXHR.status == 404) {
            alert("Search Returned no results...Did you spell something wrong?");
        } else {
            alert("Some other error.  Try again.");
        }
    });
}

//function to convert from kelvin to fahrenheit
function convertToF(k) {
    return (((k - 273.15) * 1.8) + 32);
}

//initialize function set Seattle as default serached city
function init() {
    var defaultCity = "Seattle";        
    var cities = JSON.parse(localStorage.getItem("city")) || [];
        
    for (var i = 0; i <= cities.length -1; i++) {
        $("#search" + i).text(cities[i]).attr({ "value" : cities[i] });
    }

    generateWeather(defaultCity);
}

//click event for previously searched cities
$(".saved-city").click(function(event) {
    event.preventDefault();
    cityClicked = ($(this).attr("value"));
    generateWeather(cityClicked);
})

//button to search for entered city
$(".button-search").click(function(event) {
    event.preventDefault();
    var city = $("#city-input").val().trim();

    if (city === null || city === "") {
        alert("You must enter a city name");
    } else {
        generateWeather(city);

    }
})

//function to display any previously searched cities from local storage
function displayCities() {
    var cities = JSON.parse(localStorage.getItem("city")) || [];
    $(".saved-city").each(function () {
        $(this).text("");
    })

    for (var i = 0; i <= cities.length -1; i++) {
        $("#search" + i).text(cities[i]).attr({ "value" : cities[i] });
    }
}

init();
