var User = function User (formInput,pohlaviUzivatele) {
    this.pohlavi = pohlaviUzivatele;
    this.formInput = formInput;
};

    User.prototype.sex = function sex () {
        if (this.pohlavi == 'muz') {
            return 'manData';
        } else if (this.pohlavi == 'zena') {
            return 'womanData';
        } else {
            console.log('nekdo mi tu ve formulari podstrkuje jiny pohlavi, nez jsem zvyklej');
            return 'manData';
        }
    };

    User.prototype.datumNarozeniToDate = function datumNarozeniToDate(){
        var formDate = moment(this.formInput, ["DD-MM-YYYY", "D-M-YYYY", "YYYY-MM-DD", "YYYY-M-DD", "YYYY-MM-D"]);
        if (formDate.isValid()) {
            return formDate;
        } else {
            sweetAlert('Ajta krajta!','Zadali jste datum narození dobře? Zkuste to znovu, třeba ve formátu 21.8.1968', 'error');
            document.getElementById('data_form').reset();
            console.log("chyba v zadani formatu data");
        }
    };

    User.prototype.rokNarozeni = function rokNarozeni() {
        return birthDayGlobalVar.year();
    };

    User.prototype.rokUmrti = function rokUmrti(){
        var rok = this.rokNarozeni();
        var lifeXpe = '';
        if (!window[sexGlobalVar][rok]) {
            sweetAlert('Pa-da-dam-pam','Pro zadané datum narození nemám údaje :(', 'error');
            } else {
            lifeXpe = window[sexGlobalVar][rok].lifeExpectancy;
        }
        return moment(birthDayGlobalVar).add(lifeXpe, 'y').year();
    };

    //Jednoducha metoda pocitani veku, nepresnost max. 3 mesice (delim 52 tydny v roce). Vraci kladna cisla v letech  zaokrouhlena nahoru
    User.prototype.age = function age(){
        return Math.ceil(this.vratRozdilTydnu()/52);
    };

    // Funkce vraci rozdil poctu tydnu mezi zadanymi roky. Cisla by do funkce mela byt vkladana jako roky nebo jine datum.
    User.prototype.vratRozdilTydnu = function vratRozdilTydnu(pocetRoku){
        var firstDate = "";
        var secondDate = birthDayGlobalVar;
        // podminka resi rozdil mezi rokem narozeni a poctem roku v argumentu v tydnech (1990 + 75.5)
        if ( arguments.length === 1 ) {
           firstDate = moment(birthDayGlobalVar).add(pocetRoku, 'y');
        }
        // podminka resi rozdil mezi rokem narozeni a soucasnosti (pocet tydnu od narozeni az po nyni)
        else if (arguments.length === 0){
            firstDate = moment();
        }
        // podminka resi rozdil mezi dvema zadanymi roky. Jako druhy parametr ocekava rok konce jako number.
        else if (arguments.length === 2) {
            firstDate = moment(arguments[0]);
            secondDate = moment(arguments[1], 'YYYY');
        }
        else {
            //tady bude chyba
        }

        return Math.abs(firstDate.diff(secondDate, 'weeks'));
    };

