var User = function User (formInput,pohlaviUzivatele) {
    this.pohlavi = pohlaviUzivatele;
    this.formInput = formInput;
};

    // evaluates form and returns users sex
    User.prototype.sex = function sex () {
        if (this.pohlavi == 'muž') {
            return 'manData';
        } else if (this.pohlavi == 'žena') {
            return 'womanData';
        } else {
            console.log('nekdo mi tu ve formulari podstrkuje jiny pohlavi, nez jsem zvyklej');
            return 'manData';
        }
    };

    // evaluates form and returns valid Moment.js object
    User.prototype.birthDateToDate = function birthDateToDate(){
        var formDate = moment(this.formInput, ["DD-MM-YYYY", "D-M-YYYY", "YYYY-MM-DD", "YYYY-M-DD", "YYYY-MM-D"]);
        if (formDate.isValid()) {
            return formDate;
        } else {
            sweetAlert('Ajta krajta!','Zadali jste datum narození dobře? Zkuste to znovu, třeba ve formátu 21.8.1968', 'error');
            document.getElementById('data_form').reset();
            console.log("chyba v zadani formatu data");
        }
    };

    User.prototype.birthYear = function birthYear() {
        return birthDayGlobalVar.year();
    };

    // if there are data for particular year, it returns life expectancy in years
    User.prototype.deathYear = function deathYear(){
        var year = this.birthYear();
        var lifeXpe = '';
        if (!window[sexGlobalVar][year]) {
            sweetAlert('Pa-da-dam-pam','Pro zadané datum narození nemám údaje :(', 'error');
            ga('send', 'event', { eventCategory: 'Form', eventAction: 'Submit', eventLabel: 'Invalid'}); // custom GA event při odeslání
            } else {
            lifeXpe = window[sexGlobalVar][year].lifeExpectancy;
        }
        ga('send', 'event', { eventCategory: 'Form', eventAction: 'Submit', eventLabel: 'Valid'}); // custom GA event při odeslání
        return moment(birthDayGlobalVar).add(lifeXpe, 'y').year();
    };

    //Simple method for calculating user's age. Returns whole number rounded up
    User.prototype.age = function age(){
        return Math.ceil(this.returnWeekDifference()/52);

    };

    // Returns difference between dates passed into function in weeks. Arguments should be years as number.
    User.prototype.returnWeekDifference = function returnWeekDifference(pocetRoku){
        var firstDate = "";
        var secondDate = birthDayGlobalVar;
        // Difference between birthday and passed years (1990 + 75.5)
        if ( arguments.length === 1 ) {
           firstDate = moment(birthDayGlobalVar).add(pocetRoku, 'y');
        }
        // Difference between birthday and today
        else if (arguments.length === 0){
            firstDate = moment();
        }
        // Difference between entered dates, second is in years
        else if (arguments.length === 2) {
            firstDate = moment(arguments[0]);
            secondDate = moment(arguments[1], 'YYYY');
        }
        else {
            console.log("v parametrech pro vypocet byly vice nez 2 parametry");
        }

        return Math.abs(firstDate.diff(secondDate, 'weeks'));
    };

