let EditorTeksta = function (divRef) {
    // Validacija div elementa
    if (!divRef || divRef.tagName !== 'DIV') {
        throw new Error("Pogresan tip elementa!");
    }

    if (divRef.getAttribute('contenteditable') !== 'true') {
        throw new Error("Neispravan DIV, ne posjeduje contenteditable atribut!");
    }

    // Privatni atributi
    let editorDiv = divRef;

    // Pomoćne privatne funkcije

    /**
     * Uzima čist tekst iz elementa, bez HTML oznaka
     */
    let dajCistiTekst = function(element) {
        return element.textContent || element.innerText || '';
    };

    /**
     * Parsira tekstualni sadržaj editora u linije
     */
    let dajLinije = function() {
        let tekst = editorDiv.innerHTML;
        let tempDiv = document.createElement('div');
        tempDiv.innerHTML = tekst;

        let linije = [];
        let paragrafi = tempDiv.querySelectorAll('p');

        paragrafi.forEach(p => {
            linije.push({
                element: p,
                tekst: dajCistiTekst(p).trim()
            });
        });

        return linije;
    };

    /**
     * Prebrojava riječi u tekstu
     */
    let prebrojiRijeci = function(tekst) {
        if (!tekst || tekst.trim() === '') return 0;

        // Znakovi interpunkcije (samo zarez i tačka prema postavci)
        tekst = tekst.replace(/[,.]/g, ' ');

        // Razdvoji na riječi
        let rijeci = tekst.trim().split(/\s+/);

        // Filtriraj brojeve i prazne stringove
        rijeci = rijeci.filter(rijec => {
            return rijec.length > 0 && !/^\d+$/.test(rijec);
        });

        return rijeci.length;
    };

    /**
     * Provjerava da li je linija naslov scene
     */
    let jeLiNaslovScene = function(tekst) {
        tekst = tekst.trim();

        // Mora biti velikim slovima
        if (tekst !== tekst.toUpperCase()) return false;

        // Mora početi sa INT. ili EXT.
        if (!tekst.startsWith('INT.') && !tekst.startsWith('EXT.')) return false;

        // Mora sadržavati jednu od ključnih riječi nakon crtice
        let kljucneRijeci = ['DAY', 'NIGHT', 'AFTERNOON', 'MORNING', 'EVENING'];
        let imaKljucnuRijec = kljucneRijeci.some(rijec =>
            tekst.includes('- ' + rijec)
        );

        return imaKljucnuRijec;
    };

    /**
     * Provjerava da li je linija ime uloge
     */
    let jeLiImeUloge = function(tekst, sljedecaTekst) {
        tekst = tekst.trim();

        // Mora biti velikim slovima
        if (tekst !== tekst.toUpperCase()) return false;

        // Ne smije biti naslov scene
        if (jeLiNaslovScene(tekst)) return false;

        // Ne smije biti prazan
        if (tekst === '') return false;

        // Ne smije sadržavati brojeve ili znakove interpunkcije
        if (/[0-9,.]/.test(tekst)) return false;

        // Mora sadržavati barem jedno slovo
        if (!/[A-Z]/.test(tekst)) return false;

        // Sljedeća linija mora postojati i biti običan govor
        if (!sljedecaTekst || sljedecaTekst.trim() === '') return false;
        if (sljedecaTekst.trim() === sljedecaTekst.trim().toUpperCase()) return false;

        return true;
    };

    /**
     * Provjerava da li je linija u potpunosti u zagradama
     */
    let jeLiLinijaUZagradama = function(tekst) {
        tekst = tekst.trim();
        return tekst.startsWith('(') && tekst.endsWith(')');
    };

    /**
     * Izračunava Levenshtein distancu između dva stringa
     */
    let levenshteinDistanca = function(str1, str2) {
        const len1 = str1.length;
        const len2 = str2.length;
        const matrix = [];

        for (let i = 0; i <= len1; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= len2; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= len1; i++) {
            for (let j = 1; j <= len2; j++) {
                if (str1.charAt(i - 1) === str2.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[len1][len2];
    };

    // Javne metode

    /**
     * Vraća broj riječi (ukupno, boldiranih, italic)
     */
    let dajBrojRijeci = function () {
        let ukupno = 0;
        let boldiranih = 0;
        let italic = 0;

        /**
         * Rekurzivno prolazi kroz DOM i broji riječi
         */
        let obradiElement = function(element) {
            for (let child of element.childNodes) {
                if (child.nodeType === Node.TEXT_NODE) {
                    // Text node - izdvoji riječi
                    let tekst = child.textContent || '';
                    let rijeci = tekst.trim().split(/\s+/);

                    // Filtriraj riječi (bez brojeva, bez praznih)
                    rijeci = rijeci.filter(rijec => {
                        rijec = rijec.replace(/[,.]/g, '');
                        return rijec.length > 0 && !/^\d+$/.test(rijec);
                    });

                    let brojRijeci = rijeci.length;

                    if (brojRijeci === 0) continue;

                    ukupno += brojRijeci;

                    // Provjeri da li je parent element bold ili italic
                    let parent = child.parentElement;

                    // Da li je cijeli text node u bold tagu?
                    if (parent && (parent.tagName === 'B' || parent.tagName === 'STRONG')) {
                        // Provjeri da li je cijeli sadržaj parent elementa samo ovaj text node
                        // (ne smije biti mješavina formatiranog i neformatiranog teksta)
                        let roditeljTekst = parent.textContent || '';
                        let ovajTekst = tekst.trim();

                        // Ako je parent element sadrži samo ovaj tekst, onda su sve riječi boldirane
                        if (roditeljTekst.trim() === ovajTekst) {
                            boldiranih += brojRijeci;
                        }
                    }

                    // Da li je cijeli text node u italic tagu?
                    if (parent && (parent.tagName === 'I' || parent.tagName === 'EM')) {
                        let roditeljTekst = parent.textContent || '';
                        let ovajTekst = tekst.trim();

                        if (roditeljTekst.trim() === ovajTekst) {
                            italic += brojRijeci;
                        }
                    }
                } else if (child.nodeType === Node.ELEMENT_NODE) {
                    // Element node - rekurzivno obradi
                    obradiElement(child);
                }
            }
        };

        obradiElement(editorDiv);

        return { ukupno: ukupno, boldiranih: boldiranih, italic: italic };
    };

    /**
     * Vraća jedinstvene uloge
     */
    let dajUloge = function () {
        let linije = dajLinije();
        let uloge = [];

        for (let i = 0; i < linije.length; i++) {
            let trenutnaTekst = linije[i].tekst;
            let sljedecaTekst = (i + 1 < linije.length) ? linije[i + 1].tekst : '';

            // Provjeri da li je ovo ime uloge
            if (jeLiImeUloge(trenutnaTekst, sljedecaTekst)) {
                // Dodaj ulogu ako već nije u nizu
                if (!uloge.includes(trenutnaTekst)) {
                    uloge.push(trenutnaTekst);
                }
            }
        }

        return uloge;
    };

    /**
     * Detektuje potencijalno pogrešno napisane uloge
     */
    let pogresnaUloga = function () {
        let linije = dajLinije();
        let mapa = {}; // Mapa: ime uloge -> broj pojavljivanja

        // Prebroji sve uloge
        for (let i = 0; i < linije.length; i++) {
            let trenutnaTekst = linije[i].tekst;
            let sljedecaTekst = (i + 1 < linije.length) ? linije[i + 1].tekst : '';

            if (jeLiImeUloge(trenutnaTekst, sljedecaTekst)) {
                if (!mapa[trenutnaTekst]) {
                    mapa[trenutnaTekst] = 0;
                }
                mapa[trenutnaTekst]++;
            }
        }

        let imena = Object.keys(mapa);
        let pogresne = [];

        // Uporedi sve parove uloga
        for (let i = 0; i < imena.length; i++) {
            let imeA = imena[i];
            let brojA = mapa[imeA];

            for (let j = 0; j < imena.length; j++) {
                if (i === j) continue;

                let imeB = imena[j];
                let brojB = mapa[imeB];

                // Provjeri da li su slična imena
                let distanca = levenshteinDistanca(imeA, imeB);
                let maxDozvoljenaDistanca = (imeA.length > 5 && imeB.length > 5) ? 2 : 1;

                if (distanca <= maxDozvoljenaDistanca) {
                    // Provjeri da li se imeB pojavljuje znatno češće
                    if (brojB >= 4 && (brojB - brojA) >= 3) {
                        // imeA je potencijalno pogrešno
                        if (!pogresne.includes(imeA)) {
                            pogresne.push(imeA);
                        }
                    }
                }
            }
        }

        return pogresne;
    };

    /**
     * Vraća broj linija teksta za ulogu
     */
    let brojLinijaTeksta = function (uloga) {
        uloga = uloga.toUpperCase(); // Normalizuj na velika slova
        let linije = dajLinije();
        let ukupnoLinija = 0;

        for (let i = 0; i < linije.length; i++) {
            let trenutnaTekst = linije[i].tekst;
            let sljedecaTekst = (i + 1 < linije.length) ? linije[i + 1].tekst : '';

            // Provjeri da li je ovo tražena uloga
            if (jeLiImeUloge(trenutnaTekst, sljedecaTekst) && trenutnaTekst === uloga) {
                // Prebroji linije govora nakon imena uloge
                let j = i + 1;
                while (j < linije.length) {
                    let linijaTekst = linije[j].tekst;

                    // Prazna linija prekida blok
                    if (linijaTekst === '') break;

                    // Nova uloga prekida blok
                    let sljedecaNakonJ = (j + 1 < linije.length) ? linije[j + 1].tekst : '';
                    if (jeLiImeUloge(linijaTekst, sljedecaNakonJ)) break;

                    // Naslov scene prekida blok
                    if (jeLiNaslovScene(linijaTekst)) break;

                    // Linija u zagradama se ne broji
                    if (!jeLiLinijaUZagradama(linijaTekst)) {
                        ukupnoLinija++;
                    }

                    j++;
                }
            }
        }

        return ukupnoLinija;
    };

    /**
     * Vraća scenarij uloge sa kontekstom
     */
    let scenarijUloge = function (uloga) {
        uloga = uloga.toUpperCase();
        let linije = dajLinije();
        let rezultat = [];

        let trenutnaScena = '';
        let sveReplike = [];
        let sceneMapping = [];
        let segmentGranice = new Set();

        // Prvo prolazimo kroz sve linije i identifikujemo replike i granice
        for (let i = 0; i < linije.length; i++) {
            let tekst = linije[i].tekst;
            let sljedecaTekst = (i + 1 < linije.length) ? linije[i + 1].tekst : '';

            // Ako je naslov scene
            if (jeLiNaslovScene(tekst)) {
                trenutnaScena = tekst;
                // Naslov scene prekida dijalog-segment
                if (sveReplike.length > 0) {
                    segmentGranice.add(sveReplike.length);
                }
                continue;
            }

            // Ako je ime uloge
            if (jeLiImeUloge(tekst, sljedecaTekst)) {
                let imeUloge = tekst;
                let linijeGovora = [];

                // Sakupi sve linije govora
                let j = i + 1;
                while (j < linije.length) {
                    let linijaTekst = linije[j].tekst;

                    if (linijaTekst === '') break;

                    let sljedecaNakonJ = (j + 1 < linije.length) ? linije[j + 1].tekst : '';
                    if (jeLiImeUloge(linijaTekst, sljedecaNakonJ)) break;
                    if (jeLiNaslovScene(linijaTekst)) break;

                    linijeGovora.push(linijaTekst);
                    j++;
                }

                sveReplike.push({
                    uloga: imeUloge,
                    linije: linijeGovora.join('\n')
                });
                sceneMapping.push(trenutnaScena);
                i = j - 1;

                // Provjeri da li slijedi akcijski segment ili nova scena
                let nextIdx = j;
                while (nextIdx < linije.length && linije[nextIdx].tekst === '') {
                    nextIdx++;
                }

                if (nextIdx < linije.length) {
                    let sljedeciTekst = linije[nextIdx].tekst;
                    let sljedeciSljedeci = (nextIdx + 1 < linije.length) ? linije[nextIdx + 1].tekst : '';

                    // Akcijski segment ili naslov scene prekidaju dijalog-segment
                    if (!jeLiImeUloge(sljedeciTekst, sljedeciSljedeci) && sljedeciTekst !== '') {
                        segmentGranice.add(sveReplike.length);
                    }
                }
            }
        }

        // Sada pronadji sve pojave tražene uloge
        for (let idx = 0; idx < sveReplike.length; idx++) {
            if (sveReplike[idx].uloga === uloga) {
                let scena = sceneMapping[idx];

                // Izračunaj poziciju u sceni
                let pozicijaUSceni = 1;
                for (let k = 0; k < idx; k++) {
                    if (sceneMapping[k] === scena) {
                        pozicijaUSceni++;
                    }
                }

                // Nađi prethodni i sljedeći u istom dijalog-segmentu
                let prethodni = null;
                let sljedeci = null;

                // Provjeri da li postoji prethodni u istom segmentu i sceni
                if (!segmentGranice.has(idx) && idx > 0 && sceneMapping[idx - 1] === scena) {
                    prethodni = sveReplike[idx - 1];
                }

                // Provjeri da li postoji sljedeći u istom segmentu i sceni
                if (!segmentGranice.has(idx + 1) && idx < sveReplike.length - 1 && sceneMapping[idx + 1] === scena) {
                    sljedeci = sveReplike[idx + 1];
                }

                rezultat.push({
                    scena: scena,
                    pozicijaUTekstu: pozicijaUSceni,
                    prethodni: prethodni,
                    trenutni: sveReplike[idx],
                    sljedeci: sljedeci
                });
            }
        }

        return rezultat;
    };

    /**
     * Grupira uloge po dijalog-segmentima
     */
    let grupisiUloge = function () {
        // Implementacija u sljedećem koraku
        return [];
    };

    /**
     * Formatira selektovani tekst
     */
    let formatirajTekst = function (komanda) {
        // Implementacija u sljedećem koraku
        return false;
    };

    // Vraćamo javne metode
    return {
        dajBrojRijeci: dajBrojRijeci,
        dajUloge: dajUloge,
        pogresnaUloga: pogresnaUloga,
        brojLinijaTeksta: brojLinijaTeksta,
        scenarijUloge: scenarijUloge,
        grupisiUloge: grupisiUloge,
        formatirajTekst: formatirajTekst
    };
};