var ZobrazUsera = function ZobrazUsera(instanceUsera) {
    this.navstevnik = instanceUsera;
    this.doNotMarkId = [];
  };

    ZobrazUsera.prototype.generujZaklad = function generujZaklad () {
    var html = "";
        // alert, ze zadana data nema v databazi

    var pocetTydnu = this.navstevnik.vratRozdilTydnu(birthDayGlobalVar,this.navstevnik.rokUmrti());
        for (var i = 0; i < pocetTydnu; i++) {
        html += "<div class=\'box\' id=\'" + i + "\'></div>";
        }
    $('.ctverce').append(html);
    };

    ZobrazUsera.prototype.doplnBarvu = function doplnBarvu (barevneSchema) {
    var rokNarozeni = this.navstevnik.rokNarozeni();
    var actualProperty = window[sexGlobalVar][rokNarozeni][barevneSchema];
    var markedDate = '';
    var dateAsText = '';
        // test jestli pro pohlavi existuje statisticky zaznam (odchod na vojnu pro zeny atp.)
        if (typeof actualProperty != 'undefined') {
            // test zda ma zaznam zacatek a konec
            if (actualProperty.hasOwnProperty("begining") && actualProperty.hasOwnProperty("duration")) {
                var tydenPocatku = this.navstevnik.vratRozdilTydnu(actualProperty.begining);
                var tydenKonce = this.navstevnik.vratRozdilTydnu(actualProperty.duration + actualProperty.begining);
                for (var i = tydenPocatku; i <= tydenKonce; i++) {
                    markedDate = "#" + i;
                    dateAsText = this.makeDateFromWeekNumber(i);
                    //vynecha oznaceni descriptionem, pokud uz ji oznacil showFunFacts (kolize s Powertip)
                    if (this.doNotMarkId.indexOf(markedDate) == -1 ) {
                        this.generateDesc(markedDate, dateAsText, textDescGlobal[barevneSchema].title, textDescGlobal[barevneSchema].text, textDescGlobal[barevneSchema].fa);
                    } else {}
                        //oznaci spravnou tridou
                        $(markedDate).toggleClass(barevneSchema);
                        this.doNotMarkId.push(markedDate);
                    }
    }
    // pokud barevneSchema ma jen jednu promennou
             else {
                markedDate = this.navstevnik.vratRozdilTydnu(actualProperty);
                if (markedDate != "undefined" && typeof markedDate === "number" && markedDate != 0) {
                    var tydenOznaceni = "#" + markedDate;
                    dateAsText = this.makeDateFromWeekNumber(markedDate);
                    $(tydenOznaceni).toggleClass(barevneSchema);
                    //vynecha oznaceni descriptionem, pokud uz ji oznacil showFunFacts (kolize s Powertip)
                        if (this.doNotMarkId.indexOf(tydenOznaceni) == -1 ) {
                            this.generateDesc(tydenOznaceni, dateAsText, textDescGlobal[barevneSchema].title, textDescGlobal[barevneSchema].text, textDescGlobal[barevneSchema].fa);
                         } else {
                        console.log('V prubehu oznacovani popiskem jsem narazil na id, ktere uz je oznacene: ' + this.doNotMarkId.indexOf(tydenOznaceni));
                        }
                        this.doNotMarkId.push(tydenOznaceni);

                        }
                else if (markedDate === 0) {
                    console.log("Pracuji na " + barevneSchema + " a pro tento vek nemam data.");
                }
                else {
                    console.log("Pracuji na " + barevneSchema + " a NENASEL jsem tyden oznaceni" + " pro typ " + typeof markedDate + " ktery je " + markedDate);
                }
            }
    } else {}
};

    ZobrazUsera.prototype.youAreHere = function youAreHere () {
        var markedDate = this.navstevnik.vratRozdilTydnu();
        var dateAsText = this.makeDateFromWeekNumber(markedDate);
        var weekId = "#" + markedDate;
        $(weekId).toggleClass('YouAreHere');
        this.generateDesc(weekId, dateAsText, textDescGlobal['youAreHere'].title, textDescGlobal['youAreHere'].text, textDescGlobal['youAreHere'].fa);
        $(weekId).append("<div class='map-marker-yah'><i class='fa fa-map-marker fa-5x' style='color: #fe576b'></i></div>");
        this.doNotMarkId.push(weekId);
    };

    // jako divId musi byt vlozeny string (cislo id) s #
    ZobrazUsera.prototype.generateDesc = function generateDesc (divId, dateAsText, title, text, fontAwesome){
        //var descriptionWeek = '';
        if ($(divId).prop('title')) {
            console.log("description existuje na divId " + divId + ', vynechávám id');
        } else {
              $(divId).data('powertipjq', $([
                '<div>',
                '<p><b>' + title + ' - ' +  dateAsText + '</b></p>',
                '<p><i class="' + fontAwesome + ' fa-2x"></i> ' + text + '</p>',
                '</div>'
              ].join('\n')));
            $(divId).powerTip({
                smartPlacement: true
            });
        }
    };

    // metoda zobrazujici uspechy dosazene lidmi starsimi nez uzivatel. Oznaci divy id + prislusnou tridou
    ZobrazUsera.prototype.showFunFacts = function showFunFacts() {
        var funFactsLength = funFacts.length;
        var addedText = '';
        var addedTitle = '';
        for (var i = 0; i < funFactsLength; i++) {
            if (funFacts[i].age > this.navstevnik.age()) {
                var markedDate = this.navstevnik.vratRozdilTydnu(funFacts[i].age);
                var dateAsText = this.makeDateFromWeekNumber(markedDate);
                var tydenOznaceni = "#" + markedDate;
                var randomRGBcolor = "#" + Math.floor(Math.random()*16777215).toString(16);
                    $(tydenOznaceni).toggleClass('funFacts').css('background', randomRGBcolor);
                    addedText = funFacts[i].text;
                    addedTitle = funFacts[i].name + ', ' + funFacts[i].age + ' let';
                    this.generateDesc(tydenOznaceni, dateAsText, addedTitle, addedText, this.randomFAicon());
                    // pridano kvuli konfliktu v powertip, kdy nejde oznacit stejny div 2x
                    this.doNotMarkId.push(tydenOznaceni);
            } else {}
            }

        };

    ZobrazUsera.prototype.makeDateFromWeekNumber = function makeDateFromWeekNumber(weekId) {
        return this.navstevnik.datumNarozeniToDate().add(weekId, 'w').format('MMMM YYYY');
    };

    ZobrazUsera.prototype.randomFAicon = function randomFAIcon(){
    var randomIco = Math.floor(Math.random()*(funFactsFontAwesomeIcons.length));
        return funFactsFontAwesomeIcons[randomIco];
    };
    // změna názvu měsíců v Moment.js
    moment.locale('en', {
    months : [
        "Leden", "Únor", "Březen", "Duben", "Květen", "Červen", "Červenec",
        "Srpen", "Září", "Říjen", "Listopad", "Prosinec"
    ]
});

$("form").submit(function formClick(event) {
  event.preventDefault();
  $( ".ctverce" ).empty();
  var formInputJmeno = $("#datum_narozeni").val();
  var formInputPohlavi = $("#pohlavi").val();
  var navstevnik = new User(formInputJmeno,formInputPohlavi);
  var vykresleni = new ZobrazUsera(navstevnik);
  birthDayGlobalVar = navstevnik.datumNarozeniToDate();
  sexGlobalVar = navstevnik.sex();
  vykresleni.generujZaklad();
  vykresleni.youAreHere();
  vykresleni.showFunFacts();
  vykresleni.doplnBarvu("militaryService");

  vykresleni.doplnBarvu("retirement");
  vykresleni.doplnBarvu("firstMarriageAge");
  vykresleni.doplnBarvu("firstChildAge");
  vykresleni.doplnBarvu("primarySchool");
  vykresleni.doplnBarvu("secondarySchool");
  vykresleni.doplnBarvu("university");


});