var ShowUser = function ShowUser(instanceUsera) {
    this.navstevnik = instanceUsera;
    this.doNotMarkId = [];
  };

    // Generates 'boxes', based on number of weeks user has in weeks
    ShowUser.prototype.generateBoxes = function generateBoxes () {
    var html = "";
    var weekCount = this.navstevnik.returnWeekDifference(birthDayGlobalVar,this.navstevnik.deathYear());
        for (var i = 0; i < weekCount; i++) {
        html += "<div class=\'box\' id=\'" + i + "\'></div>";
        }
    $('.ctverce').append(html);
    };

    // ads 'color' to box, as well as description, based on data in data.js
    ShowUser.prototype.addColor = function addColor (colorScheme) {
    var birthYearDate = this.navstevnik.birthYear();
    var actualProperty = window[sexGlobalVar][birthYearDate][colorScheme];
    var markedDate = '';
    var dateAsText = '';
    // function for defining right week to start with colours, when 'color' has 'monthOfBegining' and 'duration'
    var defineStartingWeek = function (monthOfBegining, yearOfBegining, birthYearDate){
         var startingMonth = moment(birthYearDate + yearOfBegining, 'YYYY').add(monthOfBegining, 'month');
           if (birthDayGlobalVar < startingMonth) {
            }
           else {
            startingMonth.add(12, 'month')
            }
        return startingMonth.diff(birthDayGlobalVar, 'weeks');
    };

        // testing if data contains colorScheme for particular gender
        if (typeof actualProperty != 'undefined') {
            // testing if 'color' has more property to decide if more boxes should be used
            if (actualProperty.hasOwnProperty("begining") && actualProperty.hasOwnProperty("duration")) {
                //adjusting week starts in view (those +1) - School start at 1st week in September, not last in August. If done properly, this shouldn't happen :). Everything goes.
                var startingInWeek = defineStartingWeek(actualProperty.monthOfBegining, actualProperty.begining, birthYearDate) + 1;
                var endingWeek = Math.round(startingInWeek + (actualProperty.duration * 52) + 1);
                for (var i = startingInWeek; i <= endingWeek; i++) {
                    markedDate = "#" + i;
                    dateAsText = this.makeDateFromWeekNumber(i);
                    // skips marking by description if already marked (Powertip doesnt handle that for some reason)
                    if (this.doNotMarkId.indexOf(markedDate) == -1 ) {
                        // Decides id text for past or future should be used
                        if (this.navstevnik.returnWeekDifference() < i) {
                            this.generateDesc(markedDate, dateAsText, textDescGlobal[colorScheme].title, textDescGlobal[colorScheme].text, textDescGlobal[colorScheme].fa); // texts for the future
                        } else {
                            this.generateDesc(markedDate, dateAsText, textDescGlobal[colorScheme].title, textDescGlobal[colorScheme].textPast, textDescGlobal[colorScheme].fa); // texts for the past
                        }

                    } else {}
                        $(markedDate).toggleClass(colorScheme);
                        this.doNotMarkId.push(markedDate);
                    }
    }
    // if colorScheme has only one variable
             else {
                markedDate = this.navstevnik.returnWeekDifference(actualProperty);
                if (markedDate != "undefined" && typeof markedDate === "number" && markedDate != 0) {
                    var tydenOznaceni = "#" + markedDate;
                    dateAsText = this.makeDateFromWeekNumber(markedDate);
                    $(tydenOznaceni).toggleClass(colorScheme);
                    //vynecha oznaceni descriptionem, pokud uz ji oznacil showFunFacts (kolize s Powertip)
                        if (this.doNotMarkId.indexOf(tydenOznaceni) == -1 ) {
                            // should I use text for past or future
                            if (this.navstevnik.returnWeekDifference() < markedDate) {
                                this.generateDesc(tydenOznaceni, dateAsText, textDescGlobal[colorScheme].title, textDescGlobal[colorScheme].text, textDescGlobal[colorScheme].fa);
                            } else {
                                this.generateDesc(tydenOznaceni, dateAsText, textDescGlobal[colorScheme].title, textDescGlobal[colorScheme].textPast, textDescGlobal[colorScheme].fa);
                            }

                         } else {
                        console.log('V prubehu oznacovani popiskem jsem narazil na id, ktere uz je oznacene: ' + this.doNotMarkId.indexOf(tydenOznaceni));
                        }
                        this.doNotMarkId.push(tydenOznaceni);

                        }
                else if (markedDate === 0) {
                    console.log("Pracuji na " + colorScheme + " a pro tento vek nemam data.");
                }
                else {
                    console.log("Pracuji na " + colorScheme + " a NENASEL jsem tyden oznaceni" + " pro typ " + typeof markedDate + " ktery je " + markedDate);
                }
            }
    } else {}
};

    // adding Map-marker to actual  week in life
    ShowUser.prototype.youAreHere = function youAreHere () {
        var weekId = "#" + this.navstevnik.returnWeekDifference();
        this.addNonStandardDate(this.navstevnik.returnWeekDifference(),'youAreHere');
        $(weekId).append("<div class='map-marker-yah'><i class='fa fa-map-marker fa-5x' style='color: #fe576b'></i></div>");
    };

    // colors last week in life
    ShowUser.prototype.lastDay = function lastDay () {
        var lastdayWeek = this.navstevnik.returnWeekDifference(birthDayGlobalVar,this.navstevnik.deathYear());
        // asking jQuery for lastchild would be more mature approach
        this.addNonStandardDate(lastdayWeek - 1 ,'lastDay');
    };

    // Colours fixed week color without addColour fn.  If 1. vaccination exist in 7th week, this adds colour to 7th week.
    ShowUser.prototype.addNonStandardDate = function addNonStandardDate (week, color) {
        var dateAsText = this.makeDateFromWeekNumber(week);
        var weekId = "#" + week;
        $(weekId).toggleClass(color);
        if (this.navstevnik.returnWeekDifference() < week) {
            this.generateDesc(weekId, dateAsText, textDescGlobal[color].title, textDescGlobal[color].text, textDescGlobal[color].fa); // texts for the future
        } else {
            this.generateDesc(weekId, dateAsText, textDescGlobal[color].title, textDescGlobal[color].textPast, textDescGlobal[color].fa); // texts for the past
        }
        this.doNotMarkId.push(weekId);
    };

    // adds pop-up description and font-awesome icon with powertip.js library. divId must be string with # at the beginning.
    ShowUser.prototype.generateDesc = function generateDesc (divId, dateAsText, title, text, fontAwesome){
        if ($(divId).prop('title')) {
            console.log("description existuje na divId " + divId + ', vynechávám id');
        } else {
              $(divId).data('powertipjq', $([
                '<div>',
                '<p><b>' + dateAsText + ' - ' + title + '</b></p>',
                '<p><i class="' + fontAwesome + ' fa-2x"></i> ' + text + '</p>',
                '</div>'
              ].join('\n')));
            $(divId).powerTip({
                smartPlacement: true
            });
        }
    };

    // shows additional boxes with motivational text for user younger than people in the texts
    ShowUser.prototype.showFunFacts = function showFunFacts() {
        var funFactsLength = funFacts.length;
        var addedText = '';
        var addedTitle = '';
        for (var i = 0; i < funFactsLength; i++) {
            if (funFacts[i].age > this.navstevnik.age()) {
                var markedDate = this.navstevnik.returnWeekDifference(funFacts[i].age);
                var dateAsText = this.makeDateFromWeekNumber(markedDate);
                var markedWeek = "#" + markedDate;
                var randomRGBcolor = "#" + Math.floor(Math.random()*16777215).toString(16);
                    $(markedWeek).toggleClass('funFacts').css('background', randomRGBcolor);
                    addedText = funFacts[i].text;
                    addedTitle = funFacts[i].age + ' let. ' + 'Dejte to jako: ' + funFacts[i].name + '.';
                    this.generateDesc(markedWeek, dateAsText, addedTitle, addedText, this.randomFAicon());
                    this.doNotMarkId.push(markedWeek);
            } else {}
            }

        };

    // returns string with month and year from week number (id). Serves for adding right dates to generateDesc
    ShowUser.prototype.makeDateFromWeekNumber = function makeDateFromWeekNumber(weekId) {
        return this.navstevnik.birthDateToDate().add(weekId, 'w').format('MMMM YYYY');
    };

    // returns random icon number from FA icon choosen at funfactsdata.js
    ShowUser.prototype.randomFAicon = function randomFAIcon(){
    var randomIco = Math.floor(Math.random()*(funFactsFontAwesomeIcons.length));
        return funFactsFontAwesomeIcons[randomIco];
    };

    // change months names in Moment.js
    moment.locale('en', {
    months : [
        "Leden", "Únor", "Březen", "Duben", "Květen", "Červen", "Červenec",
        "Srpen", "Září", "Říjen", "Listopad", "Prosinec"
    ]
});

$("form").submit(function formClick(event) {
  event.preventDefault();
  $( ".ctverce" ).empty();
  $("#text-nad-boxy").empty();
  var formInputJmeno = $("#datum_narozeni").val();
  var formInputPohlavi = $("#pohlavi").val();
  var navstevnik = new User(formInputJmeno,formInputPohlavi);
  var vykresleni = new ShowUser(navstevnik);
  birthDayGlobalVar = navstevnik.birthDateToDate();
  sexGlobalVar = navstevnik.sex();
  vykresleni.generateBoxes();
  vykresleni.youAreHere();
  vykresleni.lastDay();
  vykresleni.addNonStandardDate(9, "vaccination");
  vykresleni.showFunFacts();
  vykresleni.addColor("militaryService");
  vykresleni.addColor("retirement");
  vykresleni.addColor("firstMarriageAge");
  vykresleni.addColor("firstChildAge");
  vykresleni.addColor("primarySchool");
  vykresleni.addColor("secondarySchool");
  vykresleni.addColor("university");
  $('#text-nad-boxy').append("<p class='lead'>Kostičky přestavují jednotlivé týdny vašeho života vypočtené z předpokládané doby dožití. <br>Najdeďte na ně myší a dozvíte se, co která znamená.</p>");

});